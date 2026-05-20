"use client";

/**
 * FloatingWhatsApp — botão flutuante mobile-only (Phase 5).
 *
 * Comportamento (CTA-06, MOBILE-02):
 *  - Mobile only (md:hidden no container).
 *  - Aparece após scroll > 50vh.
 *  - Esconde quando o form está em viewport (useFormInView do Plan 04).
 *  - Pitfall 9: esconde também quando QUALQUER input do form está focado
 *    (teclado virtual sobe e cobriria o botão).
 *  - Discreto: fade simples 200ms, sem pulse/bounce/badge/scale.
 *
 * Posicionamento + safe-area: vem do variant="floating" do <WhatsAppCta>
 * (fixed bottom-4 right-4 + [padding-bottom:env(safe-area-inset-bottom)]).
 * O wrapper raiz aqui só controla VISIBILITY (opacity + pointer-events)
 * e mobile-only (md:hidden).
 */
import { useEffect, useState } from "react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { useFormInView } from "@/hooks/use-form-in-view";

const SCROLL_THRESHOLD_RATIO = 0.5; // 50vh

export function FloatingWhatsApp() {
  const [pastThreshold, setPastThreshold] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const formInView = useFormInView();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const threshold = window.innerHeight * SCROLL_THRESHOLD_RATIO;
      setPastThreshold(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    // Pitfall 9: esconde o floating quando um campo do form está focado —
    // o teclado virtual subiria e o botão cobriria a digitação.
    const isFormField = (el: HTMLElement | null) =>
      !!el?.closest('[data-clarity-mask="true"]') &&
      (el.tagName === "INPUT" || el.tagName === "TEXTAREA");

    const onFocusIn = (e: FocusEvent) => {
      if (isFormField(e.target as HTMLElement | null)) setInputFocused(true);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (isFormField(e.target as HTMLElement | null)) setInputFocused(false);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const visible = pastThreshold && !formInView && !inputFocused;

  return (
    <div
      aria-hidden={visible ? "false" : "true"}
      className="md:hidden"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 200ms ease",
      }}
    >
      <WhatsAppCta
        variant="floating"
        location="floating"
        label="Conversar no WhatsApp"
      />
    </div>
  );
}
