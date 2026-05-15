"use client";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { PropsWithChildren } from "react";

/**
 * FOUND-08: Lenis 1.x renomeou smoothTouch → syncTouch.
 * Use `syncTouch: false` (smoothTouch é silenciosamente ignorado em 1.x).
 * Skip init em prefers-reduced-motion → fallback pra native scroll.
 *
 * Orchestrator directive #1: NUNCA usar `smoothTouch` (deprecated em 1.x;
 * silently ignored). Bug-prone porque parece configurado mas não faz nada.
 */
export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.1,
        smoothWheel: true,
        syncTouch: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
