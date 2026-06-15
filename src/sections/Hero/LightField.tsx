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
  /** "Canal" de origem no caos (0..NCH-1) — fragmentação SENTIDA, não rótulo. */
  channel: number;
  /** Mensagem que chega e ESFRIA sem resposta (paciente esperando) — só no caos. */
  msg: boolean;
  /** Oportunidade que VAZA pra fora do quadro (perda silenciosa) — só no caos. */
  leak: boolean;
  /** Fase própria do ciclo de esfriar/vazar (não repete exato entre partículas). */
  lifePhase: number;
  /** Caos em CARTESIANO normalizado (migração em linha reta — sem artefato de
   *  interpolar ângulo cruzando 0/2π, que enviesava o meio da travessia pra esquerda). */
  cx0: number;
  cy0: number;
  /** Estado ordenado em CARTESIANO normalizado (alvo da migração). */
  tx: number;
  ty: number;
};

// Budgets enxutos (Lenny: "muito pesado / trava"). Menos partículas + sprites
// menores = muito menos fillrate em blend aditivo (o gargalo real). Mobile sagrado.
const TIER_COUNT: Record<"reduced" | "mobile" | "tablet" | "desktop", number> = {
  reduced: 200,
  mobile: 240,
  tablet: 320,
  desktop: 380,
};

// ── Modelo de câmera / projeção ─────────────────────────────────────────────
const FOCAL = 320; // distância focal (px-ish): scale = FOCAL/(FOCAL+z)
const Z_NEAR = 12; // partícula que cruza isto já passou a câmera → reciclar
const Z_RANGE = 1100; // profundidade total do campo (fundo - frente)
const Z_TRAVEL = 1080; // quanto o campo desloca em z (avanço). Reduzido de 1350:
// dolly mais suave = expansão menos agressiva durante a rolagem (menos partículas
// "rushando" pra fora a cada scroll = movimento mais clean), sem perder a sensação
// de avanço/travessia (Lenny: "scrolada fica zuada").
const BUCKETS = 6; // baldes de profundidade (oclusão por ordem, sem sort/frame)
const RADIUS_MAX = 0.8; // raio polar máximo — enche os cantos sem jogar partículas
// demais pra fora da tela no meio da travessia (0.92 esvaziava; 0.74 deixava cantos).

// ── Narrativa caos→ordem (08-02) ────────────────────────────────────────────
// ── Estado ORDENADO: campo CHEIO, nunca uma banda fina ──────────────────────
// REGRA 1 (Lenny): a ordem JAMAIS encolhe pra um filete. O estado ordenado é a
// MESMA matéria do caos, agora UNIFICADA e calma, PREENCHENDO a viewport inteira
// (borda→borda, topo→base). A "organização" é sentida pela calma (ruído→0), calor,
// roxo, pulso único e convergência dos canais — NÃO por colapso espacial. Antes
// havia BANDS (faixas) que, sob a projeção radial, viravam uma tira fina no topo
// com a tela vazia embaixo (a compressão). Removido.
const ORDER_FILL = 0.92; // espalhamento radial do estado ordenado (enche a tela)
const FOOTPRINT_OPEN = 1.0; // footprint no caos (amplo, vaza a viewport)
const FOOTPRINT_CLOSED = 1.15; // a ordem NÃO encolhe — ENCHE a viewport (até cresce
// um pouco). Lenny: "o campo não pode encolher; quero estar DENTRO dele".
// Ajustado pós-checkpoint do Lenny: ele quer sentir-se DENTRO do fenômeno, não
// olhando um objeto central isolado. O arco de escala vira o dolly/calor do optic
// flow, NÃO uma contração que encolhe o campo — a chegada ocupa a tela inteira.
const TARGET_Z_MIN = 60; // z mais raso do estado ordenado (chegada próxima/contida)
const TARGET_Z_MAX = 380; // leve profundidade residual no estado ordenado (volume)
const BASE_NOISE = 0.045; // amplitude do ruído orgânico no caos (envelope 1→0).
// Menor agora que o ruído é JITTER CARTESIANO (×md): 0.16 explodia em centenas de
// px; 0.045 dá um wiggle gentil e CALMO no caos que some na ordem (Lenny: "mais clean").

// ── Semântica sentida (08-NARRATIVE: a luz REPRESENTA a operação da Likro) ───
// A história é carregada pelo COMPORTAMENTO da luz, não por copy. Tudo aqui é
// SENTIDO (fragmentação, esfriar, vazar, costurar, unificar) — nunca logo/cor de
// canal (brand-lock: roxo é o único acento). Acoplado ao scroll (scrubbed); só a
// micro-vida do caos (esfriar/vazar/shimmer) roda no tempo — a clínica não para
// "às 9 da noite" mesmo quando ninguém olha.
const NCH = 3; // "canais" desconexos no caos (IG/WA/Msg) — fragmentação sentida
const CH_RATE = [0.1, 0.185, 0.275]; // ritmos dessincronizados no caos → 1 ritmo na ordem
const MSG_FRAC = 0.1; // fração que "chega e esfria" sem resposta (paciente esperando)
const LEAK_FRAC = 0.05; // fração que "vaza" pra fora do quadro (oportunidade perdida)
// 2026-06-15 (Lenny "scrolada fica zuada"): MSG/LEAK reduzidos pela metade — eram
// a fonte do flicker/agitação durante a rolagem (partículas piscando e voando pra
// fora). Menos delas = movimento mais CALMO/clean no scroll, narrativa preservada.
const CHAOS_END = 0.42; // até onde as dores do caos vivem (fragmentar/esfriar/vazar)
const AI_IN = 0.34; // a IA começa a costurar/capturar...
const AI_OUT = 0.66; // ...e termina de atender tudo aqui (nada cai)

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
      // ── Estado ORDENADO (alvo): o campo CHEIO e calmo — NÃO uma banda fina.
      // Distribuição radial completa (centro→borda) preenchendo a viewport. A
      // ordem se distingue do caos por calma/calor/roxo/pulso, não por posição.
      const targetAngle = Math.random() * Math.PI * 2;
      const targetRadius = (0.1 + Math.sqrt(Math.random()) * ORDER_FILL) * RADIUS_MAX;

      // ── Caos: campo CHEIO (sem buraco — regra 1). A fragmentação NÃO é espacial
      // (gaps deixam dead space); é TEMPORAL — cada canal pulsa num ritmo próprio
      // (CH_RATE) + mensagens esfriando + oportunidades vazando, espalhadas por
      // toda a tela. CH_DIR dá só um leve viés de foco, sem esvaziar regiões.
      const channel = i % NCH;
      // Ângulo do caos PURAMENTE aleatório (sem viés por canal): o viés angular
      // criava assimetria esquerda↔direita que fazia o campo parecer "torto" e o
      // texto centralizado parecer fora de centro. A fragmentação por canal vive
      // no RITMO (CH_RATE) + esfriar + vazar, não na posição.
      const chaosAngle = Math.random() * Math.PI * 2;
      const chaosRadius = (0.06 + Math.sqrt(Math.random()) * 0.98) * RADIUS_MAX;

      // Partição determinística msg/leak (frações estáveis, sem sobreposição).
      const roll = (i * 0.6180339887) % 1;
      const leak = roll < LEAK_FRAC;
      const msg = !leak && roll < LEAK_FRAC + MSG_FRAC;

      return {
        z,
        angle: chaosAngle,
        radius: chaosRadius,
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
        channel,
        msg,
        leak,
        lifePhase: Math.random(),
        // Cartesiano normalizado (caos e alvo) — a migração lerpa ISTO em linha
        // reta, sem o artefato de ponto-médio-oposto do lerp de ângulo.
        cx0: Math.cos(chaosAngle) * chaosRadius,
        cy0: Math.sin(chaosAngle) * chaosRadius,
        tx: Math.cos(targetAngle) * targetRadius,
        ty: Math.sin(targetAngle) * targetRadius,
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
    const FRAME_BUDGET_MS = 21; // teto ~<48fps sustentado (intervalo REAL de frame)
    const FRAME_WINDOW = 45; // janela da média móvel (frames)
    const COOLDOWN_FRAMES = 80; // espera após um rebaixamento antes do próximo
    let frameAccum = 0;
    let frameSamples = 0;
    let cooldown = 0;
    let degradeStep = 0; // 0=full, 1=count↓, 2=count↓↓, 3=+dpr↓
    // Fração das partículas efetivamente desenhadas (degraus baixam progressivo).
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

    // Interação com o cursor REMOVIDA: derrubava o fps ao mexer o mouse sobre o
    // campo e dava uma travada quando o cursor saía (o parallax zerava de repente,
    // fazendo o campo pular). Não é parte da narrativa — a travessia é scrubbed.

    /**
     * Desenha um quadro do campo pseudo-3D em função do progress `j` (scrubbed)
     * e do micro-tempo `t` (só shimmer). Foco de Expansão = centro (cx,cy),
     * ESTÁVEL — nunca pan/rotaciona (segurança vestibular, TACC-02).
     */
    const drawFrame = (j: number, t: number, animate: boolean) => {
      // Escala do campo pela MAIOR dimensão (não a menor): o campo enche a
      // largura e ultrapassa as bordas em telas wide → envolve, não fica um
      // objeto central isolado (pós-checkpoint do Lenny: "estar DENTRO").
      const md = Math.max(w, h);
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
      // Brilho sobe com o progress (perspectiva da chegada — destino presente).
      const brightness = lerp(0.82, 1.24, e);

      // Optic flow: o campo inteiro avança em z conforme o progress.
      const zShift = j * Z_TRAVEL;
      // Deslocamento lateral sutil (parallax de camadas) proporcional ao progress.
      const lateral = 0; // ZERADO: qualquer deslocamento lateral por progress
      // criava assimetria esquerda↔direita nas pontas (caos puxava esquerda, chegada
      // direita) e fazia o texto centralizado parecer fora de centro. Foco de
      // Expansão fica 100% central e estável (também melhor pra segurança vestibular).
      const micro = animate ? md * 0.0016 : 0; // shimmer ~2px (micro-vida)

      // ── Semântica sentida (gates acoplados ao scroll) ───────────────────────
      // chaos: as dores (fragmentar/esfriar/vazar) vivem forte no início e somem.
      // aiCapture: conforme você ROLA pela virada, a IA "atende" — costura e pega.
      // unanswered: esfriar/vazar só até a IA pegar (depois, nada cai).
      // weave: surto de re-acendimento da IA costurando (pico no meio da virada).
      const chaos = clamp01(1 - j / CHAOS_END);
      const aiCapture = clamp01((j - AI_IN) / (AI_OUT - AI_IN));
      const unanswered = chaos * (1 - aiCapture);
      const weave = aiCapture * (1 - aiCapture) * 4;

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
          // Ritmo de vida POR CANAL: no caos cada canal pulsa num compasso
          // diferente (dessincronia = focos desconexos); conforme a ordem forma,
          // os ritmos convergem pra um só (unificação sentida).
          const lifeRate = lerp(CH_RATE[part.channel] ?? 0.18, 0.18, e);
          const nA = animate ? t * lifeRate + part.noisePhase : part.noisePhase;
          const noiseAngle =
            noiseAmp *
            (Math.sin(nA) + 0.5 * Math.sin(nA * 2.3 + part.seed));
          const noiseRad =
            noiseAmp *
            (Math.cos(nA * 1.7 + part.seed) + 0.5 * Math.sin(nA * 0.9));

          // Vazamento (oportunidade perdida): no caos, partículas `leak` derivam
          // pra FORA do quadro e somem — perda silenciosa. A IA capturando
          // (aiCapture↑) anula a deriva (pega antes de vazar). Respawn via ciclo
          // (%1) traz de volta dim → densidade preservada (regra 1: não esvazia).
          let leakDrift = 0;
          if (animate && part.leak && unanswered > 0.01) {
            leakDrift = (t * 0.05 + part.lifePhase) % 1;
          }

          // target-lerp: a partícula MIGRA do caos pro estado ordenado (uma só
          // matéria condensando). O ruído some conforme o alvo vence; o alvo é
          // contraído pelo `footprint` (arco de escala — íntimo no fim).
          // Migração em CARTESIANO (linha reta caos→ordem) — sem o artefato de
          // interpolar ângulo (que enviesava o meio da travessia pra esquerda). O
          // ruído entra como jitter x/y; o alvo é contraído pelo footprint.
          let bx = lerp(part.cx0, part.tx * footprint, e) + noiseAngle;
          let by = lerp(part.cy0, part.ty * footprint, e) + noiseRad;
          // Oportunidade que vaza: empurra a magnitude pra fora (some do quadro).
          if (leakDrift > 0) {
            const push = 1 + unanswered * leakDrift * 1.05;
            bx *= push;
            by *= push;
          }

          // z também migra: caos (fundo, disperso) → ordenado (raso, contido).
          const baseZ = lerp(part.z, part.targetZ, e);

          // z efetivo após o avanço; recicla quem passou a câmera (travessia).
          let zEff = baseZ - zShift;
          // wrap contínuo: traz de volta ao fundo, mantendo o fluxo infinito.
          zEff = ((zEff % Z_RANGE) + Z_RANGE) % Z_RANGE;
          if (zEff < Z_NEAR) zEff = Z_NEAR;

          // Projeção: perto (z↓) = grande; longe (z↑) = pequeno.
          const scale = FOCAL / (FOCAL + zEff);

          // Expansão radial a partir do Foco central estável. A POSIÇÃO usa um
          // `spread` que NÃO colapsa as distantes no centro (antes `r = radius*md*
          // scale` puxava tudo o que era far/dim pro meio → coluna central cheia,
          // laterais/cantos mortos = a "concentração" que o Lenny via). Agora as
          // distantes mantêm `size` pequeno (3D intacto) mas ESPALHAM pra encher
          // as bordas (baseline 0.5). A expansão do optic flow segue (spread sobe
          // com scale conforme você avança).
          const spread = 0.55 + 0.42 * scale;
          const px = cx + bx * md * spread + lateral * part.parallax;
          const py = cy + by * md * spread;

          // Tamanho ∝ scale; alpha cai com a distância (atmosférica básica).
          // Fator maior → partículas próximas GRANDES, com presença periférica
          // (luz grande e mole cruzando as bordas = envolvimento, sem +partículas).
          const size = Math.min(48, part.size * scale * 3.3); // sprites menores +
          // teto baixo = MUITO menos fillrate em blend aditivo (FPS na máquina real).
          // 2026-06-15 (Lenny "ainda travado / mais clean"): corte decisivo — count
          // desktop 560→380 + size 3.7→3.3 e cap 58→48. Área desenhada (~ size²) e
          // densidade caem juntas → muito menos overdraw aditivo (scroll fluido) e
          // poeira mais rarefeita/limpa. Mesma narrativa caos→ordem.
          const depthAlpha = scale; // longe = dim
          // Shimmer: no caos cada partícula cintila na sua fase (vida dispersa);
          // na ordem as fases convergem (lerp→0) = um PULSO ÚNICO (operação que
          // respira junto). Unificação sentida, micro-vida (não macro-loop).
          const shPhase = lerp(part.seed, 0, e);
          const shimmer = animate ? 0.82 + 0.18 * Math.sin(t * 1.4 + shPhase) : 1;
          let alpha = Math.min(
            0.82,
            (0.24 + 0.6 * scale) * depthAlpha * shimmer * brightness,
          );

          // ── Mensagem que esfria sem resposta + IA re-acendendo ──────────────
          if (animate) {
            // Paciente esperando: `msg` acende e ESFRIA num ciclo (chega→ninguém
            // vê→esfria). Só enquanto `unanswered` (antes da IA pegar).
            if (part.msg && unanswered > 0.01) {
              const cyc = (t * 0.22 + part.lifePhase) % 1;
              const f = 1 - cyc;
              const flare = f * f * f; // sobe rápido, esfria devagar (sem Math.exp)
              alpha *= lerp(1, 0.26 + 0.82 * flare, unanswered);
            }
            // Oportunidade vazando: some conforme deriva pra fora (dim ao sair).
            if (leakDrift > 0) alpha *= 1 - leakDrift;
            // A IA costura a virada: surto de re-acendimento (pega o que esfriava
            // e o que vazava). Mais forte nos `msg` (são os que estavam apagando).
            if (weave > 0.01) alpha *= 1 + 0.5 * weave * (part.msg ? 1.6 : 1);
          }

          if (alpha > 0.92) alpha = 0.92; // teto (a costura da IA não estoura branco)

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
    let lastDrawTs = 0; // pacing: limita os DRAWS a ~60fps
    let lastMeasureTs = 0; // ladder: intervalo entre draws reais
    // Cap de framerate: o alvo do canvas é ~60fps ESTÁVEL, não o refresh do
    // monitor. Perseguir 120Hz e falhar é o que dava a sensação "travada" — um
    // 60fps consistente é mais suave que um 75–110fps errático com drops, e gasta
    // metade do trabalho/seg (folga pra cada frame fechar no orçamento). NÃO muda
    // o visual (mesmas partículas/sprites), só a cadência. ~13ms → 60fps em 120Hz,
    // 72fps em 144Hz, 60fps em 60Hz (inalterado).
    const FRAME_CAP_MS = 13;
    const loop = (ts: number) => {
      raf = window.requestAnimationFrame(loop);
      // Pause offscreen/aba oculta (TPRF-03): não desenha quando inativo.
      if (!activeRef.current) {
        lastDrawTs = 0;
        lastMeasureTs = 0;
        return;
      }
      if (typeof document !== "undefined" && document.hidden) {
        lastDrawTs = 0;
        lastMeasureTs = 0;
        return;
      }
      // Cap: pula este frame se ainda não passou ~1/60s desde o último DRAW.
      if (lastDrawTs > 0 && ts - lastDrawTs < FRAME_CAP_MS) return;
      lastDrawTs = ts;

      const j = clamp01(progressRef.current);

      drawFrame(j, ts * 0.001, true);

      // ── Auto-degradação por FPS REAL (intervalo entre DRAWS) ──────────────
      // Mede o intervalo entre draws reais (inclui a compositação da atmosfera).
      // Com o cap o normal é ~16.6ms (< orçamento → NÃO rebaixa, preserva o look).
      // Só rebaixa se a máquina não segura nem ~42fps do alvo capado — aí dropar
      // partículas é melhor que congelar. Robusto a hardware fraco (mobile sagrado).
      if (cooldown > 0) cooldown--;
      if (lastMeasureTs > 0) {
        const dt = ts - lastMeasureTs;
        // Ignora picos isolados (scroll brusco/GC) > 80ms: não poluem a média.
        if (dt < 80) {
          frameAccum += dt;
          frameSamples++;
        }
        if (frameSamples >= FRAME_WINDOW) {
          const avg = frameAccum / frameSamples;
          frameAccum = 0;
          frameSamples = 0;
          if (avg > FRAME_BUDGET_MS && cooldown === 0 && degradeStep < 3) {
            degradeStep++;
            if (degradeStep === 1) drawFraction = 0.62; // desenha ~62%
            else if (degradeStep === 2) drawFraction = 0.42; // ~42%
            else if (degradeStep === 3) {
              dprCap = 1.0; // por último, baixa o DPR e re-resize
              resize();
            }
            cooldown = COOLDOWN_FRAMES;
          }
        }
      }
      lastMeasureTs = ts;
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
