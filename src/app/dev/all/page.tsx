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

// StickyFacets — versão refinada (mesma técnica de /dev/sticky Stage B,
// adaptada pra surface dark). Atmosfera única, accent vertical ligado à
// facet ativa, counter mono "0X / 04" no topo.
function StickyFacets({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const op1 = useTransform(progress, [0, 0.05, 0.22, 0.34], [0.6, 1, 1, 0]);
  const op2 = useTransform(progress, [0.20, 0.34, 0.47, 0.58], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.45, 0.58, 0.70, 0.82], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.68, 0.82, 0.97, 1], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0, 0.05, 0.22, 0.34], [20, 0, 0, -20]);
  const y2 = useTransform(progress, [0.20, 0.34, 0.47, 0.58], [20, 0, 0, -20]);
  const y3 = useTransform(progress, [0.45, 0.58, 0.70, 0.82], [20, 0, 0, -20]);
  const y4 = useTransform(progress, [0.68, 0.82, 1, 1], [20, 0, 0, 0]);

  const ambX = useTransform(progress, [0, 1], ["-15%", "20%"]);
  const ambY = useTransform(progress, [0, 1], ["10%", "-10%"]);
  const ambScale = useTransform(progress, [0, 1], [1, 1.25]);

  const accentScaleY = useTransform(progress, [0.05, 0.18], [0, 1]);
  const accentOpacity = useTransform(progress, [0.05, 0.18, 0.97, 1], [0, 1, 1, 0]);
  const counterOpacity = useTransform(progress, [0.05, 0.18, 0.97, 1], [0, 1, 1, 0]);

  const cOp1 = useTransform(progress, [0, 0.05, 0.22, 0.32], [0.6, 1, 1, 0]);
  const cOp2 = useTransform(progress, [0.20, 0.34, 0.47, 0.56], [0, 1, 1, 0]);
  const cOp3 = useTransform(progress, [0.45, 0.58, 0.70, 0.80], [0, 1, 1, 0]);
  const cOp4 = useTransform(progress, [0.68, 0.82, 1, 1], [0, 1, 1, 1]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-3xl px-6">
          {STICKY_FACETS.map((f) => (
            <div key={f.n} className="text-center space-y-2">
              <div className="text-5xl font-medium tracking-tight tabular-nums">
                {f.n}
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-on-dark-secondary">
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

  const counters = [
    { n: "01", op: cOp1 },
    { n: "02", op: cOp2 },
    { n: "03", op: cOp3 },
    { n: "04", op: cOp4 },
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

      <motion.div
        aria-hidden
        style={{ opacity: counterOpacity }}
        className="absolute top-12 left-1/2 -translate-x-1/2 flex items-baseline gap-3 text-text-on-dark-secondary z-20"
      >
        <span className="relative inline-block w-[2ch] text-xs uppercase tracking-[0.22em] tabular-nums">
          {counters.map((c) => (
            <motion.span
              key={c.n}
              style={{ opacity: c.op }}
              className="absolute inset-0"
            >
              {c.n}
            </motion.span>
          ))}
          <span aria-hidden className="opacity-0">01</span>
        </span>
        <span className="text-xs uppercase tracking-[0.22em]">/ 04</span>
      </motion.div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative flex items-center gap-8 sm:gap-12 px-6">
          <motion.div
            aria-hidden
            style={{ scaleY: accentScaleY, opacity: accentOpacity }}
            className="origin-center h-28 sm:h-36 w-px bg-accent-primary shrink-0"
          />
          <div className="relative w-[16ch] h-[14rem] sm:h-[16rem]">
            {animated.map((f) => (
              <motion.div
                key={f.n}
                style={{ opacity: f.op, y: f.y }}
                className="absolute inset-0 flex flex-col justify-center text-left"
              >
                <div className="text-8xl sm:text-9xl font-medium tracking-tight tabular-nums leading-[0.9]">
                  {f.n}
                </div>
                <div className="mt-5 text-xs sm:text-sm uppercase tracking-[0.28em] text-text-on-dark-secondary">
                  {f.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
