"use client";
/**
 * FunnelBoard — board Kanban desktop dirigido por scroll (Plan 09-02 Task 2).
 *
 * Recebe `progress: MotionValue<number>` (0→1) do render-prop de <ScrollScene>
 * em index.tsx. Por estar DENTRO do render-prop, este arquivo pode importar a
 * exceção controlada MOTION-05: `useTransform`/`motion`/`useMotionValueEvent`/
 * `type MotionValue` de motion/react. Os hooks de scroll diretos (o anti-pattern
 * do Hero — RESEARCH Pitfall 1) são proibidos: o progress já vem do render-prop.
 *
 * A jornada (espelha funil-proto.html, porém transform/opacity only — MOTION-08):
 *  - Marina caminha col0→1→2→3 via translateX (NUNCA `left`). 7 pontos de
 *    useTransform com platôs em cada centro de coluna = "pegada deliberada".
 *  - activeIndex discreto via useMotionValueEvent (4 trocas de state, não por
 *    frame — TPRF-04, port do guard `dataset.cur != active` do protótipo).
 *  - Os 4 beats ficam empilhados no MarinaCard e fazem crossfade por 4 rampas
 *    de opacidade (janelas espelhando StageB op1..op4) — zero state por beat.
 *  - Clímax (FUNIL-03): coluna 4 .win + card .win + tag de confirmação ignitam
 *    de useTransform(progress,[0.82,0.95],[0,1]). Roxo SÓ aqui.
 *
 * Centro de coluna i (4 colunas) = boardWidth*(i+0.5)/4. A largura do board é
 * medida num ref (resize debounce ~150ms, padrão use-line-grouping) — estável
 * porque o board é max-width centrado.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Check } from "lucide-react";
import { FunnelColumn, type FunnelColumnState } from "./FunnelColumn";
import { GhostCard } from "./GhostCard";
import { MarinaCard } from "./MarinaCard";
import { FUNNEL_COPY } from "@/content/funnel";

const CARD_WIDTH = 236; // largura fixa do MarinaCard desktop (UI-SPEC)
// offset vertical ESTÁTICO (protótipo top:120px) — posicional, NUNCA animado;
// expresso via classe Tailwind `top-[120px]` (não `style`) p/ deixar claro que
// não é propriedade animada (MOTION-08; só `x`/opacity animam).

// Quantos ghosts por coluna (os "outros pacientes"), espelhando o protótipo.
const GHOSTS_PER_COLUMN = [2, 1, 2, 0] as const;

type FunnelBoardProps = {
  progress: MotionValue<number>;
  /** força o estado final (reduced-motion): activeIndex=3, clímax aceso. */
  finalState?: boolean;
};

export function FunnelBoard({ progress, finalState = false }: FunnelBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  // Mede a largura do board (resize debounce ~150ms). Centros de coluna são
  // frações da largura → estável a resize/tablet.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const measure = () => setBoardWidth(el.clientWidth);
    measure();
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Centro de cada coluna em px (i+0.5)/4 * boardWidth; o card é centrado nele.
  const colCenter = (i: number) => (boardWidth * (i + 0.5)) / 4;
  const x0 = colCenter(0) - CARD_WIDTH / 2;
  const x1 = colCenter(1) - CARD_WIDTH / 2;
  const x2 = colCenter(2) - CARD_WIDTH / 2;
  const x3 = colCenter(3) - CARD_WIDTH / 2;

  // Travel com platôs (footstep). 7 pontos: cada coluna ganha um platô.
  const x = useTransform(
    progress,
    [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    [x0, x1, x1, x2, x2, x3, x3],
  );

  // activeIndex discreto (0..3) — só re-renderiza quando o índice arredondado muda.
  const activeRaw = useTransform(progress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
  const [activeIndex, setActiveIndex] = useState(finalState ? 3 : 0);
  useMotionValueEvent(activeRaw, "change", (v) => {
    const next = Math.round(v);
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  // Clímax: ignição contínua roxa (coluna 4 + card + tag). isClimax discreto p/ .win.
  const climax = useTransform(progress, [0.82, 0.95], [0, 1]);
  const tagY = useTransform(progress, [0.82, 0.95], [4, 0]);
  const [isClimax, setIsClimax] = useState(finalState);
  useMotionValueEvent(progress, "change", (v) => {
    const next = v >= 0.9;
    setIsClimax((prev) => (prev === next ? prev : next));
  });

  // Crossfade dos 4 beats — janelas mirroring StageB op1..op4 (zero state/beat).
  const op0 = useTransform(progress, [0, 0.02, 0.22, 0.27], [1, 1, 1, 0]);
  const op1 = useTransform(progress, [0.24, 0.3, 0.46, 0.52], [0, 1, 1, 0]);
  const op2 = useTransform(progress, [0.5, 0.56, 0.72, 0.78], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.74, 0.82, 1, 1], [0, 1, 1, 1]);
  const beatOpacities = [op0, op1, op2, op3];

  const effActive = finalState ? 3 : activeIndex;
  const effClimax = finalState || isClimax;

  const columnState = (i: number): FunnelColumnState => {
    if (i === 3 && effClimax) return "win";
    if (i === effActive) return "active";
    return "resting";
  };

  return (
    <div
      ref={boardRef}
      className="relative z-[1] mx-auto grid w-full max-w-[1240px] grid-cols-4 gap-5 px-8 pb-8 pt-2"
    >
      {FUNNEL_COPY.steps.map((step, i) => (
        <FunnelColumn key={step.head} head={step.head} state={columnState(i)}>
          {Array.from({ length: GHOSTS_PER_COLUMN[i] ?? 0 }).map((_, g) => (
            <GhostCard key={g} />
          ))}
        </FunnelColumn>
      ))}

      {/* Marina — absoluta sobre o board, transladada por translateX (x).
          Conteúdo dos 4 beats empilhado + crossfade; tag de confirmação ignita
          no clímax via motion (sobrepõe o tagSlot do MarinaCard). */}
      <motion.div
        className="pointer-events-none absolute left-0 top-[120px] z-[5]"
        style={finalState ? { x: x3 } : { x }}
      >
        <div className="relative">
          {FUNNEL_COPY.steps.map((step, i) => (
            <motion.div
              key={step.head}
              aria-hidden={effActive === i ? undefined : true}
              className={i === 0 ? "relative" : "absolute inset-0"}
              style={
                finalState
                  ? { opacity: i === 3 ? 1 : 0 }
                  : { opacity: beatOpacities[i] }
              }
            >
              <MarinaCard
                channel={step.channel}
                moment={step.moment}
                win={i === 3 && effClimax}
                tagSlot={
                  i === 3 ? (
                    <motion.div
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium leading-[1.2] text-accent-on-dark"
                      style={
                        finalState
                          ? { opacity: 1, y: 0 }
                          : { opacity: climax, y: tagY }
                      }
                    >
                      <span className="flex size-[14px] items-center justify-center rounded-full bg-[rgba(124,58,237,1)] text-white">
                        <Check className="size-[9px]" aria-hidden="true" />
                      </span>
                      {FUNNEL_COPY.seal}
                    </motion.div>
                  ) : (
                    // beats 1–3: sem tag (espaço reservado p/ não saltar layout)
                    <span className="mt-2.5 inline-flex h-[14px] items-center" />
                  )
                }
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
