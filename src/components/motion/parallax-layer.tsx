"use client";
/**
 * @frozen — ParallaxLayer (MOTION-02).
 *
 * Aplica translateY sutil baseado em scroll progress da seção em que
 * o ParallaxLayer está inserido.
 *
 * Matriz device-tier (D-11):
 *   - mobile:   magnitude=0 (off — REQ MOTION-02 obriga)
 *   - tablet:   magnitude × 0.5 (default 0.2 -> efetivo 0.1, leve)
 *   - desktop:  magnitude × 1.0 (default 0.2, medio)
 *   - reduced:  magnitude=0
 *
 * Range: progress 0->1 mapeia em translateY de +magnitude*100px ate -magnitude*100px
 * (entrando no viewport = layer offset positivo; saindo = offset negativo).
 *
 * MOTION-08: usa apenas `transform: translateY` (shorthand `y` do motion/react).
 *
 * Politica de mudanca (D-16): exige PR `motion-api-change` + aprovacao Lenny.
 */
import { motion, useTransform, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { useScrollProgressInRange } from "./internal/use-scroll-progress-in-range";

export interface ParallaxLayerProps {
  children: ReactNode;
  /**
   * Magnitude relativa (0 = sem parallax, 1 = move 100% da viewport).
   * Tier-overrides automáticos (D-11):
   *   - mobile: forçado 0 (REQ MOTION-02)
   *   - tablet: usa este valor × 0.5
   *   - desktop: usa este valor × 1.0
   *   - reduced: forçado 0
   * Default 0.2.
   */
  magnitude?: number;
  /** className passthrough — fica no wrapper, layer interna recebe translateY. */
  className?: string;
}

const TIER_MULTIPLIER: Record<"mobile" | "tablet" | "desktop", number> = {
  mobile: 0, // MOTION-02 obriga off no mobile
  tablet: 0.5,
  desktop: 1.0,
};

/** Quanto px de translateY maximo aplicar dado magnitude=1. */
const PARALLAX_RANGE_PX = 100;

export function ParallaxLayer({
  children,
  magnitude = 0.2,
  className,
}: ParallaxLayerProps) {
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgressInRange(ref);

  const effectiveMagnitude =
    reducedMotion || tier === "reduced"
      ? 0
      : magnitude * TIER_MULTIPLIER[tier as "mobile" | "tablet" | "desktop"];

  const maxPx = effectiveMagnitude * PARALLAX_RANGE_PX;
  // Entrada do viewport -> +maxPx; saida -> -maxPx
  const y = useTransform(progress, [0, 1], [maxPx, -maxPx]);

  // Quando magnitude efetiva = 0, ainda renderizamos um <div> com o mesmo ref.
  // Mantem layout identico entre tiers (sem reflow ao trocar tier via resize)
  // e evita criar MotionValue desnecessario.
  if (effectiveMagnitude === 0) {
    return (
      <div className={className} ref={ref}>
        {children}
      </div>
    );
  }

  return (
    <motion.div className={className} ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
