"use client";
/**
 * @frozen — ScrollScene (MOTION-05). API CONGELADA após Phase 2.
 *
 * Contrato GSAP-future-ready (PROJECT.md). Toda a arquitetura "trocar Motion → GSAP
 * em uma seção sem refactor" depende deste contrato estar estável.
 *
 * Decisões (CONTEXT.md):
 * - D-01: consumo via RENDER PROP apenas — sem context, sem hooks externos.
 * - D-02: progress é `MotionValue<number>` 0→1 plain — caller deriva sub-ranges
 *         via useTransform(progress, [0, .3, .7, 1], [...]) localmente.
 * - D-03: `offset` opcional, sintaxe Framer Motion useScroll.
 *         Default ['start end', 'end start'] cobre 90% dos casos.
 * - D-04: `'use client'` obrigatório. Pai pode permanecer RSC (page.tsx ok).
 *
 * Política de mudança (D-16): exige PR com label `motion-api-change`
 * + aprovação explícita do Lenny.
 *
 * Consumidores NUNCA importam useScroll/useTransform de motion/react direto —
 * sempre via render prop deste componente (MOTION-05). EXCEÇÃO controlada:
 * dentro do render prop, seções PODEM importar useTransform de motion/react
 * para derivar sub-ranges do `progress` recebido (D-02). Documentado no barrel.
 *
 * Reduced motion: ScrollScene NÃO trata aqui — contrato é "emite MotionValue 0→1".
 * Em reduced, o componente continua emitindo, mas o consumidor decide se reage.
 * Casos como StickyStage aninhado em reduced (progress=1 fixo) são responsabilidade
 * do StickyStage (D-09), não do ScrollScene. Mantém ScrollScene puro e composável.
 */
import { useRef, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useScrollProgressInRange } from "./internal/use-scroll-progress-in-range";

export interface ScrollSceneProps {
  /**
   * Render prop (D-01). Recebe MotionValue<number> 0→1 (D-02) representando
   * a posição da seção no viewport segundo `offset`.
   *
   * Consumidores SEMPRE acessam o progress via este argumento — NUNCA importam
   * useScroll/useTransform de motion/react diretamente em código de seção (MOTION-05).
   */
  children: (progress: MotionValue<number>) => ReactNode;
  /**
   * Range do scroll mapeado para 0→1 (D-03). Sintaxe Framer Motion useScroll.
   * Default ['start end', 'end start'] — começa quando topo da scene toca
   * bottom do viewport, termina quando bottom da scene sai por cima.
   */
  offset?: [string, string];
  /** className do wrapper externo (seção). */
  className?: string;
  /** Tag DOM do wrapper. Default "section". */
  as?: "section" | "div" | "article";
}

export function ScrollScene({
  children,
  offset,
  className,
  as = "section",
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgressInRange(ref, offset);
  const Tag = as;

  // Pass ref via cast — Tag union garante elemento HTML, mas TS não consegue
  // inferir o tipo correto de ref para uma tag dinâmica restrita ao union.
  // Cast pragmático aceito (também usado em projetos como Radix).
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
    >
      {children(progress)}
    </Tag>
  );
}
