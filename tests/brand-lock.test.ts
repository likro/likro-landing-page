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
 * Implementação Node-puro (sem dependência de grep no PATH) —
 * cross-platform Windows / Linux / macOS por design.
 */

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
});
