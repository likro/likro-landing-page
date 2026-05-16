"use client";
/**
 * @frozen — StickyStage (MOTION-03). API CONGELADA após Phase 2.
 *
 * Pin estrutural via `position: sticky` NATIVO do CSS — sem engine JS de pinning.
 * MITIGA RISCO CRÍTICO #3 (smooth-scroll engine + sticky no iOS) combinando:
 *   - D-05: smooth-scroll provider 1.3+ com `syncTouch: false` (configurado em
 *           Phase 1 FOUND-08) comporta sticky CSS nativamente em iOS Safari.
 *   - D-07: `svh` exclusivamente — outras viewport units proibidas neste contexto
 *           pra estabilizar o pin contra a address bar do iOS (pequena perda de
 *           espaço vertical aceita em troca de estabilidade absoluta).
 *   - D-08: Zero acoplamento com o smooth-scroll engine (sem hooks dele, sem
 *           atributos data-* dele). Sticky CSS + provider já configurado é
 *           suficiente. Coordenação só será adicionada empiricamente se aparecer
 *           caso real durante validação real-device, nunca por default.
 *
 * Estrutura DOM:
 *   <div style={{ height: length }}>             ← wrapper externo: altura do pin
 *     <div className="sticky top-0 h-svh ...">   ← stage pinado (uma viewport svh)
 *       {children}                                ← conteúdo da scene
 *     </div>
 *   </div>
 *
 * Compile-time guard (D-07 enforcement): a prop `length` tem tipo
 * template literal `${number}svh`. TypeScript bloqueia qualquer outro unit
 * (px, %, number cru, ou viewport units diferentes) já em compile-time — não
 * depende de runtime check. É a camada que torna D-07 inviolável por callers.
 *
 * Reduced motion (D-09): mantém sticky CSS (estrutura). As primitivas aninhadas
 * (ScrollScene, ParallaxLayer, TextSplit) já tratam reduced internamente — o
 * StickyStage não precisa toggle nenhum porque sticky NÃO é animação, é layout.
 *
 * Política de mudança (D-16): exige PR com label `motion-api-change`
 * + aprovação explícita do Lenny.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StickyStageProps {
  /**
   * Conteúdo a pinar. Recomendação: um único filho (será o "stage" pinado).
   * Múltiplos filhos ficam todos dentro do wrapper sticky, mas o padrão é
   * usar um `<div>` com o conteúdo da scene (ex: composição com ScrollScene
   * + TextSplit + ParallaxLayer aninhados).
   */
  children: ReactNode;
  /**
   * Duração explícita do pin em viewport units (D-06).
   * Template literal type força `svh` — outras unidades são bloqueadas em
   * compile-time pelo TypeScript (D-07).
   *
   * Exemplos: `"150svh"` (Bridge), `"400svh"` (Product 4 pilares).
   *
   * Sem auto-medição: estável contra children animando ou imagens carregando tarde.
   */
  length: `${number}svh`;
  /** className passthrough no wrapper externo (não no sticky filho). */
  className?: string;
}

export function StickyStage({ children, length, className }: StickyStageProps) {
  return (
    <div className={cn("relative", className)} style={{ height: length }}>
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
