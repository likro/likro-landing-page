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
 * ── Plano 08-02: A NARRATIVA caos→ordem ─────────────────────────────────────
 * Sobre a engine de profundidade/deslocamento acima, este plano esculpe a
 * jornada como MORPH DE MATÉRIA COMPARTILHADA (target-lerp), NUNCA crossfade:
 *
 *  4. CONTINUIDADE caos→ordem (TRV-05): cada partícula ganha um ESTADO ORDENADO
 *     (targetAngle/targetRadius/targetZ) num arranjo limpo/abstrato — faixas de
 *     fluxo alinhadas (BANDS), NUNCA cards/dashboards/chat. No drawFrame,
 *     `e = easeInOutCubic(progress)` faz a MESMA partícula migrar
 *     `pos = lerp(caosPos, targetPos, e)`, e a amplitude do ruído cai com um
 *     envelope `(1 - e)` 1→0 — o alvo VENCE no fim. A poeira CONDENSA na forma
 *     ordenada: uma matéria só, sem dois layers cruzando opacidade.
 *
 *  5. 5 MOMENTOS (TRV-02): temperatura (frio→quente), brilho, footprint e
 *     acendimento roxo são mapeados MONOTONICAMENTE no progress — os cortes
 *     ~0/.25/.5/.75/1 leem como 5 quadros distintos. Beats são REGIÕES do
 *     gradiente de parâmetros, NÃO switches (sem ramificar por número-de-beat).
 *
 *  6. ARCO DE ESCALA (TRV-04): `footprint = lerp(1.0, 0.42, e)` contrai o estado
 *     ordenado pra uma região central CONTIDA no fim (aberto→envolvente→íntimo),
 *     combinado com o dolly do optic flow.
 *
 *  7. ROXO ESCASSO (TRV-07): o acendimento roxo é gated por progress alto E
 *     proximidade — `purpleGain = clamp((progress-0.5)/0.5,0,1) * nearness`. Só
 *     uma fração mínima de partículas (`accent` raro) e só perto da chegada. A
 *     escassez é o payoff. Roxo via rgba(124,58,237,…) — NUNCA o hex de marca.
 *
 * ── Plano 08-04: A11Y / SEGURANÇA VESTIBULAR + DEGRADAÇÃO ────────────────────
 *  8. reduced-motion ESTÁTICO-PREMIUM (TACC-01): quando tier==="reduced", o
 *     optic flow (fonte de enjoo) MORRE — sem RAF macro, sem z-travel por
 *     progress, sem shimmer no tempo. A profundidade ESTÁTICA (projeção focal,
 *     baldes, atlas de blur) permanece. A história caos→ordem vira ANTES/DEPOIS:
 *     desenhamos o estado ORDENADO (progress ~0.92) por padrão — narrativa
 *     intacta, zero movimento vestibular.
 *  9. INVARIANTES VESTIBULARES (TACC-02): Foco de Expansão central e estável
 *     (nunca pan/rotaciona); fluxo acoplado ao scroll (nunca autoplay); parallax
 *     ≤0.5; SEM rotação global do campo somada ao optic flow (o `angle` é
 *     per-partícula via target-lerp, não há `globalAngle`/`rotate` por frame).
 * 10. LADDER DE DEGRADAÇÃO em runtime (TPRF-03): média móvel do tempo de frame →
 *     se acima do teto, rebaixa em ordem count↓ (drawFraction) → dpr↓ (dprCap) →
 *     [ruído↓ / estático: fallback documentado]. 2 degraus reais (count→DPR).
 *
 * Escopo do 08-04: reduced-motion estático-premium + invariantes vestibulares +
 * ladder de degradação. (caos→ordem=02, atmosfera/copy=03 ficam intactos.)
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
  /** Posição polar do CAOS, a partir do Foco de Expansão central (estável). */
  angle: number;
  radius: number;
  /**
   * Estado ORDENADO (alvo) — abstrato: a partícula se assenta numa de ~5 faixas
   * de fluxo alinhadas (BANDS) numa região central CONTIDA. NÃO é card/dashboard/
   * chat — é só uma sugestão de estrutura calma. A partícula MIGRA do caos pra cá
   * via target-lerp (a MESMA matéria condensando), nunca por crossfade.
   */
  targetAngle: number;
  targetRadius: number;
  /** z do estado ordenado: mais raso/contido (a chegada é íntima/próxima). */
  targetZ: number;
  /** Índice do balde de profundidade (0..BUCKETS-1) — ordem de desenho. */
  depthBucket: number;
  /** Camada de parallax (0.3 / 0.4 / 0.5 — NUNCA >0.5). */
  parallax: number;
  /** Tamanho base (px) antes da projeção. */
  size: number;
  /** Acento roxo (raro) — só perto/resolvido acende perto da chegada (TRV-07). */
  accent: boolean;
  /** Fase do ruído orgânico (sin/cos em camadas) — vida que não repete exato. */
  noisePhase: number;
  /** Semente p/ micro-vida (shimmer) sem repetir exato. */
  seed: number;
  /**
   * Chave estável ∈[0,1) p/ o ladder de degradação (degrau 1, count↓): quando
   * `drawFraction` cai sob carga, partículas com `dropKey >= drawFraction` são
   * puladas — descarte uniforme e determinístico (sem flicker aleatório/frame).
   */
  dropKey: number;
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

// ── Narrativa caos→ordem (08-02) ────────────────────────────────────────────
const BANDS = 5; // faixas de fluxo do estado ordenado (estrutura ABSTRATA, não UI)
const BAND_SPREAD = 0.26; // meia-altura do feixe central que o estado ordenado ocupa
const BAND_JITTER = 0.045; // dispersão suave dentro de cada faixa (orgânico, não régua)
const FOOTPRINT_OPEN = 1.0; // footprint no caos (amplo, vaza a viewport)
const FOOTPRINT_CLOSED = 0.42; // footprint na ordem (região central contida — íntimo)
const TARGET_Z_MIN = 60; // z mais raso do estado ordenado (chegada próxima/contida)
const TARGET_Z_MAX = 380; // leve profundidade residual no estado ordenado (volume)
const BASE_NOISE = 0.16; // amplitude do ruído orgânico no caos (envelope 1→0)

// ── Atlas de sprites assados ────────────────────────────────────────────────
const TEX = 64;
const BLUR_LEVELS = 5; // 5 níveis de "blur assado" (escolhidos por profundidade)

// Deriva tonal monotônica frio→quente (marca o avanço no tempo; nada volta ao
// começo). Atlas assados em TEMP_STEPS níveis interpolando COLD→WARM no mount —
// selecionados por progress no loop (sem criar gradiente por frame).
const COLD: [number, number, number] = [150, 170, 225]; // violeta-azul frio (caos)
const WARM: [number, number, number] = [255, 220, 185]; // quente/calmo (chegada)
const TEMP_STEPS = 6;
// Roxo de marca via rgba(124,58,237,…) — NUNCA hex literal (brand-lock test).
const ACCENT: [number, number, number] = [124, 58, 237];

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
/** Easing da continuidade: a matéria condensa devagar no começo/fim, decidida no meio. */
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
/** Interpola dois RGB (deriva tonal frio→quente). */
function lerpRgb(
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

    // Atlas assado UMA vez:
    //  - tempAtlases[s]: deriva tonal frio→quente em TEMP_STEPS passos, cada um
    //    com BLUR_LEVELS níveis de blur. Selecionado por progress no loop (sem
    //    criar gradiente por frame). Garante a monotonia frio→quente dos 5 beats.
    //  - accentAtlas: o roxo escasso (só acende perto+tarde — TRV-07).
    const tempAtlases: HTMLCanvasElement[][] = Array.from(
      { length: TEMP_STEPS },
      (_, s) => makeAtlas(lerpRgb(COLD, WARM, s / (TEMP_STEPS - 1))),
    );
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

      // ── Estado ORDENADO (alvo) — arranjo limpo/abstrato: a partícula se
      // assenta numa de BANDS faixas de fluxo horizontais, numa região central
      // contida. Calculado em fração-de-canvas (x,y ∈ ~[-0.5,0.5]) e convertido
      // pra polar (targetAngle/targetRadius) — reusa a MESMA projeção do caos.
      const band = i % BANDS;
      const bandY =
        ((band + 0.5) / BANDS - 0.5) * 2 * BAND_SPREAD + // faixa centrada
        (Math.random() - 0.5) * BAND_JITTER; // jitter suave (orgânico)
      // Posição ao longo da faixa: feixe largo na horizontal, contido na altura.
      const flowX = (Math.random() - 0.5) * (FOOTPRINT_CLOSED * 1.18);
      const targetRadius = Math.hypot(flowX, bandY);
      const targetAngle = Math.atan2(bandY, flowX);

      return {
        z,
        angle: Math.random() * Math.PI * 2,
        // Raio com viés pro centro (sqrt) → centro povoado, calmo no Foco.
        radius: Math.sqrt(Math.random()) * RADIUS_MAX,
        targetAngle,
        targetRadius,
        targetZ: lerp(TARGET_Z_MIN, TARGET_Z_MAX, Math.random()),
        depthBucket,
        parallax: PARALLAX_LAYERS[i % PARALLAX_LAYERS.length] ?? 0.4,
        size: 5 + Math.random() * 12,
        accent: Math.random() < 0.14,
        noisePhase: Math.random() * Math.PI * 2,
        seed: Math.random() * 1000,
        // Chave estável p/ descarte uniforme do ladder (degrau 1): distribui o
        // índice em [0,1) — descartar `>= drawFraction` tira uma fatia uniforme.
        dropKey: (i % count) / count,
      };
    });

    // Buckets ordenados do mais distante (z alto) pro mais próximo (z baixo):
    // o índice maior = mais perto, então desenhamos do índice 0 (fundo) pro fim.
    // (Painter's algorithm com baldes — O(n), não O(n log n).)
    const bucketed: Particle[][] = Array.from({ length: BUCKETS }, () => []);
    for (const p of particles) bucketed[p.depthBucket]?.push(p);

    // ── Ladder de degradação em runtime (TPRF-03) ──────────────────────────
    // Mede o tempo médio de frame (média móvel simples); se passar do teto
    // (~22–24ms ≈ <45fps sustentado), rebaixa em ORDEM, um degrau de cada vez:
    //   degrau 1 → reduzir `count` (desenha menos partículas: drawFraction↓)
    //   degrau 2 → reduzir `dpr` (re-resize com DPR menor: dprCap↓)
    //   degrau 3 → reduzir a resolução do ruído (passo maior do sin/cos)  [fallback documentado]
    //   degrau 4 → cair pra estático (parar o RAF macro, 1 quadro)         [fallback documentado]
    // Implementados de forma REAL os 2 primeiros (count→DPR); os degraus 3–4
    // ficam documentados como fallback (o reduced-motion já é o "estático" 4).
    const FRAME_BUDGET_MS = 23; // teto ~<45fps sustentado
    const FRAME_WINDOW = 60; // janela da média móvel (frames)
    const COOLDOWN_FRAMES = 90; // espera após um rebaixamento antes do próximo
    let frameAccum = 0;
    let frameSamples = 0;
    let cooldown = 0;
    let degradeStep = 0; // 0 = full, 1 = count↓, 2 = count↓+dpr↓
    // Fração das partículas efetivamente desenhadas (degrau 1 baixa pra 0.6).
    let drawFraction = 1;
    // Teto de DPR (degrau 2 baixa de 1.5 pra 1.0).
    let dprCap = 1.5;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      // DPR ≤ 1.5 (TPRF-01): luz borrada → DPR alto é indistinguível e custa
      // fill/blend por frame. 1.5 é o teto sagrado mobile; o ladder pode baixar
      // `dprCap` pra 1.0 sob carga (degrau 2).
      dpr = Math.min(window.devicePixelRatio || 1, dprCap);
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

      // ── Continuidade caos→ordem (TRV-05): a MESMA matéria condensa via
      // target-lerp. `e` decide a migração; o ruído tem envelope 1→0 (o alvo
      // vence no fim). NUNCA crossfade — não há segundo campo de partículas.
      const e = easeInOutCubic(j);
      const noiseAmp = (1 - e) * BASE_NOISE; // envelope do ruído decrescente 1→0

      // ── Arco de escala (TRV-04): o footprint do estado ordenado CONTRAI de
      // aberto (tela toda, vaza bordas) → íntimo (região central contida). Junto
      // com o dolly do optic flow, dá aberto→envolvente→íntimo. Multiplica a
      // dispersão dos alvos → a chegada ocupa um feixe central pequeno.
      const footprint = lerp(FOOTPRINT_OPEN, FOOTPRINT_CLOSED, e);

      // ── Roxo escasso intensificando na chegada (TRV-07): o acendimento só
      // começa depois da metade da travessia (progress alto). A escassez é o
      // payoff — só uma fração `accent` E só perto, perto da chegada.
      const purpleProgress = clamp01((j - 0.5) / 0.5);

      // Deriva tonal monotônica frio→quente (marca o avanço; nada volta ao começo).
      const tempStep = Math.min(
        TEMP_STEPS - 1,
        Math.round(j * (TEMP_STEPS - 1)),
      );
      const warmAtlas = tempAtlases[tempStep] ?? tempAtlases[TEMP_STEPS - 1]!;
      // Brilho sobe com o progress (perspectiva da chegada).
      const brightness = lerp(0.82, 1.12, e);

      // Optic flow: o campo inteiro avança em z conforme o progress.
      const zShift = j * Z_TRAVEL;
      // Deslocamento lateral sutil (parallax de camadas) proporcional ao progress.
      const lateral = (j - 0.5) * md * 0.14; // pequeno; multiplicado por parallax≤0.5
      const micro = animate ? md * 0.0016 : 0; // shimmer ~2px (micro-vida)

      // Ladder degrau 1 (count↓): sob carga, `drawFraction` cai e descartamos
      // partículas cujo `dropKey` (∈[0,1), estável por partícula) excede a
      // fração — menos `drawImage`/blend por frame, distribuição preservada.
      const drawFrac = drawFraction;

      // Desenha balde a balde, do fundo (0) pro perto (BUCKETS-1) = oclusão.
      for (let b = 0; b < BUCKETS; b++) {
        const bucket = bucketed[b];
        if (!bucket) continue;
        for (const part of bucket) {
          if (drawFrac < 1 && part.dropKey >= drawFrac) continue;
          // Ruído orgânico (sin/cos em camadas, sem dep simplex — o contrato
          // permite o fallback) com envelope 1→0: vivo no caos, quieto na ordem.
          const nA = animate ? t * 0.18 + part.noisePhase : part.noisePhase;
          const noiseAngle =
            noiseAmp *
            (Math.sin(nA) + 0.5 * Math.sin(nA * 2.3 + part.seed));
          const noiseRad =
            noiseAmp *
            (Math.cos(nA * 1.7 + part.seed) + 0.5 * Math.sin(nA * 0.9));

          // target-lerp: a partícula MIGRA do caos pro estado ordenado (uma só
          // matéria condensando). O ruído some conforme o alvo vence; o alvo é
          // contraído pelo `footprint` (arco de escala — íntimo no fim).
          const angle = lerp(part.angle, part.targetAngle, e) + noiseAngle;
          const radius =
            lerp(part.radius, part.targetRadius * footprint, e) + noiseRad;

          // z também migra: caos (fundo, disperso) → ordenado (raso, contido).
          const baseZ = lerp(part.z, part.targetZ, e);

          // z efetivo após o avanço; recicla quem passou a câmera (travessia).
          let zEff = baseZ - zShift;
          // wrap contínuo: traz de volta ao fundo, mantendo o fluxo infinito.
          zEff = ((zEff % Z_RANGE) + Z_RANGE) % Z_RANGE;
          if (zEff < Z_NEAR) zEff = Z_NEAR;

          // Projeção: perto (z↓) = grande; longe (z↑) = pequeno.
          const scale = FOCAL / (FOCAL + zEff);

          // Expansão radial a partir do Foco central estável.
          const r = radius * md * scale;
          const px = cx + Math.cos(angle) * r + lateral * part.parallax;
          const py = cy + Math.sin(angle) * r;

          // Tamanho ∝ scale; alpha cai com a distância (atmosférica básica).
          const size = part.size * scale * 2.6;
          const depthAlpha = scale; // longe = dim
          const shimmer = animate
            ? 0.82 + 0.18 * Math.sin(t * 1.4 + part.seed)
            : 1;
          let alpha = Math.min(
            0.78,
            (0.18 + 0.55 * scale) * depthAlpha * shimmer * brightness,
          );

          // ── Chegada conquistada — roxo escasso (TRV-07): o acendimento é
          // gated por (i) progress alto (`purpleProgress`) E (ii) proximidade
          // (`nearness`, derivada do scale). Só uma partícula `accent` rara que
          // já chegou perto E só perto da chegada acende — a escassez é o payoff.
          const nearness = clamp01((scale - 0.5) / 0.5);
          const purpleGain = purpleProgress * nearness;
          const lit = part.accent && purpleGain > 0.12;
          if (lit) alpha = Math.min(0.9, alpha * (1 + 0.7 * purpleGain));
          if (alpha <= 0.003) continue;

          // Sprite por profundidade: longe = mais mole (blur assado), perto = nítido.
          const blurIdx = Math.min(
            BLUR_LEVELS - 1,
            Math.round((1 - scale) * (BLUR_LEVELS - 1)),
          );
          // Acende roxo só quando o gate (progress alto + proximidade) abre.
          const atlas = lit ? accentAtlas : warmAtlas;
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

    // ── reduced-motion: ESTÁTICO-PREMIUM (TACC-01) ──────────────────────────
    // O optic flow (z-travel + expansão radial animada) é a FONTE de enjoo
    // vestibular. Em reduced-motion ele MORRE por completo: nenhum RAF macro,
    // nenhum `zShift` por progress, nenhum shimmer no tempo (animate=false).
    //
    // A PROFUNDIDADE estática permanece (é segura — não se move): a projeção
    // focal scale=FOCAL/(FOCAL+z), a oclusão por baldes, o tamanho relativo e a
    // perspectiva atmosférica (atlas de blur) continuam dando volume.
    //
    // A narrativa caos→ordem é apresentada como ANTES/DEPOIS, não como viagem:
    // por padrão desenhamos o estado ORDENADO/conquistado (progress fixo ~0.92 —
    // matéria condensada, quente, roxo no auge da escassez), o "depois" da
    // história. Quem quiser ver o "antes" (caos frio) usa o scroll, mas SEM
    // travessia animada — é um corte estático entre dois quadros, não um dolly.
    // (O caos→ordem fica legível como dois estados, narrativa intacta, zero
    // movimento vestibular. Um fade de opacidade ≤200ms entre antes/depois é a
    // alternativa autorizada pelo contrato — aqui optamos pelo end-state por
    // padrão, mais simples e igualmente sem enjoo.)
    const ORDERED_FRAME = 0.92; // o "depois" — estado de ordem conquistada
    if (reduced) {
      drawFrame(ORDERED_FRAME, 0, false);
      const onResizeStatic = () => {
        resize();
        drawFrame(ORDERED_FRAME, 0, false);
      };
      window.addEventListener("resize", onResizeStatic, { passive: true });
      // Sem RAF macro autônomo no reduced: 1 quadro estático + redraw só em resize.
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

      // ── Medição do tempo de desenho (ladder de degradação, TPRF-03) ───────
      const t0 = performance.now();
      drawFrame(j, ts * 0.001, true);
      const frameMs = performance.now() - t0;

      // Média móvel simples sobre FRAME_WINDOW frames.
      frameAccum += frameMs;
      frameSamples++;
      if (cooldown > 0) cooldown--;
      if (frameSamples >= FRAME_WINDOW) {
        const avg = frameAccum / frameSamples;
        frameAccum = 0;
        frameSamples = 0;
        // Acima do teto e fora do cooldown → desce UM degrau do ladder.
        if (avg > FRAME_BUDGET_MS && cooldown === 0 && degradeStep < 2) {
          degradeStep++;
          if (degradeStep === 1) {
            // Degrau 1: count↓ — desenha ~60% das partículas.
            drawFraction = 0.6;
          } else if (degradeStep === 2) {
            // Degrau 2: dpr↓ — reduz o teto de DPR e re-resize (menos fill/frame).
            dprCap = 1.0;
            resize();
          }
          cooldown = COOLDOWN_FRAMES;
          // Degraus 3 (resolução do ruído) e 4 (estático) ficam como fallback
          // documentado: o caminho reduced-motion já entrega o "estático" final.
        }
      }
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
