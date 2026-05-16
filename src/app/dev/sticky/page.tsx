"use client";

/**
 * /dev/sticky — showcase isolado de <StickyStage> composto com <ScrollScene>.
 *
 * Iteração v3 (pós-feedback "achei feia, 02 não aparece"):
 * - Composição editorial: label vira o protagonista (palavra grande centralizada
 *   entre duas linhas accent finas). Index "0X / 04" pequeno em mono no topo.
 * - Curvas com peaks distintos e menos overlap apertado (cada facet tem janela
 *   clara de ~16% só dela). Resolve "02 some na crossfade".
 * - Drop: counter no topo do stage (redundante com index dentro de cada facet),
 *   linha vertical lateral, coluna 16ch fixa que estava cortando "ATENDIMENTO".
 *
 * Brand: roxo Likro só nas duas linhas accent finas. Atmosfera neutra única.
 * Gate D-15 via layout.tsx. Imports diretos de motion/react: exceção /dev-only.
 */

import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ScrollScene, StickyStage } from "@/components/motion";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";

const SCROLL_OFFSET = ["start start", "end end"] as [string, string];

const FACETS = [
  { idx: "01", label: "Captura" },
  { idx: "02", label: "Atendimento" },
  { idx: "03", label: "Conversão" },
  { idx: "04", label: "Operação" },
] as const;

export default function DevStickyPage() {
  return (
    <main className="min-h-svh bg-surface-light">
      <Container className="py-12">
        <Headline as="h1" size="hero">
          /dev/sticky
        </Headline>
        <p className="mt-2 text-text-muted max-w-2xl">
          <code>&lt;StickyStage&gt;</code> + <code>&lt;ScrollScene&gt;</code>{" "}
          compostos — o pin tem payoff visual contínuo derivado do progress da
          rolagem (sem slideshow, sem switches discretos). Validação real-device
          é mandatória aqui.
        </p>
        <ul className="mt-4 text-sm text-text-muted list-disc list-inside space-y-1">
          <li>
            Stage permanece pinado durante toda a extensão de{" "}
            <code>length</code>
          </li>
          <li>SEM release prematuro</li>
          <li>SEM jump horizontal</li>
          <li>iOS: SEM address bar pulando o conteúdo</li>
          <li>Reduced motion: estrutura preservada, animação pausada (D-09)</li>
        </ul>
      </Container>

      <div className="h-svh grid place-items-center text-text-muted">
        <span>↓ scrolla pra ver o pin ↓</span>
      </div>

      <ScrollScene offset={SCROLL_OFFSET}>
        {(progress) => (
          <StickyStage length="200svh">
            <StageA progress={progress} />
          </StickyStage>
        )}
      </ScrollScene>

      <div className="h-svh grid place-items-center text-text-muted">
        <span>↓ próximo stage ↓</span>
      </div>

      <ScrollScene offset={SCROLL_OFFSET}>
        {(progress) => (
          <StickyStage length="500svh">
            <StageB progress={progress} />
          </StickyStage>
        )}
      </ScrollScene>

      <div className="h-svh grid place-items-center text-text-muted">
        <span>após Stage B — release confirmado</span>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage A — headline única, transformação contínua, fundo limpo
// (mantido — feedback "resto top")
// ─────────────────────────────────────────────────────────────────────────────

function StageA({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const headlineOpacity = useTransform(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const headlineY = useTransform(progress, [0, 0.5, 1], [60, 0, -40]);
  const subOpacity = useTransform(progress, [0.10, 0.28, 0.78, 1], [0, 1, 1, 0]);
  const subY = useTransform(progress, [0, 0.5, 1], [70, 6, -25]);
  const accentScaleY = useTransform(progress, [0.15, 0.55], [0, 1]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
        <div className="text-center space-y-4 px-6">
          <div className="text-6xl sm:text-7xl font-medium tracking-tight">
            Stage A
          </div>
          <div className="text-xs uppercase tracking-[0.22em] opacity-70">
            length=&quot;200svh&quot; · 2 viewports pinned
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-surface-dark text-text-on-dark-primary overflow-hidden grid place-items-center">
      <div className="relative z-10 flex items-center gap-6 px-6">
        <motion.div
          aria-hidden
          style={{ scaleY: accentScaleY }}
          className="origin-center h-24 sm:h-28 w-px bg-accent-primary"
        />
        <div className="text-left space-y-4">
          <motion.div
            style={{ opacity: headlineOpacity, y: headlineY }}
            className="text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight"
          >
            Stage A
          </motion.div>
          <motion.div
            style={{ opacity: subOpacity, y: subY }}
            className="text-xs uppercase tracking-[0.22em] text-text-on-dark-secondary"
          >
            length=&quot;200svh&quot; · 2 viewports pinned
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage B — facets editorial: label centralizado entre 2 linhas accent finas.
// Peaks distintos e claros pra cada facet ter "tempo de tela" sozinha.
// ─────────────────────────────────────────────────────────────────────────────

function StageB({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  // Curvas v4: 01 começa em opacidade 0 (precisa de entrada visível, não
  // estar "já lá" quando o pin trava). Cada facet: 6% intro + 13% peak solid
  // + 5% exit + 1% kiss com a próxima. Pin 500svh dá ~125svh de scroll por
  // facet = ~2s sólidos no ritmo normal de leitura.
  const op1 = useTransform(progress, [0,    0.06, 0.19, 0.25], [0, 1, 1, 0]);
  const op2 = useTransform(progress, [0.24, 0.30, 0.44, 0.50], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.49, 0.55, 0.69, 0.75], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.74, 0.80, 0.97, 1   ], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0,    0.06, 0.19, 0.25], [18, 0, 0, -18]);
  const y2 = useTransform(progress, [0.24, 0.30, 0.44, 0.50], [18, 0, 0, -18]);
  const y3 = useTransform(progress, [0.49, 0.55, 0.69, 0.75], [18, 0, 0, -18]);
  const y4 = useTransform(progress, [0.74, 0.80, 1   , 1   ], [18, 0, 0,  0]);

  // Atmosfera mínima (drift quase imperceptível pra não competir com o conteúdo)
  const ambX = useTransform(progress, [0, 1], ["-8%", "8%"]);
  const ambY = useTransform(progress, [0, 1], ["6%", "-6%"]);
  const ambScale = useTransform(progress, [0, 1], [1, 1.12]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-neutral-100 grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-3xl px-6">
          {FACETS.map((f) => (
            <div key={f.idx} className="text-center space-y-2">
              <div className="text-xs uppercase tracking-[0.28em] text-text-muted tabular-nums">
                {f.idx} / 04
              </div>
              <div className="text-3xl sm:text-4xl font-medium tracking-tight text-text-primary">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const animated = [
    { ...FACETS[0], op: op1, y: y1 },
    { ...FACETS[1], op: op2, y: y2 },
    { ...FACETS[2], op: op3, y: y3 },
    { ...FACETS[3], op: op4, y: y4 },
  ];

  return (
    <div className="relative h-full w-full bg-neutral-100 overflow-hidden">
      <motion.div
        aria-hidden
        style={{ x: ambX, y: ambY, scale: ambScale }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[110svh] h-[110svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75)_0%,transparent_55%)] blur-3xl" />
      </motion.div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-full h-[12rem] sm:h-[14rem]">
          {animated.map((f) => (
            <motion.div
              key={f.idx}
              style={{ opacity: f.op, y: f.y }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 sm:gap-6 px-6"
            >
              <div className="text-xs uppercase tracking-[0.30em] text-text-muted tabular-nums">
                {f.idx} <span className="opacity-50">/ 04</span>
              </div>
              <div className="text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight text-text-primary whitespace-nowrap leading-none">
                {f.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
