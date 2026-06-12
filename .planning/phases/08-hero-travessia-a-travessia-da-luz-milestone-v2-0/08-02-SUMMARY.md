---
phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0
plan: 02
subsystem: ui
tags: [canvas2d, target-lerp, morph, scroll, motion, narrative, brand-lock, preview]

# Dependency graph
requires:
  - phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0
    provides: "08-01 — engine pseudo-3D (partículas com z, projeção focal, optic flow radial do Foco central, baldes de profundidade, atlas de blur assado, 1 RAF lendo progressRef, DPR≤1.5, pause via active)"
provides:
  - "Morph caos→ordem por TARGET-LERP (targetAngle/targetRadius/targetZ por partícula + easeInOutCubic) — UMA matéria condensando, NUNCA crossfade"
  - "Envelope de ruído orgânico (sin/cos em camadas) com amplitude 1→0 (o alvo vence no fim)"
  - "Estado ordenado ABSTRATO: ~5 faixas de fluxo (BANDS) numa região central contida — sem cards/dashboard/chat"
  - "5 momentos como REGIÕES contínuas monotônicas no progress (temperatura frio→quente, brilho, footprint, roxo) — sem switch por beat"
  - "Arco de escala: footprint = lerp(1.0, 0.42, e) contrai o estado ordenado → chegada íntima/contida"
  - "Roxo escasso intensificando na chegada: purpleGain = clamp((progress-0.5)/0.5) * nearness — só accent raro, perto+tarde"
affects: [08-03, 08-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Target-lerp de matéria compartilhada: pos = lerp(caosPos, targetPos, easeInOutCubic(progress)) + ruído com envelope (1-e) — continuidade do 'um espaço' sem crossfade"
    - "Deriva tonal por atlas pré-assados (TEMP_STEPS níveis COLD→WARM), selecionados por progress no loop — zero gradiente por frame"
    - "Beats como regiões de um gradiente de parâmetros monotônico, não switches indexados por cena"

key-files:
  created: []
  modified:
    - src/app/preview/_components/LightField.tsx

key-decisions:
  - "Estado ordenado = ~5 faixas de fluxo horizontais (BANDS) num feixe central, calculadas em fração-de-canvas e convertidas pra polar (targetAngle/targetRadius) — reusa a MESMA projeção do caos, abstrato (sem UI literal)"
  - "Deriva tonal frio→quente via atlas pré-assados COLD→WARM em TEMP_STEPS passos (selecionados por progress), em vez de tint per-particle por frame — mantém O(n) sem alocação no loop (T-08-04)"
  - "Roxo gated por purpleProgress (temporal, >0.5) E nearness (scale) — acende só accent raro, perto da chegada, com boost de alpha proporcional a purpleGain (intensifica, não 'liga')"

patterns-established:
  - "Continuidade caos→ordem: target-lerp easeInOutCubic + envelope de ruído 1→0 (NUNCA crossfade — sem segundo campo de partículas)"
  - "Arco de escala por contração de footprint multiplicando a dispersão dos alvos (combinado ao dolly do optic flow do 08-01)"
  - "Escassez do acento como payoff: gate (progress alto × proximidade), não papel de parede"

requirements-completed: [TRV-02, TRV-04, TRV-05, TRV-07]

# Metrics
duration: 5min
completed: 2026-06-12
---

# Phase 8 Plan 02: A Narrativa Caos→Ordem (Target-Lerp + 5 Momentos) Summary

**Morph caos→ordem por target-lerp `easeInOutCubic` (a MESMA matéria condensando, sem crossfade) com envelope de ruído 1→0, estado ordenado abstrato em ~5 faixas de fluxo, 5 momentos como regiões contínuas monotônicas (frio→quente, footprint contraindo pra íntimo, roxo escasso só acendendo perto+tarde) — sobre a engine pseudo-3D do 08-01.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-12T00:24:51Z
- **Completed:** 2026-06-12T00:29:14Z
- **Tasks:** 2
- **Files modified:** 1 (LightField.tsx — estende a engine do 08-01)

## Accomplishments
- **Target-lerp caos→ordem (TRV-05):** cada partícula ganhou um estado ordenado (`targetAngle`/`targetRadius`/`targetZ`); no `drawFrame`, `e = easeInOutCubic(progress)` faz `pos = lerp(caosPos, targetPos, e)` — a MESMA partícula migra. O ruído orgânico (sin/cos em camadas, sem dep simplex — fallback permitido) tem envelope `(1 - e)` 1→0, então o alvo vence no fim. Sem segundo campo de partículas / sem crossfade: uma matéria só condensando.
- **Estado ordenado abstrato:** ~5 faixas de fluxo horizontais (`BANDS`) com jitter suave, num feixe central — calculado em fração-de-canvas e convertido pra polar (reusa a projeção do caos). Zero geometria literal (sem cards/dashboard/chat).
- **5 momentos (TRV-02):** temperatura (atlas COLD→WARM em `TEMP_STEPS`), brilho (`lerp(0.82,1.12,e)`), footprint e acendimento roxo mapeados MONOTONICAMENTE no progress — ~0/.25/.5/.75/1 leem como 5 quadros distintos. Beats são regiões do gradiente de parâmetros, não switches (zero `if (beat===N)` / `switch`).
- **Arco de escala (TRV-04):** `footprint = lerp(1.0, 0.42, e)` contrai a dispersão dos alvos → o estado ordenado fecha numa região central contida (aberto→envolvente→íntimo), combinado ao dolly do optic flow do 08-01.
- **Chegada conquistada + roxo escasso (TRV-07):** `purpleGain = clamp((progress-0.5)/0.5,0,1) * nearness` (nearness derivado do scale). Só partículas `accent` raras (14%) acendem, e só quando estão perto E perto da chegada; o alpha é reforçado por `purpleGain` (intensifica, não liga binário). Roxo via `rgba(124,58,237,…)` — sem hex de marca. Brand-lock verde.

## Task Commits

Each task was committed atomically:

1. **Task 1: Target-lerp caos→ordem — uma matéria condensando (sem crossfade)** - `ccfe5f6` (feat)
2. **Task 2: 5 momentos + arco de escala + chegada conquistada (roxo escasso)** - `63e932d` (feat)

**Plan metadata:** (este commit — docs: complete plan)

## Files Created/Modified
- `src/app/preview/_components/LightField.tsx` - Estendido com: modelo de partícula com alvo (`targetAngle`/`targetRadius`/`targetZ`/`noisePhase`); `easeInOutCubic` + `lerpRgb`; atlas de deriva tonal pré-assado (`tempAtlases` COLD→WARM, `TEMP_STEPS`) + `accentAtlas` roxo; `drawFrame` reescrito com target-lerp, envelope de ruído 1→0, footprint contraindo, brilho monotônico e gate de roxo escasso (progress×nearness). A engine do 08-01 (projeção, optic flow, baldes, 1 RAF, pause, DPR≤1.5) ficou intacta.

## Decisions Made
- **Estado ordenado em polar via BANDS:** os alvos são ~5 faixas horizontais num feixe central, calculadas em (x,y) e convertidas pra `atan2`/`hypot` → reaproveitam a MESMA projeção focal do caos (uma matéria só, sem dois sistemas de coordenadas). Abstrato por design.
- **Deriva tonal por atlas pré-assados, não tint por frame:** baked `TEMP_STEPS` níveis COLD→WARM no mount; o loop só seleciona o índice por progress. Evita criar gradiente/recolorir por partícula por frame — honra a restrição O(n) sem alocação no loop (mitiga T-08-04 DoS).
- **Roxo como intensificação, não toggle:** o gate `purpleGain` controla tanto a troca de atlas (acima de 0.12) quanto um boost de alpha proporcional — a escassez fica suave e cresce até a chegada, em vez de um "pisca" binário.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reescrita de comentários com tokens literais pegos pelo grep estrito (`#7c3aed`, `beat===2`)**
- **Found during:** Tasks 1 e 2 (verificação das acceptance criteria / brand-lock)
- **Issue:** (a) Um comentário documentava o roxo como "NUNCA hex literal #7c3aed" — o `tests/brand-lock.test.ts` falha em QUALQUER ocorrência de `#7c3aed` no `src/`, inclusive em comentário (mesmo gotcha já registrado no 08-01-SUMMARY deviation 1). (b) Um comentário alertava "sem `if (beat===2)`" — o grep da acceptance criteria proíbe `=== 2` indexando cenas, e pegaria o token literal.
- **Fix:** Reescritos os comentários preservando o aviso sem o token literal ("NUNCA o hex de marca" / "sem ramificar por número-de-beat").
- **Files modified:** src/app/preview/_components/LightField.tsx
- **Verification:** `tests/brand-lock.test.ts` 3/3 verde; grep de `=== ?[12]`/`switch`/`beat ===` = 0 matches; `npx tsc --noEmit` limpo.
- **Committed in:** ccfe5f6 (Task 1) + 63e932d (Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking — cosmético, sem mudança de comportamento)
**Impact on plan:** Nenhuma mudança de runtime; só reescrita de comentários pra satisfazer grep/brand-lock estritos. Sem scope creep. Mesmo padrão de gotcha já documentado no 08-01.

## Issues Encountered
- Brand-lock pegou o `#7c3aed` literal num comentário no primeiro `vitest run` (esperado — é a defesa do grep). Resolvido reescrevendo o comentário; demais checks já estavam verdes. Avisos de CRLF do git são esperados no Windows e inofensivos.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - o LightField agora renderiza a jornada caos→ordem completa (target-lerp, 5 momentos, footprint, roxo escasso). A atmosfera/grain/vinheta e a copy/hero-exit são responsabilidade explícita dos planos 08-03; a a11y/reduced-motion elaborada + harness dos 5 quadros são do 08-04 (diferido por design, não stub).

## Next Phase Readiness
- **Pronto para 08-03 (atmosfera/grain/roxo escasso refinado + copy):** o roxo já tem o gate de escassez (progress×nearness) que o 08-03 pode amplificar/refinar; a deriva tonal frio→quente já é o leito pra vinhetas de tensão→calma; o estado ordenado abstrato (BANDS) está pronto pro bloom/banho quente do fim.
- **Pronto para 08-04 (a11y + harness dos 5 quadros):** os 5 momentos são monotônicos e distintos por construção (temp/footprint/brilho/roxo), prontos pro teste TVER-01 (Playwright 5-quadros) e pro fallback antes/depois do reduced-motion.
- **Validação visual (Playwright/5 quadros) NÃO roda aqui** — pertence ao 08-04 + checkpoint humano do Lenny (per o verification-note do plano). tsc + brand-lock verdes neste plano.

## Self-Check: PASSED

- Files: LightField.tsx, 08-02-SUMMARY.md — all FOUND.
- Commits: ccfe5f6 (Task 1), 63e932d (Task 2) — all FOUND.
- tsc --noEmit: clean. brand-lock.test.ts: 3/3 passed.

---
*Phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0*
*Completed: 2026-06-12*
