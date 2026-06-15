---
phase: 09-funil-caminho-do-paciente
plan: 03
subsystem: ui
tags: [next, react, motion, funnel, page-composition, coherence-test]

requires:
  - phase: 09-02
    provides: "Funnel section (board desktop + rail mobile + reduced-motion final state)"
  - phase: 09-01
    provides: "FUNIL-* requirements, dark-stage tokens, funnel.ts copy, Wave 0 tests"
provides:
  - "Funnel wired into page.tsx between Product and Proof (TrackSection section=\"funnel\")"
  - "HowItWorks fully removed (section dir + content module + 2 test files)"
  - "coherence.test.ts updated to Hero → Pain → Bridge → Product → Funnel → Proof, with Funnel excluded from the motion-import ban"
  - "Sticky-pin fix + vertical centering of the Funil stage (checkpoint deviations)"
affects: [proof, page-composition, future-visual-chapters]

tech-stack:
  added: []
  patterns:
    - "Build-safe swap: rewire page.tsx BEFORE deleting the absorbed section (no dangling import)"
    - "Section-scoped motion-import ban: narrative-four (Pain/Bridge/Product/Proof) stay CSS-only; Funnel is exempted (FUNIL-01) and gated by funnel-invariants instead"

key-files:
  created: []
  modified:
    - "src/app/page.tsx — Funnel replaces HowItWorks between Product and Proof"
    - "tests/landing/coherence.test.ts — new order gate + Funnel motion-import exemption"
    - "src/sections/Funnel/index.tsx — sticky-pin fix (removed section overflow-hidden) + stage vertical centering (checkpoint)"
    - "DELETED: src/sections/HowItWorks/* (4 files), src/content/how-it-works.ts, tests/content/how-it-works.test.ts, tests/sections/how-it-works-invariants.test.ts"

key-decisions:
  - "Funil (dark) takes the slot HowItWorks (light) occupied — FUNIL-06 (no two similar sequential sections)"
  - "Proof kept LIGHT (user WIP direction) instead of the plan's dark assumption — dark Funil is the narrative tension chapter, Proof is the light release (resolved at checkpoint)"

patterns-established:
  - "Sticky cinematic stages must NOT have overflow-hidden on the scrolling section ancestor — it breaks position:sticky; clip the moving content on inner wrappers instead"

requirements-completed: [FUNIL-06, FUNIL-01]

duration: 9min
completed: 2026-06-15
---

# Phase 09 / Plan 03: Swap HowItWorks → Funnel Summary

**Funil (dark Kanban traversal) wired into the page between Product and Proof, HowItWorks fully removed, coherence gate updated — plus two checkpoint fixes that made the held-camera traversal actually work.**

## Performance

- **Duration:** ~9 min (execution) + checkpoint verification
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 3 modified, 8 deleted

## Accomplishments
- `page.tsx` renders `<TrackSection section="funnel"><Funnel /></TrackSection>` between Product and Proof (analytics parity; section does not self-track).
- HowItWorks fully absorbed/removed (8 items): section dir (4 files), `content/how-it-works.ts`, and its 2 test files.
- `coherence.test.ts` now enforces `Hero → Pain → Bridge → Product → Funnel → Proof` and RUNS (not skips) after the deletion; Test 4 (motion-import ban) scoped to the narrative-four, exempting Funnel (FUNIL-01).
- Full suite (240 tests) + `npm run build` green.

## Task Commits

1. **Task 1: Wire Funnel into page.tsx + update coherence order gate** — `e0550ff` (feat)
2. **Task 2: Remove HowItWorks (absorbed by Funil)** — `6780d2c` (feat)
3. **Task 3: Visual checkpoint (Lenny) + fixes** — sticky-pin + centering fix committed separately (see Deviations)

## Decisions Made
- **Proof stays LIGHT, not dark.** The 09-03 plan assumed Proof remained dark ("Funnel dark → Proof dark"). At integration the user's in-flight "lighter chapters" direction made Proof light. Resolved in favor of the light Proof: the dark Funil becomes a deliberate tension chapter between two light sections (Product → Funil → Proof), the dark stops being a permanent mid-page "island".

## Deviations from Plan

### Auto-fixed Issues

**1. [Checkpoint - Blocking] Sticky stage was not pinning (traversal scrolled away)**
- **Found during:** Task 3 (Playwright visual verification @1536×730)
- **Issue:** `<section id="funnel">` carried `overflow-hidden`. An ancestor with non-visible overflow breaks `position: sticky` on `<StickyStage>` — the held-camera stage scrolled away with the page instead of pinning, so the card-walk traversal was never visible (measured: sticky `rectTop -1601` instead of `0`).
- **Fix:** Removed `overflow-hidden` from the section. The board's horizontal walk is still double-clipped by the inner StickyStage sticky div + inner stage div; the atmosphere layer is `absolute inset-0` (already bounded). Sticky now pins to the document scroll (`rectTop 0` confirmed).
- **Files modified:** src/sections/Funnel/index.tsx
- **Verification:** Playwright — at scrollY 6200 (deep in the section) the stage held at viewport top; Marina's card walked col0→3 with purple climax in column 4.

**2. [Checkpoint - Polish] ~321px dead black space below the board**
- **Found during:** Task 3 (user feedback "diminuir esse espaço preto")
- **Issue:** Head+board were top-anchored in the `h-svh` stage, leaving ~321px empty black at the bottom of every held frame.
- **Fix:** `justify-center` on the stage column + removed `flex-1` stretch so the head+board group centers vertically. Dead space below dropped 321px → ~161px (balanced top/bottom). Climax card verified not clipped.
- **Files modified:** src/sections/Funnel/index.tsx
- **Verification:** Playwright re-measure + climax screenshot.

---

**Total deviations:** 2 (1 blocking sticky bug, 1 polish). **Impact:** both within Funil section scope; no scope creep into other sections.

## Issues Encountered
- Worktree merge collided with substantial uncommitted WIP on `ProofBackground.tsx`/`HowItWorks/index.tsx` (the "lighter chapters" direction). Resolved by stashing WIP, fast-forwarding Phase 9, then selectively restoring WIP (light Proof kept; HowItWorks WIP dropped since the file is deleted). No work lost — Phase 9 commits preserved on branch `funnel-09-03-recovery`.

## Verification (Task 3 checkpoint)
- ✅ Desktop @1536×730: traversal reads as a person walking col0→3; active column lights neutral; climax ignites purple only in column 4 ("Consulta confirmada · quinta, 14h" + seal); no metric/KPI/legend/CTA in section. Verified live via Playwright.
- ✅ Console: 0 errors (1 benign Motion warning).
- ✅ Full suite + build green.
- ⚠️ Mobile rail (≤639px) and reduced-motion final state are implemented (09-02) and covered by unit tests, but were NOT re-verified visually in this session — recommend a quick mobile/reduced spot-check before launch.

## User Setup Required
None.

## Next Phase Readiness
- Funil chapter live and validated on desktop. The page now reads Hero → Pain → Bridge → Product → Funil(dark) → Proof(light) → Form.
- Open follow-ups (separate from Phase 9): mobile/reduced-motion visual spot-check; the broader "visual chapters" polish (uncommitted WIP across Hero/Pain/Product); Hero perf pass (applied, uncommitted).

---
*Phase: 09-funil-caminho-do-paciente*
*Completed: 2026-06-15*
