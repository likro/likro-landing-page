"use client";
import { useEffect } from "react";
import type { PropsWithChildren } from "react";

/**
 * Smooth scroll — Lenis com inicialização LAZY (pós-idle).
 *
 * Otimização TBT: a versão antiga importava `ReactLenis` de `lenis/react`
 * no boot, adicionando ~14KB no first load + setup síncrono que entrava no
 * Total Blocking Time. Lighthouse mobile media mostrou TBT ~1150ms.
 *
 * Agora:
 *   - bundle root NÃO contém Lenis (dynamic import dentro de useEffect)
 *   - Lenis só inicializa após requestIdleCallback (não compete com first paint)
 *   - prefers-reduced-motion → skip inteiro (sem download do chunk)
 *
 * Side effect zero pro DOM: até Lenis inicializar, o browser usa scroll nativo.
 * Quando Lenis instalar (~200ms-1s após load), o smooth scroll entra "live".
 */
export function SmoothScrollProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number | undefined;
    let lenis: import("lenis").default | undefined;
    let cancelled = false;

    const idle =
      "requestIdleCallback" in window
        ? (window.requestIdleCallback as (cb: () => void) => number)
        : (cb: () => void) => window.setTimeout(cb, 300);

    idle(async () => {
      if (cancelled) return;
      const Lenis = (await import("lenis")).default;
      if (cancelled) return;

      lenis = new Lenis({
        lerp: 0.1,
        duration: 1.1,
        smoothWheel: true,
        syncTouch: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      const tick = (time: number) => {
        lenis?.raf(time);
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      if (raf !== undefined) window.cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
