---
phase: 3
slug: hero-benchmarked-isolado
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-16
reconciled: 2026-05-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Reconciled against final PLAN.md task IDs from `03-01-PLAN.md`, `03-02-PLAN.md`, `03-03-PLAN.md`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.4 + @testing-library/react 16 + jsdom 25 (verificado em `package.json`) |
| **Config file** | `vitest.config.ts` (existe; alias `@` → `./src` configurado) |
| **Quick run command** | `npx vitest run <path>` |
| **Full suite command** | `npm test && npm run typecheck && npm run lint && npm run build` |
| **Estimated runtime** | ~30 segundos (unit + grep tests; Lighthouse benchmark é manual out-of-band) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run <changed test file>` (rápido, < 10s)
- **After every plan wave:** Run `npm test && npm run typecheck && npm run lint && npm run build` (~60s)
- **Before `/gsd-verify-work`:** Full suite green + Lighthouse mobile run on Vercel preview + real-device deep link check (D-19)
- **Max feedback latency:** 60 segundos (automated) / manual benchmark out-of-band

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | CTA-04 (parcial — type union) | T-3-02 | `WhatsAppLocation` union inclui `"header"`; `WHATSAPP_MESSAGES.header` exhaustive | unit + typecheck | `npx vitest run tests/lib/whatsapp.test.ts && npm run typecheck` | ✅ extends existing | ⬜ pending |
| 3-01-02 | 01 | 1 | HERO-02, HERO-04, HERO-05, COPY-01, COPY-02 | T-3-01 | Grep Wave 0 (revision-1 hardened): zero `motion.*` em Hero, zero `vh` puro, **`priority` count condicional (=== 1 se HeroMockup.tsx existe; <= 1 se ainda não — BLOCKER 2 fix)**, **strings PT-BR hard-coded via regex genérico (2 detectores: vogais acentuadas + sentence-length, não keyword-narrow — BLOCKER 3 fix)**, zero frases banidas em src/content/hero.ts | grep tests Node-puro | `npx vitest run tests/sections/hero-invariants.test.ts` | ❌ W0 created here | ⬜ pending |
| 3-01-03 | 01 | 1 | CTA-04 | T-3-02, T-3-05 | Mockup asset + **.env.local.example reconciliado in-place (WARNING 5 fix; não criar .env.example)** + .env.local + STATE.md + **public/logos/likro-logo.svg gate (BLOCKER 4 fix) + UI-SPEC §217 divergence flagged** | file + env + asset check | `node -e "..." mockup size + env grep + logo existsSync` (acceptance) | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | COPY-01, HERO-02 (anti-IA) | T-3-01 | `src/content/hero.ts` exporta 3 variantes; `clínica` em h1+sub; ctaLabel="Falar no WhatsApp"; sem Dolce Home; sem frases banidas; HERO_COPY = variante ativa; **+ Test 9 (BLOCKER 1 fix): WHATSAPP_MESSAGES.hero + .header também passam anti-IA + length + sem Dolce Home; cobertos pelo MESMO PR de copy gate (D-17)** | unit (9 testes shape) | `npx vitest run tests/content/hero.test.ts` | ❌ created here | ⬜ pending |
| 3-02-02 | 02 | 2 | HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, COPY-01 | T-3-01, T-3-04, T-3-05 | Hero + Header + page.tsx; min-h-svh (duplicado intencional, doc-comentado — WARNING 7 fix); priority count === 1 strict (BLOCKER 2 fix; Test 3 branch ativo); zero motion em sections/Hero; copy via HERO_COPY; **+ Playwright MCP smoke 375x667 + 1280x720 (WARNING 9 + INFO 13 fix — alinhado CLAUDE.md global)** | grep (Wave 0 hero-invariants) + build + Playwright smoke | `npm run typecheck && npx vitest run tests/sections/hero-invariants.test.ts tests/content/hero.test.ts && npm run build + Playwright MCP browser_snapshot` | ❌ → 2 grep verde apos | ⬜ pending |
| 3-03-01 | 03 | 3 | COPY-04 | — | Docs (copy-review, device-test, five-second, PR template) presentes com min_lines | file + content grep | `node -e "[...].forEach(f=>...)"` | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 3 | COPY-04 | — | Lenny aprovou variante via PR; HERO_COPY = HERO_COPY_VARIANTS.vN refletindo escolha | grep regex contra src/content/hero.ts | `node -e "match HERO_COPY_VARIANTS.v[123]"` | ✅ (após Plan 02) | ⬜ pending |
| 3-03-03 | 03 | 3 | HERO-06, HERO-07, CTA-04 | T-3-02, T-3-04 | 03-VERIFICATION.md preenchido com Lighthouse mediana, 8 cenarios real-device, 3 respostas 5-second test, veredicto; **placeholder gate estendido (WARNING 8 fix): rejeita _ em células de tabela e em quoted strings, não apenas <URL>/YYYY-MM-DD** | manual checklist | `node -e "VERIFICATION.md sections + no placeholders (including _)"` | ❌ created here | ⬜ pending |
| 3-03-04 | 03 | 3 | — (state management) | — | STATE.md completed_phases=3, ROADMAP Phase 3 marcada `[x]` com 3 plans | file grep | `node -e "STATE check + ROADMAP check"` | ❌ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/whatsapp.test.ts` — **EXTEND** (existe desde Phase 1) com caso `location='header'` — Plan 01 Task 1
- [ ] `tests/sections/hero-invariants.test.ts` — **CREATE** grep tests Node-puro: zero `motion.*` em sections/Hero, zero `vh` puro, exatamente 1 `priority` em src/, zero strings PT-BR hard-coded em JSX Hero/Header, zero frases banidas anti-IA em src/content/hero.ts — Plan 01 Task 2
- [ ] `tests/content/hero.test.ts` — **CREATE** shape tests: 3 variantes; clínica em h1+sub; ctaLabel locked; iconName allowlist; sem Dolce Home; sem frases banidas; HERO_COPY ativa — Plan 02 Task 1
- [x] `vitest.config.ts` — **EXISTS** (Phase 1) — alias `@` → `./src` configurado, jsdom env, setupFiles wired
- [x] `tests/setup.ts` — **EXISTS** (Phase 1)
- [N/A] `playwright.config.ts` — NÃO criar nesta fase. Hero é estático; real-device é manual (D-19). Playwright entra apenas se Phase 7 quiser cobertura a11y automatizada (PERF-01, A11Y-02).
- [N/A] `lighthouserc.json` — NÃO criar nesta fase. D-19 explicitamente trava "checklist manual" (alinha com Phase 1 D-15 e Phase 2 D-16, sem automação prematura). Lighthouse CI entra na Phase 7 (PERF-01).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp app abre (não browser) em iPhone real | HERO-04 / CTA-04 / CTA-07 | iOS Universal Link não pode ser simulado em jsdom/Playwright | Seguir `docs/device-test-checklist.md` §iPhone (Plan 03 Task 1 cria) |
| WhatsApp app abre em Android real | HERO-04 / CTA-04 | Android Intent resolution + IAB fallback behavior | Seguir `docs/device-test-checklist.md` §Android |
| Lighthouse mobile LCP < 2.5s em Vercel preview | HERO-06 | LCP benchmark precisa production bundle + Vercel edge | Chrome DevTools Lighthouse Mobile preset Simulated Slow 4G + 4x CPU; 3 runs mediana; registrar em 03-VERIFICATION.md (Plan 03 Task 3) |
| 5-second test pass | HERO-07 | Precisa de 3 humanos sem contexto do projeto | Seguir `docs/five-second-test-plan.md` (Plan 03 Task 1 cria) com 3 pessoas; pass = ≥2 acertam 3 itens (categoria + clínica + WhatsApp) |
| Copy aprovada por Lenny via PR | COPY-04 / COPY-01 | Subjetivo brand judgment | PR description usa template `.github/PULL_REQUEST_TEMPLATE.md` (Plan 03 Task 1 cria); Lenny aprova via comentário "LGTM vN" OU edit inline; merge somente após aprovação registrada (Plan 03 Task 2) |
| Vercel env vars `NEXT_PUBLIC_WA_NUMBER` configurada em 3 ambientes | CTA-04 | Vercel CLI opcional; checkpoint humano garante presença em Production/Preview/Development | Dashboard Vercel → Settings → Environment Variables; confirmar antes do Lighthouse + real-device (Plan 03 Task 3 sub-checkpoint A) |

---

## Sampling Continuity Check

Verificação de não ter 3 tasks consecutivas sem automated verify:

| Task | Has automated verify? |
|------|------------------------|
| 3-01-01 | ✅ vitest + typecheck |
| 3-01-02 | ✅ vitest grep tests |
| 3-01-03 | ✅ node file/size check |
| 3-02-01 | ✅ vitest shape tests |
| 3-02-02 | ✅ vitest + typecheck + build |
| 3-03-01 | ✅ node file check |
| 3-03-02 | ✅ node regex match |
| 3-03-03 | ✅ node sections + no-placeholder check |
| 3-03-04 | ✅ node STATE+ROADMAP check |

**Sampling continuity: PASS** — zero gaps de 3 tasks consecutivas sem automated verify.

---

## Revision History

**Iteration 1 — 2026-05-16:** Hardened against checker feedback (4 blockers + 6 warnings):
- BLOCKER 1 (Plan 02 Test 9 added — WHATSAPP_MESSAGES gate)
- BLOCKER 2 (Plan 01 Test 3 conditional strict gate; Plan 02 reinforces with mockup-exists check)
- BLOCKER 3 (Plan 01 Test 4 generic PT-BR regex w/ 2 detectors + canary cases + allowlist)
- BLOCKER 4 (Plan 01 Task 3 logo asset existsSync gate + UI-SPEC §217 divergence flagged)
- WARNING 5 (Plan 01 reconcile .env.local.example in-place; no .env.example dup)
- WARNING 6 (Plan 02 acceptance uses vitest test runner, not bash grep; avoids sitemap.ts false-positive)
- WARNING 7 (Plan 02 inline comment + doc block justify double min-h-svh)
- WARNING 8 (Plan 03 verify Node script rejects _ placeholders)
- WARNING 9 + INFO 13 (Plan 02 acceptance adds Playwright MCP smoke 375x667 + 1280x720)
- WARNING 10 (Plan 02 v3 trust signal changed to remove "operação ativa" duplication with v1)

Wave structure (1 → 2 → 3) and task count unchanged.

---

## Validation Sign-Off

- [x] All plan tasks have automated verify OR Wave 0 dependencies OR Manual-Only justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (whatsapp header union test, lcp-invariant grep, content shape, docs templates)
- [x] No watch-mode flags in any task command
- [x] Feedback latency < 60s for automated suite
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** reconciled and approved by planner. Ready for `/gsd-execute-phase 3`.
