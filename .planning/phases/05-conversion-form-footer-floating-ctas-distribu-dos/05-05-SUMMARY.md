---
phase: 05-conversion-form-footer-floating-ctas-distribu-dos
plan: 05
subsystem: layout/header
tags: [motion, scroll, header, mobile, a11y, reduced-motion]
dependency_graph:
  requires:
    - phase 01 foundations (tokens text-text-primary, surface-light)
    - phase 02 motion primitives (motion/react available)
  provides:
    - "Header client component with hide-on-scroll-down + show-on-scroll-up"
    - "data-hidden='true|false' contract on <header> element"
  affects:
    - src/components/layout/Header.tsx (server → client component)
tech-stack:
  added:
    - "react-dom flushSync (sync DOM update inside Motion scroll callback)"
  patterns:
    - "useScroll + useMotionValueEvent (Motion v12 Pattern 4 from 05-RESEARCH.md)"
    - "sticky top-0 over fixed (Pitfall 5 avoided — no spacer needed)"
    - "useReducedMotion gate on scroll-driven UI behavior"
key-files:
  created:
    - .planning/phases/05-conversion-form-footer-floating-ctas-distribu-dos/05-05-SUMMARY.md
  modified:
    - src/components/layout/Header.tsx
decisions:
  - "Sticky over fixed positioning to avoid spacer + layout shift (Pitfall 5)"
  - "flushSync wraps setHidden to keep data-hidden DOM attribute in sync with scroll event without forcing test consumers to wrap in act()"
  - "Token bg-surface-light/85 replaces planned bg-bg-base/85 (the bg-base token does not exist in the Phase 1 design system; surface-light is the canonical light surface token)"
metrics:
  duration_minutes: 4
  completed_date: "2026-05-19"
  tasks_completed: 1
  files_modified: 1
  files_created: 1
requirements_addressed: [MOBILE-06]
---

# Phase 5 Plan 05: Hide-on-Scroll Header Summary

**One-liner:** Header refactored from server to client component with Motion v12 `useScroll` + `useMotionValueEvent` driving a `data-hidden` attribute that toggles on scroll-down past the first viewport and back on small scroll-up, honoring `prefers-reduced-motion`.

## What Was Built

`src/components/layout/Header.tsx` became a client component:

- `"use client"` directive added at top.
- Imports `motion`, `useScroll`, `useMotionValueEvent`, `useReducedMotion` from `motion/react`.
- Internal `hidden` state, initially `false`.
- Single Motion scroll subscription via `useMotionValueEvent(scrollY, "change", cb)`:
  - Reduced-motion path: forces `hidden = false`, returns early. Header never hides.
  - Otherwise computes `delta = current - previous`.
  - Hides when `current > window.innerHeight && delta > 80` (scroll-down threshold).
  - Shows when `delta < -8` (gentle scroll-up threshold).
- `effectiveHidden = !reduced && hidden` derives both the `data-hidden` string and the `translateY` target.
- Wrapping element is `motion.header` with:
  - `className="sticky top-0 z-30 w-full bg-surface-light/85 backdrop-blur-md"`
  - `animate={{ y: effectiveHidden ? "-100%" : "0%" }}`
  - `transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}`
  - `initial={false}` to suppress mount-flash.
- Preserved markup: logo (Link + violet gradient L tile + "Likro" wordmark) and `<WhatsAppCta variant="secondary" location="header">` with `HERO_COPY.ctaPrimary.label`.
- Token correction: `text-text-on-dark-primary` (designed for dark surfaces) swapped for `text-text-primary` to match the new light translucent header surface.

## Visual / Behavioral Diff (Before → After)

| Aspect            | Before                                  | After                                                                                            |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Component type    | Server component                        | Client component (`"use client"`)                                                                |
| Positioning       | `relative z-20`                         | `sticky top-0 z-30` (sticky, **not** fixed → Pitfall 5)                                          |
| Background        | Transparent / inherits hero             | `bg-surface-light/85 backdrop-blur-md` (translucent slim bar)                                    |
| Text color        | `text-text-on-dark-primary`             | `text-text-primary` (light surface context)                                                      |
| Scroll behavior   | None — header always visible            | Hides at `current > 100vh && delta > 80px`; reappears at `delta < -8px`                          |
| Reduced motion    | N/A                                     | `useReducedMotion()` truthy → header pinned visible, `hidden` forced false                       |
| DOM contract      | No state attribute                      | `data-hidden="true|false"` on `<header>` for tests + debugging                                   |
| Animation         | None                                    | `motion.header` translates Y between `0%` and `-100%` over 220 ms (cubic-bezier)                 |

## Thresholds (constants exported by intent, not by name)

- `HIDE_THRESHOLD_DOWN = 80` — minimum px of single-callback scroll delta to trigger hide.
- `SHOW_THRESHOLD_UP = 8` — magnitude of upward delta to bring the header back. Intentionally low so the user gets immediate access to navigation on any reverse intent.
- First-viewport guard: hide only triggers once `scrollY > window.innerHeight`. The hero zone always keeps the header visible — no competition with the hero CTA.

## Sticky-not-Fixed Decision (Pitfall 5)

`sticky top-0` keeps the header inside the document flow during the first viewport. Once the user passes the top of the page, the browser pins it. This means:

- No spacer `<div>` needed under the header.
- No layout-shift the moment scroll begins (which `position: fixed` would cause).
- The hide animation is purely cosmetic (translateY of the same sticky element) — the layout below the header never moves.
- Compatible with Phase 6 floating CTA at `z-40` (header sits at `z-30`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DOM not in sync with scroll callback under jsdom**
- **Found during:** Task 1 verification (`scroll down > 800px + delta > 80px esconde` failed initially)
- **Issue:** The contract test (`tests/components/header.test.tsx`) invokes the captured `useMotionValueEvent` callback synchronously and reads `header.getAttribute("data-hidden")` on the next line — without wrapping in `act()`. React 19 batches `setHidden` so the DOM attribute was still `"false"` when the assertion ran.
- **Fix:** Wrapped the three `setHidden(...)` calls inside `flushSync(() => ...)` (imported from `react-dom`). This forces React to apply the state change synchronously so the DOM reflects `data-hidden` by the time the Motion callback returns. In production, Motion's `change` callback fires inside RAF — `flushSync` there is cheap (one render per scroll-direction inversion, not per scroll tick) because the early-return guards (`if (!hidden)` / `if (hidden)`) keep the work zero-cost in the steady state.
- **Files modified:** `src/components/layout/Header.tsx`

**2. [Rule 1 - Bug] Planned token `bg-bg-base/85` does not exist**
- **Found during:** Task 1 implementation
- **Issue:** The plan specified `bg-bg-base/85`, but `--color-bg-base` is not declared in `src/app/globals.css` `@theme` block (Tailwind v4 silently no-ops on undeclared tokens — Phase 1 brand-lock).
- **Fix:** Used `bg-surface-light/85`, which IS declared (`--color-surface-light: #fafaf9`) and is the canonical light surface token in the Likro design system.
- **Files modified:** `src/components/layout/Header.tsx`

## Verification Results

```
npx vitest run tests/components/header.test.tsx
  ✓ <Header> hide-on-scroll > estado inicial: visível
  ✓ <Header> hide-on-scroll > scroll down > 800px + delta > 80px esconde
  ✓ <Header> hide-on-scroll > scroll up < -8px reaparece
  ✓ <Header> hide-on-scroll > reduced-motion: NUNCA esconde mesmo com scroll down forte
  Test Files  1 passed (1)
  Tests       4 passed (4)

npx tsc --noEmit
  EXIT=0
```

Grep-level acceptance:
- `"use client"` directive present: 1 occurrence ✓
- `data-hidden` token present: 3 occurrences ✓ (1 JSX attribute + 2 in code comments)
- `position: fixed` not present: 0 matches ✓ (Pitfall 5 avoided)
- `sticky top-0` present: 2 matches ✓ (one in code, one in doc comment)
- `HIDE_THRESHOLD_DOWN = 80`: 1 ✓
- `SHOW_THRESHOLD_UP = 8`: 1 ✓
- `useReducedMotion`: 2 (import + invocation) ✓

## Success Criteria Met

- [x] Header hides on scroll-down after first viewport.
- [x] Header reappears on small upward scroll.
- [x] Reduced-motion pins header always-visible.
- [x] `data-hidden` attribute exposes state for programmatic checks.
- [x] All 4 contract tests in `tests/components/header.test.tsx` green.
- [x] Hero (Phase 3) does not regress — header markup (logo + CTA) preserved.

## Self-Check: PASSED

- File exists: `src/components/layout/Header.tsx` ✓
- File exists: `.planning/phases/05-conversion-form-footer-floating-ctas-distribu-dos/05-05-SUMMARY.md` ✓
- All 4 contract tests passing ✓
- `tsc --noEmit` exit 0 ✓
