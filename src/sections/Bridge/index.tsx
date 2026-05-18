/**
 * Bridge — Phase 4 § Bridge (NARR-02 reinterpretado).
 *
 * D-13/D-15: statement editorial silencioso PURO. Sem mockup, sem cards, sem CTA.
 * A transição cromática Pain DARK → Bridge LIGHT É o efeito cinematográfico.
 * Primeira seção LIGHT da landing.
 *
 * NARR-06: zero motion lib import; única animação é o reveal do statement via
 * useInView + keyframe hero-headline-reveal (clip-path mask reveal, Phase 3 reuso).
 * D-29: zero CTA.
 *
 * SEO/a11y: o próprio statement É o h2 visível (id="bridge-headline").
 * NÃO usar h2 sr-only sintético — a frase editorial real é o heading.
 * BridgeStatement renderiza o h2 internamente.
 */
import { Container } from "@/components/ui/container";
import { BridgeStatement } from "./BridgeStatement";

export function Bridge() {
  return (
    <section
      id="bridge"
      aria-labelledby="bridge-headline"
      className="relative bg-surface-light py-24 sm:py-32 lg:py-40"
    >
      <Container className="max-w-3xl text-center">
        <BridgeStatement />
      </Container>
    </section>
  );
}
