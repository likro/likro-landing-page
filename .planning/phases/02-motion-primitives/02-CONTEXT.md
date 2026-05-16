# Phase 2: Motion Primitives - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega a **biblioteca isolada de 5 primitivas de motion** que congelará a API antes de qualquer seção narrativa começar. No fim dela, `src/components/motion/` contém:

- `<RevealOnView>` — fade + slide stagger on viewport entry, adaptativo por `useDeviceTier()`
- `<ParallaxLayer>` — translateY sutil baseado em scroll progress, off em mobile/reduced
- `<StickyStage>` — pin estrutural via `position: sticky` nativo, duração explícita via prop `length` em `svh`
- `<TextSplit>` — reveal por palavra (desktop) ou linha (mobile/tablet), spans manuais sem lib externa
- `<ScrollScene>` — boundary GSAP-future-ready expondo `MotionValue<number>` 0→1 via render prop

A API é congelada após esta fase (MOTION-06): barrel `index.ts` único, tipos rígidos, cabeçalho `@frozen` em cada arquivo, README.md em `components/motion/` documentando contrato e exemplos.

Validação acontece em rota `/dev` com sub-rotas isoladas por primitiva (`/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`) + uma rota combinada `/dev/all`. Real-device validation via Vercel preview URLs (iPhone iOS Safari + Android Chrome). Ajuste pequeno no gate do `/dev` para liberar previews mantendo bloqueio em produção real.

**Não está nesta fase:** mockups reais, copy de seção, seções narrativas, formulário, instrumentação além do que Phase 1 já entregou. As placeholders no `/dev` são retângulos coloridos. Primeiras consumidoras reais das primitivas começam na Phase 3 (Hero) e Phase 4 (Pain → Bridge → Product → HowItWorks → Proof).

</domain>

<decisions>
## Implementation Decisions

### `<ScrollScene>` — boundary GSAP-future-ready (API mais crítica da fase)

- **D-01:** Consumo via **render prop apenas** — `<ScrollScene>{(progress) => <motion.div style={{ opacity: progress }} />}</ScrollScene>`. Explicit, sem context overhead, sem magic. Caller vê o `MotionValue<number>` chegando como argumento. Quando uma seção migrar para GSAP futuramente, troca-se o interior do ScrollScene sem mexer no caller.
- **D-02:** Shape do progress: **`MotionValue<number>` 0→1 plain**, sem objeto wrapper com sub-ranges. Caller deriva sub-ranges via `useTransform(progress, [0, 0.3, 0.7, 1], [...])`. Casa 1:1 com Framer Motion `useScroll`. Portável pra `timeline.progress()` do GSAP depois.
- **D-03:** Range de scroll configurável via **prop `offset` opcional com default sensato**. Sintaxe casa com Framer Motion `useScroll` `offset: ['start end', 'end start']`. Default cobre 90% dos casos (começa quando topo da scene toca bottom do viewport, termina quando bottom da scene sai por cima). Override pra Bridge / Product / StickyStage interno quando precisar de ajuste fino.
- **D-04:** `<ScrollScene>` é **`'use client'` obrigatório**; pai pode ser Server Component. App Router-friendly — `page.tsx` permanece RSC, ScrollScene encapsula o boundary client.

### `<StickyStage>` — pin estrutural (RISCO CRÍTICO MOTION-03: iOS Safari)

- **D-05:** Pinning via **`position: sticky` puro do CSS** + Lenis 1.x colaborando (`syncTouch: false` já está no provider, Phase 1). Lenis 1.3+ é transform-based e funciona com sticky nativamente em iOS quando syncTouch está desligado. Comportamento nativo de browser, performant, SEO-friendly, sem engine JS de pinning prematura.
- **D-06:** Duração do pin via **prop explícita `length` em viewport units** (ex: `length="200svh"`). Caller declara: "fica pinado por 2 viewports". Previsível, legível, casa direto com altura do container externo do sticky. Bridge ≈ `length="150svh"`, Product (4 pilares) ≈ `length="400svh"`. Sem auto-medição (instável com children animando ou imagens carregando tarde).
- **D-07:** **`svh` sempre, `dvh` banido** no contexto StickyStage. Estabiliza o pin contra a address bar do iOS — usuário nunca vê o stage esticar quando barra recolhe. Aceita-se a pequena perda de espaço vertical em troca de estabilidade absoluta. Hero já usa svh/dvh por Phase 1 D-04 — StickyStage fica mais conservador (svh only).
- **D-08:** **Zero acoplamento explícito com Lenis** — sem `useLenis` interno, sem `data-lenis-prevent`. Sticky CSS + provider já configurado é suficiente. Adicionar coordenação Lenis empiricamente se surgir caso real durante validação real-device, nunca por default.
- **D-09:** **Reduced motion no StickyStage:** mantém sticky CSS (estrutura) + zera animações internas. ScrollScene aninhado retorna `progress=1` fixo (estado final imediato); ParallaxLayer interno = 0 translateY; TextSplit interno = instant. O layout pinado permanece coerente, mas o conteúdo não anima. Casa com MOTION-07 (estado final imediato em reduced) sem quebrar a leitura da página (alternativa de desligar sticky deixava espaços vazios estranhos).

### Matriz device-tier × primitiva (params adaptativos)

- **D-10:** **`<RevealOnView>` adaptativo por tier**, defaults sólidos sem overrides por seção:
  - Mobile: `distance ≈ 12px`, `duration ≈ 400ms`, `stagger ≈ 60ms`
  - Tablet: `distance ≈ 16px`, `duration ≈ 500ms`, `stagger ≈ 70ms`
  - Desktop: `distance ≈ 24px`, `duration ≈ 600ms`, `stagger ≈ 80ms`
  - Reduced: snap to final state, sem opacity transition (MOTION-07)
  - Os valores são pontos de partida; ajuste fino acontece em validação real-device, mas a estrutura ("mobile mais curto/sutil, desktop mais cinematográfico") é contrato.
- **D-11:** **`<ParallaxLayer>` magnitudes por tier:**
  - Mobile: 0 (off — REQ MOTION-02 obriga)
  - Tablet: ~0.1 (leve)
  - Desktop: ~0.2 (médio)
  - Reduced: 0
  - Parallax é sutileza, não espetáculo — risco de feel "AI SaaS template" se exagerar. Magnitudes pequenas, quase imperceptíveis conscientemente.
- **D-12:** **`<TextSplit>` granularidade por tier + spans manuais:**
  - Desktop: split por palavra, stagger ~25ms
  - Mobile/tablet: split por linha (REQ MOTION-04 obriga line no mobile/tablet), stagger ~80ms
  - Reduced: instant (texto final imediato)
  - Implementação: client-side split por palavra sempre, depois `getBoundingClientRect()` para agrupar em linhas no mobile/tablet. Sem dep externa (sem splitting.js, sem lib). ~30 linhas de código.

### Showcase /dev + validação real-device + freeze

- **D-13:** **Sub-rotas isoladas por primitiva + rota combinada:**
  - `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene` — uma página por primitiva com placeholder rectangles, cobrindo os 4 tiers (mobile/tablet/desktop/reduced inferido por OS).
  - `/dev/all` — todas as primitivas combinadas num scroll só para sentir o conjunto e testar interações (sticky + scrub + parallax co-existindo).
  - `/dev` (raiz) ganha nav simples linkando cada sub-rota.
  - Isola debug (uma primitiva travando o scroll não derruba o teste das outras) + valida interação real.
- **D-14:** **Real-device validation via Vercel preview URLs.** Cada PR da Phase 2 gera um preview `.vercel.app`. Lenny abre o link no iPhone/Android — zero setup, sem rede local, sem ngrok. Previews ficam noindex (FOUND-11 já cuida). Ngrok/tunnels só em casos de debug específico, não como default.
- **D-15:** **Ajuste no gate do `/dev`** — `src/app/dev/page.tsx` hoje usa `process.env.NODE_ENV === 'production'` (FOUND-12), o que dá 404 em previews `.vercel.app`. Troca pra `process.env.VERCEL_ENV === 'production'` (com fallback pro check anterior em local). Resultado: `/dev` acessível em localhost + previews, bloqueado em `likro.com.br` (produção real). Sem basic auth, sem token na query — fricção zero pro Lenny.
- **D-16:** **Enforcement de "API congelada" (MOTION-06) em três camadas:**
  1. `src/components/motion/index.ts` é o barrel único — re-exporta apenas o público (5 primitivas + tipos). Imports de paths internos não são permitidos por convenção.
  2. Tipos exportados (props de cada primitiva) viram o contrato. Mudanças nos tipos = mudança de API.
  3. Cabeçalho `@frozen` no topo de cada arquivo de primitiva + regra curta no README: "mudanças exigem PR com label `motion-api-change` e aprovação explícita do Lenny".
  4. Sem ESLint custom rule (alinhado com Phase 1 D-15 — overhead sem retorno comprovado em time pequeno).
- **D-17:** **README.md em `components/motion/`** documentando:
  - Tabela das 5 primitivas com props, defaults por tier, exemplo mínimo de uso, comportamento em reduced motion.
  - Regra "consumidores nunca importam `motion` direto" (REQ MOTION-05).
  - Política de freeze + processo pra propor mudança.
  - Lista de devices validados na fase (iPhone modelo X iOS Y, Android modelo X Chrome Y, desktop Safari/Chrome/Firefox).

### Claude's Discretion

Áreas onde o planner/executor tem flexibilidade dentro das decisões acima:

- Easing curves exatos por primitiva (sugestão: `cubic-bezier(0.16, 1, 0.3, 1)` ou similar Linear-Stripe feel) — Claude escolhe um conjunto coerente.
- Implementação interna do `useTransform` chains no ScrollScene (composto vs single MotionValue).
- Threshold do `whileInView` do RevealOnView (sugestão: amount=0.15 a 0.3 — Claude calibra empiricamente).
- Estrutura interna de pastas dentro de `components/motion/` (um arquivo por primitiva vs sub-pastas com `index.tsx` + helpers) — desde que o barrel `index.ts` expose o contrato.
- Componentes auxiliares internos não exportados (helpers como `splitIntoLines`, `useScrollProgressInRange`) — ficam em `components/motion/internal/` ou similar; não saem pelo barrel.
- Naming dos props secundários (ex: `as` vs `tag` no RevealOnView para escolher elemento DOM).
- Estratégia exata de measurement do TextSplit em mobile (debounce em resize, recalc em rotate) — Claude escolhe abordagem performant.
- Cor / estilo dos placeholder rectangles no `/dev` — desde que cada primitiva tenha demo visualmente clara dos 4 tiers + comportamento em reduced.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing Phase 2.**

### Visão e constraints do projeto
- `.planning/PROJECT.md` — Vision, core value, key decisions, brand book regras críticas (roxo, tipografia, motion sutileza)
- `.planning/REQUIREMENTS.md` §"Motion Primitives (MOTION)" — 8 requisitos MOTION-01..08 mapeados pra Phase 2
- `.planning/ROADMAP.md` §"Phase 2: Motion Primitives" — Goal, success criteria, dependência de Phase 1

### Context da Phase anterior (decisões que constrangem Phase 2)
- `.planning/phases/01-foundations-design-system/01-CONTEXT.md` — Decisões D-01..D-21 da Phase 1, especialmente provider tree, `useDeviceTier`, tokens, paths
- `.planning/phases/01-foundations-design-system/01-VERIFICATION.md` — Confirma o que Phase 1 entregou de fato

### Research do projeto (read antes de planejar)
- `.planning/research/SUMMARY.md` — Síntese executiva: stack, top 6 pitfalls
- `.planning/research/STACK.md` — Motion v12 import path (`motion/react`), Lenis 1.3.x package, animation orchestration pattern (single RAF), GSAP-future contract
- `.planning/research/ARCHITECTURE.md` — Folder layout, provider nesting, motion choreography, GSAP-future contract, primitives responsibilities
- `.planning/research/PITFALLS.md` — Pitfalls relevantes pra Phase 2: #3 (Lenis + sticky iOS), #19 (motion property choice — só transform/opacity), #20 (reduced motion não respeitado)

### Código existente que Phase 2 consome / referencia
- `src/components/providers/smooth-scroll-provider.tsx` — Lenis 1.x com `syncTouch: false`, skip em reduced
- `src/components/providers/motion-config-provider.tsx` — `<MotionConfig reducedMotion="user">`
- `src/hooks/use-device-tier.ts` — Hook `useDeviceTier()` com breakpoints 639/1023, reactive a resize
- `src/app/dev/page.tsx` — Rota de showcase (precisa ajuste de gate em D-15)
- `src/lib/utils.ts` — Helper `cn()` para composição de classes
- `src/app/globals.css` — `@theme` Tailwind v4 com tokens já declarados (surfaces, accent, text, border)

### Brand & motion philosophy
- `CLAUDE.md` (raiz do projeto) — Constraints de motion sutileza, brand book ("Animações exageradas, infantis, com excesso de movimento ou poluição visual — fere o posicionamento premium")
- Phase 1 D-05 (em `01-CONTEXT.md`) — "Quatro extremos visuais a evitar simultaneamente" — motion contribui pra equilíbrio editorial

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`SmoothScrollProvider`** (`src/components/providers/smooth-scroll-provider.tsx`) — Lenis singleton já configurado (`syncTouch: false`, skip reduced). StickyStage assume que está rodando dentro deste provider; não precisa reconfigurar Lenis.
- **`MotionConfigProvider`** (`src/components/providers/motion-config-provider.tsx`) — `<MotionConfig reducedMotion="user">` global. Primitivas se beneficiam disso: `useReducedMotion()` retorna true quando OS está em reduced.
- **`useDeviceTier()`** (`src/hooks/use-device-tier.ts`) — Hook que retorna `'reduced' | 'mobile' | 'tablet' | 'desktop'`. É a fonte da matriz de D-10/D-11/D-12. Reactive a resize, SSR-safe (default desktop até hidratar).
- **`cn()` helper** (`src/lib/utils.ts`) — Para combinar classes Tailwind dentro das primitivas se preciso.
- **`/dev` route** (`src/app/dev/page.tsx`) — Página base server-side com Container + Headline. Seção "Motion Primitives (Phase 2)" já tem placeholder esperando ser populada. Sub-rotas (`/dev/reveal`, etc) viram subdirectories aqui.

### Established Patterns

- **Provider tree em `app/layout.tsx`** (`AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children`) — Phase 2 não mexe nessa ordem.
- **Import do Motion via `motion/react`** (não `framer-motion`) — Phase 1 já adotou. Phase 2 continua. Consumidores das primitivas não importam `motion/react` diretamente — apenas as primitivas importam.
- **Path alias `@/*`** apontando pra `src/` — usar em todos os imports (Phase 1 D-19).
- **Server Components por padrão; `'use client'` apenas onde necessário** — Phase 1 D-20. Primitivas serão client components (precisam de hooks e refs).
- **Co-locação por feature** (Phase 1 D-20) — primitivas em `components/motion/` ficam juntas; arquivos auxiliares co-locados.
- **Atoms UI customizados** (`components/ui/`) — não usar atoms aqui (primitivas são layer separado), mas mesmo padrão de organização.

### Integration Points

- **`/dev` precisa ajuste de gate (D-15):** Trocar `process.env.NODE_ENV === 'production'` por `process.env.VERCEL_ENV === 'production'` para liberar previews `.vercel.app`. Fallback pra `NODE_ENV` em local fica ok. Ajuste pequeno, mas é um requisito pra real-device validation funcionar.
- **`components/motion/` é diretório novo** — Phase 1 não criou nada dentro. Fica em `src/components/motion/` com barrel `index.ts`, README.md, e um arquivo `.tsx` por primitiva (ou sub-pasta se Claude preferir co-locação).
- **Primeiras consumidoras (Phase 3 Hero e Phase 4 seções):** dependem do contrato congelado aqui. Mudanças no contrato após Phase 2 são custosas — Phase 4 tem 5 seções consumindo simultaneamente.
- **Brand tokens (Phase 1 D-13/D-14):** primitivas não usam roxo. Placeholders no `/dev` usam `surface.dark`/`surface.light` + um neutro pra contraste, não `accent.*`.

</code_context>

<specifics>
## Specific Ideas

- **`<ScrollScene>` como o boundary do projeto.** Toda a arquitetura "GSAP-future-ready" do PROJECT.md depende de esta primitiva ter contrato estável. Render prop puro + `MotionValue<number>` 0→1 é o que torna a futura troca trivial: o caller continua o mesmo, o interior muda.
- **Sticky CSS nativo > engine JS.** Decisão consciente de priorizar comportamento nativo do browser pra estabilidade, SEO e manutenção simples. Lenis 1.3+ casa bem com sticky quando `syncTouch: false`.
- **Parallax sutil, quase imperceptível.** Brand book pede premium editorial — parallax exagerado dá feel "AI SaaS template". Magnitudes (0.1 tablet / 0.2 desktop) são pontos de partida intencionalmente conservadores.
- **Mobile = experiência premium real, não consolation prize.** 80% do tráfego é Meta Ads no mobile. Reveal mais curto, parallax off, TextSplit por linha — tudo configurado pra fluidez mobile sem perder sensação premium.
- **Reduced motion preserva estrutura, não só remove motion.** StickyStage continua pinando porque é layout, não motion. Decision crítica pra acessibilidade não quebrar a narrativa visual.
- **Validação real-device é não-negociável.** Phase 2 não fecha sem Lenny abrir `/dev/*` no iPhone real e Android real e confirmar comportamento. Vercel preview é o caminho de menor fricção pra isso acontecer todo PR.
- **API freeze não é "documento", é "contrato técnico".** Três camadas (barrel + tipos + `@frozen` + README) tornam impossível bypass acidental. Sem ESLint custom — disciplina + revisão de PR.

</specifics>

<deferred>
## Deferred Ideas

- **Easing curves customizadas por primitiva** — Phase 2 usa um conjunto coerente escolhido pelo Claude (provavelmente uma cubic-bezier Linear-Stripe-like). Refinamento por primitiva pode acontecer em Phase 4 se uma seção pedir feel específico.
- **FPS counter / motion performance HUD no `/dev`** — útil pra debug em mobile, mas não bloqueia entrega. Pode entrar em Phase 7 (Hardening) se aparecer regressão de perf.
- **Hook `useSceneProgress()` como escape hatch** (alternativa a render prop) — explicitamente descartado em D-01. Pode entrar como adição futura se Phase 4 mostrar prop drilling crônico (mas freeze restringe — exigiria PR `motion-api-change`).
- **`<StickyStage>` em modo "steps discretos"** (props `steps + stepHeight`) — discutido e descartado em D-06. Se Phase 4 mostrar que Product precisa dessa semântica, criar wrapper `<StickyStack>` em cima do StickyStage, não modificar StickyStage.
- **Custom ESLint rule pra bloquear imports diretos de `components/motion/internal`** — discutido, descartado (Phase 1 D-15 já estabelece overhead sem ganho comprovado em time pequeno).
- **Basic auth ou token na query string pra proteger `/dev`** — descartado em D-15 (fricção pro Lenny). `VERCEL_ENV !== 'production'` é suficiente combinado com noindex.
- **GSAP/ScrollTrigger drop-in real** — explicitamente fora da v1 (PROJECT.md Out of Scope). Phase 2 prepara o boundary; introdução acontece em milestone futuro (V2-MOTION-01) quando uma seção justificar.
- **Suporte a `<ParallaxLayer>` com profundidade negativa (-0.1 = move contra o scroll)** — não pedido, sem caso de uso na v1. Pode entrar se Phase 4 pedir contraste de planos.

</deferred>

---

*Phase: 02-motion-primitives*
*Context gathered: 2026-05-16*
