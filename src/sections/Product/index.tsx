/**
 * Product — Phase 4 section scaffold (Plan 04-00). Will be expanded by Plan 04-03.
 *
 * D-16: 1 hero feature full-width + 3 secundárias em row.
 * D-20: mais limpa visualmente da landing. Surface off-white.
 * D-20.1: Agentes IA implícitos no mockup do hero feature (NARR-08).
 */
import { Container } from "@/components/ui/container";

export function Product() {
  return (
    <section
      id="produto"
      aria-labelledby="product-headline"
      className="relative bg-surface-light py-24 lg:py-32"
    >
      <Container>
        <h2
          id="product-headline"
          className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
        >
          {/* Plan 04-03 substitui pelo copy real de PRODUCT_COPY.h2 */}
          Product scaffold
        </h2>
      </Container>
    </section>
  );
}
