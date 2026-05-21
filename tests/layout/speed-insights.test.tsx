import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 7 — Wave 0 (RED). Contrato de wiring do Vercel Speed Insights.
 *
 * Estado esperado: RED — <SpeedInsights /> ainda não está no layout. Plan
 * 07-05 importa `{ SpeedInsights }` de `@vercel/speed-insights/next` e o
 * monta no <body> do RootLayout.
 *
 * `<SpeedInsights />` da Vercel é difícil de detectar por testid (não
 * renderiza marca observável). Assert grep-style sobre o source do layout —
 * consistente com tests/app/layout-providers.test.tsx.
 *
 * Requisito coberto: DEPLOY-05.
 */

const layoutSource = fs.readFileSync(
  path.resolve(__dirname, "../../src/app/layout.tsx"),
  "utf-8",
);

describe("speed-insights — wiring no layout (DEPLOY-05)", () => {
  it("layout importa SpeedInsights do pacote Vercel", () => {
    const hasImport = /import\s*\{[^}]*SpeedInsights[^}]*\}\s*from\s*["']@vercel\/speed-insights/.test(
      layoutSource,
    );
    expect(
      hasImport,
      "layout.tsx deve importar { SpeedInsights } de @vercel/speed-insights/next (DEPLOY-05)",
    ).toBe(true);
  });

  it("layout monta o componente <SpeedInsights /> na árvore", () => {
    expect(
      /<SpeedInsights\b/.test(layoutSource),
      "layout.tsx deve renderizar <SpeedInsights /> (DEPLOY-05)",
    ).toBe(true);
  });
});
