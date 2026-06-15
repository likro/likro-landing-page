import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 9 / Plan 09-01 — Funnel section invariants (Wave 0 grep gates).
 *
 * Mirrors tests/sections/how-it-works-invariants.test.ts adapted for
 * src/sections/Funnel/, with the motion gate RETARGETED for FUNIL-01.
 *
 * Unlike HowItWorks (which forbids ALL motion imports), the Funnel uses the
 * Phase 2 primitives + the sanctioned MOTION-05 render-prop exception: inside
 * the <ScrollScene> render-prop, the section MAY import `useTransform` +
 * `motion.<tag>` from `motion/react` to derive sub-ranges from the emitted
 * `progress: MotionValue<number>`. So:
 *
 *   Test A — direct-import gate (FUNIL-01): any `from "motion/react"` /
 *     `from "framer-motion"` import may pull ONLY from the render-prop
 *     allowlist { useTransform, motion, useMotionValueEvent, MotionValue }.
 *     `useScroll` / `useMotionValue` direct imports are FORBIDDEN (the
 *     Hero-workaround anti-pattern — RESEARCH Pitfall 1). The section must
 *     also import ScrollScene/StickyStage from @/components/motion.
 *   Test 3 — zero raw `vh` height utilities (only dvh/svh/lvh).
 *   Test 4 — zero `priority` JSX prop (LCP locked to Hero H1).
 *   Test 5 — zero hard-coded PT-BR copy in JSX (copy in src/content/funnel.ts).
 *   walk-sanity — walk() returns [] for missing dir.
 *
 * Tests skip gracefully when src/sections/Funnel/ doesn't exist yet (walk
 * returns []). They start enforcing as soon as Plan 02 lands the section.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const FUNNEL_DIR = path.resolve(SRC_DIR, "sections/Funnel");

const TSX_EXTS = new Set([".tsx", ".ts"]);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (TSX_EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function funnelFiles(): string[] {
  return walk(FUNNEL_DIR);
}

function readLines(file: string): string[] {
  return fs.readFileSync(file, "utf-8").split(/\r?\n/);
}

function stripCopyAllowlist(line: string): string {
  if (/\{\/\*[\s\S]*?\*\/\}/.test(line)) return "";
  if (/\b(aria-label|aria-description|aria-labelledby|title|alt|placeholder|name)=["']/.test(line))
    return "";
  return line;
}

describe("funnel invariants — Phase 9 / Plan 09-01 grep gates", () => {
  // -------------------------------------------------------------------------
  // Test A — direct motion import gate (FUNIL-01)
  // -------------------------------------------------------------------------
  it("motion/react imports limited to the render-prop allowlist; no useScroll/useMotionValue (FUNIL-01)", () => {
    const files = funnelFiles();
    // Specifiers the section is allowed to pull directly from motion/react
    // (the MOTION-05 render-prop exception). type-only imports also allowed.
    const ALLOWED_SPECIFIERS = new Set([
      "useTransform",
      "motion",
      "useMotionValueEvent",
      "MotionValue",
    ]);
    const FORBIDDEN_SPECIFIERS = new Set(["useScroll", "useMotionValue"]);

    const motionImportRegex = /from\s+['"](?:framer-motion|motion\/react)['"]/;
    // capture the `{ ... }` specifier block of an import statement
    const namedBlockRegex = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"](?:framer-motion|motion\/react)['"]/;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        if (!motionImportRegex.test(line)) return;
        const block = line.match(namedBlockRegex);
        if (!block) {
          // default/namespace import from motion/react — not allowed at all
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: non-named motion/react import — ${line.trim()}`,
          );
          return;
        }
        const specifiers = (block[1] ?? "")
          .split(",")
          .map((s) => s.replace(/\btype\b/, "").replace(/\s+as\s+\w+/, "").trim())
          .filter(Boolean);
        for (const spec of specifiers) {
          if (FORBIDDEN_SPECIFIERS.has(spec)) {
            violations.push(
              `${path.relative(SRC_DIR, file)}:${idx + 1}: forbidden '${spec}' (Hero-workaround anti-pattern) — ${line.trim()}`,
            );
          } else if (!ALLOWED_SPECIFIERS.has(spec)) {
            violations.push(
              `${path.relative(SRC_DIR, file)}:${idx + 1}: '${spec}' not in render-prop allowlist {useTransform, motion, useMotionValueEvent, MotionValue} — ${line.trim()}`,
            );
          }
        }
      });
    }

    expect(
      violations,
      `FUNIL-01 violation: motion/react may only be imported inside the <ScrollScene> ` +
        `render-prop exception (allowlist: useTransform, motion, useMotionValueEvent, MotionValue). ` +
        `useScroll/useMotionValue are forbidden (use the ScrollScene-emitted progress).\n` +
        `Violations:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  it("section imports ScrollScene/StickyStage from @/components/motion when files exist (FUNIL-01)", () => {
    const files = funnelFiles();
    if (files.length === 0) {
      // pre-build: nothing to enforce yet.
      expect(files).toEqual([]);
      return;
    }
    const corpus = files.map((f) => fs.readFileSync(f, "utf-8")).join("\n");
    const importsPrimitive =
      /from\s+['"]@\/components\/motion['"]/.test(corpus) &&
      /\b(ScrollScene|StickyStage)\b/.test(corpus);
    expect(
      importsPrimitive,
      "FUNIL-01: the Funnel section must drive motion via @/components/motion (ScrollScene/StickyStage).",
    ).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 3 — zero `vh` height utilities
  // -------------------------------------------------------------------------
  it("zero raw `vh` height utilities in src/sections/Funnel/ (only dvh/svh/lvh allowed)", () => {
    const files = funnelFiles();
    const vhRegex =
      /\b(?:min-h|h|max-h)-\[?100vh\]?\b|\bh-screen\b|\bmin-h-screen\b|\bmax-h-screen\b/g;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const m = line.match(vhRegex);
        if (m) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${m.join(", ")} — ${line.trim()}`,
          );
        }
      });
    }
    expect(
      violations,
      `Funnel MUST use 'svh' for height (iOS address-bar safe), NEVER 'vh'/'h-screen'.\n` +
        `Found vh usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 4 — zero `priority` JSX prop (LCP locked to Hero H1)
  // -------------------------------------------------------------------------
  it("zero `priority` JSX prop in src/sections/Funnel/ (LCP element is Hero H1 text)", () => {
    const files = funnelFiles();
    const priorityRegex = /\bpriority\b(?=\s*(?:\}|\/|>|=\s*\{))/g;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        if (priorityRegex.test(line) && !/priority=\{false\}/.test(line)) {
          violations.push(`${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim()}`);
        }
        priorityRegex.lastIndex = 0;
      });
    }

    expect(
      violations,
      `Funnel MUST NOT use <Image priority>. LCP is locked to Hero H1.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 5 — zero PT-BR sentence-like strings hard-coded in JSX
  // -------------------------------------------------------------------------
  it("zero PT-BR sentence-like strings hard-coded in Funnel JSX — copy belongs in src/content/funnel.ts", () => {
    const files = funnelFiles();

    const HARDCODED_PT_ACCENTED = />\s*[^<{}]*?(?:[áàâãéêíóôõúç][^<{}]*?){2,}<\/[a-z]/gi;
    const HARDCODED_PT_LONG =
      />\s*[A-ZÀ-Úa-zà-ú][^<{}]*?\s+[a-zà-ú]+\s+[a-zà-ú]+[^<{}]{15,}?<\/[a-z]/gi;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const stripped = stripCopyAllowlist(line);
        if (!stripped) return;
        const a = stripped.match(HARDCODED_PT_ACCENTED);
        const b = stripped.match(HARDCODED_PT_LONG);
        const matches = [...(a ?? []), ...(b ?? [])];
        if (matches.length > 0) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim().slice(0, 160)}`,
          );
        }
      });
    }

    expect(
      violations,
      `FUNIL-COPY violation: PT-BR copy MUST live in 'src/content/funnel.ts', not inlined in JSX.\n` +
        `Move these strings to content/funnel.ts and import them:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Bonus: walk() handles missing directory gracefully.
  // -------------------------------------------------------------------------
  it("walk() returns [] for nonexistent directory (helper sanity check)", () => {
    const ghost = path.resolve(SRC_DIR, "this/dir/does/not/exist");
    expect(walk(ghost)).toEqual([]);
  });
});
