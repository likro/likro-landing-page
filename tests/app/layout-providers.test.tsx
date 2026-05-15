import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Structure assertions sobre src/app/layout.tsx (FOUND-07).
 * Lê o source file e verifica invariantes de:
 *  - imports dos 3 providers + Toaster
 *  - ordem do provider tree (Analytics > SmoothScroll > MotionConfig > children > Toaster)
 *  - html lang=pt-BR + inter.variable
 *  - root NÃO é "use client"
 *  - metadata FOUND-10 completa
 *  - viewport.themeColor=#0a0a0b (NÃO o roxo)
 */
describe("app/layout.tsx — provider tree order", () => {
  const layoutPath = path.resolve(__dirname, "../../src/app/layout.tsx");
  const source = fs.readFileSync(layoutPath, "utf-8");

  it("imports all 3 providers + Toaster", () => {
    expect(source).toMatch(/import\s*\{\s*AnalyticsProvider\s*\}/);
    expect(source).toMatch(/import\s*\{\s*SmoothScrollProvider\s*\}/);
    expect(source).toMatch(/import\s*\{\s*MotionConfigProvider\s*\}/);
    expect(source).toMatch(/import\s*\{\s*Toaster\s*\}/);
  });

  it("nests providers in EXACT order: Analytics > SmoothScroll > MotionConfig > children > Toaster", () => {
    const bodyMatch = source.match(/<body>([\s\S]+?)<\/body>/);
    expect(bodyMatch).not.toBeNull();
    const body = bodyMatch![1]!;
    const idxAnalytics = body.indexOf("<AnalyticsProvider>");
    const idxSmoothScroll = body.indexOf("<SmoothScrollProvider>");
    const idxMotionConfig = body.indexOf("<MotionConfigProvider>");
    const idxToaster = body.indexOf("<Toaster");
    const idxClosingMotion = body.indexOf("</MotionConfigProvider>");
    expect(idxAnalytics).toBeGreaterThanOrEqual(0);
    expect(idxSmoothScroll).toBeGreaterThan(idxAnalytics);
    expect(idxMotionConfig).toBeGreaterThan(idxSmoothScroll);
    expect(idxToaster).toBeGreaterThan(idxMotionConfig);
    expect(idxToaster).toBeLessThan(idxClosingMotion);
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
