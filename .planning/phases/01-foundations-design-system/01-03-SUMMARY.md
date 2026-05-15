---
phase: 01-foundations-design-system
plan: 03
subsystem: tracking-and-device-tiering
tags: [analytics, tracking, meta-pixel, ga4, clarity, device-tier, brand-lock, tdd]
requires:
  - "Plan 01-01 scaffold (Vitest 3.x configurado, jsdom env, alias @/* -> src/*)"
  - "motion@12.38.0 (já em deps via Plan 01-01) — exporta useReducedMotion"
provides:
  - "src/lib/env.ts: type-safe wrapper sobre process.env.NEXT_PUBLIC_* (WA/GA4/Pixel/Clarity)"
  - "src/lib/analytics.ts: track(event, payload) único ponto de fan-out p/ fbq+gtag+clarity"
  - "src/lib/analytics.ts: AnalyticsEvent union type (8 eventos canônicos)"
  - "src/lib/analytics.ts: UUID v4 event_id COMPARTILHADO entre GA4 / Pixel / Clarity (dedup CAPI ready)"
  - "src/lib/analytics.ts: META_EVENT_MAP — whatsapp_click -> Contact, form_submit_success -> Lead, demais -> trackCustom"
  - "src/hooks/use-device-tier.ts: useDeviceTier() retornando 'reduced'|'mobile'|'tablet'|'desktop' reativo a resize"
  - "tests/brand-lock.test.ts: defesa Layer 2 do FOUND-03 (orchestrator directive #2) — Node-puro cross-platform"
affects:
  - "Plan 01-04 (providers): AnalyticsProvider chama track() em route changes (page_view); LenisProvider pode consumir useDeviceTier p/ tunar smoothness por device"
  - "Plan 01-02 (WhatsApp lib): pode opcionalmente refatorar para usar env.NEXT_PUBLIC_WA_NUMBER em vez de process.env direto (mantém single source)"
  - "Phase 2 (motion primitives): FadeUp/Stagger/Parallax todos consultam useDeviceTier p/ escolher choreography (D-04, mobile capping)"
  - "Phase 3+ (sections): todos CTAs, form, scroll depth chamam track() — NUNCA window.fbq/gtag/clarity direto"
tech-stack-added: []
patterns-introduced:
  - "Single fan-out de analytics (Pattern 7 RESEARCH): UM ponto chama 3 vendors com MESMO event_id — risco crítico #6 (double-fire/PII) eliminado por design"
  - "event_id desde dia 1 (UUID v4 crypto.randomUUID com fallback): retrofit Meta CAPI futuro é zero-cost; mesmo id em GA4 payload e Pixel options.eventID"
  - "META_EVENT_MAP: eventos internos -> standard Meta events quando aplicável (Contact, Lead), demais via trackCustom"
  - "Optional chaining defensive (window.fbq?.()): graceful no-op se vendor script ainda não carregou ou env vars ausentes (dev local sem .env.local)"
  - "useDeviceTier hook único (Pattern 8 RESEARCH): reduced motion sempre vence; matchMedia breakpoints 639/1023; reage a resize"
  - "Brand-lock test Node-puro (orchestrator directive #2): fs.readdirSync recursivo + regex global — sem dep de grep no PATH, funciona em Win/Linux/macOS sem mudança"
  - "TDD red-green disciplina: 3 testes escritos PRIMEIRO (RED confirmado em vitest), implementação criada DEPOIS (GREEN)"
key-files-created:
  - path: "src/lib/env.ts"
    purpose: "Type-safe NEXT_PUBLIC_* wrapper (4 chaves)"
  - path: "src/lib/analytics.ts"
    purpose: "track() single fan-out + AnalyticsEvent type + META_EVENT_MAP + generateEventId UUID v4"
  - path: "src/hooks/use-device-tier.ts"
    purpose: "useDeviceTier() + DeviceTier type — reduced/mobile/tablet/desktop reativo a resize"
  - path: "tests/lib/analytics.test.ts"
    purpose: "8 tests: UUID v4 regex em todos vendors, same id cross-vendor, Contact/Lead mapping, trackCustom fallback, SSR no-op, graceful degradation"
  - path: "tests/hooks/use-device-tier.test.tsx"
    purpose: "5 tests: 4 tiers (reduced/mobile/tablet/desktop) + resize reativo"
  - path: "tests/brand-lock.test.ts"
    purpose: "1 test agregado Node-puro cobrindo 9 prefixes x 9 shades = 81 patterns proibidos"
key-files-modified:
  - path: "src/app/globals.css"
    purpose: "Reescrito 1 comentário que continha literal 'bg-accent-50/100/.../900' (false positive do próprio brand-lock test) — intent docs preservado, padrão substituído por 'utilities accent-shade (escala 50..900)'"
key-decisions:
  - "Node-puro implementation no brand-lock test (NÃO execSync grep) — orchestrator directive #2 explícita: cross-platform Win/Linux/macOS sem dep de tool externo no PATH. Usa fs.readdirSync recursivo + regex global com 9 prefixes (bg/text/border/from/to/via/ring/outline/decoration) x escala 50..900."
  - "META_EVENT_MAP keeps payload limpo no .track() (sem event_id) e injeta event_id via options.eventID — alinhado com docs oficiais do Meta Pixel para CAPI dedup."
  - "Clarity recebe DUAS chamadas por track(): clarity('event', name) para custom event + clarity('set', 'last_event_id', uuid) para correlacionar sessão com analytics — pattern de Pattern 7 RESEARCH expandido p/ garantir mesmo id em TODOS os 3 vendors."
  - "DeviceTier estado inicial 'desktop' durante SSR/hydration; o useEffect ajusta pós-mount — evita hydration mismatch em mobile."
  - "Fallback non-crypto p/ generateEventId (Date.now + Math.random.toString(36)) só serve runtimes pré-2021. UUID resultante não é v4 verdadeiro mas suficiente p/ dedup analytics; T-01-13 mitigated."
  - "Comentário em globals.css reescrito (Plan 01 deixou um padrão literal proibido no comment) — fix Rule 1 (bug em artefato upstream causando falso positivo). Intent docs preservado."
metrics:
  tasks-completed: 3
  duration: "~6min (3 tasks TDD, npm install ~1min)"
  completed-date: "2026-05-15"
---

# Phase 1 Plan 3: Tracking + Device Tier + Brand-Lock Defense Summary

Pilar de tracking (TRACK-01/TRACK-02), hook de device tier (FOUND-06) e a defesa REAL Layer 2 do brand-lock do roxo (FOUND-03 — orchestrator directive #2). Três módulos em `src/` + 3 testes TDD totalizando 14 novos cases (8 + 5 + 1) — todos verdes. `npx tsc --noEmit` 0 erros. Suite completa do projeto: 17 tests passando em ~2s.

## What Shipped

### Task 1 — env.ts + analytics.ts + tests (commit `d34d261`)

- `src/lib/env.ts`: const `env` com 4 chaves `NEXT_PUBLIC_*` — type-safe acesso a `process.env` num único lugar. Plan 01-04 (providers) e refactor opcional de Plan 01-02 (whatsapp lib) consomem isto.
- `src/lib/analytics.ts`:
  - `AnalyticsEvent` union type com 8 eventos canônicos (whatsapp_click, cta_click, form_focus, form_submit_{attempt,success,error}, section_view, scroll_depth).
  - `track(event, payload?)` — ÚNICO ponto que toca `window.fbq`, `window.gtag`, `window.clarity`. Componentes JAMAIS chamam vendor APIs direto.
  - `generateEventId()` — `crypto.randomUUID()` com fallback non-crypto pra runtimes pré-2021.
  - `META_EVENT_MAP`: whatsapp_click → "Contact", form_submit_success → "Lead". Eventos não mapeados caem em `trackCustom`.
  - SSR no-op via `typeof window === "undefined"` guard.
  - Dev observability: `console.debug("[track]", event, enriched)` em non-prod.
  - `declare global { Window }` types para `fbq`/`gtag`/`clarity`.
- `tests/lib/analytics.test.ts`: **8 tests, todos GREEN**:
  1. event_id (UUID v4 regex) em GA4 payload
  2. eventID + 'Contact' standard event no Pixel
  3. trackCustom + eventID p/ eventos não mapeados (section_view)
  4. MESMO event_id em GA4 + Pixel + Clarity (dedup-ready)
  5. form_submit_success → 'Lead' Meta standard event
  6. clarity('event', name) é chamado em toda track()
  7. SSR no-op (window undefined) — não throw
  8. graceful degradation — window.fbq ausente não throw

### Task 2 — useDeviceTier hook + tests (commit `1f6c595`)

- `src/hooks/use-device-tier.ts`:
  - `"use client"` directive (uso de useEffect + window).
  - Type `DeviceTier = "reduced" | "mobile" | "tablet" | "desktop"`.
  - Reduced motion (`useReducedMotion` from `motion/react`) **sempre vence**.
  - Breakpoints: `(max-width: 639px)` → mobile, `(max-width: 1023px)` → tablet, else desktop.
  - Reage a `window.resize` com listener `{ passive: true }` + cleanup em unmount.
  - Estado inicial `"desktop"` evita hydration mismatch (efeito ajusta pós-mount).
- `tests/hooks/use-device-tier.test.tsx`: **5 tests, todos GREEN**:
  1. reduced motion mock → 'reduced'
  2. matchMedia 639 matches → 'mobile'
  3. matchMedia 1023 matches (639 não) → 'tablet'
  4. nenhum matches → 'desktop'
  5. resize event re-computa tier (desktop → mobile)

### Task 3 — Brand-lock grep test (commit `d2b55f5`)

- `tests/brand-lock.test.ts`: **defesa Layer 2 do FOUND-03**.
  - Implementação **Node-puro** (orchestrator directive #2 explícita): `fs.readdirSync` recursivo + regex global. Zero deps externas, zero comandos de shell.
  - Cross-platform Windows / Linux / macOS por design.
  - Regex única cobre 9 prefixes (`bg|text|border|from|to|via|ring|outline|decoration`) × 9 shades (`50|100|200|300|400|500|600|700|800|900`) = **81 patterns proibidos** num único pass.
  - Mensagem de falha inclui literal "FOUND-03 violation" + lista de arquivos+matches → developer vê causa em 1s no CI.
- **Negative test confirmado** (acceptance criteria explícita): adicionei `bg-accent-50` ao `src/app/page.tsx`, rodei `npx vitest run tests/brand-lock.test.ts` → teste **FALHOU** com mensagem clara ("FOUND-03 violation … Forbidden matches: app\page.tsx: bg-accent-50"). Revertei `page.tsx` → teste **PASSOU**. Defesa é REAL, não promessa.

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Typecheck strict (todo projeto) | `npx tsc --noEmit` | OK 0 errors |
| Unit tests (Plan 03) | `npx vitest run tests/lib/analytics.test.ts tests/hooks/use-device-tier.test.tsx tests/brand-lock.test.ts` | OK 14/14 passed |
| Unit tests (suite completa) | `npx vitest run` | OK 17/17 passed em 2.06s |
| Brand-lock GREEN (sem shades proibidas) | `npx vitest run tests/brand-lock.test.ts` | OK 1 test |
| Brand-lock RED (com bg-accent-50 injetado) | manual: edit page.tsx, run vitest | OK detectou; revertido |
| Fan-out uniqueness | `grep -rEn "window\.(fbq\|gtag\|clarity)" src/` | OK apenas `src\lib\analytics.ts` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] `src/app/globals.css` continha literal `bg-accent-50/100/.../900` em comentário documentando o que NÃO usar — causou falso positivo no brand-lock test**
- Found during: Task 3 (primeira execução do brand-lock test)
- Issue: Plan 01-01 deixou um comentário pedagógico em `globals.css` listando exemplos de shades proibidas (`bg-accent-50/100/.../900`). O texto desse comentário fazia match no regex do próprio test. Test falhou em `app\globals.css: bg-accent-50` antes mesmo do negative test.
- Fix: Reescrevi o comentário em `globals.css` substituindo o padrão literal por uma descrição equivalente sem o padrão proibido ("utilities accent-shade (escala 50..900)"). Intent docs preservado, defesa funciona.
- Files modified: `src/app/globals.css` (1 comment block ~5 linhas)
- Commit: `d2b55f5` (incluído no commit do brand-lock test pra manter coesão lógica)

### Non-deviations (intentional plan-following)

- Implementação Node-puro escolhida (vs execSync grep) — plan oferecia ambas; orchestrator directive #2 mandou cross-platform → Node-puro vence.
- Test agregado único (1 test cobrindo 81 patterns) em vez de 9 tests separados — plan oferecia ambas; agregado é mais rápido (1 walk do fs) e mensagem de erro mostra TODOS matches de uma vez (melhor DX). Acceptance criteria flexível: "9 tests OU 1 agregado".

## Authentication Gates

Nenhum. Esta plan é 100% código local + tests.

## Threat Flags

Nenhuma surface nova além das já mapeadas no plan:
- T-01-09 (window.fbq direct calls) — **mitigated** via grep verification (`grep window.(fbq|gtag|clarity) src/` retorna APENAS `src/lib/analytics.ts`).
- T-01-11 (Brand drift via bg-accent-50) — **mitigated** via `tests/brand-lock.test.ts` com negative test confirmado.
- T-01-13 (crypto.randomUUID unavailable) — **mitigated** via fallback Date.now+Math.random documentado.
- T-01-10, T-01-12 — **accepted** conforme plan (event_id não-sensitive; NEXT_PUBLIC_* públicas by design).

## Requirements Covered

- **TRACK-01** (single fan-out point) — `src/lib/analytics.ts` é o único módulo que toca `window.fbq/gtag/clarity`. Grep confirmado.
- **TRACK-02** (event_id desde dia 1) — UUID v4 via `crypto.randomUUID()` em todo `track()` call, MESMO id em GA4 (payload.event_id) e Pixel (options.eventID) e Clarity (set 'last_event_id') — dedup CAPI ready.
- **FOUND-03** (brand-lock Layer 2) — `tests/brand-lock.test.ts` + negative test confirmado. Layer 1 (tokens absentes em `@theme`) já estava em Plan 01-01. Layer 3 (docs/BRAND.md) é do Plan 01-04.
- **FOUND-06** (device tier hook) — `src/hooks/use-device-tier.ts` exporta `useDeviceTier()` com 4 tiers + resize reativo + reduced motion sempre vence.

## Known Stubs

Nenhum. Todos os módulos são funcionais sem dependências externas pendentes:
- `analytics.ts` opera com optional chaining — funciona em produção mesmo sem `.env.local` (no-op silencioso).
- `useDeviceTier` opera independentemente.
- `env.ts` exporta `undefined` para vars ausentes; consumers (Plan 04 providers) tratam graceful.

## Notes for Downstream

- **Plan 01-02 (WhatsApp lib)**: refactor opcional — importar `env.NEXT_PUBLIC_WA_NUMBER` de `@/lib/env` em vez de ler `process.env.NEXT_PUBLIC_WA_NUMBER` direto. Mantém single source of truth. **Não bloqueia** — Plan 01-02 funciona standalone.
- **Plan 01-04 (providers + AnalyticsProvider)**:
  - `AnalyticsProvider` deve chamar `track('section_view')` ou similar em route changes (pageview).
  - Scripts vendor (Meta Pixel script, GA4 via `@next/third-parties`, Clarity init) devem hidratar ANTES de qualquer `track()` ser chamado pela UI — `next/script strategy="afterInteractive"` resolve isso.
  - `LenisProvider` pode opcionalmente consumir `useDeviceTier()` pra tunar `lerp`/`duration` por device (mobile menos suave que desktop, reduced motion → desabilita Lenis).
- **Phase 2+ (motion primitives)**: `FadeUp`, `Stagger`, `Parallax` todos devem `const tier = useDeviceTier()` e usar `tier` pra escolher duration/distance/easing. `tier === "reduced"` deve retornar children sem animação.
- **Phase 3+ (sections / CTAs / form)**: todo evento de tracking via `track('event', {...})`. JAMAIS `window.fbq(...)` direto. Code review enforce.
- **Brand-lock test** roda como qualquer outro test em `npm run test` — se PR introduzir `bg-accent-50` etc, CI quebra com mensagem clara apontando o arquivo. Combined com docs/BRAND.md (Plan 04) e tokens absentes (Plan 01) = 3-layer defense.

## Self-Check: PASSED

- FOUND: `src/lib/env.ts` (commit d34d261)
- FOUND: `src/lib/analytics.ts` (commit d34d261)
- FOUND: `tests/lib/analytics.test.ts` (commit d34d261)
- FOUND: `src/hooks/use-device-tier.ts` (commit 1f6c595)
- FOUND: `tests/hooks/use-device-tier.test.tsx` (commit 1f6c595)
- FOUND: `tests/brand-lock.test.ts` (commit d2b55f5)
- FOUND: `src/app/globals.css` modified (commit d2b55f5)
- FOUND commit `d34d261` in `git log --oneline`
- FOUND commit `1f6c595` in `git log --oneline`
- FOUND commit `d2b55f5` in `git log --oneline`
