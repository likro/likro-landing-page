---
phase: 06-analytics-instrumentation-pass
plan: 02
subsystem: analytics
tags: [intersection-observer, scroll-depth, section-view, analytics, clarity, tdd]

# Dependency graph
requires:
  - phase: 01-foundations-design-system
    provides: "track() fan-out + tipo AnalyticsEvent (section_view/scroll_depth ja no tipo)"
  - phase: 06-analytics-instrumentation-pass
    plan: 01
    provides: "Specs RED de useSectionView e ScrollDepthTracker; spec GREEN de clarity-mask"
provides:
  - "useSectionView — hook IO dedicado que dispara section_view fire-once via track()"
  - "TrackSection — wrapper client (display:contents) para envolver secoes sem editar server components"
  - "ScrollDepthTracker — componente headless que dispara scroll_depth nos marcos 25/50/75/100"
affects: [06-03, plan-06-03-wiring-page-tsx]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hook IO dedicado para analytics — separado de use-in-view.ts para nao herdar a logica de prefers-reduced-motion (evita falso section_view)"
    - "Wrapper client com display:contents — observa via IO sem criar caixa de layout (zero regressao em sticky/grid)"
    - "Scroll listener RAF-throttled + passive:true + dedup via Set — scroll_depth sem jank"

key-files:
  created:
    - src/hooks/use-section-view.ts
    - src/components/analytics/TrackSection.tsx
    - src/components/analytics/ScrollDepthTracker.tsx
  modified:
    - tests/hooks/use-section-view.test.tsx
    - tests/components/scroll-depth-tracker.test.tsx

key-decisions:
  - "TrackSection usa display:contents (className='contents') — wrapper nao cria caixa de layout, zero regressao visual em sticky/grid. Nao foi necessario fallback para <div> comum."
  - "Task 3 (data-clarity-mask) — zero diff: o <form> do LeadForm ja tinha data-clarity-mask='true' (Phase 5, linha 118). Apenas verificado GREEN."
  - "threshold default 0.15 no useSectionView — robusto para secoes longas (Product sticky stack) em viewport mobile (06-RESEARCH Pitfall 6)."

patterns-established:
  - "Eventos client-side de analytics (section_view/scroll_depth) sempre via track() — zero window.gtag/fbq/clarity direto"

requirements-completed: [TRACK-04, TRACK-05]

# Metrics
duration: 9min
completed: 2026-05-21
---

# Phase 6 Plan 02: section_view + scroll_depth Implementation Summary

**Implementacao dos dois eventos faltantes da instrumentacao de analytics — `section_view` (hook `useSectionView` + wrapper `TrackSection`) e `scroll_depth` (`ScrollDepthTracker`) — contra os contratos RED da Wave 0. Os 3 test files da Wave 0 agora GREEN.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 3 (2 com commit; Task 3 zero-diff)
- **Files created:** 3 — `src/hooks/use-section-view.ts`, `src/components/analytics/TrackSection.tsx`, `src/components/analytics/ScrollDepthTracker.tsx`
- **Files modified:** 2 test files (remocao de `@ts-expect-error`)

## Accomplishments

- **`src/hooks/use-section-view.ts`** — hook `"use client"` dedicado. IntersectionObserver fire-once (`firedRef` + `observer.disconnect()` no primeiro `isIntersecting`), dispara `track("section_view", { section })`. `threshold` default `0.15`. NAO consulta `matchMedia`/`prefers-reduced-motion` — analytics rastreia comportamento real (06-RESEARCH Pitfall 3). SSR-safe (`typeof IntersectionObserver === "undefined"`).
- **`src/components/analytics/TrackSection.tsx`** — wrapper client `TrackSection({ section, children })`. Aplica `useSectionView<HTMLDivElement>` num `<div className="contents">`. Existe para nao editar os 7 arquivos de secao (server components); o wiring em `page.tsx` e do Plan 06-03.
- **`src/components/analytics/ScrollDepthTracker.tsx`** — componente headless (`return null`). Listener `scroll` `passive: true` throttled via `requestAnimationFrame`; dedup de marcos `[25, 50, 75, 100]` via `Set`; marco 100 com tolerancia `pct >= 99` (address bar mobile); no-op quando `scrollable <= 0`; computa estado inicial no mount.
- **Task 3 (data-clarity-mask)** — verificacao apenas. O `<form>` do `LeadForm` ja tinha `data-clarity-mask="true"` (Phase 5, `LeadForm.tsx` linha 118). Nenhuma mudanca de codigo; teste `clarity-mask` confirmado GREEN (3/3).
- Removidos os `@ts-expect-error` dos imports Wave 0 nos test files de `useSectionView` e `ScrollDepthTracker` (modulos agora existem).

## Task Commits

Cada task commitada atomicamente (`--no-verify`, pathspec explicito):

1. **Task 1: useSectionView hook + TrackSection wrapper** — `b435e95` (feat)
2. **Task 2: ScrollDepthTracker componente** — `f76b03c` (feat)
3. **Task 3: verificar data-clarity-mask no LeadForm** — sem commit (zero diff; atributo ja presente da Phase 5)

## Decisions Made

- **`display:contents` no TrackSection (LOCKED, sem fallback necessario):** o wrapper usa `<div className="contents">`. O `display: contents` remove o `<div>` do box model — nao cria caixa de layout propria, entao nao interfere com `sticky`/`grid` das secoes. Nao foi preciso recorrer ao fallback de `<div>` comum: a suite completa (221/221) passou sem regressao, e o teste de `useSectionView` (que renderiza uma `<section>` real e dirige o IO manualmente) valida que a observacao funciona. O comportamento de IO sob `display:contents` em browser real sera confirmado no smoke test do Plan 06-03 / Phase 7; se houver problema, a troca para `<div>` comum e isolada a um arquivo (o wrapper esta em `page.tsx`, fora das secoes — trocar nao quebra layout interno).
- **Task 3 zero-diff:** conforme 06-01-SUMMARY ja registrava, o `<form>` do LeadForm tem `data-clarity-mask="true"` desde a Phase 5. A Task 3 do plano e explicitamente "verificar; adicionar apenas se ausente". Como ja existia, nenhuma alteracao foi feita.
- **`threshold = 0.15`:** default escolhido (06-RESEARCH Pitfall 6) — robusto para secoes longas como o Product sticky stack em viewport mobile pequeno.

## Deviations from Plan

None - plano executado exatamente como escrito. (A Task 3 sem commit nao e desvio: o plano preve explicitamente "zero mudanca se ja existia".)

## Issues Encountered

- **Base do worktree divergente:** o HEAD inicial era `d461990` (ancestral do base esperado `2961c36`). Resolvido pelo protocolo de worktree check: `git reset --soft 2961c36`, `git restore --staged .`, `git checkout 2961c36 -- .` — working tree limpo no commit esperado antes de iniciar as tasks.

## Verification

- `npm test -- --run use-section-view` — 5/5 GREEN.
- `npm test -- --run scroll-depth-tracker` — 5/5 GREEN.
- `npm test -- --run clarity-mask` — 3/3 GREEN.
- `npm test` (suite completa) — **221/221 GREEN, 35 test files** — zero regressao.
- `npm run typecheck` (`tsc --noEmit`) — exit 0, sem erros.
- `npm run lint` — limpo nos arquivos novos; 1 warning pre-existente (`src/lib/analytics.ts:80` unused eslint-disable) NAO tocado por este plano — fora de escopo (registrado, nao corrigido).
- Grep `window.gtag|fbq|clarity` em `use-section-view.ts` e `components/analytics/` — **0 ocorrencias**: todos os eventos passam por `track()` (TRACK-01 respeitado).

## Threat Surface

Coberto conforme o `<threat_model>` do plano: payloads de `section_view`/`scroll_depth` carregam apenas `section` (literal de codigo) e `depth` (numero) + `event_id` — zero PII (T-06-03 mitigado). Listener de scroll `passive: true` + RAF throttle (T-06-06 mitigado). `data-clarity-mask` no `<form>` confirmado (T-06-04 mitigado). Nenhuma superficie de seguranca nova introduzida.

## Next Phase Readiness

- `useSectionView`, `TrackSection`, `ScrollDepthTracker` criados e GREEN — prontos para o wiring em `page.tsx`.
- Plan 06-03 deve: envolver cada `<Section />` em `page.tsx` com `<TrackSection section="...">` e montar `<ScrollDepthTracker />` uma vez em `page.tsx`.
- Parte B (verificacao cross-dashboard, TRACK-07) permanece bloqueada ate Lenny ter as 3 contas Meta/GA4/Clarity.
- Sem blockers.

## Self-Check: PASSED

- FOUND: src/hooks/use-section-view.ts
- FOUND: src/components/analytics/TrackSection.tsx
- FOUND: src/components/analytics/ScrollDepthTracker.tsx
- FOUND commit: b435e95 (Task 1)
- FOUND commit: f76b03c (Task 2)

---
*Phase: 06-analytics-instrumentation-pass*
*Completed: 2026-05-21*
