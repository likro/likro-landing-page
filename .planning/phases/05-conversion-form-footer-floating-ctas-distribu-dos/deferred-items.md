# Deferred Items — Phase 5

Issues discovered during execution that are OUT OF SCOPE for the current plan.

## Discovered during Plan 05-06

### hero-invariants.test.ts HERO-02 fails on `motion.header` in Header.tsx

- **Found during:** Plan 05-06 full-suite regression check
- **Root cause:** Plan 05-05 (`3eb6470 feat(05-05): hide-on-scroll header with Motion`)
  converted `Header.tsx` to use `motion.header`. The Phase 4 invariant test
  `tests/sections/hero-invariants.test.ts` test "zero `motion.*` JSX elements
  in src/sections/Hero/ or src/components/layout/Header.tsx (HERO-02)" still
  forbids any `motion.*` in Header.tsx.
- **Why deferred:** Plan 05-06 does not touch Header.tsx. The stale invariant
  belongs to Plan 05-05's scope (it should have updated HERO-02 when it
  refactored the Header) or Plan 07 hardening. Fixing it here would be an
  out-of-scope edit.
- **Suggested fix:** Update HERO-02 in `hero-invariants.test.ts` to scope the
  `motion.*` ban to `src/sections/Hero/` only — the Header now legitimately
  uses Motion for the hide-on-scroll behavior (Plan 05-05 decision, MOBILE-06).
  The first-viewport guard already keeps the header static in the LCP window.
