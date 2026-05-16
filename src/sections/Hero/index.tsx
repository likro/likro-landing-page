/**
 * Hero — Phase 3 orchestrator.
 *
 * D-01/D-02: split assimétrico cinema editorial.
 * D-15: HeroBackground é a ÚNICA fonte de animação no hero (glow pulse).
 * HERO-02/03: este componente e seus filhos NÃO importam motion/* — invariantes
 * grep-validados em tests/sections/hero-invariants.test.ts.
 * HERO-05: usa min-h-svh (NUNCA viewport-screen height utilities).
 *
 * NOTA: <section> E <Container> ambos têm min-h-svh DELIBERADAMENTE.
 *   - <section> precisa min-h-svh pra sustentar o full-bleed background (gradient + glow)
 *     em toda a altura da viewport, mesmo quando o conteúdo for menor.
 *   - <Container> precisa min-h-svh pra que items-center (Grid) vertical-centre
 *     o conteúdo dentro da viewport (não dentro de caixa colapsada).
 *   Remover qualquer um quebra a composição cinematográfica. Não "consolidar".
 */
import { Container } from "@/components/ui/container";
import { HeroBackground } from "./HeroBackground";
import { HeroCopy } from "./HeroCopy";
import { HeroMockup } from "./HeroMockup";

export function Hero() {
  return (
    <section
      className="relative isolate min-h-svh overflow-hidden bg-surface-darker"
      aria-labelledby="hero-headline"
    >
      <HeroBackground />
      {/* min-h-svh no Container é INTENCIONAL: section sustenta bg full-bleed;
          Container vertical-centra conteúdo via items-center. Ver doc block acima. */}
      <Container className="relative z-10 grid min-h-svh items-center gap-12 py-16 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:py-24">
        <HeroCopy />
        <HeroMockup />
      </Container>
    </section>
  );
}
