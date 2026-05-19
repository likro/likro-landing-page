---
phase: 05
plan: 02
subsystem: testing
tags: [tdd, wave-0, vitest, nyquist, conversion]
requires:
  - 05-01-PLAN.md (lead-schema, lead-dedup, server-env, form copy — running in parallel)
provides:
  - tests/lib/lead-schema.test.ts (RED until Plan 01 merges)
  - tests/lib/lead-dedup.test.ts (RED until Plan 01 merges)
  - tests/api/lead-route.test.ts (RED until Plan 03 ships route handler)
  - tests/sections/lead-form.test.tsx (RED until Plan 04 ships LeadForm)
  - tests/sections/floating-whatsapp.test.tsx (RED until Plan 06 ships FloatingWhatsApp)
  - tests/components/header.test.tsx (RED until Plan 05 refactors Header with data-hidden)
  - tests/landing/cta-distribution.test.tsx (RED until Plan 07 wires CTAs to HomePage)
  - tests/content/whatsapp-messages.test.ts (GREEN — content already compliant)
affects:
  - implicit contracts that feature plans MUST honor:
    - honeypot field name="website" (Pitfall 8 — avoids 1Password autofill on name="company")
    - honeypot wrapper inline styles position:absolute + left:-9999px (Pattern 6)
    - LeadForm root has data-clarity-mask="true"
    - Header exposes data-hidden="true|false" attribute
    - FloatingWhatsApp container has md:hidden class
    - WhatsAppCta variants pass through data-testid="whatsapp-cta" + data-location
    - <section id="lead-form-section"> stub required for useFormInView observer
tech-stack:
  added: []
  patterns:
    - vi.mock("motion/react") with full surface (useScroll + useMotionValueEvent + useReducedMotion)
    - vi.useFakeTimers / vi.advanceTimersByTime for TTL determinism
    - dynamic import inside callPost() for route handler tests (mock hoisting order)
    - controllable IntersectionObserver mock via captured callback handle
key-files:
  created:
    - tests/lib/lead-schema.test.ts
    - tests/lib/lead-dedup.test.ts
    - tests/api/lead-route.test.ts
    - tests/sections/lead-form.test.tsx
    - tests/sections/floating-whatsapp.test.tsx
    - tests/components/header.test.tsx
    - tests/landing/cta-distribution.test.tsx
    - tests/content/whatsapp-messages.test.ts
  modified: []
decisions:
  - "AnalyticsEvent type already complete at plan start — Task 9 verified, no edit needed"
  - "Honeypot name='website' standardized (rejects 'company' to dodge password-manager autofill on B2B forms)"
  - "Header contract: data-hidden attribute (more robust than reading style.transform that Motion writes async)"
  - "FloatingWhatsApp test creates <section id='lead-form-section'> stub in body so useFormInView observer registers"
  - "cta-distribution mocks ALL motion/react surface used by Header (useScroll, useMotionValueEvent, useReducedMotion)"
metrics:
  duration: ~10min
  completed_date: 2026-05-19
  tasks_completed: 9
  files_created: 8
  files_modified: 0
  commits: 8
---

# Phase 5 Plan 02: Wave 0 — Executable Specs Across All Conversion Surfaces

One-liner: Created 8 vitest test files (one per Phase 5 feature surface) as executable specs in RED before any feature plan begins — Nyquist-compliant sampling so every later task can point `<automated>` at an existing file.

## Status Overview

| # | Test File | Requirements | Status |
|---|-----------|--------------|--------|
| 1 | tests/lib/lead-schema.test.ts | CTA-09, CTA-10 | RED (Plan 01 provides module) |
| 2 | tests/lib/lead-dedup.test.ts | CTA-12 | RED (Plan 01 provides module) |
| 3 | tests/api/lead-route.test.ts | CTA-10, CTA-11, CTA-12, T-05-06 | RED (Plan 03 provides route) |
| 4 | tests/sections/lead-form.test.tsx | CTA-09, CTA-11 | RED (Plan 04 provides component) |
| 5 | tests/sections/floating-whatsapp.test.tsx | CTA-06, MOBILE-02 | RED (Plan 06 provides component) |
| 6 | tests/components/header.test.tsx | MOBILE-06 | RED (Plan 05 provides refactor) |
| 7 | tests/landing/cta-distribution.test.tsx | CTA-05 | RED (Plan 07 wires CTAs) |
| 8 | tests/content/whatsapp-messages.test.ts | CTA-08 | **GREEN** (content already compliant) |

Total: 8 files committed, 5 RED (expected by design), 1 GREEN, 2 RED-via-Plan-01-dependency (resolve when Plan 01 merges to main).

## Task Commits

| Task | Commit  | Description |
|------|---------|-------------|
| 1    | 0434009 | lead-schema tests (CTA-09, CTA-10) |
| 2    | e278719 | lead-dedup tests (CTA-12) |
| 3    | 9d7682a | /api/lead route tests (CTA-10/11/12 + T-05-06 honeypot) |
| 4    | 6956fd1 | LeadForm tests (CTA-09, CTA-11, data-clarity-mask) |
| 5    | c64b03b | FloatingWhatsApp tests (CTA-06, MOBILE-02) |
| 6    | ca2acb8 | Header hide-on-scroll tests (MOBILE-06) |
| 7    | 9d2ba08 | CTA distribution tests (CTA-05) |
| 8    | 97f810c | WHATSAPP_MESSAGES guard (CTA-08, GREEN) |
| 9    | (none — defensive verification, no diff) | AnalyticsEvent type already covers Phase 5 events |

## Implicit Contracts Established

This Wave 0 plan does not implement features, but it **freezes contracts** that downstream feature plans (03/04/05/06/07) must honor — the tests are the spec.

### Honeypot (Plan 04 + Plan 03)
- Field `name="website"` (not `company` — Pitfall 8: 1Password/LastPass auto-fill).
- Wrapper element has `aria-hidden="true"`.
- Wrapper inline style: `position: absolute; left: -9999px`.
- Input has `tabindex="-1"` and `autocomplete="off"`.
- Server route returns `200 { ok: true }` when honeypot is filled (fake-success, no fetch).

### Header (Plan 05)
- `<header>` element exposes `data-hidden="true|false"` attribute.
- `data-hidden="true"` when `scrollY > window.innerHeight` AND delta > 80.
- `data-hidden="false"` when delta < -8 (scroll up).
- Reduced-motion keeps `data-hidden="false"` regardless of scroll input.

### FloatingWhatsApp (Plan 06)
- Container has `md:hidden` class (mobile-only).
- Renders `WhatsAppCta` with `data-location="floating"` (already provided by Phase 1 component contract).
- Hidden state expressed via `style.opacity === "0"` OR `style.pointerEvents === "none"` OR `aria-hidden="true"`.
- `useFormInView` looks up `document.getElementById("lead-form-section")` — the form section (Plan 04) must render with this id.

### LeadForm (Plan 04)
- Root wrapper has `data-clarity-mask="true"` (Phase 6 Clarity PII masking).
- Labels match `FORM_COPY.fields.{name,whatsapp,message}.label`.
- Submit button label matches `FORM_COPY.submit.idle`.
- Success block shows `FORM_COPY.success.heading`.
- Error block shows `FORM_COPY.error.heading` + retry button with `FORM_COPY.error.retryLabel`.
- Submit fires `fetch("/api/lead", { method: "POST", ... })`.
- Button disabled while in-flight.

### /api/lead route (Plan 03)
- `POST` accepts JSON body.
- 400 on `JSON.parse` failure → `{ ok: false, error: "invalid_json" }`.
- 200 `{ ok: true }` (no fetch) when `body.website` is truthy (honeypot triggered).
- 422 `{ ok: false, error: "validation_failed" }` on Zod fail.
- 200 `{ ok: true }` when at least one of `sendLeadEmail` / `appendLeadRow` resolves.
- 502 `{ ok: false, error: "delivery_failed" }` when both reject.
- 200 `{ ok: true, deduped: true }` on 2nd submit of same WhatsApp within 60s window.

### HomePage (Plan 07)
- Must render `data-testid="whatsapp-cta"` elements covering all 7 locations: `hero`, `header`, `pain`, `product`, `proof`, `footer`, `floating`.

## Analytics Type Verification (Task 9)

`src/lib/analytics.ts` already includes all Phase 5 events in the `AnalyticsEvent` union (verified at lines 14-17):
- `form_focus`
- `form_submit_attempt`
- `form_submit_success`
- `form_submit_error`

No edit was needed — Task 9 was defensive. Confirmed via grep on `src/lib/analytics.ts`.

## Deviations from Plan

None. Plan executed exactly as written. The expected RED state for 7 of 8 test files is by design — Wave 0 is the spec layer.

Note on typecheck: `npm run typecheck` reports `Cannot find module '@/lib/lead-schema'` etc. for the 7 RED tests. This is the **expected** state — those modules belong to parallel/downstream plans (01, 03, 04, 05, 06) and will resolve when those worktrees merge back. The test files themselves parse and compile correctly; only the import resolution fails, which is the contract.

## Verification Run

- `npm test -- --run tests/content/whatsapp-messages.test.ts` → **GREEN** (10/10 passing).
- `npm test -- --run tests/lib/lead-schema.test.ts tests/lib/lead-dedup.test.ts` → RED with `Cannot find module '@/lib/lead-schema'` / `'@/lib/lead-dedup'` (expected — Plan 01 not merged).
- `npm run typecheck` → 7 TS2307 errors, all matching expected missing modules from Plans 01/03/04/05/06. No syntax errors in any committed test file.

## Threat Mitigation

| Threat ID | Disposition | Mitigation Verified By |
|-----------|-------------|------------------------|
| T-05-06 (Honeypot bypass) | mitigate | tests/api/lead-route.test.ts: "honeypot triggered → no fetch" asserts `sendLeadEmail` and `appendLeadRow` not called when `website` field present. |
| T-05-07 (PII in fixtures) | accept | All test fixtures use synthetic data ("Lenny" + 11999999999); fetch is mocked. |
| T-05-08 (Test bypass via removal) | accept | Plan 07 UAT re-runs full suite; CI gate deferred to Phase 7. |

## Self-Check: PASSED

- 8 test files created under `tests/`.
- 8 task commits in git log (0434009..97f810c).
- All test files reference at least one requirement ID via comment.
- Honeypot field name `website` confirmed in lead-schema, lead-route, lead-form tests (no `company` queries).
- Floating test creates and cleans up `<section id="lead-form-section">` in beforeEach/afterEach.
- CTA-distribution test mocks `useScroll`, `useMotionValueEvent`, AND `useReducedMotion`.
- `src/lib/analytics.ts` untouched (already compliant — Task 9 defensive).
