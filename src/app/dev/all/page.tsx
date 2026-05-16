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

// StickyFacets — surface dark com 4 facets em fade sobreposto contínuo.
// Mesma técnica do /dev/sticky Stage B, adaptada pra surface escura.
function StickyFacets({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const op1 = useTransform(progress, [0, 0.04, 0.20, 0.32], [0.6, 1, 1, 0]);
  const op2 = useTransform(progress, [0.18, 0.32, 0.45, 0.55], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.43, 0.55, 0.68, 0.80], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.66, 0.80, 0.97, 1], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0, 0.04, 0.20, 0.32], [25, 0, 0, -25]);
  const y2 = useTransform(progress, [0.18, 0.32, 0.45, 0.55], [25, 0, 0, -25]);
  const y3 = useTransform(progress, [0.43, 0.55, 0.68, 0.80], [25, 0, 0, -25]);
  const y4 = useTransform(progress, [0.66, 0.80, 1, 1], [25, 0, 0, 0]);

  const sc1 = useTransform(progress, [0, 0.20, 0.32], [0.94, 1, 1.05]);
  const sc2 = useTransform(progress, [0.18, 0.45, 0.55], [0.94, 1, 1.05]);
  const sc3 = useTransform(progress, [0.43, 0.68, 0.80], [0.94, 1, 1.05]);
  const sc4 = useTransform(progress, [0.66, 0.97, 1], [0.94, 1, 1.05]);

  const lineWidth = useTransform(progress, [0, 1], ["0%", "80%"]);

  const ambX1 = useTransform(progress, [0, 1], ["-20%", "25%"]);
  const ambY1 = useTransform(progress, [0, 1], ["15%", "-15%"]);
  const ambSc1 = useTransform(progress, [0, 1], [1, 1.35]);
  const ambX2 = useTransform(progress, [0, 1], ["25%", "-15%"]);
  const ambY2 = useTransform(progress, [0, 1], ["-25%", "20%"]);
  const ambSc2 = useTransform(progress, [0, 0.5, 1], [0.85, 1.1, 0.9]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl px-6">
          {STICKY_FACETS.map((f) => (
            <div key={f.n} className="text-center space-y-2">
              <div className="text-5xl font-medium tracking-tight tabular-nums">
                {f.n}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-on-dark-secondary">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const animated = [
    { ...STICKY_FACETS[0], op: op1, y: y1, sc: sc1 },
    { ...STICKY_FACETS[1], op: op2, y: y2, sc: sc2 },
    { ...STICKY_FACETS[2], op: op3, y: y3, sc: sc3 },
    { ...STICKY_FACETS[3], op: op4, y: y4, sc: sc4 },
  ];

  return (
    <div className="relative h-full w-full bg-surface-dark text-text-on-dark-primary overflow-hidden grid place-items-center">
      <motion.div
        aria-hidden
        style={{ x: ambX1, y: ambY1, scale: ambSc1 }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[110svh] h-[110svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_55%)] blur-3xl" />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x: ambX2, y: ambY2, scale: ambSc2 }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[80svh] h-[80svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_60%)] blur-3xl" />
      </motion.div>

      <div className="relative z-10 grid place-items-center">
        {animated.map((f) => (
          <motion.div
            key={f.n}
            style={{ opacity: f.op, y: f.y, scale: f.sc }}
            className="absolute text-center px-6"
          >
            <div className="text-7xl sm:text-8xl md:text-9xl font-medium tracking-tight tabular-nums leading-none">
              {f.n}
            </div>
            <div className="mt-4 text-sm uppercase tracking-[0.22em] text-text-on-dark-secondary">
              {f.label}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        aria-hidden
        style={{ width: lineWidth }}
        className="absolute bottom-12 left-[10%] h-px bg-accent-primary"
      />
    </div>
  );
}
