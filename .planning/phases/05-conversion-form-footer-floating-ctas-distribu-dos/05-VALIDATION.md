---
phase: 5
slug: conversion-form-footer-floating-ctas-distribu-dos
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
updated: 2026-05-20
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `05-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@^3.2.4` + `@testing-library/react@^16` + `jsdom@^25` |
| **Config file** | `vitest.config.ts` (already exists — alias `@` → `./src`, setup `./tests/setup.ts`) |
| **Quick run command** | `npm test -- --run <pattern>` |
| **Full suite command** | `npm test` (alias for `vitest run`) |
| **Typecheck command** | `npm run typecheck` |
| **Estimated runtime** | ~30 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck && npm test -- --run <changed-file-pattern>` (quick — < 10s)
- **After every plan wave:** Run `npm test` (full vitest suite — < 30s) + `npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green + manual UAT matrix complete + Vercel preview validated on real iOS and Android devices
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

*Preenchida após execução completa das Waves 1-5. Todas as feature tasks com `<automated>` apontam para test files reais — 8 test files Wave 0 + suite existente.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01.T2 (server-env) | 01 | 1 | CTA-10 | T-05-01 | server-only guard + Zod lazy | unit | `npm run typecheck` | ✅ | ✅ green |
| 01.T3 (lead-schema) | 01 | 1 | CTA-09, CTA-10 | T-05-04 | Zod shared client/server | unit | `npm test -- --run tests/lib/lead-schema.test.ts` | ✅ | ✅ green |
| 01.T4 (lead-dedup) | 01 | 1 | CTA-12 | T-05-03 | TTL window 60s | unit | `npm test -- --run tests/lib/lead-dedup.test.ts` | ✅ | ✅ green |
| 03.T3 (lead-route) | 03 | 2 | CTA-10, CTA-11, CTA-12 | T-05-06, T-05-09, T-05-12 | dual-write allSettled + honeypot + dedup | integration | `npm test -- --run tests/api/lead-route.test.ts` | ✅ | ✅ green |
| 04.T3 (lead-form) | 04 | 3 | CTA-09, CTA-11 | T-05-16, T-05-19 | data-clarity-mask + state machine | unit | `npm test -- --run tests/sections/lead-form.test.tsx` | ✅ | ✅ green |
| 05.T1 (header) | 05 | 3 | MOBILE-06 | T-05-20 | hide-on-scroll + reduced-motion + HERO-02 | unit | `npm test -- --run tests/components/header.test.tsx` | ✅ | ✅ green |
| 06.T1 (floating) | 06 | 4 | CTA-06, MOBILE-02 | T-05-24 | scroll threshold + form-in-view gate | unit | `npm test -- --run tests/sections/floating-whatsapp.test.tsx` | ✅ | ✅ green |
| 07.T1 (page wire) | 07 | 5 | CTA-03, CTA-05 | T-05-22 | 7 distinct data-location | integration | `npm test -- --run tests/landing/cta-distribution.test.tsx` | ✅ | ✅ green |
| content guard | 02 | 1 | CTA-08 | — | WHATSAPP_MESSAGES key coverage | unit | `npm test -- --run tests/content/whatsapp-messages.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky — full suite: 208/208 green (2026-05-20)*

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 must create these test files (failing) before any feature task runs:

- [ ] `tests/lib/lead-schema.test.ts` — Zod schema (nome ≥ 2, WhatsApp normalize, mensagem ≤ 1000). Covers CTA-09 + CTA-10.
- [ ] `tests/lib/lead-dedup.test.ts` — in-memory `Map` + TTL + cleanup. Covers CTA-12.
- [ ] `tests/api/lead-route.test.ts` — mocked `fetch` global (Resend + Sheets endpoints); asserts `Promise.allSettled` semantics + honeypot fake-success. Covers CTA-10 + CTA-11 + CTA-12.
- [ ] `tests/sections/lead-form.test.tsx` — RTL render, focus, submit, disabled state, error state, success state. Covers CTA-09 + CTA-11.
- [ ] `tests/sections/floating-whatsapp.test.tsx` — mock `useScroll` + `IntersectionObserver`. Covers CTA-06 + MOBILE-02.
- [ ] `tests/components/header.test.tsx` — RTL + mock `useScroll`; reduced-motion path. Covers MOBILE-06.
- [ ] `tests/landing/cta-distribution.test.tsx` — render `<HomePage>`, assert `[data-location]` covers all 7 expected locations (hero, header, pain, product, proof, footer, floating). Covers CTA-05.
- [ ] `tests/content/whatsapp-messages.test.ts` — assert every `WhatsAppLocation` has an entry. Covers CTA-08.

**Framework install:** None — vitest + RTL + jsdom already configured. ✓

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp deeplink abre app (não browser) em iOS Safari + Android Chrome | CTA-07 | Comportamento depende do OS/app installation — não mockável de forma fidedigna | Lenny abre cada um dos 7 CTAs em iPhone real e Android real; verifica que abre WhatsApp app, não navegador. Documentar em `05-HUMAN-UAT.md` no estilo da Phase 4. |
| Floating respeita `safe-area-inset-bottom` em iPhone com home indicator | MOBILE-02 | Visual — depende do dispositivo físico (notch, home indicator dynamic) | Abrir Vercel preview em iPhone real, scrollar > 50vh, verificar que floating não fica colado no home indicator nem cortado |
| Header hide-on-scroll suave (sem jitter) em scroll real | MOBILE-06 | Smoothness percibida — não cobrível por unit test | Scroll vertical lento + rápido em iPhone e Android; verificar transição translateY suave |
| Lead chega no Lenny (email Resend + linha em planilha) | CTA-10 | Integração externa real | Submeter form na Vercel preview; checar inbox + Google Sheet 60s depois |
| Reduced-motion desliga header hide | MOBILE-06 / A11y | Depende de System Setting do OS | Ativar Reduce Motion em macOS Settings + Windows Animations off; recarregar page; header deve ficar fixo |

---

## E2E Happy Path

**Cenário:** "Visitor preenche form, recebe confirmação inline, lead chega no Lenny."

| Step | Expectativa | Verificação |
|------|-------------|-------------|
| 1. Abre `/` | Page carrega, hero visible | Lighthouse mobile (Phase 3 legacy) |
| 2. Scrolla até fim | Floating aparece após 50vh; CTAs visíveis em Pain, Product, Proof | DOM inspection |
| 3. Form entra em viewport | Floating esconde (IntersectionObserver) | Visual check |
| 4. Preenche nome + WhatsApp | Botão "Quero conversar" enabled | RTL fireEvent |
| 5. Submete | Botão `disabled`; spinner aparece | RTL assertion |
| 6. Resend + Sheets retornam OK em paralelo | `200 ok:true`; form substituído por `<FormSuccess>` | Network mock + RTL |
| 7. Lenny recebe email + linha aparece na planilha | Smoke test pós-deploy | UAT |

**Implementação:** Sem Playwright na v1 (deferido). E2E coverage via integration test (`tests/api/lead-route.test.ts` com mocks Resend + Sheets) + manual UAT documentado em `05-HUMAN-UAT.md`.

---

## Real-Device QA Matrix

| Device | OS | Browser | Tests |
|--------|-----|---------|------|
| iPhone (Lenny) | iOS 17+ | Safari | Form submete · floating thumb-zone · safe-area respeitada · header hide suave · WhatsApp abre app |
| iPad | iPadOS | Safari | Layout desktop-ish · floating NÃO aparece (≤ md cutoff) · header hide |
| Android mid-tier | Android 13+ | Chrome | Form submete · honeypot OK c/ Chrome autofill · deeplink abre WhatsApp |
| Desktop | macOS | Chrome/Safari/Firefox | Header hide cross-browser · reduced-motion desliga hide |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (8 test files)
- [ ] No watch-mode flags (`vitest run` only, never `vitest watch` in CI)
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter (after planner fills the verification map and Wave 0 lands green)

**Approval:** awaiting manual UAT + Lenny copy review
