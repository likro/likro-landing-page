/**
 * Product — Phase 4 § Product section (NARR-03 reinterpretado per D-16).
 *
 * D-16: 1 hero feature "Atendimento multicanal" full-width + 3 secundárias em row.
 * D-20: surface light off-white, seção mais limpa visualmente da landing.
 * D-20.1: Agentes IA implícitos no mockup hero (NARR-08), micro-line muted —
 *   tom Linear/Stripe, não Anthropic/OpenAI marketing.
 * NARR-06: zero motion lib import; tudo CSS keyframes Phase 3 (hero-card-rise / hero-card-float-*).
 * NARR-07: hero feature stack vertical mobile; secundárias grid-cols-1 stacked.
 * D-29: zero CTA WhatsApp na Product.
 * COPY-01: todo string vem de PRODUCT_COPY.
 *
 * Plan 04-03 Task 2: ProductHeader + ProductSecondaryGrid wireados aqui.
 * Plan 04-03 Task 3: ProductHeroFeature substitui o slot mt-20 entre header e grid.
 */
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { ProductHeader } from "./ProductHeader";
import { ProductHeroFeature } from "./ProductHeroFeature";
import { ProductSecondaryGrid } from "./ProductSecondaryGrid";

export function Product() {
  return (
    <section
      id="produto"
      aria-labelledby="product-headline"
      className="relative isolate overflow-hidden border-t border-[rgba(2,6,23,0.07)] bg-[#E6ECF4] py-24 sm:py-28 lg:py-36"
    >
      {/* Atmosfera (remix de cor): glow VIOLETA suave atrás do feature hero — pop de
          marca na seção de produto. Brand-safe (rgba, acento); fundo cool, não branco. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 50% 42% at 80% 24%, rgba(124,58,237,0.10), transparent 66%)",
        }}
      />
      <Container>
        <ProductHeader />
        <ProductHeroFeature />
        <ProductSecondaryGrid />
        <div className="mt-12 flex justify-center md:mt-16">
          <WhatsAppCta variant="primary" location="product">
            Ver tudo isso na minha clínica
          </WhatsAppCta>
        </div>
      </Container>
    </section>
  );
}
