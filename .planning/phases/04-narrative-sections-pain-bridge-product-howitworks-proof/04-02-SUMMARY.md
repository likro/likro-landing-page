---
phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
plan: 02
subsystem: ui

tags: [react, nextjs, tailwind, rsc, intersection-observer, vitest, accessibility, narrative-sections, css-animations, editorial-statement]

requires:
  - phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
    plan: 00
    provides: "useInView hook (motion-free IO + reduced-motion-aware), Bridge scaffold em surface-light já wireado em page.tsx, coherence test cross-section, hero-headline-reveal CSS keyframe reuso"
  - phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
    plan: 01
    provides: "Pain seção dark com vinheta inferior fade-to-light (#fafaf9 ~95% opacity) — encosta no bg-surface-light da Bridge sem gap cromático (D-15 baked into Pain source)"

provides:
  - "BRIDGE_COPY (provisional v1) + BRIDGE_COPY_VARIANTS {v1, v2, v3} satisfies Record<BridgeCopy> — 3 variantes editoriais contrastantes"
  - "Bridge section completa LIGHT minimalista: bg-surface-light + max-w-3xl centered + py-24/32/40 (muito ar) + 1 client island"
  - "BridgeStatement ('use client') — único elemento animado da seção, statement É o h2 real (id='bridge-headline'), clip-path mask reveal via hero-headline-reveal stagger 200ms entre frases"
  - "tests/sections/bridge-invariants.test.ts — 7 grep gates (motion.*, motion lib imports, vh, priority, hardcoded PT-BR, h2#bridge-headline structural + sr-only fix, walk sanity)"
  - "tests/content/bridge.test.ts — 6 contract tests (shape statements 1-3, variants v1/v2/v3, COPY-02+D-14 extra anti-IA regex, D-27 no Dolce Home, no WhatsApp inline, length 20-200)"

affects: [04-03-product]

tech-stack:
  added: []
  patterns:
    - "Editorial silent statement pattern: RSC orchestrator + 1 client island wrapping useInView + reused Phase 3 keyframe (zero novos keyframes, zero motion lib)"
    - "Statement-as-h2 pattern: editorial copy IS the section heading (id='section-headline'); zero synthetic sr-only h2 boilerplate (B4 fix permanente via test gate)"
    - "Statement triad reveal: <span> wrappers dentro de <h2>, separados por <br />, animation-delay incremental por índice — clip-path mask reveal staggered"
    - "D-14 extra anti-IA gate em copy module: regex secundária além das banned phrases padrão (potencialize, transforme sua, próximo nível, solução inovadora, revolucione, empodere, leve a outro patamar)"

key-files:
  created:
    - "src/content/bridge.ts (51 LOC — BRIDGE_COPY_VARIANTS {v1, v2, v3} + type + provisional BRIDGE_COPY)"
    - "src/sections/Bridge/BridgeStatement.tsx ('use client', 41 LOC — único client island, useInView + clip-path reveal stagger)"
    - "tests/sections/bridge-invariants.test.ts (7 grep gates, ~220 LOC)"
    - "tests/content/bridge.test.ts (6 contract tests, ~95 LOC)"
  modified:
    - "src/sections/Bridge/index.tsx (overwrite do scaffold do 04-00 — orchestrator real, surface-light, max-w-3xl centered, py editorial)"

key-decisions:
  - "Statement editorial É o h2 real da seção (id='bridge-headline'), NÃO há h2 sr-only sintético. Heading SEO contém copy real, não boilerplate. B4 fix permanente via test #6 do bridge-invariants."
  - "Tríade de statements (v1, v2) concatenados dentro do MESMO <h2> separados por <br /> — semanticamente um único heading, visualmente 2-3 linhas. Cada frase em <span> wrapper com animation-delay incremental."
  - "Reveal via hero-headline-reveal (clip-path mask reveal Phase 3) ao invés de hero-card-rise — Bridge é statement editorial, merece o efeito cinematográfico de máscara da esquerda (mesmo do hero H1), não fade-up de card."
  - "BRIDGE_COPY aponta provisoriamente para BRIDGE_COPY_VARIANTS.v1 (recusa silenciosa em tríade — referência D-15 Lenny verbatim). Auto-aprovado pelo executor sob auto-advance; Lenny pode trocar para v2/v3 via PR comment antes do merge final."
  - "Bridge usa Container override max-w-3xl text-center (vs default max-w-7xl) — composição minimalista editorial estilo Linear/Stripe. Mobile px-6 → sm:px-8."
  - "py-24 sm:py-32 lg:py-40 (mobile 24 → desktop 40) — muito ar vertical proposital, reforça o silêncio editorial pós-Pain dark."
  - "Threshold 0.4 no useInView da BridgeStatement (vs 0.3 da PainCardConstellation, 0.5 do PainStatement) — meio-termo: dispara quando a seção está bem visível, mas não tão tarde que pareça atrasada."

patterns-established:
  - "Statement-only narrative section pattern Phase 4: RSC orchestrator + 1 client island, único elemento animado, ZERO mockup/cards/CTA — replicável onde a seção precisa de silêncio editorial puro (transição entre dor e produto, ou bridge entre arcos narrativos)"
  - "B4 fix permanente: editorial statement IS the heading; gate via test #6 do invariants impede regressão (índice de qualquer agent que tente adicionar sr-only boilerplate)"
  - "D-14 extra regex (potencialize | transforme sua | próximo nível | solução inovadora | revolucione | empodere | leve a outro patamar) reutilizável em qualquer copy module Phase 4 — copiar D14_EXTRA constant para bridge/product/proof se aparecerem buzzwords promessa milagrosa"

requirements-completed: [NARR-02, NARR-06, NARR-07, COPY-02]

duration: ~15min
completed: 2026-05-18
---

# Phase 4 Plan 02: Bridge Section Summary

**Seção Bridge entregue completa — primeira LIGHT da landing, statement editorial silencioso puro (1-2 linhas centradas), clip-path mask reveal Phase 3 reuso, transição cromática Pain DARK → Bridge LIGHT funcional, zero mockup/cards/CTA, tudo verde nos gates.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 (Task 1 TDD RED, Task 2 GREEN, Task 3 checkpoint auto-aprovado)
- **Commits:** 2 atomic
  1. `46d6653` — test(04-02): failing tests for Bridge invariants + BRIDGE_COPY contracts
  2. `db480de` — feat(04-02): Bridge section — statement editorial light + 3 copy variants

## Variante Final Aprovada

**v1 — Recusa silenciosa em tríade (referência D-15 Lenny verbatim)**

```
"Existe um jeito de operar isso sem rodar 4 apps abertos."
"Sem perder lead. Sem mandar a equipe procurar onde está a conversa."
```

- **Razão (auto-approval sob `workflow.auto_advance`):** v1 é a frase exata do Lenny no `<specifics>` do 04-CONTEXT.md ("exemplo de frase no estilo desejado" — D-15). Direção que pareou semanticamente com a vinheta cromática da Pain (recusa do estado fragmentado) e com o tom "luxury tech editorial" D-00 (Linear/Stripe — recusa silenciosa, não promessa milagrosa).
- **Lenny pode trocar:** editar `BRIDGE_COPY = BRIDGE_COPY_VARIANTS.v2` (afirmação operacional em tríade) ou `.v3` (single-line editorial) em `src/content/bridge.ts` antes do merge final. As 3 variantes ficam no source até o merge — depois, a aprovada fica fixada e as outras voltam pro git history (mesma cadência D-17 do Phase 3 + Plan 04-01).

## Statement Structure

**Estrutura semântica de v1 e v2 (tríade): UM único `<h2>` contendo todos os statements concatenados por `<br />`.** v3 (single-line) tem o mesmo `<h2>` com um único `<span>`.

```tsx
<h2 id="bridge-headline" ...>
  <span class="hero-headline-reveal" style="animation-delay: 0ms">
    Existe um jeito de operar isso sem rodar 4 apps abertos.
  </span>
  <br />
  <span class="hero-headline-reveal" style="animation-delay: 200ms">
    Sem perder lead. Sem mandar a equipe procurar onde está a conversa.
  </span>
</h2>
```

**Tradeoff considerado:** poderia ser 2 `<h2>` (cada frase isolada) OU `<h2>` + `<p>` (primeira frase headline, segunda sub). Escolhido **UM** `<h2>` porque:

1. Editorial: a tríade É um único pensamento, visualmente em 2-3 linhas mas semanticamente uma sentença composta.
2. SEO: 1 h2 forte por seção (não 2-3 h2 fragmentados que diluem o keyword density).
3. a11y: `aria-labelledby="bridge-headline"` aponta para 1 heading — múltiplos h2 confundiriam screen readers sobre qual É o título da seção.
4. CSS: stagger via `animation-delay` em filhos `<span>` funciona idêntico em 1 `<h2>` ou 2 `<h2>`, então 1 é mais simples sem perder nada.

## Reveal Mechanics

| Elemento | Trigger | Delay | Animation | Keyframe |
|----------|---------|-------|-----------|----------|
| Span 1 (statement[0]) | useInView threshold 0.4 | 0ms | `hero-headline-reveal` | Phase 3 reuso |
| Span 2 (statement[1]) | (mesmo trigger) | 200ms | `hero-headline-reveal` | (mesmo) |
| Span 3 (statement[2]) — só v2 | (mesmo trigger) | 400ms | `hero-headline-reveal` | (mesmo) |

Total para v1 (2 frases): ~1000ms da entrada do statement até completar. Cinematográfico mas contido — não compete com Hero pela atenção.

**Keyframe reusado:** `hero-headline-reveal` (lines 123-136 do `globals.css`) faz `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` + `opacity 0 → 1` em `0.8s var(--ease-premium-out) both`. Efeito: **máscara da esquerda revelando o texto**, mesmo do Hero H1.

**Por que `hero-headline-reveal` e não `hero-card-rise`:** Bridge é statement editorial premium, merece o efeito cinematográfico de máscara (Linear/Stripe headline reveal) ao invés do fade-up sutil de card. Coerência narrativa: Pain teve cards (rise), Bridge tem statement (reveal de máscara).

`prefers-reduced-motion: reduce` é tratado em 3 camadas (idêntico Plan 04-01):
1. `useInView` curto-circuita (retorna `[ref, true]` imediato)
2. `globals.css` zera animation-duration globalmente
3. Sem reduced-motion, o stagger usa o keyframe existente — zero novo CSS

## Transição Cromática Pain → Bridge (D-15)

**A vinheta inferior da Pain** (PainBackground L3 termina em `rgba(250,250,249,0.95)`, Plan 04-01) **alinha exatamente com `bg-surface-light` da Bridge** (que é `--color-surface-light` = `#fafaf9`). Resultado: dark da Pain dissolve cromaticamente direto na Bridge — sem corte abrupto de cor, sem barra divisória, sem hard transition.

**A própria transição cromática É o efeito cinematográfico (D-15 reinterpretação NARR-02).** Bridge não precisa de mockup expandindo: o respiro visual entre dark→light + statement editorial em silêncio É o "alívio narrativo".

## Threat Mitigation

| Threat | Status | Evidence |
|--------|--------|----------|
| T-4-07 (BRIDGE_COPY com cliente real ou stat fabricada) | Mitigado | tests/content/bridge.test.ts Test 4 (zero "Dolce Home") + Test 5 (zero "WhatsApp" inline, Bridge é abstração) |
| T-4-08 (Future contributor adds mockup re-introducing NARR-02 original) | Mitigado | tests/sections/bridge-invariants.test.ts Test 4 (zero `<Image priority>`) + Test 5 (zero PT-BR hardcoded JSX) + Test 6 (estrutural — h2 É o statement, sem boilerplate sr-only) |

## Acceptance Criteria Status

| Plan acceptance | Status |
|-----------------|--------|
| `src/content/bridge.ts` exists, BRIDGE_COPY_VARIANTS exported (grep >= 2) | OK (2) |
| v1, v2, v3 variants present | OK |
| `Existe um jeito de operar isso sem rodar 4 apps abertos` em v1 verbatim | OK |
| Zero "transforme sua/potencialize/próximo nível" no source (grep == 0) | OK (0 após cleanup docstring) |
| Zero "Dolce Home" | OK |
| `"use client"` em BridgeStatement | OK |
| `useInView` em BridgeStatement | OK |
| `hero-headline-reveal` em BridgeStatement | OK |
| `<h2 id="bridge-headline"` em BridgeStatement | OK |
| `BRIDGE_COPY.statements` em BridgeStatement | OK |
| Zero "sr-only" h2 em Bridge/index.tsx (B4 fix) | OK |
| Zero motion lib imports em src/sections/Bridge/ | OK |
| `bg-surface-light` em Bridge/index.tsx | OK |
| Zero `WhatsAppCta` em Bridge/ (D-29) | OK |
| `max-w-3xl` em Bridge/index.tsx | OK |
| `npx vitest run tests/sections/bridge-invariants.test.ts tests/content/bridge.test.ts` exit 0 | OK (13/13 pass) |
| `npx tsc --noEmit` exit 0 | OK |
| `npx next build` exit 0 | OK (Route `/` = 10.6 kB, First Load 120 kB) |

## Test Suite (Full)

```
Test Files  18 passed (18)
Tests       102 passed (102)
```

Sem regressões: hero, brand-lock, analytics, smooth-scroll, whatsapp-cta, layout-providers, dev-routes, coherence, pain, bridge — tudo verde.

## Deviations from Plan

- **[Rule 2 — Missing critical info] Cleanup de docstring em `src/content/bridge.ts`:** A versão inicial do docstring listava verbatim "transforme sua", "potencialize", "próximo nível" no comentário "COPY-02 + D-14: zero ...". Isso fazia o grep de acceptance criteria `grep -cE "transforme sua|potencialize|próximo nível" src/content/bridge.ts returns 0` falhar com 1 match no comentário. **Fix:** reescrever a linha para apontar aos test gates sem listar os literais (lines 19-20 final). Os testes (`tests/content/bridge.test.ts` Test 3) continuam sendo o gate canônico — eles verificam o conteúdo runtime de `BRIDGE_COPY_VARIANTS`, não o source file. Pain (Plan 04-01) tem o mesmo padrão de docstring mas seu plan não incluía esse grep específico, então não tinha conflito.

- **`describe.skipIf` no `tests/content/bridge.test.ts`:** Plan especificou `it.skipIf(!fs.existsSync(...))` mas Vite static analysis de `await import("@/content/bridge")` raise em build-time mesmo dentro de `it.skipIf` (mesmo problema documentado em Plan 04-01 SUMMARY). **Fix:** mover skipIf pro `describe`, idêntico padrão Pain. Plan já previa: "skips while Bridge copy not yet present, OR errors with 'Cannot find module' — both acceptable in same commit". Escolhi a robust path: describe.skipIf.

- **Auto-aprovação Task 3 (checkpoint:human-verify)** sob `autonomous_mode: workflow.auto_advance=true`. Variante v1 fica como ativa por default (referência D-15 Lenny). Lenny pode reverter para v2/v3 via edit em `src/content/bridge.ts` antes do merge final. Playwright MCP smoke (CLAUDE.md user pipeline) NÃO foi rodado neste worker — Playwright MCP não está acessível ao executor de plan; gate manual fica anotado para o orchestrator/Lenny rodar localmente antes do merge.

## Known Stubs

Nenhum stub. Toda a copy real (3 variantes editoriais). `BridgeStatement` consome `BRIDGE_COPY.statements` real. `useInView` é o hook real do Plan 04-00. Zero placeholder, zero "coming soon", zero dado vazio.

## Issues Encountered

- **Worktree base check:** o worktree foi spawneado a partir de `d461990` (main pré Plan 04-00). O prompt orientou `git reset --hard 1286445`. Reset executado limpo — Plan 04-01 (Pain) + scaffolds + useInView todos presentes no working tree antes da Task 1.

- **Vite static analysis em tests:** já documentado em Plan 04-01 SUMMARY, replicado aqui com mesma solução (describe.skipIf).

- **Docstring banned-phrase collision:** documentado em Deviations acima.

- **Pre-existente: warning React act()** em `tests/components/ui/whatsapp-cta.test.tsx` ao rodar full suite — origem fora do escopo, NÃO causado pela Bridge. Não bloqueia (test passa).

## User Setup Required

Nenhum. Plan 04-02 é puramente client-side + tests + copy. Zero dependências externas, zero env vars novas.

## Playwright Screenshots da Transição Cromática

**NÃO foi rodado neste worker** — Playwright MCP não está acessível ao executor headless de plan. Gate manual fica anotado para o orchestrator/Lenny rodar localmente antes do merge:

1. `npm run dev`
2. Abrir `http://localhost:3000`, scrollar Hero → Pain → **transição cromática** para Bridge
3. Verificar que a vinheta inferior do Pain (fim do dark, ~95% opacity light) encosta no `bg-surface-light` da Bridge sem corte abrupto
4. Verificar que cada statement do Bridge entra com clip-path mask reveal (200ms stagger entre frases na variante v1)
5. Ativar `prefers-reduced-motion: reduce` no DevTools → statements entram em estado final sem animation
6. Screenshot desktop + mobile da transição Pain→Bridge anexado ao PR description

## D-15 Reinterpretation Confirmation

**NARR-02 ROADMAP original** (dashboard mockup surgindo com blur via ScrollScene) **REINTERPRETADO E ENVIADO** em produção:

- Zero ScrollScene component
- Zero mockup dashboard
- Zero blur expandindo
- A própria transição cromática Pain DARK (vinheta light no rodapé) → Bridge LIGHT (`bg-surface-light` puro) É o efeito cinematográfico
- Statement editorial puro carrega o peso narrativo, sem ruído visual

D-15 baked into source: Pain's PainBackground L3 termina exatamente em `rgba(250,250,249,0.95)` que é o `--color-surface-light` (`#fafaf9`) da Bridge. Zero gap cromático.

## Next Plan Readiness

**Plan 04-03 (Product) pode começar imediatamente:**
- Bridge section completa, light, com max-w-3xl centered + py editorial — Product entra em `bg-surface-light` igual (continua a sub-sequência light D-05)
- Statement do Bridge ("Existe um jeito de operar isso sem rodar 4 apps abertos. Sem perder lead. Sem mandar a equipe procurar onde está a conversa.") é o setup perfeito pra Product mostrar **qual é esse jeito** — feature hero "Atendimento multicanal" responde literalmente
- `useInView` + `hero-headline-reveal` patterns prontos para reuso
- Coherence test do Plan 04-00 ainda verde — qualquer regressão no page.tsx é capturada

## Self-Check: PASSED

Verified:
- File `src/content/bridge.ts` exists (BRIDGE_COPY_VARIANTS + BRIDGE_COPY exports both present)
- File `src/sections/Bridge/BridgeStatement.tsx` exists (`"use client"`, useInView, hero-headline-reveal, `<h2 id="bridge-headline"`, BRIDGE_COPY.statements all present)
- File `src/sections/Bridge/index.tsx` overwritten (bg-surface-light, max-w-3xl, no sr-only h2, no h2 inline since statement is now inside BridgeStatement)
- File `tests/sections/bridge-invariants.test.ts` exists (7 it blocks)
- File `tests/content/bridge.test.ts` exists (6 it blocks)
- Commit `46d6653` (RED tests) found in `git log --oneline`
- Commit `db480de` (GREEN impl) found in `git log --oneline`
- `npx vitest run tests/sections/bridge-invariants.test.ts tests/content/bridge.test.ts tests/landing/coherence.test.ts` → 18 passed
- `npx vitest run` (full suite) → 102 passed across 18 files
- `npx tsc --noEmit` exits 0
- `npx next build` succeeds (Route `/` 10.6 kB, First Load JS 120 kB)

---
*Phase: 04-narrative-sections-pain-bridge-product-howitworks-proof*
*Plan: 02*
*Completed: 2026-05-18*
