---
phase: 02-motion-primitives
plan: 03
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/components/motion/scroll-scene.tsx
  - src/components/motion/text-split.tsx
  - src/components/motion/internal/use-line-grouping.ts
  - src/components/motion/index.ts
requirements:
  - MOTION-04
  - MOTION-05
  - MOTION-07
  - MOTION-08
autonomous: true
must_haves:
  truths:
    - "`<ScrollScene>` aceita render prop `(progress: MotionValue<number>) => ReactNode` (D-01)"
    - "`<ScrollScene>` expõe MotionValue<number> 0→1 derivado da posição da seção no viewport (D-02)"
    - "`<ScrollScene>` aceita prop `offset` opcional com default ['start end', 'end start'] (D-03)"
    - "`<ScrollScene>` é um Client Component (`'use client'`) (D-04)"
    - "`<TextSplit>` faz split por palavra no desktop, por linha no mobile/tablet (MOTION-04, D-12)"
    - "`<TextSplit>` em reduced motion: texto final imediato, zero animação"
    - "Implementação TextSplit: spans manuais, sem dependência externa (D-12)"
    - "Ambos primitives exportados pelo barrel"
  artifacts:
    - path: "src/components/motion/scroll-scene.tsx"
      provides: "<ScrollScene> primitive — GSAP-future-ready boundary (MOTION-05)"
      contains: "@frozen"
    - path: "src/components/motion/text-split.tsx"
      provides: "<TextSplit> primitive (MOTION-04)"
      contains: "@frozen"
    - path: "src/components/motion/internal/use-line-grouping.ts"
      provides: "Helper interno que agrupa words em lines via getBoundingClientRect (D-12)"
    - path: "src/components/motion/index.ts"
      provides: "Barrel re-exporta ScrollScene, TextSplit + tipos"
      contains: "ScrollScene"
  key_links:
    - from: "src/components/motion/scroll-scene.tsx"
      to: "src/components/motion/internal/use-scroll-progress-in-range"
      via: "useScrollProgressInRange + offset prop pass-through"
      pattern: "useScrollProgressInRange"
    - from: "src/components/motion/text-split.tsx"
      to: "@/hooks/use-device-tier"
      via: "useDeviceTier() para escolher word vs line split"
      pattern: "useDeviceTier"
    - from: "src/components/motion/text-split.tsx"
      to: "src/components/motion/internal/use-line-grouping"
      via: "useLineGrouping para agrupar spans em linhas mobile/tablet"
      pattern: "useLineGrouping"
---

<objective>
Implementar `<ScrollScene>` — a primitiva MAIS CRÍTICA da fase (boundary GSAP-future-ready, contrato gravado em pedra após este plano) — e `<TextSplit>` (reveal de headlines por palavra/linha sem dependência externa).

`<ScrollScene>` define o contrato D-01..D-04: render prop, MotionValue<number> 0→1 plain, prop `offset` opcional, `'use client'`. É este contrato que torna possível trocar Motion → GSAP futuramente em uma seção sem mexer no caller. **A API congela após este plano** — qualquer mudança subsequente requer PR `motion-api-change` + aprovação Lenny.

`<TextSplit>` (D-12): split por palavra (desktop, stagger ~25ms) ou linha (mobile/tablet, stagger ~80ms). Implementação manual com getBoundingClientRect para agrupar palavras em linhas — sem `splitting.js`, sem libs externas (D-12).

Purpose: Estas são as primitivas com APIs mais delicadas — ScrollScene pela criticidade arquitetural, TextSplit pela complexidade do measurement client-side. Isolá-las num plano permite foco total.

Output: 2 componentes funcionais, 1 helper interno, barrel atualizado, contratos exportados.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@src/hooks/use-device-tier.ts
@src/components/motion/index.ts
@src/components/motion/internal/easing.ts
@src/components/motion/internal/use-scroll-progress-in-range.ts

<interfaces>
<!-- Contratos CONGELADOS após este plano. Mudanças = PR motion-api-change. -->

From src/components/motion/scroll-scene.tsx (a ser criado):
```typescript
/** @frozen — MOTION-05. Contrato GSAP-future-ready. Mudanças exigem PR `motion-api-change`. */
import type { MotionValue } from "motion/react";
import type { ReactNode } from "react";

export interface ScrollSceneProps {
  /**
   * Render prop (D-01). Recebe MotionValue<number> 0→1 (D-02) representando
   * a posição da seção no viewport segundo `offset`.
   *
   * Consumidores SEMPRE acessam o progress via este argumento — NUNCA importam
   * useScroll/useTransform de motion/react diretamente em código de seção (MOTION-05).
   */
  children: (progress: MotionValue<number>) => ReactNode;
  /**
   * Range do scroll mapeado para 0→1 (D-03). Sintaxe Framer Motion useScroll.
   * Default ['start end', 'end start'] — começa quando topo da scene toca
   * bottom do viewport, termina quando bottom da scene sai por cima.
   */
  offset?: [string, string];
  /** className do wrapper externo (seção). */
  className?: string;
  /** Tag DOM do wrapper. Default "section". */
  as?: "section" | "div" | "article";
}

export function ScrollScene(props: ScrollSceneProps): JSX.Element;
```

From src/components/motion/text-split.tsx (a ser criado):
```typescript
/** @frozen — MOTION-04. Mudanças exigem PR `motion-api-change`. */
export interface TextSplitProps {
  /** Texto a revelar. STRING simples — sem HTML aninhado. */
  text: string;
  /**
   * Tag DOM do wrapper. Default "h2".
   * Limite ao headline set: h1..h6, p, span.
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  /** className passthrough no wrapper. */
  className?: string;
  /** Atrasa start global por N ms. Default 0. */
  delayMs?: number;
  /** Threshold de viewport entry. Default 0.4 (texto precisa estar 40% visível). */
  amount?: number;
}

export function TextSplit(props: TextSplitProps): JSX.Element;
```

From src/components/motion/internal/use-line-grouping.ts (a ser criado):
```typescript
/**
 * Helper interno: agrupa um array de spans (palavras) em "linhas" detectando
 * mudança de offsetTop via getBoundingClientRect.
 * Re-mede em resize/rotate (debounced).
 */
export function useLineGrouping(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
): number[]; // retorna lineIndex[] por wordIndex
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Implementar `<ScrollScene>` (MOTION-05) com contrato D-01..D-04 congelado</name>
  <files>src/components/motion/scroll-scene.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-01..D-04" (render prop, MotionValue<number> 0→1, offset prop, 'use client')
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"specifics" ("ScrollScene como boundary do projeto")
    - src/components/motion/internal/use-scroll-progress-in-range.ts (helper a usar — passa offset)
    - .planning/research/STACK.md §"GSAP-future contract"
    - .planning/research/ARCHITECTURE.md §"primitives responsibilities"
  </read_first>
  <action>
    Criar `src/components/motion/scroll-scene.tsx`. Esta é a primitiva MAIS CRÍTICA — contrato é gravado em pedra após este plano.

    ```typescript
    "use client";
    /**
     * @frozen — ScrollScene (MOTION-05). API CONGELADA após Phase 2.
     *
     * Contrato GSAP-future-ready (PROJECT.md). Toda a arquitetura "trocar Motion → GSAP
     * em uma seção sem refactor" depende deste contrato estar estável.
     *
     * Decisões (CONTEXT.md):
     * - D-01: consumo via RENDER PROP apenas — sem context, sem hooks externos.
     * - D-02: progress é `MotionValue<number>` 0→1 plain — caller deriva sub-ranges
     *         via useTransform(progress, [0, .3, .7, 1], [...]) localmente.
     * - D-03: `offset` opcional, sintaxe Framer Motion useScroll.
     *         Default ['start end', 'end start'] cobre 90% dos casos.
     * - D-04: `'use client'` obrigatório. Pai pode permanecer RSC (page.tsx ok).
     *
     * Política de mudança (D-16): exige PR com label `motion-api-change`
     * + aprovação explícita do Lenny.
     *
     * Consumidores NUNCA importam useScroll/useTransform de motion/react direto —
     * sempre via render prop deste componente (MOTION-05).
     */
    import { useRef, type ReactNode } from "react";
    import type { MotionValue } from "motion/react";
    import { useScrollProgressInRange } from "./internal/use-scroll-progress-in-range";

    export interface ScrollSceneProps {
      children: (progress: MotionValue<number>) => ReactNode;
      offset?: [string, string];
      className?: string;
      as?: "section" | "div" | "article";
    }

    export function ScrollScene({
      children,
      offset,
      className,
      as = "section",
    }: ScrollSceneProps) {
      const ref = useRef<HTMLElement>(null);
      const progress = useScrollProgressInRange(ref, offset);
      const Tag = as;

      // Pass ref via cast — Tag union garante elemento HTML.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (
        <Tag ref={ref as any} className={className}>
          {children(progress)}
        </Tag>
      );
    }
    ```

    Observações:

    1. **Render prop é a única API** — qualquer alternativa (hook escape hatch, context) violaria D-01 (descartado em "deferred").
    2. **Reduced motion: NÃO trata aqui.** O contrato é "emite MotionValue 0→1". Em reduced, o ScrollScene continua emitindo, mas o **consumidor** decide se usa o progress ou ignora. Casos D-09 (StickyStage aninhado em reduced retorna progress=1 fixo) são responsabilidade do StickyStage, não do ScrollScene. **Esta é uma decisão consciente** — manter ScrollScene puro e composável.
    3. **`ref as any`:** TypeScript não consegue inferir o tipo correto de ref para uma tag dinâmica restrita ao union. Cast pragmático aceito (também usado em projetos como Radix). Comentário inline explica.
    4. **NÃO importar Motion direto no caller:** este é o gating point. Se uma seção precisa de useTransform, ela faz dentro do render prop a partir do `progress` recebido — Motion é importado dentro do JSX da seção via `import { useTransform } from "motion/react"`. **Exceção controlada:** seções podem importar `useTransform` apenas dentro de render prop de ScrollScene. README (Plan 06) documenta esta nuance.

    NÃO adicionar export ao barrel ainda — Task 4.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/scroll-scene.tsx` exit 0
    - `grep -q "@frozen" src/components/motion/scroll-scene.tsx`
    - `grep -q "MOTION-05" src/components/motion/scroll-scene.tsx`
    - `grep -q "use client" src/components/motion/scroll-scene.tsx`
    - `grep -q "ScrollSceneProps" src/components/motion/scroll-scene.tsx`
    - `grep -q "(progress: MotionValue<number>) => ReactNode" src/components/motion/scroll-scene.tsx`
    - `grep -q "useScrollProgressInRange" src/components/motion/scroll-scene.tsx`
    - `grep -q "D-01" src/components/motion/scroll-scene.tsx`
    - `grep -q "D-04" src/components/motion/scroll-scene.tsx`
    - `npx tsc --noEmit` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>ScrollScene implementado com render prop, MotionValue<number>, prop offset, 'use client', contrato congelado documentado nos comments, typecheck passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Implementar helper interno `useLineGrouping` (split de palavras em linhas via getBoundingClientRect)</name>
  <files>src/components/motion/internal/use-line-grouping.ts</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-12" ("client-side split por palavra sempre, depois getBoundingClientRect para agrupar em linhas")
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"Claude's Discretion" ("estratégia exata de measurement do TextSplit em mobile (debounce em resize, recalc em rotate)")
  </read_first>
  <action>
    Criar `src/components/motion/internal/use-line-grouping.ts`. Helper INTERNO (não exportado pelo barrel — apenas TextSplit consome).

    ```typescript
    "use client";
    /**
     * Helper interno: agrupa spans-palavras em "linhas" detectando mudança
     * de `offsetTop` (= quebra de linha visual).
     *
     * Estratégia (D-12):
     * 1. Container tem N spans filhos (palavras renderizadas pelo TextSplit).
     * 2. Após mount + após resize/rotate, percorrer spans e atribuir lineIndex
     *    incrementando quando `offsetTop` muda.
     * 3. Resize handler debounced (150ms) — rotate dispara resize automaticamente
     *    em browsers modernos, então não precisamos de orientationchange listener
     *    separado.
     *
     * Retorna: array `number[]` onde `result[wordIndex] = lineIndex`.
     * Antes do primeiro measurement (SSR ou pré-mount), retorna array vazio.
     */
    import { useEffect, useState, type RefObject } from "react";

    const DEBOUNCE_MS = 150;

    export function useLineGrouping(
      containerRef: RefObject<HTMLElement | null>,
      enabled: boolean
    ): number[] {
      const [lineMap, setLineMap] = useState<number[]>([]);

      useEffect(() => {
        if (!enabled) {
          setLineMap([]);
          return;
        }

        const measure = () => {
          const el = containerRef.current;
          if (!el) return;
          const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
          if (spans.length === 0) {
            setLineMap([]);
            return;
          }
          let lineIndex = 0;
          let prevTop: number | null = null;
          const map: number[] = [];
          for (const span of spans) {
            const top = span.offsetTop;
            if (prevTop !== null && top !== prevTop) lineIndex += 1;
            map.push(lineIndex);
            prevTop = top;
          }
          setLineMap(map);
        };

        measure();

        let timer: ReturnType<typeof setTimeout> | null = null;
        const onResize = () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(measure, DEBOUNCE_MS);
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
          if (timer) clearTimeout(timer);
          window.removeEventListener("resize", onResize);
        };
      }, [containerRef, enabled]);

      return lineMap;
    }
    ```

    Observações:

    1. **`data-word` attribute:** convenção pra encontrar spans. TextSplit (Task 3) renderiza `<span data-word>` por palavra.
    2. **Sem ResizeObserver:** window resize listener cobre. ResizeObserver acrescentaria nada útil aqui — só ganha precisão quando o container muda sem viewport mudar, caso raro pra headlines.
    3. **`enabled` flag:** TextSplit passa `false` quando tier é desktop (split por palavra, sem agrupamento de linhas).
    4. **Performance:** measurement só dispara em mount + resize debounced. Sem rAF loop, sem polling.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/internal/use-line-grouping.ts` exit 0
    - `grep -q "useLineGrouping" src/components/motion/internal/use-line-grouping.ts`
    - `grep -q "use client" src/components/motion/internal/use-line-grouping.ts`
    - `grep -q "data-word" src/components/motion/internal/use-line-grouping.ts`
    - `grep -q "DEBOUNCE_MS" src/components/motion/internal/use-line-grouping.ts`
    - `grep -q "offsetTop" src/components/motion/internal/use-line-grouping.ts`
    - `npx tsc --noEmit` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>Helper criado, debounce 150ms, listener cleanup correto, atributo data-word como convenção, typecheck passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Implementar `<TextSplit>` (MOTION-04) com granularidade D-12</name>
  <files>src/components/motion/text-split.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-12" (desktop word stagger 25ms, mobile/tablet line stagger 80ms, reduced instant)
    - src/hooks/use-device-tier.ts
    - src/components/motion/internal/easing.ts (MOTION_EASING, REVEAL_DURATION_MS)
    - src/components/motion/internal/use-line-grouping.ts (criado em Task 2)
    - .planning/research/PITFALLS.md §"#19 motion property choice"
  </read_first>
  <action>
    Criar `src/components/motion/text-split.tsx`:

    ```typescript
    "use client";
    /**
     * @frozen — TextSplit (MOTION-04).
     *
     * Faz reveal de texto por palavra (desktop) ou linha (mobile/tablet)
     * via spans manuais — sem dependência externa (D-12).
     *
     * Granularidade (D-12):
     *   - desktop:  split por palavra, stagger 25ms
     *   - tablet:   split por linha,    stagger 80ms
     *   - mobile:   split por linha,    stagger 80ms (REQ MOTION-04 obriga line)
     *   - reduced:  instant — texto renderizado em estado final, zero animação
     *
     * MOTION-08: anima apenas opacity + transform (translateY).
     *
     * Strategy:
     * 1. Sempre splita o texto em palavras (`text.split(/\s+/)`).
     * 2. Renderiza um `<span data-word>` por palavra (com `&nbsp;` ou space entre).
     * 3. Em mobile/tablet, useLineGrouping mapeia cada palavra → lineIndex.
     * 4. Stagger é calculado a partir do índice apropriado (word ou line).
     *
     * Política de mudança (D-16): exige PR `motion-api-change`.
     */
    import { useRef, type ReactNode } from "react";
    import { motion, useReducedMotion } from "motion/react";
    import { useDeviceTier } from "@/hooks/use-device-tier";
    import { MOTION_EASING, REVEAL_DURATION_MS } from "./internal/easing";
    import { useLineGrouping } from "./internal/use-line-grouping";

    export interface TextSplitProps {
      text: string;
      as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
      className?: string;
      delayMs?: number;
      amount?: number;
    }

    const WORD_STAGGER_MS = 25;
    const LINE_STAGGER_MS = 80;

    export function TextSplit({
      text,
      as = "h2",
      className,
      delayMs = 0,
      amount = 0.4,
    }: TextSplitProps) {
      const tier = useDeviceTier();
      const reducedMotion = useReducedMotion();
      const isReduced = reducedMotion || tier === "reduced";
      const splitByLine = tier === "mobile" || tier === "tablet";

      const containerRef = useRef<HTMLElement>(null);
      const lineMap = useLineGrouping(containerRef, splitByLine && !isReduced);

      const words = text.split(/\s+/).filter(Boolean);
      const Tag = as;

      // Reduced: render direto, texto plano, sem motion wrapper.
      if (isReduced) {
        return <Tag className={className}>{text}</Tag>;
      }

      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Tag ref={containerRef as any} className={className} aria-label={text}>
          {words.map((word, i) => {
            const staggerIndex = splitByLine
              ? lineMap[i] ?? 0 // pré-medição: usa 0 (apaga até medir)
              : i;
            const staggerMs = splitByLine ? LINE_STAGGER_MS : WORD_STAGGER_MS;
            const delaySeconds = (delayMs + staggerIndex * staggerMs) / 1000;

            // Antes da medição em line mode, lineMap é vazio → todas palavras
            // ficam invisíveis. Render in-place após o measurement do useEffect.
            const initialOpacity = splitByLine && lineMap.length === 0 ? 0 : 0;

            return (
              <motion.span
                key={`${word}-${i}`}
                data-word
                aria-hidden="true"
                initial={{ opacity: initialOpacity, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount }}
                transition={{
                  duration: REVEAL_DURATION_MS / 1000,
                  delay: delaySeconds,
                  ease: MOTION_EASING as unknown as number[],
                }}
                style={{ display: "inline-block", whiteSpace: "pre" }}
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            );
          })}
        </Tag>
      );
    }
    ```

    Observações:

    1. **Accessibility:** `aria-label={text}` no wrapper + `aria-hidden="true"` nos spans → screen readers leem texto completo, não palavra-por-palavra com pauses.
    2. **Espaço entre palavras:** `whiteSpace: "pre"` + adicionar `" "` no children mantém quebras naturais em flow. Alternativa (`<wbr/>` ou `display: inline`) é mais frágil em mobile.
    3. **Pré-medição em line mode:** durante o primeiro paint (antes do useEffect rodar), lineMap está vazio → todas palavras com delay=0 disparariam juntas. Aceitamos esse FOUC mínimo: é um único frame antes da primeira measurement. Para perfeição, poderíamos esconder o texto até measure, mas o trade-off (texto invisível visível por 1 frame vs animação levemente fora) favorece o atual.
    4. **NÃO adicionar export ao barrel ainda** — Task 4.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/text-split.tsx` exit 0
    - `grep -q "@frozen" src/components/motion/text-split.tsx`
    - `grep -q "MOTION-04" src/components/motion/text-split.tsx`
    - `grep -q "useDeviceTier" src/components/motion/text-split.tsx`
    - `grep -q "useLineGrouping" src/components/motion/text-split.tsx`
    - `grep -q "MOTION_EASING" src/components/motion/text-split.tsx`
    - `grep -q "WORD_STAGGER_MS = 25" src/components/motion/text-split.tsx`
    - `grep -q "LINE_STAGGER_MS = 80" src/components/motion/text-split.tsx`
    - `grep -q "TextSplitProps" src/components/motion/text-split.tsx`
    - `grep -q "data-word" src/components/motion/text-split.tsx`
    - `grep -q "aria-label" src/components/motion/text-split.tsx`
    - `! grep -E "width:|height:|top:|left:" src/components/motion/text-split.tsx`
    - `npx tsc --noEmit` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>TextSplit implementado com word/line split por tier, reduced motion = plain text, a11y correta (aria-label + aria-hidden), data-word match com useLineGrouping, typecheck passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Re-exportar ScrollScene e TextSplit no barrel @/components/motion</name>
  <files>src/components/motion/index.ts</files>
  <read_first>
    - src/components/motion/index.ts (estado pós Plan 02)
    - src/components/motion/scroll-scene.tsx
    - src/components/motion/text-split.tsx
  </read_first>
  <action>
    Atualizar barrel adicionando ScrollScene e TextSplit + tipos. Manter exports anteriores (RevealOnView, ParallaxLayer) e o header @frozen. Manter placeholder comentado para StickyStage (vem em Plan 04).

    Conteúdo final:

    ```typescript
    /**
     * @frozen — API congelada das primitivas de motion (MOTION-06).
     *
     * Política de mudanças (D-16):
     * - Mudanças nesta API exigem PR com label `motion-api-change`
     *   e aprovação explícita do Lenny.
     * - Consumidores (seções, atoms) NUNCA importam de `motion/react`
     *   diretamente — apenas deste barrel.
     *   EXCEÇÃO controlada: dentro do render prop de <ScrollScene>, seções
     *   podem importar `useTransform` de `motion/react` para derivar sub-ranges
     *   do `progress` recebido (MOTION-05 + D-02). Documentado no README.
     * - Imports de paths internos (`./internal/*`) não são permitidos fora desta pasta.
     */

    export { RevealOnView } from "./reveal-on-view";
    export type { RevealOnViewProps } from "./reveal-on-view";

    export { ParallaxLayer } from "./parallax-layer";
    export type { ParallaxLayerProps } from "./parallax-layer";

    export { ScrollScene } from "./scroll-scene";
    export type { ScrollSceneProps } from "./scroll-scene";

    export { TextSplit } from "./text-split";
    export type { TextSplitProps } from "./text-split";

    // Próximo export (Plan 04):
    // export { StickyStage } from "./sticky-stage";
    // export type { StickyStageProps } from "./sticky-stage";
    ```
  </action>
  <acceptance_criteria>
    - `grep -q "export \\{ ScrollScene \\}" src/components/motion/index.ts`
    - `grep -q "export \\{ TextSplit \\}" src/components/motion/index.ts`
    - `grep -q "export type \\{ ScrollSceneProps \\}" src/components/motion/index.ts`
    - `grep -q "export type \\{ TextSplitProps \\}" src/components/motion/index.ts`
    - `grep -q "RevealOnView" src/components/motion/index.ts` (mantido)
    - `grep -q "ParallaxLayer" src/components/motion/index.ts` (mantido)
    - `grep -q "EXCEÇÃO controlada" src/components/motion/index.ts` (regra ScrollScene render prop documentada)
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Barrel exporta 4 das 5 primitivas + tipos, regra de exceção ScrollScene documentada inline, build passa.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
N/A — pure client-side motion library; no inputs/outputs.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-03 | N/A | ScrollScene, TextSplit | accept | Componentes declarativos sem inputs externos. `text` prop em TextSplit é renderizado como text node (não dangerouslySetInnerHTML) — XSS impossível mesmo com input não confiável. |
</threat_model>

<validation>
## Validação automatizada
1. `npx tsc --noEmit` exit 0
2. `npm run build` exit 0
3. Greps de acceptance_criteria passam

## Validação manual (one-off — formal /dev showcase é Plan 05)
- Criar página temporária ou usar /dev raiz para smoke test:
  - `<ScrollScene>{(p) => <motion.div style={{ opacity: p }} />}</ScrollScene>` — opacity 0→1 conforme scroll
  - `<TextSplit text="Likro para clínicas" as="h2" />` — desktop: palavras escalonam; mobile (DevTools emulation): linhas escalonam
- DevTools → Rendering → `prefers-reduced-motion: reduce`:
  - ScrollScene: progress ainda emite (caller decide reagir ou não — documentado)
  - TextSplit: plain text instantâneo (sem motion wrapper, sem spans com initial=0)
- DevTools → Performance:
  - ScrollScene: caller dictates — TextSplit/RevealOnView dentro respeitam transform/opacity only
  - TextSplit: confirmar apenas transform+opacity nas mutações

## A11y check
- Screen reader (VoiceOver/NVDA) lendo `<TextSplit text="Likro para clínicas" />` deve falar a frase completa, não "Likro... pausa... para... pausa... clínicas" (graças a aria-label no wrapper + aria-hidden nos spans)

## Reduced motion checklist
- macOS Reduce Motion ON → TextSplit renderiza texto plano sem spans visíveis → ScrollScene continua emitindo progress (caller decide)
</validation>

<success_criteria>
1. `<ScrollScene>` aceita render prop, emite MotionValue<number> 0→1, prop offset opcional, 'use client' (D-01..D-04)
2. `<TextSplit>` splita por palavra em desktop (stagger 25ms), por linha em mobile/tablet (stagger 80ms)
3. `<TextSplit>` em reduced: render direto sem motion wrapper, plain text
4. `<TextSplit>` aria-label preserva texto pra screen reader; spans aria-hidden
5. Helper `useLineGrouping` mede via offsetTop, debounce 150ms, cleanup correto
6. Barrel exporta 4 das 5 primitivas + tipos (StickyStage fica para Plan 04)
7. Build passa, MOTION-08 verificado (sem layout properties)
</success_criteria>

<output>
Após completion, criar `.planning/phases/02-motion-primitives/02-03-SUMMARY.md` documentando:
- Contrato CONGELADO de ScrollScene (render prop + MotionValue<number> 0→1 + offset prop + 'use client')
- Exceção controlada: dentro do render prop de ScrollScene, seções PODEM importar useTransform de motion/react para derivar sub-ranges
- TextSplit strategy: word desktop / line mobile+tablet, sem dep externa, useLineGrouping helper interno
- A11y pattern: aria-label no wrapper, aria-hidden nos spans
- Próximo plano: StickyStage (Plan 04) — primitiva mais crítica em risco real-device
</output>
