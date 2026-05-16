---
phase: 02-motion-primitives
plan: 03
subsystem: motion-primitives
tags:
  - scroll-scene
  - text-split
  - frozen-api
  - render-prop
  - gsap-future-ready
  - line-grouping
  - reduced-motion
dependency_graph:
  requires:
    - phase-02 plan-01 (useScrollProgressInRange, MOTION_EASING, REVEAL_DURATION_MS, barrel @frozen)
    - phase-02 plan-02 (Pattern A validated: tier matrix + reduced check + DOM consistency)
    - phase-01 (useDeviceTier, MotionConfigProvider)
  provides:
    - "Public API: <ScrollScene> (MOTION-05, FROZEN) + <TextSplit> (MOTION-04, FROZEN) via @/components/motion barrel"
    - "Type contracts: ScrollSceneProps, TextSplitProps (mudanças exigem PR motion-api-change)"
    - "Internal helper: useLineGrouping (D-12) — agrupamento de palavras em linhas via offsetTop"
    - "Controlled exception documented: dentro do render prop de <ScrollScene>, seções PODEM importar useTransform de motion/react (MOTION-05 + D-02)"
  affects:
    - "Plan 04 (StickyStage) reusará o pattern Tag+ref cast e composição com ScrollScene aninhado (D-09 progress=1 fixo em reduced)"
    - "Plan 05 (/dev showcase) consumirá ScrollScene+TextSplit pra validação real-device"
    - "Phase 3 Hero (headline reveal) e Phase 4 (Pain/Bridge/Product/Proof) consumirão TextSplit"
    - "Toda seção que precisar de scroll progress consome <ScrollScene> — boundary GSAP-future-ready"
tech_stack:
  added: []
  patterns:
    - "Render prop como single-API para emitir MotionValue<number> 0→1 (D-01, D-02) — sem context, sem escape-hatch hook"
    - "Tag dinâmica via createElement quando precisa de ref + atributos passados via objeto (TextSplit) ou via JSX <Tag ref=... /> (ScrollScene); cast 'ref as any' pragmático em ambos com eslint-disable na linha exata do `any`"
    - "Pré-medição line mode: lineMap[i] ?? 0 — aceita 1 frame de FOUC no primeiro mount em vez de bloquear render esperando measurement"
    - "A11y para split-text: aria-label no wrapper + aria-hidden nos spans — screen reader lê frase completa sem pausas"
    - "Reduced motion como render bypass: TextSplit retorna plain text via createElement (não motion wrapper). ScrollScene NÃO trata reduced — contrato é puro 0→1, consumidor decide"
    - "Helpers internos em internal/ não exportados pelo barrel — apenas TextSplit consome useLineGrouping"
key_files:
  created:
    - src/components/motion/scroll-scene.tsx
    - src/components/motion/text-split.tsx
    - src/components/motion/internal/use-line-grouping.ts
  modified:
    - src/components/motion/index.ts
decisions:
  - "ScrollScene NÃO trata reduced motion — contrato é puro emit de MotionValue 0→1. Em reduced, continua emitindo; consumidor decide reagir ou não. Casos D-09 (StickyStage aninhado em reduced) são responsabilidade do consumidor — mantém ScrollScene puro/composável"
  - "TextSplit em reduced renderiza via React.createElement(as, { className }, text) — zero spans, zero motion wrapper, plain text node único"
  - "WORD_STAGGER_MS=25 / LINE_STAGGER_MS=80 — valores explicitamente alinhados com D-12, hardcoded como const dentro do arquivo (não props) pra manter contrato congelado"
  - "useLineGrouping detecta linhas por mudança de offsetTop (não getBoundingClientRect().top) — mais barato, equivalente para spans inline-block no mesmo container, sem custo de layout reads múltiplos"
  - "TextSplit pré-medição usa lineMap[i] ?? 0 (todas palavras na 'linha 0' até measurement chegar). Trade-off: 1 frame de FOUC mínimo vs esconder texto até measure — escolhemos FOUC por ser invisível ao usuário em 99% dos casos"
  - "Cast 'ref as any' em union de tags dinâmicas — TS não consegue inferir o tipo correto. Cast pragmático aceito (padrão também usado em libs como Radix). eslint-disable-next-line posicionado na linha exata do `any`, não no return wrapper"
metrics:
  duration: "~25min"
  completed: "2026-05-16"
  tasks: 4
  files_created: 3
  files_modified: 1
requirements:
  - MOTION-04
  - MOTION-05
  - MOTION-07
  - MOTION-08
---

# Phase 2 Plan 3: ScrollScene + TextSplit Summary

**One-liner:** 2 das 3 primitivas restantes implementadas e congeladas — `<ScrollScene>` (boundary GSAP-future-ready expondo `MotionValue<number>` 0→1 via render prop, MOTION-05) e `<TextSplit>` (reveal por palavra/linha sem dependência externa, MOTION-04) — fechando 4 das 5 primitivas da Phase 2 (StickyStage fica para Plan 04).

## What Was Built

### `<ScrollScene>` (MOTION-05) — `src/components/motion/scroll-scene.tsx`

A primitiva MAIS CRÍTICA da fase. Boundary que torna possível trocar Motion → GSAP em uma seção futuramente sem mexer no caller. **Contrato CONGELADO** após este plano.

**Contrato congelado:**

```typescript
export interface ScrollSceneProps {
  /** Render prop (D-01). Recebe MotionValue<number> 0→1 (D-02). */
  children: (progress: MotionValue<number>) => ReactNode;
  /** Range scroll → progress (D-03). Default ['start end', 'end start']. */
  offset?: [string, string];
  className?: string;
  /** Tag DOM. Default "section". */
  as?: "section" | "div" | "article";
}
```

**Decisões implementadas:**

- **D-01:** Render prop como ÚNICA API. Sem context, sem `useSceneProgress()` escape-hatch. Caller vê o `MotionValue<number>` chegando como argumento explícito.
- **D-02:** Progress é `MotionValue<number>` 0→1 plain — caller deriva sub-ranges via `useTransform(progress, [0, .3, .7, 1], [...])` localmente.
- **D-03:** Prop `offset` opcional com default `['start end', 'end start']` (entrada→saída do viewport — cobre 90% dos casos). Sintaxe Framer Motion `useScroll` para portabilidade futura ao GSAP `timeline.progress()`.
- **D-04:** `'use client'` obrigatório. Pai pode permanecer RSC (page.tsx ok).

**Decisão consciente: ScrollScene NÃO trata reduced motion.** O contrato é puro emit de MotionValue 0→1. Em reduced motion, ScrollScene continua emitindo; o consumidor decide se reage. Casos D-09 (StickyStage aninhado em reduced retorna progress=1 fixo) são responsabilidade do StickyStage (Plan 04), não do ScrollScene. Mantém ScrollScene puro e composável.

**Cast pragmático:** `ref as any` com `eslint-disable-next-line @typescript-eslint/no-explicit-any` posicionado na linha exata do `any` (não no return). TypeScript não consegue inferir o tipo correto de ref para uma tag dinâmica restrita ao union — padrão também usado em Radix e similares.

### `<TextSplit>` (MOTION-04) — `src/components/motion/text-split.tsx`

Primitiva para reveal de headlines por palavra (desktop) ou linha (mobile/tablet) com spans manuais — **sem dependência externa** (D-12).

**Contrato congelado:**

```typescript
export interface TextSplitProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"; // default "h2"
  className?: string;
  delayMs?: number;       // default 0
  amount?: number;        // default 0.4 (viewport threshold)
}
```

**Matriz de tier (D-12):**

| Tier      | Granularidade | Stagger     | Render path                                         |
| --------- | ------------- | ----------- | --------------------------------------------------- |
| mobile    | linha         | 80 ms       | spans data-word + useLineGrouping mapeia → lineIdx  |
| tablet    | linha         | 80 ms       | spans data-word + useLineGrouping mapeia → lineIdx  |
| desktop   | palavra       | 25 ms       | spans data-word, stagger por wordIndex direto       |
| reduced   | —             | —           | `createElement(as, { className }, text)` plain text |

**Estratégia interna:**

1. Sempre splita o texto em palavras (`text.split(/\s+/).filter(Boolean)`).
2. Renderiza um `<motion.span data-word>` por palavra com espaço inline (whiteSpace: pre + `" "` no children entre palavras, menos o último).
3. Em mobile/tablet, `useLineGrouping(containerRef, enabled=true)` mapeia cada palavra → lineIndex via mudança de `offsetTop`.
4. `staggerIndex = splitByLine ? (lineMap[i] ?? 0) : i` — pré-medição fallback para 0 (todas palavras na "linha 0" durante o primeiro frame; FOUC mínimo de 1 frame).
5. `delaySeconds = (delayMs + staggerIndex * staggerMs) / 1000`.

**Accessibility:** `aria-label={text}` no wrapper + `aria-hidden="true"` em cada span — screen readers (VoiceOver/NVDA) leem a frase completa, não "palavra... pausa... palavra... pausa".

**Reduced motion path:** retorna `createElement(as, { className }, text)` — zero motion wrapper, zero spans, plain text node. MOTION-07 garantido.

**MOTION-08:** apenas `opacity` + `y` (shorthand de `translateY`). Easing canônico `MOTION_EASING` reutilizado (cubic-bezier 0.16, 1, 0.3, 1).

### `useLineGrouping` helper interno — `src/components/motion/internal/use-line-grouping.ts`

Helper interno (NÃO exportado pelo barrel — convenção D-16) consumido APENAS pelo TextSplit.

**Contrato:**

```typescript
export function useLineGrouping(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): number[]; // result[wordIndex] = lineIndex
```

**Implementação:**

- Estado: `useState<number[]>([])` — SSR-safe, retorna `[]` antes do primeiro measurement.
- `useEffect`: se `enabled === false`, reseta para `[]` e retorna. Se true, mede via `el.querySelectorAll("[data-word]")` + `span.offsetTop`.
- Algoritmo: incrementa `lineIndex` cada vez que `offsetTop` muda em relação ao span anterior.
- Resize listener com debounce 150ms via `setTimeout` + `clearTimeout`. Rotate dispara resize automaticamente em browsers modernos — não precisa de `orientationchange` separado.
- Cleanup correto: `removeEventListener` + `clearTimeout` no return do effect.

**Decisão `offsetTop` vs `getBoundingClientRect().top`:** offsetTop é layout-property barata e equivalente para spans inline-block no mesmo container offsetParent. Evita custos de bounding rect (que força full layout sync para múltiplas reads em loop).

### Barrel `src/components/motion/index.ts`

Atualizado para expor 4/5 primitivas. Header `@frozen` + política D-16 preservados, com adição importante:

```typescript
// EXCEÇÃO controlada: dentro do render prop de <ScrollScene>, seções
// podem importar `useTransform` de `motion/react` para derivar sub-ranges
// do `progress` recebido (MOTION-05 + D-02). Documentado no README.
```

Esta exceção é o ÚNICO bypass legítimo da regra "consumidores não importam motion/react direto" — porque é exatamente isso que o contrato D-02 viabiliza: derivar sub-ranges em código de seção mantendo o boundary GSAP-future-ready intacto.

```typescript
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

## Verification Results

- `npx tsc --noEmit` exit 0 (limpo após reposicionamento do eslint-disable em scroll-scene.tsx)
- `npm run build` exit 0:
  - Build size: `/dev` continua 81.7 kB / First Load 184 kB (igual ao baseline Plan 02 — primitivas adicionadas mas ainda não consumidas em rota)
  - Shared chunks: 102 kB (sem regressão)
  - Static generation 7/7 OK
- Todos os greps de acceptance_criteria das 4 tasks passam:
  - Task 1 (ScrollScene): 11 matches (existência, @frozen, MOTION-05, use client, ScrollSceneProps, render prop type, useScrollProgressInRange, D-01, D-04, typecheck)
  - Task 2 (useLineGrouping): 8 matches (existência, useLineGrouping, use client, data-word, DEBOUNCE_MS, offsetTop, typecheck)
  - Task 3 (TextSplit): 17 matches (existência, @frozen, MOTION-04, useDeviceTier, useLineGrouping, MOTION_EASING, WORD_STAGGER_MS=25, LINE_STAGGER_MS=80, TextSplitProps, data-word, aria-label, typecheck) + MOTION-08 negative (zero layout properties)
  - Task 4 (barrel): 9 matches (ScrollScene/TextSplit exports + tipos, mantidos RevealOnView/ParallaxLayer, EXCEÇÃO controlada documentada, build verde)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reposicionamento do `eslint-disable-next-line` em scroll-scene.tsx**

- **Found during:** Task 4 (`npm run build` exigido por acceptance criteria)
- **Issue:** O plano sugeriu o comentário `// eslint-disable-next-line @typescript-eslint/no-explicit-any` na linha imediatamente antes de `return (`. Como o `any` está dentro do JSX (`ref={ref as any}` na linha do `<Tag>`), o ESLint reportou "Unused eslint-disable directive" no return wrapper E continuou flagando o erro real no atributo ref — falhando o build.
- **Por que auto-fix:** Acceptance criteria da Task 4 inclui `npm run build` exit 0. Sem corrigir, Task 4 não pode ser declarada completa. Fix é estritamente cosmético (posição do comentário) e estritamente dentro do escopo "fazer o build verde".
- **Fix:** Reestruturado o JSX para colocar o atributo `ref` em linha separada, com o `eslint-disable-next-line` imediatamente acima dele:
  ```tsx
  <Tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref={ref as any}
    className={className}
  >
  ```
- **Files modified:** `src/components/motion/scroll-scene.tsx`
- **Commit:** `84f7db8` (junto com a Task 4 — barrel update — para manter atomicidade do "passar o build")

**2. [Rule 4 - Architectural-ish, mas trivial] Uso de `createElement` em TextSplit ao invés de `<Tag>` JSX**

- **Found during:** Task 3 (durante implementação)
- **Why:** O plano sugeriu `<Tag ref={containerRef as any} className={className} aria-label={text}>{words.map(...)}</Tag>` com `Tag = as`. Funciona em React, mas TypeScript em modo estrito tem dificuldades para tipar a união h1..h6 + p + span como JSX intrinsic element via `const Tag = as`. `createElement(as, props, children)` resolve sem cast adicional e é semanticamente idêntico. Não é uma mudança de comportamento, é uma escolha de sintaxe que evita um cast extra. Não considerada arquitetural — preserva o contrato congelado.
- **Files modified:** `src/components/motion/text-split.tsx`
- **Não há mudança no contrato exportado.**

Nenhuma outra deviation. Plano executado conforme escrito.

### Deferred Items (fora do escopo deste plan)

- **Warning ESLint pré-existente em `src/lib/analytics.ts:80`** — `Unused eslint-disable directive (no problems were reported from 'no-console')`. Drift de Phase 1 / Plan 01 (não introduzido aqui). Não bloqueia o build (apenas warning). Fora do escopo desta plan (Rule SCOPE BOUNDARY). Não corrigido aqui.

## Pattern Validado (continuação do Plan 02)

Plan 03 estende o "Pattern A" (Plan 02) com duas extensões:

**Extensão B — Render prop primitive (ScrollScene):**

1. Ref local + helper interno (`useScrollProgressInRange`) — primitiva não duplica lógica de useScroll.
2. Children recebido como `(progress: MotionValue<number>) => ReactNode` — caller compõe motion internamente, primitiva só fornece o sinal.
3. Reduced motion deliberadamente NÃO tratado — contrato puro permite composição.
4. Cast `ref as any` com eslint-disable-next-line na linha do `any` (não no return wrapper).

**Extensão C — Measurement-based primitive (TextSplit + useLineGrouping):**

1. Sempre splita por palavra em DOM (mesmo em mobile/tablet) — measurement client-side decide se trata como linha.
2. Helper interno (`useLineGrouping`) faz o trabalho de medir; primitiva (TextSplit) faz o trabalho de renderizar.
3. Pré-medição fallback (`lineMap[i] ?? 0`) aceita 1 frame de FOUC ao invés de bloquear render.
4. A11y: split-text obriga `aria-label` wrapper + `aria-hidden` spans.
5. Reduced motion = `createElement(as, props, text)` — plain text, zero spans, MOTION-07.

Plan 04 (StickyStage) usará Pattern A (sticky CSS + tier matrix) com twist específico (D-09: sticky CSS preserva estrutura mesmo em reduced).

## Próximas Waves

- **Plan 04 (Wave 2 final):** `<StickyStage>` (D-05..D-09, `position: sticky` puro + `length` em `svh`, risco MOTION-03 iOS Safari).
- **Plan 05 (Wave 3):** Showcase `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all` para validação real-device via Vercel preview URLs.
- **Plan 06 (Wave 4):** `README.md` em `components/motion/` (D-17) — contrato congelado, freeze policy, lista de devices validados.

## Known Stubs

Nenhum stub introduzido neste plan. Os 2 primitives + helper estão funcionais e em uso pelo barrel. Placeholder comentado `// export { StickyStage }` sinaliza intenção do Plan 04, não é stub renderizado.

## Threat Flags

Nenhuma nova superfície de ameaça. Primitivas continuam puramente declarativas:

- ScrollScene: sem inputs externos, sem chamadas de rede, sem dados sensíveis.
- TextSplit: `text` prop renderizado como text node (via `createElement` ou children de motion.span) — **NUNCA `dangerouslySetInnerHTML`**, XSS impossível mesmo com input não confiável.
- useLineGrouping: apenas leitura de `offsetTop` + listener em `window.resize` — sem side effects observáveis externamente.

STRIDE vetor = zero (conforme threat register T-02-03 do plan, disposition=accept).

## Self-Check: PASSED

- FOUND: `src/components/motion/scroll-scene.tsx`
- FOUND: `src/components/motion/text-split.tsx`
- FOUND: `src/components/motion/internal/use-line-grouping.ts`
- FOUND: `src/components/motion/index.ts` (modificado)
- FOUND: commit `feb37b5` (Task 1 — ScrollScene)
- FOUND: commit `b7857bc` (Task 2 — useLineGrouping)
- FOUND: commit `c3a144f` (Task 3 — TextSplit)
- FOUND: commit `84f7db8` (Task 4 — barrel re-export + scroll-scene eslint fix)
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- Todos os greps de acceptance_criteria passam
