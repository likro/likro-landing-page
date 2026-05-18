/**
 * HowItWorks — Phase 4 § HowItWorks section (NARR-04).
 *
 * D-21/D-22: 4 passos timeline vertical mostrando fluxo real do lead na clínica:
 *   01 Lead chega → 02 Operação distribui → 03 Atendente conversa → 04 Paciente agendado.
 * D-23: tom explicativo simplificador, NÃO compete visualmente com Hero/Product.
 * D-05: surface LIGHT NEUTRAL (bg-surface-lighter #fff) — micro-diferença vs
 *   Product (off-white) para diferenciar contextos sem ruído cromático.
 * D-20: números grandes em accent-primary (roxo Likro) por step — único
 *   accent visual autorizado em micro-elemento.
 * NARR-04: staggered reveal vertical (horizontal scroll = v1.1 stretch).
 * NARR-06: zero motion lib import — useInView + CSS keyframes Phase 3.
 * NARR-07: mobile flex-col stack, sem connector line.
 * D-29: zero CTA WhatsApp.
 * COPY-01: todas as strings vêm de HOW_COPY.
 */
import { Container } from "@/components/ui/container";
import { HOW_COPY } from "@/content/how-it-works";
import { HowItWorksHeader } from "./HowItWorksHeader";
import { HowItWorksStep } from "./HowItWorksStep";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-headline"
      className="relative bg-surface-lighter py-24 lg:py-32"
    >
      <Container className="max-w-5xl">
        <HowItWorksHeader />
        <ol className="mt-16 lg:mt-20">
          {HOW_COPY.steps.map((step, i) => (
            <li key={step.number}>
              <HowItWorksStep
                step={step}
                index={i}
                isLast={i === HOW_COPY.steps.length - 1}
              />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
