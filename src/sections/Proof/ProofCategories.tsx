"use client";
import { useInView } from "@/hooks/use-in-view";
import { PROOF_COPY } from "@/content/proof";

/**
 * ProofCategories — D-26 row de categorias verticais minimal.
 *
 * Stagger 100ms via useInView. Separados por dot `·` text-text-on-dark-muted.
 * Mobile: flex-wrap mantém visual de "row" (D-26 + RESEARCH §535).
 * Reduced motion: globals.css zera animation-duration globalmente.
 *
 * NARR-06: CSS-only animation (hero-card-rise keyframe — Phase 3).
 * D-28: zero accent roxo aqui — Proof é silêncio editorial.
 */
export function ProofCategories() {
  const [ref, inView] = useInView<HTMLUListElement>({ threshold: 0.4 });
  return (
    <ul
      ref={ref}
      className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:mt-16 lg:gap-x-8"
    >
      {PROOF_COPY.categories.map((cat, i) => (
        <li key={cat} className="flex items-center gap-3 lg:gap-6">
          <span
            className={`text-[14px] font-medium tracking-tight text-text-on-dark-secondary lg:text-[15px] ${
              inView ? "hero-card-rise" : "opacity-0"
            }`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {cat}
          </span>
          {i < PROOF_COPY.categories.length - 1 && (
            <span aria-hidden="true" className="text-text-on-dark-muted">
              ·
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
