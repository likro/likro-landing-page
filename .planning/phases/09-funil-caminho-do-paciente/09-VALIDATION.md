---
phase: 9
slug: funil-caminho-do-paciente
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-15
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing — see `tests/` dir, e.g. `tests/landing/coherence.test.ts`) |
| **Config file** | existing vitest config (project already runs `tests/content/*` and `tests/sections/*`) |
| **Quick run command** | `npx vitest run tests/sections tests/content` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command scoped to touched test files
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green + manual Playwright pass
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> Populated by the planner from RESEARCH.md "Validation Architecture". Each FUNIL-* requirement maps to at least one automated check (no-metric grep audit, content-module test, page-composition order test, primitive-import invariant) plus a manual Playwright/reduced-motion verification where scroll-driven behavior cannot be asserted headlessly.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | — | — | FUNIL-02 | — | N/A | unit | `npx vitest run tests/sections/funnel-no-metric.test.ts` | ❌ W0 | ⬜ pending |
| TBD | — | — | FUNIL-06 | — | N/A | unit | `npx vitest run tests/landing/coherence.test.ts` | ✅ | ⬜ pending |
| TBD | — | — | FUNIL-COPY | — | N/A | unit | `npx vitest run tests/content/funnel.test.ts` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `tests/sections/funnel-no-metric.test.ts` — grep audit asserting zero metric/KPI/%/dashboard terms in `src/sections/Funnel/**` (FUNIL-02)
- [ ] `tests/sections/funnel-invariants.test.ts` — assert zero direct `motion/react` import outside ScrollScene render-prop exception (FUNIL-01)
- [ ] `tests/content/funnel.test.ts` — assert `funnel.ts` shape (headline/eyebrow/closing + 4 beats), no Messenger/Facebook string (FUNIL-COPY)
- [ ] Update `tests/landing/coherence.test.ts` — order `Product → Funnel → Proof`, fail (not skip) if HowItWorks dir is gone but still referenced (FUNIL-06)

*Existing vitest infrastructure covers the rest.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Marina traverses 4 columns on scroll, active column lights, ghosts dim | FUNIL-01 | Scroll-driven MotionValue behavior not assertable headlessly | Playwright @1536×730: scroll through section, screenshot at 0/25/50/75/100% |
| Purple ignites only at climax (column 4) | FUNIL-03 | Visual/timing | Playwright: screenshot climax frame, confirm purple absent in columns 1–3 |
| Reduced-motion delivers pre-assembled final state (no scrub) | FUNIL-04 | OS toggle interaction | Toggle prefers-reduced-motion, confirm Marina in column 4 + purple lit, no travel |
| Mobile "1 coluna + trilho" at ≤639px | FUNIL-05 | Responsive layout | Playwright mobile viewport: confirm rail + single focused card, ~420svh |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
