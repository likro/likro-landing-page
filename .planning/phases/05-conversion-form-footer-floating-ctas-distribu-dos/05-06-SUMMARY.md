---
phase: 05-conversion-form-footer-floating-ctas-distribu-dos
plan: 06
subsystem: conversion/ui
tags: [floating-cta, footer, privacy, whatsapp, mobile, a11y]
dependency_graph:
  requires:
    - phase 01 foundations (WhatsAppCta, Container, FOOTER_COPY, WHATSAPP_MESSAGES)
    - phase 04 narrative sections (Pain/Product/Proof)
    - plan 05-04 (useFormInView hook — IntersectionObserver on #lead-form-section)
  provides:
    - "FloatingWhatsApp client component (mobile-only, 3 visibility gates)"
    - "Footer dark editorial component (ready to wire in page.tsx)"
    - "/privacy placeholder route (200 OK, noindex)"
    - "Distributed WhatsApp CTAs in Pain/Product/Proof sections"
  affects:
    - src/sections/Pain/index.tsx (CTA appended)
    - src/sections/Product/index.tsx (CTA appended)
    - src/sections/Proof/index.tsx (CTA appended)
    - tests/sections/proof-invariants.test.ts (D-29 invariant updated)
tech-stack:
  added: []
  patterns:
    - "Visibility-wrapper pattern: FloatingWhatsApp wraps WhatsAppCta variant=floating; wrapper controls opacity/pointer-events, WhatsAppCta provides fixed positioning + safe-area"
    - "focusin/focusout document listener scoped to [data-clarity-mask] form fields (Pitfall 9)"
    - "passive scroll listener single threshold check (no Motion useScroll — no interpolation needed)"
key-files:
  created:
    - src/sections/Floating/FloatingWhatsApp.tsx
    - src/components/layout/Footer.tsx
    - src/app/privacy/page.tsx
  modified:
    - src/sections/Pain/index.tsx
    - src/sections/Product/index.tsx
    - src/sections/Proof/index.tsx
    - tests/sections/proof-invariants.test.ts
decisions:
  - "FloatingWhatsApp uses plain window scroll listener (passive) over Motion useScroll — single threshold check has no interpolation, Motion would be overhead"
  - "Token bg-surface-darker for Footer (plan said bg-bg-dark which does not exist); matches Proof for continuous dark transition"
  - "Token bg-surface-light for /privacy (plan said bg-bg-base which does not exist)"
  - "Phase 4 D-29 invariant (Proof has zero CTA) updated: Phase 5 CONTEXT.md assigns Proof the dominant pre-form CTA; test now permits CTA in Proof/index.tsx only"
metrics:
  duration_minutes: 9
  completed_date: "2026-05-20"
  tasks_completed: 4
  files_created: 3
  files_modified: 4
requirements_addressed: [CTA-05, CTA-06, CTA-08, MOBILE-02]
---

# Phase 5 Plan 06: FloatingWhatsApp + Footer + /privacy + Distributed CTAs Summary

**One-liner:** Mobile-only floating WhatsApp button with three visibility gates (scroll>50vh, form-in-view, input-focus), a dark editorial Footer, a `/privacy` noindex placeholder, and WhatsApp CTAs appended to the end of the Pain, Product, and Proof sections — completing the conversion surface for the Plan 07 wire-up.

## What Was Built

### Task 1 — `src/sections/Floating/FloatingWhatsApp.tsx` (commit d8194d9)

Client component, mobile-only (`md:hidden`). Renders `<WhatsAppCta variant="floating" location="floating">` inside a visibility-controlling wrapper. Three gates compute `visible`:

1. **Scroll gate** — passive `scroll` listener; visible after `window.scrollY > window.innerHeight * 0.5`.
2. **Form-in-view gate** — consumes `useFormInView()` (Plan 04); hidden while the lead form is in viewport.
3. **Input-focus gate (Pitfall 9)** — `focusin`/`focusout` document listeners; hides when an `INPUT`/`TEXTAREA` inside `[data-clarity-mask="true"]` is focused, so the virtual keyboard never overlaps the button.

Discreet: 200ms opacity fade, no pulse/bounce/badge/scale. `aria-hidden` reflects visibility. Positioning + `env(safe-area-inset-bottom)` come from `WhatsAppCta variant="floating"`.

### Task 2 — `src/components/layout/Footer.tsx` (commit 2c5d623)

Server component, dark editorial (`bg-surface-darker`, continuity with Proof). Logo tile + brand + copyright on one side; filtered `FOOTER_COPY.links` (excludes `#`-prefixed marker entries) + `<WhatsAppCta variant="inline" location="footer">` on the other. 1-line desktop / 2-line mobile via flex. All copy from `FOOTER_COPY` — zero hard-code.

### Task 3 — `src/app/privacy/page.tsx` (commit 70e9e6b)

Minimal placeholder page. `export const metadata` with `robots: { index: false, follow: false }`. Heading + "em construção" copy + link back to `/`. Phase 7 writes real content.

### Task 4 — Distributed CTAs in Pain/Product/Proof (commit 4942e9b)

Each section gained one `<WhatsAppCta>` appended at the end of its `Container`, surgical (existing structure untouched):

| Section | Variant     | location  | Copy                              | Wrapper margin   |
| ------- | ----------- | --------- | --------------------------------- | ---------------- |
| Pain    | `secondary` | `pain`    | "Quero entender como organizar"   | `mt-10 md:mt-12` |
| Product | `primary`   | `product` | "Ver tudo isso na minha clínica"  | `mt-12 md:mt-16` |
| Proof   | `primary`   | `proof`   | "Falar com a Likro agora"         | `mt-12 md:mt-16` |

## WhatsApp CTA Coverage (current project state)

All 7 target `location`s now exist in `src/`:

`hero` (HeroCopy), `header` (Header), `pain`, `product`, `proof` (sections), `footer` (Footer), `floating` (FloatingWhatsApp).

Plus form-fallback CTAs in `FormSuccess.tsx`/`FormError.tsx`. After Plan 07 wires `Footer` + `FloatingWhatsApp` into `page.tsx`, the 7 persistent locations will all be rendered.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan token `bg-bg-dark` / `bg-bg-base` do not exist**
- **Found during:** Tasks 2 & 3
- **Issue:** Plan referenced `bg-bg-dark` (Footer) and `bg-bg-base` (/privacy); neither token is declared in `globals.css` `@theme` (Tailwind v4 silently no-ops undeclared tokens).
- **Fix:** Footer uses `bg-surface-darker` (matches Proof for continuous dark transition); `/privacy` uses `bg-surface-light`. Same canonical-token substitution Plan 05-04/05-05 already made.
- **Files modified:** `src/components/layout/Footer.tsx`, `src/app/privacy/page.tsx`

**2. [Rule 3 - Blocking] Phase 4 D-29 invariant contradicts locked Phase 5 instruction**
- **Found during:** Full-suite regression check after Task 4
- **Issue:** `tests/sections/proof-invariants.test.ts` test 6 enforced D-29 ("zero WhatsApp CTA in Proof"). Plan 05-06 Task 4 and CONTEXT.md §"CTAs distribuídos" explicitly assign Proof the dominant pre-form CTA (`location="proof"`).
- **Fix:** D-29 was a Phase 4 boundary (Proof did not convert because conversion was Phase 5's job). Updated test 6 to permit the CTA in `Proof/index.tsx` while still forbidding it in the visual sub-components (`ProofCategories`, `ProofBackground`). CONTEXT.md is the newer authoritative decision.
- **Files modified:** `tests/sections/proof-invariants.test.ts`
- **Commit:** 26d4a28

## Deferred Issues

**hero-invariants HERO-02 fails on `motion.header` in Header.tsx** — pre-existing, introduced by Plan 05-05 (`3eb6470`), not by this plan. Plan 05-06 does not touch Header.tsx. Logged to `deferred-items.md`; belongs to Plan 05-05 or Plan 07 scope.

## Verification Results

```
npm run typecheck                                          → EXIT 0
npm test -- --run tests/sections/floating-whatsapp.test.tsx → 5/5 GREEN (RED → GREEN)
npm test -- --run tests/sections/lead-form.test.tsx
            tests/components/header.test.tsx
            tests/api/lead-route.test.ts                    → 18/18 GREEN (regression)
npm test -- --run tests/sections/proof-invariants.test.ts   → 9/9 GREEN
grep -rn "wa.me/" src/sections/ src/components/             → 0 (only helper comment)
```

Note: the test runner picks up both the main repo tests and the nested
`.claude/worktrees/` copy, so counts appear doubled in full-suite runs.

Known full-suite reds: `cta-distribution.test.tsx` (expected — needs Plan 07
page.tsx wire-up of Footer + FloatingWhatsApp) and `hero-invariants.test.ts`
(deferred, Plan 05-05 scope).

## Threat Model Touched

- **T-05-22** (CTA hard-code regression) → mitigated: `grep "wa.me/"` returns 0 in sections/components; all CTAs route through `WhatsAppCta` → `buildWhatsAppUrl()`.
- **T-05-24** (scroll listener jank) → mitigated: `{ passive: true }` listener, single threshold check, no interpolation.
- **T-05-23** (privacy placeholder) → accept: noindex metadata, no PII in placeholder.
- **T-05-25** (focusin selector bypass) → accept: bypass only causes UX overlap, not security.

## Next

Plan 05-07 wires `<Footer />` + `<FloatingWhatsApp />` into `src/app/page.tsx`, runs HUMAN-UAT, updates VALIDATION, and closes the phase. `cta-distribution.test.tsx` turns GREEN once that wire-up lands.

## Self-Check: PASSED

- File exists: `src/sections/Floating/FloatingWhatsApp.tsx` ✓
- File exists: `src/components/layout/Footer.tsx` ✓
- File exists: `src/app/privacy/page.tsx` ✓
- Commit d8194d9 exists ✓
- Commit 2c5d623 exists ✓
- Commit 70e9e6b exists ✓
- Commit 4942e9b exists ✓
- Commit 26d4a28 exists ✓
