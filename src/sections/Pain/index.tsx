/**
 * Pain — Phase 4 § Pain section (NARR-01).
 *
 * Composição: dark background (continua o peso de Hero, intensifica tensão) +
 * headline editorial + sub aterrissando em 4 canais + constelação CSS-only de
 * 4 pseudo-cards + statement-line de síntese.
 *
 * D-05/D-09: dark, fragmentação operacional sistêmica.
 * D-10/D-11/D-12: editorial calmo, headline afirmação não pergunta,
 *   statement-line de síntese fecha em "constatação".
 * NARR-06 reinterpretado: zero motion.* JSX, zero import @/components/motion —
 *   animations CSS-only via useInView + keyframe hero-card-rise (Phase 3 reuso).
 * NARR-07: rotações reduzidas mobile via responsive transforms (PainCardConstellation).
 * D-15: vinheta inferior fade-to-light prepara transição cromática para Bridge.
 * D-29: zero CTA WhatsApp na Pain.
 * COPY-01: todo string vem de PAIN_COPY.
 */
import { Container } from "@/components/ui/container";
import { PAIN_COPY } from "@/content/pain";
import { PainBackground } from "./PainBackground";
import { PainCardConstellation } from "./PainCardConstellation";
import { PainStatement } from "./PainStatement";

export function Pain() {
  return (
    <section
      id="pain"
      aria-labelledby="pain-headline"
      className="relative isolate overflow-hidden bg-surface-darker py-24 lg:py-32"
    >
      <PainBackground />
      <Container className="relative z-10">
        <h2
          id="pain-headline"
          className="mx-auto max-w-3xl text-balance text-center text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-text-on-dark-primary sm:text-4xl lg:text-[2.75rem]"
        >
          {PAIN_COPY.h2}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-center text-base leading-[1.6] text-text-on-dark-secondary sm:text-lg">
          {PAIN_COPY.sub}
        </p>
        <PainCardConstellation />
        <PainStatement />
      </Container>
    </section>
  );
}
