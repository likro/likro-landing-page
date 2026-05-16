---
phase: 02-motion-primitives
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/motion/index.ts
  - src/components/motion/internal/easing.ts
  - src/components/motion/internal/use-scroll-progress-in-range.ts
  - src/app/dev/page.tsx
requirements:
  - MOTION-06
autonomous: true
must_haves:
  truths:
    - "Diretório src/components/motion/ existe com barrel index.ts vazio (placeholders comentados, sem exports ainda)"
    - "Easing canônico cubic-bezier(0.16, 1, 0.3, 1) está disponível como constante única reutilizável"
    - "Rota /dev permanece acessível em localhost E em Vercel previews .vercel.app; permanece 404 em VERCEL_ENV=production"
  artifacts:
    - path: "src/components/motion/index.ts"
      provides: "Barrel único — futuro ponto de export das 5 primitivas (D-16)"
      contains: "// @frozen"
    - path: "src/components/motion/internal/easing.ts"
      provides: "Constante easing canônica MOTION_EASING e duração base"
      exports: ["MOTION_EASING", "REVEAL_DURATION_MS"]
    - path: "src/components/motion/internal/use-scroll-progress-in-range.ts"
      provides: "Helper compartilhado (stub assinatura) consumido por ScrollScene/ParallaxLayer"
    - path: "src/app/dev/page.tsx"
      provides: "Gate ajustado para VERCEL_ENV (D-15)"
      contains: "VERCEL_ENV"
  key_links:
    - from: "src/app/dev/page.tsx"
      to: "process.env.VERCEL_ENV"
      via: "gate condicional"
      pattern: "VERCEL_ENV"
    - from: "src/components/motion/index.ts"
      to: "components/motion/* primitives (próximas waves)"
      via: "re-export"
      pattern: "@frozen"
---

<objective>
Estabelecer a fundação física da biblioteca de primitivas: criar diretório `src/components/motion/`, barrel `index.ts` com header `@frozen` (D-16), constantes internas compartilhadas (easing único + duração base — Claude's Discretion, escolha coerente), e ajustar o gate da rota `/dev` para liberar Vercel previews (D-15) sem expor produção.

Purpose: Wave 1 é a pré-condição independente de todas as outras waves. Sem o barrel e sem o gate corrigido, nenhuma primitiva pode ser exportada nem validada em device real via preview URL.

Output: Diretório motion/ pronto, barrel placeholder com política @frozen, helper interno stub, gate /dev ajustado.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@.planning/phases/01-foundations-design-system/01-CONTEXT.md
@src/app/dev/page.tsx
@src/components/providers/smooth-scroll-provider.tsx
@src/components/providers/motion-config-provider.tsx
@src/hooks/use-device-tier.ts

<interfaces>
<!-- Easing canônico escolhido pelo Claude (Linear-Stripe feel — premium, decelerating).
     MUST be the ONLY easing used across all 5 primitives for visual coherence. -->

From src/components/motion/internal/easing.ts (a ser criado):
```typescript
/** @frozen — único easing canônico da biblioteca de primitivas. */
export const MOTION_EASING = [0.16, 1, 0.3, 1] as const;
/** Duração base de reveal em ms — primitivas ajustam por tier. */
export const REVEAL_DURATION_MS = 500;
```

From src/components/motion/internal/use-scroll-progress-in-range.ts (a ser criado):
```typescript
/**
 * Helper interno compartilhado por <ScrollScene> e <ParallaxLayer>.
 * Wrappa motion/react useScroll com defaults sensatos (D-03 sintaxe offset).
 * NÃO é exportado pelo barrel — apenas para uso INTERNO de primitivas.
 */
export function useScrollProgressInRange(
  ref: React.RefObject<HTMLElement | null>,
  offset?: [string, string]
): MotionValue<number>;
```

From src/components/motion/index.ts (barrel, criado vazio):
```typescript
/**
 * @frozen — API congelada de primitivas de motion (MOTION-06).
 * Mudanças exigem PR com label `motion-api-change` e aprovação explícita.
 * Consumidores NUNCA importam de `motion/react` diretamente nem de paths internos.
 * Imports válidos: apenas deste barrel.
 */
// Re-exports virão nas waves 2 e 3:
// export { RevealOnView } from "./reveal-on-view";
// export { ParallaxLayer } from "./parallax-layer";
// export { StickyStage } from "./sticky-stage";
// export { TextSplit } from "./text-split";
// export { ScrollScene } from "./scroll-scene";
// export type { ... } from "./types";
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Criar scaffold src/components/motion/ + barrel @frozen + helpers internos stub</name>
  <files>
    src/components/motion/index.ts,
    src/components/motion/internal/easing.ts,
    src/components/motion/internal/use-scroll-progress-in-range.ts
  </files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"Decisions" D-16, D-17 (freeze enforcement)
    - .planning/phases/01-foundations-design-system/01-CONTEXT.md §"D-19, D-20" (path alias `@/*`, co-locação)
    - src/components/providers/motion-config-provider.tsx (referência de estilo `"use client"` + comentário JSDoc)
    - src/components/ui/button.tsx (referência de estilo de arquivo de componente do projeto — se existir)
  </read_first>
  <action>
    Criar 3 arquivos novos. NENHUM consumidor deste plano consome estes ainda — são scaffold para waves 2-3.

    **1. `src/components/motion/index.ts`** (barrel — sem exports concretos ainda, apenas placeholder + header de política):
    ```typescript
    /**
     * @frozen — API congelada das primitivas de motion (MOTION-06).
     *
     * Política de mudanças (D-16):
     * - Mudanças nesta API exigem PR com label `motion-api-change`
     *   e aprovação explícita do Lenny.
     * - Consumidores (seções, atoms) NUNCA importam de `motion/react`
     *   diretamente — apenas deste barrel.
     * - Imports de paths internos (`./internal/*`) também não são permitidos
     *   fora desta pasta. Convenção, não enforced via ESLint (Phase 1 D-15).
     *
     * Re-exports são adicionados pelas waves 2 e 3 — este barrel propositalmente
     * fica vazio até as primitivas existirem.
     */
    export {};
    ```

    **2. `src/components/motion/internal/easing.ts`** (constantes compartilhadas — Claude's Discretion: easing único coerente):
    ```typescript
    /**
     * @frozen — easing canônico da biblioteca.
     *
     * cubic-bezier(0.16, 1, 0.3, 1) — decelerating curve "Stripe/Linear feel".
     * Escolhido conforme phase context (Claude's Discretion): conjunto coerente.
     * TODAS as 5 primitivas usam este easing — diferenças entre primitivas
     * vêm de duration/distance/stagger, NUNCA de easing diferente.
     */
    export const MOTION_EASING = [0.16, 1, 0.3, 1] as const;

    /** Duração base de reveal em ms — primitivas ajustam por tier. */
    export const REVEAL_DURATION_MS = 500;
    ```

    **3. `src/components/motion/internal/use-scroll-progress-in-range.ts`** (helper compartilhado — stub mínimo para ScrollScene e ParallaxLayer; implementação real fica nas waves 2):
    ```typescript
    "use client";
    import { useScroll } from "motion/react";
    import type { MotionValue } from "motion/react";
    import type { RefObject } from "react";

    /**
     * Helper INTERNO — wrappa motion/react useScroll com defaults sensatos.
     * Consumido por <ScrollScene> (D-01..D-04) e <ParallaxLayer> (D-11).
     * NÃO é exportado pelo barrel — uso interno apenas.
     *
     * @param ref ref ao elemento alvo
     * @param offset sintaxe Framer Motion useScroll (D-03);
     *               default ['start end', 'end start'] (entrada→saída do viewport)
     */
    export function useScrollProgressInRange(
      ref: RefObject<HTMLElement | null>,
      offset: [string, string] = ["start end", "end start"]
    ): MotionValue<number> {
      const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset as never, // motion/react aceita strings, type é stricter
      });
      return scrollYProgress;
    }
    ```

    Criar os diretórios `src/components/motion/` e `src/components/motion/internal/` se não existirem (a criação dos arquivos cria os diretórios automaticamente via Write).

    DO NOT criar `README.md` neste plano — README finalizado é Wave 4 (D-17). DO NOT exportar nada do barrel ainda — primitivas vêm nas waves 2.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/index.ts` exit 0
    - `test -f src/components/motion/internal/easing.ts` exit 0
    - `test -f src/components/motion/internal/use-scroll-progress-in-range.ts` exit 0
    - `grep -q "@frozen" src/components/motion/index.ts`
    - `grep -q "MOTION-06" src/components/motion/index.ts`
    - `grep -q "0.16, 1, 0.3, 1" src/components/motion/internal/easing.ts`
    - `grep -q "MOTION_EASING" src/components/motion/internal/easing.ts`
    - `grep -q "REVEAL_DURATION_MS" src/components/motion/internal/easing.ts`
    - `grep -q "useScrollProgressInRange" src/components/motion/internal/use-scroll-progress-in-range.ts`
    - `grep -q "use client" src/components/motion/internal/use-scroll-progress-in-range.ts`
    - `npm run typecheck` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>3 arquivos criados, header @frozen presente, easing canônico exportado, helper stub tipado, typecheck passa.</done>
</task>

<task type="auto">
  <name>Task 2: Ajustar gate /dev para liberar Vercel previews mantendo bloqueio em produção real (D-15)</name>
  <files>src/app/dev/page.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-15" (gate trade-off NODE_ENV vs VERCEL_ENV)
    - .planning/phases/01-foundations-design-system/01-CONTEXT.md §"FOUND-12" (intent original)
    - src/app/dev/page.tsx (todo o arquivo — comentário no topo explica a substituição em build)
  </read_first>
  <action>
    Substituir a checagem do gate na linha 26 de `src/app/dev/page.tsx`.

    **Antes (atual, FOUND-12 original):**
    ```typescript
    if (process.env.NODE_ENV === "production") {
      notFound();
    }
    ```

    **Depois (D-15 — libera Vercel previews .vercel.app mantendo bloqueio em produção real):**
    ```typescript
    // D-15: bloqueia apenas produção real (VERCEL_ENV === "production" → likro.com.br
    // ou domínio final). Previews .vercel.app têm VERCEL_ENV === "preview" → liberados
    // para validação real-device de primitivas via PR. Em local sem VERCEL_ENV definido,
    // NODE_ENV !== "production" também libera. Combinação cobre:
    //   - localhost dev:        VERCEL_ENV=undefined, NODE_ENV=development → libera
    //   - localhost prod build: VERCEL_ENV=undefined, NODE_ENV=production  → bloqueia
    //   - Vercel preview:       VERCEL_ENV=preview                          → libera
    //   - Vercel production:    VERCEL_ENV=production                       → bloqueia
    if (
      process.env.VERCEL_ENV === "production" ||
      (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production")
    ) {
      notFound();
    }
    ```

    Atualizar o JSDoc no topo do arquivo (linhas 16-24) para refletir D-15:

    **Substituir o bloco JSDoc atual por:**
    ```typescript
    /**
     * FOUND-12 + D-15: rota interna de showcase.
     *
     * Gate (D-15):
     * - VERCEL_ENV === "production" → 404 (produção real, ex: likro.com.br).
     * - VERCEL_ENV === "preview" → acessível (Vercel preview .vercel.app)
     *   — habilita real-device validation de primitivas via PR.
     * - Local dev (sem VERCEL_ENV): NODE_ENV controla.
     *
     * Previews ficam noindex via FOUND-11 (robots.txt + X-Robots-Tag),
     * então /dev em preview não corre risco de indexação.
     *
     * Esta é Server Component — sem "use client".
     */
    ```

    NÃO popular ainda a seção "Motion Primitives (Phase 2)" — sub-rotas e nav vêm em Wave 3 (plan 05). Manter o `<p>Será populado na Phase 2.</p>` por enquanto, ou trocar texto para `Será populado em /dev/reveal, /dev/parallax, /dev/sticky, /dev/textsplit, /dev/scene — links virão.` se preferir (Claude discretion).
  </action>
  <acceptance_criteria>
    - `grep -q "VERCEL_ENV" src/app/dev/page.tsx`
    - `grep -q "process.env.VERCEL_ENV === \"production\"" src/app/dev/page.tsx`
    - `grep -q "D-15" src/app/dev/page.tsx`
    - `grep -q "FOUND-12" src/app/dev/page.tsx` (intent original preservado no comentário)
    - `npm run typecheck` exit 0
    - `npm run build` exit 0 (smoke — gate é estaticamente substituível)
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit && npm run build</automated>
  </verify>
  <done>Gate trocado para VERCEL_ENV, JSDoc atualizado citando D-15 e FOUND-12, build passa, comportamento esperado: 404 só em produção real.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

N/A — pure client-side motion library scaffold. Nenhum input do usuário, sem dados, sem auth, sem chamadas externas. Gate `/dev` é defense-in-depth (preview já tem `X-Robots-Tag: noindex` por FOUND-11).

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | I (Info Disclosure) | `/dev` route em preview público | accept | Preview URLs `.vercel.app` são noindex (FOUND-11). `/dev` expõe placeholder rectangles, sem dados sensíveis. Riscoreputacional baixo: alguém vê primitivas WIP, nada operacional. Bloqueio definitivo (`VERCEL_ENV=production`) cobre o domínio público real. |
</threat_model>

<validation>
## Validação automatizada (CI/local)
1. `npx tsc --noEmit` exit 0
2. `npm run build` exit 0 (confirma dead-code elimination do gate funciona)
3. Greps de acceptance_criteria passam

## Validação manual (one-off — não bloqueia outras waves)
- `npm run dev` → abrir `http://localhost:3000/dev` → página renderiza
- `npm run build && npm run start` localmente → abrir `/dev` → 404 (NODE_ENV=production, VERCEL_ENV undefined → bloqueia)
- Após merge: Vercel preview gerado → abrir `<preview>.vercel.app/dev` → página renderiza
- Após deploy production: `likro.com.br/dev` (ou URL final) → 404

## Reduced motion / DevTools
N/A para este plano — nenhuma animação criada. Aplicável a partir do plan 02.
</validation>

<success_criteria>
1. Diretório `src/components/motion/` existe, com barrel + 2 helpers internos
2. Barrel header `@frozen` documenta política de mudanças (D-16)
3. Easing único `cubic-bezier(0.16, 1, 0.3, 1)` é a única curva canônica (D-decisão coerente)
4. Gate `/dev` aceita Vercel previews (`VERCEL_ENV=preview`) e bloqueia produção real (D-15)
5. `npm run build` exit 0, sem regressão na suite de Phase 1
</success_criteria>

<output>
Após completion, criar `.planning/phases/02-motion-primitives/02-01-SUMMARY.md` documentando:
- Estrutura `src/components/motion/` criada (índice arquivos)
- Easing canônico escolhido (`cubic-bezier(0.16, 1, 0.3, 1)`) — registro para futuras primitivas
- Comportamento do gate `/dev` em 4 cenários (local dev / local prod build / Vercel preview / Vercel prod)
- Próximas waves: 5 primitivas serão exportadas pelo barrel
</output>
