"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Phase 4 / Plan 04-05 — useInView hook.
 *
 * NARR-06: animações Phase 4 são CSS-only (sem motion lib). useInView retorna
 * boolean inView pra trigger de animation via className conditional + keyframe.
 *
 * SSR-safe: estado inicial false; IntersectionObserver criado no useEffect.
 * Once-true: depois que entra em view, NÃO sai (entrance one-shot).
 * Respect prefers-reduced-motion via CSS global (animation-duration: 0.01ms).
 *
 * Threshold: fração de visibilidade pra disparar. 0.4 = 40% do elemento visível.
 *
 * @example
 * const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
 * return <div ref={ref} className={inView ? "hero-card-rise" : "opacity-0"} />;
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
): readonly [React.RefObject<T | null>, boolean] {
  const { threshold = 0.2, rootMargin = "0px" } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fallback: navegadores sem IntersectionObserver → considera visível imediatamente.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView] as const;
}
