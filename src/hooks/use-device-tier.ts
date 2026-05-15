"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type DeviceTier = "reduced" | "mobile" | "tablet" | "desktop";

/**
 * FOUND-06: Hook único para tier device — todas seções e primitivas
 * de motion (Phase 2+) consomem isto pra escolher choreography.
 *
 * Breakpoints: mobile <=639, tablet <=1023, desktop >=1024.
 * Reduced sempre vence (vem de prefers-reduced-motion no OS).
 *
 * Reage a 'resize' (re-computa tier ao redimensionar / rotacionar device).
 * SSR-safe: estado inicial "desktop" durante hydration; o efeito ajusta
 * pós-mount via matchMedia.
 */
export function useDeviceTier(): DeviceTier {
  const reduced = useReducedMotion();
  const [tier, setTier] = useState<DeviceTier>("desktop");

  useEffect(() => {
    if (reduced) {
      setTier("reduced");
      return;
    }
    const compute = (): DeviceTier => {
      if (window.matchMedia("(max-width: 639px)").matches) return "mobile";
      if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
      return "desktop";
    };
    setTier(compute());
    const onResize = () => setTier(compute());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [reduced]);

  return tier;
}
