"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type DeviceTier = "reduced" | "mobile" | "tablet" | "desktop";

/**
 * PERF-09: degradação por conexão lenta — progressive enhancement.
 *
 * Lê `navigator.connection?.effectiveType` de forma defensiva. A Network
 * Information API NÃO existe no Safari (browser dominante do tráfego alvo
 * iOS) — `navigator.connection` é `undefined`; o acesso opcional retorna
 * `false` e o tier fica inalterado (fallback no-op, sem caminho de erro —
 * T-07-10 aceito). Só Android Chrome se beneficia desta detecção; Safari/iOS
 * continua coberto por `useDeviceTier` (breakpoints) + `prefers-reduced-motion`.
 *
 * `effectiveType` "slow-2g" ou "2g" → rebaixa o tier para "reduced".
 */
function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string };
    }
  ).connection;
  const effectiveType = connection?.effectiveType;
  return effectiveType === "slow-2g" || effectiveType === "2g";
}

/**
 * FOUND-06: Hook único para tier device — todas seções e primitivas
 * de motion (Phase 2+) consomem isto pra escolher choreography.
 *
 * Breakpoints: mobile <=639, tablet <=1023, desktop >=1024.
 * Reduced sempre vence (vem de prefers-reduced-motion no OS).
 * PERF-09: conexão lenta (slow-2g/2g, Android Chrome) também força "reduced".
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
      // PERF-09: conexão lenta degrada para reduced (no-op no Safari).
      if (isSlowConnection()) return "reduced";
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
