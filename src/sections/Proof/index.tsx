/**
 * Proof — Phase 4 § Proof (NARR-05).
 *
 * D-24/D-26/D-28: dark institucional silencioso, categorias verticais minimal.
 * D-27 + STATE.md 2026-05-18: zero Dolce Home, zero logos, zero números fabricados.
 * D-05: surface DARK — fecha a landing em peso autoridade.
 * D-29: zero CTA (Proof não converte — Phase 5 cuida do CTA final).
 * NARR-06: zero motion lib (animation via hero-card-rise keyframe Phase 3).
 */
import { Container } from "@/components/ui/container";
import { PROOF_COPY } from "@/content/proof";
import { ProofBackground } from "./ProofBackground";
import { ProofCategories } from "./ProofCategories";

export function Proof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-headline"
      className="relative isolate overflow-hidden bg-surface-darker py-24 lg:py-32"
    >
      <ProofBackground />
      <Container className="relative z-10 max-w-4xl text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-on-dark-muted">
          {PROOF_COPY.eyebrow}
        </div>
        <h2
          id="proof-headline"
          className="mx-auto mt-4 max-w-3xl text-balance text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-text-on-dark-primary sm:text-3xl lg:text-4xl"
        >
          {PROOF_COPY.headline}
        </h2>
        <ProofCategories />
      </Container>
    </section>
  );
}
