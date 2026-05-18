"use client";

/**
 * ProductHeroFeature — Plan 04-03 Task 2 stub.
 *
 * Task 3 substitui esta versão com a composição completa:
 *   - 2-col grid desktop (copy left, mockup right) / stack vertical mobile
 *   - useInView trigger pro fade-up do bloco de texto
 *   - ProductHeroFeatureMockup com inbox card central + 2 overlays float + iaLine
 *
 * Por ora retorna um placeholder mínimo para o orchestrator compilar sem
 * quebrar tsc / coherence. Sem conteúdo PT-BR hardcoded (gates Task 1).
 */
import { useInView } from "@/hooks/use-in-view";
import { PRODUCT_COPY } from "@/content/product";

export function ProductHeroFeature() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const { feature } = PRODUCT_COPY;
  return (
    <div
      ref={ref}
      className={`mt-20 text-center lg:mt-24 ${inView ? "hero-card-rise" : "opacity-0"}`}
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
        {feature.eyebrow}
      </div>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        {feature.title}
      </h3>
    </div>
  );
}
