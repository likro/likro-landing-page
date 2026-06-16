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
    let cleanupSnap: (() => void) | undefined;

    const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

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
        easing,
      });

      const tick = (time: number) => {
        lenis?.raf(time);
        raf = window.requestAnimationFrame(tick);
      };
      raf = window.requestAnimationFrame(tick);

      // Snap — dá um FIM DEFINIDO ao Hero (bloco de scrollytelling de ~165svh).
      // Sem isso o usuário parava em qualquer ponto da travessia (meio-termo
      // aleatório). Agora, ao PARAR (debounce) perto de um limite, o scroll
      // assenta nele: topo do Hero (intro limpa) ou topo da Pain (= fim exato
      // do Hero = a costura). `proximity` só cata quando perto — o meio da
      // travessia segue livre DURANTE o scroll (a animação scrubba normal); o
      // snap só age quando o dedo/roda para. Progressive enhancement: se o addon
      // falhar, o scroll continua funcionando sem snap.
      try {
        const Snap = (await import("lenis/snap")).default;
        if (cancelled || !lenis) return;
        const snap = new Snap(lenis, {
          type: "proximity",
          distanceThreshold: "50%",
          debounce: 400,
          duration: 0.8,
          easing,
        });
        snap.add(0); // topo do Hero
        const painEl = document.getElementById("pain");
        // topo da Pain === fim do palco do Hero; addElement re-mede no resize
        // (a altura em svh muda com a viewport), mantendo a costura precisa.
        if (painEl) snap.addElement(painEl, { align: ["start"] });
        cleanupSnap = () => snap.destroy();
      } catch {
        /* snap é opcional — falha não pode quebrar o smooth scroll */
      }
    });

    return () => {
      cancelled = true;
      if (raf !== undefined) window.cancelAnimationFrame(raf);
      cleanupSnap?.();
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
