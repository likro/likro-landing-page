"use client";

/**
 * ProductHeroFeature — wrapper "use client" do hero feature split:
 *   left col = bloco editorial (eyebrow + title + description)
 *   right col = ProductHeroFeatureMockup (inbox central + 2 overlays float + iaLine)
 *
 * Trigger CSS-only via useInView (Plan 04-00 hook): bloco de texto + mockup wrapper
 * recebem hero-card-rise quando a seção entra no viewport (threshold 0.2). O central
 * card do mockup NÃO tem entrance animation extra — overlays já flotam naturalmente
 * (hero-card-float-a/c), suficiente pra sensação de "operação viva".
 *
 * Mobile: stack vertical (grid-cols-1, text-center). Desktop lg: 2-col grid 2fr_3fr
 * (texto à esquerda, mockup à direita ocupando maior fração).
 *
 * NARR-06: zero motion lib import; tudo CSS keyframes Phase 3.
 * D-17: feature hero = "Atendimento multicanal" (conteúdo vem de PRODUCT_COPY.feature).
 */
import { useInView } from "@/hooks/use-in-view";
import { PRODUCT_COPY } from "@/content/product";
import { ProductHeroFeatureMockup } from "./ProductHeroFeatureMockup";

export function ProductHeroFeature() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const { feature } = PRODUCT_COPY;

  return (
    <div
      ref={ref}
      className="mt-20 grid grid-cols-1 items-center gap-12 lg:mt-24 lg:grid-cols-[2fr_3fr] lg:gap-16"
    >
      <div
        className={`text-center lg:text-left ${inView ? "hero-card-rise" : "opacity-0"}`}
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
          {feature.eyebrow}
        </div>
        <h3 className="mt-3 text-balance text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-3xl lg:text-4xl">
          {feature.title}
        </h3>
        <p className="mx-auto mt-4 max-w-md text-balance text-base leading-[1.6] text-text-secondary lg:mx-0">
          {feature.description}
        </p>
      </div>
      <div
        className={`flex justify-center lg:justify-end ${inView ? "hero-card-rise" : "opacity-0"}`}
        style={{ animationDelay: "150ms" }}
      >
        <ProductHeroFeatureMockup />
      </div>
    </div>
  );
}
