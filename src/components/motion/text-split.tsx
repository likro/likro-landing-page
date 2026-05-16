"use client";
/**
 * @frozen — TextSplit (MOTION-04).
 *
 * Faz reveal de texto por palavra (desktop) ou linha (mobile/tablet)
 * via spans manuais — sem dependência externa (D-12).
 *
 * Granularidade (D-12):
 *   - desktop:  split por palavra, stagger 25ms
 *   - tablet:   split por linha,    stagger 80ms
 *   - mobile:   split por linha,    stagger 80ms (REQ MOTION-04 obriga line)
 *   - reduced:  instant — texto renderizado em estado final, zero animação
 *
 * MOTION-08: anima apenas opacity + transform (translateY).
 *
 * Strategy:
 * 1. Sempre splita o texto em palavras (`text.split(/\s+/)`).
 * 2. Renderiza um `<span data-word>` por palavra (com space inline).
 * 3. Em mobile/tablet, useLineGrouping mapeia cada palavra → lineIndex.
 * 4. Stagger é calculado a partir do índice apropriado (word ou line).
 *
 * Accessibility: `aria-label={text}` no wrapper + `aria-hidden="true"` nos spans
 * → screen readers leem texto completo, não palavra-por-palavra.
 *
 * Política de mudança (D-16): exige PR `motion-api-change` + aprovação Lenny.
 */
import { useRef, createElement, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { MOTION_EASING, REVEAL_DURATION_MS } from "./internal/easing";
import { useLineGrouping } from "./internal/use-line-grouping";

export interface TextSplitProps {
  /** Texto a revelar. STRING simples — sem HTML aninhado. */
  text: string;
  /**
   * Tag DOM do wrapper. Default "h2".
   * Limite ao headline set: h1..h6, p, span.
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  /** className passthrough no wrapper. */
  className?: string;
  /** Atrasa start global por N ms. Default 0. */
  delayMs?: number;
  /** Threshold de viewport entry. Default 0.4 (texto precisa estar 40% visível). */
  amount?: number;
}

const WORD_STAGGER_MS = 25;
const LINE_STAGGER_MS = 80;

const SPAN_STYLE: CSSProperties = {
  display: "inline-block",
  whiteSpace: "pre",
};

export function TextSplit({
  text,
  as = "h2",
  className,
  delayMs = 0,
  amount = 0.4,
}: TextSplitProps) {
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const isReduced = reducedMotion || tier === "reduced";
  const splitByLine = tier === "mobile" || tier === "tablet";

  const containerRef = useRef<HTMLElement>(null);
  const lineMap = useLineGrouping(containerRef, splitByLine && !isReduced);

  const words = text.split(/\s+/).filter(Boolean);

  // Reduced: render direto, texto plano, sem motion wrapper.
  if (isReduced) {
    return createElement(as, { className }, text);
  }

  // Container Tag (mantém ref para measurement). Cast pragmático no ref —
  // TS não consegue inferir o tipo correto para union de tags.
  return createElement(
    as,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref: containerRef as any,
      className,
      "aria-label": text,
    },
    words.map((word, i) => {
      const staggerIndex = splitByLine
        ? // Pré-medição: usa 0 (todas palavras com delay=0 no primeiro frame).
          // Aceitamos esse FOUC mínimo: 1 frame antes da primeira measurement.
          (lineMap[i] ?? 0)
        : i;
      const staggerMs = splitByLine ? LINE_STAGGER_MS : WORD_STAGGER_MS;
      const delaySeconds = (delayMs + staggerIndex * staggerMs) / 1000;
      const isLast = i === words.length - 1;

      return (
        <motion.span
          key={`${word}-${i}`}
          data-word
          aria-hidden="true"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount }}
          transition={{
            duration: REVEAL_DURATION_MS / 1000,
            delay: delaySeconds,
            ease: MOTION_EASING as unknown as [number, number, number, number],
          }}
          style={SPAN_STYLE}
        >
          {word}
          {isLast ? "" : " "}
        </motion.span>
      );
    }),
  );
}
