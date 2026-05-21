import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";

/**
 * Phase 7 — Wave 0 (RED). Contrato de validação do JSON-LD.
 *
 * O módulo `@/components/seo/json-ld` AINDA NÃO EXISTE — o import dinâmico
 * abaixo vai falhar em runtime (RED esperado). Plan 07-02 cria o módulo
 * exportando `OrganizationJsonLd` e `WebPageJsonLd`.
 *
 * O specifier é montado em runtime (`MODULE` const) para não disparar a
 * análise estática do TypeScript — `npm run typecheck` precisa passar para
 * os outros plans da Phase 7, mas o teste deve continuar RED em runtime
 * (o módulo realmente não existe → o `import()` rejeita).
 *
 * Requisitos cobertos: SEO-05 (Organization), SEO-06 (WebPage).
 */

const MODULE = ["@/components", "seo", "json-ld"].join("/");

interface JsonLdModule {
  OrganizationJsonLd: ComponentType;
  WebPageJsonLd: ComponentType;
}

/** Extrai e parseia o JSON do <script type="application/ld+json"> renderizado. */
function parseJsonLd(container: HTMLElement): Record<string, unknown> {
  const script = container.querySelector(
    'script[type="application/ld+json"]',
  );
  expect(script, "script JSON-LD presente").not.toBeNull();
  return JSON.parse(script!.innerHTML) as Record<string, unknown>;
}

describe("JSON-LD — Organization (SEO-05)", () => {
  it("OrganizationJsonLd renderiza schema válido", async () => {
    const { OrganizationJsonLd } = (await import(
      /* @vite-ignore */ MODULE
    )) as JsonLdModule;
    const { container } = render(<OrganizationJsonLd />);
    const data = parseJsonLd(container);

    expect(data["@context"], "@context").toBe("https://schema.org");
    expect(data["@type"], "@type").toBe("Organization");
    expect(data.name, "name === Likro").toBe("Likro");
    expect(typeof data.url, "url é string").toBe("string");
    expect((data.url as string).length, "url não-vazia").toBeGreaterThan(0);
    expect(typeof data.logo, "logo é string").toBe("string");
    expect((data.logo as string).length, "logo não-vazia").toBeGreaterThan(0);
  });
});

describe("JSON-LD — WebPage (SEO-06)", () => {
  it("WebPageJsonLd renderiza schema válido", async () => {
    const { WebPageJsonLd } = (await import(
      /* @vite-ignore */ MODULE
    )) as JsonLdModule;
    const { container } = render(<WebPageJsonLd />);
    const data = parseJsonLd(container);

    expect(data["@type"], "@type === WebPage").toBe("WebPage");
    expect(typeof data.name, "name é string").toBe("string");
    expect(typeof data.url, "url é string").toBe("string");
    expect(data.inLanguage, "inLanguage === pt-BR").toBe("pt-BR");
  });
});
