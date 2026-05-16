"use client";

/**
 * /dev/sticky — showcase isolado de <StickyStage> composto com <ScrollScene>.
 *
 * Iteração v2 (pós-validação real-device + feedback "mais clean e atraente"):
 * - Atmosfera reduzida a UMA camada (dropou a 2a blob que competia com conteúdo).
 * - Scale "respirando" removido (parecia mecânico).
 * - Progress bar genérica trocada por accent vertical ligado à facet ativa
 *   (acent vive com o conteúdo, não em chrome separado).
 * - Indicador "01 / 04" em monospace pra sensação de operação/dashboard.
 * - Typography mais confiante: numbers maiores, label com tracking expandido.
 *
 * Brand: roxo Likro só como accent fino (linha vertical ao lado da facet).
 * Atmosfera por gradientes neutros — gradients de viewport em roxo proibidos.
 *
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
  { n: "01", label: "Captura" },
  { n: "02", label: "Atendimento" },
  { n: "03", label: "Conversão" },
  { n: "04", label: "Operação" },
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
          <StickyStage length="400svh">
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
// ─────────────────────────────────────────────────────────────────────────────

function StageA({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const headlineOpacity = useTransform(progress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const headlineY = useTransform(progress, [0, 0.5, 1], [60, 0, -40]);

  const subOpacity = useTransform(progress, [0.10, 0.28, 0.78, 1], [0, 1, 1, 0]);
  const subY = useTransform(progress, [0, 0.5, 1], [70, 6, -25]);

  // Pequeno traço accent que cresce VERTICALMENTE ao lado da headline
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
// Stage B — 4 facets com fade SOBREPOSTO. Atmosfera única, accent vertical
// ligado à facet ativa, indicador "01 / 04" em mono.
// ─────────────────────────────────────────────────────────────────────────────

function StageB({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  // Janelas sobrepostas — adjacentes cruzam sem switch discreto
  const op1 = useTransform(progress, [0, 0.05, 0.22, 0.34], [0.6, 1, 1, 0]);
  const op2 = useTransform(progress, [0.20, 0.34, 0.47, 0.58], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.45, 0.58, 0.70, 0.82], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.68, 0.82, 0.97, 1], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0, 0.05, 0.22, 0.34], [20, 0, 0, -20]);
  const y2 = useTransform(progress, [0.20, 0.34, 0.47, 0.58], [20, 0, 0, -20]);
  const y3 = useTransform(progress, [0.45, 0.58, 0.70, 0.82], [20, 0, 0, -20]);
  const y4 = useTransform(progress, [0.68, 0.82, 1, 1], [20, 0, 0, 0]);

  // Atmosfera ÚNICA — uma camada só, drift lento
  const ambX = useTransform(progress, [0, 1], ["-15%", "20%"]);
  const ambY = useTransform(progress, [0, 1], ["10%", "-10%"]);
  const ambScale = useTransform(progress, [0, 1], [1, 1.25]);

  // Accent vertical único (vive ao lado da facet ativa, anima junto)
  const accentScaleY = useTransform(progress, [0.05, 0.18], [0, 1]);
  const accentOpacity = useTransform(progress, [0.05, 0.18, 0.97, 1], [0, 1, 1, 0]);

  // Counter mono "01 / 04" — interpola entre os números conforme progress
  const counterOpacity = useTransform(progress, [0.05, 0.18, 0.97, 1], [0, 1, 1, 0]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-neutral-100 grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-3xl px-6">
          {FACETS.map((f) => (
            <div key={f.n} className="text-center space-y-2">
              <div className="text-5xl font-medium tracking-tight tabular-nums">
                {f.n}
              </div>
              <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
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
      {/* Atmosfera única — clareia o centro com drift lento */}
      <motion.div
        aria-hidden
        style={{ x: ambX, y: ambY, scale: ambScale }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[110svh] h-[110svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.75)_0%,transparent_55%)] blur-3xl" />
      </motion.div>

      {/* Counter "0X / 04" no topo (mono, tabular) */}
      <motion.div
        aria-hidden
        style={{ opacity: counterOpacity }}
        className="absolute top-12 left-1/2 -translate-x-1/2 flex items-baseline gap-3 text-text-muted z-20"
      >
        <CurrentFacetIndex progress={progress} />
        <span className="text-xs uppercase tracking-[0.22em]">/ 04</span>
      </motion.div>

      {/* Stack central — accent vertical à esquerda, facets centralizadas */}
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
                <div className="text-8xl sm:text-9xl font-medium tracking-tight tabular-nums text-text-primary leading-[0.9]">
                  {f.n}
                </div>
                <div className="mt-5 text-xs sm:text-sm uppercase tracking-[0.28em] text-text-secondary">
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

// Counter "01" → "02" → "03" → "04" sincronizado com a facet visível.
// Usa o mesmo progress; em vez de animar valor, swap visual com fade.
function CurrentFacetIndex({ progress }: { progress: MotionValue<number> }) {
  const op1 = useTransform(progress, [0, 0.05, 0.22, 0.32], [0.6, 1, 1, 0]);
  const op2 = useTransform(progress, [0.20, 0.34, 0.47, 0.56], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.45, 0.58, 0.70, 0.80], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.68, 0.82, 1, 1], [0, 1, 1, 1]);

  return (
    <span className="relative inline-block w-[2ch] text-xs uppercase tracking-[0.22em] tabular-nums">
      {[
        { n: "01", op: op1 },
        { n: "02", op: op2 },
        { n: "03", op: op3 },
        { n: "04", op: op4 },
      ].map((f) => (
        <motion.span
          key={f.n}
          style={{ opacity: f.op }}
          className="absolute inset-0"
        >
          {f.n}
        </motion.span>
      ))}
      {/* Reserva espaço sem ocupar visualmente */}
      <span aria-hidden className="opacity-0">01</span>
    </span>
  );
}
