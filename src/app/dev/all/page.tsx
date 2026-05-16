"use client";

/**
 * /dev/all — showcase combinado das 5 primitivas (Phase 2 Plan 05, D-13).
 *
 * Smoke test antes das seções da Phase 4 — sticky + scrub + parallax
 * co-existindo numa página única. Page é client porque ScrollScene
 * render prop usa useTransform (EXCEÇÃO controlada D-02 / MOTION-05).
 * Gate D-15 aplicado via /dev/all/layout.tsx.
 */

import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
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

const STICKY_SCROLL_OFFSET = ["start start", "end end"] as [string, string];

const STICKY_FACETS = [
  { n: "01", label: "Captura" },
  { n: "02", label: "Atendimento" },
  { n: "03", label: "Conversão" },
  { n: "04", label: "Operação" },
] as const;

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

      {/* Seção 4: StickyStage + ScrollScene compostos — payoff visual contínuo */}
      <ScrollScene offset={STICKY_SCROLL_OFFSET}>
        {(progress) => (
          <StickyStage length="400svh">
            <StickyFacets progress={progress} />
          </StickyStage>
        )}
      </ScrollScene>

      <div className="h-svh grid place-items-center text-text-muted">
        <span>fim</span>
      </div>
    </main>
  );
}

// StickyFacets — composição editorial: label centralizado entre duas linhas
// accent finas, index "0X / 04" em mono acima. Peaks distintos pra cada facet.
function StickyFacets({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const op1 = useTransform(progress, [0,    0.03, 0.21, 0.27], [0.5, 1, 1, 0]);
  const op2 = useTransform(progress, [0.25, 0.31, 0.46, 0.52], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.50, 0.56, 0.71, 0.77], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.75, 0.81, 0.97, 1   ], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0,    0.03, 0.21, 0.27], [16, 0, 0, -16]);
  const y2 = useTransform(progress, [0.25, 0.31, 0.46, 0.52], [16, 0, 0, -16]);
  const y3 = useTransform(progress, [0.50, 0.56, 0.71, 0.77], [16, 0, 0, -16]);
  const y4 = useTransform(progress, [0.75, 0.81, 1   , 1   ], [16, 0, 0,  0]);

  const ambX = useTransform(progress, [0, 1], ["-15%", "20%"]);
  const ambY = useTransform(progress, [0, 1], ["10%", "-10%"]);
  const ambScale = useTransform(progress, [0, 1], [1, 1.25]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-3xl px-6">
          {STICKY_FACETS.map((f) => (
            <div key={f.n} className="text-center space-y-2">
              <div className="text-xs uppercase tracking-[0.28em] text-text-on-dark-secondary tabular-nums">
                {f.n} / 04
              </div>
              <div className="text-3xl sm:text-4xl font-medium tracking-tight">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const animated = [
    { ...STICKY_FACETS[0], op: op1, y: y1 },
    { ...STICKY_FACETS[1], op: op2, y: y2 },
    { ...STICKY_FACETS[2], op: op3, y: y3 },
    { ...STICKY_FACETS[3], op: op4, y: y4 },
  ];

  return (
    <div className="relative h-full w-full bg-surface-dark text-text-on-dark-primary overflow-hidden">
      <motion.div
        aria-hidden
        style={{ x: ambX, y: ambY, scale: ambScale }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[110svh] h-[110svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_55%)] blur-3xl" />
      </motion.div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-full h-[12rem] sm:h-[14rem]">
          {animated.map((f) => (
            <motion.div
              key={f.n}
              style={{ opacity: f.op, y: f.y }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
            >
              <div className="text-xs uppercase tracking-[0.30em] text-text-on-dark-secondary tabular-nums">
                {f.n} <span className="opacity-50">/ 04</span>
              </div>
              <div className="mt-6 flex items-center gap-4 sm:gap-6">
                <span
                  aria-hidden
                  className="h-px w-8 sm:w-14 md:w-20 bg-accent-primary"
                />
                <span className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight whitespace-nowrap leading-none">
                  {f.label}
                </span>
                <span
                  aria-hidden
                  className="h-px w-8 sm:w-14 md:w-20 bg-accent-primary"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
