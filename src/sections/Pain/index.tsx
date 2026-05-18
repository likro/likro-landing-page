/**
 * Pain — Phase 4 section scaffold (Plan 04-00). Will be expanded by Plan 04-01.
 *
 * D-05 atmosphere: DARK (continua o peso de Hero, intensifica tensão).
 * D-09: fragmentação operacional sistêmica.
 * Surface: bg-surface-darker.
 */
import { Container } from "@/components/ui/container";

export function Pain() {
  return (
    <section
      id="pain"
      aria-labelledby="pain-headline"
      className="relative isolate overflow-hidden bg-surface-darker py-24 lg:py-32"
    >
      <Container>
        <h2
          id="pain-headline"
          className="text-balance text-3xl font-semibold tracking-tight text-text-on-dark-primary sm:text-4xl lg:text-5xl"
        >
          {/* Plan 04-01 substitui pelo copy real de PAIN_COPY.h2 */}
          Pain scaffold
        </h2>
      </Container>
    </section>
  );
}
