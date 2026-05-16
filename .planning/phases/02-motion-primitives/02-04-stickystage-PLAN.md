---
phase: 02-motion-primitives
plan: 04
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/components/motion/sticky-stage.tsx
  - src/components/motion/index.ts
requirements:
  - MOTION-03
  - MOTION-07
  - MOTION-08
autonomous: true
must_haves:
  truths:
    - "`<StickyStage>` pina seu primeiro filho via position:sticky NATIVO do CSS (D-05) — sem engine JS de pinning"
    - "`<StickyStage>` recebe prop obrigatória `length` template-literal type `${number}svh` (D-06, D-07)"
    - "`<StickyStage>` usa svh, dvh é proibido no contexto (D-07)"
    - "`<StickyStage>` NÃO importa nem chama Lenis (zero acoplamento — D-08)"
    - "`<StickyStage>` em reduced motion: mantém sticky (estrutura), zera animações internas (D-09)"
    - "Primitiva exportada pelo barrel; barrel agora exporta as 5 primitivas"
  artifacts:
    - path: "src/components/motion/sticky-stage.tsx"
      provides: "<StickyStage> primitive (MOTION-03) — pin via CSS sticky + svh"
      contains: "@frozen"
    - path: "src/components/motion/index.ts"
      provides: "Barrel completo com as 5 primitivas"
      contains: "StickyStage"
  key_links:
    - from: "src/components/motion/sticky-stage.tsx"
      to: "CSS position: sticky native"
      via: "Tailwind class sticky + top + style.height"
      pattern: "position.*sticky|sticky top-0"
    - from: "src/components/motion/sticky-stage.tsx"
      to: "no Lenis imports"
      via: "ausência completa"
      pattern: "lenis"
    - from: "src/components/motion/index.ts"
      to: "./sticky-stage"
      via: "named re-export"
      pattern: "export \\{ StickyStage"
---

<objective>
Implementar `<StickyStage>` (MOTION-03) — a primitiva com o **maior risco real-device** da fase (RISCO CRÍTICO research #3: Lenis + sticky no iOS). A estratégia (D-05..D-09) é deliberadamente conservadora: pin via `position: sticky` puro do CSS + `svh` (não `dvh`), zero acoplamento com Lenis (já configurado com `syncTouch: false` desde Phase 1), duração explícita via prop `length`. Reduced motion preserva estrutura (D-09).

Purpose: Sticky pinning é a única primitiva onde "funciona no Chrome desktop" significa NADA até validar em iOS Safari real. Isolá-la num plano dedicado:
1. Foco total na correção da implementação CSS-first.
2. Critérios de validação real-device explícitos no `<validation>` block.
3. Plan 05 (showcase) terá a sub-rota `/dev/sticky` dedicada para Lenny abrir no iPhone.

Output: 1 componente CSS-first sem Lenis coupling, barrel completo com as 5 primitivas.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@src/components/providers/smooth-scroll-provider.tsx
@src/components/motion/index.ts
@src/components/motion/internal/easing.ts

<interfaces>
<!-- Contrato CONGELADO após este plano. -->

From src/components/motion/sticky-stage.tsx (a ser criado):
```typescript
/** @frozen — MOTION-03. Mudanças exigem PR `motion-api-change`. */
export interface StickyStageProps {
  /**
   * Conteúdo a pinar. Recomendação: um único filho (será o "stage" pinado).
   * Múltiplos filhos = todos ficam dentro do wrapper sticky, mas o padrão é
   * usar um `<div>` com o conteúdo da scene.
   */
  children: React.ReactNode;
  /**
   * Duração explícita do pin em viewport units (D-06).
   * Template literal type força `svh` (D-07 — proíbe `vh` e `dvh` no contexto).
   * Ex: "150svh" (Bridge), "400svh" (Product 4 pilares).
   */
  length: `${number}svh`;
  /** className passthrough no wrapper externo (não no sticky filho). */
  className?: string;
}

export function StickyStage(props: StickyStageProps): JSX.Element;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Implementar `<StickyStage>` (MOTION-03) via position:sticky CSS + svh (D-05..D-09)</name>
  <files>src/components/motion/sticky-stage.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-05..D-09" — TODAS as decisões da StickyStage
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"specifics" ("Sticky CSS nativo > engine JS")
    - .planning/research/PITFALLS.md §"#3 Lenis + sticky iOS"
    - src/components/providers/smooth-scroll-provider.tsx (referência — Lenis tem syncTouch:false, condição que torna sticky CSS confiável em iOS)
    - .planning/phases/01-foundations-design-system/01-CONTEXT.md §"D-04" (svh/dvh trade-off do hero — StickyStage faz escolha mais conservadora)
  </read_first>
  <action>
    Criar `src/components/motion/sticky-stage.tsx`. Esta é a primitiva mais delicada — siga D-05..D-09 LITERALMENTE.

    ```typescript
    "use client";
    /**
     * @frozen — StickyStage (MOTION-03).
     *
     * Pin estrutural via `position: sticky` NATIVO do CSS — sem engine JS de pinning.
     * MITIGA RISCO CRÍTICO #3 (Lenis + sticky no iOS) combinando:
     *   - D-05: Lenis 1.3+ com `syncTouch: false` (configurado em Phase 1 FOUND-08)
     *           comporta sticky CSS nativamente em iOS Safari.
     *   - D-07: `svh` exclusivamente — `dvh` proibido neste contexto pra estabilizar
     *           o pin contra a address bar do iOS (pequena perda de espaço vertical
     *           aceita em troca de estabilidade absoluta).
     *   - D-08: Zero acoplamento com Lenis (sem useLenis, sem data-lenis-prevent).
     *           Sticky CSS + provider já configurado é suficiente.
     *
     * Estrutura DOM:
     *   <div style={{ height: length }}>             ← wrapper externo: altura do pin
     *     <div className="sticky top-0 h-svh">       ← stage pinado (uma viewport svh)
     *       {children}                                ← conteúdo da scene
     *     </div>
     *   </div>
     *
     * Reduced motion (D-09): mantém sticky CSS (estrutura). As primitivas aninhadas
     * (ScrollScene, ParallaxLayer, TextSplit) já tratam reduced internamente — o
     * StickyStage não precisa toggle nenhum.
     *
     * Política de mudança (D-16): exige PR `motion-api-change`.
     */
    import type { ReactNode } from "react";
    import { cn } from "@/lib/utils";

    export interface StickyStageProps {
      children: ReactNode;
      length: `${number}svh`;
      className?: string;
    }

    export function StickyStage({ children, length, className }: StickyStageProps) {
      return (
        <div className={cn("relative", className)} style={{ height: length }}>
          <div className="sticky top-0 h-svh w-full overflow-hidden">
            {children}
          </div>
        </div>
      );
    }
    ```

    **Observações críticas (leia tudo antes de implementar):**

    1. **Template literal type `${number}svh`:** força o caller a escrever `length="150svh"` — TypeScript bloqueia `length="150vh"`, `length="150dvh"`, `length="150"`. É a **camada compile-time** que enforce D-07. Combinado com a `h-svh` Tailwind interna, o pin é 100% svh-anchored.

    2. **Tailwind `h-svh`:** Tailwind v4 reconhece `svh` nativamente como unit. Se por algum motivo o build reclamar, fallback: `style={{ height: "100svh" }}` no filho. Verificar com `npm run build`.

    3. **`overflow-hidden`** no filho sticky: evita que children grandes (ex: mockup expandindo via ScrollScene aninhado) vazem fora da viewport pinada. Pode ser removido se um caso real precisar — ajuste documentado em Plan 06 README.

    4. **NÃO importar Lenis. NÃO usar `data-lenis-prevent`.** Decisão D-08 é explícita. Se durante validação real-device aparecer caso de release prematuro / jump horizontal, esse caso será tratado caso-a-caso, não preventivamente.

    5. **NÃO usar `dvh`** em nenhum lugar deste arquivo. D-07 é explícito.

    6. **NÃO adicionar export ao barrel ainda** — Task 2.

    7. **Reduced motion não exige código aqui:** primitiva é estrutura CSS pura. As primitivas internas (que o caller compõe via children) tratam reduced. D-09 é arquitetural, não código local.

    8. **`'use client'` explícito:** mesmo sendo CSS puro, Next.js precisa marker pra resolver no boundary correto + futura ergonomic de aninhar primitivas client (ScrollScene, etc).
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/sticky-stage.tsx` exit 0
    - `grep -q "@frozen" src/components/motion/sticky-stage.tsx`
    - `grep -q "MOTION-03" src/components/motion/sticky-stage.tsx`
    - `grep -q "StickyStageProps" src/components/motion/sticky-stage.tsx`
    - `grep -q "length: \`\${number}svh\`" src/components/motion/sticky-stage.tsx`
    - `grep -q "sticky top-0" src/components/motion/sticky-stage.tsx`
    - `grep -q "h-svh" src/components/motion/sticky-stage.tsx`
    - `! grep -i "lenis" src/components/motion/sticky-stage.tsx` (D-08: zero acoplamento)
    - `! grep "dvh" src/components/motion/sticky-stage.tsx` (D-07: dvh proibido)
    - `! grep -E "100vh|h-screen" src/components/motion/sticky-stage.tsx` (D-07: vh proibido)
    - `! grep -E "width:|top: [0-9]|left:" src/components/motion/sticky-stage.tsx` (MOTION-08; `top-0` Tailwind class é OK pois é layout estático, não animação)
    - `npx tsc --noEmit` exit 0
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>StickyStage implementado com CSS sticky + svh exclusivamente, zero referência a Lenis no código, template literal type força `${number}svh`, build passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Re-exportar StickyStage no barrel — biblioteca de primitivas completa</name>
  <files>src/components/motion/index.ts</files>
  <read_first>
    - src/components/motion/index.ts (estado pós Plan 03 — 4 primitivas exportadas)
    - src/components/motion/sticky-stage.tsx (criado em Task 1)
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-16" (freeze enforcement)
  </read_first>
  <action>
    Atualizar barrel adicionando StickyStage como o quinto export. Remover o comentário placeholder de StickyStage (já não é mais futuro). Manter header @frozen e regra de EXCEÇÃO controlada do ScrollScene.

    Conteúdo final do arquivo:

    ```typescript
    /**
     * @frozen — API congelada das primitivas de motion (MOTION-06).
     *
     * 5 primitivas exportadas:
     *   - <RevealOnView>   — fade+slide stagger on viewport entry
     *   - <ParallaxLayer>  — translateY sutil por scroll progress
     *   - <ScrollScene>    — render-prop boundary GSAP-future-ready (MotionValue<number> 0→1)
     *   - <TextSplit>      — reveal por palavra (desktop) ou linha (mobile/tablet)
     *   - <StickyStage>    — pin estrutural via position:sticky + svh
     *
     * Política de mudanças (D-16):
     * - Mudanças nesta API exigem PR com label `motion-api-change`
     *   e aprovação explícita do Lenny.
     * - Consumidores (seções, atoms) NUNCA importam de `motion/react`
     *   diretamente — apenas deste barrel.
     *   EXCEÇÃO controlada: dentro do render prop de <ScrollScene>, seções
     *   podem importar `useTransform` de `motion/react` para derivar sub-ranges
     *   do `progress` recebido (MOTION-05 + D-02). Documentado no README.
     * - Imports de paths internos (`./internal/*`) não são permitidos fora desta pasta.
     */

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
  </action>
  <acceptance_criteria>
    - `grep -q "export \\{ StickyStage \\}" src/components/motion/index.ts`
    - `grep -q "export type \\{ StickyStageProps \\}" src/components/motion/index.ts`
    - `grep -c "^export " src/components/motion/index.ts` retorna 10 (5 primitivas + 5 types)
    - `! grep "// export.*StickyStage" src/components/motion/index.ts` (placeholder comentado removido)
    - `grep -q "@frozen" src/components/motion/index.ts`
    - `grep -q "5 primitivas" src/components/motion/index.ts`
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Barrel completo com as 5 primitivas + 5 tipos, placeholders comentados removidos, header @frozen + lista descritiva + regra de exceção, build passa.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
N/A — pure client-side motion library; no inputs/outputs.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-04 | N/A | StickyStage | accept | Componente puramente estrutural (CSS classes + height inline style derivado de prop com template literal type). Sem inputs externos, sem dados, sem rede. |
</threat_model>

<validation>
## Validação automatizada
1. `npx tsc --noEmit` exit 0
2. `npm run build` exit 0
3. Greps de acceptance_criteria passam — ESPECIALMENTE os negativos:
   - `! grep -i "lenis" src/components/motion/sticky-stage.tsx` (D-08)
   - `! grep "dvh" src/components/motion/sticky-stage.tsx` (D-07)
   - `! grep -E "100vh|h-screen" src/components/motion/sticky-stage.tsx` (D-07)

## Validação manual (one-off — formal /dev/sticky showcase é Plan 05)
- Página temporária ou usar /dev raiz:
  ```tsx
  <StickyStage length="200svh">
    <div className="h-svh bg-surface-dark text-white grid place-items-center">
      <h1>Stage pinned for 2 viewports</h1>
    </div>
  </StickyStage>
  ```
- Scroll desktop Chrome: stage pina por 2 viewports, depois libera
- DevTools → Performance: zero animação de scroll-driven (não anima nada — é estrutura)
- DevTools → Rendering → `prefers-reduced-motion: reduce`: stage continua pinando (D-09 preserva estrutura)

## REAL-DEVICE VALIDATION (CRÍTICO — bloqueia merge do Plan 05)
Esta é a primitiva com maior risco real-device. Critérios formais (todos devem passar):

| Device | Browser | Critério |
|--------|---------|----------|
| iPhone (iOS 17+) real | Safari | Stage permanece pinado durante scroll completo do `length`; SEM jump horizontal; SEM release prematuro (antes do `length` terminar); SEM address bar pulando o conteúdo |
| Android mid-tier real | Chrome | Idem iPhone; SEM scroll bouncing fazendo o stage despinar |
| Desktop macOS | Safari | Idem |
| Desktop | Chrome | Idem |
| Desktop | Firefox | Idem |

**Workflow:** PR deste plano gera Vercel preview. Lenny abre `<preview>.vercel.app/dev/sticky` no iPhone real (sem emulator). Se falhar:
- Documentar comportamento exato + device em PR comment
- Diagnosticar antes de acrescentar coordenação Lenis (D-08 explícito: empiricamente, nunca por default)

Esta validação acontece NO PLAN 05 (showcase exists) — não bloqueia merge deste plano isolado, mas bloqueia merge da fase.

## Reduced motion checklist (Plan 05 fará pleno; aqui smoke)
- macOS Reduce Motion ON → sticky continua funcionando (CSS é estrutura)
- Windows Animations OFF → idem
</validation>

<success_criteria>
1. StickyStage existe, pina via `position: sticky` puro (sem engine JS)
2. Prop `length` é `${number}svh` template literal type — TS bloqueia outros units em compile-time
3. Arquivo NÃO menciona Lenis, NÃO usa dvh, NÃO usa vh/h-screen
4. Wrapper externo tem altura = length, filho sticky tem h-svh
5. Barrel exporta as 5 primitivas + 5 tipos — biblioteca completa
6. Build passa, typecheck passa
7. Critérios de validação real-device documentados explicitamente (executados no Plan 05)
</success_criteria>

<output>
Após completion, criar `.planning/phases/02-motion-primitives/02-04-SUMMARY.md` documentando:
- Estrutura DOM final de StickyStage (wrapper + sticky filho com svh)
- Compile-time guard via template literal type
- Lista das 5 primitivas exportadas + 5 tipos (biblioteca completa)
- Pré-condições para validação real-device (Vercel preview + /dev/sticky vindo no Plan 05)
- Decisão consciente registrada: zero coordenação com Lenis no código — apenas confiança na config global de Phase 1 (syncTouch:false)
</output>
