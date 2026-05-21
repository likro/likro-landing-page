import type { Organization, WebPage, WithContext } from "schema-dts";

/**
 * SEO-05 / SEO-06: dados estruturados JSON-LD.
 *
 * Server Component puro (sem "use client"). Renderiza um <script
 * type="application/ld+json"> conforme o padrão oficial Next.js
 * (nextjs.org/docs/app/guides/json-ld).
 *
 * `dangerouslySetInnerHTML` aqui é seguro: o conteúdo é um objeto literal
 * estático, sem qualquer input de usuário — `JSON.stringify` de literal não
 * abre vetor de XSS (threat T-07-02, disposition: accept).
 */

/** Valores canônicos do site — espelham metadata em src/app/layout.tsx. */
export const SITE = {
  name: "Likro",
  title: "Likro · Operação comercial moderna para clínicas",
  url: "https://likro.com.br",
  logo: "https://likro.com.br/logos/likro-logo.png",
  description:
    "CRM, atendimento multicanal e automação com IA, feito para clínicas e estéticas brasileiras.",
} as const;

const orgSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: SITE.logo,
  description: SITE.description,
  // `sameAs` OMITIDO de propósito: os perfis Instagram/LinkedIn da Likro não
  // foram confirmados pelo Lenny. Inventar URLs viola o invariante de
  // credibilidade do projeto ("zero dados inventados") — threat T-07-03,
  // disposition: mitigate. Adicionar quando os perfis forem confirmados.
};

const webPageSchema: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: SITE.title,
  url: SITE.url,
  inLanguage: "pt-BR",
  description: SITE.description,
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}

export function WebPageJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
    />
  );
}
