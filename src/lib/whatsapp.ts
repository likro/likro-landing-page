/**
 * CTA-01: ÚNICO ponto de construção de URL WhatsApp na codebase.
 * CTA-02: Guards defensivos contra hosts desktop-only.
 *
 * Risco crítico #5 (PITFALLS.md): WhatsApp deeplink que abre browser
 * em vez do app. Solução: forçar formato wa.me/<phone>?text=... e
 * bloquear web.whatsapp.com / api.whatsapp.com em qualquer input.
 */

import { env } from "@/lib/env";

const FORBIDDEN_HOSTS = ["web.whatsapp.com", "api.whatsapp.com"];

/**
 * RFC 3986-compliant encoder: encodeURIComponent leaves `!*'()` unescaped (RFC 2396 legacy),
 * but WhatsApp deeplinks behave mais consistentemente quando esses chars são encoded.
 * Encodamos manualmente para garantir que `!` vira `%21`, `(` vira `%28`, etc.
 */
function encodeMessage(message: string): string {
  return encodeURIComponent(message).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** CTA-04: location é a chave do mapa em src/content/whatsapp.ts */
export type WhatsAppLocation =
  | "hero"
  | "pain"
  | "product"
  | "how"
  | "proof"
  | "footer"
  | "floating";

/**
 * Constrói URL canônica wa.me/<phone>?text=<encoded>.
 *
 * @example
 *   buildWhatsAppUrl("Oi! Vi a Likro no Instagram", "hero")
 *   → "https://wa.me/5511999999999?text=Oi%21%20Vi%20a%20Likro%20no%20Instagram"
 *
 * @throws Error se message contém web.whatsapp.com ou api.whatsapp.com
 * @throws Error se NEXT_PUBLIC_WA_NUMBER inválido (precisa ser 12 ou 13 dígitos puros)
 */
export function buildWhatsAppUrl(message: string, location: WhatsAppLocation): string {
  // CTA-02 guard: bloqueia hosts proibidos em qualquer parte do input
  for (const host of FORBIDDEN_HOSTS) {
    if (message.includes(host)) {
      throw new Error(
        `[buildWhatsAppUrl] Forbidden host "${host}" found in message. ` +
          `Use wa.me/<phone>?text=... format only. Caller location: ${location}`,
      );
    }
  }

  const phone = env.NEXT_PUBLIC_WA_NUMBER;

  if (!phone) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[buildWhatsAppUrl] NEXT_PUBLIC_WA_NUMBER missing — using placeholder 0000000000",
      );
      return `https://wa.me/0000000000?text=${encodeMessage(message)}`;
    }
    throw new Error("[buildWhatsAppUrl] NEXT_PUBLIC_WA_NUMBER missing in production");
  }

  // Validação: phone deve ser 12-13 dígitos puros, sem +, espaços, ou hífens
  // DDDs 11-19, 21, 22, 24, 27, 28: 13 dígitos (5511 + 9XXXXXXXX)
  // Outros DDDs: 12 dígitos (5512 + XXXXXXXX)
  if (!/^\d{12,13}$/.test(phone)) {
    throw new Error(
      `[buildWhatsAppUrl] Invalid phone format: "${phone}". ` +
        `Expected 12-13 digits (55 + DDD + number, no spaces/+/dashes). ` +
        `Caller location: ${location}`,
    );
  }

  return `https://wa.me/${phone}?text=${encodeMessage(message)}`;
}
