---
phase: 5
slug: conversion-form-footer-floating-ctas-distribu-dos
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-19
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

*Populated by the planner — references will be filled when PLAN.md files are written. Each task in each plan must point to one of the Wave 0 test files below (or be marked manual-only with justification).*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD     | TBD  | TBD  | CTA-03..CTA-12, MOBILE-02, MOBILE-06 | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

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
- [ ] `tests/landing/cta-distribution.test.tsx` — render `<HomePage>`, assert `[data-location]` covers all 6 expected locations. Covers CTA-05.
- [ ] `tests/content/whatsapp-messages.test.ts` — assert every `WhatsAppLocation` has an entry. Covers CTA-08.

**Framework install:** None — vitest + RTL + jsdom already configured. ✓

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp deeplink abre app (não browser) em iOS Safari + Android Chrome | CTA-07 | Comportamento depende do OS/app installation — não mockável de forma fidedigna | Lenny abre cada um dos 6 CTAs em iPhone real e Android real; verifica que abre WhatsApp app, não navegador. Documentar em `05-HUMAN-UAT.md` no estilo da Phase 4. |
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

**Approval:** pending
