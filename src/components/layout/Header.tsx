"use client";

/**
 * Header — institucional minimalista, slim.
 *
 * Phase 5 (MOBILE-06): hide-on-scroll-down, show-on-scroll-up.
 *  - Esconde após primeira viewport com delta scroll-down > 80px.
 *  - Reaparece com delta scroll-up < -8px.
 *  - prefers-reduced-motion desliga o hide (header sempre visível).
 *  - `sticky top-0` (não `fixed`) — sem spacer, sem layout shift (Pitfall 5).
 *  - data-hidden="true|false" exposto para tests + debugging.
 *
 * HERO-02: o Header é elemento above-the-fold e NÃO pode usar `motion.*` JSX
 * (risco crítico #2 — LCP). O hide-on-scroll é feito com `<header>` plano +
 * ref + mutação direta de `style.transform`/`data-hidden` dentro do callback
 * de scroll. Zero re-render, zero entrance animation, invariante preservado.
 * Os hooks `useScroll`/`useMotionValueEvent`/`useReducedMotion` não são JSX
 * `motion.*` — apenas leem o scroll, sem afetar o paint do LCP.
 *
 * Refinamento Phase 1: h-14 lg:h-16 (slim), logo discreto, CTA secundário ghost.
 */
import { useRef } from "react";
import Link from "next/link";
import { useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

const HIDE_THRESHOLD_DOWN = 80;
const SHOW_THRESHOLD_UP = 8;

export function Header() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const headerRef = useRef<HTMLElement>(null);
  const hiddenRef = useRef(false);

  const applyHidden = (next: boolean) => {
    if (hiddenRef.current === next) return;
    hiddenRef.current = next;
    const el = headerRef.current;
    if (!el) return;
    el.style.transform = next ? "translateY(-100%)" : "translateY(0%)";
    el.setAttribute("data-hidden", next ? "true" : "false");
  };

  useMotionValueEvent(scrollY, "change", (current: number) => {
    if (reduced) {
      applyHidden(false);
      return;
    }
    const previous = scrollY.getPrevious() ?? 0;
    const delta = current - previous;
    const innerHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    if (current > innerHeight && delta > HIDE_THRESHOLD_DOWN) {
      applyHidden(true);
    } else if (delta < -SHOW_THRESHOLD_UP) {
      applyHidden(false);
    }
  });

  return (
    <header
      ref={headerRef}
      data-hidden="false"
      className="sticky top-0 z-30 w-full bg-surface-light/85 backdrop-blur-md"
      style={{
        transform: "translateY(0%)",
        transition: reduced
          ? undefined
          : "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Container className="flex h-14 items-center justify-between lg:h-16">
        <Link
          href="/"
          aria-label="Likro - página inicial"
          className="group inline-flex items-center gap-2 text-text-primary"
        >
          {/* Logo placeholder em texto — substituir por SVG quando asset final chegar */}
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-[7px] bg-gradient-to-br from-violet-500 to-violet-700 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_4px_12px_-2px_rgba(124,58,237,0.5)]"
          >
            L
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] lg:text-base">
            Likro
          </span>
        </Link>
        <WhatsAppCta variant="secondary" location="header">
          {HERO_COPY.ctaPrimary.label}
        </WhatsAppCta>
      </Container>
    </header>
  );
}
