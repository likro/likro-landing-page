import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Structure assertions sobre src/app/dev/page.tsx (FOUND-12).
 * Verifica invariantes do guard NODE_ENV:
 *  - import notFound from next/navigation
 *  - check process.env.NODE_ENV === 'production' chamando notFound()
 *  - é Server Component (sem "use client")
 */
describe("/dev route guard (FOUND-12)", () => {
  const devPath = path.resolve(__dirname, "../../src/app/dev/page.tsx");
  const source = fs.readFileSync(devPath, "utf-8");

  it("imports notFound from next/navigation", () => {
    expect(source).toMatch(/import\s*\{\s*notFound\s*\}\s*from\s*["']next\/navigation["']/);
  });

  it("checks process.env.NODE_ENV === 'production' and calls notFound()", () => {
    expect(source).toMatch(/process\.env\.NODE_ENV\s*===\s*["']production["']/);
    expect(source).toMatch(/notFound\(\)/);
  });

  it("is a Server Component (NO 'use client' directive)", () => {
    expect(source.startsWith('"use client"')).toBe(false);
    expect(source.startsWith("'use client'")).toBe(false);
  });
});
