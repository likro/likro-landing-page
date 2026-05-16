---
phase: 3
slug: hero-benchmarked-isolado
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Seeded from `03-RESEARCH.md` § Validation Architecture; planner must reconcile against final PLAN.md task IDs and fill the Per-Task Verification Map.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (TBD by planner — confirm vs existing Phase 1/2 setup) |
| **Config file** | TBD — `vitest.config.ts` if not already present from Phase 1 |
| **Quick run command** | `npm run test -- --run` (or `npx vitest run`) |
| **Full suite command** | `npm run test -- --run && npm run typecheck && npm run lint` |
| **Estimated runtime** | ~30 seconds (unit + grep tests only; LCP benchmark is manual) |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run` (unit + grep tests on the changed file)
- **After every plan wave:** Run full suite + `npm run build` to catch RSC/client boundary errors
- **Before `/gsd-verify-work`:** Full suite green + Lighthouse mobile run on Vercel preview + real-device deep link check (D-19)
- **Max feedback latency:** 60 seconds (automated) / manual benchmark out-of-band

---

## Per-Task Verification Map

> Planner MUST populate this with final task IDs (`3-01-01`, `3-01-02`, …) after PLAN.md files are written. Validation dimensions below are the minimum the planner must cover; rows are placeholders for the planner to expand.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-XX-XX | XX | 1 | HERO-01 | — | LCP elements render final state immediately (no entry animation on H1 + mockup) | grep + manual Lighthouse | `npm run test -- hero.lcp-invariant` + Lighthouse Vercel preview | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-02 | — | Single `<Image priority>` for mockup, `fetchPriority="high"`, correct `sizes` | grep | `grep -E "priority\|fetchPriority=\"high\"" components/sections/hero/Hero.tsx` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-03 | — | Hero uses `dvh`/`svh`, not `vh` | grep | `! grep -E "h-screen\|min-h-screen\|\\bvh\\b" components/sections/hero/**/*.tsx` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-04 / CTA-04 | — | WhatsApp deep link uses `buildWhatsAppUrl` with `location='hero'` and `location='header'` | unit + manual real-device | `npm run test -- whatsapp.location` | ✅ / ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-05 | — | Hero copy lives in `content/hero.ts`, zero hard-coded strings in JSX | grep | `! grep -E "(>[A-Z][a-zà-ú].{15,})" components/sections/hero/Hero.tsx` (planner refines regex) | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-06 | — | Hero passes accessibility checks (semantic landmarks, alt text, focus order) | axe / Playwright | `npx playwright test hero.a11y.spec.ts` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | HERO-07 | — | Reduced-motion respected (no glow pulse, no transitions) | unit / visual | `npm run test -- hero.reduced-motion` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 1 | COPY-01 | — | `content/hero.ts` exports typed schema with `satisfies` | typecheck | `npm run typecheck` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 2 | COPY-04 | — | Copy review cadence documented (process file + PR template) | file presence | `test -f docs/copy-review.md && grep -q "approver" docs/copy-review.md` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 2 | LCP benchmark | — | Vercel preview Lighthouse mobile LCP < 2.5s | manual / Lighthouse CI | `npx @lhci/cli autorun --collect.url=$PREVIEW_URL` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 2 | Real-device deep link (D-19) | — | CTA opens WhatsApp app on iPhone + Android real | manual | Checklist `docs/device-test-checklist.md` | ❌ W0 | ⬜ pending |
| 3-XX-XX | XX | 2 | 5-second test | — | 3 strangers describe hero in 5s | manual | `docs/five-second-test-results.md` populated | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/lib/whatsapp.test.ts` — extend (or create) with `location='header'` case for `WhatsAppLocation` union
- [ ] `tests/sections/hero.lcp-invariant.test.ts` — grep-based test that fails if `motion.h1`, `motion.img`, or any `initial`/`animate`/`whileInView` appears on H1/mockup JSX
- [ ] `tests/sections/hero.reduced-motion.test.ts` — assert glow `@keyframes` is gated behind `globals.css` `@media (prefers-reduced-motion)` rule
- [ ] `tests/content/hero.schema.test.ts` — typecheck-only test that `HERO_COPY` satisfies declared schema
- [ ] `playwright.config.ts` — confirm exists from earlier phase; if not, install + configure for hero.a11y spec
- [ ] `lighthouserc.json` — config for `@lhci/cli` targeting Vercel preview URL with mobile preset (LCP budget 2500ms)

*Planner: if any of these already exist in repo from Phase 1/2, mark as ✅ and skip Wave 0 task. Otherwise add to Wave 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp app actually opens (not browser) on iPhone real | HERO-04 / CTA-04 | iOS deep-link behavior cannot be simulated in JSDOM/Playwright | 1. Open Vercel preview URL on real iPhone (Safari + Instagram in-app). 2. Tap CTA. 3. Confirm WhatsApp app foregrounds with pre-filled message containing `location=hero`. |
| WhatsApp app actually opens on Android real | HERO-04 / CTA-04 | Android intent resolution + IAB fallback behavior | Same as above on Android Chrome + Instagram IAB. |
| Lighthouse mobile LCP < 2.5s on Vercel preview | HERO-01 | LCP benchmark requires production-equivalent network + Vercel edge | Run `npx @lhci/cli autorun` against preview URL; mobile preset; assert `largest-contentful-paint` ≤ 2500ms. Repeat 3 runs, take median. |
| 5-second test passes | HERO-03 | Requires 3 real humans without project context | Per `docs/five-second-test-plan.md` (created in Phase 3): show first viewport for 5s to 3 strangers; record answers; success = all 3 mention "clínica/estética" + "WhatsApp" + Likro identity. |
| Copy approved by Lenny via PR | HERO-05 / COPY-01 | Subjective brand judgment | PR description must link to `content/hero.ts` diff; reviewer = Lenny; approval comment required before merge. |

---

## Validation Sign-Off

- [ ] All plan tasks have automated verify OR Wave 0 dependencies OR Manual-Only justification
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (whatsapp/header union test, lcp-invariant grep, reduced-motion guard, schema typecheck, lhci config)
- [ ] No watch-mode flags in any task command
- [ ] Feedback latency < 60s for automated suite
- [ ] `nyquist_compliant: true` set in frontmatter (after planner reconciles)

**Approval:** pending (planner to reconcile task IDs, then mark approved)
