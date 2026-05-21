import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 7 — Wave 0. Grep tests de higiene de HTML semântico.
 *
 * Estado esperado: GREEN — verificação. O RESEARCH da Phase 7 apurou que
 * a higiene semântica já está boa. Estes testes travam (lock) os invariantes.
 *
 * Requisitos cobertos: SEO-08 (h1 único), SEO-10 (lang pt-BR),
 * A11Y-06 (zero div onClick), A11Y-07 (mockups aria-hidden).
 *
 * Implementação Node-puro (sem dependência de grep no PATH) — segue o
 * padrão de tests/brand-lock.test.ts. Cross-platform por design.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");

/** Lista recursiva de arquivos com uma das extensões dadas em `dir`. */
function walk(dir: string, exts: Set<string>): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, exts));
    else if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const TSX = new Set([".tsx"]);

describe("semantic-html — h1 único (SEO-08)", () => {
  it("nenhum arquivo .tsx tem mais de um <h1 literal", () => {
    const files = walk(SRC_DIR, TSX);
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(/<h1[\s>]/g);
      if (matches && matches.length > 1) {
        offenders.push(
          `${path.relative(SRC_DIR, file)}: ${matches.length}× <h1`,
        );
      }
    }
    expect(
      offenders,
      `SEO-08 violation: arquivo com múltiplos <h1.\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("no máximo 2 arquivos contêm <h1 literal (HeroCopy + /privacy)", () => {
    const files = walk(SRC_DIR, TSX);
    const withH1 = files
      .filter((f) => /<h1[\s>]/.test(fs.readFileSync(f, "utf-8")))
      .map((f) => path.relative(SRC_DIR, f));
    expect(
      withH1.length,
      `SEO-08: esperado ≤ 2 arquivos com <h1 literal, achei:\n${withH1.join("\n")}`,
    ).toBeLessThanOrEqual(2);
  });
});

describe("semantic-html — lang pt-BR (SEO-10)", () => {
  it("src/app/layout.tsx declara lang=\"pt-BR\"", () => {
    const layout = fs.readFileSync(
      path.resolve(SRC_DIR, "app/layout.tsx"),
      "utf-8",
    );
    expect(/lang=["']pt-BR["']/.test(layout), "layout tem lang=pt-BR").toBe(
      true,
    );
  });
});

describe("semantic-html — zero div onClick (A11Y-06)", () => {
  it("nenhum <div com handler onClick em src/", () => {
    const files = walk(SRC_DIR, TSX);
    const offenders: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (/<div[^>]*\sonClick/.test(content)) {
        offenders.push(path.relative(SRC_DIR, file));
      }
    }
    expect(
      offenders,
      `A11Y-06 violation: <div onClick> deve virar <button>.\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});

describe("semantic-html — mockups aria-hidden (A11Y-07)", () => {
  it("todo arquivo cujo nome contém 'mockup' inclui aria-hidden", () => {
    const files = walk(SRC_DIR, TSX);
    const mockupFiles = files.filter((f) =>
      /mockup/i.test(path.basename(f)),
    );
    expect(
      mockupFiles.length,
      "deve existir ao menos um arquivo de mockup",
    ).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const file of mockupFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (!content.includes("aria-hidden")) {
        offenders.push(path.relative(SRC_DIR, file));
      }
    }
    expect(
      offenders,
      `A11Y-07 violation: mockup decorativo precisa de aria-hidden.\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
