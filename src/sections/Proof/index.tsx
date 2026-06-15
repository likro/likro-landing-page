/**
 * Proof — Phase 4 § Proof (NARR-05).
 *
 * D-26/D-28: institucional silencioso, categorias verticais minimal.
 * D-27 + STATE.md 2026-05-18: zero Dolce Home, zero logos, zero números fabricados.
 * surface CLARA (v2, 2026-06-14): Proof era DARK (D-05/D-24), mas sozinha no meio
 *   do bloco claro (HowItWorks→Form) virava uma "ilha preta" estranha (feedback
 *   Lenny). Agora é clara — arco tonal limpo: escuro (Hero/Pain) → claro (corpo)
 *   → escuro (Footer). Credibilidade vem da contenção, funciona igual em claro.
 * NARR-06: zero motion lib (animation via hero-card-rise keyframe Phase 3).
 */
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { PROOF_COPY } from "@/content/proof";
import { ProofBackground } from "./ProofBackground";

export function Proof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-headline"
      className="relative isolate overflow-hidden bg-[#EEF1F5] py-24 lg:py-32"
    >
      <ProofBackground />
      <Container className="relative z-10 max-w-4xl text-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-muted">
          {PROOF_COPY.eyebrow}
        </div>
        <h2
          id="proof-headline"
          className="mx-auto mt-4 max-w-3xl text-balance text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-text-primary sm:text-3xl lg:text-4xl"
        >
          {PROOF_COPY.headline}
        </h2>
        <div className="mt-12 flex justify-center md:mt-16">
          <WhatsAppCta variant="primary" location="proof">
            Falar com a Likro agora
          </WhatsAppCta>
        </div>
      </Container>
    </section>
  );
}
