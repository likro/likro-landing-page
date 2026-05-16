---
phase: 03-hero-benchmarked-isolado
plan: 02
subsystem: hero
tags: [hero, header, rsc, copy-module, lcp, glow-pulse, tdd]

requires:
  - plan: 03-01
    provides: WhatsAppLocation extended with "header", WHATSAPP_MESSAGES.header, public/mockups/atendimentos.png, public/logos/likro-logo.svg, Wave 0 grep gates (tests/sections/hero-invariants.test.ts), .env.local with real NEXT_PUBLIC_WA_NUMBER
provides:
  - HeroCopy type + HERO_COPY_VARIANTS (v1, v2, v3) + HERO_COPY ativo (src/content/hero.ts)
  - Hero section as Server Component (5 RSC: index, HeroCopy, HeroMockup, HeroMicroCard, HeroBackground)
  - Header layout component (logo + WhatsApp secondary CTA)
  - SINGLE next/image priority of the page (HeroMockup)
  - CSS @keyframes hero-glow-pulse (transform + opacity only, GPU-friendly)
  - tests/content/hero.test.ts (9 contracts: D-07/D-09/D-11/D-13/D-05/D-17/COPY-02)
  - All 5 Wave-0 hero invariant gates now PASSING (were skipped/half-passing in Plan 01)
affects: [03-03-PLAN, 04-pain, 05-product, 06-how, 07-proof, 08-cta]

tech-stack:
  added: []
  patterns:
    - "as const satisfies Record<string, T> for content variants: gets exhaustive type checks + literal types in IntelliSense + runtime objects, with a single source of truth for the shape."
    - "HERO_COPY (ativo) re-exported from HERO_COPY_VARIANTS.vX — Lenny approves variante swapping 1 line, sections only import HERO_COPY, never the catalog."
    - "RSC-only Hero (zero 'use client'): WhatsAppCta is the only client island; H1/sub/CTA-shell/mockup all render server-side for LCP."
    - "Single-RAF glow pulse via CSS @keyframes (no JS) — animates only transform + opacity, GPU-friendly, auto-noop under prefers-reduced-motion via existing global rule in globals.css."
    - "Logo via raw <img> with width/height (not next/image): preserves the single <Image priority> slot for the hero mockup; CLS guarded by intrinsic dimensions."

key-files:
  created:
    - src/content/hero.ts
    - src/sections/Hero/index.tsx
    - src/sections/Hero/HeroCopy.tsx
    - src/sections/Hero/HeroMockup.tsx
    - src/sections/Hero/HeroMicroCard.tsx
    - src/sections/Hero/HeroBackground.tsx
    - src/components/layout/Header.tsx
    - tests/content/hero.test.ts
  modified:
    - src/app/page.tsx
    - src/app/globals.css

key-decisions:
  - "HERO_COPY default = HERO_COPY_VARIANTS.v1 ('A operação da sua clínica, em um só lugar.') — Lenny escolhe variante no PR mudando 1 linha. Plan 03 PR owns the decision."
  - "HeroBackground glow pulse via CSS @keyframes (not Framer Motion) — single-source RAF, zero JS cost on LCP path, automatically respects prefers-reduced-motion via existing globals.css rule."
  - "Logo no Header como <img> raw (não next/image): HERO-04 requires exactly 1 <Image priority> per page. Logo width/height attrs reserve space → no CLS."
  - "Container wrapper duplica min-h-svh com <section>: <section> sustenta full-bleed background; <Container> vertical-centra conteúdo via items-center. Documentado no doc block do index.tsx — não consolidar."

requirements-completed:
  - HERO-01
  - HERO-02
  - HERO-03
  - HERO-04
  - HERO-05
  - COPY-01

duration: 17min
completed: 2026-05-16
---

# Phase 3 Plan 02: Hero (Header + 5 RSC + Copy Module) Summary

**Hero verticalizado para clínicas pronto pra rodar em dev: Header + Hero como Server Components, 3 variantes de copy (Lenny escolhe no PR), único next/image priority da página, glow ambiente CSS-only, todos os 5 Wave-0 grep gates verdes.**

## Performance

- **Duration:** ~17 min
- **Tasks:** 2 (Task 1: copy module + TDD test; Task 2: Hero 5 RSC + Header + page wiring + globals keyframe)
- **Files:** 8 created + 2 modified = 10 changes
- **Build:** `/` route = 12.5 kB route size, 121 kB First Load JS (vs 150 kB target → 19% margin)

## Accomplishments

- **HERO-01..05 + COPY-01 shipped** — H1 + mockup renderizam estado final imediato (zero animação de entrada), CTA acima da dobra mobile esperado, único `<Image priority>`, `min-h-svh` (NÃO `vh`), toda copy em `src/content/hero.ts`.
- **3 variantes de copy contrastantes** (v1 afirmação vertical pura, v2 categoria-criação, v3 especificidade operacional) — todas com "clínica" em h1 E sub, ctaLabel "Falar no WhatsApp", trust sussurrado sem Dolce Home, zero frases banidas anti-IA.
- **Glow ambiente como ÚNICA animação** — `@keyframes hero-glow-pulse` em globals.css anima apenas `transform: translateY(-50%) scale(...)` + `opacity`, ciclo 10s ease-in-out. Reduced motion congela automaticamente via regra global existente.
- **Wave 0 gates 100% verdes** — `tests/sections/hero-invariants.test.ts` agora reporta 6 passing (HERO-02 motion / HERO-05 vh / HERO-04 priority com gate STRICT ===1 ativado / COPY-01 inline / COPY-02 banidas em hero.ts / sanity walk).
- **D-17 unified copy gate** — `tests/content/hero.test.ts` Test 9 valida que `WHATSAPP_MESSAGES.hero` e `WHATSAPP_MESSAGES.header` (Plan 01) passam pelo mesmo gate anti-IA + Dolce Home + length 10..200. Lenny aprova as 5 strings (3 variantes × h1+sub+trust + 2 WhatsApp messages) no MESMO PR.

## Task Commits

Cada task commitada atomicamente (parallel-mode com `--no-verify`):

1. **Task 1: Hero copy module + 9 contract tests (TDD)** — `6c55a37` (feat)
2. **Task 2: Hero 5 RSC + Header + page + globals keyframe** — `35d1447` (feat)

## Files Created/Modified

**Created (8):**
- `src/content/hero.ts` (60 linhas) — HeroCopy type + 3 variantes + HERO_COPY ativo
- `src/sections/Hero/index.tsx` — orchestrator RSC (section min-h-svh + Container grid lg:[1fr_1.3fr])
- `src/sections/Hero/HeroCopy.tsx` — H1 + sub + WhatsAppCta primary + trust
- `src/sections/Hero/HeroMockup.tsx` — `<Image priority fetchPriority="high">` /mockups/atendimentos.png
- `src/sections/Hero/HeroMicroCard.tsx` — overlay estático com lucide icon (Instagram p/ v1)
- `src/sections/Hero/HeroBackground.tsx` — gradient + grid sutil + glow blur-120px com keyframe
- `src/components/layout/Header.tsx` — logo <img> + WhatsAppCta secondary location="header"
- `tests/content/hero.test.ts` (90 linhas) — 9 contracts

**Modified (2):**
- `src/app/page.tsx` — placeholder "Foundations OK" removido; renderiza `<Header />` + `<main><Hero /></main>`
- `src/app/globals.css` — `@keyframes hero-glow-pulse` adicionado após bloco prefers-reduced-motion

## Decisions Made

- **HERO_COPY default = `HERO_COPY_VARIANTS.v1`** (afirmação vertical pura). Sinaliza explicitamente pro Plan 03 PR que Lenny escolhe entre v1/v2/v3 mudando 1 linha.
- **Glow pulse via CSS @keyframes (não Framer Motion)** — zero JS runtime cost, single-RAF, respeita reduced-motion automaticamente via regra global em globals.css:93-102.
- **Logo header via `<img>` raw com width/height** — preserva HERO-04 (único `<Image priority>` da landing); CLS guard via intrinsic dimensions (120×32).
- **Duplicar `min-h-svh` em `<section>` E `<Container>`** — intencional e documentado no doc block do index.tsx. section sustenta background full-bleed, Container vertical-centra grid via items-center. Não consolidar em refactor.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Comentário JSDoc disparava falso-positivo do regex vh-gate**
- **Found during:** Task 2 — após criar os 6 arquivos, primeiro run de `npx vitest run tests/sections/hero-invariants.test.ts` falhou no Test 2 (HERO-05).
- **Issue:** `src/sections/Hero/index.tsx` linha 8 do doc block continha literalmente `(NÃO 100vh / h-screen)` — o regex de invariant `\bh-screen\b` capturou a string dentro do comentário (regex não distingue código de comentário).
- **Fix:** Refraseei o comentário para `usa min-h-svh (NUNCA viewport-screen height utilities)` — mantém a intenção pedagógica sem usar o token literal banido.
- **Files modified:** `src/sections/Hero/index.tsx` (1 linha do JSDoc)
- **Commit:** incluído em `35d1447` (não houve commit separado — bug surgiu antes do commit da Task 2)

## Verification Output

**`npm run typecheck`:** exit 0 (HeroCopy shape + WhatsAppLocation exhaustiveness)
**`npx vitest run tests/content/hero.test.ts`:** 9/9 passing (12ms)
**`npx vitest run tests/sections/hero-invariants.test.ts`:** 6/6 passing (15ms) — gate strict ===1 ATIVO (HeroMockup.tsx existe)
**`npx vitest run` (suíte completa):** 63/63 passing (4.25s) — zero regressões em providers/components/lib/app
**`npm run build`:** exit 0

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    12.5 kB         121 kB    ← landing
├ ○ /_not-found                            988 B         103 kB
├ ○ /dev                                 74.9 kB         184 kB
├ ○ /dev/all                             1.74 kB         157 kB
├ ○ /dev/parallax                         1.8 kB         155 kB
├ ○ /dev/reveal                           1.8 kB         155 kB
├ ○ /dev/scene                             686 B         156 kB
├ ○ /dev/sticky                          3.62 kB         157 kB
├ ○ /dev/textsplit                        1.8 kB         155 kB
├ ƒ /icon                                  139 B         102 kB
├ ƒ /opengraph-image                       139 B         102 kB
├ ○ /robots.txt                            139 B         102 kB
└ ○ /sitemap.xml                           139 B         102 kB
+ First Load JS shared by all             102 kB
```

`/` route = **121 kB First Load JS**, comfortably under the 150 kB target (29 kB margin = 19%).

## Active Copy Variant (default)

`HERO_COPY = HERO_COPY_VARIANTS.v1`

```
H1: "A operação da sua clínica, em um só lugar."
Sub: "Lead que chegou pelo Instagram, conversa no WhatsApp, agendamento,
      retorno — a sua clínica organizada numa plataforma só."
CTA: "Falar no WhatsApp"
Trust: "Operação ativa em clínicas reais hoje."
MicroCard: "Novo lead pelo Instagram" + Instagram icon
```

**Sinal pro Plan 03 PR:** Lenny escolhe entre v1 (atual), v2 ("A plataforma da clínica moderna brasileira."), ou v3 ("Do DM no Instagram ao agendamento da sua clínica, sem perder a conversa no caminho."). Trocar = mudar 1 linha no fim de `src/content/hero.ts`.

## Deferred Items (Plan 03 owns)

1. **Vercel env vars (`NEXT_PUBLIC_WA_NUMBER=5511922324329`)** — handoff humano herdado do Plan 01; Plan 03 reconfirma antes do Lighthouse mobile.
2. **Playwright MCP smoke test (mobile 375×667 + desktop 1280×720)** — não executado neste plan porque o sandbox do executor parallel não tem MCP playwright tools disponíveis. Lenny deve rodar `npm run dev` + abrir Chrome DevTools mobile preset + verificar:
   - Header logo visível
   - H1 "A operação da sua clínica, em um só lugar." visível sem scroll
   - CTA "Falar no WhatsApp" visível sem scroll (HERO-01 — CTA above-fold mobile)
   - Console sem erros JS
   - Mockup pode estar abaixo (stack vertical mobile) — aceitável
   - Glow roxo pulsa devagar (10s) em desktop
   - `Emulate prefers-reduced-motion: reduce` → glow congela
3. **Copy review do Lenny** (Plan 03 PR): aprovar/editar v1 vs v2 vs v3 + as 2 strings de `WHATSAPP_MESSAGES` (hero, header).

## Threat Model Outcomes

- **T-3-01 (XSS via copy):** Mitigated. `src/content/hero.ts` é módulo TS literal compilado em build; consumidores usam `{HERO_COPY.h1}` (auto-escape JSX); `grep dangerouslySetInnerHTML src/sections/Hero/ src/components/layout/` retorna 0 matches.
- **T-3-04 (WhatsApp deep-link spoofing):** Mitigated (herdado Phase 1). Plan não modifica `<WhatsAppCta>` nem `buildWhatsAppUrl` — apenas consome. Real-device test em Plan 03 confirma comportamento iOS/Android.
- **T-3-05 (Open redirect):** Mitigated. CTA usa `window.open(buildWhatsAppUrl(...), "_blank", "noopener,noreferrer")` — URL determinística (env + content map), zero user input no payload.

## Next Phase Readiness

**Plan 03 desbloqueado:**
- `npm run dev` abre `/` com Hero completo renderizando (Header + Hero RSC)
- PR pode subir pra Lenny revisar copy e escolher variante
- Lighthouse Vercel preview vai medir LCP real do mockup (`/mockups/atendimentos.png` AVIF/WebP em build)
- Real-device test (iOS/Android) vai validar:
  - Tap no CTA hero abre WhatsApp app (não browser)
  - Tap no CTA header (location="header") usa mensagem `WHATSAPP_MESSAGES.header`
  - Glow não causa jank em mobile mid-range
  - `prefers-reduced-motion` congela glow

## Self-Check: PASSED

**Files verified:**
- FOUND: `src/content/hero.ts`
- FOUND: `src/sections/Hero/index.tsx`
- FOUND: `src/sections/Hero/HeroCopy.tsx`
- FOUND: `src/sections/Hero/HeroMockup.tsx`
- FOUND: `src/sections/Hero/HeroMicroCard.tsx`
- FOUND: `src/sections/Hero/HeroBackground.tsx`
- FOUND: `src/components/layout/Header.tsx`
- FOUND: `tests/content/hero.test.ts`
- FOUND: `src/app/page.tsx` (modificado, sem mais "Foundations OK")
- FOUND: `src/app/globals.css` (contém `@keyframes hero-glow-pulse`)

**Commits verified:**
- FOUND: `6c55a37` (Task 1 — feat: hero copy module + tests)
- FOUND: `35d1447` (Task 2 — feat: Hero 5 RSC + Header + page)

**Gate verification:**
- 5 Wave-0 grep invariants (Plan 01) — all PASSING after Plan 02 (`npx vitest run tests/sections/hero-invariants.test.ts` exits 0; 6/6 including sanity)
- 9 copy contracts — all PASSING (`npx vitest run tests/content/hero.test.ts` exits 0)
- Full suite — 63/63 passing, zero regressões

---
*Phase: 03-hero-benchmarked-isolado*
*Completed: 2026-05-16*
