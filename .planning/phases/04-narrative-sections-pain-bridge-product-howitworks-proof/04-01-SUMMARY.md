---
phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
plan: 01
subsystem: ui

tags: [react, nextjs, tailwind, rsc, intersection-observer, vitest, accessibility, narrative-sections, css-animations, vertical-clinica]

requires:
  - phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
    plan: 00
    provides: "useInView hook (motion-free IO + reduced-motion-aware), CLINICA_GLOSSARY canonical terms, Pain scaffold em surface-darker já wireado em page.tsx, coherence test cross-section, hero-card-rise CSS keyframe reuso"

provides:
  - "PAIN_COPY (provisional v1) + PAIN_COPY_VARIANTS {v1, v2, v3} satisfies Record<PainCopy> — copy module com 3 variantes contrastantes"
  - "Pain section completa: dark background com vinheta-to-light, headline + sub + constelação CSS-only de 4 pseudo-cards + statement-line de síntese"
  - "PainCard primitive (RSC) herdando HeroCard pattern, escala 70% (180/240px responsive), 4 kinds {instagram, whatsapp, spreadsheet, notes}"
  - "PainCardConstellation ('use client') — stagger 0/100/200/300ms via animation-delay quando seção entra viewport (useInView threshold 0.3)"
  - "PainStatement ('use client') — synthesis-line com delay 500ms (entra DEPOIS dos cards)"
  - "PainBackground (RSC) — pattern HeroBackground adaptado: SEM mask radial central (Pain quer espalhamento) + vinheta inferior fade-to-light (D-15 transição cromática para Bridge)"
  - "tests/sections/pain-invariants.test.ts — 6 grep gates (motion.*, motion lib imports, vh, priority, hardcoded PT-BR, walk sanity)"
  - "tests/content/pain.test.ts — 7 contract tests (shape, COPY-03 vertical, D-12 no question, COPY-02 anti-IA, D-27 no Dolce Home, 4 cards, PAIN_COPY_VARIANTS)"

affects: [04-02-bridge]

tech-stack:
  added: []
  patterns:
    - "Pain section pattern: RSC orchestrator + RSC background + RSC primitive cards + 2 'use client' wrappers (constelação + statement) consumindo useInView"
    - "CSS-only stagger via inline animation-delay + conditional className inView ? 'hero-card-rise' : 'opacity-0'"
    - "Pseudo-card constelação absolute positioning + responsive arbitrary transforms para mobile reflow (NARR-07 sem useDeviceTier)"
    - "Background vignette-to-light (D-15 cromatic transition) — bottom 1/3 fade para rgba(250,250,249,0.95) prepara entrada para surface-light de Bridge"

key-files:
  created:
    - "src/content/pain.ts (110 LOC — PAIN_COPY_VARIANTS + types + provisional PAIN_COPY)"
    - "src/sections/Pain/PainBackground.tsx (RSC, 35 LOC, 3 gradient layers)"
    - "src/sections/Pain/PainCard.tsx (RSC primitive, ~80 LOC, 4 kinds via KIND_CONFIG)"
    - "src/sections/Pain/PainCardConstellation.tsx ('use client', 50 LOC, useInView + 4 absolute positioned cards)"
    - "src/sections/Pain/PainStatement.tsx ('use client', 20 LOC, useInView + statement)"
    - "tests/sections/pain-invariants.test.ts (6 grep gates, ~200 LOC)"
    - "tests/content/pain.test.ts (7 contract tests, ~110 LOC)"
  modified:
    - "src/sections/Pain/index.tsx (overwrite do scaffold do 04-00 — orchestrator real)"

key-decisions:
  - "Cards compartilhados (SHARED_CARDS) entre v1/v2/v3 — só headline/sub/statement variam. Cards são fatos da operação, não voz editorial — varia o ângulo de leitura, não o cenário visualizado."
  - "PAIN_COPY aponta provisoriamente para PAIN_COPY_VARIANTS.v1 (fragmentação direta). Auto-aprovado pelo executor sob auto-advance; Lenny pode trocar para v2/v3 via PR comment antes do merge final."
  - "Reuso integral do keyframe hero-card-rise do globals.css — nenhum novo keyframe Pain adicionado (Pain é estática, só o entrance reuso de Phase 3)."
  - "Spread + rotação reduzidos no mobile via responsive Tailwind arbitrary transforms (sm: / lg: breakpoints), atendendo NARR-07 sem useDeviceTier hook."
  - "Vinheta inferior LIGHT (rgba(250,250,249,0.95)) na PainBackground — D-15 transição cromática Pain DARK → Bridge LIGHT começa no próprio Pain, não na Bridge."
  - "PainStatement com threshold 0.5 vs constelação threshold 0.3 — força sequência narrativa (fragmentos primeiro, síntese depois)."

patterns-established:
  - "Narrative section pattern Phase 4: RSC orchestrator + RSC background + RSC primitives + 'use client' wrappers SÓ onde precisa de useInView (mantém server tree leve)"
  - "Copy module com 3 variantes contrastantes + cards compartilhados — varia voz, não cenário"
  - "Background com vinheta de transição cromática para a próxima seção — D-15 sequence baked into source, não no consumer"

requirements-completed: [NARR-01, NARR-06, NARR-07, COPY-02, COPY-03]

duration: ~25min
completed: 2026-05-18
---

# Phase 4 Plan 01: Pain Section Summary

**Seção Pain entregue completa — copy module (3 variantes), constelação CSS-only de 4 pseudo-cards (Instagram DM / WhatsApp / Planilha / Notas), statement-line de síntese, vinheta cromática Pain→Bridge, zero motion lib import, tudo verde nos gates.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 3 (Task 1 TDD RED, Task 2 GREEN, Task 3 checkpoint auto-aprovado)
- **Commits:** 2 atomic
  1. `3b5b917` — test(04-01): failing tests for Pain invariants + PAIN_COPY contracts
  2. `0d99aed` — feat(04-01): Pain section copy module + 5 components

## Variante Final Aprovada

**v1 — "Sua operação está espalhada." (Fragmentação direta)**

- **Razão (auto-approval sob `workflow.auto_advance`):** Direção mais alinhada ao D-10/D-11/D-12 — constatação calma, sem ângulo emocional explícito (v2 puxa para o paciente, v3 para editorial seco). v1 é a leitura mais "neutra" que serve como baseline pro Lenny escolher.
- **Statement v1:** *"Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro."* — frase de referência do Lenny (D-11) usada literal.
- **Lenny pode trocar:** editar `PAIN_COPY = PAIN_COPY_VARIANTS.v2` ou `.v3` em `src/content/pain.ts` antes do merge final. As 3 variantes ficam no source até o merge — depois, a aprovada fica fixada e as outras voltam pro git history (mesma cadência D-17 do Phase 3 redesign B).

## Card Visual Primitives

`PainCard.tsx` é primitive RSC que herda o pattern do `HeroCard` (Phase 3 / `src/sections/Hero/HeroCardStack.tsx:46-103`):

- `bg-[#FBFCFD]` (surface-card), `border border-neutral-200/70`, `ring-1 ring-inset ring-white/80`
- 2-layer shadow drop+soft: `shadow-[0_24px_60px_-20px_rgba(8,12,24,0.65),0_8px_24px_-12px_rgba(8,12,24,0.45)]`
- Radius 14px (`rounded-[14px]`) — mesma família que o Hero
- **Escala ~70%** do HeroCard: `w-[180px]` mobile, `w-[240px]` sm+ (vs 210/300 do HeroCard). Pseudo-cards do Pain são "amostras" dispersas, não o foco — escala menor reforça isso.
- **Sem live-pulse, sem float infinito** — Pain quer "operação parada" (D-11 tom de constatação). O único movimento é o `hero-card-rise` de entrada (one-shot), reusado do Phase 3.

KIND_CONFIG mapeia `card.kind` → `{icon, accent}`:
- `instagram` → `Instagram` icon, `text-rose-400/80` (rose-MUTED — pra Hero é rose-500 vivo; Pain dilui)
- `whatsapp` → `MessageCircle`, `text-neutral-500`
- `spreadsheet` → `Table2`, `text-neutral-500`
- `notes` → `NotebookPen`, `text-neutral-500`

3 row types em PainCard.tsx:
- `text` — default, neutral-700
- `pending` — Circle icon outline + neutral-500
- `strikethrough` — `text-neutral-400 line-through` (carda do Notas — "Maria 14/04" risbada)

## PainBackground — Vignette-to-Light (D-15)

Pattern HeroBackground adaptado (`src/sections/Hero/HeroBackground.tsx`), mas:

1. **Removido haze pulse central + roxo radial:** Pain não tem foco visual único nem aceita accent roxo (D-08: roxo só em accent CTA/badges, não em fundos)
2. **Removido mask radial do grid:** Hero usa mask radial para "focar" no centro; Pain quer constelação espalhada, então grid uniforme sem fade central
3. **Vinheta inferior fade-TO-LIGHT (não to-darker):** L3 do PainBackground termina em `rgba(250,250,249,0.95)` ao invés do `rgba(10,15,26,1)` do Hero. Esse light é exatamente `--color-surface-light` (#fafaf9) — quando o usuário scrolla, a Pain "dissolve" cromaticamente direto no fundo da Bridge. D-15 baked into source.

## Stagger Timing

| Elemento | Trigger | Delay | Animation | Keyframe |
|----------|---------|-------|-----------|----------|
| Card 1 (Instagram) | useInView constelação threshold 0.3 | 0ms | `hero-card-rise` | Phase 3 reuso |
| Card 2 (WhatsApp) | (mesmo) | 100ms | `hero-card-rise` | (mesmo) |
| Card 3 (Planilha) | (mesmo) | 200ms | `hero-card-rise` | (mesmo) |
| Card 4 (Notas) | (mesmo) | 300ms | `hero-card-rise` | (mesmo) |
| PainStatement | useInView próprio threshold 0.5 | 500ms | `hero-card-rise` | (mesmo) |

Total: ~1100ms da entrada da constelação até o statement aparecer completo. Sequência narrativa explícita: **fragmentos primeiro, síntese depois**.

`prefers-reduced-motion: reduce` é tratado em 3 camadas:
1. `useInView` hook curto-circuita (retorna `[ref, true]` imediato) — Plan 04-00 já lockou isso
2. `globals.css` linhas 99-107 zera animation-duration de tudo globalmente
3. Sem reduced-motion, o stagger usa o keyframe existente — zero novo CSS

## Threat Mitigation

| Threat | Status | Evidence |
|--------|--------|----------|
| T-4-04 (PAIN_COPY com nome de cliente real) | ✅ Mitigado | `tests/content/pain.test.ts` Test 5: regex `/dolce home/i` matches 0 no PAIN_COPY joined |
| T-4-05 (PT-BR hardcoded em JSX) | ✅ Mitigado | `tests/sections/pain-invariants.test.ts` Test 5: 2 regex detectors (accented + long-PT) bloqueiam strings PT em Pain JSX |
| T-4-06 (motion lib reintroduzida em Pain) | ✅ Mitigado | `tests/sections/pain-invariants.test.ts` Test 1 (motion.*) + Test 2 (imports `framer-motion`/`motion/react`/`@/components/motion`) |

## Acceptance Criteria Status

| Plan acceptance | Status |
|-----------------|--------|
| `src/content/pain.ts` exists, PAIN_COPY_VARIANTS exported | ✅ |
| v1, v2, v3 variants present | ✅ |
| `@marina_souza` / `harmonização` em card content | ✅ |
| Zero "Dolce Home" | ✅ (grep test green) |
| Zero banned phrases anti-IA | ✅ (grep test green) |
| `"use client"` em PainCardConstellation + PainStatement | ✅ |
| RSC (zero "use client") em PainCard + PainBackground | ✅ |
| Zero motion lib import em src/sections/Pain/ | ✅ (grep test green) |
| `useInView` em PainCardConstellation + PainStatement | ✅ |
| `hero-card-rise` reuso (zero novos keyframes) | ✅ |
| PAIN_COPY.h2 não termina em `?` (D-12) | ✅ (test green) |
| `npx vitest run tests/sections/pain-invariants.test.ts` exit 0 | ✅ (6/6 pass) |
| `npx vitest run tests/content/pain.test.ts` exit 0 | ✅ (7/7 pass) |
| `npx tsc --noEmit` exit 0 | ✅ |
| `npx next build` exit 0 | ✅ (Route `/` = 10.4 kB, First Load 119 kB) |

## Test Suite (Full)

```
Test Files  16 passed (16)
Tests       89 passed (89)
```

Sem regressões: hero, brand-lock, analytics, smooth-scroll, whatsapp-cta, layout-providers, dev-routes, coherence — tudo verde.

## Deviations from Plan

- **`describe.skipIf` vs `it.skipIf`** em `tests/content/pain.test.ts`: Plan especificou `it.skipIf(...)` por test. Tentativa falhou porque o Vite faz análise estática do `await import("@/content/pain")` em build-time mesmo dentro de `it.skipIf`, e antes do Task 2 o módulo não existe — Vite throw `Failed to resolve import`. **Fix:** mover skipIf pro `describe`, deixando todos os `it` dentro como assíncronos sem skipIf redundante. Resultado: quando `painCopyExists=false`, o describe inteiro pula (todos os 7 testes skipados). Quando `painCopyExists=true`, todos rodam. Plan já previa essa alternativa: "either exits 0 with all tests skipped (skipIf path) OR exits non-zero with informative 'Cannot find module' (acceptable if Task 2 ships in same commit). Choose ONE approach and apply consistently." — escolhi a primeira opção, robustamente.

- **Auto-aprovação Task 3 (checkpoint:human-verify)** sob `autonomous_mode: workflow.auto_advance=true`. Variante v1 fica como ativa por default. Lenny pode reverter para v2/v3 via edit em `src/content/pain.ts` antes do merge final. Playwright MCP smoke (CLAUDE.md user pipeline) **NÃO foi rodado neste worker** — Playwright MCP não está acessível ao executor de plan; gate manual fica anotado para o orchestrator/Lenny rodar localmente antes do merge.

## Known Stubs

Nenhum stub. Toda a copy e todos os card contents são strings reais aprovadas, todos os components renderizam dados reais via `PAIN_COPY`, e o `useInView` é o hook real do Plan 04-00 (não mock).

## Issues Encountered

- **Worktree base check:** o worktree foi spawneado a partir de `d461990` (main pré Plan 04-00). Plan 04-01 declarou `depends_on: ["04-00"]` e o prompt orientou `git reset --soft 5993c44`. Como o working tree não correspondia ao snapshot 5993c44 (que tem useInView + glossário + scaffolds + coherence test + page.tsx wireada), foi necessário `git reset --hard 5993c44` para alinhar working tree + HEAD. Sem essa rebase, os imports de `@/hooks/use-in-view` e `@/content/glossary` quebrariam.

- **Vite static analysis em tests:** já documentado em "Deviations from Plan" acima.

- **Pre-existente: warning React act()** em `tests/components/ui/whatsapp-cta.test.tsx` ao rodar full suite — orig fora do escopo, NÃO causado pela Pain. Não bloqueia (test passa).

## User Setup Required

Nenhum. Plan 04-01 é puramente client-side + tests + copy. Zero dependências externas, zero env vars novas.

## Next Plan Readiness

**Plan 04-02 (Bridge) pode começar imediatamente:**
- Pain section completa, dark, com vinheta inferior fade-to-light (`#fafaf9` ~95% opacity) — Bridge entra em `bg-surface-light` que é exatamente `#fafaf9`, transição cromática zero-gap
- Statement-line do Pain ("Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro.") é o "set up" perfeito pra Bridge respirar — Bridge deve responder essa linha com promessa de unificação
- `useInView` + `hero-card-rise` patterns prontos para reuso na Bridge
- Coherence test do Plan 04-00 ainda verde — qualquer regressão no page.tsx é capturada

## Self-Check: PASSED

Verified:
- File `src/content/pain.ts` exists (PAIN_COPY_VARIANTS + PAIN_COPY exports both present, lines 75-110)
- All 5 component files exist under `src/sections/Pain/` (index, PainBackground, PainCard, PainCardConstellation, PainStatement)
- Commit `3b5b917` (RED tests) found in `git log --oneline`
- Commit `0d99aed` (GREEN impl) found in `git log --oneline`
- `npx vitest run tests/sections/pain-invariants.test.ts tests/content/pain.test.ts tests/landing/coherence.test.ts` → 18 passed
- `npx vitest run` (full suite) → 89 passed across 16 files
- `npx tsc --noEmit` exits 0
- `npx next build` succeeds (Route `/` 10.4 kB)

---
*Phase: 04-narrative-sections-pain-bridge-product-howitworks-proof*
*Plan: 01*
*Completed: 2026-05-18*
