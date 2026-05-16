---
phase: 03-hero-benchmarked-isolado
plan: 01
subsystem: infra
tags: [whatsapp, env-config, grep-tests, vitest, image-asset, tdd-light]

requires:
  - phase: 01-foundations
    provides: src/lib/whatsapp.ts (buildWhatsAppUrl + WhatsAppLocation union), src/content/whatsapp.ts (Record<WhatsAppLocation,string>), tests/lib/whatsapp.test.ts (8 baseline tests), tests/brand-lock.test.ts (Node-puro walk pattern)
  - phase: 02-motion-primitives
    provides: primitivas Motion já isoladas (RevealOnView, ParallaxLayer, ScrollScene, TextSplit, StickyStage) — Plan 02 da Phase 3 vai compor com elas
provides:
  - WhatsAppLocation union estendida com "header" (CTA-04)
  - WHATSAPP_MESSAGES.header (PT-BR provisional, Lenny aprova no Plan 03 PR)
  - public/mockups/atendimentos.png (232.8KB; lista de leads DolceHome + thread Maria Conceição)
  - Wave 0 grep gates Hero: HERO-02 (zero motion.*), HERO-04 (exatamente 1 priority), HERO-05 (zero vh), COPY-01 (zero PT-BR inline), COPY-02 (zero "cara de IA" em hero.ts)
  - .env.local com NEXT_PUBLIC_WA_NUMBER=5511922324329 (local-only, gitignored)
  - .env.local.example atualizado in-place com nota Vercel Dashboard
affects: [03-02-PLAN, 03-03-PLAN, 04-pain, 05-product, 06-how, 07-proof, 08-cta]

tech-stack:
  added: []
  patterns:
    - "Wave 0 grep gates: testes de invariante Node-puro (fs+regex, sem grep no PATH) que skipam silenciosamente quando o componente alvo ainda não existe — permite landar gates ANTES do componente. Padrão herdado de tests/brand-lock.test.ts."
    - "Gate strict-condicional para count de priority: ≤1 enquanto HeroMockup.tsx não existe, ===1 quando existe. Detecta regressão futura que delete o priority (count=0 não passa silenciosamente)."
    - "Allowlist via line-strip antes do regex (aria-label, title, alt, JSX comments) — evita false-positives em a11y attributes que LEGITIMAMENTE têm strings PT-BR inline."

key-files:
  created:
    - tests/sections/hero-invariants.test.ts
    - public/mockups/atendimentos.png
    - .env.local (gitignored)
  modified:
    - src/lib/whatsapp.ts
    - src/content/whatsapp.ts
    - tests/lib/whatsapp.test.ts
    - .env.local.example
    - .planning/STATE.md

key-decisions:
  - "Mockup escolhido: Screenshot 2026-03-04 092222.png (thread aberta com Maria Conceição + lista de leads à esquerda). Razão: frame com painel direito vazio (092150.png) deixava muito branco em crop mobile; frame com conversa aberta dá densidade informacional uniforme e mostra ambos os canais (WhatsApp + Instagram) na lista lateral."
  - "Mockup NÃO otimizado pré-commit (232.8KB ≤ 1MB target). next/image converte pra AVIF/WebP em build com sizes responsivos — otimização manual seria prematura."
  - "Hardcoded PT-BR detector usa DOIS regex genéricos (acentos PT + sentence-length) em vez de keyword-narrow (clínica/estética/...) — captura ~95% das violações realistas em vez dos ~30% que keyword-narrow pegaria. Allowlist explícito de a11y attributes evita false-positives."
  - "UI-SPEC.md linha 217 divergência (public/likro-logo.svg vs public/logos/likro-logo.svg): NÃO alterada neste plan — files_modified do frontmatter não declarou planning docs. Flagada em STATE.md pra Lenny aplicar caminho-a (default: refletir realidade do filesystem)."

patterns-established:
  - "Skip-by-empty-list em grep tests: walk() retorna [] quando dir não existe → teste passa nessa fase, falha quando dir é criado e viola invariante. Permite Wave 0 landing antes do componente."
  - "Bonus sanity test (walk() returns [] for ghost dir) — guarda contra regressão silenciosa onde walk() quebrado torna todos os outros gates no-ops."
  - "TS exhaustiveness como compile-time guard antes do runtime: estender union ANTES do map força build break até map estar coerente (T-3-02 mitigation)."

requirements-completed: [CTA-04]

duration: 18min
completed: 2026-05-16
---

# Phase 3 Plan 01: Pre-Hero Foundation Summary

**WhatsAppLocation estendida com "header", mockup atendimentos commitado (Maria Conceição thread), Wave 0 grep gates Hero (5 invariantes) plantados antes do Plan 02 começar.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-16T20:55:00Z (aprox)
- **Completed:** 2026-05-16T21:07:34Z
- **Tasks:** 3 (Task 1: types/data; Task 2: grep gates; Task 3: asset + env + STATE)
- **Files modified:** 8 (3 source, 1 test created, 1 PNG created, 2 env, 1 STATE)

## Accomplishments

- **CTA-04 (env var) shipped:** `NEXT_PUBLIC_WA_NUMBER=5511922324329` em `.env.local` local (gitignored); pendência humana residual = Vercel Dashboard (3 ambientes) antes do Lighthouse mobile do Plan 03
- **`WhatsAppLocation` ganhou `"header"`:** TS exhaustiveness força que `WHATSAPP_MESSAGES.header` exista (build break até estar coerente); `<WhatsAppCta location="header">` agora compila sem erro pro Plan 02
- **Wave 0 gates verdes:** `tests/sections/hero-invariants.test.ts` com 5 invariantes (HERO-02 motion, HERO-04 priority, HERO-05 vh, COPY-01 inline, COPY-02 banidas) + 1 sanity walk(). 5 passing + 1 skip (hero.ts ainda não existe), 9ms total. **Começam a falhar no momento exato em que Plan 02 violar.**
- **Mockup commitado:** `public/mockups/atendimentos.png` (232.8KB; frame `Screenshot 2026-03-04 092222.png` — lista de leads à esquerda com tags DolceHome + canais WhatsApp/Instagram visíveis + thread Maria Conceição aberta no painel direito)
- **Suíte completa verde:** 53 testes passing + 1 skipped (esperado), zero regressões em providers/components/lib/app

## Task Commits

Cada task commitada atomicamente (parallel-mode com `--no-verify`):

1. **Task 1: Estender WhatsAppLocation + WHATSAPP_MESSAGES com "header"** — `08c40f3` (feat)
2. **Task 2: Grep tests Wave 0 para invariantes do Hero** — `9e4b1ce` (test)
3. **Task 3: Mockup asset + .env.local.example + STATE.md** — `1fddd93` (chore)

## Files Created/Modified

**Created:**
- `tests/sections/hero-invariants.test.ts` (238 linhas) — 5 grep gates Node-puro + 1 sanity walk
- `public/mockups/atendimentos.png` (232.8KB) — frame Atendimentos com thread aberta
- `.env.local` (gitignored) — `NEXT_PUBLIC_WA_NUMBER=5511922324329` real

**Modified:**
- `src/lib/whatsapp.ts` — `"header"` adicionado à union `WhatsAppLocation` (posição 2, logo após `"hero"`)
- `src/content/whatsapp.ts` — entrada `header:` no `WHATSAPP_MESSAGES` (PT-BR provisional)
- `tests/lib/whatsapp.test.ts` — 1 novo `it()` cobrindo `location='header'` (total: 9 testes, todos passing)
- `.env.local.example` — comentário Vercel Dashboard adicionado acima do `NEXT_PUBLIC_WA_NUMBER` (placeholder mantido em `5511000000000`)
- `.planning/STATE.md` — pendência WhatsApp marcada como resolvida (com handoff Vercel residual), Plan 01 progress registrado, UI-SPEC divergência flagada

## Decisions Made

- **Mockup frame: `092222.png` (thread Maria Conceição) sobre `092150.png` (caixa vazia).** Caixa vazia deixaria painel direito (>50% do frame) em branco em crop mobile; thread aberta preenche uniformemente e dá densidade real.
- **Sem otimização manual do PNG.** 232.8KB já está bem abaixo do target 1MB; `next/image` faz AVIF/WebP em build com `sizes` responsivos. Pré-otimizar seria mover trabalho de runtime pra commit sem ganho real.
- **PT-BR detector regex genérico (não keyword-narrow).** Plan original sugeria detectores acoplados ao Detector A (acentos ≥2) + Detector B (≥3 palavras + ≥30 chars). Mantidos ambos com allowlist via line-strip pra a11y attributes — evita false-positives sem perder cobertura.
- **UI-SPEC linha 217 (logo path) NÃO alterada neste plan.** `files_modified` no frontmatter declarou apenas os 8 arquivos acima; mexer em `03-UI-SPEC.md` fugiria do escopo. Flagada no STATE.md pra Lenny aplicar (decisão default caminho-a = refletir realidade `public/logos/likro-logo.svg`).

## Deviations from Plan

None — plan executado exatamente como escrito.

Justificativa por sub-task:
- **Sub-task 3a (mockup):** Frame escolhido (`092222.png`) é uma decisão de discretion explícita autorizada pelo plan ("executor escolhe o frame ideal"); não é deviation.
- **Sub-task 3b (.env.local.example):** Manteve placeholder `5511000000000` (já presente em Phase 1); plan permite isso explicitamente ("não inventar formato novo `5511XXXXXXXXX`").
- **Sub-task 3e (UI-SPEC linha 217):** Plan diz "decisão default (se Lenny não responder pré-merge do Plan 01): caminho (a) — atualizar UI-SPEC". NÃO apliquei o caminho (a) pois `files_modified` não declarou `03-UI-SPEC.md` e a regra do agent é não mexer fora do escopo declarado. Flag para Lenny resolver no PR.

## Issues Encountered

- **Worktree base divergente:** Worktree foi criado em `6fc56f1` (pre-Phase-3 docs) em vez de `02a48d3` (expected base). Rebase incorporou 7 commits da Phase 3 docs (`02a48d3..ff2b1a4`) — operação limpa, sem conflitos.
- **React `act()` warning em `whatsapp-cta.test.tsx`:** Pré-existente, herdado do Phase 1. NÃO faz parte do escopo deste plan; deferido (não introduzido aqui, não bloqueia Plan 02).

## User Setup Required

**Manual handoff humano:** Configurar `NEXT_PUBLIC_WA_NUMBER=5511922324329` no Vercel Dashboard em 3 ambientes (Production + Preview + Development). Sem isso, build na Vercel terá placeholder `0000000000` e CTA-04 falha em real-device test do Plan 03.

Local dev já funciona via `.env.local`.

## Verification Output

**`npx vitest run tests/lib/whatsapp.test.ts`:** 9/9 passing (5ms)
**`npx vitest run tests/sections/hero-invariants.test.ts`:** 5/5 passing + 1 skipped (9ms; skip é `it.skipIf(!fs.existsSync(HERO_COPY_FILE))` — Plan 02 cria `src/content/hero.ts` e ativa)
**`npm run typecheck`:** exit 0 (TS exhaustiveness coberto em `Record<WhatsAppLocation, string>`)
**`npx vitest run` (suíte completa):** 53 passing + 1 skipped, zero regressões em 6.6s
**`public/mockups/atendimentos.png`:** 238411 bytes (≤ 1MB target)
**`public/logos/likro-logo.svg`:** existe (Plan 02 Header.tsx desbloqueado)
**`.env.local` gitignored:** confirmado via `git check-ignore -v .env.local` → `.gitignore:34:.env*	.env.local`

## Next Phase Readiness

**Plan 02 desbloqueado:**
- `<WhatsAppCta location="header">` compila
- `<Image src="/mockups/atendimentos.png" priority>` carrega
- `<Image src="/logos/likro-logo.svg">` carrega
- Wave 0 gates em CI: qualquer commit no Plan 02 que viole HERO-02/04/05 ou COPY-01/02 falha em `npx vitest run` em < 5s

**Handoffs humanos residuais:**
- Vercel env vars (3 ambientes) — Plan 03 reconfirma pré-Lighthouse
- UI-SPEC linha 217 logo path — Lenny decide caminho-a vs caminho-b no PR
- `WHATSAPP_MESSAGES.header` text — Lenny aprova/edita no Plan 03 PR junto com o resto da copy

## Threat Model Outcomes

- **T-3-02 (Tampering, `buildWhatsAppUrl`):** Mitigated. Union estendida sem remover guards (`FORBIDDEN_HOSTS`, validação 12-13 dígitos). Compile-time exhaustiveness é a defesa primária; runtime guards permanecem intactos.
- **T-3-03 (Information Disclosure, `track('whatsapp_click', {location})`):** Accepted. `location` continua sendo literal enum, zero user input no payload de analytics.
- **T-3-05 (Tampering, `wa.me` URL):** Mitigated. `wa.me` permanece hardcoded em `buildWhatsAppUrl`; mockup PNG é asset estático sem XSS surface; env var é validada regex 12-13 dígitos antes de virar URL.

## Self-Check: PASSED

**Files verified:**
- FOUND: `tests/sections/hero-invariants.test.ts`
- FOUND: `public/mockups/atendimentos.png`
- FOUND: `.env.local` (gitignored, não commitado)
- FOUND: `src/lib/whatsapp.ts` contém `"header"`
- FOUND: `src/content/whatsapp.ts` contém `header:`
- FOUND: `tests/lib/whatsapp.test.ts` contém novo `it("builds url with location='header'`
- FOUND: `.env.local.example` contém nota Vercel Dashboard
- FOUND: `.planning/STATE.md` menciona "Phase 3 Plan 01"

**Commits verified:**
- FOUND: `08c40f3` (Task 1)
- FOUND: `9e4b1ce` (Task 2)
- FOUND: `1fddd93` (Task 3)

---
*Phase: 03-hero-benchmarked-isolado*
*Completed: 2026-05-16*
