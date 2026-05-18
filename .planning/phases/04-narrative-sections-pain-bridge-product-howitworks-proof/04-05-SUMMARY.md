---
phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
plan: 05
subsystem: marketing-landing/narrative
tags: [proof, dark-editorial, narrative, phase-4, institutional-silent]
requires:
  - src/components/ui/container.tsx (Container primitive)
  - src/app/globals.css (bg-surface-darker, text-text-on-dark-*, hero-card-rise keyframe — Phase 3)
provides:
  - PROOF_COPY (active variant v1) — type ProofCopy with eyebrow/headline/categories tuple-5
  - PROOF_COPY_VARIANTS (v1/v2/v3) — 3 contrasting copy variants for PR review
  - useInView<T>() hook — IntersectionObserver-based, once-true, SSR-safe
  - <Proof /> section — RSC orchestrator (dark editorial silent)
  - <ProofBackground /> — austere dark layered gradient (RSC)
  - <ProofCategories /> — client row of 5 vertical categories with stagger
affects:
  - src/app/page.tsx (wires Proof as second section after Hero)
tech-stack:
  added: []
  patterns:
    - "CSS-only stagger animation via hero-card-rise keyframe + inline animationDelay"
    - "IntersectionObserver once-true useInView pattern (entrance one-shot, NARR-06 — no motion lib)"
    - "Layered dark backgrounds (gradient + grid + top fade transition) for cromatic stitching"
key-files:
  created:
    - src/content/proof.ts
    - src/hooks/use-in-view.ts
    - src/sections/Proof/index.tsx
    - src/sections/Proof/ProofBackground.tsx
    - src/sections/Proof/ProofCategories.tsx
    - tests/sections/proof-invariants.test.ts
    - tests/content/proof.test.ts
  modified:
    - src/app/page.tsx
decisions:
  - D-24/D-26/D-28 honored — dark institutional silent direction with locked 5-category vertical row
  - Cliente-específico (Dolce Home) excluído mecanicamente — STATE.md 2026-05-18 decision enforced via test gate
  - Variante v1 ativa default (categorias minimal + headline clara sobre vertical) — sujeita à revisão de Lenny via PR
  - useInView criado como dependency (Rule 3 deviation) — esperado de Plan 04-00 que não rodou nesta worktree
metrics:
  duration: "~5 min"
  completed: "2026-05-18"
  tasks: 3
  files: 7
---

# Phase 4 Plan 05: Proof Section — Dark Editorial Silencioso Summary

Proof section ships **dark institutional silent**: row de 5 categorias verticais minimal separadas por dot `·`, stagger CSS-only 100ms via hero-card-rise keyframe, zero logos, zero números fabricados, zero testimonials. D-24/D-26/D-28 honrados; D-27 + STATE.md 2026-05-18 Dolce-Home-negada enforced mecanicamente via 10 contract tests + 9 invariant grep gates.

## What Was Built

### Copy module — `src/content/proof.ts`

3 variantes contrastantes, todas com a **mesma lista travada D-26** (`["Estética", "Dermatologia", "Harmonização Facial", "Odontologia", "Bem-estar"]`):

| Variant | Eyebrow         | Headline                                                                            |
| ------- | --------------- | ----------------------------------------------------------------------------------- |
| **v1 (active)** | EM OPERAÇÃO     | Infraestrutura operacional para clínicas de estética e dermatologia.                |
| v2      | JÁ EM USO       | Em operação em clínicas que dependem de atendimento de alto volume.                 |
| v3      | INFRAESTRUTURA  | A camada operacional já roda em clínicas reais — todos os dias.                     |

Type strictly `readonly [string, string, string, string, string]` — TypeScript-enforced tuple-5 prevents accidental category drift.

### Section components — `src/sections/Proof/`

- **`index.tsx`** (RSC) — `bg-surface-darker`, py-24/lg:py-32, Container max-w-4xl centered. Eyebrow uppercase tracking-[0.22em] text-[11px] muted, h2 editorial text-balance 2xl→4xl semibold tight-tracking primary. id="proof-headline" linked via aria-labelledby.
- **`ProofBackground.tsx`** (RSC) — Austere 3-layer dark background: top fade transition (white→dark for cromatic stitching from light HowItWorks), base atmospheric blue-black gradient (180deg #0A0F1A → #0E1422 → #0A0F1A), grid técnico 72px square com opacity 0.012 (mais baixo que Pain — silêncio visual D-28). **Zero** accent roxo, **zero** radial glow, **zero** haze drift.
- **`ProofCategories.tsx`** (client) — `useInView({ threshold: 0.4 })`. ul flex-wrap items-center justify-center gap-x-4/lg:gap-x-8. Cada categoria entra com `hero-card-rise` + inline `animationDelay: i*100ms`. Separador `·` `text-text-on-dark-muted` entre categorias (não após a última).

### Hook (Rule 3 deviation) — `src/hooks/use-in-view.ts`

Plan 04-05 esperava `use-in-view.ts` como dependência produzida em Plans 04-00–04-04. Como esta worktree foi spawn-ada apenas para 04-05 e os planos anteriores não rodaram aqui, **criei o hook inline** como deviation Rule 3 (blocking issue auto-fix):

- `useInView<T extends HTMLElement>({threshold, rootMargin})` retorna `[ref, inView]`.
- IntersectionObserver-based, **once-true** (disconnect após primeira interseção — entrance one-shot).
- SSR-safe (estado inicial `false`, observer criado no `useEffect`).
- Fallback graceful: navegadores sem IntersectionObserver → `inView=true` imediatamente.
- Reduced-motion já tratado globalmente via `globals.css` (`animation-duration: 0.01ms`).

### Tests

- **`tests/sections/proof-invariants.test.ts`** (9 tests): zero motion.* JSX, zero motion lib imports, zero vh, zero hard-coded PT-BR JSX, zero anti-IA, zero WhatsApp CTA, zero `<Image`, zero logo asset imports + walk() sanity check.
- **`tests/content/proof.test.ts`** (11 tests): shape, 3 variants present, locked D-26 categories tuple-equal across all variants, anti-IA, **zero `dolce home`** (STATE.md gate), zero stat numbers regex, zero "trusted by"/"em parceria"/"líder de mercado"/"referência (do/de)", zero testimonial pattern, eyebrow uppercase length 6-20, headline length 40-150.

## Verification

| Check                                               | Result                |
| --------------------------------------------------- | --------------------- |
| `npx vitest run`                                    | **85/85 pass** (14 files) |
| `npx vitest run tests/.../proof*`                   | **20/20 pass** (2 files)  |
| `npx tsc --noEmit`                                  | **Clean**             |
| `npx next build`                                    | **OK** (13/13 routes prerendered, /  = 8.54 kB / 118 kB FLJS) |
| `grep -c Dolce src/content/proof.ts`                | **0**                 |
| `grep -c "Estética|Dermatologia|Harmonização Facial|Odontologia|Bem-estar" src/content/proof.ts` | 5 (one each, plus the `CATEGORIES` const) |
| `grep -cE "\+\d|\d%" src/content/proof.ts`          | **0** (no stat numbers) |
| `grep -cE "trusted by\|em parceria\|líder" src/content/proof.ts` | **0**       |
| `grep -c "<Image" src/sections/Proof/`              | **0**                 |
| `grep -c motion src/sections/Proof/`                | **0**                 |
| `grep -c WhatsAppCta src/sections/Proof/`           | **0**                 |
| `grep -c "use client" src/sections/Proof/ProofCategories.tsx` | **1**       |
| `grep -c "use client" src/sections/Proof/ProofBackground.tsx` | **0** (RSC) |
| `grep -c useInView src/sections/Proof/ProofCategories.tsx` | **3** (import + hook call + comment) |
| `grep -c hero-card-rise src/sections/Proof/ProofCategories.tsx` | **2** (className + comment) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] `src/hooks/use-in-view.ts` not present in repo**
- **Found during:** Task 2 (impl phase)
- **Issue:** Plan referenced `useInView` from `@/hooks/use-in-view` as an existing dependency expected from Plan 04-00. Filesystem inspection showed: only `Hero/` section exists; `Pain/`, `Bridge/`, `Product/`, `HowItWorks/`, `glossary.ts`, `use-in-view.ts` were never produced. Plans 04-00 through 04-04 evidently did not run in this worktree.
- **Fix:** Created `src/hooks/use-in-view.ts` inline with the minimal contract the plan described (`[ref, inView]`, once-true, threshold/rootMargin options, SSR-safe). Hook follows the same `"use client"` + `useEffect`/`IntersectionObserver` pattern as `use-device-tier.ts` already in the repo.
- **Files modified:** `src/hooks/use-in-view.ts` (created)
- **Commit:** `9936c0b`

**2. [Rule 3 — Blocking] page.tsx did not include Proof**
- **Found during:** Task 2 (impl phase)
- **Issue:** `npx next build` would compile Proof but Proof would be unreachable; D-05 atmosphere sequence verification at checkpoint Task 3 requires Proof rendered in the actual landing.
- **Fix:** Imported and inserted `<Proof />` under `<Hero />` in `src/app/page.tsx`. This wires it as a "stub second section" until earlier Phase 4 plans land Pain/Bridge/Product/HowItWorks between Hero and Proof.
- **Files modified:** `src/app/page.tsx`
- **Commit:** `9936c0b`

**3. [Rule 1 — Bug] JSDoc strings tripped the same regex gates the runtime enforces**
- **Found during:** Task 2 verification
- **Issue:** The plan's acceptance criteria use case-sensitive `grep` against the entire file (not just runtime strings). My initial JSDoc commentary mentioned "Dolce Home", `"trusted by"-likes`, and `RSC (no "use client")` — these are anti-patterns documented inline, but a mechanical grep can't tell the difference between comment-prose and live code. Three gates would have reported `1` instead of `0`.
- **Fix:** Rephrased JSDoc to describe the prohibition without literally embedding the forbidden token (`cliente-específico explicitamente proibido`, `falsos selos de social proof`, `Server Component (default)`).
- **Files modified:** `src/content/proof.ts`, `src/sections/Proof/ProofBackground.tsx`
- **Commit:** `9936c0b` (same commit as feat — fixes were applied before staging)

## Checkpoint Task 3 — Auto-Approved (autonomous_mode)

Auto-mode active (autonomous=false but auto-advance=true per execution context). `checkpoint:human-verify` auto-approved per protocol:

**Selected variant:** v1 (default) — `eyebrow: "EM OPERAÇÃO" / headline: "Infraestrutura operacional para clínicas de estética e dermatologia."`

Lenny pode trocar para v2/v3 a qualquer momento editando a linha `export const PROOF_COPY: ProofCopy = PROOF_COPY_VARIANTS.v1;` em `src/content/proof.ts` — todos os gates seguirão verdes (Test 3 trava categorias, não a variante ativa).

Playwright MCP **NÃO** rodado nesta sessão. Razão: o servidor dev não está no ar nesta worktree headless; a auto-aprovação assumiu o gate visual como confiança no copy + TypeScript + Vitest + next build verdes. Lenny deve rodar `npm run dev` localmente e inspecionar `/` antes do merge.

## Phase 4 Wrap-Up

**⚠ Importante:** Esta worktree contém **apenas** o produto do Plan 04-05. Os Plans 04-00 a 04-04 (Foundation, Pain, Bridge, Product, HowItWorks) **não rodaram aqui**. A sequência atmosférica D-05 completa (Hero dark → Pain dark → Bridge transição → Product light → HowItWorks light → Proof dark) só será visível após o orquestrador da fase mergear todos os 6 plans.

Estado atual da landing nesta worktree: Hero → Proof (com gap visual — Pain/Bridge/Product/HowItWorks faltando entre). Funcional e buildable, mas não é o produto final da Phase 4.

## Known Stubs

Nenhum stub introduzido pelo Plan 04-05. Todos os dados (categorias, eyebrow, headline) são literais não-placeholder. As 3 variantes de copy são reais — não TODOs.

## Threat Flags

Nenhum novo trust boundary ou surface fora do `<threat_model>` declarado. T-4-13/14 mitigations enforced por tests:
- T-4-13 (Dolce Home leak) → `tests/content/proof.test.ts` Test 5
- T-4-14 (fabricated stats / logo strip) → `tests/content/proof.test.ts` Tests 6+7 + `tests/sections/proof-invariants.test.ts` Tests 7+8

## Hand-Off to Phase 5

Phase 5 escope conforme plan: Form (consultative, RHF + Zod + Server Action), Footer, Floating WhatsApp button, CTAs distribuídos. Proof já está pronto para ser o **antepenúltimo bloco visual** antes do Form + Footer. Não há dependência de Proof em Phase 5 — Proof é silencioso e auto-contido.

## Commits

- `50df9fb` — `test(04-05): add failing tests for Proof section invariants and copy contracts`
- `9936c0b` — `feat(04-05): implement Proof section — dark editorial institucional silencioso`

## Self-Check: PASSED

**Files created — verified present:**
- src/content/proof.ts — FOUND
- src/hooks/use-in-view.ts — FOUND
- src/sections/Proof/index.tsx — FOUND
- src/sections/Proof/ProofBackground.tsx — FOUND
- src/sections/Proof/ProofCategories.tsx — FOUND
- tests/sections/proof-invariants.test.ts — FOUND
- tests/content/proof.test.ts — FOUND

**Commits — verified in git log:**
- 50df9fb — FOUND
- 9936c0b — FOUND

**Verification commands — all exit 0:**
- `npx vitest run` — 85/85 PASS
- `npx tsc --noEmit` — clean
- `npx next build` — OK
