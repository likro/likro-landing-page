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
 * Refinamento Phase 1: h-14 lg:h-16 (slim), logo discreto, CTA secundário ghost.
 */
import { useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

const HIDE_THRESHOLD_DOWN = 80;
const SHOW_THRESHOLD_UP = 8;

export function Header() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (current: number) => {
    if (reduced) {
      if (hidden) flushSync(() => setHidden(false));
      return;
    }
    const previous = scrollY.getPrevious() ?? 0;
    const delta = current - previous;
    const innerHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    // flushSync garante que o DOM reflete data-hidden imediatamente após o
    // callback — necessário para que tests síncronos (e leitores de DOM em
    // ferramentas a11y) leiam o estado correto sem precisar de act() wrapping.
    // Motion v12 dispara o callback fora do batch React; o ref atualiza síncrono.
    if (current > innerHeight && delta > HIDE_THRESHOLD_DOWN) {
      if (!hidden) flushSync(() => setHidden(true));
    } else if (delta < -SHOW_THRESHOLD_UP) {
      if (hidden) flushSync(() => setHidden(false));
    }
  });

  const effectiveHidden = !reduced && hidden;

  return (
    <motion.header
      data-hidden={effectiveHidden ? "true" : "false"}
      className="sticky top-0 z-30 w-full bg-surface-light/85 backdrop-blur-md"
      initial={false}
      animate={{ y: effectiveHidden ? "-100%" : "0%" }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
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
    </motion.header>
  );
}
