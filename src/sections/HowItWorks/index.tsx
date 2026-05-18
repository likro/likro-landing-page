/**
 * HowItWorks — Phase 4 section scaffold (Plan 04-00). Will be expanded by Plan 04-04.
 *
 * D-21: 4 passos timeline vertical. Surface light neutral.
 * D-22: lead chega → operação distribui → atendente conversa → paciente agendado.
 */
import { Container } from "@/components/ui/container";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-headline"
      className="relative bg-surface-lighter py-24 lg:py-32"
    >
      <Container>
        <h2
          id="how-headline"
          className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
        >
          {/* Plan 04-04 substitui pelo copy real de HOW_COPY.h2 */}
          HowItWorks scaffold
        </h2>
      </Container>
    </section>
  );
}
