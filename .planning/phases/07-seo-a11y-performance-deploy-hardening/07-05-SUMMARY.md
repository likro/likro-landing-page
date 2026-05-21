---
phase: 07-seo-a11y-performance-deploy-hardening
plan: 05
subsystem: performance
tags: [performance, speed-insights, bundle-analyzer, code-splitting, cwv, perf-09, deploy]
dependency_graph:
  requires:
    - "tests/layout/speed-insights.test.tsx — contrato de wiring do SpeedInsights (do plan 07-01)"
    - "next.config.ts — nextConfig const nomeada com headers() X-Robots-Tag (do plan 07-04)"
    - "src/app/layout.tsx — provider tree, skip-link, JSON-LD preservados (07-02/07-03/07-04)"
  provides:
    - "src/app/layout.tsx — <SpeedInsights /> montado no body (CWV contínuo em produção)"
    - "next.config.ts — withBundleAnalyzer wrapper gated por ANALYZE env"
    - "src/sections/Form/index.tsx — LeadForm code-split via next/dynamic ssr:true"
    - "src/hooks/use-device-tier.ts — degradação por navigator.connection (PERF-09)"
  affects:
    - "07-06 (HUMAN-UAT) mede Lighthouse/LCP/CLS/INP/peso em preview real; baseline de bundle aqui é o ponto de partida"
tech_stack:
  added:
    - "@vercel/speed-insights@^2.0.0 (deps) — coleta anônima de Core Web Vitals na Vercel"
    - "@next/bundle-analyzer@^16 (devDeps) — treemap de bundle, gate de medição PERF-05"
  patterns:
    - "withBundleAnalyzer envolve nextConfig, ativo só sob ANALYZE=true — zero impacto no build de produção"
    - "next/dynamic ssr:true para code-split de ilha client pesada below-fold sem perder SEO"
    - "navigator.connection lido via optional chaining — progressive enhancement com fallback no-op"
key_files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - next.config.ts
    - src/app/layout.tsx
    - src/sections/Form/index.tsx
    - src/hooks/use-device-tier.ts
decisions:
  - "@next/bundle-analyzer ficou em major 16 — build com Next 15.5 passou sem erro, então não houve necessidade de fixar @^15 (Pitfall 2 não disparou)"
  - "speed-insights e bundle-analyzer instalados com --legacy-peer-deps — speed-insights puxa peerOptionals de SvelteKit que conflitam com a versão do Vite; conflito é falso (projeto é Next.js, peers Svelte não usados)"
  - "LeadForm via next/dynamic é code-splitting (chunk separado, melhora TBT/INP na hidratação), NÃO redução de First Load JS — a rota / é prerenderizada e o chunk ainda conta no número; ganho honesto é splitting, não bundle shrink (Pitfall 1 confirmado)"
  - "PERF-09 só beneficia Android Chrome; Safari/iOS (browser dominante do tráfego) não tem navigator.connection — coberto por useDeviceTier breakpoints + prefers-reduced-motion"
metrics:
  duration: "~12min"
  completed: "2026-05-21"
  tasks: 2
  files: 6
---

# Phase 7 Plan 05: Hardening de Performance — Speed Insights + Bundle Analyzer + PERF-07/09 Summary

Fechado o stream de Performance + infra de medição: Vercel Speed Insights montado para coleta contínua de Core Web Vitals em produção, `@next/bundle-analyzer` instalado como instrumento do gate de bundle, auditoria de bundle/CLS/lazy-load registrada, e PERF-09 (degradação por conexão lenta) implementado como progressive enhancement com fallback no-op no Safari.

## O Que Foi Feito

### Task 1 — Instalar e ligar Speed Insights + bundle-analyzer (commit `c872171`)

- `npm install @vercel/speed-insights@^2.0.0` (deps) e `npm install -D @next/bundle-analyzer` (devDeps). Ambos exigiram `--legacy-peer-deps`: o `@vercel/speed-insights` declara `peerOptional` de plugins SvelteKit que, transitivamente, conflitam com a versão do Vite resolvida pelo Vitest. O conflito é **falso** — este é um projeto Next.js, os peers Svelte nunca são carregados. (Rule 3 — blocking issue de instalação resolvido inline.)
- `@next/bundle-analyzer` instalou em **major 16** (`^16.2.6`). O Pitfall 2 do RESEARCH previa fixar `@^15` caso o build quebrasse com Next 15.5 — **não foi necessário**: `npm run build` passou limpo com a v16.
- `src/app/layout.tsx`: importado `{ SpeedInsights }` de `@vercel/speed-insights/next` e renderizado `<SpeedInsights />` no `<body>`, **fora** dos providers (não re-renderiza no scroll do Lenis). Layout permanece Server Component.
- `next.config.ts`: o `nextConfig` (que já contém `headers()` X-Robots-Tag do 07-04) foi envolvido por `withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })`. A função `headers()` foi **preservada intacta**. Export final: `analyze(nextConfig)`.
- Verificação: `tests/layout/speed-insights.test.tsx` GREEN (2 testes), `npm run typecheck` limpo, `npm run build` OK.

### Task 2 — Auditoria de performance: bundle, CLS, lazy-load, PERF-09 (commit `17db51b`)

- **PERF-07 (lazy-load):** `src/sections/Form/index.tsx` passou a carregar o `LeadForm` via `next/dynamic` com `ssr: true`. O LeadForm é a única ilha client com payload exclusivo pesado (`react-hook-form` + `zod` + `@hookform/resolvers`) e está below-fold (última seção). `ssr: true` preserva o HTML do form no SSR (SEO intacto). As demais seções são RSC — `dynamic` nelas seria net-neutro (Pitfall 1), por isso não foi aplicado.
- **PERF-09 (conexões lentas):** `src/hooks/use-device-tier.ts` ganhou o helper `isSlowConnection()` que lê `navigator.connection?.effectiveType` defensivamente. `slow-2g`/`2g` → rebaixa o tier para `reduced`. `navigator.connection` é `undefined` no Safari — o optional chaining retorna `false`, tier inalterado, **sem caminho de erro** (T-07-10 aceito). Integrado no `compute()` do hook.
- Verificação: `tests/layout/speed-insights.test.tsx` GREEN, `npm run typecheck` limpo, `npm run lint` OK, `npm run build` OK.

## Auditoria de Performance

### Baseline de Bundle — First Load JS (PERF-05)

`npm run build`:

| Rota | Size | First Load JS |
|------|------|---------------|
| `/` (landing) | 37.3 kB | **159 kB** |
| Shared by all | — | 102 kB |

A rota `/` está em **159 kB First Load JS — ~9 kB acima do gate de 150 KB**. O `+ First Load JS shared` é 102 kB (chunks 46.2 kB + 54.2 kB).

**Maiores contribuintes** (parsed size, do treemap `ANALYZE=true npm run build` → `.next/analyze/client.html`):

| Módulo | Parsed | Origem |
|--------|--------|--------|
| `next` / `react-dom` | ~656 kB | framework (irredutível) |
| `framer-motion` + `motion-dom` | ~129 kB | animações scroll-based de todas as seções |
| `app-code` | ~79 kB | código próprio das seções |
| `zod` | ~55 kB | validação do LeadForm |
| `sonner` | ~33 kB | Toaster (feedback do form) |
| `@radix-ui/*` (popper/select/menu/nav/scroll-area) | ~94 kB somados | primitivas UI |
| `react-hook-form` | ~24 kB | estado do LeadForm |

Nota: parsed size ≠ gzip. O número de gate é o **First Load JS reportado pelo Next (159 kB)**. Os suspeitos reais do excedente são `framer-motion` e os `@radix-ui/*`. **Decisão pós-medição (follow-up, não escopo deste plano):** a otimização fina — tree-shaking dos `@radix-ui` não usados, lazy-load do `sonner`/`Toaster`, ou redução do footprint do `framer-motion` — fica como follow-up registrado para ser priorizado após a medição Lighthouse real do 07-06. Inflar este plano com refactor de bundle violaria o escopo.

### CLS (PERF-07/CLS)

Auditadas as 5 seções below-fold (`Pain`, `Bridge`, `Product`, `HowItWorks`, `Proof`): **todas são RSC** (sem `"use client"` no `index.tsx`) e renderizam o HTML completo de conteúdo estático (texto/cards) no servidor. Não há altura colapsada esperando JS — o conteúdo ocupa o espaço final já no SSR. As animações (RevealOnView/Motion) animam apenas `transform`/`opacity`, que **não afetam layout** e portanto não geram CLS. O Hero usa `min-h-svh` explícito (iOS-safe, HERO-05). Conclusão: **CLS estruturalmente protegido pela arquitetura RSC + animações transform-only** — nenhuma correção necessária. Medição numérica do CLS é HUMAN-UAT no 07-06.

### Lazy-load below-fold (PERF-07) — Decisão

Pitfall 1 confirmado na prática: aplicar `next/dynamic` ao `LeadForm` **não reduziu o First Load JS da rota `/`** (158 kB → 159 kB, variação dentro do ruído). Razão: a rota `/` é prerenderizada estaticamente e o Next agrega todo o JS hidratável da página no número de First Load JS, esteja ele em chunk separado ou não. O ganho real e honesto do `next/dynamic` aqui é **code-splitting**: o chunk de `react-hook-form` + `zod` vira um arquivo separado que hidrata sob demanda, melhorando TBT/INP na thread principal — não é redução de bundle. A mudança foi mantida por esse ganho de splitting; a alegação não foi inflada como "bundle shrink". `ssr: false` foi descartado (anti-pattern — quebraria o SSR/SEO do form).

### PERF-09 (conexões lentas) — Implementação

Progressive enhancement com fallback no-op. `isSlowConnection()` em `use-device-tier.ts` lê `navigator.connection?.effectiveType` via optional chaining; `slow-2g`/`2g` força o tier `reduced` (corta animações pesadas em conexão ruim). **`navigator.connection` não existe no Safari** — browser dominante do tráfego alvo (iOS via Instagram/Meta Ads); nesse caso o acesso retorna `false` e o tier fica inalterado, sem lançar erro (T-07-10 aceito). PERF-09 portanto **só beneficia Android Chrome**; Safari/iOS continua coberto por `useDeviceTier` (breakpoints) + `prefers-reduced-motion`.

## Verificação Manual (HUMAN-UAT 07-06)

Pendente de validação humana no 07-06:
- Speed Insights coletando CWV num deploy de produção real (dashboard Vercel).
- Lighthouse ≥90 desktop / ≥85 mobile, LCP < 2.5s, CLS < 0.1, INP < 200ms — medição de gate.
- `ANALYZE=true npm run build` → inspeção visual do treemap (`.next/analyze/client.html`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Instalação exigiu `--legacy-peer-deps`**
- **Found during:** Task 1
- **Issue:** `npm install @vercel/speed-insights@^2.0.0` falhou com `ERESOLVE` — o pacote declara `peerOptional` de plugins SvelteKit que conflitam com a versão do Vite resolvida pelo Vitest.
- **Fix:** Instalado com `--legacy-peer-deps`. O conflito é falso (projeto Next.js, peers Svelte nunca carregados). Mesma flag aplicada ao `@next/bundle-analyzer` por consistência do lockfile.
- **Files modified:** package.json, package-lock.json
- **Commit:** c872171

## Follow-ups Registrados (não escopo deste plano)

- **Bundle da rota `/` está ~9 kB acima do gate de 150 KB** (159 kB First Load JS). Otimização fina (tree-shaking `@radix-ui`, lazy-load `sonner`/Toaster, footprint do `framer-motion`) é decisão pós-medição — priorizar após a medição Lighthouse real do 07-06.

## Deferred Issues

Nenhum. (Warning de lint pré-existente em `src/lib/analytics.ts:80` — `Unused eslint-disable directive` — fora do escopo; já documentado nos SUMMARYs 07-02/07-03/07-04.)

## Self-Check: PASSED

Arquivos (verificados em disco):
- MODIFIED: package.json (@vercel/speed-insights deps + @next/bundle-analyzer devDeps)
- MODIFIED: package-lock.json
- MODIFIED: next.config.ts (withBundleAnalyzer wrapper; headers() do 07-04 preservada)
- MODIFIED: src/app/layout.tsx (import + <SpeedInsights /> montado)
- MODIFIED: src/sections/Form/index.tsx (LeadForm via next/dynamic ssr:true)
- MODIFIED: src/hooks/use-device-tier.ts (isSlowConnection — PERF-09)

Commits (verificados via git log):
- FOUND: c872171 — feat(07-05): wire Speed Insights and bundle-analyzer
- FOUND: 17db51b — feat(07-05): code-split LeadForm and add slow-connection degradation

Testes: `tests/layout/speed-insights.test.tsx` 2/2 GREEN. `npm run typecheck` limpo, `npm run lint` OK (só warning pré-existente), `npm run build` OK.
