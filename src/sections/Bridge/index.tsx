/**
 * Bridge — Phase 4 section scaffold (Plan 04-00). Will be expanded by Plan 04-02.
 *
 * D-13/D-15: statement editorial silencioso puro, sem mockup. Transição cromática
 * dark→light entre Pain e Bridge É o efeito cinematográfico.
 * Surface: bg-surface-light.
 */
import { Container } from "@/components/ui/container";

export function Bridge() {
  return (
    <section
      id="bridge"
      aria-labelledby="bridge-headline"
      className="relative bg-surface-light py-24 lg:py-40"
    >
      <Container className="max-w-3xl text-center">
        <h2
          id="bridge-headline"
          className="text-balance text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
        >
          {/* Plan 04-02 substitui pelo copy real de BRIDGE_COPY.statement */}
          Bridge scaffold
        </h2>
      </Container>
    </section>
  );
}
