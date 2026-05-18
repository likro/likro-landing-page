"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Phase 4 — Hook IO-based motion-free.
 *
 * Substitui o uso de @/components/motion/RevealOnView em sections de Phase 4
 * (NARR-06 reinterpretation — vide 04-RESEARCH.md §483-492).
 *
 * Comportamento:
 * - prefers-reduced-motion: reduce → retorna [ref, true] imediatamente (estado final, sem motion).
 * - Sem reduced motion → IntersectionObserver com threshold default 0.2 e rootMargin "0px 0px -10% 0px".
 * - opts.once (default true): uma vez inView, nunca volta para false.
 * - SSR-safe: window/IntersectionObserver não acessado durante render server.
 */
export interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useInView<T extends Element = HTMLDivElement>(
  opts: UseInViewOptions = {},
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.2, rootMargin = "0px 0px -10% 0px", once = true } = opts;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Reduced motion: skip IO entirely, return final state.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
