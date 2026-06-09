"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl, type WhatsAppLocation } from "@/lib/whatsapp";
import { WHATSAPP_MESSAGES } from "@/content/whatsapp";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "floating" | "inline";
type Surface = "light" | "dark";

interface Props {
  variant?: Variant;
  location: WhatsAppLocation;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  /**
   * Contexto de fundo onde o CTA está renderizado.
   * Em "dark", troca tokens de roxo para accent-on-dark (purple-400) — necessário
   * para WCAG AA em surface-dark/darker (Pain section, Footer).
   * Default "light".
   */
  surface?: Surface;
}

/**
 * D-08, D-09, D-10, D-11 — WhatsApp CTA único.
 *
 * Único componente que toca buildWhatsAppUrl + track + WHATSAPP_MESSAGES.
 * Garante:
 *  - track('whatsapp_click', {location}) ANTES do open (D-10) → evita perda em unload
 *  - 250ms loading window com spinner Loader2 → percepção de feedback (D-10)
 *  - URL via helper canonical wa.me/<phone>?text=... (CTA-01)
 *  - target=_blank + noopener,noreferrer (segurança)
 *
 * Variants:
 *  - primary    → Button default (roxo accent)
 *  - secondary  → Button secondary (outline roxo)
 *  - floating   → fixed bottom-right + size-icon, com safe-area-inset
 *  - inline     → Button link (sem padding)
 */
export function WhatsAppCta({
  variant = "primary",
  location,
  label,
  className,
  children,
  surface = "light",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // D-10: track ANTES do open garante envio antes de unload
    track("whatsapp_click", { location });
    await new Promise((r) => setTimeout(r, 250));
    try {
      // WR-04: buildWhatsAppUrl pode lançar em produção se NEXT_PUBLIC_WA_NUMBER
      // estiver ausente. Sem try/catch, o erro não capturado em async handler
      // propaga para o Error Boundary mais próximo (inexistente) e desmonta o app.
      const url = buildWhatsAppUrl(WHATSAPP_MESSAGES[location], location);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      track("whatsapp_cta_error", { location, reason: String(err) });
      if (process.env.NODE_ENV !== "production") {
        console.error("[WhatsAppCta]", err);
      }
      // Em produção: falha silenciosa — botão reabilita no finally.
    } finally {
      setLoading(false);
    }
  };

  // Variant → Button variant + className extras.
  // surface="dark" troca secondary→secondary-on-dark e link→link-on-dark
  // (WCAG AA: accent-primary falha contra surface-dark/darker; nesses
  // contextos usamos accent-on-dark, que passa AA com folga).
  const variantProps =
    variant === "primary"
      ? { variant: "default" as const }
      : variant === "secondary"
        ? {
            variant:
              surface === "dark"
                ? ("secondary-on-dark" as const)
                : ("secondary" as const),
          }
        : variant === "floating"
          ? {
              variant: "default" as const,
              size: "icon" as const,
              className: cn(
                "fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg",
                "[padding-bottom:env(safe-area-inset-bottom)]",
              ),
            }
          : {
              variant:
                surface === "dark"
                  ? ("link-on-dark" as const)
                  : ("link" as const),
              // h-auto p-0 mantém o visual de link inline; max-md:min-h-[44px]
              // garante área tocável ≥44px no mobile (MOBILE-03) sem mexer no desktop.
              className: "h-auto p-0 max-md:min-h-[44px]",
            };

  return (
    <Button
      {...variantProps}
      onClick={handleClick}
      disabled={loading}
      data-testid="whatsapp-cta"
      data-location={location}
      className={cn(variantProps.className, className)}
      aria-label={label ?? "Falar no WhatsApp"}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <WhatsAppIcon className="size-4" />
      )}
      {variant !== "floating" && (children ?? label ?? "Falar no WhatsApp")}
    </Button>
  );
}
