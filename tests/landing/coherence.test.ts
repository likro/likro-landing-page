import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 — Cross-section coherence gates (Plan 04-00).
 *
 * Guards the 5 narrative sections collectively:
 *   - src/app/page.tsx must import + render Hero → Pain → Bridge → Product → HowItWorks → Proof in order.
 *   - Zero `<Image priority>` in any section file (LCP element is Hero H1 text per Phase 3).
 *   - Zero motion lib imports inside narrative sections (NARR-06 reinterpretation, vide 04-RESEARCH §483-492):
 *     no `framer-motion`, no `motion/react`, no `@/components/motion/*` imports under the 5 section dirs.
 *
 * Pattern (Node-puro fs + regex) mirrors tests/sections/hero-invariants.test.ts.
 * Tests SKIP gracefully when section dirs don't exist yet, so this file can be merged
 * before Plan 01-05 fill the sections (same pattern Phase 3 uses).
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const PAGE_FILE = path.resolve(SRC_DIR, "app/page.tsx");
const SECTION_NAMES = ["Pain", "Bridge", "Product", "HowItWorks", "Proof"] as const;
const SECTION_DIRS = SECTION_NAMES.map((s) => path.resolve(SRC_DIR, "sections", s));

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

function readLines(file: string): string[] {
  return fs.readFileSync(file, "utf-8").split(/\r?\n/);
}

function allSectionDirsExist(): boolean {
  return SECTION_DIRS.every((d) => fs.existsSync(d));
}

function allSectionFiles(): string[] {
  return SECTION_DIRS.flatMap((d) => walk(d));
}

describe("landing coherence — Phase 4 narrative section gates", () => {
  // ---------------------------------------------------------------------------
  // Test 1 — page.tsx imports Hero, Pain, Bridge, Product, HowItWorks, Proof in order
  // ---------------------------------------------------------------------------
  it.skipIf(!allSectionDirsExist())(
    "page.tsx imports Hero → Pain → Bridge → Product → HowItWorks → Proof in order",
    () => {
      const content = fs.readFileSync(PAGE_FILE, "utf-8");
      const lines = content.split(/\r?\n/);
      const expected = ["Hero", ...SECTION_NAMES];
      const importLineByName: Record<string, number> = {};

      lines.forEach((line, idx) => {
        for (const name of expected) {
          // Match `import { Name } from "@/sections/Name"` or similar
          const re = new RegExp(`from\\s+['"]@/sections/${name}['"]`);
          if (re.test(line) && importLineByName[name] === undefined) {
            importLineByName[name] = idx;
          }
        }
      });

      // All sections must be imported
      for (const name of expected) {
        expect(
          importLineByName[name],
          `page.tsx is missing import of @/sections/${name}`,
        ).toBeDefined();
      }

      // Imports must appear in expected order
      const lineNums = expected.map((n) => importLineByName[n]!);
      const sorted = [...lineNums].sort((a, b) => a - b);
      expect(
        lineNums,
        `page.tsx imports out of order. Got ${JSON.stringify(
          expected.map((n, i) => [n, lineNums[i]]),
        )}; expected ascending line numbers.`,
      ).toEqual(sorted);
    },
  );

  // ---------------------------------------------------------------------------
  // Test 2 — page.tsx renders the sections in narrative order (JSX)
  // ---------------------------------------------------------------------------
  it.skipIf(!allSectionDirsExist())(
    "page.tsx JSX renders <Hero> → <Pain> → <Bridge> → <Product> → <HowItWorks> → <Proof> in order",
    () => {
      const content = fs.readFileSync(PAGE_FILE, "utf-8");
      const re = /<Hero[\s\S]*?<Pain[\s\S]*?<Bridge[\s\S]*?<Product[\s\S]*?<HowItWorks[\s\S]*?<Proof/;
      expect(
        re.test(content),
        `page.tsx must render <Hero/> → <Pain/> → <Bridge/> → <Product/> → <HowItWorks/> → <Proof/> in this exact order.\n` +
          `Current content:\n${content}`,
      ).toBe(true);
    },
  );

  // ---------------------------------------------------------------------------
  // Test 3 — zero `priority` prop in narrative section files (LCP locked to Hero H1)
  // ---------------------------------------------------------------------------
  it("zero `priority` JSX prop in narrative section files (LCP element is Hero H1 text)", () => {
    const files = allSectionFiles();
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
      `Phase 3 invariant: zero <Image priority> outside Hero. Found priority in narrative sections:\n${violations.join(
        "\n",
      )}`,
    ).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Test 4 — zero motion lib imports in narrative sections (NARR-06 reinterpretation)
  // ---------------------------------------------------------------------------
  it("zero `framer-motion` / `motion/react` / `@/components/motion/` imports in narrative sections (NARR-06)", () => {
    const files = allSectionFiles();
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
      `NARR-06 (Phase 4 reinterpretation): narrative sections must NOT import motion libs.\n` +
        `Use useInView() from @/hooks/use-in-view + CSS keyframes in globals.css.\n` +
        `Violations:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Test 5 — walk() handles nonexistent directory (helper sanity check)
  // ---------------------------------------------------------------------------
  it("walk() returns [] for nonexistent directory (helper sanity check)", () => {
    const ghost = path.resolve(SRC_DIR, "this/section/does/not/exist");
    expect(walk(ghost)).toEqual([]);
  });
});
