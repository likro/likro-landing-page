---
phase: 7
slug: seo-a11y-performance-deploy-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 7 — Validation Strategy

> Per-phase validation contract. Derived from `07-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@^3.2.4` + `@testing-library/react@^16` + `jsdom@^25` |
| **Config file** | `vitest.config.ts` (alias `@`, setup `./tests/setup.ts`) |
| **Quick run command** | `npm test -- --run <pattern>` |
| **Full suite command** | `npm test` + `npm run typecheck` + `npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** `npm test -- --run <changed-file-pattern>`
- **After every plan wave:** `npm test` (full) + `npm run typecheck` + `npm run lint`
- **Phase gate:** full suite green + `07-HUMAN-UAT.md` preenchido por Lenny + code review do diff

---

## Per-Task Verification Map

*Preenchida pelo planner. Parte automatável (grep/render/unit) vs HUMAN-UAT (Lighthouse/Rich Results/device matrix).*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| TBD | TBD | TBD | SEO-01..06,08,10,11; A11Y-05,06,07; MOBILE-01; DEPLOY-05 | unit/grep/render | TBD | ⬜ pending |
| TBD | TBD | TBD | SEO-07; PERF-01..09; A11Y-01,02,04; MOBILE-04,07; DEPLOY-01,02 | manual | HUMAN-UAT | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `tests/seo/metadata.test.ts` — title < 60, description < 160, OG/Twitter shape. SEO-01..04.
- [ ] `tests/seo/json-ld.test.ts` — Organization + WebPage schema shape. SEO-05/06.
- [ ] `tests/seo/semantic-html.test.ts` — h1 único, `lang="pt-BR"`, zero `<div onClick>`, mockups `aria-hidden`. SEO-08/10, A11Y-06/07.
- [ ] `tests/seo/robots.test.ts` — `robots()` discrimina `VERCEL_ENV`. SEO-11.
- [ ] `tests/a11y/skip-link.test.tsx` — skip-link render + `href="#main-content"`. A11Y-05.
- [ ] `tests/layout/speed-insights.test.tsx` — `<SpeedInsights />` no layout tree. DEPLOY-05.
- [ ] (opcional) `tests/a11y/sections-axe.test.tsx` — `vitest-axe` nas seções. A11Y-01/03.
- [ ] `tests/seo/metadata-grep` — `useDeviceTier` nas seções com motion. MOBILE-01 (pode ser grep test).

**Framework install:** `vitest-axe` opcional se A11y axe test for incluído; senão nenhum.

---

## Manual-Only Verifications (HUMAN-UAT — `07-HUMAN-UAT.md`)

| Req | Why Manual |
|-----|-----------|
| SEO-07 | Google Rich Results Test (ferramenta web externa) |
| SEO-03 (arte OG) | Preview real WhatsApp + LinkedIn + validador Meta |
| PERF-01..04 | Lighthouse score / LCP / CLS / INP — medição em deploy Vercel |
| PERF-06 | Peso da página — DevTools Network |
| PERF-08 | Validação visual de imagens reais (se existirem) |
| A11Y-01 | Contraste — pares DARK suspeitos, axe DevTools + olho humano |
| A11Y-02 | Navegação por teclado real (Tab pelo site) |
| A11Y-04 | Reduce Motion no OS (macOS + Windows) |
| MOBILE-04 | Lenis em device touch real |
| MOBILE-07 | Device matrix (iPhone Safari, Android Chrome, iPad) |
| DEPLOY-01/02 | Conexão GitHub↔Vercel — BLOQUEADO por acesso de push do Lenny |

---

## External Blockers (não contam como gap da phase)

- **DEPLOY-01/02** — `lennywajcberg` sem push access ao repo `likro/likro-landing-page`. Lenny resolve acesso.
- **DEPLOY-03 parcial** — 3 analytics IDs pendentes (Phase 6 Parte B).
- **PERF-08** — prints reais de produto não existem; código só tem mockups CSS.

---

## Validation Sign-Off

- [ ] Parte automatável: tasks com `<automated>` verify ou Wave 0 deps
- [ ] Wave 0 cobre os 6-8 test files
- [ ] HUMAN-UAT consolidado em `07-HUMAN-UAT.md`
- [ ] `nyquist_compliant: true` após Wave 0 verde

**Approval:** pending
