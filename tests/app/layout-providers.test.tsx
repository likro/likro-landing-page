import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Structure assertions sobre src/app/layout.tsx (otimizado pós-Phase-3 redesign).
 *
 * Mudança: MotionConfigProvider foi REMOVIDO do root pra evitar carregar
 * motion/react no bundle inicial (Phase 3 redesign não usa motion.* em nenhum
 * componente do `/`; Phase 4 re-adiciona localmente onde precisar).
 */
describe("app/layout.tsx — provider tree order", () => {
  const layoutPath = path.resolve(__dirname, "../../src/app/layout.tsx");
  const source = fs.readFileSync(layoutPath, "utf-8");

  it("imports AnalyticsProvider + SmoothScrollProvider + Toaster", () => {
    expect(source).toMatch(/import\s*\{\s*AnalyticsProvider\s*\}/);
    expect(source).toMatch(/import\s*\{\s*SmoothScrollProvider\s*\}/);
    expect(source).toMatch(/import\s*\{\s*Toaster\s*\}/);
  });

  it("does NOT import MotionConfigProvider (removed pra otimizar TBT)", () => {
    expect(source).not.toMatch(/import\s*\{[^}]*MotionConfigProvider[^}]*\}/);
    expect(source).not.toMatch(/<MotionConfigProvider\b/);
  });

  it("nests providers in EXACT order: Analytics > SmoothScroll > children > Toaster", () => {
    const bodyMatch = source.match(/<body>([\s\S]+?)<\/body>/);
    expect(bodyMatch).not.toBeNull();
    const body = bodyMatch![1]!;
    const idxAnalytics = body.indexOf("<AnalyticsProvider>");
    const idxSmoothScroll = body.indexOf("<SmoothScrollProvider>");
    const idxToaster = body.indexOf("<Toaster");
    const idxClosingScroll = body.indexOf("</SmoothScrollProvider>");
    expect(idxAnalytics).toBeGreaterThanOrEqual(0);
    expect(idxSmoothScroll).toBeGreaterThan(idxAnalytics);
    expect(idxToaster).toBeGreaterThan(idxSmoothScroll);
    expect(idxToaster).toBeLessThan(idxClosingScroll);
  });

  it("html has lang='pt-BR' and inter.variable className", () => {
    expect(source).toMatch(/lang=["']pt-BR["']/);
    expect(source).toMatch(/className=\{inter\.variable\}/);
  });

  it("does NOT have 'use client' directive in root layout", () => {
    expect(source.startsWith('"use client"')).toBe(false);
    expect(source.startsWith("'use client'")).toBe(false);
  });

  it("metadata exports title.template, openGraph locale=pt_BR, twitter card, robots, manifest", () => {
    expect(source).toMatch(/template:\s*["']%s\s*·\s*Likro["']/);
    expect(source).toMatch(/locale:\s*["']pt_BR["']/);
    expect(source).toMatch(/card:\s*["']summary_large_image["']/);
    expect(source).toMatch(/manifest:\s*["']\/manifest\.webmanifest["']/);
  });

  it("viewport themeColor is #0a0a0b (surface-dark, NOT roxo)", () => {
    expect(source).toMatch(/themeColor:\s*["']#0a0a0b["']/);
  });
});
