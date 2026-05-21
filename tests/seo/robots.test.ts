import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";

/**
 * Phase 7 — Wave 0. Verificação do discriminador VERCEL_ENV em robots().
 *
 * Estado esperado: GREEN — robots.ts já discrimina produção vs preview.
 * Este é um teste de verificação (lock), não RED.
 *
 * Requisito coberto: SEO-11.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots() — discriminação VERCEL_ENV (SEO-11)", () => {
  it("VERCEL_ENV=production: permite indexação e expõe sitemap", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const result = robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const hasAllow = rules.some(
      (r) => r && (r as { allow?: unknown }).allow !== undefined,
    );
    const hasDisallowRoot = rules.some(
      (r) => r && (r as { disallow?: unknown }).disallow === "/",
    );

    expect(hasAllow, "produção tem regra allow").toBe(true);
    expect(hasDisallowRoot, "produção NÃO bloqueia /").toBe(false);
    expect(result.sitemap, "produção expõe sitemap").toBeDefined();
  });

  it("VERCEL_ENV=preview: bloqueia indexação inteira", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const result = robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const hasDisallowRoot = rules.some(
      (r) => r && (r as { disallow?: unknown }).disallow === "/",
    );

    expect(hasDisallowRoot, "preview bloqueia / inteira").toBe(true);
  });
});
