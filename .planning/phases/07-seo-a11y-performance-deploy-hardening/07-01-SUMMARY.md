---
phase: 07-seo-a11y-performance-deploy-hardening
plan: 01
subsystem: testing
tags: [seo, a11y, deploy, tdd, test-suite]
dependency_graph:
  requires: []
  provides:
    - "tests/seo/* — contrato de validação SEO (metadata, JSON-LD, robots, semantic HTML)"
    - "tests/a11y/skip-link.test.tsx — contrato do skip-link A11Y-05"
    - "tests/layout/speed-insights.test.tsx — contrato de wiring DEPLOY-05"
    - "tests/mobile/device-tier-usage.test.ts — invariante de animação adaptativa MOBILE-01"
  affects:
    - "plans 07-02..07-07 implementam contra esta suíte (RED → GREEN)"
tech_stack:
  added: []
  patterns:
    - "Grep tests Node-puro via node:fs (padrão tests/brand-lock.test.ts) — cross-platform"
    - "Mock de next/font/google para importar metadata real de layout.tsx em vitest"
    - "Specifier de import montado em runtime para manter typecheck verde com RED em runtime"
key_files:
  created:
    - tests/seo/metadata.test.ts
    - tests/seo/json-ld.test.tsx
    - tests/seo/robots.test.ts
    - tests/seo/semantic-html.test.ts
    - tests/a11y/skip-link.test.tsx
    - tests/layout/speed-insights.test.tsx
    - tests/mobile/device-tier-usage.test.ts
  modified: []
decisions:
  - "json-ld test nomeado .tsx (não .ts) — contém JSX, exige plugin-react do vitest"
  - "skip-link e speed-insights testados grep-style (fs.readFileSync) em vez de render do RootLayout — render de <html>/<body> em jsdom é frágil; consistente com layout-providers.test.tsx"
metrics:
  duration: "~12min"
  completed: "2026-05-21"
  tasks: 2
  files: 7
---

# Phase 7 Plan 01: Suíte de Testes da Phase 7 (Wave 0) Summary

Criada a suíte de testes completa da Phase 7 — 7 arquivos cobrindo SEO, A11y e wiring de deploy — em estado RED para features ainda não implementadas e GREEN para invariantes já satisfeitos (verificação/lock).

## O Que Foi Feito

### Task 1 — Testes de SEO metadata + JSON-LD + robots (commit `ea15755`)

- `tests/seo/metadata.test.ts` — asserções de title (<60), description (<160, menciona "clínicas"), Open Graph (locale pt_BR, imagem 1200x630) e Twitter card.
- `tests/seo/json-ld.test.tsx` — render tests de `OrganizationJsonLd` / `WebPageJsonLd` parseando o `<script application/ld+json>`.
- `tests/seo/robots.test.ts` — verificação da discriminação `VERCEL_ENV` (production permite + sitemap; preview bloqueia `/`).

### Task 2 — HTML semântico + skip-link + speed-insights + device-tier (commit `eaa35e8`)

- `tests/seo/semantic-html.test.ts` — grep tests Node-puro: h1 único, ≤2 arquivos com `<h1` literal, `lang="pt-BR"`, zero `<div onClick>`, mockups com `aria-hidden`.
- `tests/a11y/skip-link.test.tsx` — contrato do skip-link "Pular para o conteúdo" → `#main-content`.
- `tests/layout/speed-insights.test.tsx` — contrato de import + render de `<SpeedInsights />`.
- `tests/mobile/device-tier-usage.test.ts` — invariante firme: zero `whileInView` literal em `src/sections/`.

## Estado RED / GREEN da Suíte

Suíte completa (`npm test -- --run tests/seo/ tests/a11y/ tests/layout/ tests/mobile/`): **7 arquivos, 20 testes — 13 GREEN, 7 RED**. Resultado esperado pelo plano.

### RED — feature ausente (será GREEN nos plans 07-02..07-07)

| Teste | Motivo do RED | Plan que resolve |
|-------|---------------|------------------|
| `metadata.test.ts` › twitter.images | `metadata.twitter.images` não existe no layout atual | 07-02 |
| `json-ld.test.tsx` › Organization | módulo `@/components/seo/json-ld` ainda não existe | 07-02 |
| `json-ld.test.tsx` › WebPage | módulo `@/components/seo/json-ld` ainda não existe | 07-02 |
| `skip-link.test.tsx` › link presente | skip-link ausente do layout | 07-03 |
| `skip-link.test.tsx` › main id | `<main>` sem `id="main-content"` | 07-03 |
| `speed-insights.test.tsx` › import | `SpeedInsights` não importado | 07-05 |
| `speed-insights.test.tsx` › render | `<SpeedInsights />` não montado | 07-05 |

Os 7 RED são por **feature ausente** (assert ou módulo não encontrado em runtime) — nenhum é erro de sintaxe ou import quebrado de dependência inexistente. `npm run typecheck` passa limpo.

### GREEN — verificação / lock (confirmam o que o RESEARCH apurou)

| Teste | Confirma |
|-------|----------|
| `robots.test.ts` (2) | `robots.ts` já discrimina `VERCEL_ENV` corretamente |
| `semantic-html.test.ts` (4) | h1 único, `lang="pt-BR"`, zero `<div onClick>`, mockups com `aria-hidden` — higiene já boa |
| `metadata.test.ts` (7) | title/description/OG já corretos no layout atual |

### Resultado do device-tier-usage test

**GREEN (verificação).** O invariante "zero `whileInView` em `src/sections/`" é satisfeito hoje — `grep` confirmou zero ocorrências de `whileInView` em qualquer `.tsx` de `src/sections/`. Toda animação de seção já passa por primitivas de `@/components/motion`. O teste é determinístico: RED apontaria o(s) arquivo(s) violador(es) caso uma seção introduzisse `whileInView` direto.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Mock de `next/font/google` em metadata.test.ts**
- **Found during:** Task 1
- **Issue:** Importar `{ metadata }` de `@/app/layout` falhava com `Inter is not a function` — `next/font/google` é uma API de build-time do Next que não roda no ambiente vitest. Isso é erro de import de dependência de runtime, o que o `<verification>` do plano proíbe explicitamente ("nunca por import quebrado de dependência inexistente").
- **Fix:** `vi.mock("next/font/google", ...)` com stub no-op + import dinâmico de `@/app/layout` após o mock. Pattern padrão Next.js + vitest.
- **Files modified:** tests/seo/metadata.test.ts
- **Commit:** `ea15755`

**2. [Rule 3 - Blocking] json-ld test renomeado para `.tsx`**
- **Found during:** Task 1
- **Issue:** O plano listava `tests/seo/json-ld.test.ts`, mas o teste renderiza componentes React (JSX). Arquivo `.ts` com JSX não é processado pelo `@vitejs/plugin-react`.
- **Fix:** Arquivo criado como `tests/seo/json-ld.test.tsx`. Coberto pelos globs `tests/seo/` do plano e do verifier.
- **Files modified:** tests/seo/json-ld.test.tsx
- **Commit:** `ea15755`

**3. [Rule 3 - Blocking] Import specifier do json-ld montado em runtime**
- **Found during:** Task 1 (descoberto no `npm run typecheck`)
- **Issue:** `import("@/components/seo/json-ld")` literal quebrava `npm run typecheck` (TS2307) — o módulo não existe ainda. O `<verification>` do plano exige typecheck verde para os outros plans da fase. `@ts-expect-error` viraria "unused directive" quando 07-02 criar o módulo.
- **Fix:** Specifier montado via `["@/components","seo","json-ld"].join("/")` + `/* @vite-ignore */` — escapa da análise estática do TS mas mantém RED em runtime (o `import()` rejeita porque o módulo realmente não existe).
- **Files modified:** tests/seo/json-ld.test.tsx
- **Commit:** `ea15755`

**4. [Rule 1 - Bug] `first` possibly undefined em metadata.test.ts**
- **Found during:** Task 1 (descoberto no `npm run typecheck`)
- **Issue:** Acesso `first.width` / `first.height` sem narrowing — TS18048.
- **Fix:** `first!.width` / `first!.height` após o `expect(first).toBeDefined()`.
- **Files modified:** tests/seo/metadata.test.ts
- **Commit:** `ea15755`

## Decisões de Implementação

- **skip-link e speed-insights testados grep-style** (`fs.readFileSync` do source do layout) em vez de renderizar `RootLayout` em jsdom. Renderizar `<html>`/`<body>` aninhados dispara warnings do RTL e exige mockar toda a árvore de providers — frágil. O projeto já testa `layout.tsx` assim (`tests/app/layout-providers.test.tsx`). Mantém RED determinístico por feature ausente.

## Deferred Issues

Nenhum.

## Self-Check: PASSED

Arquivos criados (todos verificados em disco):
- FOUND: tests/seo/metadata.test.ts
- FOUND: tests/seo/json-ld.test.tsx
- FOUND: tests/seo/robots.test.ts
- FOUND: tests/seo/semantic-html.test.ts
- FOUND: tests/a11y/skip-link.test.tsx
- FOUND: tests/layout/speed-insights.test.tsx
- FOUND: tests/mobile/device-tier-usage.test.ts

Commits (verificados via git log):
- FOUND: ea15755 — test(07-01): SEO metadata, JSON-LD, robots
- FOUND: eaa35e8 — test(07-01): semantic-html, skip-link, speed-insights, device-tier
