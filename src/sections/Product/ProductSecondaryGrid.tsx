"use client";

/**
 * ProductSecondaryGrid — wrapper "use client".
 *
 * Grid 3-col desktop / stacked mobile, com 3 ProductSecondaryCard entrando em
 * stagger CSS-only (animation-delay incremental 100ms via inline style) quando
 * a grid entra no viewport (useInView threshold 0.2).
 *
 * NARR-06: zero motion lib import. Animação CSS-only via hero-card-rise
 * (Phase 3 reuso, sem novos keyframes).
 */
import { useInView } from "@/hooks/use-in-view";
import { PRODUCT_COPY } from "@/content/product";
import { ProductSecondaryCard } from "./ProductSecondaryCard";

export function ProductSecondaryGrid() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="mt-24 grid grid-cols-1 gap-6 lg:mt-32 lg:grid-cols-3 lg:gap-8"
    >
      {PRODUCT_COPY.secondaries.map((card, i) => (
        <div
          key={card.title}
          className={inView ? "hero-card-rise" : "opacity-0"}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <ProductSecondaryCard card={card} />
        </div>
      ))}
    </div>
  );
}
