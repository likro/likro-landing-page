/**
 * HowItWorksHeader — RSC primitive.
 *
 * Header centrado, max-w-3xl. h2 + sub from HOW_COPY.header.
 * D-23: tom explicativo simplificador — tipografia mais leve que Hero/Product,
 * NÃO compete visualmente com elas. Surface light neutral (bg-surface-lighter
 * vem do orchestrator). Zero accent purple aqui — accent fica reservado pros
 * números grandes em HowItWorksStep (D-20 micro-element rule).
 */
import { HOW_COPY } from "@/content/how-it-works";

export function HowItWorksHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <h2
        id="how-headline"
        className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary sm:text-4xl lg:text-[2.5rem]"
      >
        {HOW_COPY.header.h2}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-[1.6] text-text-secondary sm:text-lg">
        {HOW_COPY.header.sub}
      </p>
    </header>
  );
}
