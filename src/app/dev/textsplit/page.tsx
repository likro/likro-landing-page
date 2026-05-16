import { assertDevAccess } from "../_components/dev-gate";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { TextSplit } from "@/components/motion";

/**
 * /dev/textsplit — showcase isolado de <TextSplit> (Phase 2 Plan 05, D-13).
 *
 * Server Component — gate D-15 via assertDevAccess.
 */
export default function DevTextSplitPage() {
  assertDevAccess();

  return (
    <main className="min-h-dvh bg-surface-light py-12">
      <Container>
        <Headline as="h1" size="hero">
          /dev/textsplit
        </Headline>
        <p className="mt-2 text-text-muted">
          <code>&lt;TextSplit&gt;</code> — desktop: palavra (stagger 25ms);
          tablet/mobile: linha (stagger 80ms); reduced: instant (D-12).
          Use DevTools device emulation pra alternar.
        </p>

        <div className="h-svh" />

        <section className="space-y-12 mt-12">
          <TextSplit
            as="h2"
            text="Likro foi feito exatamente pra sua clínica"
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
          />

          <TextSplit
            as="p"
            text="Sua equipe responde no WhatsApp, agenda no calendário certo e nunca mais perde um lead do Instagram."
            className="max-w-2xl text-lg text-text-secondary leading-relaxed"
          />
        </section>

        <div className="h-svh" />
      </Container>
    </main>
  );
}
