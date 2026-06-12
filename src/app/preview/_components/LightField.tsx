"use client";
/**
 * LightField — "a travessia da luz" (redesign premium, protótipo /preview).
 *
 * NÃO é uma forma (espiral/vórtice) nem uma sequência de efeitos. É UMA matéria
 * única — um campo de luz — se transformando CONTINUAMENTE do primeiro ao último
 * pixel de scroll. Um organismo migrando, não slides trocando.
 *
 * Princípio que garante continuidade (feedback Lenny 2026-06-10):
 *   1. As MESMAS partículas existem a descida inteira (identidade persistente —
 *      nunca recriadas/trocadas em "cenas").
 *   2. A posição de cada uma é uma FUNÇÃO CONTÍNUA da posição do scroll `j` (0→1).
 *      Todo parâmetro (turbulência, frequência espacial, direção, fluxo, migração,
 *      cor, brilho) varia suave e monotonicamente em `j`. As "etapas" da jornada
 *      (caos → direção → fluxos → convergência → clareza → calma) são REGIÕES
 *      desse gradiente, sem bordas — não há switch/if por cena.
 *   3. Scrubbed: o macro é 100% amarrado ao scroll. Parar = descansa num quadro;
 *      rolar = avança. Só uma micro-vida (cintilação + shimmer ~2px) roda no tempo,
 *      pra não virar foto morta. Sem relógio macro = sem loop.
 *
 * Caos→ordem: frio/disperso/turbulento no topo → quente/organizado/calmo no fim.
 * A atmosfera (fundo) evolui junto, dirigida no page.tsx pelo mesmo `progress`.
 *
 * Técnica: canvas 2D leve (NÃO WebGL). Sprite pré-renderizada + additive 'lighter'.
 * Trilha via 'destination-out' (rastro ao rolar; ao parar, colapsa num quadro limpo).
 * Degrada: mobile = menos partículas; reduced = 1 quadro calmo estático, sem loop.
 */
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { useDeviceTier } from "@/hooks/use-device-tier";

interface LightFieldProps {
  /** Posição da travessia 0→1 (vinda do ScrollScene). Scrubbed. */
  progress: MotionValue<number>;
  /** Palco visível? (IntersectionObserver + visibilitychange) — pausa o loop. */
  active?: boolean;
}

type Particle = {
  /** Estado de caos (frações do canvas) — disperso, pode vazar a viewport. */
  chaosX: number;
  chaosY: number;
  /** Estado de ordem/calma — faixas de luz calmas (frações). */
  homeX: number;
  homeY: number;
  seed: number; // varia o campo de fluxo por partícula
  depth: number; // 0.4..1 — parallax/alpha/tamanho
  size: number; // px base antes de depth
  accent: boolean; // corre pro roxo Likro na ordem
};

const TIER_COUNT: Record<"reduced" | "mobile" | "tablet" | "desktop", number> = {
  reduced: 150,
  mobile: 110,
  tablet: 170,
  desktop: 230,
};

const BANDS = 5; // faixas calmas do estado final (ordem)
const PALETTE_STEPS = 8;
const TEX = 64;
const TRAIL_FADE = 0.2;

const COLD: [number, number, number] = [150, 170, 200];
const WARM: [number, number, number] = [255, 220, 185];
const ACCENT: [number, number, number] = [178, 150, 255];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
/** smootherstep — migração suave sem início/fim abruptos. */
function smoother(x: number): number {
  x = clamp01(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function lerpRGB(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

function makeSprite(rgb: [number, number, number]): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TEX;
  c.height = TEX;
  const g = c.getContext("2d");
  if (g) {
    const [r, gr, b] = rgb;
    const grad = g.createRadialGradient(
      TEX / 2,
      TEX / 2,
      0,
      TEX / 2,
      TEX / 2,
      TEX / 2,
    );
    grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
    grad.addColorStop(0.25, `rgba(${r},${gr},${b},0.55)`);
    grad.addColorStop(0.55, `rgba(${r},${gr},${b},0.16)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, TEX, TEX);
  }
  return c;
}
function makePalette(target: [number, number, number]): HTMLCanvasElement[] {
  return Array.from({ length: PALETTE_STEPS }, (_, i) =>
    makeSprite(lerpRGB(COLD, target, i / (PALETTE_STEPS - 1))),
  );
}

export function LightField({ progress, active = true }: LightFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useDeviceTier();
  const progressRef = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    progressRef.current = progress.get();
    const unsub = progress.on("change", (v) => {
      progressRef.current = v;
    });
    return unsub;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = tier === "reduced";
    const pointerEnabled = tier === "desktop" || tier === "tablet";
    const count = TIER_COUNT[tier];

    const warmPalette = makePalette(WARM);
    const accentPalette = makePalette(ACCENT);

    // ── Partículas: estado de caos + estado de ordem (faixas calmas) ──
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const band = i % BANDS;
      const bandCenter = 0.34 + band * (0.38 / (BANDS - 1)); // 0.34..0.72
      return {
        chaosX: Math.random(),
        chaosY: -0.12 + Math.random() * 1.24,
        homeX: 0.04 + Math.random() * 0.92,
        homeY: bandCenter + (Math.random() - 0.5) * 0.06,
        seed: Math.random() * 1000,
        depth: 0.4 + Math.random() * 0.6,
        size: 7 + Math.random() * 15,
        accent: Math.random() < 0.16,
      };
    });

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      // Luz borrada (sem borda nítida) → DPR baixo é indistinguível e corta o
      // custo de fill/blend por frame (anti-jank).
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pointer = { x: -9999, y: -9999, active: false };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    /**
     * Posição contínua da partícula em função de `j` (scrubbed) + micro-tempo `t`.
     * Uma única função morfa caos→ordem; o caráter do campo de fluxo evolui com j:
     *  - frequência espacial cai (alta=caos turbulento → baixa=fluxo laminar)
     *  - amplitude do fluxo tem pico no meio (fluxos se formando / convergência)
     *  - deriva direcional emerge no meio (surgimento de direção)
     *  - migração caos→home cresce monotonicamente (dispersão → organização)
     */
    const drawFrame = (j: number, t: number, animate: boolean) => {
      const md = Math.min(w, h);

      if (animate) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${TRAIL_FADE})`;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "lighter";

      const e = smoother(j); // migração caos→home
      const freq = lerp(7.5, 1.4, j); // espacial: caótico → laminar
      const ampChaos = 0.052 * (1 - j); // jitter de caos some
      const ampFlow = 0.092 * Math.sin(clamp01(j) * Math.PI); // fluxo: pico no meio
      const amp = ampChaos + ampFlow;
      const dir = 0.045 * Math.sin(clamp01(j) * Math.PI); // direção emerge no meio
      const pIdx = Math.round(clamp01(j) * (PALETTE_STEPS - 1));
      const micro = animate ? md * 0.0016 : 0; // shimmer ~2px (micro-vida)
      const bright = smoother(j); // brilho/calor sobem com a ordem

      for (const part of particles) {
        // Base: migração contínua entre caos e ordem.
        const bx = lerp(part.chaosX, part.homeX, e);
        const by = lerp(part.chaosY, part.homeY, e);

        // Campo de fluxo (curl-ish) cujo caráter evolui com j → narrativa contínua.
        const fx =
          (Math.sin(by * freq + part.seed + j * 3) -
            0.5 * Math.sin(by * freq * 0.5 - part.seed)) *
            amp +
          dir;
        const fy = Math.cos(bx * freq * 0.9 - j * 2 + part.seed) * amp * 0.62;

        let x = (bx + fx) * w + Math.sin(t * 0.6 + part.seed) * micro;
        let y = (by + fy) * h + Math.cos(t * 0.5 + part.seed * 1.3) * micro;

        // Atração sutil ao cursor (a luz se junta perto de você).
        if (animate && pointerEnabled && pointer.active) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          const dist = Math.hypot(dx, dy) || 1;
          const R = 170;
          const infl = Math.exp(-(dist * dist) / (2 * R * R)) * 26 * part.depth;
          x += (dx / dist) * infl;
          y += (dy / dist) * infl;
        }

        const twinkle = animate ? 0.82 + 0.18 * Math.sin(t * 1.5 + part.seed) : 1;
        const alpha = Math.min(
          0.68,
          lerp(0.14, part.accent ? 0.5 : 0.56, bright) * part.depth * twinkle,
        );
        const d = part.size * part.depth * (0.7 + 0.45 * bright);
        const palette = part.accent ? accentPalette : warmPalette;
        const sprite = palette[pIdx] ?? palette[palette.length - 1];
        if (!sprite) continue;

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    // reduced-motion: 1 quadro calmo estático (estado de ordem), sem loop.
    if (reduced) {
      drawFrame(0.92, 0, false);
      const onResizeStatic = () => {
        resize();
        drawFrame(0.92, 0, false);
      };
      window.addEventListener("resize", onResizeStatic, { passive: true });
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    if (pointerEnabled) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onLeave, { passive: true });
      window.addEventListener("blur", onLeave, { passive: true });
    }
    window.addEventListener("resize", resize, { passive: true });

    let raf = 0;
    const loop = (ts: number) => {
      raf = window.requestAnimationFrame(loop);
      if (!activeRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      const j = clamp01(progressRef.current);
      drawFrame(j, ts * 0.001, true);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (pointerEnabled) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
        window.removeEventListener("blur", onLeave);
      }
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
