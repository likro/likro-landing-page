---
phase: 01-foundations-design-system
plan: 04
subsystem: providers-atoms-metadata
tags: [providers, shadcn, atoms, metadata, og-image, dev-route, brand-lock-doc, lenis, analytics-fanout]
requires:
  - "Plan 01-01: scaffold + globals.css brand tokens + components.json + Inter via next/font"
  - "Plan 01-02: src/lib/whatsapp.ts (buildWhatsAppUrl) + src/content/whatsapp.ts (WHATSAPP_MESSAGES)"
  - "Plan 01-03: src/lib/env.ts (env wrapper) + src/lib/analytics.ts (track) + src/hooks/use-device-tier.ts"
provides:
  - "8 atoms shadcn customizados com brand Likro: button, card, input, textarea, label, dialog, sheet, sonner"
  - "4 atoms próprios: <Container>, <Headline as size>, <WhatsAppIcon>, <WhatsAppCta variant location>"
  - "3 providers client em src/components/providers/: AnalyticsProvider, SmoothScrollProvider, MotionConfigProvider"
  - "Provider tree EXATO em layout.tsx: AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children > Toaster (FOUND-07)"
  - "Lenis 1.x com syncTouch:false + skip init em prefers-reduced-motion (FOUND-08, orchestrator directive #1)"
  - "Microsoft Clarity Script id='ms-clarity' (NÃO 'clarity' — Pitfall E)"
  - "AnalyticsProvider mount graceful: scripts só montam se env var presente"
  - "Metadata FOUND-10 completa: title.template, OG (locale=pt_BR), Twitter card=summary_large_image, robots, manifest, viewport.themeColor=#0a0a0b"
  - "Dynamic OG image (1200x630, edge runtime) + favicon (32x32, edge) via next/og"
  - "/dev showcase route guarded por process.env.NODE_ENV (Server Component, notFound() em prod) — FOUND-12"
  - "docs/BRAND.md — 3ª camada do brand-lock (override consciente de D-17 per orchestrator directive #2)"
  - "src/lib/whatsapp.ts agora consome @/lib/env (W3 fix — single source of truth para env vars)"
  - "WhatsAppCta wrapper único: track('whatsapp_click') + 250ms loading + buildWhatsAppUrl + 4 variants"
  - "21 tests novos (6 whatsapp-cta + 2 smooth-scroll + 3 analytics + 6 layout-providers + 3 dev-route + 1 grep ajustado em whatsapp.test)"
affects:
  - "Phase 1 está PRONTA. Phase 2 (motion primitives) começa do estado deixado aqui."
  - "Phase 2: <FadeUp>, <Stagger>, <Parallax> consumirão useDeviceTier (Plan 03) + viverão dentro do MotionConfigProvider já wired"
  - "Phase 3+ (sections): toda seção monta via Container + Headline + WhatsAppCta — atoms são single source of truth"
  - "Phase 5 (form): consumirá Input + Label + Textarea + Sheet (atoms shadcn já customizados)"
  - "/dev showcase fica como sandbox visual onde Lenny aprova feel premium dos atoms (e crescerá com Phase 2 motion primitives + Phase 3+ sections)"
tech-stack-added:
  - "class-variance-authority@^0.7.x (peer dep do Button shadcn customizado)"
  - "radix-ui@^1.4.3 (umbrella package — instalado pelo shadcn CLI)"
  - "next-themes@^0.4.6 (peer do Sonner)"
  - "sonner@^2.0.7 (Toaster)"
patterns-introduced:
  - "Provider tree FIXO em layout.tsx (Server Component) — providers têm 'use client' próprios; root layout NUNCA tem 'use client' (anti-pattern bloqueia static render)"
  - "Single fan-out de WhatsApp deeplink (RESEARCH §Pattern 6 estendido): WhatsAppCta é o ÚNICO componente que toca buildWhatsAppUrl + WHATSAPP_MESSAGES + track. Code review enforce."
  - "Lenis skip pattern em reduced-motion: SmoothScrollProvider retorna `<>{children}</>` direto (não wrapper transparente) — garante que Lenis NUNCA é instanciado quando reduced motion ativo"
  - "Brand-lock 3-layer defense completa: tokens absentes (Plan 01) + grep test CI (Plan 03) + docs/BRAND.md checklist humano (Plan 04). D-17 OVERRIDE deliberada por orchestrator directive #2 (documentada na própria doc)"
  - "OG image + favicon dinâmicos via next/og edge runtime: zero asset estático maintained, polish final em Phase 7"
  - "/dev guard via process.env.NODE_ENV check em Server Component: build-time inline pelo Webpack/SWC permite dead-code-elim do JSX em prod (T-01-14 mitigated)"
  - "vi.mock pattern com getter mutável (mockEnv): permite tests sobrescreverem env por caso sem reset entre runs — substitui o anti-pattern de mexer process.env direto"
key-files-created:
  - path: "src/components/ui/button.tsx"
    purpose: "Button brand Likro (cva + variants accent-primary/secondary/ghost/outline + premium ease + focus ring brand)"
  - path: "src/components/ui/card.tsx"
    purpose: "Card customizado: surface-lighter + border-subtle + shadow sutil + rounded-lg (12px brand book)"
  - path: "src/components/ui/input.tsx"
    purpose: "Input Linear-like: border-default → border-accent-primary em foco com ring-1 sutil"
  - path: "src/components/ui/textarea.tsx"
    purpose: "Textarea no mesmo padrão Input + min-h-20 + field-sizing-content"
  - path: "src/components/ui/label.tsx"
    purpose: "Label custom: text-text-primary (em vez de neutral default shadcn)"
  - path: "src/components/ui/dialog.tsx"
    purpose: "Radix Dialog primitives — shadcn default (customização visual em fases que consumirem)"
  - path: "src/components/ui/sheet.tsx"
    purpose: "Radix Sheet primitives — shadcn default"
  - path: "src/components/ui/sonner.tsx"
    purpose: "Toaster Sonner — shadcn default; usado em layout root"
  - path: "src/components/ui/container.tsx"
    purpose: "<Container as='div|section|main|article'> max-w-7xl mx-auto + padding responsivo"
  - path: "src/components/ui/headline.tsx"
    purpose: "<Headline as size='hero|section|sub'> hierarquia tipográfica Inter brand book"
  - path: "src/components/ui/whatsapp-icon.tsx"
    purpose: "WhatsApp SVG oficial componentizado, currentColor, aria-hidden"
  - path: "src/components/ui/whatsapp-cta.tsx"
    purpose: "WhatsAppCta wrapper único — track + 250ms loading + buildWhatsAppUrl + variants primary/secondary/floating/inline"
  - path: "src/components/providers/motion-config-provider.tsx"
    purpose: "MotionConfig reducedMotion='user' — global a11y para todas <motion.*>"
  - path: "src/components/providers/smooth-scroll-provider.tsx"
    purpose: "ReactLenis root com syncTouch:false; skip init quando reduced motion (FOUND-08)"
  - path: "src/components/providers/analytics-provider.tsx"
    purpose: "GA4 (@next/third-parties) + Pixel + Clarity scripts strategy='afterInteractive'; graceful se env vars missing; Clarity id='ms-clarity'"
  - path: "src/app/dev/page.tsx"
    purpose: "Server Component showcase com guard NODE_ENV (notFound em prod) + atoms render"
  - path: "src/app/opengraph-image.tsx"
    purpose: "OG image dinâmica via next/og 1200x630 (edge runtime) — placeholder Phase 1, polish Phase 7"
  - path: "src/app/icon.tsx"
    purpose: "Favicon dinâmico via next/og 32x32 (edge runtime) — 'L' branca sobre roxo Likro"
  - path: "docs/BRAND.md"
    purpose: "3ª camada brand-lock — regra do roxo + 4 extremos cromáticos + checklist code review (override D-17 documentado)"
  - path: "tests/components/ui/whatsapp-cta.test.tsx"
    purpose: "6 cases: render label/custom, track, window.open com 250ms, disabled while loading, data-location"
  - path: "tests/providers/smooth-scroll.test.tsx"
    purpose: "2 cases: skip ReactLenis em reduced motion; ReactLenis com syncTouch=false quando enabled"
  - path: "tests/providers/analytics.test.tsx"
    purpose: "3 cases: scripts montados quando env presentes; id='ms-clarity' (NÃO 'clarity'); graceful degradation sem env"
  - path: "tests/app/layout-providers.test.tsx"
    purpose: "6 structure assertions: imports providers, ordem nesting exata, html lang/className, root NÃO use client, metadata FOUND-10, themeColor"
  - path: "tests/app/dev-route.test.tsx"
    purpose: "3 structure assertions: import notFound; check NODE_ENV + notFound(); Server Component"
key-files-modified:
  - path: "src/app/layout.tsx"
    purpose: "Substituído completamente: provider tree wire + metadata FOUND-10 + viewport themeColor=#0a0a0b"
  - path: "src/lib/whatsapp.ts"
    purpose: "W3 fix — substituído process.env.NEXT_PUBLIC_WA_NUMBER por env.NEXT_PUBLIC_WA_NUMBER (import @/lib/env). Removido eslint-disable órfão"
  - path: "tests/lib/whatsapp.test.ts"
    purpose: "Migrado de mexer process.env direto para vi.mock('@/lib/env') com mockEnv getter mutável. 8 tests permanecem verdes — comportamento inalterado"
  - path: "package.json + package-lock.json"
    purpose: "Adicionado class-variance-authority + radix-ui + next-themes + sonner (peers shadcn)"
key-decisions:
  - "Button usa Slot.Root de `radix-ui` (umbrella package que shadcn CLI instalou) em vez de @radix-ui/react-slot independente — evita dep duplicada. API equivalente."
  - "Sonner mantido shadcn default (com next-themes); tema escuro/claro automático casa com a estratégia de surface-dark↔surface-light dos sections."
  - "Removido eslint-disable next-line no-console em whatsapp.ts (não mais necessário; ESLint config do projeto não tem rule no-console ativa). Aviso de 'unused directive' some."
  - "OG image + favicon via next/og edge runtime + dynamic generation (não asset estático). Zero arquivos para versionar/atualizar; polish em Phase 7."
  - "Toaster monta DENTRO do MotionConfigProvider (mesmo nível dos children) em vez de fora — sonner usa motion-like interactions e respeita reducedMotion via MotionConfig herdado."
  - "/dev page é Server Component + check inline NODE_ENV. JSX abaixo do if é dead-code-eliminado pelo SWC em prod (orchestrator directive #7), retornando 404 antes do client baixar showcase chunk (~80KB → 0KB shipped em prod)."
  - "docs/BRAND.md OVERRIDE deliberada de D-17 'sem doc separada de brand': orchestrator directive #2 prevalece. Override documentado dentro da própria doc + neste SUMMARY."
metrics:
  tasks-completed: 2
  duration: "~12min (inclui shadcn add CLI + npm install class-variance-authority + 4 commits prep + 2 commits finais)"
  completed-date: "2026-05-15"
---

# Phase 1 Plan 4: Providers + Atoms + Metadata + /dev + BRAND.md Summary

Wave 2 fechou a Phase 1: provider tree completo (`AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children > Toaster`) wired em `app/layout.tsx`, 8 atoms shadcn customizados com brand Likro + 4 atoms próprios (Container, Headline, WhatsAppIcon, WhatsAppCta), metadata FOUND-10 completa, OG image + favicon dinâmicos, rota `/dev` showcase guardada por NODE_ENV, e `docs/BRAND.md` fechando a 3ª camada de defesa do brand-lock. Bonus: refactor de `src/lib/whatsapp.ts` para consumir `@/lib/env` (W3 fix). 45/45 tests verdes; build de prod limpo.

## What Shipped

### Task 1 — Atoms shadcn + customização brand + atoms próprios + W3 fix (commit `e7faae6`)

- `npx shadcn@latest add button card input textarea label dialog sheet sonner` — 8 atoms criados em `src/components/ui/`. Aceitas overwrites; CLI instalou peers (`radix-ui` umbrella, `next-themes`, `sonner`).
- `npm install class-variance-authority` — peer obrigatório do Button cva-based (não foi auto-instalado pelo shadcn CLI nesta versão).
- **Button brand Likro** (`button.tsx`): cva substituído por variants Likro — `default` (roxo accent CTA principal Stripe-like depth), `secondary` (outline roxo Linear-like), `ghost`, `outline`, `destructive`, `link`. Premium ease `cubic-bezier(0.16,1,0.3,1)` em todas transitions. Focus ring sempre `accent-primary` com offset 2 (D-02, D-03, D-04).
- **Card** (`card.tsx`): substituído `bg-card` por `bg-surface-lighter` + `border-border-subtle` + `rounded-lg` (12px brand book). Description usa `text-text-muted`.
- **Input/Textarea** (`input.tsx`, `textarea.tsx`): Linear-like minimal — border-default no resting, vira border-accent-primary com ring-1 sutil em foco.
- **Label** (`label.tsx`): `text-text-primary` em vez de neutral default.
- **Sonner** (`sonner.tsx`): mantido shadcn default — Toaster com next-themes auto + ícones lucide.
- **Dialog/Sheet** (`dialog.tsx`, `sheet.tsx`): mantido shadcn default — Radix primitives sob capô; customização visual fica para fases que consumirem (Phase 5 form em Sheet?).
- **Container** (próprio): `<Container as='div|section|main|article'>` max-w-7xl mx-auto + padding responsivo (px-4 sm:px-6 lg:px-8).
- **Headline** (próprio): `<Headline as size>` 3 tiers — hero (4xl→7xl bold), section (3xl→5xl bold), sub (xl→2xl semibold). Sempre Inter via font-sans + text-text-primary.
- **WhatsAppIcon** (próprio): SVG oficial WhatsApp componentizado, currentColor (herda do parent), aria-hidden (D-11).
- **WhatsAppCta** (próprio — único consumer de buildWhatsAppUrl + WHATSAPP_MESSAGES + track):
  - `useState(loading)` + 250ms timeout entre track e window.open (D-10) — garante envio antes de unload + percepção de feedback.
  - 4 variants: `primary` (Button default), `secondary` (Button secondary), `floating` (fixed bottom-right size-icon com `[padding-bottom:env(safe-area-inset-bottom)]` para iOS notch), `inline` (Button link sem padding).
  - `target=_blank` + `noopener,noreferrer` (segurança).
  - Loader2 do lucide-react substitui WhatsAppIcon enquanto loading=true; button fica disabled.
- **W3 fix** (`src/lib/whatsapp.ts` + `tests/lib/whatsapp.test.ts`):
  - `process.env.NEXT_PUBLIC_WA_NUMBER` → `env.NEXT_PUBLIC_WA_NUMBER` via `import { env } from "@/lib/env"`. Single source of truth para env vars (matches o que `lib/analytics.ts` já fazia).
  - Test migrado para `vi.mock("@/lib/env", () => ({ get env() { return mockEnv; } }))` — getter mutável permite override por teste sem mexer em `process.env` global. Os 8 cases originais permanecem verdes; comportamento inalterado.
- **`tests/components/ui/whatsapp-cta.test.tsx`**: 6 cases — render default label, render custom label, track('whatsapp_click', {location}) on click, window.open com URL canonical wa.me após 250ms (fake timers), disabled while loading, data-location attribute.

### Task 2 — Providers + layout completo + metadata + /dev + OG/icon + BRAND.md + tests (commit `b2ce76f`)

- **`motion-config-provider.tsx`**: `<MotionConfig reducedMotion="user">` — todas `<motion.*>` herdam comportamento a11y sem cada componente checar.
- **`smooth-scroll-provider.tsx`**: 
  - Skip pattern: `if (reduced) return <>{children}</>;` — Lenis NUNCA é instanciado em reduced motion.
  - `syncTouch: false` (orchestrator directive #1; smoothTouch é deprecated/silently ignored em Lenis 1.x).
  - lerp 0.1 + duration 1.1 + smoothWheel + easing exponential out.
- **`analytics-provider.tsx`**: 
  - GA4 via `<GoogleAnalytics gaId>` do `@next/third-parties/google` (handles route changes).
  - Meta Pixel via `<Script id="meta-pixel" strategy="afterInteractive">` com snippet padrão.
  - Microsoft Clarity via `<Script id="ms-clarity" strategy="afterInteractive">` — id='ms-clarity' (NÃO 'clarity', Pitfall E).
  - Graceful: cada bloco condicionado em `env.NEXT_PUBLIC_*` — sem env, sem script no DOM. `track()` em lib/analytics já é defensive (optional chaining).
- **`src/app/layout.tsx`** (substituído completamente):
  - Provider tree EXATO: `<AnalyticsProvider><SmoothScrollProvider><MotionConfigProvider>{children}<Toaster richColors position="bottom-right" /></MotionConfigProvider></SmoothScrollProvider></AnalyticsProvider>`.
  - Metadata FOUND-10: `metadataBase=https://likro.com.br`, `title.template="%s · Likro"`, OG (locale=pt_BR, type=website, images=[/opengraph-image]), Twitter (card=summary_large_image), `robots={index:true,follow:true}`, `manifest=/manifest.webmanifest`.
  - Viewport: `themeColor="#0a0a0b"` (surface-dark — explicitamente NÃO o roxo) + `colorScheme="light dark"`.
  - Root permanece Server Component (sem "use client"); providers têm "use client" próprios.
- **`src/app/dev/page.tsx`** (Server Component): `if (process.env.NODE_ENV === "production") notFound();` — SWC inlines NODE_ENV em build, JSX abaixo é dead-code-eliminated em prod. Showcase renderiza Buttons (6 variants), WhatsAppCta (4 variants incluindo floating), Card, Input + Label, e seções placeholder para Phase 2 motion primitives e Phase 3+ sections.
- **`src/app/opengraph-image.tsx`**: edge runtime, 1200x630, surface-dark + tagline. Polish Phase 7.
- **`src/app/icon.tsx`**: edge runtime, 32x32, "L" branca sobre roxo Likro com border-radius 6.
- **`docs/BRAND.md`**: ~80 linhas — regra do roxo (permitido vs proibido), 4 extremos cromáticos a evitar, defesa em 3 camadas (token absence + grep test + esta doc), code review checklist (9 items enforceable em PR), tipografia (Inter 3 pesos), border radius (10/12px). Override deliberada de D-17 documentada no topo.
- **Tests** (4 arquivos novos):
  - `tests/providers/smooth-scroll.test.tsx` (2 cases): skip Lenis em reduced; ReactLenis com syncTouch=false quando enabled.
  - `tests/providers/analytics.test.tsx` (3 cases): mount completo, id='ms-clarity' não 'clarity', graceful degradation sem env.
  - `tests/app/layout-providers.test.tsx` (6 cases): structure assertions sobre layout source — imports, ordem do nesting, html lang/className, root sem "use client", metadata, themeColor.
  - `tests/app/dev-route.test.tsx` (3 cases): structure assertions sobre dev/page source — import notFound, check NODE_ENV + notFound(), Server Component.

## Verification

| Gate                                         | Command                                                  | Result                                                                                |
| -------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Tests Phase 1 inteira                        | `npx vitest run`                                         | OK 45/45 passed em 8.10s                                                              |
| Typecheck strict                             | `npx tsc --noEmit`                                       | OK 0 errors                                                                           |
| Production build                             | `npm run build`                                          | OK Compiled em 32.8s; 7 routes; /dev = 81.4 kB (dev-only)                             |
| W3 fix — single source env                   | `grep process\.env\.NEXT_PUBLIC_WA_NUMBER src/lib/`      | OK 0 matches (env wrapper é única fonte agora)                                        |
| WhatsAppCta é único consumer de buildWhatsAppUrl | `grep buildWhatsAppUrl src/`                         | OK 2 matches: `src/lib/whatsapp.ts` (def) + `src/components/ui/whatsapp-cta.tsx` (consumer) |
| layout.tsx provider tree exato                | structure test                                           | OK ordem Analytics > SmoothScroll > MotionConfig > Toaster verificada                  |
| Clarity id correto                           | structure test + render test                             | OK id='ms-clarity', NÃO 'clarity'                                                     |
| Lenis syncTouch                              | render test                                              | OK syncTouch=false em data attribute                                                  |
| Metadata FOUND-10                            | structure test                                           | OK title.template, locale=pt_BR, summary_large_image, manifest, themeColor=#0a0a0b    |
| /dev guard                                   | structure test                                           | OK process.env.NODE_ENV === 'production' + notFound()                                 |
| Build bundle JS shared                       | inspect next build output                                | 102 kB shared (≤ 150KB target — folga)                                                |

## Manual Verification (Pendente — Lenny)

> **Nota:** Os items abaixo são `verify type="manual"` da Plan 04 (I1 fix da revisão checker). Não bloqueiam o close da Plan, mas devem ser confirmados pelo Lenny antes da Phase 2 começar (ou Claude pode rodar via Playwright MCP per CLAUDE.md global rules).

- [ ] `npm run dev` → http://localhost:3000 → ver placeholder Likro page renderiza
- [ ] `npm run dev` → http://localhost:3000/dev → ver showcase de atoms (Buttons, WhatsAppCta variants, Card, Input)
- [ ] `npm run build && npm start` → http://localhost:3000/dev → confirmar 404 (NÃO o showcase) — guard NODE_ENV em runtime real
- [ ] React DevTools em dev → confirmar provider tree visível na ordem: AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children > Toaster
- [ ] Com env vars set (.env.local com NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_CLARITY_ID) → DevTools inspect → `<script id="meta-pixel">` e `<script id="ms-clarity">` no DOM
- [ ] Sem env vars (.env.local vazio) → DevTools inspect → nenhum dos 3 scripts aparece (graceful degradation)
- [ ] WhatsAppCta variant=primary clicado em mobile real (iOS Safari + Android Chrome) → abre app WhatsApp instalado (NÃO web.whatsapp.com)

Build é estatica + structure tests cobrem invariantes do source code; manual valida runtime real (especialmente `npm start` em prod = 404 e mobile real = app WhatsApp).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocker] `class-variance-authority` não estava em deps**

- Found during: Task 1 (primeira execução de vitest após customização do Button)
- Issue: Button shadcn customizado importa `cva` de `class-variance-authority`. shadcn CLI nesta versão NÃO instalou esse peer. Vitest falhou com `Failed to resolve import "class-variance-authority"`.
- Fix: `npm install class-variance-authority --save`. Versão instalada `^0.7.x` é a única estável.
- Files modified: `package.json`, `package-lock.json`
- Commit: `e7faae6`

**2. [Rule 1 — Bug] `eslint-disable-next-line no-console` órfão em whatsapp.ts**

- Found during: Task 2 (`npm run build` lint phase)
- Issue: ESLint warned "Unused eslint-disable directive (no problems were reported from 'no-console')". O config eslint-config-next não tem rule `no-console` ativa, então o disable é desnecessário e gera warning de hygiene.
- Fix: Removida a linha `// eslint-disable-next-line no-console` em `src/lib/whatsapp.ts:60`. Comportamento inalterado; warning some.
- Files modified: `src/lib/whatsapp.ts`
- Commit: `b2ce76f`
- Nota: warning equivalente em `src/lib/analytics.ts:79` NÃO foi tocado — pertence à Plan 03, fora de escopo desta plan (logged como deferred). Plan 03 deveria ter removido na criação; é hygiene, não bloqueante.

**3. [Rule 1 — Bug] `Slot` import path: shadcn CLI instalou `radix-ui` umbrella, não `@radix-ui/react-slot`**

- Found during: Task 1 (leitura do button.tsx gerado pelo shadcn CLI)
- Issue: O snippet do plan usava `import { Slot } from "@radix-ui/react-slot"`, mas o shadcn CLI atual instala o umbrella package `radix-ui` e gera `import { Slot } from "radix-ui"` + `Slot.Root`. Manter o import do plan quebraria o build (módulo não existe).
- Fix: Adaptado o Button customizado para usar `import { Slot } from "radix-ui"` + `const Comp = asChild ? Slot.Root : "button"` — API equivalente, evita dep duplicada.
- Files modified: `src/components/ui/button.tsx`
- Commit: `e7faae6`

### Non-deviations (intentional plan-following)

- Atoms próprios (Container, Headline, WhatsAppIcon, WhatsAppCta) seguem snippets ipsis litteris do plan.
- Provider tree EXATO conforme plan: AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children > Toaster.
- syncTouch:false (NÃO smoothTouch) honra orchestrator directive #1.
- Clarity Script id='ms-clarity' (NÃO 'clarity') honra Pitfall E + orchestrator directive #6.
- /dev guard via `process.env.NODE_ENV === "production"` em Server Component honra orchestrator directive #7 (build-time inline).
- docs/BRAND.md OVERRIDE de D-17 documentada no topo da própria doc + neste SUMMARY (orchestrator directive #2 prevalece).

## Authentication Gates

Nenhum. Esta plan é 100% código local + tests; não tocou em vendor APIs externas (env vars são opcionais e tratadas com graceful degradation).

## Threat Flags

Nenhuma surface nova além das mapeadas no plan:

- T-01-14 (/dev info disclosure) — **mitigated** via NODE_ENV inline + notFound(), tested via structure assertion. Manual check pendente para confirmar 404 em `npm start`.
- T-01-15 (Analytics scripts tampering) — **mitigated** via strategy="afterInteractive" + env vars build-time controladas pelo deploy.
- T-01-16 (Clarity ID conflict) — **mitigated** via id='ms-clarity', tested em providers/analytics.test.tsx.
- T-01-17 (WhatsAppCta deeplink elevation) — **mitigated** em Phase 1 via constants WHATSAPP_MESSAGES + encodeURIComponent (Plan 02). Phase 5 que adicionar form input deve revisar.
- T-01-18 (Lenis iOS Safari jank) — **mitigated** via syncTouch:false. Real-device validation fica em Phase 2 com motion primitives.
- T-01-19 ('use client' leak em layout) — **mitigated** via structure test que verifica root NÃO começa com "use client".

## Requirements Covered

- **FOUND-07** — Provider order tested via structure assertion em layout.tsx ✅ (6 cases passing)
- **FOUND-08** — Lenis syncTouch=false + skip em reduced motion ✅ (2 runtime cases passing)
- **FOUND-09** — 12 atoms shipped (8 shadcn + 4 próprios) ✅ (WhatsAppCta tested com 6 cases)
- **FOUND-10** — Metadata completa: title.template, OG, Twitter, robots, manifest, themeColor=#0a0a0b ✅
- **FOUND-12** — /dev rota guarded por NODE_ENV (Server Component + notFound) ✅ (3 structure cases passing)
- **TRACK-03** — Scripts Pixel + Clarity strategy="afterInteractive"; GA4 via @next/third-parties; graceful sem env ✅ (3 cases passing)

Bonus:

- **W3 fix** — `src/lib/whatsapp.ts` consome `@/lib/env` (single source) ✅ (grep returns 0; 8 tests Plan 02 permanecem verdes)
- **Brand-lock 3-layer** — `docs/BRAND.md` fecha 3ª camada (defesa cultural) ✅ (override D-17 deliberada documentada)

## Known Stubs

Nenhum stub bloqueante. Itens documentados como "polish em fase futura" (não stub, é roadmap):

- `src/app/opengraph-image.tsx` — placeholder textual (Likro + tagline). Polish Phase 7 com mockup do produto.
- `src/app/icon.tsx` — "L" textual sobre roxo. Polish Phase 7 com logo Likro renderizado.
- `/dev` showcase — seções "Motion Primitives (Phase 2)" e "Sections (Phase 3+)" com placeholder texto. Crescem conforme as fases entregam.

Nenhum desses bloqueia o goal da Plan (atoms wired, providers wired, /dev funciona em dev). Todos têm fase atribuída para resolver.

## Notes for Downstream

- **Phase 2 (motion primitives)**:
  - `<FadeUp>`, `<Stagger>`, `<Parallax>` devem viver em `src/components/motion/` e consumir `useDeviceTier()` de `@/hooks/use-device-tier`.
  - Criar `<ScrollScene>` placeholder (Server Component no-op hoje, GSAP/ScrollTrigger boundary tomorrow). Section components importam dia 1.
  - MotionConfigProvider já está wired — primitivas só precisam usar `motion/react` direto, herdam `reducedMotion="user"` automaticamente.
  - Adicionar seções no `/dev` showcase pra Lenny aprovar feel premium.
- **Phase 3+ (sections)**:
  - Toda seção monta via `<Container as="section"><Headline as="h2" size="section">...</Headline>...</Container>` — atoms são SSOT.
  - WhatsAppCta variant="primary" é o CTA principal do hero/proof/footer; variant="floating" entra ao menos em mobile.
  - Code review enforce: nenhum import direto de `lib/whatsapp` ou `lib/analytics` em arquivos de seção — sempre via `<WhatsAppCta>`.
- **Phase 5 (form)**:
  - Input + Label + Textarea + Sheet já customizados — pronto pra montar form em Sheet drawer.
  - Server Action em `app/actions/submit-lead.ts` consumirá `lib/env` para `LEAD_WEBHOOK_URL` (server-side, NÃO NEXT_PUBLIC_*).
- **Phase 7 (polish)**:
  - Atualizar `opengraph-image.tsx` e `icon.tsx` para versões finais com mockup/logo.
  - Lighthouse audit + bundle analyzer pre-launch.
  - Adicionar `manifest.webmanifest` real (atualmente só referenciado no metadata, arquivo não existe — Phase 7 cria).
- **Pendência fora desta plan (logged em STATE.md)**:
  - Número oficial WhatsApp Likro pra `NEXT_PUBLIC_WA_NUMBER` (bloqueia validação real-device do helper na Phase 3).
  - Cadência de copy review do Lenny (síncrono por seção vs async PR).
  - Aprovação Dolce Home pra seção Proof (Phase 4).
  - Webhook target form de lead (Phase 5).

## Self-Check: PASSED

- FOUND: src/components/ui/button.tsx (commit e7faae6)
- FOUND: src/components/ui/card.tsx (commit e7faae6)
- FOUND: src/components/ui/input.tsx (commit e7faae6)
- FOUND: src/components/ui/textarea.tsx (commit e7faae6)
- FOUND: src/components/ui/label.tsx (commit e7faae6)
- FOUND: src/components/ui/dialog.tsx (commit e7faae6)
- FOUND: src/components/ui/sheet.tsx (commit e7faae6)
- FOUND: src/components/ui/sonner.tsx (commit e7faae6)
- FOUND: src/components/ui/container.tsx (commit e7faae6)
- FOUND: src/components/ui/headline.tsx (commit e7faae6)
- FOUND: src/components/ui/whatsapp-icon.tsx (commit e7faae6)
- FOUND: src/components/ui/whatsapp-cta.tsx (commit e7faae6)
- FOUND: tests/components/ui/whatsapp-cta.test.tsx (commit e7faae6)
- FOUND: src/lib/whatsapp.ts modified (commit e7faae6 + b2ce76f)
- FOUND: tests/lib/whatsapp.test.ts modified (commit e7faae6)
- FOUND: src/components/providers/analytics-provider.tsx (commit b2ce76f)
- FOUND: src/components/providers/smooth-scroll-provider.tsx (commit b2ce76f)
- FOUND: src/components/providers/motion-config-provider.tsx (commit b2ce76f)
- FOUND: src/app/layout.tsx modified (commit b2ce76f)
- FOUND: src/app/dev/page.tsx (commit b2ce76f)
- FOUND: src/app/opengraph-image.tsx (commit b2ce76f)
- FOUND: src/app/icon.tsx (commit b2ce76f)
- FOUND: docs/BRAND.md (commit b2ce76f)
- FOUND: tests/providers/smooth-scroll.test.tsx (commit b2ce76f)
- FOUND: tests/providers/analytics.test.tsx (commit b2ce76f)
- FOUND: tests/app/layout-providers.test.tsx (commit b2ce76f)
- FOUND: tests/app/dev-route.test.tsx (commit b2ce76f)
- FOUND commit e7faae6 in `git log --oneline`
- FOUND commit b2ce76f in `git log --oneline`
- VERIFIED: 45/45 vitest cases passing
- VERIFIED: 0 tsc errors
- VERIFIED: npm run build exits 0 (compile + lint + static gen)
- VERIFIED: grep `process.env.NEXT_PUBLIC_WA_NUMBER` em src/lib/ returns 0 matches
- VERIFIED: grep `buildWhatsAppUrl` em src/ returns 2 files (def + único consumer)
