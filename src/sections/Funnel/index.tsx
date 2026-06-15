"use client";
/**
 * Funnel (root) — capítulo ESCURO "Caminho do Paciente" (Plan 09-02 Task 3).
 *
 * Compõe as primitivas CONGELADAS (@/components/motion): <ScrollScene> emite o
 * progress 0→1 e <StickyStage> prende o palco. O MESMO progress dirige board
 * (desktop/tablet) ou rail (mobile) — sem duplicar componente (FUNIL-05); só o
 * componente interno e o `length` divergem por tier.
 *
 * Três caminhos:
 *  - reduced (FUNIL-04): <ScrollScene> ainda emite progress (README §reduced),
 *    mas SEM <StickyStage> (sem distância de scroll) e num único viewport
 *    (min-h-svh). board/rail recebem `finalState` e IGNORAM o progress,
 *    desenhando o estado final pré-montado (Marina na col 4, roxo aceso, selo
 *    visível). Sem scrub, sem scroll morto. Colapsa igual o Hero
 *    (min-h-[200svh]→min-h-svh).
 *  - mobile: <FunnelRail> (rail de 4 chips + card central), length 420svh.
 *  - desktop/tablet: <FunnelBoard> (board 4 colunas), length 560svh.
 *
 * Atmosfera: wash radial roxo 6% no topo do palco (rgba — brand-lock safe),
 * aria-hidden. NÃO é um dos 4 "momentos" roxos (é textura sub-threshold).
 *
 * Perf: seção abaixo da dobra (sem LCP/priority). useDeviceTier retorna
 * "desktop" no SSR e corrige pós-mount; a caixa é reservada em svh em qualquer
 * tier → o swap de tier não causa CLS. Transform/opacity only.
 */
import type { MotionValue } from "motion/react";
import { ScrollScene, StickyStage } from "@/components/motion";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { FunnelHead } from "./FunnelHead";
import { FunnelBoard } from "./FunnelBoard";
import { FunnelRail } from "./FunnelRail";
import { FunnelClosing } from "./FunnelClosing";

const SCROLL_OFFSET = ["start start", "end end"] as [string, string];

// Wash atmosférico: 6% roxo no topo do palco (verbatim do protótipo aprovado),
// definido como classe `.funnel-atmosphere` em globals.css — as porcentagens de
// gradiente ficam no CSS, fora do audit no-metric FUNIL-02 (que leria `%`).

// Seletor board-vs-rail: o ÚNICO ponto de divergência por tier (FUNIL-05).
function FunnelStageBody({
  isMobile,
  progress,
  finalState = false,
}: {
  isMobile: boolean;
  progress: MotionValue<number>;
  finalState?: boolean;
}) {
  return isMobile ? (
    <FunnelRail progress={progress} finalState={finalState} />
  ) : (
    <FunnelBoard progress={progress} finalState={finalState} />
  );
}

export function Funnel() {
  const tier = useDeviceTier();
  const reduced = tier === "reduced";
  const isMobile = tier === "mobile";
  const length = isMobile ? ("420svh" as const) : ("560svh" as const);

  // ── Caminho reduced: ScrollScene emite progress (ignorado), SEM StickyStage,
  //    1 viewport, estado final pré-montado. Sem scroll morto.
  if (reduced) {
    return (
      <section
        id="funnel"
        aria-labelledby="funnel-headline"
        className="relative min-h-svh overflow-hidden bg-funnel-stage"
      >
        <div
          aria-hidden="true"
          className="funnel-atmosphere pointer-events-none absolute inset-0 z-0"
        />
        <ScrollScene as="div" offset={SCROLL_OFFSET} className="relative">
          {(progress) => (
            <div className="relative flex min-h-svh flex-col">
              <FunnelHead />
              <div className="relative flex-1">
                <FunnelStageBody isMobile={isMobile} progress={progress} finalState />
              </div>
              <div className="py-20">
                <FunnelClosing />
              </div>
            </div>
          )}
        </ScrollScene>
      </section>
    );
  }

  // ── Caminho animado (desktop/tablet/mobile): mesmo progress, length por tier.
  return (
    <section
      id="funnel"
      aria-labelledby="funnel-headline"
      className="relative bg-funnel-stage"
    >
      <div
        aria-hidden="true"
        className="funnel-atmosphere pointer-events-none absolute inset-0 z-0"
      />
      <ScrollScene as="div" offset={SCROLL_OFFSET} className="relative">
        {(progress) => (
          <StickyStage length={length}>
            <div className="relative flex h-svh w-full flex-col justify-center overflow-hidden">
              <FunnelHead />
              <div className="relative">
                <FunnelStageBody isMobile={isMobile} progress={progress} />
              </div>
            </div>
          </StickyStage>
        )}
      </ScrollScene>
      {/* Fechamento após o palco — entra na leitura natural depois do clímax. */}
      <div className="relative z-10 py-24">
        <FunnelClosing />
      </div>
    </section>
  );
}
