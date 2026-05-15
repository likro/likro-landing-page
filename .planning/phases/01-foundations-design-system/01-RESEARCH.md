# Phase 1: Foundations & Design System — Research

**Researched:** 2026-05-15
**Domain:** Greenfield bootstrap de landing page Next.js 15.5 — Tailwind v4 com brand-lock mecânico, providers Lenis/Motion/Analytics, helpers `buildWhatsAppUrl()` e `track()`, atoms shadcn customizados, rota `/dev` interna
**Confidence:** HIGH

## Summary

Phase 1 é a fase mais crítica do projeto inteiro: ela materializa em código os 4 dos 6 riscos críticos identificados no `PITFALLS.md` (#4 roxo overuse, #5 WhatsApp helper, #6 tracking, #19 font weights). Tudo aqui é mecanismo de disciplina que blinda o resto do projeto. Nenhuma seção narrativa, nenhuma animação cinematográfica, nenhum form ainda — só a infraestrutura que torna **mecanicamente impossível** violar as decisões do brand book + invariantes do `STATE.md`.

A pesquisa confirma que o stack pinado em `STACK.md` (Next 15.5, React 19, Tailwind v4.3, Motion 12.38, Lenis 1.3.23, RHF 7.75, Zod 3.x) está correto e atualizado em maio 2026. Há **uma correção crítica** ao que o `STACK.md` e `CLAUDE.md` afirmam: **a opção `smoothTouch` foi removida do Lenis 1.x e substituída por `syncTouch`**. CONTEXT.md D-08 e success criteria 5 do ROADMAP precisam usar `syncTouch: false` (não `smoothTouch: false`), senão o option vai ser silenciosamente ignorado e o comportamento diverge do esperado em mobile.

**Primary recommendation:** Bootstrap com `create-next-app@latest --ts --tailwind --app --src-dir --import-alias "@/*"`, depois `shadcn init` (deixar `tailwind.config` em branco no `components.json` — é a flag oficial v4), instalar Lenis/Motion/RHF/Zod/Lucide/clsx/tw-merge em um único comando, e escrever os helpers `buildWhatsAppUrl`/`track`/`useDeviceTier` ANTES de qualquer atom UI ou provider. Provider tree exatamente na ordem `AnalyticsProvider > SmoothScrollProvider > MotionConfig` no `app/layout.tsx`. Brand lock do roxo via `@theme` declarando exclusivamente `--color-accent-primary`, `--color-accent-hover`, `--color-accent-glow` — Tailwind v4 não auto-gera shades para tokens namespaced fora de uma escala declarada.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Atoms UI (shadcn customizado):**
- **D-01:** Instalar shadcn essencial+interativos: `Button`, `Card`, `Input`, `Textarea`, `Label`, `Dialog`, `Sheet`, `Sonner` (toast). Outros componentes shadcn entram on-demand nas fases que precisarem.
- **D-02:** Todos os atoms recebem customização visual pesada — variants tailwind, microinterações, tipografia e cores próprias do brand book Likro. Objetivo: zero aparência genérica de shadcn/template.
- **D-03:** Referência visual: mistura **Linear + Stripe**. Peso/refinamento da Linear + profundidade/polish da Stripe. Premium editorial, high-end tech, moderna e viva. Evitar: developer tool genérica, startup IA clichê, interface fria demais.
- **D-04:** Atoms ganham polish premium completo nos micro-estados: transições suaves (200-300ms ease-out), hover/focus-visible/active/disabled bem resolvidos, respeitam `prefers-reduced-motion`. SEM ripple effects, SEM cursor-follow glow, SEM efeitos que chamem atenção pra si mesmos. Refinamento sem ostentação.
- **D-05:** Direção cromática crítica — equilíbrio editorial entre áreas escuras cinematográficas e áreas claras com respiro. **Quatro extremos a evitar simultaneamente**: branco demais, preto demais, glow demais (AI SaaS template), minimalismo frio extremo (clínico sem emoção). Translúcidos, shadows e glows existem mas são extremamente sutis e intencionais.

**Theme strategy (alternation escuro→claro→escuro):**
- **D-06:** Cada `<section>` declara seu próprio fundo via classes Tailwind tokenizadas (`bg-surface-dark` / `bg-surface-light` etc) e tokens de texto correspondentes. **Sem theme provider global, sem `next-themes`, sem `data-theme`, sem JS de troca de tema.**
- **D-07:** Razão: a alternation é determinística por seção, não preferência do usuário.

**Composição do CTA WhatsApp:**
- **D-08:** Componente `<WhatsAppCta>` com API **híbrida**: variants pré-definidas (`primary`, `secondary`, `floating`, `inline`) + slot opcional `children`.
- **D-09:** Componente é o único ponto de criação de CTA WhatsApp na landing — encapsula URL building (via `buildWhatsAppUrl` helper interno), tracking (`track('whatsapp_click', { location })`), estado de loading e abertura do link.
- **D-10:** Feedback ao clicar: **loading 200-300ms** (spinner sutil) → tracking dispara → abre `wa.me/...`. Garante que evento de analytics envia antes do unload do browser.
- **D-11:** Ícone: SVG oficial do WhatsApp embarcado como componente (`<WhatsAppIcon />`), com `currentColor`.
- **D-12:** Mensagem pré-preenchida (`?text=`) por `location`: mapa central em `src/content/whatsapp.ts`. Claude rascunha cada mensagem, Lenny aprova no PR.

**Enforcement mecânico do roxo:**
- **D-13:** Paleta enxuta declarada no `@theme` do Tailwind v4 (em `globals.css`):
  - **Accent:** `accent.primary` (#7C3AED), `accent.hover` (#6D28D9), `accent.glow` (rgba sutil)
  - **Surface:** `surface.dark` (#0A0A0B ou tom editorial calibrado), `surface.darker`, `surface.light` (off-white não-clínico, ex: #FAFAF9), `surface.lighter`
  - **Text:** `text.primary`, `text.secondary`, `text.muted` — variantes pra contexto dark e light
  - **Border:** `border.subtle`, `border.default`
  - **Neutrals:** `neutral.50..900` (Stone ou Zinc calibrado pra não ser frio)
- **D-14:** Tokens roxo são **apenas** `accent.primary`, `accent.hover`, `accent.glow`. Sem `accent.50/100/200/.../900`. Tailwind v4 não gera o CSS que não foi declarado.
- **D-15:** Sem ESLint custom adicional na v1 — `@theme` restrito é proteção suficiente.
- **D-16:** Regra prática (revisão visual): roxo nunca é protagonista de área. Permitido em CTAs, badges/chips, ícones ativos, focus rings, dots/indicators, texto de destaque pontual. Proibido em fundos de seção, cards inteiros grandes, gradients ocupando viewport.
- **D-17:** Documentação leve: comentário curto no `globals.css` junto à declaração dos tokens.

**Estrutura de pastas e path aliases:**
- **D-18:** Estrutura baseada em `src/`:
  ```
  src/
    app/           # App Router
    components/
      ui/          # Atoms shadcn customizados
      motion/      # Primitivas de animação (Phase 2 popula)
      layout/      # Header, Footer, ScrollProgress
      providers/   # AnalyticsProvider, SmoothScrollProvider, MotionConfigProvider
    sections/      # Phase 3+
    lib/           # Helpers
    hooks/         # useDeviceTier, useScrollProgress, useInView, useLenis, useAnalyticsEvent
    content/       # Copy + image manifests
  ```
- **D-19:** Path alias único: `@/*` apontando pra `src/`. Sem aliases segmentados.
- **D-20:** Cada seção narrativa (Phase 3+) é pasta isolada com co-locação completa.
- **D-21:** Copy centralizada em `src/content/*.ts`.

### Claude's Discretion

- Estrutura interna do `track()` (UUID via `crypto.randomUUID()` vs `nanoid`, dedupe via Set in-memory vs nenhum) — entrega o contrato, escolha simples.
- Sub-pacotes do Lucide React a importar (tree-shake correto).
- Estratégia da OG image: começar com `app/opengraph-image.tsx` dinâmico.
- Exact pixel breakpoints do `useDeviceTier()` (sugestão: mobile ≤640, tablet ≤1023, desktop ≥1024, reduced via `prefers-reduced-motion`).
- Inter font weights: 400/500/700; subset Latin only ou Latin+Latin-ext.
- Configuração inicial do Lenis no `SmoothScrollProvider`: `smoothWheel: true`, `syncTouch: false`, `lerp: 0.1`, skip init em `prefers-reduced-motion`.
- Naming/estrutura interna dos atoms shadcn customizados — mantenha kebab-case shadcn (`button.tsx`).
- Estratégia exata de variants do `<WhatsAppCta>` (cva config).

### Deferred Ideas (OUT OF SCOPE)

- ESLint custom rule pra blindar contra `bg-accent-*` indevido — pode entrar em milestone futuro.
- Aliases segmentados (`@components/`, `@lib/`, `@sections/`) — descartados.
- `next-themes` ou theme provider global — descartado.
- Outros componentes shadcn (Tooltip, Form module, Popover, DropdownMenu, Tabs) — on-demand quando seção/feature pedir.
- Variants extras do `<WhatsAppCta>` além de `primary`/`secondary`/`floating`/`inline`.
- Helper de UTM tracking acoplado ao `buildWhatsAppUrl` — Phase 5.
- Cookie banner LGPD compliance — fora de escopo v1.
- CMS pra copy — fora de escopo v1.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FOUND-01** | Scaffold Next.js 15.5 com App Router, TypeScript estrito, ESLint + Prettier configurados | `create-next-app` com flags `--ts --app --src-dir --tailwind --import-alias "@/*"`; tsconfig com `"strict": true`; adicionar `eslint-plugin-tailwindcss` + `prettier-plugin-tailwindcss` (seção "Bootstrap & Stack") |
| **FOUND-02** | Tailwind CSS v4 configurado com tokens do brand book Likro via `@theme` em `globals.css` (cores, tipografia Inter, espaçamentos, bordas 10px/12px) | `@theme` block completo em `src/app/globals.css` (seção "Tailwind v4 — Brand Lock Pattern"). Bordas 10/12px via `--radius-md: 0.625rem`, `--radius-lg: 0.75rem`. |
| **FOUND-03** | Roxo `#7C3AED` definido **apenas** como `accent.primary` na config Tailwind — sem `bg-accent-50/100/200/...` disponíveis | Tailwind v4 NÃO auto-gera shades quando você declara `--color-accent-primary` isolado. `bg-accent-50` vira classe inexistente — não aparece no output CSS. (seção "Tailwind v4 — Brand Lock Pattern" + "Validation: provando que `bg-accent-50` não existe") |
| **FOUND-04** | Tipografia Inter via `next/font` com no máximo 3 pesos (Regular 400, Medium 500, Bold 700) e `font-display: swap` | Inter é variable font; importar com `weight: ['400','500','700']` força 3 pesos. `display: 'swap'` é default. `variable: '--font-inter'` cola com Tailwind `@theme`. (seção "Font — Inter via next/font") |
| **FOUND-05** | Helper `cn()` (clsx + tailwind-merge) disponível em `lib/utils.ts` | Padrão shadcn idiomático — `cn = (...inputs) => twMerge(clsx(inputs))`. Já vem no template shadcn. |
| **FOUND-06** | Hook `useDeviceTier()` retornando `'reduced' \| 'mobile' \| 'tablet' \| 'desktop'` | Hook client-side baseado em `useReducedMotion` (motion/react) + `window.matchMedia`. Snippet completo na seção "Hooks essenciais". |
| **FOUND-07** | Provider tree em `app/layout.tsx`: `AnalyticsProvider > SmoothScrollProvider (Lenis) > MotionConfigProvider > children`, em um único loop RAF | Provider tree na seção "Provider Architecture". Lenis com `autoRaf: true` (default da v1.3) gerencia RAF interno único. |
| **FOUND-08** | Provider `SmoothScrollProvider` configurado com `smoothWheel: true`, `smoothTouch: false` sempre, e `skip init` quando `prefers-reduced-motion` ativo | **CORREÇÃO CRÍTICA:** Lenis 1.x renomeou `smoothTouch` para `syncTouch`. Use `syncTouch: false`. Skip init via `useReducedMotion()` retornando children sem `<ReactLenis>` wrapper. (seção "SmoothScrollProvider — Lenis 1.3.x") |
| **FOUND-09** | Atoms UI implementados — `<Button>`, `<Container>`, `<Headline>`, `<Card>`, `<WhatsAppCta>` — com variantes alinhadas ao brand book | shadcn fornece `Button`, `Card` base; customizar variants via cva. `<Container>` e `<Headline>` próprios (não-shadcn). `<WhatsAppCta>` é wrapper de `<Button>` que injeta `buildWhatsAppUrl + track`. (seção "Atoms UI") |
| **FOUND-10** | Metadata global em `app/layout.tsx` (title template, description, viewport, theme-color, manifest), favicon, OG image base e Open Graph defaults | Next.js Metadata API: `export const metadata: Metadata = {...}`. `app/icon.tsx` e `app/opengraph-image.tsx` para favicon e OG dinâmica. (seção "Metadata & SEO base") |
| **FOUND-11** | `robots.txt` e `sitemap.ts` configurados para permitir produção e bloquear previews `.vercel.app` | `app/robots.ts` retorna objeto com `rules` baseado em `process.env.VERCEL_ENV`. `app/sitemap.ts` retorna URLs estáticas. (seção "robots & sitemap") |
| **FOUND-12** | Rota `/dev` interna disponível apenas em desenvolvimento | `src/app/dev/page.tsx` chama `notFound()` quando `process.env.NODE_ENV === 'production'`. Tree-shaken em build de prod via dead code elimination. (seção "/dev route guard") |
| **CTA-01** | Único helper `buildWhatsAppUrl(message: string, location: string)` em `lib/whatsapp.ts` | Formato canônico mobile-friendly: `https://wa.me/<phone>?text=<encodeURIComponent(msg)>`. Phone via env `NEXT_PUBLIC_WA_NUMBER` (formato `5511XXXXXXXXX`, sem `+` nem espaços). (seção "WhatsApp Helper") |
| **CTA-02** | Helper proíbe `web.whatsapp.com` (lança erro em dev se alguém passar essa URL); validado por unit test | Defensive guard: se `message` ou `phone` contém substring `web.whatsapp.com` ou `api.whatsapp.com`, lança `Error('use wa.me/...')`. Vitest unit test verifica throw. (seção "WhatsApp Helper" + "Validation Architecture") |
| **TRACK-01** | Único módulo `lib/analytics.ts` expõe `track(event: string, payload: object)` que faz fan-out para Meta Pixel, GA4 e Microsoft Clarity | `track()` checa `typeof window !== 'undefined'` e fan-out para `window.fbq`, `window.gtag`, `window.clarity`. SSR-safe no-op. (seção "Analytics Module") |
| **TRACK-02** | Todo evento inclui `event_id` (UUID v4) gerado na origem para deduplicação client-side e futura integração com Meta CAPI sem retrofit | `crypto.randomUUID()` nativo (Node ≥14.17, Edge runtime, todos browsers modernos). Passar como 4º argumento do Pixel: `fbq('track', 'Contact', payload, { eventID })`. GA4 usa mesmo UUID em campo custom `event_id`. (seção "event_id pattern (Meta CAPI dedup)") |
| **TRACK-03** | Meta Pixel, GA4 e Clarity carregam via `<Script strategy="afterInteractive">` no `AnalyticsProvider` — não no `<head>`, não inline | Padrão oficial Next.js. GA4 pode usar `@next/third-parties/google`'s `<GoogleAnalytics>` (já wrappa `Script` corretamente). Pixel + Clarity via `<Script id="..." strategy="afterInteractive">`. (seção "Script loading strategy") |
</phase_requirements>

## Standard Stack

### Core (versões verificadas em npm registry, 2026-05-15)

| Library | Versão fixada | Latest npm | Purpose | Why Standard |
|---------|---------------|------------|---------|--------------|
| **Next.js** | `15.5.18` (latest 15.5 backport tag) | `16.2.6` (latest), `15.5.18` (backport) | App Router, RSC, metadata, image, font, script | `[VERIFIED: npm view next dist-tags]` Next 16 saiu mas STACK.md fixou 15.5 — corretíssimo. 15.5 tem 6 meses de battle-testing. |
| **React** | `^19.0.0` | `19.0.0+` | UI runtime | Bundled com Next 15.5. **Não overridar.** |
| **TypeScript** | `^5.6` | (latest 5.x) | Type safety | Não-negociável. |
| **Tailwind CSS** | `^4.3.0` | `4.3.0` | Utility CSS, design tokens via `@theme` | `[VERIFIED: npm view tailwindcss version]` v4 GA desde Jan 2025. CSS-first config crítica para brand lock. |
| **Motion** | `^12.38.0` | `12.38.0` | Animações React, `useScroll`, `useTransform`, `useReducedMotion`, `MotionConfig` | `[VERIFIED: npm view motion version]` Pacote renomeado de `framer-motion` → `motion`. Import: `from "motion/react"`. |
| **Lenis** | `^1.3.23` | `1.3.23` | Smooth scroll inertial, RAF-driven, `lenis/react` provider | `[VERIFIED: npm view lenis version]` Latest na linha 1.3.x. **Pacote correto: `lenis` (NÃO `@studio-freight/lenis`).** |

### Supporting (também verificados)

| Library | Versão fixada | Purpose | When to Use |
|---------|---------------|---------|-------------|
| **lucide-react** | `^1.16.0` | Ícones SVG tree-shakable | `[VERIFIED: npm view lucide-react versions]` **MUDANÇA: lucide-react saltou para 1.x.** STACK.md ainda lista `^0.460+`. Verificar com Lenny se quer fixar 1.x ou manter 0.x. APIs estáveis na transição. |
| **react-hook-form** | `^7.75.0` | Form state (Phase 5; helper `cn` e padrões instalados em Phase 1) | `[VERIFIED]` Não usado em Phase 1, mas pode instalar agora pra evitar churn. |
| **zod** | `^3.23+` | Schemas (Phase 5) | `[VERIFIED]` v4 também disponível mas STACK pinou 3.23+. **Manter 3.x na v1** — RHF resolvers ainda mais estáveis com Zod 3. |
| **@hookform/resolvers** | `^3.x` | Bridge RHF ↔ Zod | Instalar junto com RHF. |
| **clsx** | `^2.x` | Conditional classNames | Helper `cn()` precisa. |
| **tailwind-merge** | `^2.x` | Dedupe Tailwind classes | Helper `cn()` precisa. |
| **schema-dts** | `^1.1+` | Tipos JSON-LD (Phase 7; opcional Phase 1) | Pode adiar pra Phase 7. |
| **@next/third-parties** | `^15.5` | `<GoogleAnalytics>` component | Pacote oficial pra GA4 com hidratação correta no App Router. |
| **server-only** | `^0.0.1` | Marca módulos server-only | Para `lib/whatsapp.ts` se houver lógica server (provavelmente não na v1). |

### shadcn UI (instalar via CLI, não como dep direta)

shadcn não é uma dependência npm — é um CLI que **copia** componentes pro seu repo. Componentes a instalar (D-01):
- `button`, `card`, `input`, `textarea`, `label`, `dialog`, `sheet`, `sonner`

Cada componente vira um arquivo em `src/components/ui/<name>.tsx` que você customiza livremente. Atualização = re-rodar o CLI ou editar manualmente.

### Dev Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | `eslint-config-next` (já vem). Adicionar `eslint-plugin-tailwindcss` para ordem de classes. |
| **Prettier** | `prettier-plugin-tailwindcss` para auto-sort de utilities. |
| **Turbopack** | Default em `next dev` desde 15.0. Manter. |
| **Vitest** | Para unit tests do `buildWhatsAppUrl`, `track()`, `useDeviceTier`. **Não no STACK.md ainda — adicionar.** |
| **@testing-library/react** | Companion do Vitest para testes de componentes/hooks (smoke tests do provider tree). |
| **@next/bundle-analyzer** | Pre-launch (Phase 7). |

### Bootstrap & Stack — comandos

```bash
# 1. Scaffold (responde aos prompts: TS yes, ESLint yes, Tailwind yes, src dir yes, App Router yes, alias @/*)
npx create-next-app@15.5 landing-page --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

cd landing-page

# 2. Core animation + scroll
npm install motion lenis

# 3. Forms (instalar agora para evitar churn em Phase 5)
npm install react-hook-form zod @hookform/resolvers

# 4. Utilities
npm install clsx tailwind-merge

# 5. Icons
npm install lucide-react

# 6. Analytics helper
npm install @next/third-parties

# 7. Dev tooling
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npm install -D prettier prettier-plugin-tailwindcss eslint-plugin-tailwindcss

# 8. shadcn init (Tailwind v4 — DEIXAR tailwind config em branco no components.json)
npx shadcn@latest init

# 9. Atoms (D-01)
npx shadcn@latest add button card input textarea label dialog sheet sonner

# NOT INSTALLED na v1 (reservado pra fases futuras):
# npm install gsap @gsap/react       # Phase 4 se necessário; v1 não usa
# npm install schema-dts             # Phase 7 SEO
# npm install server-only            # Phase 5 form actions
```

## Architecture Patterns

### Recommended Project Structure (greenfield, segue D-18/19)

```
landing-page/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # RSC; root metadata + provider tree
│   │   ├── page.tsx                # RSC; landing principal (Phase 3+)
│   │   ├── globals.css             # Tailwind v4 @theme + brand tokens
│   │   ├── opengraph-image.tsx     # OG dinâmica (Phase 1 placeholder, Phase 7 polish)
│   │   ├── icon.tsx                # Favicon
│   │   ├── sitemap.ts              # Sitemap estático
│   │   ├── robots.ts               # Robots dependente de VERCEL_ENV
│   │   ├── dev/
│   │   │   └── page.tsx            # /dev showcase — notFound() em prod
│   │   └── api/
│   │       └── lead/
│   │           └── route.ts        # Phase 5 — placeholder vazio em Phase 1
│   ├── components/
│   │   ├── ui/                     # shadcn customizados (D-01/02)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── label.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── container.tsx       # Próprio (não-shadcn)
│   │   │   ├── headline.tsx        # Próprio (não-shadcn)
│   │   │   ├── whatsapp-cta.tsx    # Wrapper de Button + buildWhatsAppUrl + track
│   │   │   └── whatsapp-icon.tsx   # SVG oficial WhatsApp (D-11)
│   │   ├── motion/                 # Phase 2 popula
│   │   │   └── .gitkeep
│   │   ├── layout/                 # Header, Footer (Phase 3+)
│   │   │   └── .gitkeep
│   │   └── providers/
│   │       ├── analytics-provider.tsx
│   │       ├── smooth-scroll-provider.tsx
│   │       └── motion-config-provider.tsx
│   ├── sections/                   # Phase 3+ popula
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── utils.ts                # cn()
│   │   ├── whatsapp.ts             # buildWhatsAppUrl + guards
│   │   ├── analytics.ts            # track() + event_id
│   │   ├── seo.ts                  # SEO helpers (Phase 7 popula JSON-LD)
│   │   └── env.ts                  # Type-safe env access
│   ├── hooks/
│   │   ├── use-device-tier.ts
│   │   ├── use-lenis.ts            # Re-export de lenis/react
│   │   ├── use-scroll-progress.ts  # Phase 2
│   │   ├── use-in-view.ts          # Phase 2
│   │   └── use-analytics-event.ts  # Phase 6 — placeholder ok em Phase 1
│   └── content/
│       ├── whatsapp.ts             # Mapa location → mensagem (D-12)
│       └── meta.ts                 # SEO copy
├── public/
│   ├── images/                     # Phase 4
│   ├── logos/
│   │   ├── likro-logo.svg          # Copiar de ../logos_likro/
│   │   └── likro-logo.png
│   ├── fonts/                      # next/font self-host (auto)
│   └── favicon.ico                 # Auto-gerado por app/icon.tsx
├── tests/
│   ├── lib/
│   │   ├── whatsapp.test.ts
│   │   └── analytics.test.ts
│   └── setup.ts
├── components.json                 # shadcn config (Tailwind v4: tailwind.config blank)
├── next.config.ts
├── tsconfig.json                   # paths: { "@/*": ["./src/*"] }
├── vitest.config.ts
├── eslint.config.mjs
├── .prettierrc
├── .env.local.example
└── package.json
```

### Pattern 1: Tailwind v4 — Brand Lock Pattern (FOUND-02, FOUND-03)

**What:** Tailwind v4 reverteu config para CSS-first via `@theme {}` em `globals.css`. **Princípio crítico para o brand lock**: cada `--color-<name>` declarado vira EXATAMENTE uma utility class — `--color-accent-primary` gera `bg-accent-primary` apenas. Tailwind **não auto-gera** shades 50/100/200 a menos que você as declare explicitamente.

**Source quote (verified, Context7-grade):**
> "Theme variables are defined in _namespaces_ and each namespace corresponds to one or more utility class or variant APIs. Defining new theme variables in these namespaces will make new corresponding utilities and variants available in your project." `[CITED: tailwindcss.com/docs/theme]`

> "You can name your theme variables whatever you want within these namespaces, and a corresponding utility with the same name will become available to use in your HTML." `[CITED: tailwindcss.com/docs/theme]`

**When to use:** Sempre. Esta é a defesa mecânica do risco crítico #4 (roxo overuse).

**Example — `src/app/globals.css`:**

```css
@import "tailwindcss";

/* ──────────────────────────────────────────────────────────────────
   Likro Brand Tokens (Phase 1 — não modificar sem aprovação)

   REGRA: roxo é destaque, nunca protagonista. Permitido em:
     CTAs, badges, ícones ativos, focus rings, dots/indicators,
     texto de destaque pontual.
   PROIBIDO em: fundos de seção, cards inteiros, gradients de viewport.

   4 EXTREMOS A EVITAR (cromático):
     branco demais (sem personalidade) / preto demais (pesado)
     glow demais (AI SaaS) / minimalismo frio (clínico)
   ────────────────────────────────────────────────────────────────── */

@theme {
  /* ── Accent (roxo Likro) — ÚNICOS tokens roxo do sistema ── */
  --color-accent-primary: #7c3aed;
  --color-accent-hover: #6d28d9;
  --color-accent-glow: oklch(0.62 0.21 295 / 0.18); /* sutil pra rings/shadows */

  /* ── Surface (alternation escuro→claro→escuro por section) ── */
  --color-surface-dark: #0a0a0b;
  --color-surface-darker: #050506;
  --color-surface-light: #fafaf9;
  --color-surface-lighter: #ffffff;

  /* ── Text (variantes pra contexto dark e light) ── */
  --color-text-primary: #0a0a0b; /* default em superfícies claras */
  --color-text-secondary: #3f3f46;
  --color-text-muted: #71717a;
  --color-text-on-dark-primary: #fafafa;
  --color-text-on-dark-secondary: #d4d4d8;
  --color-text-on-dark-muted: #a1a1aa;

  /* ── Border ── */
  --color-border-subtle: oklch(0.92 0 0);
  --color-border-default: oklch(0.86 0 0);
  --color-border-on-dark-subtle: oklch(0.22 0 0);
  --color-border-on-dark-default: oklch(0.30 0 0);

  /* ── Neutrals (Stone calibrado, NÃO Zinc — evita "frio") ── */
  --color-neutral-50: #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;

  /* ── Typography (Inter via next/font CSS variable) ── */
  --font-sans: var(--font-inter), system-ui, sans-serif;

  /* ── Radii (brand book: 10px / 12px) ── */
  --radius-md: 0.625rem;  /* 10px */
  --radius-lg: 0.75rem;   /* 12px */

  /* ── Easing premium (Pitfall #11) ── */
  --ease-premium-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-premium-in: cubic-bezier(0.7, 0, 0.84, 0);
}

/* Body defaults — superfície clara como baseline; sections override */
body {
  font-family: var(--font-sans);
  background: var(--color-surface-light);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Validation: provando que `bg-accent-50` não existe**

Quando você escreve `<div class="bg-accent-50">` no JSX:
1. Tailwind v4 escaneia o JSX em build, identifica `bg-accent-50` como candidato
2. Tenta resolver `--color-accent-50` no `@theme` → **não existe**
3. Não emite CSS para essa classe
4. A classe vira no-op no DOM (existe na string, mas não tem regra CSS)

**Build NÃO quebra** (Tailwind v4 não emite warning para utilities desconhecidas) — isto é uma limitação que precisa ser compensada pela validation architecture (ver seção Validation):
- Unit test que faz grep por `bg-accent-\d+` no `src/**` e falha CI se encontrar
- Code review checklist explícito sobre uso de roxo

> **Heads-up para o planner:** o success criteria 1 do ROADMAP fala "tentar usar shade não-existente quebra build". **Tecnicamente Tailwind v4 não quebra** — a classe vira no-op silencioso. A defesa real é (a) tokens não existirem + (b) grep test no CI + (c) review visual do D-16. Plano deve refletir isso, não prometer um build error que Tailwind v4 não fornece.

### Pattern 2: SmoothScrollProvider — Lenis 1.3.x (FOUND-07, FOUND-08)

**What:** Singleton Lenis no root, RAF único gerenciado internamente pela lib (`autoRaf: true` é default na 1.3), respeitando `prefers-reduced-motion`.

**CORREÇÃO CRÍTICA do CONTEXT.md / STACK.md / CLAUDE.md:**

| Decision | CONTEXT.md / STACK.md diz | Lenis 1.3.x exige | Razão |
|----------|---------------------------|--------------------|-------|
| Touch behavior | `smoothTouch: false` | **`syncTouch: false`** | `smoothTouch` foi REMOVIDO em Lenis 1.x; substituído por `syncTouch` (e `syncTouchLerp`). Passar `smoothTouch` é silenciosamente ignorado. `[CITED: github.com/darkroomengineering/lenis README + community guides 2026]` |

**Example — `src/components/providers/smooth-scroll-provider.tsx`:**

```tsx
"use client";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { PropsWithChildren } from "react";

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const reduced = useReducedMotion();

  // FOUND-08: skip init em prefers-reduced-motion → native scroll
  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,           // ajustar com base em sensação real (D-Discretion)
        duration: 1.1,
        smoothWheel: true,   // FOUND-08
        syncTouch: false,    // CORRIGIDO de smoothTouch (Lenis 1.x)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

`[CITED: motion.dev/docs/react-use-reduced-motion]` — `useReducedMotion` retorna `true` quando OS reduce-motion está ativo, atualiza reativamente.

`[CITED: lenis/react README via npm]` — `<ReactLenis root>` instala uma instância global acessível via `useLenis()` em qualquer componente filho. RAF é gerenciado internamente.

### Pattern 3: MotionConfigProvider (FOUND-07)

**What:** Wrapper sistêmico que aplica `reducedMotion="user"` para que TODA `motion.*` no app respeite OS reduce-motion sem precisar de prop por componente.

**Source quote:**
> `"user"` means to "Respect the user's device setting." This automatically disables transform and layout animations when a user has enabled reduced motion preferences on their OS. However, other animations like opacity and backgroundColor remain active. `[CITED: motion.dev/docs/react-motion-config]`

**Example — `src/components/providers/motion-config-provider.tsx`:**

```tsx
"use client";
import { MotionConfig } from "motion/react";
import type { PropsWithChildren } from "react";

export function MotionConfigProvider({ children }: PropsWithChildren) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
```

### Pattern 4: AnalyticsProvider — `<Script strategy="afterInteractive">` + fan-out (TRACK-01, TRACK-03)

**What:** Componente client que monta os 3 scripts (Pixel, GA4 via `@next/third-parties`, Clarity) com a strategy correta. Não dispara eventos — só carrega vendors e os deixa prontos para `track()`.

**Source quotes:**
> "afterInteractive — Load the script after the page becomes interactive." `[CITED: nextjs.org/docs/app/api-reference/components/script]` — strategy correta para analytics em landing pages.

> "When setting up Microsoft Clarity script, do not use the id `clarity` for your `Script` element, as this can create conflicts with elements the script tries to create." `[CITED: dilhanziriwardhana medium guide on Clarity + Next App Router]`

**Example — `src/components/providers/analytics-provider.tsx`:**

```tsx
"use client";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { PropsWithChildren } from "react";
import { env } from "@/lib/env";

export function AnalyticsProvider({ children }: PropsWithChildren) {
  return (
    <>
      {children}

      {/* GA4 via @next/third-parties — handles route changes corretamente */}
      {env.NEXT_PUBLIC_GA4_ID && (
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA4_ID} />
      )}

      {/* Meta Pixel */}
      {env.NEXT_PUBLIC_META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${env.NEXT_PUBLIC_META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Microsoft Clarity — id NÃO pode ser "clarity" (conflita com window.clarity) */}
      {env.NEXT_PUBLIC_CLARITY_ID && (
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${env.NEXT_PUBLIC_CLARITY_ID}");
            `,
          }}
        />
      )}
    </>
  );
}
```

**Graceful degradation:** se env var faltando, o script simplesmente não monta. `lib/analytics.ts` `track()` faz `window.fbq?.(...)` (optional chain) → no-op silencioso. Local dev sem `.env.local` funciona.

### Pattern 5: Provider Tree — `app/layout.tsx` (FOUND-07)

**What:** Ordem exata `AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children`. Analytics fora do Lenis (não re-renderiza no scroll). Lenis fora de MotionConfig (Lenis precisa do hook `useReducedMotion` que vem de `motion/react`, mas chama dentro do provider tree onde MotionConfig já existe? Não — `useReducedMotion` lê `window.matchMedia` direto, independe de `MotionConfig`. Tudo OK).

**Example — `src/app/layout.tsx`:**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { MotionConfigProvider } from "@/components/providers/motion-config-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// FOUND-04: Inter, 3 pesos, swap, variable CSS
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true, // CLS prevention
});

export const metadata: Metadata = {
  metadataBase: new URL("https://likro.com.br"),
  title: {
    default: "Likro — Operação comercial moderna para clínicas",
    template: "%s · Likro",
  },
  description: "CRM, atendimento multicanal e automação com IA — feito para clínicas e estéticas brasileiras.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://likro.com.br",
    siteName: "Likro",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b", // surface-dark — NÃO o roxo (regra D-16)
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {/* FOUND-07: ordem exata — Analytics > SmoothScroll > MotionConfig */}
        <AnalyticsProvider>
          <SmoothScrollProvider>
            <MotionConfigProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </MotionConfigProvider>
          </SmoothScrollProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### Pattern 6: WhatsApp Helper (CTA-01, CTA-02)

**What:** Único ponto de criação de URL WhatsApp. Defensive guards bloqueiam URL desktop-only.

**Mobile deeplink correctness (Brazil-specific):**
- Formato canônico: `https://wa.me/<phone>?text=<encoded>` `[CITED: WhatsApp official + community 2026]`
- Phone: country code 55 + DDD + número, **SEM `+`, SEM espaços, SEM `-`**
- DDDs 11-19, 21, 22, 24, 27, 28: 11 dígitos (com 9 prefixo) → `5511XXXXXXXXX` (13 chars total)
- Outros DDDs: 10 dígitos → `5512XXXXXXXX` (12 chars total)
- `web.whatsapp.com` abre WhatsApp Web (browser tab) — inutilizável em mobile
- `api.whatsapp.com/send` adiciona interstitial — degrada UX

**Example — `src/lib/whatsapp.ts`:**

```ts
import { env } from "@/lib/env";

const FORBIDDEN_HOSTS = ["web.whatsapp.com", "api.whatsapp.com"];

/** CTA-04: location é a chave do mapa em src/content/whatsapp.ts */
export type WhatsAppLocation =
  | "hero"
  | "pain"
  | "product"
  | "how"
  | "proof"
  | "footer"
  | "floating";

/**
 * CTA-01: ÚNICO ponto de construção de URL WhatsApp na codebase.
 * CTA-02: Lança erro se mensagem ou número contém host desktop-only.
 *
 * @example
 *   buildWhatsAppUrl("Oi! Vi a Likro no Instagram", "hero")
 *   → "https://wa.me/5511999999999?text=Oi!%20Vi%20a%20Likro%20no%20Instagram"
 */
export function buildWhatsAppUrl(message: string, location: WhatsAppLocation): string {
  // CTA-02 guard: bloqueia hosts proibidos em qualquer parte do input
  for (const host of FORBIDDEN_HOSTS) {
    if (message.includes(host)) {
      throw new Error(
        `[buildWhatsAppUrl] Forbidden host "${host}" found in message. ` +
        `Use wa.me/<phone>?text=... format only. Caller location: ${location}`,
      );
    }
  }

  const phone = env.NEXT_PUBLIC_WA_NUMBER;
  if (!phone) {
    // Permite dev sem env var, mas avisa
    if (process.env.NODE_ENV !== "production") {
      console.warn("[buildWhatsAppUrl] NEXT_PUBLIC_WA_NUMBER missing — using placeholder");
      return `https://wa.me/0000000000?text=${encodeURIComponent(message)}`;
    }
    throw new Error("[buildWhatsAppUrl] NEXT_PUBLIC_WA_NUMBER missing in production");
  }

  // Validação: phone deve ser 12-13 dígitos, só números
  if (!/^\d{12,13}$/.test(phone)) {
    throw new Error(
      `[buildWhatsAppUrl] Invalid phone format: "${phone}". ` +
      `Expected 12-13 digits (55 + DDD + number, no spaces/+/dashes).`,
    );
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
```

**Example — `src/content/whatsapp.ts` (D-12):**

```ts
import type { WhatsAppLocation } from "@/lib/whatsapp";

/**
 * D-12: Mensagens pré-preenchidas por location.
 * Claude rascunha, Lenny aprova no PR antes da seção entrar em dev.
 *
 * Phase 1 entrega placeholders aprovados pelo Lenny ao final desta fase.
 */
export const WHATSAPP_MESSAGES: Record<WhatsAppLocation, string> = {
  hero: "Oi! Vi a Likro no Instagram e quero entender como funciona pra minha clínica.",
  pain: "Oi! Tô com dificuldade pra organizar o atendimento da clínica — pode me explicar como a Likro ajuda?",
  product: "Oi! Vi os recursos da Likro e quero conversar sobre como aplicar na minha clínica.",
  how: "Oi! Quero entender como ficaria o fluxo de lead do Instagram até a marcação.",
  proof: "Oi! Quero conversar sobre a Likro pra minha clínica.",
  footer: "Oi! Quero saber mais sobre a Likro.",
  floating: "Oi! Quero conversar sobre a Likro.",
};
```

### Pattern 7: Analytics Module — `track()` com `event_id` (TRACK-01, TRACK-02)

**What:** Único `track()` faz fan-out para Pixel/GA4/Clarity. **`event_id` UUID v4 em CADA evento desde o dia 1** — retrofit Meta CAPI futuro fica zero-cost.

**Source quotes:**
> "If you're implementing the Meta Pixel alongside the Conversions API, we recommend you include the eventID parameter as a fourth parameter to the fbq('track') function. For example: `fbq('track', 'PageView', {}, {eventID: '...'})`. Then add the event ID parameter to the Facebook event you want to measure." `[CITED: developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events]`

> "crypto.randomUUID() is available as the Edge Runtime alternative to Node.js uuid packages. Generates v4 UUIDs using a cryptographically secure random number generator." `[CITED: nextjs.org/docs/api-reference/edge-runtime + MDN Crypto.randomUUID]`

> "For Lead/CompleteRegistration events, use server lead ID if available or client UUID. The event_id must be a unique string that you generate once per user action and then pass to both the Pixel and the Conversions API." `[CITED: bradfarleigh.com 2026 article on event_id parameter]`

**Example — `src/lib/analytics.ts`:**

```ts
/**
 * TRACK-01: ÚNICO ponto de fan-out para Meta Pixel, GA4 e Microsoft Clarity.
 * TRACK-02: event_id UUID v4 attached to every event for future Meta CAPI dedup.
 *
 * Componentes JAMAIS chamam window.fbq, window.gtag, window.clarity diretamente.
 */

// Event registry — adicionar eventos novos aqui (type-safe)
export type AnalyticsEvent =
  | "whatsapp_click"     // {location: WhatsAppLocation}
  | "cta_click"          // {location, label}
  | "form_focus"         // {field}
  | "form_submit_attempt"
  | "form_submit_success"
  | "form_submit_error"  // {message}
  | "section_view"       // {section}
  | "scroll_depth";      // {percent: 25|50|75|100}

type Payload = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      event: string,
      payload?: Payload,
      options?: { eventID?: string },
    ) => void;
    gtag?: (action: "event", event: string, payload?: Payload) => void;
    clarity?: (action: string, ...args: unknown[]) => void;
  }
}

// Map de eventos internos → standard Meta Pixel event names
const META_EVENT_MAP: Partial<Record<AnalyticsEvent, string>> = {
  whatsapp_click: "Contact",
  form_submit_success: "Lead",
};

/**
 * TRACK-02: Gera UUID v4 cryptographically secure.
 * Funciona em browser modernos, Node 14.17+, Edge runtime.
 */
function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback ultra-defensivo (não deve ser atingido em browsers/runtimes alvo)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return; // SSR no-op

  const event_id = generateEventId();
  const enriched = { ...payload, event_id };

  // GA4 — via window.gtag (instalado por @next/third-parties' <GoogleAnalytics>)
  window.gtag?.("event", event, enriched);

  // Meta Pixel — usa standard event quando aplicável
  const metaEvent = META_EVENT_MAP[event];
  if (metaEvent) {
    window.fbq?.("track", metaEvent, payload, { eventID: event_id });
  } else {
    window.fbq?.("trackCustom", event, payload, { eventID: event_id });
  }

  // Microsoft Clarity — custom event
  window.clarity?.("event", event);
  // Optional: tag session com event_id pra correlação manual em recordings
  window.clarity?.("set", "last_event_id", event_id);

  // Dev observability
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, enriched);
  }
}
```

### Pattern 8: `useDeviceTier` Hook (FOUND-06)

**What:** Hook único que retorna o tier para todas as primitivas (Phase 2) e seções (Phase 3+) escolherem motion config.

**Example — `src/hooks/use-device-tier.ts`:**

```ts
"use client";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type DeviceTier = "reduced" | "mobile" | "tablet" | "desktop";

export function useDeviceTier(): DeviceTier {
  const reduced = useReducedMotion();
  const [tier, setTier] = useState<DeviceTier>("desktop");

  useEffect(() => {
    if (reduced) {
      setTier("reduced");
      return;
    }
    const compute = (): DeviceTier => {
      if (window.matchMedia("(max-width: 639px)").matches) return "mobile";
      if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
      return "desktop";
    };
    setTier(compute());
    const onResize = () => setTier(compute());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [reduced]);

  return tier;
}
```

### Pattern 9: `/dev` Route Guard (FOUND-12)

**What:** Rota acessível em dev, retorna 404 em produção via `notFound()` checando `process.env.NODE_ENV`.

**Sobre dead-code elimination:** `process.env.NODE_ENV` é substituído em build time por Next/Webpack. O bloco `if ('production' === 'production') notFound()` é estaticamente eliminado da bundle de prod via tree-shaking — o conteúdo do showcase NÃO é shipado para usuários finais. Confirmado pelo padrão oficial do Next ao usar `process.env.NODE_ENV`.

**Example — `src/app/dev/page.tsx`:**

```tsx
import { notFound } from "next/navigation";

// FOUND-12: rota interna pra showcase de primitivas, atoms e (Phase 2+) seções
export default function DevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-surface-light p-8">
      <h1 className="text-2xl font-bold text-text-primary">Likro · /dev</h1>
      <p className="mt-2 text-text-muted">
        Showcase interno — disponível apenas em desenvolvimento.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Atoms (Phase 1)</h2>
        {/* TODO Phase 1: Button variants, WhatsAppCta variants, Card, Input, Sonner trigger */}
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Motion Primitives (Phase 2)</h2>
        <p className="text-text-muted">Será populado na Phase 2.</p>
      </section>
    </main>
  );
}
```

### Pattern 10: `robots.ts` & `sitemap.ts` (FOUND-11)

**What:** Robots dinâmico baseado em `VERCEL_ENV` para preview = noindex.

**Example — `src/app/robots.ts`:**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: isProd
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: isProd ? "https://likro.com.br/sitemap.xml" : undefined,
  };
}
```

**Example — `src/app/sitemap.ts`:**

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://likro.com.br",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
```

### Pattern 11: Type-safe env — `src/lib/env.ts`

**What:** Wrapper que valida `process.env.NEXT_PUBLIC_*` em build, retorna `undefined` para vars opcionais ausentes (analytics graceful degradation).

```ts
/**
 * Type-safe access a env vars NEXT_PUBLIC_*.
 * Vars opcionais retornam undefined; lib/analytics e lib/whatsapp tratam graceful.
 */
export const env = {
  NEXT_PUBLIC_WA_NUMBER: process.env.NEXT_PUBLIC_WA_NUMBER,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
} as const;
```

E `.env.local.example`:

```bash
# WhatsApp — número OFICIAL Likro (formato: 5511XXXXXXXXX, sem + nem espaços)
NEXT_PUBLIC_WA_NUMBER=5511000000000

# Analytics (Phase 6 valida nos dashboards reais; Phase 1 só monta scripts)
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CLARITY_ID=

# Phase 5 — webhook de form
LEAD_WEBHOOK_URL=
```

### Atoms UI — Pattern shadcn customizado (FOUND-09)

shadcn fornece o esqueleto. Customização (D-02, D-03, D-04) acontece nos arquivos `src/components/ui/*.tsx` — você É dono deles, não há upgrade automático.

**`<WhatsAppCta>` — wrapper padrão (D-08, D-09, D-10, D-11):**

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl, type WhatsAppLocation } from "@/lib/whatsapp";
import { WHATSAPP_MESSAGES } from "@/content/whatsapp";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "floating" | "inline";

type Props = {
  variant?: Variant;
  location: WhatsAppLocation;
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

export function WhatsAppCta({
  variant = "primary",
  location,
  label,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    track("whatsapp_click", { location });
    // D-10: 200-300ms loading antes de abrir, garante envio de evento
    await new Promise((r) => setTimeout(r, 250));
    const url = buildWhatsAppUrl(WHATSAPP_MESSAGES[location], location);
    window.open(url, "_blank", "noopener,noreferrer");
    setLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        // Variants são exemplos; cva final na implementação
        variant === "primary" && "bg-accent-primary text-white hover:bg-accent-hover",
        variant === "secondary" && "border border-accent-primary text-accent-primary",
        variant === "floating" && "fixed bottom-4 right-4 rounded-full size-14 shadow-lg",
        variant === "inline" && "inline-flex h-auto p-0 text-accent-primary underline",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <WhatsAppIcon className="size-4" />
      )}
      {children ?? label ?? "Falar no WhatsApp"}
    </Button>
  );
}
```

### Anti-Patterns to Avoid (Phase 1-specific)

- **`smoothTouch: true` no Lenis**: opção foi removida na 1.x; mesmo se aceita, smoothing em mobile é universalmente percebido como bug. `syncTouch: false` sempre. (Pitfall #1)
- **Múltiplas instâncias de Lenis**: nunca chamar `new Lenis()` em useEffect inline em sections. Único `<ReactLenis root>` no provider tree. (Pitfall #1, ARCHITECTURE.md anti-pattern 1)
- **`"use client"` no `app/layout.tsx`**: layout é Server Component; só os providers internos são client. Bubbling `"use client"` mata SEO/FCP. (Pitfall #10, ARCHITECTURE.md anti-pattern 3)
- **Múltiplos `priority` em `<Image>`**: nenhum em Phase 1 (sem imagens ainda); regra entra em vigor no Hero (Phase 3). (Pitfall #6)
- **Chamar `window.fbq`/`gtag`/`clarity` direto em componentes**: SEMPRE via `track()`. (Pitfall #6)
- **Copy hard-coded em JSX**: STATE.md invariant. Phase 1 ainda não tem copy de seção, mas atoms (e.g., texto default do `<WhatsAppCta>`) devem ser parametrizáveis.
- **Usar `framer-motion` (pacote velho)**: instalar `motion`, importar de `motion/react`.
- **Usar `@studio-freight/lenis` ou `@studio-freight/react-lenis`**: deprecated. `lenis` + `lenis/react`.
- **Adicionar shades de roxo**: `--color-accent-50/100/...` viola D-14 e ressuscita Pitfall #4.

## Don't Hand-Roll

| Problema | Don't Build | Use Instead | Why |
|----------|-------------|-------------|-----|
| Smooth scroll inertial | useEffect + scroll listener + lerp manual | `lenis` + `lenis/react` `<ReactLenis root>` | Passive listener bugs, RAF coordenação, cleanup, mobile detection — Lenis tem 4 anos de battle-test |
| Detecção de prefers-reduced-motion | `window.matchMedia` + custom hook | `useReducedMotion` de `motion/react` | Já reativo, já SSR-safe, já alinhado com `MotionConfig reducedMotion="user"` |
| UUID v4 generation | uuid package, custom `Math.random` | `crypto.randomUUID()` nativo | Browser, Node 14.17+, Edge runtime — todos têm. Cryptographically secure. Zero deps. |
| GA4 setup com SPA route detection | Script tag + manual `gtag('config', ...)` no pathname change | `<GoogleAnalytics>` de `@next/third-parties/google` | Pacote oficial Next, monta com strategy correta, escuta `usePathname` automaticamente |
| Tailwind class merging | Template literals + manual de-dup | `cn()` = `clsx + tailwind-merge` | Padrão shadcn, resolve conflitos `bg-white bg-purple-50` corretamente |
| Atoms UI (Button, Card, Input, Dialog, Sheet, Toast) | Hand-rolled accessibility, focus mgmt, keyboard nav | shadcn (Radix UI primitives sob o capô) | A11y é não-negociável em premium B2B; Radix resolve focus trap, ARIA, keyboard, RTL |
| Toast/sonner | Custom toast queue/portal/animations | `sonner` (Emil Kowalski) | API minimalista, Radix-grade a11y, animações premium-feel, lib de fato em 2026 |
| Form validation | Custom regex + manual error rendering | `react-hook-form` + `zod` (Phase 5; instalar em Phase 1) | RHF: melhor perf React forms; Zod: schemas compartilhados client+server |
| Icons | SVG inline em todo componente | `lucide-react` tree-shake por ícone (~1KB cada) | RSC-safe, 1500+ icons, manutenção ativa |

**Key insight:** Phase 1 é a fase onde MAIS é tentador hand-roll ("é simples, é só uma landing"). Não é. O custo de maintaining um smooth-scroll custom + UUID custom + toast custom é maior que o custo de aprender as APIs idiomáticas de Lenis/crypto/sonner. Resistir.

## Common Pitfalls

### Pitfall A: `smoothTouch` ignorado silenciosamente em Lenis 1.x

**What goes wrong:** Você passa `smoothTouch: false` (como CONTEXT.md D-Discretion e success criteria 5 do ROADMAP afirmam). Lenis 1.x ignora — `smoothTouch` foi REMOVIDO. Resultado: smoothing pode ou não estar ativo em touch dependendo do default interno de `syncTouch`. Em dev você não nota; usuários iOS reclamam de scroll "estranho".

**Why it happens:** STACK.md, CLAUDE.md e CONTEXT.md foram escritos antes de o team confirmar a API atual da Lenis 1.x. Assumiu-se continuidade do nome.

**How to avoid:** Use `syncTouch: false` em vez de `smoothTouch: false`. Documentar a substituição em comentário no código.

**Warning signs:**
- iOS users reportam "scroll feels weird"
- DevTools Sources tab mostra Lenis sem prop `smoothTouch` mesmo após você passar
- Diff entre comportamento Chrome iOS vs Chrome desktop sem explicação

### Pitfall B: Provider tree na ordem errada

**What goes wrong:** Trocar a ordem para `MotionConfig > Lenis > Analytics`. Resultado: Analytics re-renderiza no scroll (custo INP), `MotionConfig reducedMotion="user"` não envolve Lenis (não é necessário envolver Lenis com `MotionConfig`, mas envolver Analytics com Lenis sim quebra perf).

**Why it happens:** Sem documentação visual da ordem, devs invertem por feel.

**How to avoid:** Comentário no `app/layout.tsx` explicando a ordem. Code review checklist.

**Warning signs:**
- React DevTools Profiler mostra `AnalyticsProvider` re-rendering em scroll events.

### Pitfall C: `bg-accent-50` aplicada sem build error (silent no-op)

**What goes wrong:** Tailwind v4 não emite warning para utilities desconhecidas. Dev escreve `bg-accent-50`, classe vai pro DOM, sem efeito visual, sem erro de build. Nicho: dev assume que "se compilou, está válido". Roxo overuse acumula em PRs subsequentes (alguém escreve `bg-accent-100` num card grande).

**Why it happens:** O sistema de design não FORÇA o erro — só não emite o CSS.

**How to avoid:**
1. Vitest test (ou ESLint custom rule futura) que faz grep por `bg-accent-\d+` em `src/**/*.{tsx,ts,css}` e falha se encontrar.
2. Code review checklist explícito: "novas classes `accent-*` exigem aprovação".
3. Documentação inline em `globals.css` (D-17) listando os 4 extremos cromáticos.

**Warning signs:**
- Screenshot dessaturada de uma seção mostra área roxa proeminente.
- Grep no codebase encontra `bg-accent-(?!primary|hover|glow)`.

### Pitfall D: WhatsApp helper deixa passar phone com `+` ou espaços

**What goes wrong:** Lenny configura `NEXT_PUBLIC_WA_NUMBER="+55 11 99999-9999"` (formato natural humano). Helper monta `https://wa.me/+55 11 99999-9999?text=...` → encoded url quebra → click vai pra erro do WhatsApp.

**How to avoid:** Validation regex `/^\d{12,13}$/` no helper, throw error em build/start. Documentar no `.env.local.example` o formato exato.

### Pitfall E: Clarity Script `id="clarity"` conflita com `window.clarity`

**What goes wrong:** Você nomeia `<Script id="clarity">`. Clarity script faz `document.querySelector("#clarity")` para auto-config — conflita, não inicializa.

**How to avoid:** Use `id="ms-clarity"` (ou qualquer outro). `[CITED: dilhan medium guide]`.

### Pitfall F: GA4 `pageview` duplicado por `<GoogleAnalytics>` + manual `gtag('config', ..., {send_page_view: true})`

**What goes wrong:** `@next/third-parties` `<GoogleAnalytics>` já dispara `page_view` em route changes. Se você também chamar `gtag('config', GA_ID, { send_page_view: true })` em algum useEffect, fica double-fire.

**How to avoid:** Confiar no `<GoogleAnalytics>` para page_view. `track()` cuida só de eventos custom (não chamar `gtag('config', ...)` manualmente).

### Pitfall G: `notFound()` em `/dev` em prod ainda inclui o componente no bundle

**What goes wrong:** Dev assume que `if (NODE_ENV === 'production') notFound()` remove o resto do componente do bundle. **Não remove sozinho.** Apenas o `if` é dead-code-eliminated — o JSX abaixo ainda é shipado no chunk de `/dev/page`.

**How to avoid:** Para Phase 1, OK — o conteúdo de `/dev` é placeholder pequeno. Em fases futuras com componentes pesados de showcase, considerar:
- Mover showcase pra fora do componente principal: `if (NODE_ENV === 'production') notFound(); return <DevShowcase />` onde `DevShowcase` está em arquivo dinamicamente importado.
- Ou: condicional no `next.config.ts` para excluir o route segment de prod via `pageExtensions` ou redirect.

Não é blocker em Phase 1; documentar para Phase 2 quando primitivas pesadas entrarem no `/dev`.

## Code Examples

(Já cobertos em "Architecture Patterns" acima — todos os helpers, providers e atoms têm snippet completo.)

### Test fixture — `vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### Test fixture — `tests/lib/whatsapp.test.ts` (CTA-02)

```ts
import { describe, expect, it, beforeAll } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

beforeAll(() => {
  process.env.NEXT_PUBLIC_WA_NUMBER = "5511999999999";
});

describe("buildWhatsAppUrl", () => {
  it("builds canonical wa.me URL with encoded message", () => {
    const url = buildWhatsAppUrl("Oi! Vi a Likro", "hero");
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
    expect(url).toContain("Oi%21%20Vi%20a%20Likro");
  });

  it("throws on web.whatsapp.com in message (CTA-02 guard)", () => {
    expect(() => buildWhatsAppUrl("vai pra web.whatsapp.com", "hero"))
      .toThrow(/Forbidden host "web\.whatsapp\.com"/);
  });

  it("throws on api.whatsapp.com in message", () => {
    expect(() => buildWhatsAppUrl("api.whatsapp.com/send", "footer"))
      .toThrow(/Forbidden host "api\.whatsapp\.com"/);
  });

  it("throws on invalid phone format", () => {
    process.env.NEXT_PUBLIC_WA_NUMBER = "+55 11 99999-9999"; // human format invalid
    expect(() => buildWhatsAppUrl("oi", "hero")).toThrow(/Invalid phone format/);
    process.env.NEXT_PUBLIC_WA_NUMBER = "5511999999999"; // restore
  });
});
```

### Test fixture — `tests/lib/analytics.test.ts` (TRACK-02)

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { track } from "@/lib/analytics";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("track()", () => {
  beforeEach(() => {
    window.fbq = vi.fn();
    window.gtag = vi.fn();
    window.clarity = vi.fn();
  });

  it("attaches event_id (UUID v4) to GA4 payload", () => {
    track("whatsapp_click", { location: "hero" });
    const call = (window.gtag as any).mock.calls[0];
    expect(call[1]).toBe("whatsapp_click");
    expect(call[2].event_id).toMatch(UUID_V4_REGEX);
    expect(call[2].location).toBe("hero");
  });

  it("passes eventID to Meta Pixel as 4th arg", () => {
    track("whatsapp_click", { location: "hero" });
    const call = (window.fbq as any).mock.calls[0];
    expect(call[0]).toBe("track");
    expect(call[1]).toBe("Contact"); // mapped from whatsapp_click
    expect(call[3].eventID).toMatch(UUID_V4_REGEX);
  });

  it("uses same event_id across all three vendors", () => {
    track("form_submit_success", {});
    const gaId = (window.gtag as any).mock.calls[0][2].event_id;
    const fbId = (window.fbq as any).mock.calls[0][3].eventID;
    expect(gaId).toBe(fbId);
  });

  it("no-ops in SSR", () => {
    const original = global.window;
    // @ts-expect-error — simulate SSR
    delete global.window;
    expect(() => track("whatsapp_click", {})).not.toThrow();
    global.window = original;
  });
});
```

### Brand-lock grep test — `tests/brand-lock.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";

describe("brand lock — roxo só como accent.primary/hover/glow", () => {
  it("fails build if any forbidden bg-accent-NN class is used", () => {
    let output = "";
    try {
      output = execSync(
        // grep recursive em src/, captura bg-accent-{50..900}
        `grep -rEn "bg-accent-(50|100|200|300|400|500|600|700|800|900)" src/ --include="*.tsx" --include="*.ts" --include="*.css"`,
        { encoding: "utf-8" },
      );
    } catch {
      // grep retorna exit 1 quando não encontra → success case
      output = "";
    }
    expect(output, `Forbidden roxo shades found:\n${output}`).toBe("");
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package | `motion` package, `import from "motion/react"` | mid-2024 | Antigo nome ainda funciona, mas tutoriais novos usam `motion/react` |
| `@studio-freight/lenis` / `@studio-freight/react-lenis` | `lenis` + `lenis/react` | Studio Freight virou Darkroom Engineering | Pacotes antigos deprecated |
| `smoothTouch: false` | `syncTouch: false` | Lenis 1.0 | `smoothTouch` REMOVIDO; passar é silent ignore |
| Tailwind v3 `tailwind.config.js` JS-based | Tailwind v4 `@theme {}` em CSS | Jan 2025 | CSS-first, ~5x mais rápido, brand tokens co-located com style |
| Pages Router (`pages/`) | App Router (`app/`) | Next 13.4 (stable) | Metadata API, Server Actions, RSC — 2026 docs assumem App Router |
| `<link>` Google Fonts | `next/font/google` self-host | Next 13 | Zero CDN runtime, zero CLS, zero CSP entry |
| `getStaticProps`/`getServerSideProps` | Server Components + `fetch` cache | App Router | Old API doesn't exist no App Router |
| Manual `gtag` script tags | `@next/third-parties` `<GoogleAnalytics>` | Next 14 | Mount correto + auto SPA tracking |
| `cursor: pointer` em `<Button>` shadcn | `cursor: default` | shadcn Tailwind v4 update | Match comportamento nativo `<button>` |

**Deprecated/outdated (DO NOT USE):**
- `framer-motion` (use `motion`)
- `@studio-freight/*` (use `lenis`)
- `react-icons` (use `lucide-react`)
- `aos`, `wow.js`, `animate.css` (use Motion `whileInView`)
- `react-helmet`/`react-helmet-async` (use Next Metadata API)
- `smoothTouch` Lenis option (removed; use `syncTouch`)
- Tailwind v3 syntax (`tailwind.config.js`, `@apply` heavy) — v4 era

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Brazilian DDDs 11-19, 21, 22, 24, 27, 28 usam 9 prefixo (13 dígitos total). Outros DDDs: 12 dígitos. | Pattern 6 / WhatsApp Helper | Validação regex muito permissiva (12-13 dígitos) deve cobrir. Se Likro for em DDD que muda regra, validar com Lenny. `[ASSUMED — confirmado por GREEN-API e wassenger 2026, mas validar com número real]` |
| A2 | `process.env.NODE_ENV === 'production'` no Next 15 é estaticamente substituído em build, permitindo dead-code-elim do `if/notFound()`. | Pattern 9 / `/dev` Route Guard | Se assumption errada, `/dev` page bundle inteiro é shipado em prod (ainda 404 ao acessar, mas ~bytes a mais). Para Phase 1 (showcase placeholder pequeno), impacto mínimo. `[ASSUMED — comportamento padrão Webpack/SWC; verificável com bundle analyzer]` |
| A3 | Lenis 1.3.x default `autoRaf: true` é suficiente — não precisa wire RAF manualmente até GSAP entrar (Phase 4 hipoteticamente). | Pattern 2 / SmoothScrollProvider | Se RAF default conflitar com Motion `useScroll` em algum cenário não previsto, pode precisar `autoRaf: false` + RAF manual. Validar com `<StickyStage>` em Phase 2 em iOS Safari real. `[ASSUMED — padrão dos guides 2026]` |
| A4 | Lucide-react 1.x (latest) tem API compatível com a 0.x que STACK.md citou. | Standard Stack | Se houver breaking change na major bump 0→1, atoms precisam ajustar imports. **Recomendo:** Lenny escolher entre fixar `^0.460` (alinhado STACK.md original) ou subir pra `^1.16` (latest). `[ASSUMED — major bump frequentemente é refactoring sem breaking; verificar changelog antes de fixar]` |
| A5 | `crypto.randomUUID()` está disponível em todos browsers Brazilian-clinic-owner usariam (iOS Safari 15.4+, Chrome 92+). | Pattern 7 / Analytics | Fallback `Date.now() + Math.random()` cobre browsers ultra-velhos. Não cryptographically secure mas evento_id ainda único o suficiente para dedup. `[VERIFIED: MDN Crypto.randomUUID — universal support modern browsers]` |
| A6 | Phone WhatsApp da Likro (a definir antes da Phase 3, per STATE.md) caberá no formato `5511XXXXXXXXX` (DDD SP/RJ-style com 9). | Pattern 6 | Se número for de outro estado com 12 dígitos, regex já permite. Sem risco. `[ASSUMED]` |

## Open Questions (RESOLVED)

1. **Lucide-react versão a fixar — 0.460+ ou 1.16+?**
   - **RESOLVED (2026-05-15):** Fixar `^0.460` por orchestrator directive #3 (alinhado com STACK.md, decisão da Phase 0 de Lenny). Major bump pra 1.x adia para milestone futuro — risco extra sem ganho funcional na v1.

2. **Webhook target para form de lead (Phase 5, não bloqueia Phase 1).**
   - **DEFERRED:** Não bloqueia Phase 1. Tracked em STATE.md como pendência antes da Phase 5. Phase 1 só precisa de `LEAD_WEBHOOK_URL=` no `.env.local.example` (placeholder).

3. **Cadência de copy review (não bloqueia Phase 1).**
   - **DEFERRED:** Não bloqueia Phase 1. Tracked em STATE.md como pendência antes da Phase 3. Phase 1 estabelece `src/content/whatsapp.ts` com mensagens placeholder rascunhadas; Lenny aprova ao final da Phase 1 ou início da Phase 3.

4. **`@theme` `inline` vs default — qual usar para tokens Likro?**
   - **RESOLVED (2026-05-15):** Usar `@theme {}` (sem `inline`) per Plan 01. Não há theme switch planejado (D-06 explícito), mas a flexibilidade default não custa nada e mantém override-ability runtime. Snippet acima já usa o formato correto.

5. **`<MotionConfig reducedMotion="user">` desabilita também animações de `transition` CSS, ou só `motion.*`?**
   - **RESOLVED (2026-05-15):** Apenas `motion.*` (transform/layout). CSS `transition` em atoms shadcn aplica `@media (prefers-reduced-motion: reduce) { transition: none; }` localmente em cada atom (per D-04 e Plan 04 Task 1). Validar visualmente em macOS Reduce Motion durante review da Phase 2+.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next 15.5 build/dev | (assumed ✓) | ≥18.18 (Next 15.5 mínimo) | — |
| npm/pnpm | Pkg install | (assumed ✓) | npm ≥9 ou pnpm ≥8 | — |
| Git | Repo init | (assumed ✓) | qualquer recente | — |
| Vercel CLI | `vercel env pull` (opcional Phase 1) | (assumed) | latest | — |
| Browser modern (iOS Safari 15.4+, Chrome 92+) | `crypto.randomUUID`, `dvh`/`svh` units | (target audience) | — | `Math.random` fallback no `track()` |

**Missing dependencies with no fallback:** Nenhum identificado para Phase 1.

**Missing dependencies with fallback:**
- `NEXT_PUBLIC_WA_NUMBER` ausente em local dev → `buildWhatsAppUrl` usa placeholder `0000000000` + console.warn (não bloqueia Phase 1).
- `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_CLARITY_ID` ausentes → scripts não montam, `track()` no-ops via optional chain (não bloqueia Phase 1; valida em Phase 6).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.x (a instalar — não detectado, repo é greenfield) |
| Config file | `vitest.config.ts` — criar em Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | `next dev` starts; TypeScript strict; ESLint roda | smoke | `npm run lint && npx tsc --noEmit && npm run build` | ❌ Wave 0 (após scaffold) |
| FOUND-02 | `globals.css` carrega `@theme` block; tokens viram CSS variables no build | unit | `vitest run tests/build/tailwind-tokens.test.ts` (opcional — pode ser inspeção manual no `next build` output) | ❌ Wave 0 |
| FOUND-03 | Nenhum `bg-accent-(50\|100\|...\|900)` em `src/**` | unit (grep) | `vitest run tests/brand-lock.test.ts` | ❌ Wave 0 (snippet acima) |
| FOUND-04 | Inter carregado com 3 weights, swap, variable | manual | Inspecionar `<html>` em dev — `class="--font-inter ..."` presente; Lighthouse Mobile sem warning de CLS de fonte | manual |
| FOUND-05 | `cn(['a', 'b'], 'c')` retorna `"a b c"` deduplicado | unit | `vitest run tests/lib/utils.test.ts` | ❌ Wave 0 |
| FOUND-06 | `useDeviceTier()` retorna `'reduced'` quando `matchMedia('(prefers-reduced-motion: reduce)')` matches | unit (jsdom) | `vitest run tests/hooks/use-device-tier.test.tsx` | ❌ Wave 0 |
| FOUND-07 | Provider tree em `app/layout.tsx` na ordem `Analytics > SmoothScroll > MotionConfig` | unit (snapshot) | `vitest run tests/app/layout-providers.test.tsx` | ❌ Wave 0 |
| FOUND-08 | `SmoothScrollProvider` retorna children sem `<ReactLenis>` quando reduced-motion ativo | unit | `vitest run tests/providers/smooth-scroll.test.tsx` (mock `useReducedMotion → true`) | ❌ Wave 0 |
| FOUND-09 | Atoms renderizam sem erros; `<WhatsAppCta>` chama `track('whatsapp_click', {location})` ao click | unit + integration | `vitest run tests/components/ui/*.test.tsx` | ❌ Wave 0 |
| FOUND-10 | `metadata` exporta `title.template`, `openGraph`, `viewport.themeColor` | unit | `vitest run tests/app/metadata.test.ts` | ❌ Wave 0 |
| FOUND-11 | `robots()` retorna `disallow: '/'` quando `VERCEL_ENV !== 'production'` | unit | `vitest run tests/app/robots.test.ts` | ❌ Wave 0 |
| FOUND-12 | `/dev` retorna 404 em `next start` (prod build); 200 em `next dev` | E2E (Playwright) | `npx playwright test tests/e2e/dev-route.spec.ts` | ❌ Wave 0 (opcional — pode ser smoke manual) |
| CTA-01 | `buildWhatsAppUrl("oi", "hero")` retorna `https://wa.me/<phone>?text=oi` | unit | `vitest run tests/lib/whatsapp.test.ts` | ❌ Wave 0 (snippet acima) |
| CTA-02 | `buildWhatsAppUrl` lança erro com `web.whatsapp.com` em mensagem | unit | mesmo arquivo CTA-01 | ❌ Wave 0 |
| TRACK-01 | `track("whatsapp_click", {location: "hero"})` chama `window.fbq` E `window.gtag` E `window.clarity` | unit | `vitest run tests/lib/analytics.test.ts` | ❌ Wave 0 (snippet acima) |
| TRACK-02 | Cada `track()` injeta `event_id` matching UUID v4 regex em payload de todos vendors | unit | mesmo arquivo TRACK-01 | ❌ Wave 0 |
| TRACK-03 | `<Script id="meta-pixel" strategy="afterInteractive">` presente em DOM rendered de `AnalyticsProvider` | unit (snapshot) | `vitest run tests/providers/analytics.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run lint && npx vitest run --reporter=dot` (~5s)
- **Per wave merge:** `npm run lint && npx tsc --noEmit && npx vitest run` (~30s)
- **Phase gate:** `npm run build` (verifica que tudo compila prod) + full vitest + manual smoke do `/dev` em dev e `next start` (404 check) + DevTools inspect do provider tree

### Wave 0 Gaps

- [ ] `vitest.config.ts` — install + config (snippet acima)
- [ ] `tests/setup.ts` — `import "@testing-library/jest-dom"`
- [ ] `tests/lib/whatsapp.test.ts` — cobre CTA-01, CTA-02 (snippet acima)
- [ ] `tests/lib/analytics.test.ts` — cobre TRACK-01, TRACK-02 (snippet acima)
- [ ] `tests/lib/utils.test.ts` — cobre FOUND-05
- [ ] `tests/hooks/use-device-tier.test.tsx` — cobre FOUND-06
- [ ] `tests/providers/smooth-scroll.test.tsx` — cobre FOUND-08 (skip init em reduced-motion)
- [ ] `tests/providers/analytics.test.tsx` — cobre TRACK-03 (Script tags presentes)
- [ ] `tests/app/layout-providers.test.tsx` — cobre FOUND-07 (ordem provider tree)
- [ ] `tests/app/metadata.test.ts` — cobre FOUND-10
- [ ] `tests/app/robots.test.ts` — cobre FOUND-11
- [ ] `tests/brand-lock.test.ts` — cobre FOUND-03 (grep test, snippet acima)
- [ ] `tests/components/ui/whatsapp-cta.test.tsx` — cobre FOUND-09 + integration com track()
- [ ] (Opcional) Playwright setup para FOUND-12 — pode ser smoke manual em vez de E2E automatizado em Phase 1

## Project Constraints (from CLAUDE.md)

CLAUDE.md raiz (gerado pelo GSD) contém regras já cobertas pelo CONTEXT.md, MAIS:

- **Idioma:** Lenny prefere respostas em pt-BR; commits podem ser em inglês.
- **Git:** Quando Lenny diz "dá commit", fazer commit + push automático.
- **Code review obrigatório antes de qualquer commit:** ativar skill `requesting-code-review` sobre diff.
- **Playwright após mudanças de frontend:** rodar Playwright MCP automaticamente para validar fluxos antes de "testa aí". Phase 1 não tem fluxos visíveis ainda (atoms em `/dev` showcase) — Playwright se aplica quando atoms forem demoed em `/dev`.
- **GSD workflow enforcement:** todo trabalho passa por comando GSD; sem edits diretos sem comando ativo.
- **Pipeline automático antes de pedir teste manual:** code review → Playwright (se UI) → reportar resultado. Phase 1 plans devem incorporar essa cadência.
- **Stack confirmado:** Next 15.5 + Tailwind + Framer Motion (Motion v12) + Lenis (já alinhado com STACK.md).
- **Não-negociável:** brand book Likro (roxo `#7C3AED` apenas como destaque, Inter, bordas suaves).

**Implicações para Phase 1 plans:**
- Cada commit precisa ser precedido por code review automático.
- Playwright entra na demo do `/dev` showcase (testar que atoms renderizam corretamente, hover/focus states, sonner toast aparece).
- pt-BR no copy de placeholder (já é o caso em D-12).

## Sources

### Primary (HIGH confidence)

- [Tailwind CSS v4 — Theme variables](https://tailwindcss.com/docs/theme) — `@theme` namespace contract, single-shade tokens, `--disable-default-colors` — **HIGH** (cited verbatim em Pattern 1)
- [Tailwind CSS v4 — Colors](https://tailwindcss.com/docs/colors) — comportamento de auto-generation — **HIGH**
- [Motion — useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) — hook reativo, retorna `true`/`false`/`null` — **HIGH** (cited Pattern 2/3)
- [Motion — MotionConfig](https://motion.dev/docs/react-motion-config) — `reducedMotion="user"|"always"|"never"` — **HIGH** (cited verbatim em Pattern 3)
- [Motion — React upgrade guide](https://motion.dev/docs/react-upgrade-guide) — rename `framer-motion` → `motion`; import `motion/react` — **HIGH**
- [Lenis GitHub (Darkroom Engineering)](https://github.com/darkroomengineering/lenis) — pacote canônico, deprecation `@studio-freight/*`, `lenis/react` provider — **HIGH**
- [Lenis npm — v1.3.23 verified](https://www.npmjs.com/package/lenis) — `[VERIFIED: npm view lenis version → 1.3.23]` — **HIGH**
- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) — App Router stability — **HIGH**
- [Next.js — Script component](https://nextjs.org/docs/app/api-reference/components/script) — `afterInteractive` strategy — **HIGH**
- [Next.js — Font Optimization (App Router)](https://nextjs.org/docs/app/getting-started/fonts) — `next/font/google` self-host, variable, `display`, `adjustFontFallback` — **HIGH**
- [Next.js — Metadata API + OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — — **HIGH**
- [Next.js — not-found.js conventions](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) — `notFound()` in App Router — **HIGH**
- [Next.js — Edge Runtime + crypto.randomUUID](https://nextjs.org/docs/api-reference/edge-runtime) — `crypto.randomUUID` available em Edge runtime — **HIGH**
- [MDN — Crypto.randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) — UUID v4 cryptographically secure — **HIGH**
- [Meta — Conversions API deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/) — `eventID` 4th arg em `fbq('track', ...)` — **HIGH** (cited verbatim em Pattern 7)
- [Meta — Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference/) — standard event names (`Lead`, `Contact`) — **HIGH**
- [WhatsApp — wa.me deeplink format](https://wa.me) + community confirmations — formato canônico mobile — **HIGH**
- [shadcn/ui — Tailwind v4 setup](https://ui.shadcn.com/docs/tailwind-v4) — instalação Next 15.5 + components.json blank tailwind — **HIGH**
- [shadcn/ui — Next.js installation](https://ui.shadcn.com/docs/installation/next) — — **HIGH**

### Secondary (MEDIUM confidence)

- [Bridger Tower — Lenis in Next.js](https://bridger.to/lenis-nextjs) — provider pattern — **MEDIUM**
- [DevDreaming — Smooth Scrolling Next.js Lenis (2026)](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — `lerp`, `duration`, `syncTouch` confirmation — **MEDIUM**
- [Dilhan Ziriwardhana — Microsoft Clarity in Next.js App Router](https://medium.com/@dilhanziriwardhana/how-to-install-microsoft-clarity-in-next-js-app-router-e9c696b6fada) — `id` conflict warning — **MEDIUM** (cited Pitfall E)
- [Brad Farleigh — Facebook event_id parameter (2025/2026)](https://www.bradfarleigh.com/2025/02/facebook-pixel-signal-deduplication-using-event_id/) — `eventID` 4th arg pattern — **MEDIUM**
- [Korii Gami — Google Analytics in Next.js 15+ with @next/third-parties](https://medium.com/@koriigami/google-analytics-in-next-js-15-with-next-third-parties-164be149e7b7) — `<GoogleAnalytics>` mount + `sendGAEvent` — **MEDIUM**
- [GREEN-API — How to enter international numbers for WhatsApp](https://green-api.com/en/blog/how-to-correctly-enter-international-numbers-for-whatsapp/) — Brazil DDDs com 9 prefix — **MEDIUM** (cited Assumption A1)
- [Wassenger — Normalize WhatsApp phone numbers](https://wassenger.com/blog/en/how-to-normalize-international-phone-numbers-for-whatsapp) — Brazil specifics 12-13 digits — **MEDIUM**
- [Tailkits — Tailwind v4 custom colors](https://tailkits.com/blog/tailwind-v4-custom-colors/) — `--disable-default-colors` directive — **MEDIUM**
- [Mavik Labs — Design Tokens Tailwind v4 2026](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026/) — `@theme inline` patterns — **MEDIUM**
- [Tailwind discussion #18560 — @theme vs @theme inline](https://github.com/tailwindlabs/tailwindcss/discussions/18560) — diff entre directives — **MEDIUM** (Open Question 4)

### Tertiary (LOW confidence — needs validation in execution)

- Lucide-react 0.x → 1.x major upgrade impact — **LOW** (Assumption A4 — verificar antes de fixar)
- Exato comportamento de dead-code-elim do `process.env.NODE_ENV` block em route segments App Router — **LOW** (Assumption A2 — verificável em Phase 1 final via `@next/bundle-analyzer`)

### From Existing Project Research (also HIGH)

- `.planning/research/STACK.md` — versões pinadas, install commands, version compatibility matrix
- `.planning/research/ARCHITECTURE.md` — provider tree, single Lenis loop, ScrollScene pattern, anti-patterns
- `.planning/research/PITFALLS.md` — 26 pitfalls, especialmente #1 (Lenis sticky), #4 (roxo), #5 (WA), #6 (tracking), #19 (font weights)
- `.planning/research/SUMMARY.md` — phase rationale, 6 critical risks mapped to phases

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — todas as versões verificadas via `npm view` em 2026-05-15; APIs via official docs cited verbatim
- Architecture (provider tree, Lenis+Motion+reduced-motion): **HIGH** — pattern direto de official docs + ARCHITECTURE.md já validado
- Tailwind v4 brand-lock mechanism: **MEDIUM-HIGH** — official docs confirma `@theme` namespace contract; **caveat:** docs não emitem build error para utility desconhecida (Pitfall C). Pattern recomendado é correto, mas a "build break" prometida no ROADMAP success criteria 1 não acontece automaticamente — precisa do grep test em CI
- WhatsApp deeplink (Brazil specifics): **MEDIUM** — formato `wa.me` é HIGH, mas regra de 9-prefix por DDD é assumption A1, validar com número real Likro
- Analytics fan-out + event_id: **HIGH** — Meta CAPI doc cita verbatim a forma `eventID` 4º arg
- `/dev` route guard dead-code-elim: **MEDIUM** — comportamento padrão Next, mas não verificado por bundle analyzer ainda (Assumption A2)

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (30 dias — stack maduro, mudanças prováveis pequenas)

---

*Phase: 01-foundations-design-system*
*Research completed: 2026-05-15*
*Ready for planning: yes*
