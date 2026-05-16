---
phase: 01-foundations-design-system
verified: 2026-05-16T12:15:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "npm start (prod build) -> http://localhost:3000/dev retorna 404"
    expected: "Rota /dev retorna 404 em runtime de producao (NODE_ENV=production). Build estatico deixa o chunk em /dev, mas o Server Component chama notFound() antes de renderizar."
    why_human: "O build gera /dev como rota estatica (81.4 kB). A eliminacao de dead-code pelo SWC e verificada por structure test (tests/app/dev-route.test.tsx), mas confirmar que um npm start real retorna 404 e a unica forma de validar o comportamento de runtime. Playwright consegue cobrir isso se o servidor estiver rodando."
  - test: "Clicar em WhatsAppCta em mobile real (iOS Safari + Android Chrome) -> abre app WhatsApp"
    expected: "URL wa.me/... abre o app instalado, nao o browser. Impossivel verificar programaticamente."
    why_human: "Deep link para wa.me so pode ser validado em dispositivo real com o app instalado. CTA-07 exige teste em iOS Safari real e Android Chrome real."
  - test: "AnalyticsProvider com env vars configuradas -> scripts no DOM"
    expected: "Com NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_CLARITY_ID populadas no .env.local, os tres scripts aparecem no DOM com os ids corretos (ms-clarity, meta-pixel)."
    why_human: "O test automatizado (tests/providers/analytics.test.tsx) valida a logica condicional mas nao valida que o snippet do Pixel inicializa window.fbq corretamente num browser real. Playwright pode cobrir abrindo DevTools."
---

# Phase 1: Foundations & Design System — Verification Report

**Phase Goal:** Estabelecer mecanicamente o brand book, os helpers criticos e os providers que tornam impossivel violar restricoes de marca, WhatsApp deeplink e tracking dispersao.
**Verified:** 2026-05-16T12:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 3-layer brand-lock: tokens ausentes em @theme + Vitest grep test (brand-lock.test.ts) + docs/BRAND.md | VERIFIED | globals.css confirma ausencia de accent-50..900; brand-lock.test.ts passa (1/1, 45/45 total); docs/BRAND.md existe em 72 linhas com checklist de code review |
| 2 | buildWhatsAppUrl em lib/whatsapp.ts e o UNICO ponto que constroi URL wa.me; hosts proibidos lancam erro | VERIFIED | Grep confirma: construcao real de URL (wa.me/) so em whatsapp.ts; web.whatsapp.com/api.whatsapp.com so em FORBIDDEN_HOSTS + jsdoc; 8/8 tests passam |
| 3 | track(event, payload) com event_id UUID v4 em cada chamada; fan-out unico para Pixel/GA4/Clarity via afterInteractive Script | VERIFIED | analytics.ts: crypto.randomUUID() com fallback; META_EVENT_MAP; optional chaining em todos vendors; 8/8 tests passam incluindo same-id cross-vendor test; analytics-provider.tsx: Scripts com strategy="afterInteractive" e id="ms-clarity" confirmados |
| 4 | /dev carrega em dev e retorna 404 em producao | VERIFIED (code path) | dev/page.tsx: if (process.env.NODE_ENV === "production") notFound(); Server Component sem "use client"; build gera rota /dev; 3/3 structure tests passam; runtime real requer human check |
| 5 | Provider tree: AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children; Lenis com syncTouch:false; skip init em reduced-motion | VERIFIED | layout.tsx: ordem exata confirmada na leitura direta do arquivo; SmoothScrollProvider: syncTouch:false (nao smoothTouch), skip com return <>{children}</> quando reduced=true; 6/6 structure tests + 2/2 render tests passam |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | @theme com accent-primary/hover/glow apenas, sem shades 50-900 | VERIFIED | Lido diretamente: 3 tokens roxo, nenhum shade numerico; token ausencia e real (nao declarado = no-op silencioso no Tailwind v4) |
| `src/lib/whatsapp.ts` | buildWhatsAppUrl + WhatsAppLocation + FORBIDDEN_HOSTS + phone regex | VERIFIED | Existente, ~82 linhas, exporta buildWhatsAppUrl e WhatsAppLocation; contem FORBIDDEN_HOSTS, /^\d{12,13}$/, encodeMessage RFC 3986 |
| `src/content/whatsapp.ts` | WHATSAPP_MESSAGES Record com 7 locations pt-BR | VERIFIED | Existente, 7 chaves (hero/pain/product/how/proof/footer/floating), pt-BR confirmado |
| `src/lib/analytics.ts` | track() fan-out + AnalyticsEvent type + META_EVENT_MAP + UUID v4 | VERIFIED | Existente, 83 linhas; exporta track e AnalyticsEvent; META_EVENT_MAP com Contact/Lead; crypto.randomUUID com fallback |
| `src/lib/env.ts` | Type-safe wrapper NEXT_PUBLIC_* | VERIFIED | Existente, 4 chaves, as const |
| `src/hooks/use-device-tier.ts` | useDeviceTier() 4 tiers + "use client" | VERIFIED | Existente; "use client"; useReducedMotion de motion/react; breakpoints 639/1023; addEventListener("resize") |
| `src/components/providers/smooth-scroll-provider.tsx` | syncTouch:false + skip em reduced | VERIFIED | Existente; syncTouch: false confirmado; if (reduced) return <>{children}</> confirmado |
| `src/components/providers/analytics-provider.tsx` | Scripts afterInteractive + id="ms-clarity" + graceful sem env | VERIFIED | Existente; GoogleAnalytics + 2x Script strategy="afterInteractive"; id="ms-clarity" confirmado; condicional em env vars |
| `src/components/providers/motion-config-provider.tsx` | MotionConfig reducedMotion="user" | VERIFIED | Existente; <MotionConfig reducedMotion="user"> confirmado |
| `src/app/layout.tsx` | Provider tree ordem exata + lang=pt-BR + metadata FOUND-10 | VERIFIED | Existente; ordem Analytics>Smooth>Motion>Toaster confirmada; lang="pt-BR"; title.template, OG locale=pt_BR, twitter card, robots, manifest, themeColor=#0a0a0b |
| `src/app/dev/page.tsx` | Server Component + notFound() em prod | VERIFIED | Existente; sem "use client"; if (process.env.NODE_ENV === "production") notFound() |
| `tests/brand-lock.test.ts` | Grep test Node-puro cross-platform | VERIFIED | Existente; Node-puro (fs.readdirSync); FORBIDDEN_REGEX cobre 9 prefixes x 9 shades; FOUND-03 violation na mensagem de erro; 1/1 test passa |
| `docs/BRAND.md` | 3a camada brand-lock com checklist | VERIFIED | Existente, 72 linhas; ## Brand Lock; regra do roxo; 9-item checklist de code review |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/layout.tsx` | providers/analytics+smooth+motion | imports + JSX nesting ordem exata | WIRED | Confirmado: linhas 3-5 importam os 3 providers; JSX: AnalyticsProvider>SmoothScrollProvider>MotionConfigProvider>children>Toaster |
| `src/lib/whatsapp.ts` | `@/lib/env` | env.NEXT_PUBLIC_WA_NUMBER | WIRED | W3 fix aplicado: import {env} from "@/lib/env"; const phone = env.NEXT_PUBLIC_WA_NUMBER |
| `src/components/ui/whatsapp-cta.tsx` | whatsapp.ts + analytics.ts + content/whatsapp.ts | buildWhatsAppUrl + track + WHATSAPP_MESSAGES | WIRED | Todos 3 imports presentes; handleClick chama track, depois buildWhatsAppUrl(WHATSAPP_MESSAGES[location], location) |
| `src/components/providers/smooth-scroll-provider.tsx` | lenis/react + motion/react | ReactLenis + useReducedMotion | WIRED | imports confirmados; syncTouch:false; skip pattern correto |
| `tests/brand-lock.test.ts` | `src/**/*.{ts,tsx,css}` | fs.readdirSync recursivo + regex | WIRED | Funcionando: 45/45 tests passam incluindo brand-lock; negative test confirmado no SUMMARY-03 |

### Data-Flow Trace (Level 4)

Esta fase entrega helpers e providers — nao componentes de dados dinamicos. Nenhum artifact renderiza dados de banco; todos operam com env vars, static content ou vendor calls. Level 4 nao se aplica.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 45/45 vitest tests verdes | `npx vitest run` | 45 passed em 5.07s | PASS |
| 0 erros TypeScript strict | `npx tsc --noEmit` | 0 erros (saida vazia) | PASS |
| Build de producao sem erros | `npm run build` | Compiled successfully; 7 routes geradas | PASS |
| wa.me construido apenas em whatsapp.ts | `grep -r "wa\.me" src/` | Retornos so em whatsapp.ts (2 returns + jsdoc) | PASS |
| window.fbq/gtag/clarity so em analytics.ts | `grep -r "window\.(fbq\|gtag\|clarity)" src/` | So em analytics.ts (4 linhas de chamadas) e analytics-provider.tsx (1 comentario sobre window.clarity) | PASS |
| Brand-lock: nenhum shade proibido em src/ | brand-lock.test.ts | 1/1 test passou; neg test confirmado no SUMMARY-03 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| FOUND-01 | 01-01 | Next.js 15.5 + TS strict + ESLint/Prettier | SATISFIED | package.json: next@15.5.18; tsconfig: strict+noUncheckedIndexedAccess; .prettierrc presente |
| FOUND-02 | 01-01 | Tailwind v4 @theme com brand tokens Likro | SATISFIED | globals.css: @theme com tokens accent/surface/text/border/neutral/font/radii |
| FOUND-03 | 01-03 | Brand-lock 3-layer defense (tokens ausentes + grep test + docs) | SATISFIED | Layer 1: tokens accent-NN ausentes; Layer 2: brand-lock.test.ts passa; Layer 3: docs/BRAND.md com checklist |
| FOUND-04 | 01-01 | Inter via next/font 3 pesos (400/500/700) + display:swap | SATISFIED | layout.tsx: weight:["400","500","700"], display:"swap", variable:"--font-inter" |
| FOUND-05 | 01-01 | cn() helper clsx+tailwind-merge | SATISFIED | src/lib/utils.ts exporta cn(); 3/3 tests passam |
| FOUND-06 | 01-03 | useDeviceTier() 4 tiers + resize reativo | SATISFIED | use-device-tier.ts: reduced/mobile/tablet/desktop; addEventListener("resize"); 5/5 tests |
| FOUND-07 | 01-04 | Provider tree AnalyticsProvider>SmoothScrollProvider>MotionConfigProvider | SATISFIED | layout.tsx ordem exata confirmada; 6/6 structure tests |
| FOUND-08 | 01-04 | SmoothScrollProvider: syncTouch:false + skip em reduced-motion | SATISFIED | syncTouch:false (nao smoothTouch); if(reduced) return <>{children}</>; 2/2 tests |
| FOUND-09 | 01-04 | Atoms UI (Button, Container, Headline, Card, WhatsAppCta + shadcn atoms) | SATISFIED | 12 atoms em src/components/ui/; WhatsAppCta testado com 6 cases |
| FOUND-10 | 01-04 | Metadata global completa (title template, OG, Twitter, robots, manifest, themeColor) | SATISFIED | layout.tsx: metadataBase, title.template, OG locale=pt_BR, twitter card=summary_large_image, robots, manifest, themeColor=#0a0a0b |
| FOUND-11 | 01-01 | robots.ts + sitemap.ts dinamicos | SATISFIED | robots.ts: VERCEL_ENV==="production" gating; sitemap.ts: entry para likro.com.br |
| FOUND-12 | 01-04 | Rota /dev apenas em dev + notFound() em prod | SATISFIED (code) | dev/page.tsx: if(process.env.NODE_ENV==="production") notFound(); 3/3 structure tests; runtime: human check necessario |
| CTA-01 | 01-02 | buildWhatsAppUrl unico helper wa.me + canonical format | SATISFIED | Grep confirma: so whatsapp.ts constroi URLs wa.me/ no src/; 8/8 tests |
| CTA-02 | 01-02 | Helper proibe web.whatsapp.com; validado por unit test | SATISFIED | FORBIDDEN_HOSTS guard; 2 test cases cobrem web.whatsapp.com e api.whatsapp.com; ambos lancam Error "Forbidden host" |
| TRACK-01 | 01-03 | track() unico fan-out pra Pixel/GA4/Clarity | SATISFIED | Grep: window.fbq/gtag/clarity so em analytics.ts; 8/8 tests; analytics-provider menciona a regra em comentario |
| TRACK-02 | 01-03 | event_id UUID v4 em todo track(), mesmo id cross-vendor | SATISFIED | generateEventId() com crypto.randomUUID(); enriquece GA4 payload E Pixel options.eventID; Clarity set last_event_id; test "uses SAME event_id across GA4, Pixel and Clarity" passa |
| TRACK-03 | 01-04 | Pixel + Clarity via Script strategy="afterInteractive" | SATISFIED | analytics-provider.tsx: 2x Script com strategy="afterInteractive"; id="ms-clarity" (nao "clarity"); GA4 via @next/third-parties; graceful sem env; 3/3 tests |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/analytics.ts` | 79 | `eslint-disable-next-line no-console` orfao (regra no-console nao ativa no config) | Info | Build emite warning ESLint. Nao bloqueante. Documentado no SUMMARY-04 como deferred. |
| `src/components/ui/whatsapp-cta.tsx` | 51 | `buildWhatsAppUrl` sem try/catch em handleClick — throw em prod com env var faltando causa unmount sem Error Boundary | Warning | Em prod, se NEXT_PUBLIC_WA_NUMBER for removido acidentalmente, button trava em loading=true e app pode desmontar. WR-04 do 01-REVIEW.md. Correcao simples: try/catch no handleClick. Fix recomendado antes da Phase 3. |
| `src/app/icon.tsx` | ~17 | `#7c3aed` hex hard-coded em inline style do next/og | Info | next/og nao suporta CSS vars; hex e necessario. Menor violacao do brand-lock (nao e capturada pelo grep test). WR-03 do 01-REVIEW.md. Fix via src/lib/brand-tokens.ts sugerido. |
| `src/components/ui/sonner.tsx` | ~14 | `useTheme()` sem ThemeProvider no tree — retorna undefined, fallback "system" | Warning | Toasts Sonner serao "system" theme, nao casam com surface-dark sections da Phase 3+. WR-01 do 01-REVIEW.md. Fix: hardcode theme="light" ou adicionar ThemeProvider. |
| `src/components/ui/dialog.tsx`, `sheet.tsx` | varios | Classes `bg-background`, `ring-ring`, `text-muted-foreground` sem backing @theme token — silent no-op Tailwind v4 | Warning | Dialog/Sheet renderizarao com fundo transparente/branco quebrado se usados antes de Phase 3 adicionar token aliases. WR-02 do 01-REVIEW.md. Fix: adicionar alias tokens ao @theme ou reescrever classes com tokens Likro. |

Nenhum anti-pattern bloqueia o objetivo desta fase (brand system + helpers + providers). Os warnings (WR-01, WR-02, WR-04) devem ser corrigidos antes ou durante a Phase 3 que introduz UI real.

### Human Verification Required

#### 1. Rota /dev retorna 404 em runtime de producao

**Test:** Rodar `npm run build && npm start`, abrir http://localhost:3000/dev no browser.
**Expected:** Resposta 404 (Next.js Not Found page), nao o showcase de atoms.
**Why human:** O build estatico gera /dev como rota (81.4 kB visivel no output). A eliminacao de dead-code pelo SWC para a branch `if (process.env.NODE_ENV === "production") notFound()` e validada por structure tests, mas confirmar o comportamento de runtime numa instancia `npm start` e a prova final do FOUND-12. Playwright MCP pode cobrir isso se o servidor estiver rodando.

#### 2. WhatsAppCta em mobile real abre app WhatsApp

**Test:** Em dispositivo iOS Safari ou Android Chrome com WhatsApp instalado, clicar em qualquer WhatsAppCta na pagina (pode ser em localhost com IP LAN ou preview Vercel).
**Expected:** Abre o app WhatsApp com a mensagem pre-preenchida, nao o browser web.whatsapp.com.
**Why human:** CTA-07 e impossivel de verificar programaticamente. A URL wa.me/ e canonicamente o deeplink correto, mas o comportamento de abertura depende do OS e do app instalado. Mais critico em iOS Safari (historico de bugs com deeplinks).

#### 3. Scripts de analytics aparecem no DOM com env vars configuradas

**Test:** Configurar .env.local com NEXT_PUBLIC_GA4_ID=G-XXXX, NEXT_PUBLIC_META_PIXEL_ID=12345, NEXT_PUBLIC_CLARITY_ID=abc123. Rodar npm run dev. Abrir DevTools > Elements e buscar pelos scripts.
**Expected:** `<script id="meta-pixel">` e `<script id="ms-clarity">` presentes no DOM. GA4 script injetado pelo @next/third-parties. Sem env vars: nenhum dos tres aparece.
**Why human:** Os tests automaticos (tests/providers/analytics.test.tsx) validam a logica condicional mas nao validam que o snippet do Pixel inicializa window.fbq corretamente num browser real com a rede real. Playwright MCP pode cobrir verificando document.getElementById("ms-clarity") no DOM.

---

## Gaps Summary

Nenhuma gap bloqueia o objetivo da fase. Os 5 success criteria do ROADMAP estao todos satisfeitos por evidencia de codigo + 45/45 tests verdes + build de producao limpo. O status `human_needed` reflete 3 itens de validacao de runtime que por natureza exigem browser ou dispositivo real — sao qualidade assurance de deployment, nao falhas de implementacao.

Os warnings do 01-REVIEW.md (WR-01 Sonner theme, WR-02 dialog/sheet tokens, WR-04 try/catch no WhatsAppCta) sao debitos tecnicos de qualidade com fix trivial. Nenhum impede o objetivo da Phase 1. Devem ser resolvidos na abertura da Phase 3 antes de qualquer secao UI produtiva usar Dialog, Sheet ou WhatsAppCta em fluxo critico.

---

_Verified: 2026-05-16T12:15:00Z_
_Verifier: Claude (gsd-verifier)_
