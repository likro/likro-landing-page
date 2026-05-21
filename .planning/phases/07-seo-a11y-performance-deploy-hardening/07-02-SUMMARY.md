---
phase: 07-seo-a11y-performance-deploy-hardening
plan: 02
subsystem: seo
tags: [seo, json-ld, structured-data, schema-dts, metadata, twitter-card]
dependency_graph:
  requires:
    - "tests/seo/* — contrato de validação SEO (do plan 07-01)"
  provides:
    - "src/components/seo/json-ld.tsx — OrganizationJsonLd + WebPageJsonLd tipados"
    - "src/components/seo/json-ld.tsx exporta const SITE — valores canônicos do site"
    - "JSON-LD injetado no <body> do layout — pronto para Rich Results Test"
  affects:
    - "07-04 pode reusar a const SITE para metadataBase / valores canônicos"
    - "07-06 (verificação humana) valida o Rich Results Test sobre este JSON-LD"
tech_stack:
  added:
    - "schema-dts@^2.0.0 — tipos TypeScript para JSON-LD schema.org"
  patterns:
    - "JSON-LD via Server Component + dangerouslySetInnerHTML (padrão oficial Next.js)"
    - "const SITE compartilhada para evitar drift entre json-ld.tsx e metadata"
key_files:
  created:
    - src/components/seo/json-ld.tsx
  modified:
    - package.json
    - package-lock.json
    - src/app/layout.tsx
decisions:
  - "sameAs omitido do Organization schema — perfis sociais não confirmados pelo Lenny; inventar URLs violaria o invariante de credibilidade do projeto"
  - "const SITE exportada de json-ld.tsx como fonte única dos valores canônicos (name/url/description) — evita drift com metadata de layout.tsx"
  - "twitter.images reusa /opengraph-image (1200×630) — sem gerar asset novo"
metrics:
  duration: "~8min"
  completed: "2026-05-21"
  tasks: 2
  files: 4
---

# Phase 7 Plan 02: SEO Estruturado — JSON-LD + Twitter Card Summary

Adicionada a camada de SEO estruturado da landing: `schema-dts` instalado, módulo `json-ld.tsx` com Organization + WebPage tipados e injetados no layout, e Twitter Card completado com imagem. A landing agora é legível por mecanismos de busca e validável no Google Rich Results Test.

## O Que Foi Feito

### Task 1 — Instalar schema-dts e criar módulo json-ld.tsx (commit `fa797df`)

- `npm install schema-dts@^2.0.0` — adicionado em `dependencies` (é dependência de tipos, mas o RESEARCH e o plano orientaram dependencies).
- `src/components/seo/json-ld.tsx` criado como Server Component puro (sem `"use client"`):
  - `OrganizationJsonLd` — `WithContext<Organization>` com `@context`, `@type: "Organization"`, `name: "Likro"`, `url`, `logo`, `description`. `sameAs` omitido de propósito com comentário explicando a decisão.
  - `WebPageJsonLd` — `WithContext<WebPage>` com `@type: "WebPage"`, `name`, `url`, `inLanguage: "pt-BR"`, `description`.
  - `const SITE` exportada — valores canônicos (name/title/url/logo/description) compartilhados pelos dois schemas, evitando drift com a metadata de `layout.tsx`.
- Verificação: `tests/seo/json-ld.test.tsx` GREEN (2 testes), `npm run typecheck` limpo.

### Task 2 — Montar JSON-LD no layout + completar Twitter Card (commit `c246244`)

- `src/app/layout.tsx`:
  - Import de `{ OrganizationJsonLd, WebPageJsonLd }` de `@/components/seo/json-ld`.
  - Ambos renderizados como primeiros filhos de `<body>`, antes dos providers (são `<script>`, não afetam layout visual).
  - `metadata.twitter.images` adicionado como `["/opengraph-image"]` — completa o Twitter Card `summary_large_image` (SEO-04) reusando a OG image 1200×630.
  - Comentário de auditoria adicionado em `description` confirmando title 49c / description 87c dentro dos limites SEO-01/02.
  - `metadataBase` não tocado (será tratado no 07-04, conforme o plano).
- Layout permanece Server Component (sem `"use client"`).
- Verificação: `tests/seo/metadata.test.ts` (6 testes) + `tests/seo/json-ld.test.tsx` (2 testes) GREEN, `npm run typecheck` e `npm run lint` passam.

## Estado dos Testes SEO

Suíte SEO de metadata + json-ld: **8 testes, todos GREEN**. Os 3 RED do plan 07-01 atribuídos ao 07-02 (`metadata.test.ts › twitter.images`, `json-ld.test.tsx › Organization`, `json-ld.test.tsx › WebPage`) foram convertidos para GREEN.

## Verificação Manual

`npm run build` concluiu com sucesso. O HTML estático gerado (`/.next/server/app/index.html`) contém os dois `<script type="application/ld+json">` (Organization + WebPage) renderizados no `<head>`/`<body>` — confirmado por grep no artefato de build. Rota `/` continua estática (○), First Load JS 158 kB.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Caminho do teste json-ld é `.tsx`, não `.ts`**
- **Found during:** Task 1
- **Issue:** O plano referencia `tests/seo/json-ld.test.ts`, mas o plan 07-01 já criou o arquivo como `tests/seo/json-ld.test.tsx` (contém JSX, exige `@vitejs/plugin-react`). O comando de verificação literal do plano falharia por arquivo inexistente.
- **Fix:** Usado `tests/seo/json-ld.test.tsx` nos comandos de teste. O arquivo está coberto pelos globs `tests/seo/` do plano e do verifier — diferença puramente de extensão, sem mudança de escopo.
- **Files modified:** nenhum (apenas ajuste do comando executado).
- **Commit:** n/a

## Deferred Issues

Nenhum. (Warning de lint pré-existente em `src/lib/analytics.ts:80` — `Unused eslint-disable directive` — é fora do escopo deste plano; não foi tocado.)

## Self-Check: PASSED

Arquivos (verificados em disco):
- FOUND: src/components/seo/json-ld.tsx
- FOUND: package.json (schema-dts em dependencies, linha 30)
- MODIFIED: src/app/layout.tsx (import + render JSON-LD + twitter.images)

Commits (verificados via git log):
- FOUND: fa797df — feat(07-02): add schema-dts JSON-LD components
- FOUND: c246244 — feat(07-02): mount JSON-LD in layout + complete Twitter Card
