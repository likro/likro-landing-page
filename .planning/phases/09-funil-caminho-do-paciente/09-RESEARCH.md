---
phase: 9
slug: funil-caminho-do-paciente
status: draft
created: 2026-06-15
note: "RECONSTRUCTED 2026-06-15 after accidental overwrite during plan revision. Body sections (Summary → Runtime State Inventory) were rebuilt from the surviving Assumptions Log + Open Questions tail and from cross-references in 09-01/02/03-PLAN.md, 09-UI-SPEC.md, and 09-VALIDATION.md. The Assumptions Log, Open Questions, Environment Availability, and Validation Architecture sections are the verbatim originals. Section names, patterns, and pitfalls are faithful to how the plans cite them."
---

# Phase 9 — Funil (Caminho do Paciente) — RESEARCH

> **Nature:** PORT of an already-approved prototype (`funil-proto.html`, aprovado por Lenny via Playwright @1536×730, 2026-06-15). The concept is LOCKED in 09-CONTEXT. This research records HOW to translate the prototype's behavior onto the production stack (Next.js 15.5 + Tailwind v4 + Motion v12 + Lenis + Phase 2 frozen primitives), the integration patterns to mirror, the pitfalls to avoid, the content-module shape, and the runtime files to swap. It does NOT re-open the visual direction.
>
> **Precedence:** `09-CONTEXT.md` (locked decisions) > `funil-proto.html` (visual behavior) > this research's defaults.

---

## Summary

The Funil is a dark cinematic Kanban traversal: a single protagonist card ("Marina") walks left→right across 4 columns ("Chegou agora" → "Em atendimento" → "Escolhendo horário" → "Consulta marcada") as the user scrolls, with a purple climax igniting only on arrival in column 4. Everything is built on the Phase 2 frozen motion primitives (`<ScrollScene>` emitting a `MotionValue<number>` 0→1, `<StickyStage>` providing the structural pin in `svh`), with the sanctioned render-prop exception (`useTransform`/`motion` from `motion/react` inside the render-prop only). Mobile (≤639px) renders "1 column in focus + rail" at ~420svh; desktop renders the full 4-column board at ~560svh; `prefers-reduced-motion` renders the journey pre-assembled at its final state. Zero new npm packages.

---

## Integration Patterns

### Pattern 1 — `ScrollScene > StickyStage` for sticky+scrub progress
The traversal is driven by a single `MotionValue<number>` 0→1 emitted by `<ScrollScene>`'s render-prop, with `<StickyStage length="…svh">` providing the pin. This is the proven `/dev/sticky` StageB pattern (and the in-repo Bridge/Product sticky usage). Nest as `<ScrollScene offset={["start start","end end"]}>{(progress) => <StickyStage length={LEN}>…</StickyStage>}</ScrollScene>`. `aria-labelledby` is not a typed ScrollScene prop → keep it on an outer wrapping `<section>`.

### Pattern 2 — 7-point plateau `useTransform` sub-ranges for the "deliberate footstep" traversal
Segment the single `progress` value into per-leg windows with multi-point `useTransform`, plateauing at each column center to give the "deliberate footstep" feel Lenny approved (the prototype's per-leg symmetric easeInOut). Example for horizontal travel:
`const x = useTransform(progress, [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], [x0, x1, x1, x2, x2, x3, x3]);`
Beat-content opacity, active-column lighting, and the climax ignition all derive from the same `progress` via parallel `useTransform` ramps (mirrors `/dev/sticky` StageB's `op1..op4` / `y1..y4`). The 560svh desktop length produces the approved ~6s pace.

### Pattern 3 — discrete active index without per-frame setState
Derive `activeIndex` via `useTransform(progress, [0, 0.33, 0.66, 1], [0,1,2,3])`, subscribe once with `useMotionValueEvent(idx, "change", …)`, and `setState` ONLY when the rounded index changes (4 state changes total). This is the faithful port of the prototype's `dataset.cur != active` guard and honors the no-per-frame-setState discipline (TPRF-04) ported from the Hero.

### Pattern 4 — climax ignition ramp
Drive column-4 `.win` border/glow, MarinaCard `.win` ring/border, and the confirmation tag from `useTransform(progress, [0.82, 0.95], [0, 1])` (mirroring the Hero's resolve-opacity ramp `useTransform(progress,[0.6,0.8],[0,1])`). `isClimax = true` once progress ≥ ~0.9. Purple appears ONLY here.

### Pattern 5 — tier branch via `useDeviceTier`, single component
`useDeviceTier()` returns `"reduced" | "mobile" | "tablet" | "desktop"`. Branch the inner component (FunnelRail vs FunnelBoard) and the StickyStage `length` (420svh vs 560svh) off the same `progress` — no component duplication (FUNIL-05). `"reduced"` covers both prefers-reduced-motion AND slow-2g/2g, so one branch satisfies FUNIL-04 + PERF-09.

---

## Pitfalls

### Pitfall 1 — `useScroll` / `useMotionValue` direct usage (Hero workaround anti-pattern)
Do NOT import `useScroll` or `useMotionValue` from `motion/react` inside the section, even within the render-prop. The Hero needed a workaround; the Funil must consume the `MotionValue` handed down by `<ScrollScene>` and derive everything via `useTransform`. The render-prop exception allows ONLY `{ useTransform, motion, useMotionValueEvent, type MotionValue }`. The `funnel-invariants.test.ts` gates this.

### Pitfall 2 — animating `left`/`top` instead of `transform`
The prototype animates the card's `left` property. In production this is FORBIDDEN (MOTION-08, layout-triggering). Port the horizontal travel as `translateX` (`style={{ x }}`). A static `top` offset on a class is acceptable; an animated one is not. Prefer fraction-based translateX (board is fixed max-width centered) so the travel survives resize/tablet without a measured-width ref.

### Pitfall 3 — purple leaking into intermediate columns
The prototype tinted active columns slightly purple. Production tightening (CONTEXT D-3): columns 1–3 use NEUTRAL highlight only (white border ~0.18, head → primary); purple is exclusive to the column-4 climax (one of the page's 4 purple moments).

### Pitfall 4 — hard-coded copy / metrics in JSX
All strings come from `FUNNEL_COPY` (COPY-01). Zero metric/KPI/%/dashboard/counter terms anywhere in the section (FUNIL-02) — a metric turns it into a generic CRM and kills the force. Note: the appointment time `14h` in the seal/beat-3 is a human time, NOT a metric — the no-metric audit must allowlist it.

### Pitfall 5 — brand-hex literals on dark surfaces
`#7c3aed`/`#6d28d9` hex literals are caught by brand-lock. Use `rgba(124,58,237,…)` literals for the climax glow/border (the established Hero/Bridge escape hatch), `accent-on-dark` token for purple TEXT, and the new non-purple `@theme` stage tokens for the dark surfaces.

### Pitfall 6 — `allSectionDirsExist()` false-green after HowItWorks deletion
`coherence.test.ts`'s order tests `skipIf(!allSectionDirsExist())`. If HowItWorks stays in `SECTION_NAMES` after its dir is deleted, the order tests SKIP (false green) instead of running. Fix: replace `"HowItWorks"` with `"Funnel"` in `SECTION_NAMES` so the order gate runs against the real new set. Also scope Test 4 (motion-import ban) to exclude Funnel, which legitimately imports `@/components/motion` (FUNIL-01).

---

## Content Module Shape

Mirror `src/content/how-it-works.ts` / `hero.ts`: a typed `export type` + a single `export const FUNNEL_COPY` (no variant map — the copy is fully LOCKED, no v1/v2/v3) + a JSDoc header documenting the locked decisions.

```ts
export type FunnelBeat = { head: string; channel: string; moment: string };
export type FunnelCopy = {
  eyebrow: string;
  headline: string;
  steps: readonly [FunnelBeat, FunnelBeat, FunnelBeat, FunnelBeat];
  seal: string;
  closing: { lead: string; accent: string; tail: string };
  protagonist: string; // "Marina" — sourced from content, not hard-coded in JSX
};
```

The locked strings live in 09-UI-SPEC §Copywriting Contract and 09-CONTEXT decisions 3/5/6/7 (verbatim, no paraphrase). No "Messenger"/"Facebook" anywhere (CONTEXT D-6). The closing reconstructs as `lead + accent + tail`.

---

## Runtime State Inventory

**Page position (build-safe ordering):** The Funil sits exactly where HowItWorks was — between Product and Proof — wrapped in `<TrackSection section="funnel">` (analytics parity; the section does not self-track). Wire the new import + render block BEFORE deleting HowItWorks, so the build never has a dangling import.

`page.tsx` current: imports `{ HowItWorks } from "@/sections/HowItWorks"` (line 7); renders `<TrackSection section="how"><HowItWorks /></TrackSection>` between the Product block (28-30) and Proof block (34-36).

**Files to DELETE (HowItWorks absorbed — CONTEXT D-8), verified:**
- `src/sections/HowItWorks/` entire dir: `index.tsx`, `HowItWorksHeader.tsx`, `HowItWorksStep.tsx`, `HowItWorksMiniMockup.tsx`
- `src/content/how-it-works.ts`
- `tests/content/how-it-works.test.ts`
- `tests/sections/how-it-works-invariants.test.ts`

**Harmless leftovers (out of scope to remove):**
- `"how"` member of the `WhatsAppLocation` union (`src/lib/whatsapp.ts`) becomes unused but harmless (the Funil adds NO CTA — D-2; do NOT add a `"funnel"` location).
- Stale prose comments in `Proof/ProofBackground.tsx`, `Proof/index.tsx`, `TrackSection.tsx` reference "HowItWorks" — non-breaking; optional cosmetic update.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `ScrollScene > StickyStage` measures progress correctly under Lenis for THIS section (extrapolated from `/dev/sticky` + Bridge/Product, not yet built for the Funil's exact layout). | Pattern 1 / Pitfall 1 | If wrong, progress compresses → traversal stutters. Mitigation: real-device test; fallback documented (escalate, don't hand-roll). MEDIUM-HIGH confidence — the primitive is proven in-repo for sticky+scrub. |
| A2 | Page position: Funil sits where HowItWorks was (between Product and Proof). | Runtime Inventory | UI-SPEC says confirm against bookend order `…Produto L · Funil D · Prova L…` — which also places Funil between Product and Proof. Consistent. LOW risk. |
| A3 | `"how"` WhatsAppLocation member is unused (HowItWorks has no CTA). | Runtime Inventory | Verified HowItWorks renders no WhatsAppCta (D-29). Removing it is optional cleanup. LOW risk. |
| A4 | The 4-distinct-sizes/2-weights typography from UI-SPEC renders correctly with the project's loaded Inter set (400/500/700). | (typography, from UI-SPEC) | UI-SPEC asserts 400/500 are loaded; 600 is NOT. Trust UI-SPEC. LOW risk. |

## Open Questions (RESOLVED)

1. **Per-leg easing fidelity.** The prototype uses a JS symmetric easeInOut per leg (funil-proto.html:228). `useTransform` with multi-point ranges approximates this; an exact match may need the `ease` option or a custom easing array.
   - Recommendation: start with the 7-point plateau `useTransform` (Pattern 2); tune against the prototype's feel during build (Lenny approved the ~6s/560svh pace).
   - RESOLVED: 7-point plateau `useTransform` sub-ranges; tune at build against `funil-proto.html` pace. Lenny pre-approved ~6s rhythm / ~560svh in 09-CONTEXT.
2. **Mobile rail exact mechanics** (connecting line/marker advance). UI-SPEC describes it; the prototype has no mobile rail (it just squeezes 4 columns). This is genuinely new DOM for mobile.
   - Recommendation: build the rail as 4 chips with the active one lit via the same `activeIndex` derivation; advance a position marker with a `translateX` `useTransform`. Validate on a real phone (the only net-new visual not in the prototype).
   - RESOLVED in 09-CONTEXT (§Decisões em aberto — RESOLVIDAS): mobile = "1 coluna em foco + trilho", ~420svh via `useDeviceTier`. Encoded as FUNIL-05 / Plan 09-02 Task 3.
3. **Closing CTA** — default NONE (CONTEXT D-2). If Lenny later wants one, `"funnel"` must be added to `WhatsAppLocation` + a per-location message. Out of scope by default.
   - RESOLVED: no CTA in the Funil by default (CONTEXT D-2 — avoid spending a purple moment / competing with the climax).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `motion` | render-prop transforms | ✓ | 12.38.0 | — |
| `lucide-react` (`Check`) | confirmation seal | ✓ | 0.460.0 | inline SVG check |
| `@/components/motion` primitives | traversal shell | ✓ | frozen (Phase 2) | — |
| `useDeviceTier` | tier/length branch | ✓ | Phase 1 | — |
| `TrackSection` | section_view | ✓ | Phase 6 | — |
| Tailwind v4 `@theme` | new stage tokens | ✓ | 4.3.0 | inline rgba/hex (non-purple allowed) |

**Missing dependencies:** None. This phase adds zero npm packages.

## Validation Architecture

> nyquist_validation: `.planning/config.json` not checked for an explicit `false`; treating as enabled. Test runner is **Vitest 3.2.4** (`npm test` = `vitest run`). [VERIFIED: package.json:10,57]

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `^3.2.4` + @testing-library/react (jsdom) |
| Config file | (vitest config in repo root — `vitest.config.*`; existing tests run via `npm test`) |
| Quick run command | `npx vitest run tests/sections/funnel-invariants.test.ts` |
| Full suite command | `npm test` (`vitest run`) |
| Type gate | `npm run typecheck` (`tsc --noEmit`) |
| Brand gate | `npx vitest run tests/brand-lock.test.ts` |
