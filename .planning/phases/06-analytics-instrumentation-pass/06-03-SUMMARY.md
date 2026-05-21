---
phase: 06-analytics-instrumentation-pass
plan: 03
subsystem: analytics
tags: [analytics, section-view, scroll-depth, ga4, wiring, track-06]

# Dependency graph
requires:
  - phase: 06-analytics-instrumentation-pass
    plan: 02
    provides: "TrackSection (wrapper display:contents) + ScrollDepthTracker (headless) + useSectionView"
  - phase: 01-foundations-design-system
    provides: "<GoogleAnalytics> de @next/third-parties — page_view SPA automatico"
provides:
  - "page.tsx com as 7 secoes narrativas envolvidas em <TrackSection> — section_view dispara em runtime"
  - "ScrollDepthTracker montado 1x em page.tsx — scroll_depth dispara nos marcos 25/50/75/100"
  - "TRACK-06 verificado por grep — fonte unica de page_view (sem double-fire)"
affects: [06-04, plan-06-04-human-uat]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component (page.tsx) renderiza client components de tracking sem virar client — wrappers isolam o 'use client'"
    - "Componente headless de analytics montado em page.tsx (nao layout.tsx) — evita disparo em /privacy"

key-files:
  created:
    - .planning/phases/06-analytics-instrumentation-pass/06-03-SUMMARY.md
  modified:
    - src/app/page.tsx
    - .planning/phases/06-analytics-instrumentation-pass/06-VALIDATION.md

key-decisions:
  - "TrackSection mantido com display:contents (className='contents') — nenhum ajuste necessario; o <div className='contents'> nao cria caixa de layout, entao envolver <Hero /> (min-h-svh) nao quebrou o full-height. Suite completa 221/221 GREEN confirma zero regressao."
  - "ScrollDepthTracker montado entre </main> e <FloatingWhatsApp /> — componente headless (return null), ordem irrelevante; fora de <main> por clareza."
  - "section keys = vocabulario de analytics (hero/pain/bridge/product/how/proof/form), independentes dos id do DOM (produto/how-it-works/etc) — curtas e estaveis."

patterns-established:
  - "Wiring de analytics client-side feito no page.tsx via wrappers — secoes (server components) permanecem intocadas"

requirements-completed: [TRACK-04, TRACK-06]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 6 Plan 03: Wiring de section_view + scroll_depth + verificação TRACK-06 Summary

**Conecta os componentes de tracking do Plan 02 à página: as 7 seções narrativas em `page.tsx` agora estão envolvidas por `<TrackSection>` e o `<ScrollDepthTracker />` está montado uma vez — `section_view` e `scroll_depth` disparam de fato em runtime. TRACK-06 (GA4 SPA, fonte única de `page_view`) verificado por grep e documentado no `06-VALIDATION.md`.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 2 (ambas com commit)
- **Files created:** 1 — este SUMMARY
- **Files modified:** 2 — `src/app/page.tsx`, `06-VALIDATION.md`

## Accomplishments

- **`src/app/page.tsx`** — adicionados os imports de `TrackSection` e `ScrollDepthTracker`. Cada uma das 7 seções dentro de `<main>` foi envolvida em `<TrackSection section="...">` com as keys `hero`/`pain`/`bridge`/`product`/`how`/`proof`/`form`. `<ScrollDepthTracker />` montado uma única vez entre `</main>` e `<FloatingWhatsApp />`. `page.tsx` continua server component — os wrappers carregam o `"use client"` internamente. Estrutura `<Header> <main> <Footer> <FloatingWhatsApp>` preservada intacta; nenhum arquivo em `src/sections/` tocado.
- **TRACK-06 verificado** — 3 greps confirmam fonte única de `page_view`:
  - `grep -rn "GoogleAnalytics" src/` → uma única renderização `<GoogleAnalytics gaId=...>` em `analytics-provider.tsx:27` (+ import).
  - `grep -rn "page_view" src/` → zero ocorrências (nenhum `gtag('event','page_view')` manual).
  - `grep -rn "gtag" src/lib/analytics.ts` → única chamada `window.gtag?.("event", event, enriched)` em `analytics.ts:64`, dentro de `track()` — eventos custom, não mecanismo GA paralelo.
- **`06-VALIDATION.md` finalizado para a Parte A** — Per-Task Verification Map preenchido (Plans 01/02/03, sem `TBD`); Wave 0 Requirements marcados `[x]`; subseção "TRACK-06 — Verificação GA4 SPA" com os 3 comandos e resultado PASS; Validation Sign-Off atualizado; frontmatter `nyquist_compliant: true` + `wave_0_complete: true`. Parte B (HUMAN-UAT, TRACK-07) permanece pendente do Plan 04.

## Task Commits

Cada task commitada atomicamente (`--no-verify`, pathspec explícito):

1. **Task 1: wire TrackSection + ScrollDepthTracker em page.tsx** — `6fa21a1` (feat)
2. **Task 2: verificar TRACK-06 + finalizar 06-VALIDATION.md** — `0023780` (docs)

## Decisions Made

- **TrackSection mantido com `display:contents` — nenhum ajuste necessário.** O plano permitia uma contingência: editar `TrackSection.tsx` para usar `<div>` comum caso o wrapper quebrasse o `min-h-svh` do `<Hero />`. Não foi necessário. `display: contents` remove o `<div>` do box model, então envolver o Hero não introduz uma caixa de layout extra que quebre o full-height. A suite completa (221/221 GREEN) e o build de produção (`/` 36.8 kB, sem erro) confirmam zero regressão. O comportamento do IntersectionObserver sob `display:contents` em browser real será confirmado no smoke test do Plan 04 / Phase 7.
- **`<ScrollDepthTracker />` entre `</main>` e `<FloatingWhatsApp />`** — componente headless (`return null`); a posição é irrelevante para o comportamento. Colocado fora de `<main>` por clareza semântica (não é conteúdo da página). Montado em `page.tsx`, não `layout.tsx` — o layout cobre `/privacy`, onde `scroll_depth` da landing não faz sentido.
- **section keys = vocabulário de analytics, não `id` do DOM.** As keys `hero`/`pain`/`bridge`/`product`/`how`/`proof`/`form` são o payload de `section`; os `id` reais no DOM divergem (`produto`, `how-it-works`, etc.). Keys curtas e estáveis, independentes da estrutura HTML — conforme decisão do planner.

## Deviations from Plan

None - plano executado exatamente como escrito. A contingência prevista (ajuste de `TrackSection.tsx` por causa do `min-h-svh` do Hero) não foi acionada — `display:contents` funcionou sem regressão.

## Issues Encountered

- **Base do worktree divergente:** o HEAD inicial era `d461990`, ancestral do base esperado `2f5d569`. Resolvido pelo protocolo de worktree check: `git reset --soft 2f5d569`, `git restore --staged .`, `git checkout 2f5d569 -- .` — working tree limpo no commit esperado antes de iniciar as tasks.

## Verification

- `npm test` (suite completa) — **221/221 GREEN, 35 test files** — zero regressão. `tests/landing/cta-distribution.test.tsx` (renderiza `HomePage`) permanece GREEN após o wiring.
- `npm run typecheck` (`tsc --noEmit`) — exit 0, sem erros.
- `npm run lint` — limpo; 1 warning pré-existente (`src/lib/analytics.ts:80` unused eslint-disable) NÃO tocado por este plano — fora de escopo (já registrado no 06-02-SUMMARY).
- `npm run build` — conclui sem erro; rota `/` 36.8 kB / 158 kB First Load JS; `page.tsx` continua server component válido.
- Grep `TrackSection section=` em `page.tsx` — **7 ocorrências** (hero/pain/bridge/product/how/proof/form).
- Grep `<ScrollDepthTracker` em `page.tsx` — **1 ocorrência**.
- TRACK-06: grep confirma um único `<GoogleAnalytics>` e zero `page_view` manual — PASS.

## Threat Surface

Coberto conforme o `<threat_model>` do plano. T-06-07 (GA4 double-fire de `page_view`) mitigado: o grep test confirma fonte única — um único `<GoogleAnalytics>`, zero `gtag('event','page_view')` manual. T-06-08 (info disclosure no wiring) aceito por design: as `section` keys são literais de código no `page.tsx` (`hero`/`pain`/...), nunca input de usuário — sem superfície. Nenhuma superfície de segurança nova introduzida.

## Next Phase Readiness

- Parte A da Phase 6 fechada: `section_view` e `scroll_depth` disparam em runtime; TRACK-04 e TRACK-06 verificados.
- Plan 04 (`06-HUMAN-UAT.md`): verificação cross-dashboard (TRACK-07) + Clarity recording real (TRACK-05) — **bloqueada** até Lenny criar as 3 contas Meta/GA4/Clarity, configurar os `NEXT_PUBLIC_*` IDs na Vercel e fazer redeploy.
- Sem blockers para a parte automatável.

## Self-Check: PASSED

- FOUND: src/app/page.tsx (7x `TrackSection section=`, 1x `<ScrollDepthTracker`)
- FOUND: .planning/phases/06-analytics-instrumentation-pass/06-VALIDATION.md (frontmatter nyquist_compliant: true)
- FOUND commit: 6fa21a1 (Task 1)
- FOUND commit: 0023780 (Task 2)

---
*Phase: 06-analytics-instrumentation-pass*
*Completed: 2026-05-21*
