import { assertDevAccess } from "../_components/dev-gate";
import { PlaceholderBlock } from "../_components/placeholder-block";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { RevealOnView } from "@/components/motion";

/**
 * /dev/reveal — showcase isolado de <RevealOnView> (Phase 2 Plan 05, D-13).
 *
 * Server Component — gate D-15 via assertDevAccess. As primitivas usadas
 * são client (RevealOnView marca "use client" internamente).
 */
export default function DevRevealPage() {
  assertDevAccess();

  return (
    <main className="min-h-dvh bg-surface-light py-12">
      <Container>
        <Headline as="h1" size="hero">
          /dev/reveal
        </Headline>
        <p className="mt-2 text-text-muted">
          <code>&lt;RevealOnView&gt;</code> — adapta distance/duration por tier (D-10).
          Toggle <em>prefers-reduced-motion</em> no OS → render direto sem motion.
          Emule mobile/tablet/desktop via DevTools para ver matriz completa.
        </p>

        {/* Espaço pra forçar primeiro scroll antes de entrar no viewport */}
        <div className="h-svh" />

        <section className="space-y-6 mt-12">
          <Headline as="h2" size="section">
            Single reveal
          </Headline>
          <RevealOnView>
            <PlaceholderBlock
              label="A"
              caption="RevealOnView default · once=true"
              size="lg"
              tone="dark"
            />
          </RevealOnView>
        </section>

        <section className="space-y-6 mt-24">
          <Headline as="h2" size="section">
            Manual stagger (3 siblings com delayMs)
          </Headline>
          <div className="grid gap-4 sm:grid-cols-3">
            <RevealOnView delayMs={0}>
              <PlaceholderBlock label="1" caption="delay 0ms" size="md" />
            </RevealOnView>
            <RevealOnView delayMs={80}>
              <PlaceholderBlock label="2" caption="delay 80ms" size="md" />
            </RevealOnView>
            <RevealOnView delayMs={160}>
              <PlaceholderBlock label="3" caption="delay 160ms" size="md" />
            </RevealOnView>
          </div>
        </section>

        <section className="space-y-6 mt-24">
          <Headline as="h2" size="section">
            Repeat=true (re-anima ao re-entrar)
          </Headline>
          <RevealOnView repeat>
            <PlaceholderBlock
              label="R"
              caption="repeat=true · scrollar pra cima/baixo"
              size="lg"
              tone="tinted"
            />
          </RevealOnView>
        </section>

        {/* Espaço final pra permitir scroll completo das demos */}
        <div className="h-svh" />
      </Container>
    </main>
  );
}
