---
phase: 02-motion-primitives
verified: 2026-05-16T23:00:00Z
status: human_needed
score: 7/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Toggle prefers-reduced-motion no OS (macOS Reduce Motion ON ou Windows Animations OFF) e abrir /dev/reveal, /dev/textsplit, /dev/parallax e /dev/sticky no navegador"
    expected: "RevealOnView: snap para estado final sem motion wrapper. TextSplit: texto plano sem spans animados. ParallaxLayer: translateY=0 fixo. StickyStage: estrutura sticky preservada (D-09), sem animações internas."
    why_human: "Não é possível verificar programaticamente o comportamento de prefers-reduced-motion sem executar o browser com essa preferência ativa. A cobertura pendente declarada no README e no SUMMARY confirma que esse teste ainda não foi feito em device real."
  - test: "Abrir /dev/sticky num device Android real (mid-tier, Chrome) e rolar pela página inteira"
    expected: "Stage A pina exatamente 200svh, depois libera. Stage B pina 500svh, depois libera. Sem release prematuro, sem jump horizontal, sem scroll bouncing despinando."
    why_human: "RISCO CRÍTICO #3 validado apenas em iPhone 15 iOS 26 Safari + Windows 11 Chrome desktop (per README Validated Devices). Android real declarado como pendente explicitamente no README com trigger: validar antes de Phase 3 começar a usar StickyStage em seção real."
  - test: "Abrir /dev/all ou /dev/sticky em macOS Safari e em Firefox/Edge desktop"
    expected: "Mesmos critérios de pin que no Chrome desktop. StickyStage sem quirks de sticky CSS entre browsers."
    why_human: "macOS Safari e Firefox/Edge declarados como pendentes no README. Não testados antes do fechamento da Phase 2."
  - test: "DevTools Performance recording em /dev/all com scroll completo — modo mobile emulado (4x CPU throttle)"
    expected: "Apenas Composite Layers mutations no rastro de scroll. Zero Layout reflow disparado por animação. FPS >= 50 sustentado."
    why_human: "MOTION-08 verifica a propriedade no código (transform/opacity only) mas não confirma que o browser está de fato compondo na GPU sem reflows — isso exige inspeção visual do Performance trace."
---

# Phase 2: Motion Primitives — Verification Report

**Phase Goal:** Congelar a API das 5 primitivas de motion (especialmente `<ScrollScene>` como boundary GSAP-future-ready) antes de qualquer seção narrativa começar — eliminando ripple-refactor.
**Verified:** 2026-05-16T23:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria do ROADMAP)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | As 5 primitivas (`<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>`, `<ScrollScene>`) funcionam em `/dev` com retângulos placeholder; cada primitiva tem demo isolada navegável. | ✓ VERIFIED | 6 sub-rotas existem e têm implementação substantiva: `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all`. Todas importam do barrel `@/components/motion`. Gate `assertDevAccess` aplicado via server layout ou page direta. |
| 2 | `<StickyStage>` validado em iOS Safari real (não emulador), Android Chrome real e desktop Safari/Chrome/Firefox sem release prematuro ou jump horizontal (risco crítico #3 mitigado). | ? PARTIAL | iPhone 15 iOS 26 Safari ✓ e Windows 11 Chrome ✓ registrados na tabela "Validated Devices" do README. Android real, macOS Safari e Firefox/Edge declarados pendentes explicitamente no README — trigger: "validar antes de Phase 3 usar StickyStage em seção real". |
| 3 | `<ScrollScene>` expõe `MotionValue<number>` 0→1; consumidores nunca importam Motion direto; API documentada em `components/motion/README.md` e congelada (mudanças exigem aprovação explícita). | ✓ VERIFIED | `scroll-scene.tsx` contém render prop tipado `(progress: MotionValue<number>) => ReactNode`, usa `useScrollProgressInRange` internamente, header `@frozen` + `motion-api-change`. README.md com 264 linhas documenta todas as 5 primitivas, política de freeze, exceção controlada de `useTransform` dentro de render prop, e barrel como único import path. |
| 4 | Toggle `prefers-reduced-motion` no OS faz todas as primitivas pularem para estado final imediatamente (verificado manualmente em macOS Reduce Motion e Windows Animations off). | ? HUMAN | Código verificado: RevealOnView retorna `<Tag>{children}</Tag>` puro quando `isReduced`; ParallaxLayer retorna `<div>` estático quando `effectiveMagnitude === 0`; TextSplit retorna `createElement(as, ..., text)` puro; StickyStage não anima (layout estático CSS); ScrollScene emite progress e MotionConfigProvider global (`reducedMotion="user"`) intercepta consumers de `motion.*`. Mas validação manual em OS real não foi executada — declarada pendente no README. |
| 5 | Audit DevTools confirma: zero animações usam `width`/`height`/`top`/`left`; só `transform` e `opacity`. | ✓ VERIFIED (code) | Grep negativo nas 5 primitivas confirma ausência de propriedades proibidas em contexto de animação. `height: length` no StickyStage é layout estático numa `<div>` simples (não animado), explicitamente documentado no README. `PARALLAX_RANGE_PX` traduz em `y` (translateY shorthand). Só `transform` e `opacity` animados. Confirmação de GPU trace via DevTools requer execução humana — veja seção Human Verification. |

**Score:** 4/5 success criteria do ROADMAP plenamente verificados; 1 parcial (SC#2 — Android/macOS/Firefox pendentes); 1 precisa validação humana (SC#4 — reduced-motion OS real; SC#5 — GPU trace).

Para fins de pontuação dos must-haves dos PLANs: **7/8 truths verificadas**.

### Deferred Items

Nenhum item identificado para fases posteriores no milestone.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/motion/index.ts` | Barrel `@frozen` exportando as 5 primitivas | ✓ VERIFIED | 10 exports (5 components + 5 types). Header `@frozen` + política `motion-api-change`. `EXCEÇÃO controlada` documentada inline. |
| `src/components/motion/internal/easing.ts` | `MOTION_EASING` e `REVEAL_DURATION_MS` exportados | ✓ VERIFIED | `[0.16, 1, 0.3, 1] as const` + `500ms`. Header `@frozen`. |
| `src/components/motion/internal/use-scroll-progress-in-range.ts` | Helper compartilhado consumido por ScrollScene/ParallaxLayer | ✓ VERIFIED | `"use client"`, wrappa `useScroll` com default `["start end", "end start"]`. Não exportado pelo barrel. |
| `src/components/motion/internal/use-line-grouping.ts` | Agrupa words em lines via offsetTop + resize debounce | ✓ VERIFIED | `DEBOUNCE_MS = 150`, `data-word` selector, cleanup correto no effect. |
| `src/components/motion/reveal-on-view.tsx` | `<RevealOnView>` MOTION-01 — fade+slide adaptativo | ✓ VERIFIED | 4 paths de tier, `useReducedMotion` + `tier === "reduced"`, TIER_CONFIG com `{distance: 12/16/24, durationMs: 400/500/600}`, `@frozen`, `motion-api-change`. |
| `src/components/motion/parallax-layer.tsx` | `<ParallaxLayer>` MOTION-02 — translateY mobile=0 | ✓ VERIFIED | `TIER_MULTIPLIER: {mobile: 0, tablet: 0.5, desktop: 1.0}`, reduced=0, `useScrollProgressInRange`, `@frozen`. |
| `src/components/motion/scroll-scene.tsx` | `<ScrollScene>` MOTION-05 — render prop GSAP-future-ready | ✓ VERIFIED | Render prop `(progress: MotionValue<number>) => ReactNode`, prop `offset`, `as`, `"use client"`, D-01..D-04 documentados nos comments, `@frozen`. |
| `src/components/motion/text-split.tsx` | `<TextSplit>` MOTION-04 — word desktop / line mobile | ✓ VERIFIED | `WORD_STAGGER_MS=25`, `LINE_STAGGER_MS=80`, `useLineGrouping`, `data-word`, `aria-label` no wrapper, `aria-hidden` nos spans, reduced=plain text. |
| `src/components/motion/sticky-stage.tsx` | `<StickyStage>` MOTION-03 — CSS sticky + svh, zero Lenis | ✓ VERIFIED | Template literal type `${number}svh`, `sticky top-0 h-svh w-full overflow-hidden`, zero referência a Lenis, zero `dvh`/`vh`/`h-screen`, `@frozen`. |
| `src/components/motion/README.md` | Documentação congelada >= 120 linhas, D-17 completo | ✓ VERIFIED | 264 linhas. Cobre as 5 primitivas com props, defaults por tier, reduced motion, demos, política de freeze, exceção controlada, internals, MOTION-08 guarantee, Validated Devices (parcialmente preenchida). |
| `src/app/dev/_components/dev-gate.tsx` | `assertDevAccess` — gate D-15 reutilizável, server-only | ✓ VERIFIED | `import "server-only"`, lógica VERCEL_ENV correta, exporta `assertDevAccess`. |
| `src/app/dev/_components/placeholder-block.tsx` | `PlaceholderBlock` — retângulo premium reutilizável | ✓ VERIFIED | 4 sizes × 3 tones, sem accent, `cn()`. |
| `src/app/dev/reveal/page.tsx` | Showcase RevealOnView | ✓ VERIFIED | `assertDevAccess()`, importa via barrel, 3 demos (single, stagger, repeat). |
| `src/app/dev/parallax/page.tsx` | Showcase ParallaxLayer | ✓ VERIFIED | `assertDevAccess()`, importa via barrel, demos single + layered. |
| `src/app/dev/sticky/page.tsx` | Showcase StickyStage — alvo real-device | ✓ VERIFIED | Composição `ScrollScene + StickyStage` com payoff visual contínuo (4 facets cross-fade). Versão v3 pós-feedback Lenny. Checklist real-device visível na tela. Zero Lenis, zero dvh. |
| `src/app/dev/textsplit/page.tsx` | Showcase TextSplit | ✓ VERIFIED | `assertDevAccess()`, importa via barrel, textos de headline e parágrafo. |
| `src/app/dev/scene/page.tsx` + `layout.tsx` | Showcase ScrollScene (client page + server layout) | ✓ VERIFIED | Layout server aplica `assertDevAccess()`. Page client usa `useTransform` direto (exceção controlada documentada). |
| `src/app/dev/all/page.tsx` + `layout.tsx` | Showcase combinado das 5 primitivas | ✓ VERIFIED | Layout server aplica `assertDevAccess()`. Page client combina RevealOnView, ParallaxLayer, ScrollScene, TextSplit, StickyStage. `StickyFacets` com reduced-motion path. |
| `src/app/dev/page.tsx` | Nav raiz linkando 6 sub-rotas | ✓ VERIFIED | Grid com 6 cards linkando `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all`. Gate D-15 VERCEL_ENV no topo. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `reveal-on-view.tsx` | `@/hooks/use-device-tier` | `useDeviceTier()` | ✓ WIRED | Importa e consome; TIER_CONFIG indexado por tier retornado. |
| `reveal-on-view.tsx` | `motion/react` | `motion, useReducedMotion` | ✓ WIRED | `motion[as]` como MotionTag; `useReducedMotion()` determina reduced path. |
| `parallax-layer.tsx` | `./internal/use-scroll-progress-in-range` | `useScrollProgressInRange` | ✓ WIRED | `progress = useScrollProgressInRange(ref)` → `y = useTransform(progress, ...)`. |
| `scroll-scene.tsx` | `./internal/use-scroll-progress-in-range` | `useScrollProgressInRange` + `offset` prop | ✓ WIRED | `progress = useScrollProgressInRange(ref, offset)` → passado ao `children(progress)`. |
| `text-split.tsx` | `@/hooks/use-device-tier` | `useDeviceTier()` | ✓ WIRED | Determina `splitByLine` e índice de stagger. |
| `text-split.tsx` | `./internal/use-line-grouping` | `useLineGrouping(containerRef, enabled)` | ✓ WIRED | `lineMap` indexado por wordIndex para stagger por linha. |
| `sticky-stage.tsx` | CSS `position: sticky` nativo | `sticky top-0` Tailwind class | ✓ WIRED | Sem Lenis, sem engine JS. Template literal type `${number}svh` bloqueia outros units. |
| `src/components/motion/index.ts` | `./reveal-on-view`, `./parallax-layer`, `./scroll-scene`, `./text-split`, `./sticky-stage` | named re-exports | ✓ WIRED | 10 exports (5 + 5 types). Barrel é o único import path documentado. |
| `/dev/reveal,parallax,textsplit` (pages) | `@/components/motion` (barrel) | `import { Primitive } from "@/components/motion"` | ✓ WIRED | Nenhuma das pages server importa de `motion/react` diretamente. |
| `/dev/scene`, `/dev/all` | `motion/react` (useTransform) | Exceção controlada dentro de render prop | ✓ WIRED (intencional) | Exceção documentada no barrel, no README e nos JSDoc de cada page. `// eslint-disable react-hooks/rules-of-hooks` presente com justificativa. |

### Data-Flow Trace (Level 4)

Não aplicável — biblioteca de motion primitivas sem data fetching, sem state de servidor, sem API calls. Todos os dados são props estáticas ou derivados de MotionValues (valores reativos a scroll). Nenhum componente renderiza dados dinâmicos vindos de API.

### Behavioral Spot-Checks

Step 7b: SKIPPED para as primitivas em si (não são entry points CLI nem APIs com output verificável sem browser). A validação programática real é o `npm run build` (confirmado verde no SUMMARY com next build produzindo 13 rotas estáticas, bundle `/dev/sticky` 3.68 kB, `/dev/all` 1.97 kB).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| MOTION-01 | 02-02-reveal-parallax-PLAN.md | `<RevealOnView>` fade+slide adaptativo por `useDeviceTier()`, reduced=sem motion | ✓ SATISFIED | `reveal-on-view.tsx` implementa TIER_CONFIG completo, paths reduced/mobile/tablet/desktop. |
| MOTION-02 | 02-02-reveal-parallax-PLAN.md | `<ParallaxLayer>` profundidade configurável, mobile=0, reduced=0 | ✓ SATISFIED | `parallax-layer.tsx` com `TIER_MULTIPLIER: {mobile: 0, tablet: 0.5, desktop: 1.0}`. |
| MOTION-03 | 02-04-stickystage-PLAN.md | `<StickyStage>` via position:sticky, validado iOS Safari real + Android + desktop | ✓ PARTIAL | CSS sticky + svh implementado. iOS Safari real validado (iPhone 15). Android + macOS Safari + Firefox/Edge pendentes (declarados no README). |
| MOTION-04 | 02-03-scrollscene-textsplit-PLAN.md | `<TextSplit>` reveal por palavra (desktop) ou linha (mobile/tablet), sem dep externa | ✓ SATISFIED | `text-split.tsx` com `WORD_STAGGER_MS=25`, `LINE_STAGGER_MS=80`, `useLineGrouping` interno. |
| MOTION-05 | 02-03-scrollscene-textsplit-PLAN.md | `<ScrollScene>` expõe `MotionValue<number>` 0→1; consumidores não importam Motion direto | ✓ SATISFIED | Render prop tipado; barrel é o único import path; exceção controlada documentada. |
| MOTION-06 | 02-01-foundation-PLAN.md, 02-06-readme-freeze-PLAN.md | API congelada + documentada em README | ✓ SATISFIED | README.md com 264 linhas, `@frozen` em 6 arquivos, `motion-api-change` em 7 locais. |
| MOTION-07 | 02-02-reveal-parallax-PLAN.md, 02-03, 02-04 | Todas as primitivas respeitam `prefers-reduced-motion` retornando estado final imediatamente | ✓ CODE-VERIFIED | RevealOnView e TextSplit retornam plain HTML sem motion. ParallaxLayer retorna `<div>` estático. StickyStage é CSS layout (não anima). MotionConfigProvider global intercepta consumers de `motion.*`. Validação em device real com OS reduced-motion pendente — necessita verificação humana. |
| MOTION-08 | 02-02-reveal-parallax-PLAN.md, 02-03, 02-04 | Apenas `transform` e `opacity` — zero propriedades que disparam layout | ✓ SATISFIED | Grep negativo confirmado: nenhuma das 5 primitivas usa `width:`, `height:` (em contexto animado), `top:` animado, `left:` animado. `height: length` no StickyStage é layout estático numa `<div>` simples. |

**Orphaned requirements:** Nenhum. Todos os 8 MOTION-* estão cobertos pelos 6 plans da Phase 2.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `src/app/dev/all/page.tsx` (linhas 103, 109) | `// eslint-disable-next-line react-hooks/rules-of-hooks` dentro de render prop de ScrollScene | ℹ️ Info | Intencional e documentado — `useTransform` dentro de render prop é a exceção controlada D-02/MOTION-05. O eslint-disable está correto; é o trade-off aceito pelo projeto. Não é um stub nem um bloqueador. |
| `src/components/motion/text-split.tsx` (linha 92-93) | FOUC mínimo no primeiro frame (pré-medição do lineMap) documentado como trade-off aceito | ℹ️ Info | Documentado nos comments: "Aceitamos esse FOUC mínimo: 1 frame antes da primeira measurement." Não é um bug, é um trade-off consciente com justificativa registrada. |

Nenhum anti-padrão bloqueador encontrado. Nenhum stub, nenhum `return null` sem justificativa, nenhuma implementação vazia.

### Human Verification Required

#### 1. prefers-reduced-motion — validação em device real com OS setting

**Test:** Ativar "Reduce Motion" no macOS (System Settings → Accessibility → Display → Reduce Motion) OU desativar animações no Windows (Settings → Accessibility → Visual effects → Animation effects OFF). Recarregar cada sub-rota:
- `/dev/reveal` — RevealOnView deve renderizar `children` diretamente sem `motion.div`, sem fade, sem translateY
- `/dev/textsplit` — TextSplit deve renderizar o texto plano (sem `<motion.span>` individuais)
- `/dev/parallax` — ParallaxLayer deve renderizar `<div>` estático (zero translateY)
- `/dev/sticky` — StickyStage deve preservar o pin CSS (estrutura), animações internas pausadas via MotionConfigProvider

**Expected:** Estado final imediato em todas as primitivas. Nenhuma transição, nenhum delay, nenhum movimento.

**Why human:** Não é possível simular `prefers-reduced-motion` programaticamente sem browser. A cobertura é declarada pendente no README.

#### 2. StickyStage — validação em Android real (mid-tier, Chrome)

**Test:** Abrir `[vercel-preview]/dev/sticky` num device Android mid-tier (Pixel 6 ou equivalente) no Chrome. Rolar devagar e depois rápido pela página completa. Verificar Stage A (200svh) e Stage B (500svh com facets).

**Expected:** Pin segura durante toda a extensão de `length`. Sem release prematuro. Sem jump horizontal. Sem scroll bouncing despinando o sticky.

**Why human:** Risco Crítico #3 — apenas iPhone 15 + Windows Chrome foram validados. Android é o segundo maior segmento de tráfego e pode ter quirks diferentes de sticky CSS com smooth-scroll library.

#### 3. StickyStage — macOS Safari e Firefox/Edge desktop

**Test:** Abrir `/dev/sticky` e `/dev/all` em macOS Safari e em Firefox (ou Edge) desktop. Rolar pela página completa.

**Expected:** Mesmos critérios de pin que no Chrome desktop. StickyStage sem quirks de sticky CSS entre browsers.

**Why human:** Declarado pendente no README. macOS Safari especialmente relevante por ser o browser com mais quirks de sticky CSS historicamente.

#### 4. MOTION-08 — DevTools Performance recording em /dev/all

**Test:** Abrir `/dev/all` em Chrome DevTools com emulação mobile (4x CPU throttle). Iniciar Performance recording e rolar a página completa. Analisar o trace.

**Expected:** Apenas "Composite Layers" mutations visíveis no rastro de scroll. Zero "Layout" ou "Paint" disparados por animações (animações de Motion devem rodar 100% no compositor thread). FPS >= 50 sustentado durante o scroll.

**Why human:** Verificação de código confirma as propriedades corretas (transform/opacity), mas o DevTools trace é a única forma de confirmar que o browser está de fato compondo na GPU sem reflows inesperados.

### Gaps Summary

Não há gaps bloqueadores do goal da fase. A meta "congelar a API das 5 primitivas de motion como boundary GSAP-future-ready antes de qualquer seção narrativa começar" foi atingida:

- As 5 primitivas existem, são substantivas e estão wired no barrel
- A API está congelada (@frozen + motion-api-change em todos os arquivos)
- O README documenta o contrato completo
- O showcase /dev funciona com as 6 sub-rotas
- A validação real-device parcial (iPhone 15 iOS 26 + Windows Chrome) passou para o risco crítico #3

Os itens de verificação humana pendentes são declarações explícitas de cobertura incompleta (prefers-reduced-motion em OS real, Android, macOS Safari, Firefox/Edge, GPU trace) — reconhecidas pelo próprio time no README com triggers de quando fechar. Eles não bloqueiam a entrega do goal da Phase 2, mas são prerequisitos para o lançamento público (Phase 7 QA) e para a entrada em produção de seções que usem StickyStage (Phase 3+).

---

_Verified: 2026-05-16T23:00:00Z_
_Verifier: Claude (gsd-verifier)_
