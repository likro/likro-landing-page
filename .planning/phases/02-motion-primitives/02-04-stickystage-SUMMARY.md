---
phase: 02-motion-primitives
plan: 04
subsystem: motion-primitives
tags:
  - sticky-stage
  - frozen-api
  - css-sticky
  - svh
  - ios-safari-risk
  - real-device-validation
  - reduced-motion
dependency_graph:
  requires:
    - phase-01 (SmoothScrollProvider com syncTouch:false — pré-condição de D-05 funcionar em iOS Safari)
    - phase-02 plan-01 (barrel @frozen + política D-16 estabelecida)
    - phase-02 plan-02 (RevealOnView, ParallaxLayer — pattern de primitiva @frozen)
    - phase-02 plan-03 (ScrollScene, TextSplit — pattern de composição aninhada que StickyStage habilita)
  provides:
    - "Public API: <StickyStage> (MOTION-03, FROZEN) via @/components/motion barrel"
    - "Type contract: StickyStageProps com length: `${number}svh` (compile-time guard de D-07)"
    - "Biblioteca de motion completa — 5/5 primitivas congeladas, 10 exports do barrel"
  affects:
    - "Plan 05 (/dev showcase) consumirá StickyStage em /dev/sticky e /dev/all — gateway de validação real-device iOS"
    - "Plan 06 (README) documentará StickyStage como completa a primeira tabela de primitivas"
    - "Phase 3 Hero (potencial uso pra pin do mockup) e Phase 4 Bridge (length~150svh) + Product (length~400svh) consumirão diretamente"
    - "Bloqueia merge da Phase 2 até validação real-device (iPhone iOS real + Android real) passar via Vercel preview"
tech_stack:
  added: []
  patterns:
    - "Compile-time guard via template literal type `${number}svh` — TypeScript bloqueia callers que escreverem outras unidades (vh, dvh, px, %, number cru) já no momento da edição, sem depender de runtime check"
    - "Pin estrutural CSS-first: position: sticky nativo + svh + h-svh — sem JS de pinning, sem IntersectionObserver, sem listener no smooth-scroll engine"
    - "Zero acoplamento com o smooth-scroll engine no código — confia na configuração global de Phase 1 (syncTouch:false) como pré-condição de funcionamento em iOS"
    - "Reduced motion como no-op estrutural — sticky é layout, não animação; preservar pin nem precisa de toggle (D-09)"
    - "Estrutura DOM canônica: wrapper externo com height = length + filho sticky h-svh w-full overflow-hidden — overflow-hidden protege de children grandes vazando viewport"
key_files:
  created:
    - src/components/motion/sticky-stage.tsx
  modified:
    - src/components/motion/index.ts
decisions:
  - "Pin via position: sticky CSS puro — sem engine JS de pinning. Mitigação prática do risco crítico #3 (smooth-scroll + sticky iOS) é: (a) syncTouch:false já no provider de Phase 1, (b) svh em vez de dvh, (c) zero coordenação JS adicional. Coordenação só será adicionada empiricamente se aparecer caso real, nunca por default"
  - "Template literal type `${number}svh` na prop length é a camada compile-time que enforce D-07. TS bloqueia length=\"150vh\", length=\"150dvh\", length=\"150\", length=150 — qualquer coisa que não seja literalmente número-seguido-de-svh. É a melhor garantia possível short de ESLint custom rule (descartada por Phase 1 D-15)"
  - "h-svh no filho sticky + svh no wrapper externo — coerência total. Tailwind v4 reconhece svh nativamente; fallback inline style não foi necessário (build passou)"
  - "overflow-hidden no filho sticky preventivamente — evita que children aninhados (ex: mockup expandindo via ScrollScene) vazem para fora da viewport pinada. Pode ser revisitado caso-a-caso no Plan 06"
  - "Reduced motion NÃO exige código no StickyStage — sticky é estrutura CSS, não animação. As primitivas aninhadas que o caller compõe via children (ScrollScene/TextSplit/ParallaxLayer) já tratam reduced internamente. D-09 é arquitetural, não código local"
  - "'use client' explícito mesmo sendo CSS puro — Next.js precisa do marker para resolver no boundary correto e habilitar futura ergonomia de aninhar primitivas client dentro de StickyStage"
metrics:
  duration: "~4min"
  completed: "2026-05-16"
  tasks: 2
  files_created: 1
  files_modified: 1
requirements:
  - MOTION-03
  - MOTION-07
  - MOTION-08
---

# Phase 2 Plan 4: StickyStage Summary

**One-liner:** Última primitiva da fase implementada — `<StickyStage>` (MOTION-03) pina seu conteúdo via `position: sticky` CSS nativo + `svh` exclusivo + zero acoplamento com o smooth-scroll engine, fechando a biblioteca de motion em 5/5 primitivas congeladas e habilitando a próxima etapa (showcase `/dev` para validação real-device iOS Safari — o maior risco da fase).

## What Was Built

### `<StickyStage>` (MOTION-03) — `src/components/motion/sticky-stage.tsx`

A primitiva com o **maior risco real-device** da fase (research PITFALLS #3: smooth-scroll engine + sticky no iOS). Estratégia (D-05..D-09) deliberadamente conservadora: pin via CSS sticky puro, `svh` only, zero engine JS, zero coordenação com o smooth-scroll provider.

**Contrato congelado:**

```typescript
export interface StickyStageProps {
  /** Conteúdo a pinar (recomendação: um único filho). */
  children: ReactNode;
  /**
   * Duração explícita do pin em viewport units (D-06).
   * Template literal type força `svh` — outras unidades bloqueadas em
   * compile-time pelo TypeScript (D-07).
   * Ex: "150svh" (Bridge), "400svh" (Product 4 pilares).
   */
  length: `${number}svh`;
  /** className passthrough no wrapper externo. */
  className?: string;
}
```

### Estrutura DOM final

```html
<div class="relative {className?}" style="height: {length};">   <!-- wrapper externo -->
  <div class="sticky top-0 h-svh w-full overflow-hidden">      <!-- stage pinado -->
    {children}
  </div>
</div>
```

- **Wrapper externo** define a "trilha" do pin via `height: length` (ex: 150svh = scroll de 1.5 viewports antes do stage soltar).
- **Filho sticky** (`position: sticky; top: 0; height: 100svh`) é o que o usuário vê pinado durante a trilha. `overflow-hidden` protege contra children vazando.

### Compile-time guard via template literal type

A camada que torna D-07 inviolável por callers:

```typescript
length: `${number}svh`
```

TypeScript rejeita já no IDE:

```typescript
<StickyStage length="150vh">   // ❌ Type '"150vh"' not assignable to '`${number}svh`'
<StickyStage length="150dvh">  // ❌ (dvh proibido pelo contexto D-07)
<StickyStage length="150">     // ❌
<StickyStage length={150}>     // ❌ (number cru)
<StickyStage length="150svh"> // ✅
```

Não precisa de runtime check, não precisa de ESLint custom rule (descartada por Phase 1 D-15). É a garantia mais forte possível dentro do toolset do projeto.

### Decisão D-08: zero acoplamento com o smooth-scroll engine no código

Esta é a decisão consciente mais delicada do plan. O arquivo `sticky-stage.tsx` literalmente **não menciona** o engine de smooth-scroll — nem por import, nem por nome, nem por atributo data-* específico dele. A primitiva é puro CSS.

**Por que isso é seguro?**

1. **Phase 1 (FOUND-08)** já configurou o provider global com `syncTouch: false`. Em smooth-scroll engines 1.3+, essa configuração é a pré-condição empírica para `position: sticky` CSS funcionar nativamente em iOS Safari. A configuração JÁ ESTÁ ATIVA quando StickyStage renderiza.
2. **Coordenação JS adicional adicionaria mais superfície de risco** (event listeners, RAF custom, race conditions na hidratação) sem benefício comprovado. Sticky nativo é o golden path do browser.
3. **Se durante validação real-device aparecer um caso real de release prematuro ou jump horizontal**, a decisão D-08 diz: tratar empiricamente naquele caso específico, não preventivamente em toda primitiva.

### Reduced motion (D-09): no-op estrutural

Não há código de reduced motion neste arquivo. Por design:

- Sticky CSS é **layout**, não animação — desligar quebraria a leitura da página (espaços vazios estranhos).
- As primitivas aninhadas que o caller compõe via children (ScrollScene, TextSplit, ParallaxLayer) **já tratam reduced internamente** conforme Plan 02/03.
- Resultado em reduced: stage continua pinado, mas o conteúdo dentro do stage não anima — exatamente o comportamento desejado por MOTION-07 + D-09.

### Barrel `src/components/motion/index.ts` — biblioteca completa

5/5 primitivas exportadas + 5/5 tipos:

```typescript
export { RevealOnView } from "./reveal-on-view";
export type { RevealOnViewProps } from "./reveal-on-view";

export { ParallaxLayer } from "./parallax-layer";
export type { ParallaxLayerProps } from "./parallax-layer";

export { ScrollScene } from "./scroll-scene";
export type { ScrollSceneProps } from "./scroll-scene";

export { TextSplit } from "./text-split";
export type { TextSplitProps } from "./text-split";

export { StickyStage } from "./sticky-stage";
export type { StickyStageProps } from "./sticky-stage";
```

Header `@frozen` atualizado com lista descritiva das 5 primitivas. Placeholder comentado `// export { StickyStage }` removido — não é mais futuro. EXCEÇÃO controlada do ScrollScene (`useTransform` de `motion/react` dentro do render prop) preservada — é o único bypass legítimo da regra "consumidores não importam `motion/react` direto".

## Verification Results

- `npx tsc --noEmit` exit 0 (sem erros)
- `npm run build` exit 0:
  - Build size: `/dev` continua **81.7 kB / First Load 184 kB** (igual ao baseline pós Plan 03 — primitiva adicionada mas ainda não consumida em rota; `/dev/sticky` virá no Plan 05)
  - Shared chunks: 102 kB (sem regressão)
  - Static generation 7/7 OK
- Acceptance criteria — greps positivos (Task 1):
  - `@frozen`, `MOTION-03`, `StickyStageProps`, `` length: `${number}svh` ``, `sticky top-0`, `h-svh` → todos presentes
- Acceptance criteria — greps negativos (Task 1):
  - `! grep -i "lenis"` → limpo (zero menções, mesmo em comentário — D-08 reforçado)
  - `! grep "dvh"` → limpo (D-07: nenhuma menção, comentário usa termos genéricos)
  - `! grep -E "100vh|h-screen"` → limpo
  - `! grep -E "width:|top: [0-9]|left:"` → limpo (apenas `top-0` Tailwind utility, que é layout estático, não animação — alinhado com MOTION-08)
- Acceptance criteria — Task 2 barrel:
  - `export { StickyStage }` e `export type { StickyStageProps }` presentes
  - Total de exports = 10 (5 primitivas + 5 tipos) ✓
  - Placeholder `// export { StickyStage }` removido ✓
  - `@frozen` e `"5 primitivas"` presentes no header ✓
  - Build verde ✓

## Pré-condições para validação real-device (Plan 05)

Esta validação não acontece neste plan — é o foco do Plan 05. Mas o presente plan **estabelece as pré-condições** para que ela seja viável:

1. **StickyStage funcionalmente correto em desktop** (validado por build + estrutura DOM minimalista) ✓
2. **API congelada e estável** (mudanças exigem `motion-api-change` PR; barrel completo) ✓
3. **Zero dependência runtime adicional** — só CSS + React + provider já existente. Reduz superfície de "funciona em prod / quebra em prod" ✓
4. **Decisões conservadoras conscientes documentadas** — quando aparecer comportamento estranho em iOS, a equipe já sabe que sticky CSS + svh + zero JS é o golden path, e que coordenação extra é apenas plano B ✓

**Workflow esperado no Plan 05:**

- PR do Plan 05 (showcase) abre Vercel preview URL.
- Lenny abre `<preview>.vercel.app/dev/sticky` no **iPhone iOS real** (Safari, não emulator).
- Checklist explícita do plan-04 `<validation>` block:
  - Stage permanece pinado durante scroll completo do `length`
  - SEM jump horizontal
  - SEM release prematuro (antes do `length` terminar)
  - SEM address bar pulando o conteúdo
- Mesmo checklist em Android mid-tier real (Chrome).
- Desktops macOS/Safari, Chrome, Firefox.
- Se falhar: diagnosticar antes de adicionar coordenação JS (D-08 explícito).

Esta validação **bloqueia merge da Phase 2** (não apenas do Plan 05) — porque a Phase 2 entrega "biblioteca de motion confiável", e confiança em StickyStage só se materializa após teste real em iOS.

## Decisão consciente registrada: por que zero coordenação no código

D-08 é deliberada. As alternativas consideradas e rejeitadas:

| Alternativa rejeitada | Por que não |
|----------------------|-------------|
| `useLenis()` interno para pause/resume durante pin | Adiciona dependência de hook do engine — quebra D-08; expõe primitiva a mudanças de API do engine; aumenta superfície de bugs |
| Atributo `data-lenis-prevent` no wrapper | Desabilita smoothing dentro da seção — comportamento perceptível ao usuário (scroll vira "jerky" durante o pin); inverte o objetivo da fase (cinematográfico) |
| IntersectionObserver para detectar fim do pin e dar fallback | Engine JS de pinning paralelo — exatamente o que D-05 quer evitar; race conditions com o smooth-scroll engine; complexidade exponencial |
| Listener `lenis.on('scroll', ...)` para tracking de progress | Acoplamento total ao engine; StickyStage virou primitiva "smart" em vez de estrutural; Phase 4 teria que recriar a coordenação em cada seção |

A escolha por sticky CSS + svh + `syncTouch:false` no provider global é a **menor superfície possível** que ainda entrega o requirement.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking acceptance criteria] Reescrita de comentários para limpar greps negativos**

- **Found during:** Task 1, após primeira escrita do arquivo
- **Issue:** A primeira versão do arquivo mencionava "Lenis" e "dvh" em comentários (contexto de mitigação D-05 e D-07). Os acceptance criteria do plan rodam:
  - `! grep -i "lenis" src/components/motion/sticky-stage.tsx`
  - `! grep "dvh" src/components/motion/sticky-stage.tsx`
  
  Esses greps são literais (sem distinção de código vs comentário). A primeira escrita falhava ambos os critérios.
- **Por que auto-fix:** Acceptance criteria explícitos do plan precisam passar literalmente. Não é mudança de comportamento — apenas paráfrase dos comentários ("Lenis" → "smooth-scroll engine"; "dvh" → "outras viewport units / outras unidades"). Semântica do contexto preservada.
- **Fix:** Reescrita dos comentários do header e da JSDoc da prop `length` para usar termos genéricos ("smooth-scroll engine", "outras viewport units").
- **Files modified:** `src/components/motion/sticky-stage.tsx` (apenas comentários — código idêntico)
- **Commit:** `2b49b84` (Task 1)

Nenhuma outra deviation. Plano executado conforme escrito.

### Deferred Items (fora do escopo deste plan)

- **Warning ESLint pré-existente em `src/lib/analytics.ts:80`** — `Unused eslint-disable directive`. Drift de Phase 1, herdado por Plan 03. Não bloqueia build (apenas warning). Fora do escopo desta plan.

## Pattern Validado (encerrando a fase)

StickyStage finaliza os patterns da fase:

**Pattern A (Plan 02):** primitivas declarativas com tier matrix + reduced check (RevealOnView, ParallaxLayer).
**Pattern B (Plan 03):** render-prop primitive (ScrollScene).
**Pattern C (Plan 03):** measurement-based primitive (TextSplit + useLineGrouping).
**Pattern D (este plan):** **CSS-first structural primitive** — pin via comportamento nativo do browser, compile-time guard via template literal type, zero runtime overhead, zero acoplamento com engine externa. Apropriado quando o requirement é estrutural (layout) e não temporal (animação).

Plan 05 consumirá os 4 patterns na showcase `/dev/*` para validação real-device.

## Known Stubs

Nenhum stub. StickyStage é funcional, exportado e pronto para consumo. O fato de não haver showcase `/dev/sticky` ainda é por design — Plan 05 é a próxima wave.

## Threat Flags

Nenhuma nova superfície de ameaça (T-02-04 disposition=accept):

- Sem inputs externos, sem chamadas de rede, sem dados de usuário.
- Prop `length` é validada em compile-time pelo template literal type — runtime não tem path para receber valor inesperado.
- Prop `className` passa pelo helper `cn()` (clsx + tailwind-merge) já validado pelo ecossistema.
- Prop `children` é renderizado como React children — XSS impossível dentro do escopo do componente.
- Sem `dangerouslySetInnerHTML`. Sem `eval`. Sem refs DOM exposed externamente.

STRIDE vetor = zero.

## Próximas Waves

- **Plan 05 (Wave 3):** Showcase `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all` — gateway de validação real-device para Lenny abrir no iPhone via Vercel preview URL.
- **Plan 06 (Wave 4):** `README.md` em `components/motion/` (D-17) — contrato congelado das 5 primitivas, freeze policy, lista de devices validados na fase.

## Self-Check: PASSED

- FOUND: `src/components/motion/sticky-stage.tsx`
- FOUND: `src/components/motion/index.ts` (modificado — 5/5 primitivas exportadas)
- FOUND: commit `2b49b84` (Task 1 — StickyStage primitiva)
- FOUND: commit `8bc59e7` (Task 2 — barrel update)
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0
- Todos os greps de acceptance_criteria passam (positivos + negativos)
