---
phase: 07-seo-a11y-performance-deploy-hardening
plan: 04
subsystem: seo
tags: [seo, robots, sitemap, opengraph, vercel-env, x-robots-tag, metadata]
dependency_graph:
  requires:
    - "tests/seo/robots.test.ts — contrato VERCEL_ENV (do plan 07-01)"
    - "tests/seo/metadata.test.ts — contrato de metadata (do plan 07-01)"
    - "src/app/layout.tsx — skip-link (07-03) e JSON-LD (07-02) preservados"
  provides:
    - "src/lib/site-url.ts — getSiteUrl(): ponto único de verdade da URL absoluta"
    - "next.config.ts — nextConfig const nomeada com headers() X-Robots-Tag"
    - "src/app/opengraph-image.tsx — OG image 1200×630 polida"
  affects:
    - "07-05 (wave 5) envolve nextConfig com withBundleAnalyzer — const nomeada deixa drop-in"
    - "07-06 (HUMAN-UAT) valida curl -I X-Robots-Tag em preview + OG preview real WhatsApp/LinkedIn"
tech_stack:
  added: []
  patterns:
    - "getSiteUrl() deriva URL de VERCEL_ENV/VERCEL_URL — resolve Pitfall 5 (OG quebrada em .vercel.app)"
    - "X-Robots-Tag via next.config headers() — defesa em profundidade sobre robots.txt"
    - "nextConfig exportada como const nomeada para wrapper drop-in (07-05)"
key_files:
  created:
    - src/lib/site-url.ts
  modified:
    - next.config.ts
    - src/app/robots.ts
    - src/app/sitemap.ts
    - src/app/layout.tsx
    - src/app/opengraph-image.tsx
decisions:
  - "OG image: composição editorial alinhada à esquerda (eyebrow + marca + tagline + filete roxo) em vez de centralizada genérica — leitura mais premium e hierarquia clara"
  - "Brilho radial roxo #7C3AED em baixa opacidade só no canto superior direito — destaque pontual, roxo nunca domina o fundo (brand book)"
  - "SEO-09 (alt de imagens) tem escopo nulo no código atual — site usa zero next/image; única imagem é a OG, que já tem export const alt"
  - "getSiteUrl() retorna domínio fixo https://likro.com.br em produção — quando o DNS resolver, fica correto sem mudança de código"
metrics:
  duration: "~10min"
  completed: "2026-05-21"
  tasks: 2
  files: 6
---

# Phase 7 Plan 04: Hardening de Descoberta — X-Robots-Tag + URLs Dinâmicas + OG Polish Summary

Endurecida a camada de descoberta da landing: header HTTP `X-Robots-Tag: noindex, nofollow` em todo deploy não-produção (defesa em profundidade sobre o `robots.txt`), URL base dinâmica via `getSiteUrl()` para que OG image, sitemap e robots funcionem em `.vercel.app` antes do DNS, e polish editorial da OG image.

## O Que Foi Feito

### Task 1 — Helper site-url + X-Robots-Tag header + URLs dinâmicas (commit `d9d99c6`)

- `src/lib/site-url.ts` criado — `getSiteUrl(): string` como ponto único de verdade da URL absoluta. Ordem: `VERCEL_ENV === "production"` → `https://likro.com.br` (domínio final fixo); senão `VERCEL_URL` definida → `https://${VERCEL_URL}` (preview/branch atual); fallback dev → `http://localhost:3000`. Comentário documenta a resolução do Pitfall 5.
- `next.config.ts`: adicionada a função `headers()` async — `X-Robots-Tag: noindex, nofollow` em `source: "/:path*"` para todo deploy onde `VERCEL_ENV !== "production"`; produção retorna `[]`. `nextConfig` mantido como const nomeada exportada, drop-in para o wrapper `withBundleAnalyzer` do 07-05.
- `src/app/robots.ts`: `https://likro.com.br/sitemap.xml` hardcoded substituído por `` `${getSiteUrl()}/sitemap.xml` ``. A lógica `isProd` existente (com fallback `VERCEL_ENV undefined + NODE_ENV production`, WR-05) preservada sem regressão.
- `src/app/sitemap.ts`: `https://likro.com.br` hardcoded substituído por `getSiteUrl()`.
- Verificação: `tests/seo/robots.test.ts` GREEN (2 testes), `npm run typecheck` limpo, `npm run build` OK.

### Task 2 — metadataBase dinâmico + polish da OG image (commit `4dabd5c`)

- `src/app/layout.tsx`: `metadataBase: new URL("https://likro.com.br")` → `metadataBase: new URL(getSiteUrl())`, importando de `@/lib/site-url`. Garante que `images: [{ url: "/opengraph-image" }]` resolva para a URL `.vercel.app` ativa durante a v1. Resto da metadata (auditada no 07-02), o skip-link (07-03) e o JSON-LD (07-02) preservados intactos.
- `src/app/opengraph-image.tsx`: polish elevando o acabamento visual. Mantidos 1200×630 e `runtime = "edge"`. Composição editorial alinhada à esquerda: eyebrow "PLATAFORMA DE OPERAÇÃO COMERCIAL" + marca "Likro" 148px peso 700 + tagline "CRM e atendimento para clínicas e estéticas" + filete de destaque roxo na base. Fundo escuro `#0a0a0b` com brilho radial roxo `#7C3AED` sutil no canto superior direito (destaque pontual, brand book respeitado). Contraste do texto sobre o fundo escuro garantido. `alt` atualizado para "Likro · CRM e atendimento para clínicas e estéticas".
- Verificação: `tests/seo/metadata.test.ts` GREEN (6 testes, sem regressão), `npm run typecheck` limpo, `npm run build` OK.

## SEO-09 — Escopo Nulo (documentado conforme o plano)

O RESEARCH apurou que a landing usa **zero `next/image`** — não existem imagens informativas no código atual para receber `alt`. A única imagem é a OG image, que já expõe `export const alt`. SEO-09 (alt text de imagens) tem portanto **escopo nulo no código atual** — nenhum manifesto de imagens foi inventado. Se o Lenny entregar prints reais do produto depois, isso vira pendência registrada para um plano futuro.

## Verificação Manual (HUMAN-UAT 07-06)

Pendente de validação humana no 07-06:
- `curl -I` numa preview `.vercel.app` deve confirmar `X-Robots-Tag: noindex, nofollow` no header HTTP.
- OG preview real no WhatsApp / LinkedIn + validador de OG da Meta (Sharing Debugger).

## Deviations from Plan

None - plano executado exatamente como escrito.

## Deferred Issues

Nenhum. (Warning de lint pré-existente em `src/lib/analytics.ts:80` — `Unused eslint-disable directive` — fora do escopo deste plano; já documentado nos SUMMARYs 07-02/07-03.)

## Self-Check: PASSED

Arquivos (verificados em disco):
- FOUND: src/lib/site-url.ts
- MODIFIED: next.config.ts (headers() X-Robots-Tag)
- MODIFIED: src/app/robots.ts (getSiteUrl no sitemap)
- MODIFIED: src/app/sitemap.ts (getSiteUrl na url)
- MODIFIED: src/app/layout.tsx (metadataBase dinâmico; skip-link + JSON-LD preservados)
- MODIFIED: src/app/opengraph-image.tsx (OG polida)

Commits (verificados via git log):
- FOUND: d9d99c6 — feat(07-04): add site-url helper, X-Robots-Tag header, dynamic SEO URLs
- FOUND: 4dabd5c — feat(07-04): dynamic metadataBase and polished OG image

Testes: `tests/seo/robots.test.ts` (2) + `tests/seo/metadata.test.ts` (6) — 8/8 GREEN. `npm run typecheck` limpo, `npm run build` OK.
