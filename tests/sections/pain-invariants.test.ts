import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-01 — Pain section invariants (Wave 0 grep gates).
 *
 * Replicates the Hero invariant pattern (tests/sections/hero-invariants.test.ts)
 * adapted for src/sections/Pain/. Adds NEW invariant test 2: zero imports of
 * motion lib (framer-motion / motion/react / @/components/motion/) — NARR-06
 * reinterpretation per 04-RESEARCH.md §483-492.
 *
 * Tests skip gracefully when src/sections/Pain/ doesn't exist yet (walk returns
 * []). Tests start enforcing as soon as Plan 04-01 Task 2+ create the files.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const PAIN_DIR = path.resolve(SRC_DIR, "sections/Pain");

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

function painFiles(): string[] {
  return walk(PAIN_DIR);
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

describe("pain invariants — Phase 4 / Plan 04-01 grep gates", () => {
  // -------------------------------------------------------------------------
  // Test 1 — zero `motion.*` JSX elements in Pain/
  // -------------------------------------------------------------------------
  it("zero `motion.*` JSX elements in src/sections/Pain/ (NARR-06 reinterpretation)", () => {
    const files = painFiles();
    const motionRegex =
      /\bmotion\.(div|h1|h2|h3|h4|h5|h6|p|span|section|article|img|button|a|ul|li|nav|header|footer|main|aside|form|input|label)\b/g;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        const m = line.match(motionRegex);
        if (m) {
          violations.push(
            `${path.relative(SRC_DIR, file)}:${idx + 1}: ${m.join(", ")} — ${line.trim()}`,
          );
        }
      });
    }
    expect(
      violations,
      `NARR-06 violation: Pain section MUST NOT use motion.* JSX elements. ` +
        `Use useInView() from @/hooks/use-in-view + CSS keyframes (hero-card-rise).\n` +
        `Found motion.* usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 2 — zero motion lib imports in Pain/ (NEW per NARR-06 reinterpretation)
  // -------------------------------------------------------------------------
  it("zero `framer-motion` / `motion/react` / `@/components/motion/` imports in src/sections/Pain/ (NARR-06)", () => {
    const files = painFiles();
    const motionImportRegex = /from\s+['"](?:framer-motion|motion\/react|@\/components\/motion)/;

    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        if (motionImportRegex.test(line)) {
          violations.push(`${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim()}`);
        }
      });
    }

    expect(
      violations,
      `NARR-06 reinterpretation: Pain section MUST NOT import motion libs.\n` +
        `Use useInView() from @/hooks/use-in-view + CSS keyframes in globals.css.\n` +
        `Violations:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 3 — zero `vh` height utilities in Pain/
  // -------------------------------------------------------------------------
  it("zero raw `vh` height utilities in src/sections/Pain/ (only dvh/svh/lvh allowed)", () => {
    const files = painFiles();
    const vhRegex = /\b(?:min-h|h|max-h)-\[?100vh\]?\b|\bh-screen\b|\bmin-h-screen\b|\bmax-h-screen\b/g;

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
      `Pain MUST use 'dvh' or 'svh' for height (iOS address-bar safe), NEVER 'vh'/'h-screen'.\n` +
        `Found vh usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 4 — zero `priority` JSX prop in Pain/ (LCP locked to Hero H1)
  // -------------------------------------------------------------------------
  it("zero `priority` JSX prop in src/sections/Pain/ (LCP element is Hero H1 text)", () => {
    const files = painFiles();
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
      `Pain MUST NOT use <Image priority>. LCP is locked to Hero H1.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 5 — zero PT-BR sentence-like strings hard-coded in Pain JSX (T-4-05)
  // -------------------------------------------------------------------------
  it("zero PT-BR sentence-like strings hard-coded in Pain JSX — copy belongs in src/content/pain.ts", () => {
    const files = painFiles();

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
      `T-4-05 violation: PT-BR copy MUST live in 'src/content/pain.ts', not inlined in JSX.\n` +
        `Move these strings to content/pain.ts and import them in the component:\n${violations.join(
          "\n",
        )}`,
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
