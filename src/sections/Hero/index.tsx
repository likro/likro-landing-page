/**
 * Hero — Phase 3 orchestrator (redesign B: sistema operacional + card stack).
 *
 * Layout: centered editorial (estilo Linear / Attio / Vercel) — headline gigante,
 * sub, CTAs, trust signal, e abaixo composição de 3 cards flutuantes.
 *
 * HERO-02/03: este componente e filhos NÃO importam motion/* — invariantes
 * grep-validados em tests/sections/hero-invariants.test.ts.
 * HERO-04: zero next/image marcada como prioritária aqui — LCP element é o H1 (texto SSR).
 * HERO-05: usa min-h-svh (iOS-safe).
 */
import { Container } from "@/components/ui/container";
import { HeroBackground } from "./HeroBackground";
import { HeroCardStack } from "./HeroCardStack";
import { HeroCopy } from "./HeroCopy";

export function Hero() {
  return (
    <section
      className="relative isolate min-h-svh overflow-hidden bg-surface-darker"
      aria-labelledby="hero-headline"
    >
      <HeroBackground />
      <Container className="relative z-10 flex min-h-svh flex-col justify-start pb-20 pt-16 sm:pt-20 lg:pb-24 lg:pt-24">
        <HeroCopy />
        <HeroCardStack />
      </Container>
    </section>
  );
}
