/**
 * Proof — Phase 4 section scaffold (Plan 04-00). Will be expanded by Plan 04-05.
 *
 * D-24/D-28: institucional silencioso, dark editorial. O silêncio visual vale mais.
 * D-26: categorias verticais em row — Estética · Dermatologia · Harmonização Facial · Odontologia · Bem-estar.
 * D-27: PROIBIDO logos cliente, números fabricados, testimonials, Dolce Home.
 */
import { Container } from "@/components/ui/container";

export function Proof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-headline"
      className="relative bg-surface-darker py-24 lg:py-32"
    >
      <Container className="max-w-4xl text-center">
        <h2
          id="proof-headline"
          className="text-balance text-2xl font-semibold tracking-tight text-text-on-dark-primary sm:text-3xl lg:text-4xl"
        >
          {/* Plan 04-05 substitui pelo copy real de PROOF_COPY.h2 */}
          Proof scaffold
        </h2>
      </Container>
    </section>
  );
}
