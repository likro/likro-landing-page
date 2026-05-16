"use client";
/**
 * @frozen — RevealOnView (MOTION-01).
 *
 * Fade + slide-up no primeiro viewport entry.
 * Adaptativo por useDeviceTier() (D-10):
 *   - mobile:   distance=12px, duration=400ms, stagger=60ms (delay base entre filhos)
 *   - tablet:   distance=16px, duration=500ms, stagger=70ms
 *   - desktop:  distance=24px, duration=600ms, stagger=80ms
 *   - reduced:  estado final imediato (sem transição) — MOTION-07
 *
 * Só usa `transform` (translateY) + `opacity` — MOTION-08.
 *
 * Stagger entre múltiplos RevealOnView é composição via `delayMs` prop
 * (o consumidor passa delays incrementais; guidance D-10 stagger é o
 * incremento sugerido por tier — não estado interno desta primitiva).
 *
 * Política de mudança (D-16): exige PR `motion-api-change` + aprovação Lenny.
 */
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { MOTION_EASING } from "./internal/easing";

export interface RevealOnViewProps {
  /** Conteúdo a revelar. */
  children: ReactNode;
  /** Atrasa entrada por N ms (composição manual de stagger entre múltiplos RevealOnView). Default 0. */
  delayMs?: number;
  /** Tag DOM. Default "div". */
  as?: "div" | "section" | "li" | "span" | "article";
  /** className passthrough. */
  className?: string;
  /** Threshold de IntersectionObserver via amount do whileInView. Default 0.2. */
  amount?: number;
  /** Re-dispara animação ao re-entrar. Default false (uma vez por mount). */
  repeat?: boolean;
}

type TierConfig = { distance: number; durationMs: number };

const TIER_CONFIG: Record<"mobile" | "tablet" | "desktop", TierConfig> = {
  mobile: { distance: 12, durationMs: 400 },
  tablet: { distance: 16, durationMs: 500 },
  desktop: { distance: 24, durationMs: 600 },
};

export function RevealOnView({
  children,
  delayMs = 0,
  as = "div",
  className,
  amount = 0.2,
  repeat = false,
}: RevealOnViewProps) {
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const isReduced = reducedMotion || tier === "reduced";

  // Reduced: render direto sem motion wrapper (estado final imediato, zero overhead).
  if (isReduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const { distance, durationMs } =
    TIER_CONFIG[tier as "mobile" | "tablet" | "desktop"];
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, amount }}
      transition={{
        duration: durationMs / 1000,
        delay: delayMs / 1000,
        ease: MOTION_EASING as unknown as [number, number, number, number],
      }}
    >
      {children}
    </MotionTag>
  );
}
