import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-05 — Proof invariants (Wave 0 grep gates).
 *
 * Guards a Proof section dark editorial silencioso (D-24/D-26/D-28) against:
 *   - motion.* JSX (NARR-06 — CSS-only animation via hero-card-rise keyframe).
 *   - next/image (D-26 — categorias são texto puro, zero logos).
 *   - imports de logos de cliente (D-27 — zero "trusted by" lookalikes).
 *   - hard-coded PT-BR JSX strings (COPY-01 — copy mora em src/content/proof.ts).
 *   - WhatsApp/CTA (D-29 — Proof não tem CTA, fechamento silencioso da Phase 4).
 *
 * Node-puro fs+regex, cross-platform. Patterned after hero-invariants.test.ts.
 *
 * Strategy: each invariant skips silently when Proof files don't exist yet.
 * The tests start failing the moment Plan 04-05 violates any invariant.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const PROOF_DIR = path.resolve(SRC_DIR, "sections/Proof");
const PROOF_COPY_FILE = path.resolve(SRC_DIR, "content/proof.ts");

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

function proofFiles(): string[] {
  return walk(PROOF_DIR);
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

describe("proof invariants — Phase 4 D-24/D-26/D-28 gates", () => {
  // -------------------------------------------------------------------------
  // Test 1 — zero `motion.*` in Proof/ (NARR-06)
  // -------------------------------------------------------------------------
  it("zero `motion.*` JSX elements in src/sections/Proof/ (NARR-06)", () => {
    const files = proofFiles();
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
      `NARR-06 violation: Proof MUST be CSS-only animation via hero-card-rise keyframe.\n` +
        `Found motion.* usage:\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 2 — zero imports from motion / framer-motion / components/motion
  // -------------------------------------------------------------------------
  it("zero imports from motion/framer-motion/@/components/motion in src/sections/Proof/ (NARR-06)", () => {
    const files = proofFiles();
    const importRegex =
      /from\s+["'](motion(?:\/react)?|framer-motion|@\/components\/motion[^"']*)["']/g;
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = [...content.matchAll(importRegex)];
      for (const m of matches) {
        violations.push(`${path.relative(SRC_DIR, file)}: ${m[0]}`);
      }
    }
    expect(
      violations,
      `NARR-06 violation: Proof MUST NOT import motion libs.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 3 — zero raw vh height utilities
  // -------------------------------------------------------------------------
  it("zero raw `vh` height utilities in src/sections/Proof/", () => {
    const files = proofFiles();
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
      `Proof MUST use 'dvh'/'svh' (iOS-safe) if needed, NEVER 'vh'.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 4 — zero hard-coded PT-BR sentence-like JSX strings (COPY-01)
  // -------------------------------------------------------------------------
  it("zero hard-coded PT-BR sentences in Proof JSX — copy lives in src/content/proof.ts (COPY-01)", () => {
    const files = proofFiles();
    const HARDCODED_PT_ACCENTED =
      />\s*[^<{}]*?(?:[áàâãéêíóôõúç][^<{}]*?){2,}<\/[a-z]/gi;
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
      `COPY-01 violation: PT-BR copy MUST live in 'src/content/proof.ts'.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 5 — zero banned anti-IA phrases in src/content/proof.ts (COPY-02)
  // -------------------------------------------------------------------------
  it.skipIf(!fs.existsSync(PROOF_COPY_FILE))(
    "zero 'cara de IA' banned phrases in src/content/proof.ts (COPY-02)",
    () => {
      const content = fs.readFileSync(PROOF_COPY_FILE, "utf-8");
      const BANNED =
        /\b(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)\b/gi;
      const found = content.match(BANNED) ?? [];
      expect(
        found,
        `COPY-02 violation: proof.ts contém frases banidas "cara de IA".\nMatches: ${found.join(", ")}`,
      ).toEqual([]);
    },
  );

  // -------------------------------------------------------------------------
  // Test 6 — zero WhatsApp CTA / D-29 final closing
  // -------------------------------------------------------------------------
  it("zero WhatsApp CTA references in src/sections/Proof/ (D-29 — Proof não converte)", () => {
    const files = proofFiles();
    const ctaRegex = /WhatsAppCta|whatsapp-cta|wa\.me|api\.whatsapp\.com/i;
    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        if (ctaRegex.test(line)) {
          violations.push(`${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
    expect(
      violations,
      `D-29 violation: Proof MUST NOT contain WhatsApp CTA — silent close.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 7 (EXTRA) — zero <Image JSX in Proof (D-26 categorias texto puro)
  // -------------------------------------------------------------------------
  it("zero `<Image` JSX in src/sections/Proof/ — D-26 categorias verticais minimal são texto puro", () => {
    const files = proofFiles();
    const imageRegex = /<Image\b/g;
    const violations: string[] = [];
    for (const file of files) {
      const lines = readLines(file);
      lines.forEach((line, idx) => {
        if (imageRegex.test(line)) {
          violations.push(`${path.relative(SRC_DIR, file)}:${idx + 1}: ${line.trim()}`);
          imageRegex.lastIndex = 0;
        }
      });
    }
    expect(
      violations,
      `D-26 violation: Proof MUST NOT use next/image. Categories are text-only.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Test 8 (EXTRA) — zero logo asset imports (D-27 zero logos)
  // -------------------------------------------------------------------------
  it("zero logo asset imports in src/sections/Proof/ — D-27 zero logos", () => {
    const files = proofFiles();
    const logoImportRegex =
      /from\s+["'](?:@\/logos|@\/assets\/logos|.*\/logos\/|.*\.svg|.*\.png|.*\.webp|.*\.avif)["']/gi;
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = [...content.matchAll(logoImportRegex)];
      for (const m of matches) {
        violations.push(`${path.relative(SRC_DIR, file)}: ${m[0]}`);
      }
    }
    expect(
      violations,
      `D-27 violation: Proof MUST NOT import logo assets.\n${violations.join("\n")}`,
    ).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Sanity check
  // -------------------------------------------------------------------------
  it("walk() returns [] for nonexistent directory (helper sanity check)", () => {
    const ghost = path.resolve(SRC_DIR, "this/dir/does/not/exist");
    expect(walk(ghost)).toEqual([]);
  });
});
