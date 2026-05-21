---
phase: 06-analytics-instrumentation-pass
plan: 01
subsystem: testing
tags: [vitest, jsdom, intersection-observer, scroll-depth, analytics, clarity, tdd]

# Dependency graph
requires:
  - phase: 01-foundations-design-system
    provides: "track() fan-out + tipo AnalyticsEvent (section_view/scroll_depth ja no tipo)"
  - phase: 05-conversion-form-footer-floating-ctas
    provides: "data-clarity-mask='true' no <section> Form e no <form> root do LeadForm"
provides:
  - "Spec RED de useSectionView (section_view) — contrato fire-once, section correto, disconnect"
  - "Spec RED de ScrollDepthTracker (scroll_depth) — marcos 25/50/75/100, dedup, no-op nao-rolavel"
  - "Spec GREEN de clarity-mask (PII masking) — regressao dos atributos da Phase 5"
affects: [06-02, analytics-instrumentation, plan-06-02-implementation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Componente de teste wrapper (Probe) para hooks com ref — jsdom anexa o no real e o useEffect captura ref.current"
    - "Stub de geometria de scroll em jsdom via Object.defineProperty (scrollHeight/innerHeight/scrollY) + RAF sincrono"
    - "@ts-expect-error no import de modulo Wave 0 ainda inexistente — typecheck passa mesmo com RED de runtime"

key-files:
  created:
    - tests/hooks/use-section-view.test.tsx
    - tests/components/scroll-depth-tracker.test.tsx
    - tests/analytics/clarity-mask.test.tsx
  modified: []

key-decisions:
  - "Import dos modulos Wave 0 inexistentes anotado com @ts-expect-error — mantem npm run typecheck verde sem mascarar o RED de runtime"
  - "Teste de useSectionView usa componente Probe (render real) em vez de renderHook — padrao recomendado pelo 06-RESEARCH para capturar ref.current"

patterns-established:
  - "Wave 0 RED: test file importa modulo de producao ainda inexistente; falha esperada e de resolucao de modulo, nao de sintaxe"
  - "Geometria de scroll stubada por teste (Pitfall 2 do 06-RESEARCH) com RAF sincrono via vi.stubGlobal"

requirements-completed: []

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 6 Plan 01: Wave 0 RED Specs (Analytics Instrumentation) Summary

**3 test files definindo o contrato de section_view (useSectionView), scroll_depth (ScrollDepthTracker) e PII masking (data-clarity-mask) antes da implementacao do Plan 06-02.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 3
- **Files modified:** 3 (todos criados)

## Accomplishments

- `tests/hooks/use-section-view.test.tsx` — 5 specs cobrindo o contrato de `useSectionView(section)`: dispara `section_view` uma vez ao entrar no viewport, nao re-dispara em re-intersecao, nao dispara sem intersecao, usa o `section` correto no payload, desconecta o observer apos o primeiro disparo. Estado **RED** (modulo `@/hooks/use-section-view` ainda nao existe).
- `tests/components/scroll-depth-tracker.test.tsx` — 5 specs cobrindo `<ScrollDepthTracker />`: dispara `scroll_depth` 25/50 ao rolar ~60%, nao duplica marco ja disparado, dispara 100 com tolerancia `pct >= 99`, no-op quando a pagina nao e rolavel, checa estado inicial no mount. Estado **RED** (modulo `@/components/analytics/ScrollDepthTracker` ainda nao existe).
- `tests/analytics/clarity-mask.test.tsx` — 3 specs verificando `data-clarity-mask="true"` no `<section>` do Form, no `<form>` root do LeadForm e que os inputs de nome/WhatsApp estao dentro do no mascarado. Estado **GREEN** (atributos ja entregues na Phase 5).

## Task Commits

Cada task foi commitada atomicamente (`--no-verify`, pathspec explicito):

1. **Task 1: Spec RED de useSectionView (section_view)** — `3a95c92` (test)
2. **Task 2: Spec RED de ScrollDepthTracker (scroll_depth)** — `7341904` (test)
3. **Task 3: Spec de PII masking (clarity-mask)** — `79d2980` (test)

## Files Created/Modified

- `tests/hooks/use-section-view.test.tsx` — spec do hook `useSectionView`; mock de `track`, IntersectionObserver controlavel, componente `Probe` para anexar ref real.
- `tests/components/scroll-depth-tracker.test.tsx` — spec do componente `ScrollDepthTracker`; stub de geometria de scroll do jsdom + RAF sincrono.
- `tests/analytics/clarity-mask.test.tsx` — spec de regressao do PII masking; render de `<Form />` e `<LeadForm />`.

## Decisions Made

- **`@ts-expect-error` nos imports Wave 0:** os modulos `@/hooks/use-section-view` e `@/components/analytics/ScrollDepthTracker` ainda nao existem. Sem o supressor, `npm run typecheck` quebraria por resolucao de modulo. O `@ts-expect-error` mantem o typecheck verde e nao mascara o RED de runtime (o vitest ainda falha na resolucao do import — RED correto de Wave 0). Quando o Plan 06-02 criar os modulos, o `@ts-expect-error` vira erro "unused directive" e deve ser removido junto com a implementacao.
- **`Probe` em vez de `renderHook` para `useSectionView`:** o `renderHook` nao da controle facil sobre `ref.current` antes do `useEffect`. O 06-RESEARCH (§Code Examples) recomenda explicitamente um componente de teste wrapper que renderiza `<section ref={...} />` via `render()` — adotado.

## Deviations from Plan

None - plan executado exatamente como escrito.

## Issues Encountered

- **Base do worktree divergente:** o HEAD inicial do worktree era `d461990` (ancestral do base esperado `2a8150b`), e o diretorio `.planning/phases/06-analytics-instrumentation-pass/` so existia em `2a8150b`. Resolvido conforme o protocolo de worktree check: `git checkout 2a8150b -- .` + `git reset 2a8150b`, deixando o working tree limpo no commit esperado antes de iniciar as tasks.

## Estado RED/GREEN de cada arquivo (input para Plan 06-02)

| Arquivo | Estado | Motivo |
|---------|--------|--------|
| `tests/hooks/use-section-view.test.tsx` | **RED** | `@/hooks/use-section-view` nao existe — falha de resolucao de modulo (esperado). Plan 06-02 cria o hook. |
| `tests/components/scroll-depth-tracker.test.tsx` | **RED** | `@/components/analytics/ScrollDepthTracker` nao existe — falha de resolucao de modulo (esperado). Plan 06-02 cria o componente. |
| `tests/analytics/clarity-mask.test.tsx` | **GREEN (3/3)** | `data-clarity-mask="true"` ja presente da Phase 5. |

**`<form>` do LeadForm tem `data-clarity-mask`?** SIM — confirmado em `src/sections/Form/LeadForm.tsx` linha 118 (`<form data-clarity-mask="true" ...>`). Os branches de `success` e `error` tambem renderizam `<div data-clarity-mask="true">` (linhas 101 e 108). O `<section>` wrapper em `src/sections/Form/index.tsx` linha 22 tambem tem o atributo. **Plan 06-02 NAO precisa adicionar o atributo de masking** — a Task de masking do Plan 06-02 e apenas verificacao, ja coberta GREEN aqui.

## Verification

- `npm test -- --run use-section-view` — arquivo existe, RED por `@/hooks/use-section-view` ausente (resolucao de modulo). Confirmado.
- `npm test -- --run scroll-depth-tracker` — arquivo existe, RED por `@/components/analytics/ScrollDepthTracker` ausente (resolucao de modulo). Confirmado.
- `npm test -- --run clarity-mask` — 3/3 GREEN. Confirmado.
- `npx tsc --noEmit` — exit 0, sem erros de tipo nos test files (`@ts-expect-error` nos imports Wave 0 valido).

## User Setup Required

None - nenhum servico externo configurado neste plano.

## Next Phase Readiness

- Wave 0 da Phase 6 completa: os 3 test files definem o contrato verificavel que o Plan 06-02 implementa.
- Plan 06-02 deve: criar `src/hooks/use-section-view.ts` e `src/components/analytics/ScrollDepthTracker.tsx` contra as assinaturas do 06-01-PLAN `<interfaces>`, e remover os `@ts-expect-error` dos imports nos test files quando os modulos existirem.
- Masking (TRACK-05 Parte A) ja GREEN — Plan 06-02 nao toca em masking de producao.
- Sem blockers.

## Self-Check: PASSED

- FOUND: tests/hooks/use-section-view.test.tsx
- FOUND: tests/components/scroll-depth-tracker.test.tsx
- FOUND: tests/analytics/clarity-mask.test.tsx
- FOUND commit: 3a95c92 (Task 1)
- FOUND commit: 7341904 (Task 2)
- FOUND commit: 79d2980 (Task 3)

---
*Phase: 06-analytics-instrumentation-pass*
*Completed: 2026-05-21*
