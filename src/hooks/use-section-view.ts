"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Phase 6 — Hook dedicado de `section_view` tracking (TRACK-04).
 *
 * Dispara `track("section_view", { section })` UMA vez quando a seção entra no
 * viewport, via IntersectionObserver, e desconecta o observer (fire-once).
 *
 * Por que NÃO reusa `use-in-view.ts`: o hook de motion força `inView = true`
 * imediatamente sob `prefers-reduced-motion: reduce` para mostrar o estado final
 * sem animação. Construir `section_view` em cima dele dispararia um falso
 * positivo — todo usuário com reduced-motion registraria `section_view` de todas
 * as seções no mount, sem ter rolado até nenhuma (06-RESEARCH §Pitfall 3).
 * Analytics rastreia comportamento REAL → este hook NÃO consulta
 * `matchMedia`/`prefers-reduced-motion`.
 *
 * SSR-safe: guarda `typeof IntersectionObserver === "undefined"`.
 */
export function useSectionView<T extends Element = HTMLElement>(
  section: string,
  { threshold = 0.15 }: { threshold?: number } = {},
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          track("section_view", { section });
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [section, threshold]);

  return ref;
}
