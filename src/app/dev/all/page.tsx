"use client";

/**
 * /dev/all — showcase combinado das 5 primitivas (Phase 2 Plan 05, D-13).
 *
 * Smoke test antes das seções da Phase 4 — sticky + scrub + parallax
 * co-existindo numa página única. Page é client porque ScrollScene
 * render prop usa useTransform (EXCEÇÃO controlada D-02 / MOTION-05).
 * Gate D-15 aplicado via /dev/all/layout.tsx.
 */

import { motion, useTransform } from "motion/react";
import {
  RevealOnView,
  ParallaxLayer,
  ScrollScene,
  TextSplit,
  StickyStage,
} from "@/components/motion";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { PlaceholderBlock } from "../_components/placeholder-block";

export default function DevAllPage() {
  return (
    <main className="min-h-svh bg-surface-light">
      <Container className="py-12">
        <Headline as="h1" size="hero">
          /dev/all
        </Headline>
        <p className="mt-2 text-text-muted max-w-2xl">
          As 5 primitivas combinadas em scroll único. Objetivo: testar
          interação real (sticky + scrub + parallax co-existindo). Smoke
          test antes das seções da Phase 4.
        </p>
      </Container>

      {/* Spacer */}
      <div className="h-svh" />

      {/* Seção 1: RevealOnView + TextSplit */}
      <Container className="py-24">
        <TextSplit
          as="h2"
          text="Likro para clínicas e estéticas"
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-12"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <RevealOnView delayMs={0}>
            <PlaceholderBlock label="1" caption="reveal" size="lg" tone="dark" />
          </RevealOnView>
          <RevealOnView delayMs={80}>
            <PlaceholderBlock
              label="2"
              caption="reveal · 80ms"
              size="lg"
              tone="tinted"
            />
          </RevealOnView>
          <RevealOnView delayMs={160}>
            <PlaceholderBlock label="3" caption="reveal · 160ms" size="lg" />
          </RevealOnView>
        </div>
      </Container>

      {/* Seção 2: ParallaxLayer com depth */}
      <Container className="py-24">
        <Headline as="h2" size="section" className="mb-8">
          Parallax layered
        </Headline>
        <div className="relative h-[60svh]">
          <ParallaxLayer magnitude={0.1} className="absolute inset-0">
            <PlaceholderBlock label="back" caption="0.1" size="xl" tone="tinted" />
          </ParallaxLayer>
          <ParallaxLayer
            magnitude={0.3}
            className="absolute inset-x-16 inset-y-16"
          >
            <PlaceholderBlock label="front" caption="0.3" size="lg" tone="dark" />
          </ParallaxLayer>
        </div>
      </Container>

      {/* Seção 3: ScrollScene → Bridge-like */}
      <ScrollScene className="my-24">
        {(progress) => {
          // Exceção controlada D-02 / MOTION-05 — useTransform no scope do
          // render prop. Documentado no barrel motion/index.ts.
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(
            progress,
            [0, 0.3, 0.7, 1],
            [0, 1, 1, 0.2],
          );
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(progress, [0, 1], [0.92, 1.08]);
          return (
            <Container>
              <motion.div style={{ opacity, scale }}>
                <PlaceholderBlock
                  label="Bridge"
                  caption="ScrollScene · opacity & scale derived"
                  size="xl"
                  tone="dark"
                />
              </motion.div>
            </Container>
          );
        }}
      </ScrollScene>

      {/* Seção 4: StickyStage com "pilares" — Product-like */}
      <StickyStage length="400svh">
        <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
          <div className="text-center space-y-4 px-6 max-w-lg">
            <div className="text-3xl font-medium tracking-tight">Sticky Stage</div>
            <div className="text-sm uppercase tracking-wider opacity-70">
              length=&quot;400svh&quot; · simula Product 4 pilares
            </div>
            <div className="text-sm text-text-on-dark-secondary mt-4">
              Em produção (Phase 4), aninha um <code>&lt;ScrollScene&gt;</code>{" "}
              aqui derivando o progress para revelar 4 pilares em sequência.
            </div>
          </div>
        </div>
      </StickyStage>

      <div className="h-svh grid place-items-center text-text-muted">
        <span>fim</span>
      </div>
    </main>
  );
}
