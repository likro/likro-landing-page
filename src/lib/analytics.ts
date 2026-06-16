/**
 * TRACK-01: ÚNICO ponto de fan-out para Meta Pixel, GA4 e Microsoft Clarity.
 * TRACK-02: event_id UUID v4 attached to every event for future Meta CAPI dedup.
 *
 * Componentes JAMAIS chamam window.fbq, window.gtag, window.clarity diretamente.
 * Risco crítico #6 (PITFALLS.md): tracking double-fire / PII vazando.
 * Single fan-out + event_id desde dia 1 = retrofit CAPI zero-cost.
 */

export type AnalyticsEvent =
  | "whatsapp_click"
  | "whatsapp_cta_error"
  | "cta_click"
  | "form_focus"
  | "form_submit_attempt"
  | "form_submit_success"
  | "form_submit_error"
  | "section_view"
  | "scroll_depth";

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      event: string,
      payload?: Payload,
      options?: { eventID?: string },
    ) => void;
    gtag?: (action: "event", event: string, payload?: Payload) => void;
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

// Map de eventos internos → standard Meta Pixel event names.
// Eventos não mapeados caem em trackCustom (Meta aceita custom events).
const META_EVENT_MAP: Partial<Record<AnalyticsEvent, string>> = {
  whatsapp_click: "Contact",
  form_submit_success: "Lead",
};

/**
 * TRACK-02: Gera UUID v4 cryptographically secure.
 * Funciona em browsers modernos, Node 14.17+, Edge runtime.
 * Fallback ultra-defensivo cobre runtimes pré-2021 (raro mas zero-cost).
 */
function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback non-cryptographic — só usado em runtimes muito velhos.
  // Suficiente pra dedup de analytics (não é segredo, não é PII).
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return; // SSR no-op

  const event_id = generateEventId();
  const enriched = { ...payload, event_id };

  // GA4 — via window.gtag (instalado por @next/third-parties' <GoogleAnalytics>)
  window.gtag?.("event", event, enriched);

  // Meta Pixel — usa standard event quando aplicável; eventID para dedup CAPI futuro.
  const metaEvent = META_EVENT_MAP[event];
  if (metaEvent) {
    window.fbq?.("track", metaEvent, payload, { eventID: event_id });
  } else {
    window.fbq?.("trackCustom", event, payload, { eventID: event_id });
  }

  // Microsoft Clarity — custom event + tag de sessão com event_id pra correlação.
  window.clarity?.("event", event);
  window.clarity?.("set", "last_event_id", event_id);

  // Dev observability — silencioso em produção.
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", event, enriched);
  }
}
