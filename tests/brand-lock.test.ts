import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve(__dirname, "../src");
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);

/**
 * FOUND-03 (REDEFINIDA — orchestrator directive #2):
 *
 * Tailwind v4 NÃO emite build error para utility desconhecida.
 * `bg-accent-50` vira no-op silencioso. A defesa REAL é 3 camadas:
 *   (a) Tokens NÃO declarados em @theme (Plan 01)
 *   (b) Este grep test que falha CI se encontrar shades proibidas
 *   (c) Code review checklist em docs/BRAND.md (criado em Plan 04)
 *
 * Tokens permitidos: accent-primary, accent-hover, accent-glow.
 * Tokens PROIBIDOS: accent-{50..900} em qualquer prefix de utility
 * (bg/text/border/from/to/via/ring/outline/decoration).
 *
 * WR-03: adicionados checks para hex literals crus e Tailwind arbitrary
 * values com cores Likro. src/lib/brand-tokens.ts é excluído (fonte canônica).
 *
 * Implementação Node-puro (sem dependência de grep no PATH) —
 * cross-platform Windows / Linux / macOS por design.
 */

/**
 * Arquivos canônicos de tokens — únicos locais onde hex Likro pode aparecer:
 * - brand-tokens.ts: constantes para next/og edge runtime (sem CSS vars)
 * - globals.css: declaração @theme dos tokens CSS (fonte de verdade do CSS)
 */
const BRAND_CANONICAL_FILES = new Set([
  path.resolve(SRC_DIR, "lib/brand-tokens.ts"),
  path.resolve(SRC_DIR, "app/globals.css"),
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (EXTS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const FORBIDDEN_REGEX =
  /\b(bg|text|border|from|to|via|ring|outline|decoration)-accent-(50|100|200|300|400|500|600|700|800|900)\b/g;

/** WR-03: hex literals crus das cores Likro (case-insensitive) */
const FORBIDDEN_HEX_REGEX = /#7c3aed|#6d28d9/gi;

/** WR-03: Tailwind arbitrary values com cores Likro */
const FORBIDDEN_ARBITRARY_REGEX = /\[#7c3aed\]|\[#6d28d9\]/gi;

describe("brand-lock — roxo só como accent-primary/hover/glow", () => {
  it("no forbidden accent shade classes in src/", () => {
    const files = walk(SRC_DIR);
    const matches: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const found = content.match(FORBIDDEN_REGEX);
      if (found) {
        matches.push(`${path.relative(SRC_DIR, file)}: ${found.join(", ")}`);
      }
    }
    expect(
      matches,
      `FOUND-03 violation: roxo é APENAS accent-primary/hover/glow.\n` +
        `Forbidden matches:\n${matches.join("\n")}`,
    ).toEqual([]);
  });

  it("no raw hex literals for Likro brand colors outside brand-tokens.ts (WR-03)", () => {
    const files = walk(SRC_DIR).filter((f) => !BRAND_CANONICAL_FILES.has(f));
    const matches: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const found = content.match(FORBIDDEN_HEX_REGEX);
      if (found) {
        matches.push(`${path.relative(SRC_DIR, file)}: ${found.join(", ")}`);
      }
    }
    expect(
      matches,
      `WR-03 violation: hex Likro (#7c3aed / #6d28d9) só pode aparecer em lib/brand-tokens.ts.\n` +
        `Use BRAND.accentPrimary / BRAND.accentDeep em vez de hex literal.\n` +
        `Forbidden matches:\n${matches.join("\n")}`,
    ).toEqual([]);
  });

  it("no Tailwind arbitrary values with Likro brand colors (WR-03)", () => {
    const files = walk(SRC_DIR).filter((f) => !BRAND_CANONICAL_FILES.has(f));
    const matches: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const found = content.match(FORBIDDEN_ARBITRARY_REGEX);
      if (found) {
        matches.push(`${path.relative(SRC_DIR, file)}: ${found.join(", ")}`);
      }
    }
    expect(
      matches,
      `WR-03 violation: Tailwind arbitrary values [#7c3aed] / [#6d28d9] bypassam o sistema de tokens.\n` +
        `Use classes token-based (bg-accent-primary, etc.) em vez de hex arbitrário.\n` +
        `Forbidden matches:\n${matches.join("\n")}`,
    ).toEqual([]);
  });
});
