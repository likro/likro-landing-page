---
phase: 01-foundations-design-system
plan: 01
subsystem: foundations
tags: [bootstrap, tailwind-v4, brand-tokens, vitest, next-15, seo]
requires: []
provides:
  - "Next.js 15.5 App Router scaffold operational (next dev / next build)"
  - "Tailwind v4 @theme com tokens completos do brand book Likro (accent restrito a primary/hover/glow)"
  - "Inter via next/font (3 weights) exposta como --font-inter ao @theme"
  - "cn() helper em @/lib/utils (FOUND-05) — clsx + tailwind-merge"
  - "Vitest 3.x configurado (jsdom + alias @ + postcss disabled em testes)"
  - "robots.ts dinâmico por VERCEL_ENV + sitemap.ts estático"
  - "Logos Likro disponíveis em public/logos/ pra Header/Footer downstream"
  - ".env.local.example documentando WhatsApp/GA4/Pixel/Clarity/Webhook"
  - "shadcn pronto pra add components em modo Tailwind v4 (components.json com tailwind.config blank)"
affects:
  - "Plans 01-02, 01-03, 01-04 consomem todos esses artifacts"
  - "Phase 2+ depende dos brand tokens existirem"
tech-stack-added:
  - "next@15.5.18 (App Router, TS strict, src dir, alias @/*)"
  - "react@19.2.6 + react-dom@19.2.6"
  - "tailwindcss@4.3.0 + @tailwindcss/postcss@4.3.0"
  - "motion@12.38.0 (animations)"
  - "lenis@1.3.23 (smooth scroll, deferred to Plan 02)"
  - "react-hook-form@7.75.0 + zod@3.23.0 + @hookform/resolvers@3.9.0"
  - "lucide-react@0.460.0 (pinned per orchestrator directive #3 — NOT 1.x)"
  - "clsx@2.1.0 + tailwind-merge@2.5.0"
  - "@next/third-parties@15.5.18"
  - "vitest@3.2.x + @testing-library/{react@16,jest-dom@6,user-event@14} + jsdom@25 + @vitejs/plugin-react@4"
  - "prettier@3 + prettier-plugin-tailwindcss@0.6"
  - "eslint-plugin-tailwindcss@3.18.3 (latest stable — v4 ainda em alpha/beta)"
patterns-introduced:
  - "Tailwind v4 brand-lock por absence (Pattern 1 do RESEARCH.md): tokens accent escala 50/100/.../900 NÃO declarados → bg-accent-N vira no-op silencioso"
  - "Root layout MÍNIMO Server Component (sem 'use client'); providers entram em Plan 04"
  - "robots.ts gating por VERCEL_ENV: previews/dev nunca indexáveis"
  - "Vitest com css.postcss.plugins=[] pra contornar incompatibilidade @tailwindcss/postcss em ambiente de teste"
key-files-created:
  - path: "package.json"
    purpose: "Deps pinadas conforme STACK.md (com ajustes de versão documentados em Deviations)"
  - path: "tsconfig.json"
    purpose: "strict + noUncheckedIndexedAccess + paths @/* → ./src/*"
  - path: "vitest.config.ts"
    purpose: "jsdom + alias @ → ./src + postcss disabled + setupFiles tests/setup.ts"
  - path: "tests/setup.ts"
    purpose: "Import jest-dom matchers"
  - path: "tests/lib/utils.test.ts"
    purpose: "TDD green: 3 cases for cn() (merge, dedupe, empty)"
  - path: "src/lib/utils.ts"
    purpose: "cn(...inputs) — clsx + twMerge helper"
  - path: "src/app/globals.css"
    purpose: "@theme block with full Likro brand token set + body baseline + prefers-reduced-motion guard"
  - path: "src/app/layout.tsx"
    purpose: "RSC root layout, lang=pt-BR, Inter (400/500/700, swap, --font-inter), viewport themeColor=#0a0a0b"
  - path: "src/app/page.tsx"
    purpose: "Placeholder homepage usando brand tokens — substituída em Phase 3"
  - path: "src/app/robots.ts"
    purpose: "Dynamic robots por VERCEL_ENV (FOUND-11)"
  - path: "src/app/sitemap.ts"
    purpose: "Static sitemap pra https://likro.com.br (FOUND-11)"
  - path: "components.json"
    purpose: "shadcn config: tailwind.config blank (modo Tailwind v4), iconLibrary=lucide, RSC=true, baseColor=neutral"
  - path: ".env.local.example"
    purpose: "Template: NEXT_PUBLIC_WA_NUMBER, GA4_ID, META_PIXEL_ID, CLARITY_ID, LEAD_WEBHOOK_URL"
  - path: ".prettierrc"
    purpose: "Prettier + prettier-plugin-tailwindcss; printWidth 100; trailingComma all"
  - path: "public/logos/likro-logo.svg"
    purpose: "Logo SVG copiada de ../logos_likro/ — pronta pra Header/Footer"
  - path: "public/logos/likro-logo.png"
    purpose: "Logo PNG 2000x2000 — fallback raster / og:image source"
key-decisions:
  - "vitest bumpado de ^1.6.0 (pedido pelo plan) para ^3.2.0 pra alinhar Vite com @vitejs/plugin-react@4 e resolver erro de tipos duplicados (Vite vendored em vitest@1)."
  - "eslint-plugin-tailwindcss pinned em ^3.18.0 — v4 não tem release estável (apenas alpha/beta)."
  - "Vitest css.postcss.plugins=[] adicionado pra contornar Tailwind v4 PostCSS plugin não ser carregável fora de Next build."
  - "scaffold de Next 15.5 com flag --turbopack (CLI atual usa --turbopack ao invés de --no-turbopack=false)."
  - "Assets default do scaffold (file.svg, globe.svg, next.svg, vercel.svg, window.svg, favicon.ico) removidos — não fazem parte do brand book; favicon real entra em Plan 04 (FOUND-10)."
metrics:
  tasks-completed: 3
  duration: "~10min (inclui npm install + bump de vitest)"
  completed-date: "2026-05-15"
---

# Phase 1 Plan 1: Foundations Bootstrap Summary

Bootstrap completo do repositório Next.js 15.5 + Tailwind v4 com brand tokens Likro codificados em `@theme`, Inter carregada via `next/font` (3 pesos), Vitest 3.x rodando, robots/sitemap dinâmicos por `VERCEL_ENV`, e logos Likro prontos em `public/logos/`. A fundação física pra todas as outras plans.

## What Shipped

### Task 1 — Scaffold + Deps + Vitest (commit `1eec2a2`)

- `create-next-app@15.5` em diretório temporário (workaround para `.planning/` + `CLAUDE.md` já presentes no worktree), conteúdo movido pra raiz.
- Deps de runtime pinadas: `motion 12.38.0`, `lenis 1.3.23`, `react-hook-form 7.75.0`, `zod 3.23.0`, `@hookform/resolvers 3.9.0`, `clsx 2.1.0`, `tailwind-merge 2.5.0`, `lucide-react 0.460.0` (NÃO 1.x), `@next/third-parties 15.5.18`.
- Deps de dev pinadas: `vitest 3.2.x`, `@testing-library/react 16`, `@testing-library/jest-dom 6`, `@testing-library/user-event 14`, `jsdom 25`, `@vitejs/plugin-react 4`, `prettier 3` + plugin tailwindcss, `eslint-plugin-tailwindcss 3.18`.
- `tsconfig.json` com `strict: true` + `noUncheckedIndexedAccess: true` + `paths: { @/*: ./src/* }`.
- `vitest.config.ts` com `jsdom` + alias `@` + `css.postcss.plugins=[]` + `setupFiles` + `@vitejs/plugin-react`.
- `tests/lib/utils.test.ts` com 3 casos de `cn()` — TDD: red → green ao criar `src/lib/utils.ts`. Roda em ~10ms.
- `components.json` em modo Tailwind v4 (`tailwind.config: ""`).
- `.env.local.example` com 5 vars documentadas.
- `.prettierrc` + scripts npm (`test`, `test:watch`, `typecheck`).

### Task 2 — Brand tokens + Inter + Layout (commit `8f42160`)

- `src/app/globals.css` completamente substituído: `@theme` declarando 14 tokens accent/surface/text/border + 10 neutrals (stone calibrado) + `--font-sans: var(--font-inter)` + radii 10/12px + premium easings.
- Body baseline aplicada (surface-light, text-primary, antialiased, optimizeLegibility).
- `@media (prefers-reduced-motion: reduce)` global desligando transitions/animations (D-04).
- `src/app/layout.tsx`: Server Component, `lang="pt-BR"`, Inter (weights 400/500/700, swap, `adjustFontFallback`, variable `--font-inter`), metadata stub (Plan 04 expande), viewport `themeColor: "#0a0a0b"` + `colorScheme: "light dark"`.
- `src/app/page.tsx`: placeholder mínimo usando classes do brand book.
- `npm run build` ✅ — 8.2s, gera CSS contendo `--color-accent-primary:#7c3aed` e ZERO tokens `accent-50..900` (brand-lock por absence).

### Task 3 — Robots + Sitemap + Logos (commit `93472a3`)

- `src/app/robots.ts`: retorna `allow:/` + sitemap quando `VERCEL_ENV === "production"`, senão `disallow:/` sem sitemap. Protege previews/dev de indexação.
- `src/app/sitemap.ts`: entrada única para `https://likro.com.br`, weekly, priority 1.
- Logos copiados de `C:\Users\lenny\Desktop\Likro\logos_likro\`:
  - `LIKRO LOGO.svg` → `public/logos/likro-logo.svg`
  - `logolikro_2000x2000.png` → `public/logos/likro-logo.png`
- Build verificado: `/robots.txt` body é `User-Agent: *\nDisallow: /` (correto pra non-prod).

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Typecheck strict | `npx tsc --noEmit` | ✅ 0 errors |
| Unit tests | `npx vitest run` | ✅ 3/3 passed |
| Production build | `npm run build` | ✅ 7 static routes generated |
| Brand-lock (absence) | `grep accent-50..900 .next/static/css/*.css` | ✅ no matches |
| `bg-accent-primary` exists | grep | ✅ `#7c3aed` |
| `bg-surface-dark` exists | grep | ✅ `#0a0a0b` |
| robots non-prod | inspect `.next/server/app/robots.txt.body` | ✅ `Disallow: /` |
| postcss.config.mjs uses `@tailwindcss/postcss` | inspect file | ✅ confirmed |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocker] `eslint-plugin-tailwindcss@^4.0.0` não existe estável**
- Found during: Task 1 (npm install)
- Issue: Plan pediu `^4.0.0` mas npm registry só tem `4.0.0-alpha.0..beta.0`. Última stable é `3.18.3`.
- Fix: Pinned `^3.18.0`. Funcionalidade equivalente; v4 ainda em pre-release.
- Commit: `1eec2a2`

**2. [Rule 3 — Blocker] `vitest@^1.6.0` causa erro de tipos por Vite duplicado**
- Found during: Task 1 (npx tsc --noEmit pós-install)
- Issue: `vitest@1.x` vendora Vite mais antigo; `@vitejs/plugin-react@^4.3.0` exporta Plugin tipado com Vite mais novo. tsc falha com "Plugin not assignable" entre as duas cópias.
- Fix: Bumpei `vitest` para `^3.2.0` (3.2.4 instalado). Vitest 3 usa Vite atual, deduplica corretamente. Tests passam em 1.4s.
- Commit: `1eec2a2`

**3. [Rule 1 — Bug] Vitest carrega PostCSS config no test runner e quebra com Tailwind v4 plugin**
- Found during: Task 1 (primeira execução de vitest)
- Issue: `@tailwindcss/postcss` exporta plugin async/object incompatível com vite-postcss-loader fora de Next build. Erro: "Invalid PostCSS Plugin found at: plugins[0]".
- Fix: Adicionei `css: { postcss: { plugins: [] } }` no `vitest.config.ts` — testes unitários de `cn()` não precisam processar CSS de qualquer forma. Plan 03 que adicionar testes de componente com classes pode reavaliar.
- Commit: `1eec2a2`

**4. [Rule 2 — Critical functionality] `.env.local.example` precisava ser tracked pelo git mas `.env*` default ignora tudo**
- Found during: Task 1 (git add)
- Issue: `.gitignore` gerado pelo scaffold ignora `.env*` completamente — bloqueia commit do `.env.local.example`.
- Fix: Adicionei exceções `!.env.local.example` e `!.env.example` ao `.gitignore`.
- Commit: `1eec2a2`

**5. [Rule 2 — Hygiene] Default scaffold assets removidos**
- Found during: Task 3 (git status pós-build)
- Issue: `create-next-app` gera `public/{file,globe,next,vercel,window}.svg` + `src/app/favicon.ico` default. Não fazem parte do brand book; manter polui o repo.
- Fix: Deletei os 5 SVGs + favicon. Favicon real entra em Plan 04 (FOUND-10).
- Commit: untracked deletes embedded no Task 3 commit (`93472a3`); arquivos nunca foram staged.

### Non-deviations (intentional plan-following)

- `--no-turbopack=false` ajustado pra `--turbopack` (sintaxe atual do CLI Next 15.5 — plan tinha legado).
- `postcss.config.mjs` gerado pelo CLI já usa `@tailwindcss/postcss` — confirmado, nenhum override necessário.
- Logos foram copiados com sucesso (não foi necessário deixar TODO no SUMMARY).

## Threat Flags

None new — implementação segue threat register original do plan (T-01-01..04 mitigated).

## Requirements Covered

- FOUND-01 — Next.js 15.5 + TS strict + ESLint/Prettier ✅
- FOUND-02 — Tailwind v4 @theme block com brand tokens ✅
- FOUND-04 — Inter via next/font (3 weights, swap, variable) ✅
- FOUND-05 — `cn()` helper testado (3 casos passing) ✅
- FOUND-11 — robots.ts + sitemap.ts dinâmicos ✅

## Notes for Downstream

- **Plan 01-02** (smooth scroll Lenis): `lenis@1.3.23` já está em deps; importar de `lenis/react` (o pacote moderno, NÃO `@studio-freight/*`).
- **Plan 01-03** (lib/env, brand-lock test): `process.env.VERCEL_ENV` já é consumido em `robots.ts`; usar mesmo padrão. Para o brand-lock test sugerido (`tests/brand-lock.test.ts`), pode-se rodar grep sobre `src/**/*.tsx` procurando `bg-accent-\d+0+`.
- **Plan 01-04** (providers + metadata FOUND-10): atual `layout.tsx` é mínimo intencionalmente; substituir metadata stub por bloco completo (OG, twitter, manifest). Inserir `AnalyticsProvider > LenisProvider > children` em torno de `{children}`.
- **shadcn**: rodar `npx shadcn@latest add button` quando precisar — components.json já está configurado em modo Tailwind v4.

## Self-Check: PASSED

- FOUND: package.json (commit 1eec2a2)
- FOUND: tsconfig.json (commit 1eec2a2)
- FOUND: vitest.config.ts (commit 1eec2a2)
- FOUND: tests/lib/utils.test.ts (commit 1eec2a2)
- FOUND: src/lib/utils.ts (commit 1eec2a2)
- FOUND: components.json (commit 1eec2a2)
- FOUND: .env.local.example (commit 1eec2a2)
- FOUND: .prettierrc (commit 1eec2a2)
- FOUND: src/app/globals.css (commit 8f42160)
- FOUND: src/app/layout.tsx (commit 8f42160)
- FOUND: src/app/page.tsx (commit 8f42160)
- FOUND: src/app/robots.ts (commit 93472a3)
- FOUND: src/app/sitemap.ts (commit 93472a3)
- FOUND: public/logos/likro-logo.svg (commit 93472a3)
- FOUND: public/logos/likro-logo.png (commit 93472a3)
- FOUND commit 1eec2a2: `git log --oneline | grep 1eec2a2` ✅
- FOUND commit 8f42160: `git log --oneline | grep 8f42160` ✅
- FOUND commit 93472a3: `git log --oneline | grep 93472a3` ✅
