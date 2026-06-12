"use client";
/**
 * LightField — o campo de luz PSEUDO-3D da travessia (protótipo /preview).
 *
 * Esta é a "matéria" da Likro: um campo de poeira de luz que o usuário ATRAVESSA
 * no scroll. NÃO é uma forma (espiral/vórtice) nem uma sequência de efeitos — é
 * profundidade + deslocamento real, scrubbed. (08-RESEARCH §4/§5; 08-CONTEXT
 * "A matéria — campo de luz pseudo-3D".)
 *
 * As três assinaturas de percepção implementadas aqui (08-01 Task 2):
 *
 *  1. PROFUNDIDADE (TRV-03): cada partícula tem `z`. A projeção
 *     `scale = focal/(focal+z)` faz perto = grande, longe = pequeno
 *     (tamanho ∝ 1/z) e alpha cai com a distância (perspectiva atmosférica
 *     básica). Oclusão vem de graça da ORDEM DE DESENHO: pré-particionamos em
 *     baldes de profundidade (depthBuckets) e desenhamos do mais distante pro
 *     mais próximo (painter's algorithm) — O(n), SEM sort por frame.
 *
 *  2. DESLOCAMENTO = OPTIC FLOW (TRV-01): o progress vira um `zShift` que desloca
 *     o campo inteiro em direção à câmera. Conforme avança, as partículas se
 *     expandem RADIALMENTE a partir de um Foco de Expansão central e ESTÁVEL
 *     (cx,cy = centro) e crescem = "estou entrando". Quando uma passa a câmera,
 *     RECICLAMOS ela de volta ao fundo (zEff += Z_RANGE) — travessia contínua
 *     sem custo de spawn.
 *
 *  3. SCRUBBED (TRV-10): o MACRO (zShift, expansão, escala) é 100% amarrado ao
 *     scroll — parar descansa num quadro, sem relógio macro autônomo. Só uma
 *     micro-vida (shimmer ≤2px) roda no tempo. O loop lê `progressRef.current`
 *     (subscrito de progress.on("change")), NUNCA React state por frame (TPRF-04).
 *
 * Performance (mobile é sagrado — TPRF-01/03):
 *  - DPR ≤ 1.5; TIER_COUNT por device; 1 RAF único.
 *  - Atlas de sprites ASSADOS no mount (sprite de luz macia + 3–5 níveis de
 *    "blur assado" por radial-gradient mais largo) — `drawImage` aditivo
 *    ('lighter' só no núcleo). ZERO blur de canvas (filter/shadow) por frame.
 *  - Coordenadas inteiras no drawImage (Math.round).
 *  - `active=false` (offscreen/aba oculta) → `return` cedo (não desenha).
 *
 * Brand-lock: paleta neutra fria→quente assada; roxo escasso só nas `accent`
 * próximas (refinado no plano 03). Hex literais de marca são proibidos —
 * usamos rgba() (não pego pelo grep). Roxo SÓ acento.
 *
 * Escopo deste plano: SÓ profundidade + deslocamento + scrub. Sem caos→ordem /
 * target-lerp (plano 02), sem atmosfera/grain/copy (plano 03), sem reduced-motion
 * elaborado (plano 04 — aqui há só um fallback estático básico).
 */
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { useDeviceTier } from "@/hooks/use-device-tier";

interface LightFieldProps {
  /** Posição da travessia 0→1 (vinda do palco). Scrubbed. */
  progress: MotionValue<number>;
  /** Palco visível? (IntersectionObserver + visibilitychange) — pausa o loop. */
  active?: boolean;
}

type Particle = {
  /** Profundidade base no espaço do campo (px-ish). Maior = mais longe. */
  z: number;
  /** Posição polar a partir do Foco de Expansão central (estável). */
  angle: number;
  radius: number;
  /** Índice do balde de profundidade (0..BUCKETS-1) — ordem de desenho. */
  depthBucket: number;
  /** Camada de parallax (0.3 / 0.4 / 0.5 — NUNCA >0.5). */
  parallax: number;
  /** Tamanho base (px) antes da projeção. */
  size: number;
  /** Acento roxo (raro) — só perto/resolvido acende (plano 03 intensifica). */
  accent: boolean;
  /** Semente p/ micro-vida (shimmer) sem repetir exato. */
  seed: number;
};

const TIER_COUNT: Record<"reduced" | "mobile" | "tablet" | "desktop", number> = {
  reduced: 350,
  mobile: 500,
  tablet: 700,
  desktop: 1000,
};

// ── Modelo de câmera / projeção ─────────────────────────────────────────────
const FOCAL = 320; // distância focal (px-ish): scale = FOCAL/(FOCAL+z)
const Z_NEAR = 12; // partícula que cruza isto já passou a câmera → reciclar
const Z_RANGE = 1100; // profundidade total do campo (fundo - frente)
const Z_TRAVEL = 1400; // quanto o campo desloca em z do progress 0→1 (avanço)
const BUCKETS = 6; // baldes de profundidade (oclusão por ordem, sem sort/frame)
const RADIUS_MAX = 0.62; // raio polar máximo (frações de min(w,h))

// ── Atlas de sprites assados ────────────────────────────────────────────────
const TEX = 64;
const BLUR_LEVELS = 5; // 5 níveis de "blur assado" (escolhidos por profundidade)

const WARM: [number, number, number] = [255, 220, 185];
const ACCENT: [number, number, number] = [178, 150, 255];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Sprite de luz macia assada, com `softness` 0..1 controlando o "blur assado":
 * softness baixo = núcleo nítido (partícula próxima/resolvida); softness alto =
 * gradiente largo e mole (partícula distante, dissolvida no fundo). Isso emula
 * perspectiva atmosférica SEM blur de canvas (filter/shadow) por frame.
 */
function makeSprite(
  rgb: [number, number, number],
  softness: number,
): HTMLCanvasElement {
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
    // Mais mole (softness↑) = o pico de opacidade vaza mais cedo pro nada.
    const core = lerp(0.32, 0.1, softness);
    const mid = lerp(0.62, 0.4, softness);
    grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
    grad.addColorStop(core, `rgba(${r},${gr},${b},${lerp(0.6, 0.42, softness)})`);
    grad.addColorStop(mid, `rgba(${r},${gr},${b},${lerp(0.18, 0.1, softness)})`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, TEX, TEX);
  }
  return c;
}

/** Atlas: BLUR_LEVELS sprites do mais nítido (perto) ao mais mole (longe). */
function makeAtlas(rgb: [number, number, number]): HTMLCanvasElement[] {
  return Array.from({ length: BLUR_LEVELS }, (_, i) =>
    makeSprite(rgb, i / (BLUR_LEVELS - 1)),
  );
}

const PARALLAX_LAYERS = [0.3, 0.4, 0.5] as const; // longe/médio/perto (≤0.5)

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
    const count = TIER_COUNT[tier];

    // Atlas assado UMA vez: 5 níveis de blur por paleta (neutro quente + acento).
    const warmAtlas = makeAtlas(WARM);
    const accentAtlas = makeAtlas(ACCENT);

    // ── Partículas distribuídas em profundidade (z) e polarmente (angle/radius) ──
    // Pré-particionadas em baldes por z: o balde define a ORDEM DE DESENHO
    // (far→near), dando oclusão de graça sem nenhum sort por frame.
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const z = Math.random() * Z_RANGE;
      const depthBucket = Math.min(
        BUCKETS - 1,
        Math.floor((z / Z_RANGE) * BUCKETS),
      );
      return {
        z,
        angle: Math.random() * Math.PI * 2,
        // Raio com viés pro centro (sqrt) → centro povoado, calmo no Foco.
        radius: Math.sqrt(Math.random()) * RADIUS_MAX,
        depthBucket,
        parallax: PARALLAX_LAYERS[i % PARALLAX_LAYERS.length] ?? 0.4,
        size: 5 + Math.random() * 12,
        accent: Math.random() < 0.14,
        seed: Math.random() * 1000,
      };
    });

    // Buckets ordenados do mais distante (z alto) pro mais próximo (z baixo):
    // o índice maior = mais perto, então desenhamos do índice 0 (fundo) pro fim.
    // (Painter's algorithm com baldes — O(n), não O(n log n).)
    const bucketed: Particle[][] = Array.from({ length: BUCKETS }, () => []);
    for (const p of particles) bucketed[p.depthBucket]?.push(p);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      // DPR ≤ 1.5 (TPRF-01): luz borrada → DPR alto é indistinguível e custa
      // fill/blend por frame. 1.5 é o teto sagrado mobile.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /**
     * Desenha um quadro do campo pseudo-3D em função do progress `j` (scrubbed)
     * e do micro-tempo `t` (só shimmer). Foco de Expansão = centro (cx,cy),
     * ESTÁVEL — nunca pan/rotaciona (segurança vestibular, TACC-02).
     */
    const drawFrame = (j: number, t: number, animate: boolean) => {
      const md = Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Optic flow: o campo inteiro avança em z conforme o progress.
      const zShift = j * Z_TRAVEL;
      // Deslocamento lateral sutil (parallax de camadas) proporcional ao progress.
      const lateral = (j - 0.5) * md * 0.14; // pequeno; multiplicado por parallax≤0.5
      const micro = animate ? md * 0.0016 : 0; // shimmer ~2px (micro-vida)

      // Desenha balde a balde, do fundo (0) pro perto (BUCKETS-1) = oclusão.
      for (let b = 0; b < BUCKETS; b++) {
        const bucket = bucketed[b];
        if (!bucket) continue;
        for (const part of bucket) {
          // z efetivo após o avanço; recicla quem passou a câmera (travessia).
          let zEff = part.z - zShift;
          // wrap contínuo: traz de volta ao fundo, mantendo o fluxo infinito.
          zEff = ((zEff % Z_RANGE) + Z_RANGE) % Z_RANGE;
          if (zEff < Z_NEAR) zEff = Z_NEAR;

          // Projeção: perto (z↓) = grande; longe (z↑) = pequeno.
          const scale = FOCAL / (FOCAL + zEff);

          // Expansão radial a partir do Foco central estável.
          const r = part.radius * md * scale;
          const px =
            cx + Math.cos(part.angle) * r + lateral * part.parallax;
          const py = cy + Math.sin(part.angle) * r;

          // Tamanho ∝ scale; alpha cai com a distância (atmosférica básica).
          const size = part.size * scale * 2.6;
          const depthAlpha = scale; // longe = dim
          const shimmer = animate
            ? 0.82 + 0.18 * Math.sin(t * 1.4 + part.seed)
            : 1;
          const alpha = Math.min(0.7, (0.18 + 0.55 * scale) * depthAlpha * shimmer);
          if (alpha <= 0.003) continue;

          // Sprite por profundidade: longe = mais mole (blur assado), perto = nítido.
          const blurIdx = Math.min(
            BLUR_LEVELS - 1,
            Math.round((1 - scale) * (BLUR_LEVELS - 1)),
          );
          const atlas = part.accent && scale > 0.55 ? accentAtlas : warmAtlas;
          const sprite = atlas[blurIdx] ?? atlas[atlas.length - 1];
          if (!sprite) continue;

          // Coordenadas inteiras no drawImage (perf).
          const d = size;
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            sprite,
            Math.round(px - d / 2 + Math.sin(t * 0.6 + part.seed) * micro),
            Math.round(py - d / 2 + Math.cos(t * 0.5 + part.seed) * micro),
            Math.round(d),
            Math.round(d),
          );
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    // reduced-motion: 1 quadro de profundidade estático (sem optic flow).
    // O fluxo/optic flow completo (mata-enjoo) é autorado no plano 04.
    if (reduced) {
      drawFrame(0.5, 0, false);
      const onResizeStatic = () => {
        resize();
        drawFrame(0.5, 0, false);
      };
      window.addEventListener("resize", onResizeStatic, { passive: true });
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    window.addEventListener("resize", resize, { passive: true });

    let raf = 0;
    const loop = (ts: number) => {
      raf = window.requestAnimationFrame(loop);
      // Pause offscreen/aba oculta (TPRF-03): não desenha quando inativo.
      if (!activeRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      const j = clamp01(progressRef.current);
      drawFrame(j, ts * 0.001, true);
    };
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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
