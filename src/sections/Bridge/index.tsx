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
      className="relative isolate overflow-hidden bg-[#F4F7FB] py-24 sm:py-32 lg:py-40"
    >
      {/* Atmosfera (remix de cor, brand-safe): glow VIOLETA suave centrado — a
          "outra forma de operar" emergindo como luz. Roxo só como acento (brand-lock
          ok: rgba, não hex); fundo segue claro. Traz a cor da marca pro corpo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 58% 50% at 50% 46%, rgba(124,58,237,0.10), transparent 70%)",
        }}
      />
      {/* Dissolve cromático Bridge → Product: o rodapé do Bridge (#F4F7FB) clareia
          até a COR EXATA do Product (#E6ECF4) ao longo do padding inferior — virada de
          cor suave, sem linha dura (mesma lógica do dissolve Pain→Bridge no topo). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(230,236,244,0) 0%, rgb(230,236,244) 100%)",
        }}
      />
      <Container className="max-w-3xl text-center">
        <BridgeStatement />
      </Container>
    </section>
  );
}
