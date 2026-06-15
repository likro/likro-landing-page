"use client";
/**
 * FunnelRail — variante MOBILE do Funil (Plan 09-02 Task 3, DOM net-new).
 *
 * Padrão "uma coluna em foco + rail" (UI-SPEC §Responsive; a alternativa "board
 * miniaturizado" foi REJEITADA — texto humano vira ilegível). NÃO há protótipo
 * pra isto; é o único DOM inventado da fase.
 *
 * Recebe o MESMO `progress: MotionValue<number>` do <ScrollScene> (está dentro
 * da árvore do render-prop → pode usar a exceção MOTION-05). PROIBIDO scroll
 * hooks diretos.
 *
 *  - Rail: 4 chips de etapa (FUNNEL_COPY.steps[i].head) no topo; o chip ativo
 *    acende via o mesmo activeIndex discreto; um marcador de posição avança ao
 *    longo do rail por translateX (useTransform).
 *  - Card: UM MarinaCard central, grande/legível, cujo channel+moment fazem
 *    crossfade pelos 4 beats (mesma técnica de rampas de opacidade do board).
 *  - Clímax (FUNIL-03): chip final + card ignitam roxo via
 *    useTransform(progress,[0.82,0.95],[0,1]). Preserva o left→right sem squash
 *    de 4 colunas.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarinaCard } from "./MarinaCard";
import { FUNNEL_COPY } from "@/content/funnel";

type FunnelRailProps = {
  progress: MotionValue<number>;
  finalState?: boolean;
};

export function FunnelRail({ progress, finalState = false }: FunnelRailProps) {
  // Largura medida do rail → marcador via translateX em px (NUNCA `left`
  // animado — MOTION-08; e sem strings de porcentagem que o audit no-metric
  // leria como métrica). Centros de chip = (i+0.5)/4 da largura do rail.
  const railRef = useRef<HTMLDivElement>(null);
  const [railWidth, setRailWidth] = useState(0);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const measure = () => setRailWidth(el.clientWidth);
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
  const chip = (i: number) => (railWidth * (i + 0.5)) / 4;

  // activeIndex discreto (0..3) — mesma derivação do board, sem state por frame.
  const activeRaw = useTransform(progress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
  const [activeIndex, setActiveIndex] = useState(finalState ? 3 : 0);
  useMotionValueEvent(activeRaw, "change", (v) => {
    const next = Math.round(v);
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  const [isClimax, setIsClimax] = useState(finalState);
  useMotionValueEvent(progress, "change", (v) => {
    const next = v >= 0.9;
    setIsClimax((prev) => (prev === next ? prev : next));
  });

  // Marcador de posição: avança em px pelos centros de chip (platôs = footstep).
  const markerX = useTransform(
    progress,
    [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1],
    [chip(0), chip(1), chip(1), chip(2), chip(2), chip(3), chip(3)],
  );

  // Crossfade dos 4 beats — janelas mirroring o board (zero state por beat).
  const op0 = useTransform(progress, [0, 0.02, 0.22, 0.27], [1, 1, 1, 0]);
  const op1 = useTransform(progress, [0.24, 0.3, 0.46, 0.52], [0, 1, 1, 0]);
  const op2 = useTransform(progress, [0.5, 0.56, 0.72, 0.78], [0, 1, 1, 0]);
  const op3 = useTransform(progress, [0.74, 0.82, 1, 1], [0, 1, 1, 1]);
  const beatOpacities = [op0, op1, op2, op3];

  const climax = useTransform(progress, [0.82, 0.95], [0, 1]);
  const tagY = useTransform(progress, [0.82, 0.95], [4, 0]);

  const effActive = finalState ? 3 : activeIndex;
  const effClimax = finalState || isClimax;

  return (
    <div className="flex h-full flex-col px-6 pt-2">
      {/* Rail de chips + marcador */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2">
          {FUNNEL_COPY.steps.map((step, i) => {
            const isActive = i === effActive;
            const isWinChip = i === 3 && effClimax;
            return (
              <div
                key={step.head}
                className="flex flex-col items-center gap-1.5 text-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-[7px] rounded-full bg-[#4a4d5e] transition-all duration-500",
                    isActive && "bg-text-on-dark-secondary",
                    isWinChip &&
                      "bg-[#9d6bf0] shadow-[0_0_10px_rgba(124,58,237,0.9)]",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium leading-[1.2] tracking-[0.02em] transition-colors duration-500",
                    isActive || isWinChip
                      ? "text-text-on-dark-primary"
                      : "text-text-on-dark-muted",
                  )}
                >
                  {step.head}
                </span>
              </div>
            );
          })}
        </div>
        {/* Linha de base do rail + marcador que avança (translateX em px) */}
        <div ref={railRef} className="relative mt-3 h-px w-full bg-funnel-column-line">
          <motion.span
            aria-hidden="true"
            className="absolute left-0 top-1/2 -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-text-on-dark-secondary"
            style={finalState ? { x: chip(3) } : { x: markerX }}
          />
        </div>
      </div>

      {/* Card central: crossfade dos 4 beats */}
      <div className="relative mt-10 flex flex-1 items-start justify-center">
        <div className="relative w-full max-w-[300px]">
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
                size="rail"
                tagSlot={
                  i === 3 ? (
                    <motion.div
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium leading-[1.2] text-accent-on-dark"
                      style={
                        finalState ? { opacity: 1, y: 0 } : { opacity: climax, y: tagY }
                      }
                    >
                      <span className="flex size-[14px] items-center justify-center rounded-full bg-[rgba(124,58,237,1)] text-white">
                        <Check className="size-[9px]" aria-hidden="true" />
                      </span>
                      {FUNNEL_COPY.seal}
                    </motion.div>
                  ) : (
                    <span className="mt-2.5 inline-flex h-[14px] items-center" />
                  )
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
