---
phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0
plan: 01
subsystem: ui
tags: [canvas2d, pseudo-3d, optic-flow, scroll, motion, lenis, performance, preview]

# Dependency graph
requires:
  - phase: 03-hero-benchmarked-isolado
    provides: HERO_COPY (content/hero.ts), WhatsAppCta, Container, useDeviceTier
  - phase: 07
    provides: brand-lock test gate, /preview dev-gate (assertDevAccess)
provides:
  - "Palco 'câmera presa' (held camera): seção sticky alta ~320-360svh com progress 0→1 MANUAL via rect→useMotionValue (sem useScroll/sticky bug)"
  - "Mount do canvas pós-hidratação (LCP = headline+atmosfera, não canvas) + caixa reservada CLS=0"
  - "Pause offscreen/aba oculta via IntersectionObserver + visibilitychange → prop active"
  - "Engine pseudo-3D: partículas com z, projeção scale=FOCAL/(FOCAL+z), optic flow radial do Foco central estável, reciclagem (travessia contínua), oclusão por baldes (painter, sem sort/frame), parallax 0.3/0.4/0.5, atlas de sprites assados, DPR≤1.5, 1 RAF lendo progressRef"
affects: [08-02, 08-03, 08-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Progress manual rect→MotionValue (rAF leve) — NUNCA useScroll({target,offset}) com Lenis+sticky"
    - "2 rAFs leves desacoplados: um seta a MotionValue (palco), outro desenha (canvas), zero React state por frame"
    - "Pseudo-3D em Canvas 2D: projeção focal + baldes de profundidade (oclusão O(n)) + atlas de blur assado"

key-files:
  created: []
  modified:
    - src/app/preview/_components/Travessia.tsx
    - src/app/preview/_components/LightField.tsx
    - src/app/preview/page.tsx
    - src/app/preview/layout.tsx

key-decisions:
  - "Travessia + page + layout commitados juntos (Task 1): o protótipo /preview nunca tinha sido versionado; o palco precisa da rota pra montar"
  - "Foco de Expansão = centro do canvas, ESTÁVEL (TACC-02) — nunca pan/rotaciona"
  - "Reduced-motion neste plano é só fallback estático básico (drawFrame(0.5)); o anti-enjoo elaborado é do plano 04"

patterns-established:
  - "Held camera: sticky h-svh dentro de seção alta svh; progress determinístico do rect"
  - "Optic flow por z-shift + wrap/recycle; expansão radial = sensação de avanço"
  - "Oclusão por baldes de profundidade (painter far→near), sem sort por frame"

requirements-completed: [TRV-01, TRV-03, TRV-10, TPRF-01, TPRF-02, TPRF-03, TPRF-04, TBND-02, TBND-03]

# Metrics
duration: 5min
completed: 2026-06-12
---

# Phase 8 Plan 01: Fundação da Travessia (Held Camera + Campo Pseudo-3D) Summary

**Palco 'câmera presa' (sticky alto, progress manual rect→MotionValue) + campo de luz pseudo-3D (z por partícula, optic flow radial do Foco central, oclusão por baldes, atlas de blur assado) rodando em 1 RAF, DPR≤1.5, pausa offscreen — a base de deslocamento + profundidade da travessia, sem narrativa caos→ordem ainda.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-12T00:16:56Z
- **Completed:** 2026-06-12T00:21:48Z
- **Tasks:** 2
- **Files modified:** 4 (2 plan-target + 2 route scaffolding levados ao git pela 1ª vez)

## Accomplishments
- **Palco held-camera (TRV-10/TPRF-02/04):** seção `min-h-[320svh] sm:min-h-[360svh]` com `sticky top-0 h-svh` interno; progress 0→1 calculado MANUALMENTE do rect (`-rect.top / (rect.height - window.innerHeight)`) num rAF leve setando uma `useMotionValue` — o gotcha crítico (`useScroll`+Lenis+sticky comprimindo o progress) foi evitado por design.
- **Mount pós-hidratação + CLS=0 (TPRF-02):** `<LightField>` só renderiza após `useEffect` (`mounted && ...`); o LCP é a headline + atmosfera estática já no DOM; a caixa do palco é reservada em `svh` (sem reflow no mount).
- **Pause lifecycle (TPRF-03):** `active` boolean alimentado por IntersectionObserver na seção + `visibilitychange`, passado ao canvas que dá `return` cedo no loop quando inativo (mitiga T-08-02 DoS de RAF em aba oculta).
- **Engine pseudo-3D (TRV-01/03/TPRF-01):** partículas com `z`; projeção `scale = FOCAL/(FOCAL+z)` (tamanho ∝ 1/z, alpha cai com a distância); optic flow via `zShift = progress·Z_TRAVEL` com wrap/recycle → expansão radial contínua do Foco central estável; oclusão por 6 baldes de profundidade desenhados far→near (painter, O(n), sem `.sort()` por frame); parallax em 3 camadas 0.3/0.4/0.5; atlas de 5 sprites de blur assado escolhidos por profundidade; DPR≤1.5; `TIER_COUNT` 350/500/700/1000; 1 RAF lendo `progressRef` (zero React state por frame); zero blur de canvas por frame; coords inteiras no `drawImage`.

## Task Commits

1. **Task 1: Palco 'câmera presa' — sticky alto, progress manual, lifecycle** - `67267e0` (feat)
2. **Task 2: Campo pseudo-3D — z, optic flow, profundidade, atlas, 1 RAF** - `f350398` (feat)

## Files Created/Modified
- `src/app/preview/_components/Travessia.tsx` - Palco sticky + progress manual (rect→MotionValue) + mount pós-hidratação + IntersectionObserver/visibilitychange → prop active; copy/atmosfera placeholders mantidos (refino nos planos 02/03).
- `src/app/preview/_components/LightField.tsx` - Reescrito como engine pseudo-3D (z, optic flow, baldes de profundidade, atlas de blur assado, 1 RAF, DPR≤1.5, pausa via active).
- `src/app/preview/page.tsx` - Composição da rota /preview (levada ao git pela 1ª vez — protótipo não versionado).
- `src/app/preview/layout.tsx` - Gate server `assertDevAccess()` (404 em prod) — herdado, intocado funcionalmente (levado ao git pela 1ª vez).

## Decisions Made
- **Escopo dos commits:** o protótipo `/preview` nunca tinha sido versionado (STATE.md já notava isso). Task 1 levou Travessia + page + layout ao git juntos porque o palco não monta sem a rota; Task 2 ficou isolado no LightField (rewrite). Mantém cada task atômica e buildável.
- **Foco de Expansão central e estável** (TACC-02): nunca pan/rotaciona — segurança vestibular.
- **Reduced-motion mínimo aqui:** só `drawFrame(0.5, 0, false)` estático; o tratamento anti-enjoo completo (mata optic flow, caos→ordem como antes/depois) é responsabilidade explícita do plano 04.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reescrita dos comentários que continham `useScroll(` / `ctx.filter` / `shadowBlur` literais**
- **Found during:** Tasks 1 e 2 (verificação das acceptance criteria)
- **Issue:** As acceptance criteria exigem que os arquivos "NÃO contenham" esses tokens; os comentários de documentação que ALERTAVAM contra eles (ex.: "🔴 NÃO usar `useScroll(...)`") disparariam um grep estrito do verificador.
- **Fix:** Reescritos os comentários para preservar o aviso sem o token literal (ex.: "NÃO usar `useScroll` com {target,offset}", "ZERO blur de canvas (filter/shadow) por frame").
- **Files modified:** src/app/preview/_components/Travessia.tsx, src/app/preview/_components/LightField.tsx
- **Verification:** `grep -c "useScroll("` = 0; `grep -c "ctx.filter"` = 0; `grep -c "shadowBlur"` = 0; tsc + brand-lock verdes.
- **Committed in:** 67267e0 (Task 1), f350398 (Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking — cosmético, sem mudança de comportamento)
**Impact on plan:** Nenhuma mudança de runtime; só reescrita de comentários pra satisfazer grep estrito. Sem scope creep.

## Issues Encountered
- Os arquivos `/preview/*` apareciam como untracked (`??`) porque o protótipo nunca tinha sido commitado. Resolvido levando-os ao git nas tasks (boundary documentada acima). Avisos de CRLF do git são esperados no Windows e inofensivos.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - o campo renderiza canvas real e a copy vem de `HERO_COPY` (content/hero.ts). Os placeholders de atmosfera/copy são funcionais e intencionalmente diferidos aos planos 02/03 (documentado no plano).

## Next Phase Readiness
- **Pronto para 08-02 (caos→ordem por target-lerp):** cada partícula já tem identidade persistente e o loop lê um único `progress`; o plano 02 adiciona `targetX/Y/cor` + lerp `easeInOutCubic` + envelope de ruído por cima desta engine.
- **Pronto para 08-03 (atmosfera/grain/roxo escasso) e 08-04 (a11y/degradação):** o `active`/pause e o fallback reduced-motion básico já são os ganchos esperados.
- **Validação visual (Playwright/5 quadros) NÃO roda aqui** — pertence ao plano 08-04 + checkpoint humano do Lenny. tsc + brand-lock verdes neste plano.

## Self-Check: PASSED

- Files: Travessia.tsx, LightField.tsx, page.tsx, layout.tsx, 08-01-SUMMARY.md — all FOUND.
- Commits: 67267e0 (Task 1), f350398 (Task 2) — all FOUND.
- tsc --noEmit: clean. brand-lock.test.ts: 3/3 passed.

---
*Phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0*
*Completed: 2026-06-12*
