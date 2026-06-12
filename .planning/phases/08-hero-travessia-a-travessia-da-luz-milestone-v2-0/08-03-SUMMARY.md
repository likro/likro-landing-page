---
phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0
plan: 03
subsystem: ui
tags: [atmosphere, motion, useTransform, grain, hero-exit, copy, brand-lock, preview]

# Dependency graph
requires:
  - phase: 08
    plan: 01
    provides: "Travessia (palco sticky + progress MotionValue manual + mount pós-hidratação + active/pause + copy/atmosfera placeholders)"
  - phase: 03-hero-benchmarked-isolado
    provides: HERO_COPY (content/hero.ts), WhatsAppCta
provides:
  - "Atmosfera evolutiva monotônica (5 camadas dirigidas por progress): vinheta fria recua, vinheta de tensão fecha-no-caos-abre-na-calma, bloom quente com fonte cresce, banho quente de ambiente, vinheta de ENQUADRAMENTO (abre no meio, fecha íntimo no fim — arco de escala TRV-04)"
  - "Film grain estático (data-URI feTurbulence, mix-blend-overlay ~5%) — mata banding (TBND-01)"
  - "Escuros tingidos roxo-navy (rgba), nunca preto puro (TBND-01)"
  - "Hero exit de vetores opostos (TRV-08): copy sobe+dissolve+encolhe enquanto campo/atmosfera recua/afunda no 1º scroll"
  - "Copy editorial só no topo, some cedo ~0.24 (TRV-09)"
affects: [08-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atmosfera por camadas de gradient consumindo a MotionValue de progress via useTransform (zero React state por frame; só transforms scrubbed)"
    - "Film grain como background-image data-URI SVG feTurbulence (estático, zero custo por frame) com mix-blend-mode overlay"
    - "Hero exit de vetores opostos: copy e campo em wrappers separados com vetores y/scale de sinal oposto sobre o mesmo progress"

key-files:
  created: []
  modified:
    - src/app/preview/_components/Travessia.tsx

key-decisions:
  - "Vinheta de enquadramento NÃO é monotônica numa direção só (abre 0→0.5, fecha 0.5→1.0) — é a curva do arco de escala aberto→envolvente→íntimo (TRV-04), intencionalmente não-monotônica; as 4 camadas de temperatura/tensão SÃO monotônicas (TRV-06)"
  - "Campo + atmosfera viajante envolvidos num wrapper que recua/afunda; a copy fica FORA desse wrapper com vetor oposto — os dois vetores opostos do hero exit emergem da separação estrutural"
  - "Film grain posicionado z-20 (acima da copy z-10) pra unificar a cena inteira sob um 'filme' só"

patterns-established:
  - "Atmosfera scrubbed: cada camada = motion.div com opacity vinda de useTransform(progress,...); reduced-motion → valor estático literal"
  - "Vetores opostos por separação de wrappers (campo recede / copy sobe) sobre o mesmo progress"

requirements-completed: [TRV-06, TRV-08, TRV-09, TBND-01]

# Metrics
duration: ~6min
completed: 2026-06-12
---

# Phase 8 Plan 03: Atmosfera Evolutiva + Hero Exit de Vetores Opostos + Copy Editorial Summary

**Sobre o palco do 08-01, vestiu a outra metade da sensação de jornada: 5 camadas de atmosfera dirigidas por `progress` (frio/tensão→quente/calma monotônica + vinheta de enquadramento que abre no meio e fecha íntimo no fim — arco de escala), escuros tingidos roxo-navy (nunca preto puro), film grain estático (feTurbulence/mix-blend ~5%) que mata banding, e o hero exit de vetores opostos — a copy sobe+dissolve+encolhe enquanto o campo/atmosfera recua/afunda no 1º scroll, entregando o usuário na travessia; a copy some cedo (~0.24) pra luz pura assumir o palco.**

## Performance

- **Duration:** ~6 min
- **Tasks:** 2
- **Files modified:** 1 (`Travessia.tsx` — atmosfera/copy/exit; LightField intocado por design)

## Accomplishments

### Task 1 — Atmosfera evolutiva monotônica + escuros tingidos + film grain (TRV-06, TBND-01)
- **5 camadas de atmosfera** consumindo `progress` via `useTransform` (9 chamadas `useTransform(progress` no total contando copy/field):
  - **Vinheta fria** (`coldOpacity` 0.85→0 até 0.55) — a clínica afogada/distante recua.
  - **Vinheta de tensão** (`tensionVignette` 0.55→0.08 até 0.62) — bordas fechadas no caos, abrem na calma.
  - **Bloom quente central** (`warmBloom` 0→0.66 de 0.28→1) — glow COM FONTE centrado no Foco de Expansão; halo toca roxo discreto `rgba(124,58,237,0.13)`.
  - **Banho quente de ambiente** (`warmWash` 0→0.42 de 0.5→1) — a atmosfera inteira esquenta no fim.
  - **Vinheta de ENQUADRAMENTO** (`framingVignette` [0,0.5,1]→[0.5,0.05,0.6]) — abre no meio, fecha íntimo no fim (arco de escala TRV-04; acompanha o footprint contraindo do 08-02).
- **Escuros tingidos (TBND-01):** base `bg-surface-darker` = `#0A0F1A` (roxo-navy tingido, confirmado em globals.css), gradients em rgba navy/roxo muito escuro; **zero** `rgb(0,0,0)`/`#000`/`#000000`.
- **Film grain (TBND-01):** overlay estático via `background-image` data-URI SVG `feTurbulence`, `mix-blend-mode: overlay`, `opacity 0.05` — zero custo por frame (não roda no rAF), mata banding dos gradients.

### Task 2 — Hero exit de vetores opostos + copy editorial só no topo (TRV-08, TRV-09)
- **Copy sobe + dissolve + encolhe:** `copyY` 0→-56, `copyOpacity` [0,0.12,0.24]→[1,0.6,0] (some por ~0.24, antes do beat de entrada ~0.25), `copyScale` 1→0.97.
- **Campo recua (vetor oposto):** wrapper do campo+atmosfera com `fieldRecede` (y 0→+26) + `fieldScale` (1→0.94) nos primeiros 0.25 — enquanto a copy sobe (-y), o campo desce (+y) e encolhe. Os dois vetores opostos são perceptíveis no 1º scroll.
- **Copy reusa `HERO_COPY`** (sub/CTA/labels); H1_LEAD/H1_EMPHASIS inline (exceção documentada do /preview). CTA via `WhatsAppCta location="hero"`. Ênfase em `italic` da mesma família Inter (sem `font-serif`).
- **Reduced-motion:** copy fica no estado final (sem y/opacity/scale animados); atmosfera cai pra valores estáticos. O caminho `reduced ? ... : motionValue` foi preservado em todas as camadas (refino completo do anti-enjoo é do 08-04).

## Task Commits

1. **Task 1: Atmosfera evolutiva + vinheta de enquadramento + film grain** - `20fdc54` (feat)
2. **Task 2: Hero exit de vetores opostos + copy some cedo** - `92f9e94` (feat)

## Files Created/Modified
- `src/app/preview/_components/Travessia.tsx` - Elevou os placeholders de atmosfera do 08-01 pros 5 beats; adicionou vinheta de enquadramento, film grain estático e o hero exit de vetores opostos (campo recede / copy sobe). LightField, progress rAF, mount/pause e CLS=0 do 08-01 intocados.

## Decisions Made
- **Vinheta de enquadramento intencionalmente não-monotônica:** abre 0→0.5, fecha 0.5→1.0 — é a curva do arco de escala (aberto→envolvente→íntimo, TRV-04), distinta das 4 camadas de temperatura/tensão que SÃO monotônicas (TRV-06). Documentado inline pra não parecer regressão pro verificador.
- **Vetores opostos por separação estrutural:** o campo+atmosfera vivem num wrapper que recua; a copy fica FORA dele com vetor oposto. Os dois vetores emergem da árvore, não de cálculo acoplado.
- **Grain z-20 acima da copy (z-10):** unifica a cena inteira (incl. texto) sob um "filme" único, alinhado ao teardown Cairn (grain global unificador).

## Deviations from Plan

**None - plano executado exatamente como escrito.** As declarações `copyY`/`copyOpacity`/`fieldRecede`/`fieldScale` foram introduzidas na edição da Task 1 (junto com a atmosfera, por proximidade de código), e a Task 2 adicionou o `copyScale`, o wrapper de vetor oposto e a documentação do gesto — cada task ficou num commit atômico e buildável.

## Issues Encountered
- Avisos de CRLF do git (LF→CRLF no Windows) — esperados e inofensivos.

## User Setup Required
None - nenhuma configuração de serviço externo.

## Known Stubs
None - todas as camadas de atmosfera são funcionais e acopladas ao progress real; a copy vem de `HERO_COPY`. O refino de reduced-motion/degradação (estático-premium completo) é responsabilidade explícita do 08-04 (não é stub — é fallback básico funcional já presente).

## Next Phase Readiness
- **Pronto para 08-04 (a11y/degradação + harness de validação):** o caminho `reduced ? estático : motionValue` já existe em todas as camadas (atmosfera + copy + field exit); o 08-04 substitui os valores estáticos pelo tratamento anti-enjoo completo e mata o optic flow.
- **Validação visual (Playwright 5-quadros + reduced-motion + mobile) NÃO roda aqui** — pertence ao 08-04 + checkpoint humano do Lenny. tsc + brand-lock verdes neste plano.

## Self-Check: PASSED

- File: `src/app/preview/_components/Travessia.tsx` — FOUND.
- Commits: `20fdc54` (Task 1), `92f9e94` (Task 2) — both FOUND.
- `npx tsc --noEmit`: clean. `tests/brand-lock.test.ts`: 3/3 passed.
- Greps: 9× `useTransform(progress`; grain `mix-blend`+`feTurbulence` @ opacity 0.05; zero `rgb(0,0,0)`/`#000`/`#000000`; zero hex de marca literal (roxo via `rgba(124,58,237`); `copyY`/`copyOpacity`/`fieldRecede`/`fieldScale`; `HERO_COPY.sub`/`ctaPrimary`; `WhatsAppCta location="hero"`; `italic` sem `font-serif`.

---
*Phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0*
*Completed: 2026-06-12*
