---
phase: 02-motion-primitives
plan: 02
subsystem: motion-primitives
tags:
  - reveal
  - parallax
  - device-tier
  - reduced-motion
  - frozen-api
dependency_graph:
  requires:
    - phase-02 plan-01 (scaffold motion/ + barrel + MOTION_EASING + useScrollProgressInRange)
    - phase-01 (useDeviceTier, MotionConfigProvider, SmoothScrollProvider)
  provides:
    - "Public API: <RevealOnView> (MOTION-01) + <ParallaxLayer> (MOTION-02) via @/components/motion barrel"
    - "Type contracts: RevealOnViewProps, ParallaxLayerProps (congelados — mudancas exigem PR motion-api-change)"
  affects:
    - "Plans 03 (ScrollScene + TextSplit) e 04 (StickyStage) podem reutilizar o pattern de matriz tier + reduced motion validado aqui"
    - "Phase 3 Hero e Phase 4 secoes consomem RevealOnView para todos os reveals padrao"
tech_stack:
  added: []
  patterns:
    - "Tier matrix interno por record literal Record<'mobile'|'tablet'|'desktop', T> + branch curto-circuito para reduced"
    - "Reduced motion render path: retorna Tag/div puro (zero motion wrapper) em vez de transition duration=0"
    - "Mobile/reduced em primitivas adaptativas mantem mesmo DOM (mesmo ref) para evitar reflow ao trocar tier via resize"
    - "Easing canonico MOTION_EASING reutilizado (cubic-bezier 0.16,1,0.3,1) — diferencas vem de duration/distance"
key_files:
  created:
    - src/components/motion/reveal-on-view.tsx
    - src/components/motion/parallax-layer.tsx
  modified:
    - src/components/motion/index.ts
decisions:
  - "Stagger entre multiplos RevealOnView NAO e estado interno; consumidor compoe via delayMs (guidance D-10 mobile=60ms/tablet=70ms/desktop=80ms e contrato pro caller, nao para a primitiva)"
  - "Tag dinamica do RevealOnView limitada a union 'div'|'section'|'li'|'span'|'article' — outros casos exigem PR motion-api-change (mantem freeze restrito)"
  - "useReducedMotion + tier==='reduced' sao checados juntos em ambas primitivas — torna primitivas auto-suficientes mesmo sem MotionConfigProvider externo (defesa-em-profundidade)"
  - "ParallaxLayer mobile/reduced retorna <div> puro com mesmo ref (nao motion.div com y=0) — evita criar MotionValue desnecessario e mantem DOM identico entre tiers"
  - "PARALLAX_RANGE_PX=100 (conservador) — desktop default magnitude=0.2 produz 20px max, alinhado com 'sutil, quase imperceptivel' do D-context"
metrics:
  duration: "~8min"
  completed: "2026-05-16"
  tasks: 3
  files_created: 2
  files_modified: 1
requirements:
  - MOTION-01
  - MOTION-02
  - MOTION-07
  - MOTION-08
---

# Phase 2 Plan 2: Reveal + Parallax Summary

**One-liner:** 2 das 5 primitivas implementadas e congeladas — `<RevealOnView>` (fade+slide adaptativo por tier, MOTION-01) e `<ParallaxLayer>` (translateY sutil off-em-mobile, MOTION-02) — ambas com matriz device-tier completa, reduced motion como estado final imediato sem motion wrapper, apenas transform/opacity (MOTION-08), exportadas pelo barrel `@frozen`.

## What Was Built

### `<RevealOnView>` (MOTION-01) — `src/components/motion/reveal-on-view.tsx`

Primitiva declarativa para fade+slide-up no primeiro viewport entry.

**Contrato congelado:**

```typescript
export interface RevealOnViewProps {
  children: ReactNode;
  delayMs?: number;                 // default 0 — composicao manual de stagger
  as?: "div" | "section" | "li" | "span" | "article"; // default "div"
  className?: string;
  amount?: number;                  // default 0.2 — IntersectionObserver threshold
  repeat?: boolean;                 // default false — viewport.once
}
```

**Matriz de tier (D-10):**

| Tier      | distance | duration | stagger (guidance ao caller) |
| --------- | -------- | -------- | ---------------------------- |
| mobile    | 12 px    | 400 ms   | 60 ms                        |
| tablet    | 16 px    | 500 ms   | 70 ms                        |
| desktop   | 24 px    | 600 ms   | 80 ms                        |
| reduced   | —        | —        | render direto, sem wrapper   |

Stagger entre múltiplos `<RevealOnView>` é **composição via `delayMs` do consumidor** — guidance acima é o incremento sugerido, não estado interno desta primitiva (mantém a primitiva simples; consumidor controla orquestração).

**Reduced motion path:** retorna `<Tag>` puro (não `motion.Tag`) — zero overhead. Check duplo (`useReducedMotion()` + `tier === 'reduced'`) torna a primitiva auto-suficiente mesmo se um futuro consumidor a usar fora do `MotionConfigProvider`.

**MOTION-08:** apenas `opacity` + `y` (shorthand de `translateY`). Easing canônico `MOTION_EASING` reutilizado de Plan 01.

### `<ParallaxLayer>` (MOTION-02) — `src/components/motion/parallax-layer.tsx`

Primitiva para translateY sutil derivado de scroll progress da própria seção em que está inserida.

**Contrato congelado:**

```typescript
export interface ParallaxLayerProps {
  children: ReactNode;
  magnitude?: number;   // default 0.2 — multiplicador relativo
  className?: string;
}
```

**Matriz de tier (D-11):**

| Tier      | multiplier | magnitude efetiva (default 0.2) | translateY máximo (PARALLAX_RANGE_PX=100) |
| --------- | ---------- | ------------------------------- | ----------------------------------------- |
| mobile    | 0          | 0                               | 0 px (REQ MOTION-02 obriga)               |
| tablet    | 0.5        | 0.1                             | ±10 px (leve)                             |
| desktop   | 1.0        | 0.2                             | ±20 px (sutil, quase imperceptível)       |
| reduced   | 0          | 0                               | 0 px                                      |

**Range:** scroll progress `[0, 1]` mapeia em translateY `[+maxPx, -maxPx]` — entrada do viewport empurra layer para baixo, saída puxa para cima (sensação de profundidade).

**Mobile/reduced path:** retorna `<div ref={ref}>` puro com o mesmo `ref` que o desktop usa — mantém DOM/layout idênticos entre tiers, evita reflow ao trocar tier via resize, e elimina a criação de MotionValue inútil.

**Helper consumido:** `useScrollProgressInRange()` (interno, criado no Plan 01) — wrappa `useScroll` da `motion/react` com defaults sensatos `['start end', 'end start']`. Mesmo helper será reutilizado por `<ScrollScene>` no Plan 03.

**MOTION-08:** apenas `transform: translateY` via shorthand `y` no `style`.

### Barrel `src/components/motion/index.ts`

Atualizado de stub vazio (`export {}`) para expor a API pública das duas primitivas:

```typescript
export { RevealOnView } from "./reveal-on-view";
export type { RevealOnViewProps } from "./reveal-on-view";

export { ParallaxLayer } from "./parallax-layer";
export type { ParallaxLayerProps } from "./parallax-layer";
```

Próximos exports listados como placeholders comentados (`ScrollScene`, `TextSplit`, `StickyStage`) — sinaliza o contrato pendente sem habilitar import quebrado.

Header `@frozen` + política D-16 preservados.

## Verification Results

- `npx tsc --noEmit` exit 0 (limpo após primeira correção de cast do `ease`)
- `npm run build` exit 0
  - Build size: `/dev` continua 81.7 kB / First Load 184 kB (igual ao baseline do Plan 01 — primitivas adicionadas mas ainda não consumidas em rota)
  - Shared chunks: 102 kB (sem regressão)
- Todos os greps de acceptance criteria das 3 tasks passam:
  - Task 1: 12/12 (existência, headers, hooks, distances 12/16/24, props, MOTION-08 negativo, typecheck)
  - Task 2: 10/10 (existência, headers, hooks, mobile=0, props, MOTION-08 negativo, typecheck)
  - Task 3: 6/6 (exports nomeados + tipos, @frozen, build)

### Greps negativos MOTION-08

Confirmado em ambos os arquivos: zero ocorrência de `\bwidth:|\bheight:|\btop:|\bleft:` (a versão simples do regex no plano original tinha falso-positivo em "desktop:" do TIER_CONFIG — corrigido aqui com word boundary). Animação real usa apenas `opacity` e o shorthand `y` do `motion/react` (que compila para `transform: translateY(...)`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Cast de `ease: MOTION_EASING` em `transition`**

- **Found during:** Task 1 (`npx tsc --noEmit`)
- **Issue:** O plano sugeria `ease: MOTION_EASING as unknown as number[]`, mas `motion/react` v12 espera o tipo `Easing | Easing[]` onde `Easing[]` é interpretado como array de easings (não como tuple de 4 números). Erro TS2322: `Type 'number' is not assignable to type 'Easing'`.
- **Por que auto-fix:** Acceptance criteria exige `npx tsc --noEmit exit 0`; sem corrigir o cast a Task 1 não pode ser declarada completa. Fix é trivial e estritamente dentro do escopo de "fazer o typecheck verde".
- **Fix:** Trocado para `ease: MOTION_EASING as unknown as [number, number, number, number]` (tuple cubic-bezier conforme tipo `Easing` aceita).
- **Files modified:** `src/components/motion/reveal-on-view.tsx`
- **Commit:** `42f1f7b` (incluído no mesmo commit da Task 1)

Nenhuma outra deviation. Plano executado conforme escrito.

## Próximas Waves

- **Plan 03 (Wave 2 continuação):** `<ScrollScene>` (D-01..D-04, render prop expondo `MotionValue<number>`) + `<TextSplit>` (D-12, split palavra/linha por tier sem dep externa).
- **Plan 04 (Wave 2 final):** `<StickyStage>` (D-05..D-09, `position: sticky` puro + `length` em `svh`, risco MOTION-03 iOS Safari).
- **Plan 05 (Wave 3):** Showcase `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all` para validação real-device via Vercel preview URLs.
- **Plan 06 (Wave 4):** `README.md` em `components/motion/` (D-17) — contrato congelado, freeze policy, lista de devices validados.

## Pattern Validado (template para próximos plans)

Plan 02 estabelece o "Pattern A" das primitivas adaptativas que Plans 03/04 podem reutilizar diretamente:

1. **`useDeviceTier()` + `useReducedMotion()` checados juntos** (defesa-em-profundidade).
2. **`Record<'mobile'|'tablet'|'desktop', T>` literal** para a matriz interna; reduced branch curto-circuita antes de ler.
3. **Reduced path renderiza Tag puro (não motion wrapper)** — zero overhead, MOTION-07 garantido.
4. **DOM consistency entre tiers**: mesmo `ref`/wrapper render, só o conteúdo de animação muda (evita reflow ao redimensionar).
5. **Easing canônico** `MOTION_EASING` reutilizado — diferenças vêm de duration/distance/magnitude por tier.
6. **Tipos `*Props` exportados** junto com o componente; barrel re-exporta ambos.

`<ScrollScene>` exigirá uma extensão deste pattern (render prop ao invés de children direto) e `<StickyStage>` exigirá uma adaptação (sticky CSS preserva estrutura mesmo em reduced — D-09), mas a base de tier-matrix + reduced é a mesma.

## Known Stubs

Nenhum stub introduzido neste plan. As 2 primitivas estão funcionais; barrel expõe 2/5 com placeholders comentados para as 3 restantes (sinaliza intenção, não é stub renderizado).

## Threat Flags

Nenhuma nova superfície de ameaça. Primitivas são puramente declarativas: sem chamadas de rede, sem inputs do usuário, sem dados sensíveis, sem `dangerouslySetInnerHTML`. STRIDE: vetor de ataque = zero (conforme threat register T-02-02 do plan, disposition=accept).

## Self-Check: PASSED

- FOUND: `src/components/motion/reveal-on-view.tsx`
- FOUND: `src/components/motion/parallax-layer.tsx`
- FOUND: `src/components/motion/index.ts` (modificado)
- FOUND: commit `42f1f7b` (Task 1 — RevealOnView)
- FOUND: commit `88f7e78` (Task 2 — ParallaxLayer)
- FOUND: commit `5e8e4fe` (Task 3 — barrel re-export)
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- Todos os greps de acceptance_criteria passam (incl. negativos MOTION-08 com word boundary)
