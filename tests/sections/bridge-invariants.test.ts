import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-02 — Bridge section invariants (Wave 0 grep gates).
 *
 * Mirrors tests/sections/pain-invariants.test.ts adapted for src/sections/Bridge/.
 * Adds a structural test (#6) verifying that BridgeStatement.tsx renders
 * BRIDGE_COPY.statements inside an <h2 id="bridge-headline"> (B4 fix permanent):
 * the editorial statement IS the section heading — no synthetic sr-only h2.
 *
 * Tests skip gracefully when src/sections/Bridge/ doesn't exist yet (walk returns
 * []). Tests start enforcing as soon as Plan 04-02 Task 2 creates the files.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const BRIDGE_DIR = path.resolve(SRC_DIR, "sections/Bridge");

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

function bridgeFiles(): string[] {
  return walk(BRIDGE_DIR);
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

describe("bridge invariants — Phase 4 / Plan 04-02 grep gates", () => {
  // -------------------------------------------------------------------------
  // Test 1 — zero `motion.*` JSX elements in Bridge/
  // -------------------------------------------------------------------------
  it("zero `motion.*` JSX elements in src/sections/Bridge/ (NARR-06 reinterpretation)", () => {
    const files = bridgeFiles();
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
      `NARR-06 violation: Bridge section MUST NOT use motion.* JSX elements. ` +
        `Use useInView() from @/hooks/use-in-view + CSS keyframes (hero-headline-reveal).\n` +
        `Found motion.* usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 2 — zero motion lib imports in Bridge/
  // -------------------------------------------------------------------------
  it("zero `framer-motion` / `motion/react` / `@/components/motion/` imports in src/sections/Bridge/ (NARR-06)", () => {
    const files = bridgeFiles();
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
      `NARR-06 reinterpretation: Bridge section MUST NOT import motion libs.\n` +
        `Use useInView() from @/hooks/use-in-view + CSS keyframes in globals.css.\n` +
        `Violations:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 3 — zero `vh` height utilities in Bridge/
  // -------------------------------------------------------------------------
  it("zero raw `vh` height utilities in src/sections/Bridge/ (only dvh/svh/lvh allowed)", () => {
    const files = bridgeFiles();
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
      `Bridge MUST use 'dvh' or 'svh' for height (iOS address-bar safe), NEVER 'vh'/'h-screen'.\n` +
        `Found vh usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 4 — zero `priority` JSX prop in Bridge/ (LCP locked to Hero H1)
  // -------------------------------------------------------------------------
  it("zero `priority` JSX prop in src/sections/Bridge/ (LCP element is Hero H1 text)", () => {
    const files = bridgeFiles();
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
      `Bridge MUST NOT use <Image priority>. LCP is locked to Hero H1.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 5 — zero PT-BR sentence-like strings hard-coded in Bridge JSX (T-4-08)
  // -------------------------------------------------------------------------
  it("zero PT-BR sentence-like strings hard-coded in Bridge JSX — copy belongs in src/content/bridge.ts", () => {
    const files = bridgeFiles();

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
      `T-4-08 violation: PT-BR copy MUST live in 'src/content/bridge.ts', not inlined in JSX.\n` +
        `Move these strings to content/bridge.ts and import them in the component:\n${violations.join(
          "\n",
        )}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 6 — BridgeStatement renders BRIDGE_COPY.statements inside <h2 id="bridge-headline">
  //           AND src/sections/Bridge/index.tsx contains zero sr-only h2 boilerplate (B4 fix).
  // -------------------------------------------------------------------------
  it("BridgeStatement.tsx renders <h2 id='bridge-headline'> consuming BRIDGE_COPY.statements; index.tsx has no sr-only h2", () => {
    const statementFile = path.resolve(BRIDGE_DIR, "BridgeStatement.tsx");
    const indexFile = path.resolve(BRIDGE_DIR, "index.tsx");

    if (!fs.existsSync(statementFile) || !fs.existsSync(indexFile)) {
      // Skip gracefully — files not yet created (Task 2 will create them).
      return;
    }

    const statementSrc = fs.readFileSync(statementFile, "utf-8");
    const indexSrc = fs.readFileSync(indexFile, "utf-8");

    expect(/<h2[\s\S]*?id=["']bridge-headline["']/.test(statementSrc), {
      message: () =>
        `BridgeStatement.tsx must contain <h2 id="bridge-headline"> — the editorial statement IS the section heading.`,
    } as never).toBe(true);

    expect(/BRIDGE_COPY\.statements/.test(statementSrc), {
      message: () => `BridgeStatement.tsx must reference BRIDGE_COPY.statements.`,
    } as never).toBe(true);

    // index.tsx must NOT contain a synthetic sr-only h2 (B4 fix permanent).
    const indexSrOnlyHeading = /<h2[^>]*\bclassName=["'][^"']*\bsr-only\b[^"']*["']/.test(indexSrc);
    expect(indexSrOnlyHeading, {
      message: () =>
        `Bridge/index.tsx must NOT contain a synthetic sr-only h2. The editorial statement in BridgeStatement IS the real heading.`,
    } as never).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Bonus: walk() handles missing directory gracefully.
  // -------------------------------------------------------------------------
  it("walk() returns [] for nonexistent directory (helper sanity check)", () => {
    const ghost = path.resolve(SRC_DIR, "this/dir/does/not/exist");
    expect(walk(ghost)).toEqual([]);
  });
});
