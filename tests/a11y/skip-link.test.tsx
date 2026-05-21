import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 7 — Wave 0 (RED). Contrato do skip-link de acessibilidade.
 *
 * Estado esperado: RED — o skip-link ainda não existe no layout. Plan 07-03
 * adiciona um <a href="#main-content"> "Pular para o conteúdo" como primeiro
 * elemento focável do <body>, e marca o <main> com id="main-content".
 *
 * Abordagem grep-style sobre o source do layout: renderizar o RootLayout
 * inteiro em jsdom produz <html>/<body> aninhados (warning do RTL) e exige
 * mockar next/font + toda a árvore de providers — frágil. O projeto já testa
 * layout.tsx via fs.readFileSync (ver tests/app/layout-providers.test.tsx);
 * seguimos o mesmo padrão para um RED determinístico por feature ausente.
 *
 * Requisito coberto: A11Y-05.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const layoutSource = fs.readFileSync(
  path.resolve(SRC_DIR, "app/layout.tsx"),
  "utf-8",
);
const pageSource = fs.readFileSync(
  path.resolve(SRC_DIR, "app/page.tsx"),
  "utf-8",
);

describe("skip-link — navegação por teclado (A11Y-05)", () => {
  it("layout contém um link 'Pular para o conteúdo' apontando para #main-content", () => {
    const hasText = /pular para o conte[úu]do/i.test(layoutSource);
    const hasHref = /href=["']#main-content["']/.test(layoutSource);
    expect(
      hasText,
      "layout.tsx deve renderizar o texto 'Pular para o conteúdo' (A11Y-05)",
    ).toBe(true);
    expect(
      hasHref,
      "layout.tsx deve ter um <a href=\"#main-content\"> (A11Y-05)",
    ).toBe(true);
  });

  it("o <main> da página tem id=\"main-content\" como alvo do skip-link", () => {
    const layoutHasMainId = /<main[^>]*id=["']main-content["']/.test(
      layoutSource,
    );
    const pageHasMainId = /<main[^>]*id=["']main-content["']/.test(pageSource);
    expect(
      layoutHasMainId || pageHasMainId,
      "o <main> precisa de id=\"main-content\" (layout ou page) (A11Y-05)",
    ).toBe(true);
  });
});
