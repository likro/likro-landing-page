import { assertDevAccess } from "../_components/dev-gate";
import { PlaceholderBlock } from "../_components/placeholder-block";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { ParallaxLayer } from "@/components/motion";

/**
 * /dev/parallax — showcase isolado de <ParallaxLayer> (Phase 2 Plan 05, D-13).
 *
 * Server Component — gate D-15 via assertDevAccess.
 */
export default function DevParallaxPage() {
  assertDevAccess();

  return (
    <main className="min-h-dvh bg-surface-light py-12">
      <Container>
        <Headline as="h1" size="hero">
          /dev/parallax
        </Headline>
        <p className="mt-2 text-text-muted">
          <code>&lt;ParallaxLayer&gt;</code> — magnitudes por tier (D-11):
          mobile=0, tablet=0.5×, desktop=1×. Reduced=0. MOTION-08 conforme.
        </p>

        <div className="h-svh" />

        <section className="space-y-6 mt-12">
          <Headline as="h2" size="section">
            Single layer (magnitude=0.2 default)
          </Headline>
          <ParallaxLayer>
            <PlaceholderBlock
              label="Default"
              caption="magnitude=0.2 (desktop 20px max)"
              size="xl"
              tone="dark"
            />
          </ParallaxLayer>
        </section>

        <section className="space-y-6 mt-24">
          <Headline as="h2" size="section">
            Layered (overlap mostrando profundidade)
          </Headline>
          <div className="relative h-[60svh]">
            <ParallaxLayer magnitude={0.1} className="absolute inset-0">
              <PlaceholderBlock
                label="back"
                caption="magnitude=0.1"
                size="xl"
                tone="tinted"
              />
            </ParallaxLayer>
            <ParallaxLayer
              magnitude={0.3}
              className="absolute inset-x-12 inset-y-12"
            >
              <PlaceholderBlock
                label="front"
                caption="magnitude=0.3"
                size="lg"
                tone="dark"
              />
            </ParallaxLayer>
          </div>
        </section>

        <div className="h-svh" />
      </Container>
    </main>
  );
}
