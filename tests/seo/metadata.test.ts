import { describe, expect, it, vi } from "vitest";

/**
 * Phase 7 — Wave 0 (RED). Contrato de validação de SEO metadata.
 *
 * Estado esperado deste arquivo na criação:
 *   - title / description / openGraph: GREEN (layout já tem hoje).
 *   - twitter.images: RED (campo ausente no twitter atual; plan 07-02 adiciona).
 *
 * Requisitos cobertos: SEO-01, SEO-02, SEO-03, SEO-04.
 *
 * `next/font/google` não roda no ambiente vitest (Inter() é uma função de
 * build-time do Next). Mockamos com um stub no-op — pattern padrão
 * Next.js + vitest — para conseguir importar a constante `metadata` real
 * de layout.tsx. Sem o mock, o import falharia por dependência de runtime
 * ausente, violando o contrato de "RED por feature ausente, não por import".
 */
vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "font-inter",
    variable: "--font-inter",
    style: { fontFamily: "Inter" },
  }),
}));

// Import dinâmico após o mock de next/font/google estar registrado.
const { metadata } = await import("@/app/layout");

describe("SEO metadata — title + description (SEO-01, SEO-02)", () => {
  it("metadata.title.default é string com length < 60 (SEO-01)", () => {
    const title = metadata.title;
    expect(title, "metadata.title presente").toBeDefined();
    // title é objeto { default, template }
    const def = (title as { default?: unknown }).default;
    expect(typeof def, "title.default é string").toBe("string");
    expect((def as string).length, "title.default length < 60").toBeLessThan(60);
  });

  it("metadata.description é string < 160 chars e menciona 'clínicas' (SEO-02)", () => {
    const desc = metadata.description;
    expect(typeof desc, "description é string").toBe("string");
    expect((desc as string).length, "description length < 160").toBeLessThan(160);
    expect(
      /cl[ií]nicas/i.test(desc as string),
      "description menciona 'clínicas'",
    ).toBe(true);
  });
});

describe("SEO metadata — Open Graph (SEO-03)", () => {
  it("openGraph tem type, locale pt_BR, url, siteName, title, description", () => {
    const og = metadata.openGraph;
    expect(og, "openGraph presente").toBeDefined();
    const ogObj = og as Record<string, unknown>;
    expect(ogObj.type, "og.type presente").toBeDefined();
    expect(ogObj.locale, "og.locale === pt_BR").toBe("pt_BR");
    expect(ogObj.url, "og.url presente").toBeDefined();
    expect(ogObj.siteName, "og.siteName presente").toBeDefined();
    expect(ogObj.title, "og.title presente").toBeDefined();
    expect(ogObj.description, "og.description presente").toBeDefined();
  });

  it("openGraph.images tem um item 1200x630", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    const images = og.images;
    expect(Array.isArray(images), "og.images é array").toBe(true);
    const first = (images as Array<Record<string, unknown>>)[0];
    expect(first, "og.images[0] presente").toBeDefined();
    expect(first!.width, "og.images[0].width === 1200").toBe(1200);
    expect(first!.height, "og.images[0].height === 630").toBe(630);
  });
});

describe("SEO metadata — Twitter card (SEO-04)", () => {
  it("twitter.card === 'summary_large_image'", () => {
    const tw = metadata.twitter as Record<string, unknown>;
    expect(tw, "twitter presente").toBeDefined();
    expect(tw.card, "twitter.card === summary_large_image").toBe(
      "summary_large_image",
    );
  });

  it("twitter.images está definido (RED — ausente até plan 07-02)", () => {
    const tw = metadata.twitter as Record<string, unknown>;
    expect(
      tw.images,
      "twitter.images deve estar definido (SEO-04)",
    ).toBeDefined();
  });
});
