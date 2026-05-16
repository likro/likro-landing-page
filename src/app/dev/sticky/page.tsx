"use client";

/**
 * /dev/sticky — showcase isolado de <StickyStage> composto com <ScrollScene>.
 *
 * Phase 2 Plan 05 + tweak pós-validação Plan 06: o pin sem payoff visual era
 * "scroll preso". Agora o progress da rolagem (emitido por ScrollScene) move
 * continuamente vários elementos dentro do StickyStage, com janelas de
 * opacidade/y/scale SOBREPOSTAS — nunca dois estados discretos trocando, sempre
 * transformação em andamento.
 *
 * Brand: roxo Likro só como accent fino (linha de progresso). Atmosfera por
 * gradientes neutros (white/black low-alpha) — gradients de viewport em roxo
 * são proibidos pelo brand book.
 *
 * Esta é a sub-rota MAIS CRÍTICA do plan — onde o RISCO CRÍTICO #3 (smooth-
 * scroll + sticky no iOS) é validado em device real. Gate D-15 via layout.tsx.
 *
 * Imports diretos de motion/react: exceção /dev-only (esta é showcase interna,
 * não seção de produção). Padrão idêntico ao já adotado em /dev/scene e /dev/all.
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
// Stage A — single headline com transformação contínua (entra, segura, sai)
// ─────────────────────────────────────────────────────────────────────────────

function StageA({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  const headlineOpacity = useTransform(
    progress,
    [0, 0.12, 0.85, 1],
    [0, 1, 1, 0],
  );
  const headlineY = useTransform(progress, [0, 0.5, 1], [70, 0, -50]);
  const headlineScale = useTransform(progress, [0, 0.5, 1], [0.92, 1, 1.05]);

  const subOpacity = useTransform(
    progress,
    [0.08, 0.25, 0.75, 1],
    [0, 1, 1, 0],
  );
  const subY = useTransform(progress, [0, 0.5, 1], [90, 8, -30]);

  const lineWidth = useTransform(progress, [0.1, 0.9], ["0%", "55%"]);

  const ambientX = useTransform(progress, [0, 1], ["-15%", "15%"]);
  const ambientY = useTransform(progress, [0, 1], ["20%", "-20%"]);
  const ambientScale = useTransform(progress, [0, 1], [1, 1.3]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
        <div className="text-center space-y-4 px-6">
          <div className="text-5xl sm:text-6xl font-medium tracking-tight">
            Stage A
          </div>
          <div className="text-sm uppercase tracking-wider opacity-70">
            length=&quot;200svh&quot; · 2 viewports pinned
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-surface-dark text-text-on-dark-primary overflow-hidden grid place-items-center">
      <motion.div
        aria-hidden
        style={{ x: ambientX, y: ambientY, scale: ambientScale }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[100svh] h-[100svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_55%)] blur-2xl" />
      </motion.div>

      <div className="relative z-10 text-center space-y-5 px-6">
        <motion.div
          style={{
            opacity: headlineOpacity,
            y: headlineY,
            scale: headlineScale,
          }}
          className="text-6xl sm:text-7xl md:text-8xl font-medium tracking-tight"
        >
          Stage A
        </motion.div>
        <motion.div
          style={{ opacity: subOpacity, y: subY }}
          className="text-sm uppercase tracking-[0.18em] text-text-on-dark-secondary"
        >
          length=&quot;200svh&quot; · 2 viewports pinned
        </motion.div>
        <motion.div
          aria-hidden
          style={{ width: lineWidth }}
          className="mx-auto h-px bg-accent-primary"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage B — 4 facets com janelas de fade SOBREPOSTAS (transformação orgânica
// contínua, NÃO carrossel). Atmosfera neutra animando todo o progress.
// ─────────────────────────────────────────────────────────────────────────────

function StageB({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();

  // Cada facet: fade in -> peak -> fade out, com sobreposição entre adjacentes.
  // Quando 01 está a 0.7 saindo, 02 já está a 0.3 entrando — sem switch discreto.
  const op1 = useTransform(progress, [0, 0.04, 0.20, 0.32], [0.6, 1, 1, 0]);
  const op2 = useTransform(progress, [0.18, 0.32, 0.45, 0.55], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.43, 0.55, 0.68, 0.80], [0, 1, 1, 0]);
  const op4 = useTransform(progress, [0.66, 0.80, 0.97, 1], [0, 1, 1, 1]);

  const y1 = useTransform(progress, [0, 0.04, 0.20, 0.32], [25, 0, 0, -25]);
  const y2 = useTransform(progress, [0.18, 0.32, 0.45, 0.55], [25, 0, 0, -25]);
  const y3 = useTransform(progress, [0.43, 0.55, 0.68, 0.80], [25, 0, 0, -25]);
  const y4 = useTransform(progress, [0.66, 0.80, 1, 1], [25, 0, 0, 0]);

  // Cada facet faz um pequeno "respirar" de scale enquanto está visível
  const sc1 = useTransform(progress, [0, 0.20, 0.32], [0.94, 1, 1.05]);
  const sc2 = useTransform(progress, [0.18, 0.45, 0.55], [0.94, 1, 1.05]);
  const sc3 = useTransform(progress, [0.43, 0.68, 0.80], [0.94, 1, 1.05]);
  const sc4 = useTransform(progress, [0.66, 0.97, 1], [0.94, 1, 1.05]);

  const lineWidth = useTransform(progress, [0, 1], ["0%", "80%"]);

  // Atmosfera neutra — duas camadas se movendo em sentidos opostos = profundidade
  const ambX1 = useTransform(progress, [0, 1], ["-20%", "25%"]);
  const ambY1 = useTransform(progress, [0, 1], ["15%", "-15%"]);
  const ambSc1 = useTransform(progress, [0, 1], [1, 1.35]);
  const ambX2 = useTransform(progress, [0, 1], ["25%", "-15%"]);
  const ambY2 = useTransform(progress, [0, 1], ["-25%", "20%"]);
  const ambSc2 = useTransform(progress, [0, 0.5, 1], [0.85, 1.1, 0.9]);

  if (reduced) {
    return (
      <div className="h-full w-full bg-neutral-100 grid place-items-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl px-6">
          {FACETS.map((f) => (
            <div key={f.n} className="text-center space-y-2">
              <div className="text-5xl font-medium tracking-tight tabular-nums">
                {f.n}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted">
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const animated = [
    { ...FACETS[0], op: op1, y: y1, sc: sc1 },
    { ...FACETS[1], op: op2, y: y2, sc: sc2 },
    { ...FACETS[2], op: op3, y: y3, sc: sc3 },
    { ...FACETS[3], op: op4, y: y4, sc: sc4 },
  ];

  return (
    <div className="relative h-full w-full bg-neutral-100 overflow-hidden grid place-items-center">
      <motion.div
        aria-hidden
        style={{ x: ambX1, y: ambY1, scale: ambSc1 }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[110svh] h-[110svh] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,transparent_55%)] blur-3xl" />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ x: ambX2, y: ambY2, scale: ambSc2 }}
        className="absolute inset-0 grid place-items-center pointer-events-none"
      >
        <div className="w-[80svh] h-[80svh] rounded-full bg-[radial-gradient(circle,rgba(10,10,11,0.06)_0%,transparent_60%)] blur-3xl" />
      </motion.div>

      <div className="relative z-10 grid place-items-center">
        {animated.map((f) => (
          <motion.div
            key={f.n}
            style={{ opacity: f.op, y: f.y, scale: f.sc }}
            className="absolute text-center px-6"
          >
            <div className="text-7xl sm:text-8xl md:text-9xl font-medium tracking-tight tabular-nums text-text-primary leading-none">
              {f.n}
            </div>
            <div className="mt-4 text-sm uppercase tracking-[0.22em] text-text-secondary">
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
