# Phase 7: SEO + A11y + Performance + Deploy Hardening - Research

**Researched:** 2026-05-21
**Domain:** SEO/metadata, WCAG AA accessibility, Core Web Vitals & bundle perf, mobile QA, Vercel deploy ops
**Confidence:** HIGH (codebase-verified; framework patterns cited from official Next.js 15 docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**SEO**
- Metadata via Next.js Metadata API (`export const metadata` / `generateMetadata`) em `app/layout.tsx` e/ou `app/page.tsx`. Zero `react-helmet`.
- OG image 1200×630: gerar via `app/opengraph-image.tsx` (já existe — auditar arte) OU asset estático. Deve renderizar polido no preview de WhatsApp e LinkedIn.
- JSON-LD tipado via `schema-dts`: Organization (logo, sameAs Instagram/LinkedIn, contato) + WebPage. Injetado via `<script type="application/ld+json">` com `JSON.stringify`. Validar no Google Rich Results Test.
- `<title>` < 60 chars, `<meta description>` < 160 chars.
- Hierarquia de headings: uma única `<h1>` (hero), `<h2>` por seção, `<h3>` subitens.
- Alt text: imagem informativa com `alt` descritivo; decorativa com `alt=""` + `role="presentation"`.

**A11y**
- Contraste WCAG AA: auditar todos os pares texto/fundo (incluindo seções DARK Pain/Proof). axe DevTools ou Lighthouse a11y + checagem manual. Corrigir ajustando tokens, respeitando brand book (roxo `#7C3AED` só destaque).
- Skip-link "Pular para conteúdo principal" no topo do `<body>`/layout, visível ao focar, salta pro `<main>`.
- Navegação por teclado: Tab atravessa header → CTAs → form → floating; foco visível com outline brand.
- Audit `<div onClick>` → `<button>`/`<a>`.
- `prefers-reduced-motion`: TODAS as animações simplificam. Validar em macOS Reduce Motion + Windows Animations off.

**Performance**
- Gate: Lighthouse Performance ≥90 desktop / ≥85 mobile contra Vercel. LCP <2.5s mobile / <2.0s desktop, CLS <0.1, INP <200ms.
- Bundle: `@next/bundle-analyzer` — first-load JS ≤150KB gzipped (sem Pixel/GA4/Clarity).
- Imagens: hoje placeholders. PERF-08 "~50 prints → 12-18 imagens" depende de assets reais do Lenny. Se não existirem, otimizar o que houver e marcar swap como pendência. Todas via `next/image` com `sizes`, AVIF/WebP.
- Lazy-load below-fold: avaliar `next/dynamic({ ssr: true })` sem quebrar SEO nem LCP.
- CLS: imagens com `width`/`height`, seções com `min-h-*`.

**Mobile QA**
- Tap targets ≥44×44px — CTAs, floating, links footer, inputs.
- `useDeviceTier()` — auditar que todas decisões de motion intensity passam por ele.
- Lenis em `pointer: coarse`: decisão final vira HUMAN-UAT.
- Device matrix real (MOBILE-07): iPhone iOS Safari, Android mid-tier Chrome, iPad Safari — HUMAN-UAT.

**Deploy**
- DEPLOY-01/02 (GitHub auto-deploy) — BLOQUEADO: conta `lennywajcberg` sem push no repo `likro/likro-landing-page` (403). Vira setup do Lenny. Até lá, deploys manuais via `vercel` CLI.
- DEPLOY-03: `NEXT_PUBLIC_WA_NUMBER` + 5 vars Phase 5 configuradas. Faltam 3 de analytics. NOTA: `LEAD_WEBHOOK_URL` está desatualizado — destino real é `RESEND_*`/`GOOGLE_*`.
- DEPLOY-05: habilitar Vercel Speed Insights (`@vercel/speed-insights` + componente no layout).

### Claude's Discretion
- Estrutura/split dos plans (recomendação por stream — ver Architecture Patterns abaixo).
- Ferramentas de auditoria automatizada (axe-core flavour, Lighthouse runner).
- Implementação de PERF-09 (`navigator.connection`) — não existe ainda; decidir abordagem.

### Deferred Ideas (OUT OF SCOPE)
- GitHub push access (bloqueia DEPLOY-01/02, não bloqueia o resto).
- Analytics IDs (3) — Phase 6 Parte B; DEPLOY-03 fica parcial.
- Domínio próprio / DNS — pós-launch.
- Prints reais de produto (PERF-08) — se não existirem, otimizar placeholders.
- Backlog 999.1 / 999.2 — polish visual/editorial, milestone futuro.
- Cookie consent / LGPD banner — não está nos 37 reqs.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | `<title>` único < 60 chars | Metadata API já em `layout.tsx` — auditar comprimento (atual "Likro · Operação comercial moderna para clínicas" = 49 chars ✓) |
| SEO-02 | `<meta description>` < 160 chars | Atual = 87 chars ✓ — auditar/refinar copy |
| SEO-03 | Open Graph completo + OG image 1200×630 | `metadata.openGraph` já existe; falta `og:url` correto, validação Meta |
| SEO-04 | Twitter Card `summary_large_image` | Já em `metadata.twitter` ✓ — auditar `images` field ausente |
| SEO-05 | JSON-LD Organization via `schema-dts` | **Não existe** — criar; `schema-dts` NÃO está em package.json (instalar) |
| SEO-06 | JSON-LD WebPage/Service adicional | **Não existe** — criar |
| SEO-07 | JSON-LD validado em Rich Results Test | HUMAN-UAT (ferramenta externa) |
| SEO-08 | HTML semântico, h1 único, hierarquia | Auditado: 1×`<h1>` (HeroCopy), `<h2>` por seção, `<h3>` subitens — limpo. Grep-testável |
| SEO-09 | Imagens com `alt` descritivo | Codebase usa **zero `next/image`** — só `<Image>` é em mock dumb; revisão de alt aplica a mockups CSS marcados `aria-hidden` |
| SEO-10 | `lang="pt-BR"` no `<html>` | Já presente em `layout.tsx` ✓ — grep-testável |
| SEO-11 | Preview `.vercel.app` retorna noindex | `robots.ts` já discrimina `VERCEL_ENV`; falta header `X-Robots-Tag` |
| A11Y-01 | Contraste WCAG AA | axe-core / Lighthouse + manual; pares DARK suspeitos |
| A11Y-02 | Navegação por teclado + foco visível | Button já tem `focus-visible:ring-accent-primary`; auditar Header/Link/inputs |
| A11Y-03 | Form label/aria | Feito Phase 5 — só verificar |
| A11Y-04 | `prefers-reduced-motion` desliga animações | 15 arquivos usam reduced-motion; auditar cobertura (CSS keyframes em `globals.css`) |
| A11Y-05 | Skip-link funcional | **Não existe** — criar; `<main>` precisa de `id` |
| A11Y-06 | `<button>`/`<a>` semânticos, sem `onClick` em `<div>` | Grep: só 2 arquivos com `onClick`, ambos em `<Button>` — limpo |
| A11Y-07 | Decorativas `alt=""`+`role`, informativas alt | Mockups CSS já usam `aria-hidden="true"` — verificar consistência |
| PERF-01..06 | Lighthouse/CWV/bundle/page-weight gates | HUMAN-UAT (medição) + `@next/bundle-analyzer` (instalar) |
| PERF-07 | Lazy-load below-fold via `next/dynamic` | Tradeoff analisado abaixo — provavelmente NET-NEUTRO; ver Pitfalls |
| PERF-08 | Image manifest ~50→12-18 via `next/image` | **Zero imagens reais hoje** — assets dependem do Lenny (BLOQUEADO parcial) |
| PERF-09 | Degradação em conexões lentas | **Não implementado** — `navigator.connection` ausente; decidir escopo |
| MOBILE-01 | Motion intensity via `useDeviceTier()` | Hook existe; auditar uso real nas seções |
| MOBILE-03 | Tap targets ≥44×44px | Button `lg`=h-12 (48px) ✓, `default`=h-10 (40px) ✗ — auditar |
| MOBILE-04 | Lenis touch behavior | `smooth-scroll-provider` usa `syncTouch:false`; decisão coarse-pointer = HUMAN-UAT |
| MOBILE-05 | Hover→`:active` fallback | Grep: hover em poucos lugares; auditar |
| MOBILE-07 | Device matrix real | HUMAN-UAT |
| DEPLOY-01/02 | GitHub→Vercel auto-deploy + preview | **BLOQUEADO** — sem push access (403) |
| DEPLOY-03 | Env vars na Vercel | Parcial — 3 analytics IDs pendentes |
| DEPLOY-04 | Deploy `.vercel.app` | Já feito |
| DEPLOY-05 | Vercel Speed Insights | **Não existe** — instalar `@vercel/speed-insights` |
</phase_requirements>

## Summary

A Phase 7 é um pente-fino de hardening sobre um site Next.js 15.5 já em produção. A pesquisa do código revelou três fatos que mudam o planejamento em relação ao que CONTEXT.md/CLAUDE.md assumiram:

1. **`schema-dts` e `@next/bundle-analyzer` NÃO estão em `package.json`.** CLAUDE.md e CONTEXT.md afirmam que estão "já em devDeps" — não estão. Ambos precisam ser instalados. `@vercel/speed-insights` também não está.
2. **O site usa ZERO `next/image`.** Todos os "mockups" (Hero card stack, Product mockup, HowItWorks mini-mockups) são composições CSS puras com `<div>`/`lucide-react` — não há imagens. PERF-08 (image manifest, AVIF/WebP, `sizes`) e SEO-09 (alt text de imagens) têm escopo quase nulo no código atual: não há imagens informativas para otimizar. As únicas imagens são `public/logos/likro-logo.{png,svg}` (usado? auditar) e os logos no manifest/favicon. **Isto reduz drasticamente o esforço de PERF-08** — a menos que o Lenny entregue prints reais, caso em que vira trabalho de swap.
3. **A higiene semântica já está boa.** Heading hierarchy verificada (1×`<h1>`, `<h2>` por seção, `<h3>` subitens), `lang="pt-BR"` presente, `onClick` só em `<Button>` (zero `<div onClick>`), mockups decorativos já marcados `aria-hidden="true"`. SEO-08, A11Y-06, A11Y-07, SEO-10 são em grande parte VERIFICAÇÃO, não correção.

O que realmente precisa ser construído: JSON-LD (SEO-05/06), skip-link (A11Y-05), `X-Robots-Tag` header (SEO-11 reforço), Speed Insights (DEPLOY-05), wiring do bundle-analyzer (PERF-05), e — se for adotado — PERF-09 (`navigator.connection`). O resto é auditoria automatizável (grep/render tests) + HUMAN-UAT (Lighthouse, Rich Results, OG preview, device matrix).

**Primary recommendation:** Dividir em ~6 plans por stream (ver Architecture Patterns). Tratar PERF-08 e DEPLOY-01/02 como blocked/parcial desde o plano. Não inflar PERF-08 — sem imagens reais, é otimização de placeholders + manifesto de pendência. Toda medição numérica (Lighthouse, CWV, bundle KB) é HUMAN-UAT consolidada em `07-HUMAN-UAT.md`.

## Standard Stack

### Core (a instalar — confirmado ausente de package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `schema-dts` | `^2.0.0` | Tipos TS para JSON-LD Organization/WebPage | [VERIFIED: npm view schema-dts version → 2.0.0]. Mantido pelo Google. Evita JSON-LD hand-rolled como string não-tipada. SEO-05/06. |
| `@vercel/speed-insights` | `^2.0.0` | CWV reais em produção | [VERIFIED: npm view → 2.0.0]. Componente `<SpeedInsights />` no layout. DEPLOY-05. Pacote oficial Vercel. |
| `@next/bundle-analyzer` | `^16.2.6` | Visualização de bundle, gate 150KB | [VERIFIED: npm view → 16.2.6]. **ATENÇÃO:** versão major 16 — wrapper de config compatível com Next 15.5 (o analyzer é só um plugin webpack, version-independente do Next core). Confirmar compat ao instalar; se houver atrito, fixar `^15.x`. PERF-05. |

### Supporting (auditoria automatizada — opcional, Claude's discretion)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest-axe` | `^0.1.0` | Asserções axe-core dentro de testes vitest | [VERIFIED: npm view → 0.1.0]. Permite `expect(await axe(container)).toHaveNoViolations()` em render tests. Útil para A11Y-01/A11Y-03 automatizável. Maturidade baixa (0.1.0) — usar com cautela; alternativa: rodar axe manualmente via DevTools (HUMAN-UAT). |
| `@axe-core/playwright` | `^4.11.3` | axe contra a página renderizada real | [VERIFIED: npm view → 4.11.3]. Mais robusto que vitest-axe (DOM real), mas exige Playwright + dev server. CLAUDE.md global já manda usar Playwright MCP pós-mudança de UI — alinhado. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@next/bundle-analyzer` | `next build` + leitura do output de "First Load JS" | O `next build` já imprime First Load JS por rota no terminal — suficiente para o gate de 150KB sem instalar nada. O analyzer dá o treemap visual (qual lib bloata). Recomendação: instalar o analyzer (decisão de marca premium justifica o detalhe), mas o `next build` output é o gate de verdade. |
| `vitest-axe` em render tests | axe DevTools (extensão Chrome) manual | axe DevTools é o gold standard mas é HUMAN-UAT. vitest-axe automatiza um subconjunto. Lighthouse a11y (já vem no Lighthouse) cobre o grosso. Recomendação: Lighthouse a11y como gate automatizável-ish + axe DevTools manual para os pares de contraste DARK. |
| `@vercel/speed-insights` | `@vercel/analytics` | São produtos distintos: Analytics = pageviews/eventos; Speed Insights = CWV. DEPLOY-05 pede CWV → Speed Insights é o correto. |

**Installation:**
```bash
npm install schema-dts @vercel/speed-insights
npm install -D @next/bundle-analyzer
# opcional (auditoria a11y automatizada):
npm install -D vitest-axe
```

**Version verification:** Todas as versões acima foram confirmadas via `npm view <pkg> version` em 2026-05-21. `@next/bundle-analyzer@16.2.6` é major 16 — validar no `next.config.ts` que o wrapper não exige Next 16; se quebrar, `npm install -D @next/bundle-analyzer@^15`.

## Architecture Patterns

### Recommended Plan Split (PERF-08 e DEPLOY são casos especiais)

37 reqs é grande demais para um plano. Split recomendado por stream coeso (5-6 plans):

```
07-01  SEO metadata + JSON-LD       SEO-01..06, SEO-08, SEO-10  (+ schema-dts install)
07-02  SEO preview/robots + OG      SEO-03(OG art), SEO-04, SEO-09(audit), SEO-11
07-03  A11y audit + skip-link       A11Y-01..07
07-04  Performance código          PERF-05, PERF-07, PERF-09  (+ bundle-analyzer install)
07-05  Mobile QA + deploy          MOBILE-01,03,04,05; DEPLOY-03,04,05  (+ speed-insights install)
07-06  HUMAN-UAT consolidado       SEO-07, PERF-01..04,06,08; MOBILE-07; DEPLOY-01,02 (07-HUMAN-UAT.md)
```

Reqs puramente de medição/ferramenta-externa (Lighthouse, Rich Results, OG preview, device matrix) NÃO viram tarefas de código — viram itens de `07-HUMAN-UAT.md` (plan 07-06). `PHASE SPLIT RECOMMENDED` não é necessário; 6 plans cabe num orçamento de fase.

### Pattern 1: JSON-LD via componente Server tipado com schema-dts
**What:** Componente RSC que serializa um objeto tipado e injeta `<script type="application/ld+json">`.
**When to use:** SEO-05/06. Renderizar dentro de `<body>` no `layout.tsx` ou `page.tsx`.
**Example:**
```tsx
// Source: nextjs.org/docs/app/guides/json-ld (CITED)
import type { Organization, WithContext } from "schema-dts";

const orgSchema: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Likro",
  url: "https://likro.com.br",
  logo: "https://likro.com.br/logos/likro-logo.png",
  // sameAs SÓ se os links existirem — não inventar (CONTEXT.md / NARR credibilidade)
  // sameAs: ["https://instagram.com/...", "https://linkedin.com/company/..."],
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  );
}
```
Next.js [recomenda explicitamente](https://nextjs.org/docs/app/guides/json-ld) este padrão (`JSON.stringify` + `dangerouslySetInnerHTML`). `schema-dts` dá type-safety. `sameAs` precisa de confirmação do Lenny (Instagram/LinkedIn) — se não houver perfis, **omitir o campo** (não inventar — invariante de credibilidade do projeto).

### Pattern 2: Skip-link sr-only com `focus:not-sr-only`
**What:** `<a>` no topo do `<body>` invisível até receber foco, salta para `<main id="main-content">`.
**When to use:** A11Y-05.
**Example:**
```tsx
// Em layout.tsx, primeiro filho de <body>:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent-primary focus:px-4 focus:py-2 focus:text-white"
>
  Pular para o conteúdo principal
</a>
// Em page.tsx: <main id="main-content">
```
Tailwind v4 tem `sr-only` e `not-sr-only` nativos. `page.tsx` hoje tem `<main>` sem `id` — precisa adicionar `id="main-content"`.

### Pattern 3: next/dynamic abaixo do fold — SSR preservado
**What:** `next/dynamic(() => import(...), { ssr: true })` para seções below-fold.
**When to use:** PERF-07 — MAS ver Pitfall abaixo. Provavelmente net-neutro neste site.
**Example:**
```tsx
import dynamic from "next/dynamic";
const Proof = dynamic(() => import("@/sections/Proof").then(m => m.Proof));
// ssr default = true no App Router; HTML continua no SSR (SEO ok).
```

### Anti-Patterns to Avoid
- **`next/dynamic({ ssr: false })` em seções de conteúdo:** quebra SEO (HTML não renderiza no servidor) — proibido aqui. App Router default é `ssr: true`; manter.
- **JSON-LD como string literal sem `schema-dts`:** drift-prone, fácil quebrar schema. Sempre tipar.
- **Animação de entrada no LCP element:** já é invariante do projeto (HERO-02). Phase 7 não pode introduzir regressão.
- **Roxo `#7C3AED` como fundo para "corrigir" contraste:** ajustar tokens de contraste nunca pode violar o brand book. Se um par texto/fundo falha em seção DARK, escurecer/clarear o neutro — não pintar de roxo.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-LD structured data | Objeto string manual | `schema-dts` types + `JSON.stringify` | Type-safety contra schema inválido; Rich Results Test falha silenciosamente com typo |
| OG image | `<canvas>` / lib externa | `app/opengraph-image.tsx` + `next/og` `ImageResponse` (já existe) | Convenção Next.js; gera no edge, dimensão 1200×630 automática |
| CWV monitoring | `web-vitals` + endpoint próprio | `@vercel/speed-insights` | Vercel já coleta; um componente, zero backend |
| Bundle size measurement | Script de parsing do `.next/` | `next build` output + `@next/bundle-analyzer` | First Load JS já é impresso pelo build |
| Contraste WCAG | Calculadora própria de luminância | axe DevTools / Lighthouse a11y | Edge cases (large text 3:1 vs 4.5:1, alpha compositing) |
| Skip-link visível-no-foco | JS toggle de classe | Tailwind `sr-only` + `focus:not-sr-only` | CSS puro, zero JS, padrão a11y consolidado |

**Key insight:** Quase tudo nesta fase tem primitiva oficial Next.js ou Vercel. O trabalho "novo" real é pequeno (JSON-LD, skip-link, 3 instalações). O grosso é auditoria.

## Runtime State Inventory

Não aplica integralmente (não é rename/refactor), mas há estado externo relevante ao deploy:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Live service config | Projeto Vercel `likros-projects/likro-landing-page` já existe e deployado | DEPLOY-03: adicionar 3 env vars de analytics (Production+Preview+Dev) via dashboard Vercel — manual |
| Live service config | Repo GitHub `likro/likro-landing-page` — conta `lennywajcberg` sem push (403) | DEPLOY-01/02 BLOQUEADO — Lenny precisa virar colaborador da org `likro` ou ajustar remote |
| Secrets/env vars | `.env.example` lista `RESEND_*`/`GOOGLE_*` (Phase 5) + `NEXT_PUBLIC_WA_NUMBER` | DEPLOY-03: requisito original cita `LEAD_WEBHOOK_URL` — nome morto; destino real é Resend+Sheets. Documentar a divergência, não criar a var. |
| Build artifacts | Nenhum stale relevante | None |
| Stored data | N/A (site estático) | None |

## Common Pitfalls

### Pitfall 1: PERF-07 (next/dynamic below-fold) pode ser net-neutro ou regressão
**What goes wrong:** O planner assume que lazy-loading de seções sempre melhora perf. Neste site **as seções são quase todas Server Components** (Hero, Pain, Bridge, Product, HowItWorks, Proof são RSC; só Form/Header/Floating são client). RSC não adicionam JS ao bundle client — fazer `next/dynamic` deles fragmenta o HTML em chunks sem economia de JS e pode atrasar paint.
**Why it happens:** `next/dynamic` economiza **JavaScript de componentes client**. Seções RSC já não enviam JS.
**How to avoid:** Antes de aplicar PERF-07, rodar `next build` e identificar o que realmente está no First Load JS. Aplicar `next/dynamic` apenas a ilhas client pesadas below-fold (ex: `LeadForm` com react-hook-form+zod, `FloatingWhatsApp`). Documentar a decisão. PERF-07 pode resolver-se com "auditado: arquitetura RSC já entrega o efeito; dynamic aplicado seletivamente a X".

### Pitfall 2: `@next/bundle-analyzer@16` num projeto Next 15.5
**What goes wrong:** `npm install` puxa major 16; em teoria o wrapper de config muda entre majors.
**How to avoid:** Após instalar, validar `next.config.ts` builda. Se erro, `npm install -D @next/bundle-analyzer@^15`. O analyzer é plugin webpack — geralmente compatível cross-major, mas confirmar.

### Pitfall 3: Lenis + `pointer: coarse` (MOBILE-04) — verificar o estado atual
**What goes wrong:** O `smooth-scroll-provider.tsx` atual usa `syncTouch: false` mas **não pula a inicialização em coarse pointer** — só pula em `prefers-reduced-motion`. MOBILE-04 pede decisão final: NÃO inicializar em coarse OU `smoothTouch:false`. Hoje está no segundo caso (touch nativo, Lenis só wheel).
**How to avoid:** A decisão "está OK como está" precisa ser validada em device real (HUMAN-UAT) antes de fechar MOBILE-04. Se o teste real mostrar atrito no iOS, adicionar guard `(pointer: coarse)` que pula o `import("lenis")` inteiro.

### Pitfall 4: Tap targets — `Button size="default"` é h-10 (40px), abaixo de 44px
**What goes wrong:** MOBILE-03 exige ≥44×44px. `button.tsx`: `default`=h-10 (40px), `sm`=h-9 (36px), `lg`=h-12 (48px ✓), `icon`=size-10 (40px ✗). CTAs que usam `default`/`icon` em contexto mobile podem falhar o gate.
**How to avoid:** Auditar cada uso de `<WhatsAppCta>` e `<Button>` em viewport mobile. O floating CTA usa `size-14` (56px ✓). Os CTAs inline e o do header (`secondary`, default size) precisam de verificação — talvez subir para `lg` em mobile ou aumentar área de toque com padding. Não é "todo botão precisa h-12" — é "todo target tocável em mobile ≥44px".

### Pitfall 5: OG image — `metadataBase` aponta para domínio sem DNS
**What goes wrong:** `layout.tsx` tem `metadataBase: new URL("https://likro.com.br")`. O domínio não existe ainda (DNS pós-launch). OG image URL absoluta vira `https://likro.com.br/opengraph-image` — quebrada no preview WhatsApp/LinkedIn enquanto o DNS não resolve.
**How to avoid:** Durante a v1 em `.vercel.app`, `metadataBase` deveria refletir a URL `.vercel.app` ativa (ou usar `process.env.VERCEL_URL`). Decidir: (a) `metadataBase` dinâmica baseada em `VERCEL_URL`, ou (b) aceitar OG quebrada até DNS. Para os canais de aquisição (WhatsApp/LinkedIn) funcionarem ANTES do DNS, (a) é necessário. Mesma lógica aplica a `robots.ts`/`sitemap.ts` que hardcodam `likro.com.br`.

### Pitfall 6: PERF-09 não existe — escopo a decidir
**What goes wrong:** `navigator.connection.effectiveType` não é usado em lugar nenhum (grep: 0 matches). PERF-09 pede degradação em conexões 4g/slow. Implementar do zero pode ser scope creep.
**How to avoid:** PERF-09 é discricionário. Opções: (a) hook leve `useEffectiveConnection()` que `useDeviceTier()` ou as primitivas de motion consultam para cair em `reduced`; (b) marcar PERF-09 como "coberto parcialmente — `useDeviceTier` + `prefers-reduced-motion` já degradam; `navigator.connection` tem suporte irregular (não existe no Safari/iOS)". Recomendação: opção (b) com nota honesta — `navigator.connection` **não existe no Safari** (o browser dominante do tráfego mobile alvo), então implementá-lo beneficia só Android Chrome. Documentar e deixar Lenny decidir.

## Code Examples

### Speed Insights no layout (DEPLOY-05)
```tsx
// Source: vercel.com/docs/speed-insights (CITED)
import { SpeedInsights } from "@vercel/speed-insights/next";
// dentro de <body>, após children:
<SpeedInsights />
```

### X-Robots-Tag para previews (SEO-11 reforço)
```ts
// Source: nextjs.org/docs/app/api-reference/config/next-config-js/headers (CITED)
// next.config.ts — header noindex em deploys não-produção
const nextConfig: NextConfig = {
  async headers() {
    const isProd = process.env.VERCEL_ENV === "production";
    if (isProd) return [];
    return [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }];
  },
};
```
`robots.ts` já bloqueia via `robots.txt`; o `X-Robots-Tag` header é defesa-em-profundidade que CONTEXT.md pediu explicitamente para verificar.

### bundle-analyzer wiring (PERF-05)
```ts
// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";
const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default analyze(nextConfig);
// rodar: ANALYZE=true npm run build
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-helmet` para meta tags | Next.js Metadata API (`export const metadata`) | App Router (Next 13+) | Já adotado no projeto ✓ |
| `web-vitals` + endpoint próprio | `@vercel/speed-insights` componente | 2023+ | DEPLOY-05 — instalar |
| JSON-LD string manual | `schema-dts` tipado | — | SEO-05/06 — instalar |
| `next/legacy/image` | `next/image` (App Router) | Next 13+ | N/A — site não usa imagens |

**Deprecated/outdated:**
- `LEAD_WEBHOOK_URL` (DEPLOY-03, REQUIREMENTS.md): nome morto — a v1 usa Resend + Google Sheets. Não criar essa var.
- Suposição de CLAUDE.md/CONTEXT.md de que `schema-dts` e `@next/bundle-analyzer` "já estão em package.json": **falso** — verificado, ausentes.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@next/bundle-analyzer@16` é compatível com Next 15.5 (plugin webpack version-independente) | Standard Stack / Pitfall 2 | Baixo — fallback documentado (`@^15`). Validar no install. |
| A2 | PERF-08 tem escopo quase nulo porque o site não usa imagens reais | Summary / Phase Requirements | Médio — se Lenny entregar prints reais durante a fase, PERF-08 vira trabalho de swap real. Plano deve ter ramo condicional. |
| A3 | `next/dynamic` em seções RSC é net-neutro | Pitfall 1 | Baixo — fundamentado em como RSC funcionam; confirmar com `next build` output. |
| A4 | Lenny tem perfis Instagram/LinkedIn para `sameAs` do JSON-LD | Pattern 1 | Médio — se não tiver, omitir `sameAs` (não inventar). Pergunta para discuss/UAT. |
| A5 | `metadataBase` apontar para `likro.com.br` quebra OG preview em `.vercel.app` | Pitfall 5 | Médio — confirmar comportamento; pode exigir `metadataBase` dinâmica via `VERCEL_URL`. |

## Open Questions

1. **`sameAs` do JSON-LD Organization** — Lenny tem Instagram e LinkedIn da Likro? Sem links reais, omitir o campo (invariante de credibilidade: zero dados inventados). → Pergunta para o Lenny.
2. **`metadataBase` durante v1 em `.vercel.app`** — manter `likro.com.br` (OG quebrada até DNS) ou usar `VERCEL_URL` dinâmico (OG funciona já)? Os canais de aquisição são WhatsApp/LinkedIn — recomendação: dinâmico.
3. **PERF-08 — prints reais existem?** Se sim, é trabalho de swap (`next/image` + manifest). Se não, é "otimizar placeholders + marcar pendência". → Confirmar com Lenny antes de dimensionar o plano.
4. **PERF-09 escopo** — `navigator.connection` não existe no Safari (browser dominante do tráfego alvo). Implementar mesmo assim (só beneficia Android) ou marcar como coberto-parcialmente via `useDeviceTier`? → Decisão do Lenny.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Vercel CLI | Deploy manual (DEPLOY-01/02 bloqueados) | ✓ (assumido — Phases 5-6 deployaram) | — | — |
| GitHub push access (`likro/likro-landing-page`) | DEPLOY-01/02 | ✗ | — | Deploy manual via `vercel` CLI; Lenny resolve acesso |
| Lighthouse / Chrome DevTools | PERF-01..04 medição | ✓ (Chrome local) | — | LHCI / PageSpeed Insights web |
| `@lhci/cli` | PERF gates automatizados (opcional) | ✗ (não instalado) | — | DevTools manual (HUMAN-UAT) |
| Prints reais de produto | PERF-08 | ✗ (placeholders CSS) | — | Otimizar o que houver; swap = pendência |
| 3 analytics IDs (GA4/Pixel/Clarity) | DEPLOY-03 | ✗ (Phase 6 Parte B) | — | DEPLOY-03 fica parcial |

**Missing dependencies with no fallback:**
- GitHub push access — bloqueia DEPLOY-01/02 (auto-deploy + preview deploys). Não bloqueia o resto da fase.

**Missing dependencies with fallback:**
- LHCI → DevTools/PageSpeed manual; prints reais → otimizar placeholders; analytics IDs → DEPLOY-03 parcial.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16 + jsdom 25 |
| Config file | `vitest.config.*` (existe — testes em `tests/`) |
| Quick run command | `npx vitest run tests/<file>` |
| Full suite command | `npm run test` (= `vitest run`) |

### Phase Requirements → Test Map

**AUTOMATABLE (grep / render / unit tests — em vitest):**

| Req ID | Behavior | Test Type | Automated Check | File Exists? |
|--------|----------|-----------|-----------------|-------------|
| SEO-01 | `<title>` < 60 chars | unit | assert `metadata.title.default.length < 60` | ❌ Wave 0 |
| SEO-02 | `description` < 160 chars | unit | assert `metadata.description.length < 160` | ❌ Wave 0 |
| SEO-03/04 | OG + Twitter fields presentes | unit | assert `metadata.openGraph` / `.twitter` shape | ❌ Wave 0 |
| SEO-05/06 | JSON-LD shape válido | unit | parse `JSON.stringify(orgSchema)`, assert `@type`/`name`/`url` | ❌ Wave 0 |
| SEO-08 | h1 único, hierarquia | grep test | `grep -c "<h1"` em `src/` = 2 (HeroCopy + privacy page); por-página = 1 | ❌ Wave 0 |
| SEO-10 | `lang="pt-BR"` | grep test | `grep 'lang="pt-BR"' layout.tsx` | ❌ Wave 0 |
| SEO-11 | preview noindex | unit | `robots()` retorna `disallow` quando `VERCEL_ENV≠production` | ❌ Wave 0 |
| A11Y-05 | skip-link presente | render test | `getByText("Pular para o conteúdo principal")` tem `href="#main-content"` | ❌ Wave 0 |
| A11Y-06 | sem `<div onClick>` | grep test | `grep "div[^>]*onClick"` = 0 matches | ❌ Wave 0 |
| A11Y-07 | mockups decorativos `aria-hidden` | grep test | mockup components têm `aria-hidden="true"` | ❌ Wave 0 |
| A11Y-01/03 | violações axe | render test (opcional) | `vitest-axe` em sections renderizadas | ❌ Wave 0 (opcional) |
| MOBILE-01 | motion via `useDeviceTier` | grep test | seções com motion importam `useDeviceTier` ou primitiva | ❌ Wave 0 |
| DEPLOY-05 | SpeedInsights montado | render test | `<SpeedInsights />` presente no layout tree | ❌ Wave 0 |

**MANUAL / HUMAN-UAT (medição, ferramenta externa, device real — `07-HUMAN-UAT.md`):**

| Req ID | Why Manual |
|--------|-----------|
| SEO-07 | Google Rich Results Test (ferramenta web externa) |
| SEO-03 (OG art) | Preview real em WhatsApp + LinkedIn + validador Meta |
| PERF-01..04 | Lighthouse score / LCP / CLS / INP — medição em deploy Vercel |
| PERF-06 | Peso total página — medição (DevTools Network) |
| PERF-08 | Validação visual de imagens reais (se existirem) |
| A11Y-01 | Contraste DARK suspeito — axe DevTools + olho humano |
| A11Y-02 | Navegação por teclado real (Tab através do site) |
| A11Y-04 | Reduce Motion no OS (macOS + Windows) |
| MOBILE-04 | Lenis em device touch real |
| MOBILE-07 | Device matrix (iPhone Safari, Android Chrome, iPad) |
| DEPLOY-01/02 | Conexão GitHub↔Vercel — bloqueado por acesso |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/<arquivo-tocado>`
- **Per wave merge:** `npm run test` + `npm run typecheck` + `npm run lint`
- **Phase gate:** suite verde + `07-HUMAN-UAT.md` preenchido por Lenny antes de `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/seo/metadata.test.ts` — comprimentos title/description, shape OG/Twitter (SEO-01..04)
- [ ] `tests/seo/json-ld.test.ts` — shape Organization/WebPage (SEO-05/06)
- [ ] `tests/seo/semantic-html.test.ts` — grep h1/lang/onClick/aria-hidden (SEO-08,10; A11Y-06,07)
- [ ] `tests/seo/robots.test.ts` — `robots()` discrimina VERCEL_ENV (SEO-11)
- [ ] `tests/a11y/skip-link.test.tsx` — skip-link render + href (A11Y-05)
- [ ] `tests/a11y/sections-axe.test.tsx` — vitest-axe nas seções (A11Y-01/03, opcional)
- [ ] `tests/layout/speed-insights.test.tsx` — SpeedInsights montado (DEPLOY-05)
- [ ] `07-HUMAN-UAT.md` — checklist consolidado de tudo que é manual

## Security Domain

`security_enforcement` não está em config.json (workflow só tem `nyquist_validation`). Esta fase é hardening de site estático sem backend novo. Notas mínimas:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no (form já feito Phase 5 com zod) | — |
| V14 Configuration | yes (leve) | `X-Robots-Tag` em previews (SEO-11), env vars server-only sem `NEXT_PUBLIC_` para secrets (já correto no `.env.example`) |

Sem superfície nova de ataque — a fase não toca o route handler `/api/lead`. `dangerouslySetInnerHTML` no JSON-LD é seguro: o conteúdo é um objeto estático controlado, não input de usuário.

## Sources

### Primary (HIGH confidence)
- Codebase verificado diretamente — `layout.tsx`, `page.tsx`, `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`, `icon.tsx`, `button.tsx`, `Header.tsx`, `whatsapp-cta.tsx`, `smooth-scroll-provider.tsx`, `use-device-tier.ts`, `package.json`, `next.config.ts`, `.env.example`, todas as 29 seções
- `npm view` — versões confirmadas 2026-05-21: `schema-dts@2.0.0`, `@vercel/speed-insights@2.0.0`, `@next/bundle-analyzer@16.2.6`, `@axe-core/playwright@4.11.3`, `vitest-axe@0.1.0`
- nextjs.org/docs/app/guides/json-ld — padrão JSON-LD
- nextjs.org/docs/app/api-reference/config/next-config-js/headers — X-Robots-Tag
- vercel.com/docs/speed-insights — integração SpeedInsights

### Secondary (MEDIUM confidence)
- Padrão skip-link `sr-only`/`focus:not-sr-only` — consolidado em docs Tailwind v4 + práticas WCAG

### Tertiary (LOW confidence)
- Nenhuma — todas as recomendações verificadas via codebase ou docs oficiais

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões `npm view`-verificadas; ausência de pacotes confirmada por leitura de `package.json`
- Architecture (plan split): HIGH — derivado dos 37 reqs e dos streams do CONTEXT.md
- Pitfalls: HIGH — fundamentados em leitura direta do código (RSC vs client, tap target sizes, Lenis config, metadataBase)

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (stack estável; re-verificar versões se a fase atrasar > 30 dias)
