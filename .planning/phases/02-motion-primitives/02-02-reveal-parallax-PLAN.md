---
phase: 02-motion-primitives
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - src/components/motion/reveal-on-view.tsx
  - src/components/motion/parallax-layer.tsx
  - src/components/motion/index.ts
requirements:
  - MOTION-01
  - MOTION-02
  - MOTION-07
  - MOTION-08
autonomous: true
must_haves:
  truths:
    - "`<RevealOnView>` renderiza qualquer children e dispara fade+slide na primeira entrada no viewport"
    - "`<RevealOnView>` adapta distance/duration/stagger automaticamente conforme `useDeviceTier()` retornar mobile/tablet/desktop"
    - "`<RevealOnView>` em reduced motion: estado final IMEDIATO (opacity=1, translateY=0, sem transição)"
    - "`<ParallaxLayer>` translada children verticalmente (transform translateY) baseado em scroll progress"
    - "`<ParallaxLayer>` em mobile (tier='mobile') E em reduced: magnitude=0 (não anima)"
    - "Ambas primitivas exportadas pelo barrel @/components/motion (D-16)"
    - "Animações usam APENAS transform e opacity (MOTION-08) — zero width/height/top/left"
  artifacts:
    - path: "src/components/motion/reveal-on-view.tsx"
      provides: "<RevealOnView> primitive (MOTION-01)"
      contains: "@frozen"
    - path: "src/components/motion/parallax-layer.tsx"
      provides: "<ParallaxLayer> primitive (MOTION-02)"
      contains: "@frozen"
    - path: "src/components/motion/index.ts"
      provides: "Barrel re-exporta RevealOnView, ParallaxLayer + tipos"
      contains: "RevealOnView"
  key_links:
    - from: "src/components/motion/reveal-on-view.tsx"
      to: "@/hooks/use-device-tier"
      via: "useDeviceTier()"
      pattern: "useDeviceTier"
    - from: "src/components/motion/reveal-on-view.tsx"
      to: "motion/react"
      via: "import motion, useReducedMotion"
      pattern: "from \"motion/react\""
    - from: "src/components/motion/parallax-layer.tsx"
      to: "src/components/motion/internal/use-scroll-progress-in-range"
      via: "useScrollProgressInRange + useTransform"
      pattern: "useScrollProgressInRange"
    - from: "src/components/motion/index.ts"
      to: "./reveal-on-view, ./parallax-layer"
      via: "named re-export"
      pattern: "export \\{ RevealOnView"
---

<objective>
Implementar 2 das 5 primitivas: `<RevealOnView>` (MOTION-01, viewport entry reveal adaptativo) e `<ParallaxLayer>` (MOTION-02, parallax sutil off em mobile). Ambas com matriz device-tier completa (D-10, D-11), reduced motion = estado final imediato (MOTION-07), apenas transform/opacity (MOTION-08), e exportadas pelo barrel congelado.

Purpose: São as primitivas de menor risco (sem sticky, sem split de texto, sem render prop boundary) — perfeitas para validar o pattern device-tier + reduced motion + barrel export antes das primitivas mais complexas. Servem como template para as primitivas mais arriscadas dos plans 03 e 04.

Output: 2 componentes funcionais, tipados, congelados, exportados, prontos pra showcase em `/dev/reveal` e `/dev/parallax` (Wave 3).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@src/hooks/use-device-tier.ts
@src/components/motion/index.ts
@src/components/motion/internal/easing.ts
@src/components/motion/internal/use-scroll-progress-in-range.ts
@src/components/providers/motion-config-provider.tsx

<interfaces>
<!-- Contratos das duas primitivas. CONGELADOS após este plano. -->

From src/components/motion/reveal-on-view.tsx (a ser criado):
```typescript
/** @frozen — MOTION-01. Mudanças exigem PR `motion-api-change`. */
export interface RevealOnViewProps {
  /** Conteúdo a revelar. Crianças que precisam de stagger devem ser irmãos diretos do RevealOnView (ou usar RevealOnView aninhado). */
  children: React.ReactNode;
  /** Atrasa entrada por N ms (composição manual de stagger entre múltiplos RevealOnView). Default 0. */
  delayMs?: number;
  /** Tag DOM. Default "div". */
  as?: "div" | "section" | "li" | "span" | "article";
  /** className passthrough. */
  className?: string;
  /** Threshold de IntersectionObserver via amount do whileInView. Default 0.2. */
  amount?: number;
  /** Re-dispara animação ao re-entrar. Default false (uma vez por mount). */
  repeat?: boolean;
}

export function RevealOnView(props: RevealOnViewProps): JSX.Element;
```

From src/components/motion/parallax-layer.tsx (a ser criado):
```typescript
/** @frozen — MOTION-02. Mudanças exigem PR `motion-api-change`. */
export interface ParallaxLayerProps {
  children: React.ReactNode;
  /**
   * Magnitude relativa (0 = sem parallax, 1 = move 100% da viewport).
   * Tier-overrides automáticos (D-11):
   *   - mobile: forçado 0 (REQ MOTION-02)
   *   - tablet: usa este valor × 0.5 (aprox 0.1 default)
   *   - desktop: usa este valor (aprox 0.2 default)
   *   - reduced: forçado 0
   * Default 0.2.
   */
  magnitude?: number;
  /** className passthrough — fica no wrapper externo, layer interna recebe translateY. */
  className?: string;
}

export function ParallaxLayer(props: ParallaxLayerProps): JSX.Element;
```

From src/components/motion/internal/easing.ts (já existe — Wave 1):
```typescript
export const MOTION_EASING = [0.16, 1, 0.3, 1] as const;
export const REVEAL_DURATION_MS = 500;
```

From src/hooks/use-device-tier.ts (já existe — Phase 1):
```typescript
export type DeviceTier = "reduced" | "mobile" | "tablet" | "desktop";
export function useDeviceTier(): DeviceTier;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Implementar `<RevealOnView>` (MOTION-01) com matriz device-tier D-10</name>
  <files>src/components/motion/reveal-on-view.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-10" (matriz distance/duration/stagger por tier)
    - src/hooks/use-device-tier.ts (assinatura + comportamento SSR)
    - src/components/motion/internal/easing.ts (MOTION_EASING, REVEAL_DURATION_MS)
    - src/components/providers/motion-config-provider.tsx (reducedMotion="user" — context global)
    - .planning/research/PITFALLS.md §"#19 motion property choice" e §"#20 reduced motion"
  </read_first>
  <action>
    Criar `src/components/motion/reveal-on-view.tsx`:

    ```typescript
    "use client";
    /**
     * @frozen — RevealOnView (MOTION-01).
     *
     * Fade + slide-up no primeiro viewport entry.
     * Adaptativo por useDeviceTier() (D-10):
     *   - mobile:   distance=12px, duration=400ms, stagger=60ms (delay base entre filhos)
     *   - tablet:   distance=16px, duration=500ms, stagger=70ms
     *   - desktop:  distance=24px, duration=600ms, stagger=80ms
     *   - reduced:  estado final imediato (sem transição) — MOTION-07
     *
     * Só usa `transform` (translateY) + `opacity` — MOTION-08.
     *
     * Stagger entre múltiplos RevealOnView é composição via `delayMs` prop
     * (o consumidor passa delays incrementais).
     *
     * Política de mudança (D-16): exige PR `motion-api-change` + aprovação Lenny.
     */
    import { motion, useReducedMotion } from "motion/react";
    import type { ReactNode } from "react";
    import { useDeviceTier } from "@/hooks/use-device-tier";
    import { MOTION_EASING } from "./internal/easing";

    export interface RevealOnViewProps {
      children: ReactNode;
      delayMs?: number;
      as?: "div" | "section" | "li" | "span" | "article";
      className?: string;
      amount?: number;
      repeat?: boolean;
    }

    type TierConfig = { distance: number; durationMs: number };

    const TIER_CONFIG: Record<"mobile" | "tablet" | "desktop", TierConfig> = {
      mobile:  { distance: 12, durationMs: 400 },
      tablet:  { distance: 16, durationMs: 500 },
      desktop: { distance: 24, durationMs: 600 },
    };

    export function RevealOnView({
      children,
      delayMs = 0,
      as = "div",
      className,
      amount = 0.2,
      repeat = false,
    }: RevealOnViewProps) {
      const tier = useDeviceTier();
      const reducedMotion = useReducedMotion();
      const isReduced = reducedMotion || tier === "reduced";

      // Reduced: render direto sem motion wrapper (estado final imediato).
      // Não criamos transição com duration=0 porque Motion ainda dispara o ciclo;
      // o ideal é não-animar.
      if (isReduced) {
        const Tag = as;
        // motion.div suporta as; aqui usamos Tag puro para garantir zero overhead.
        return <Tag className={className}>{children}</Tag>;
      }

      const { distance, durationMs } = TIER_CONFIG[tier as "mobile" | "tablet" | "desktop"];
      const MotionTag = motion[as];

      return (
        <MotionTag
          className={className}
          initial={{ opacity: 0, y: distance }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: !repeat, amount }}
          transition={{
            duration: durationMs / 1000,
            delay: delayMs / 1000,
            ease: MOTION_EASING as unknown as number[],
          }}
        >
          {children}
        </MotionTag>
      );
    }
    ```

    Observações de implementação:

    1. **Tag dinâmica:** `motion[as]` aceita `"div" | "section" | "li" | "span" | "article"` — limite o union a essas para typar bem. Outros casos = futuro (PR `motion-api-change`).
    2. **Reduced path:** retornamos `<Tag>` puro (não `motion.Tag`) para garantir overhead zero. `useReducedMotion` é check redundante junto com `tier === 'reduced'` mas torna a primitiva auto-suficiente mesmo sem MotionConfigProvider externo.
    3. **`once`:** default `true` (repeat=false) — premium feel, evita re-disparo ao scrollar de volta.
    4. **`ease` cast:** Motion aceita `[number, number, number, number]` mas o tipo é `Easing`; usar `as unknown as number[]` é o cast pragmático aceito pela comunidade.
    5. **Stagger entre filhos:** propositalmente NÃO implementado dentro da primitiva (children podem ser qualquer ReactNode). Consumidor compõe stagger encadeando múltiplos `<RevealOnView delayMs={n*60}>`. D-10 stagger values são guidance para o consumidor, não state interno.

    NÃO adicionar export ao barrel ainda — isso é Task 3.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/reveal-on-view.tsx` exit 0
    - `grep -q "@frozen" src/components/motion/reveal-on-view.tsx`
    - `grep -q "MOTION-01" src/components/motion/reveal-on-view.tsx`
    - `grep -q "useDeviceTier" src/components/motion/reveal-on-view.tsx`
    - `grep -q "useReducedMotion" src/components/motion/reveal-on-view.tsx`
    - `grep -q "MOTION_EASING" src/components/motion/reveal-on-view.tsx`
    - `grep -q "distance: 12" src/components/motion/reveal-on-view.tsx`
    - `grep -q "distance: 16" src/components/motion/reveal-on-view.tsx`
    - `grep -q "distance: 24" src/components/motion/reveal-on-view.tsx`
    - `grep -q "RevealOnViewProps" src/components/motion/reveal-on-view.tsx`
    - `! grep -E "width:|height:|top:|left:" src/components/motion/reveal-on-view.tsx` (MOTION-08 — sem props proibidas)
    - `npx tsc --noEmit` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>RevealOnView implementado com 4 paths de tier (incluindo reduced), tipos exportados, header @frozen, sem props proibidas, typecheck passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Implementar `<ParallaxLayer>` (MOTION-02) com magnitudes D-11</name>
  <files>src/components/motion/parallax-layer.tsx</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-11" (magnitudes 0/0.1/0.2/0 por tier; reduced=0)
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"specifics" (parallax sutil, quase imperceptível)
    - src/components/motion/internal/use-scroll-progress-in-range.ts (helper compartilhado — usar)
    - src/hooks/use-device-tier.ts
    - .planning/research/PITFALLS.md §"#19 motion property choice"
  </read_first>
  <action>
    Criar `src/components/motion/parallax-layer.tsx`:

    ```typescript
    "use client";
    /**
     * @frozen — ParallaxLayer (MOTION-02).
     *
     * Aplica translateY sutil baseado em scroll progress da seção em que
     * o ParallaxLayer está inserido.
     *
     * Matriz device-tier (D-11):
     *   - mobile:   magnitude=0 (off — REQ MOTION-02 obriga)
     *   - tablet:   magnitude × 0.5 (default 0.2 → efetivo 0.1, leve)
     *   - desktop:  magnitude × 1.0 (default 0.2, médio)
     *   - reduced:  magnitude=0
     *
     * Range: progress 0→1 mapeia em translateY de +magnitude*100px até -magnitude*100px
     * (entrando no viewport = layer offset positivo; saindo = offset negativo).
     *
     * MOTION-08: usa apenas `transform: translateY`.
     *
     * Política de mudança (D-16): exige PR `motion-api-change` + aprovação Lenny.
     */
    import { motion, useTransform, useReducedMotion } from "motion/react";
    import { useRef, type ReactNode } from "react";
    import { useDeviceTier } from "@/hooks/use-device-tier";
    import { useScrollProgressInRange } from "./internal/use-scroll-progress-in-range";

    export interface ParallaxLayerProps {
      children: ReactNode;
      /** Magnitude relativa. Tier-overrides automáticos. Default 0.2. */
      magnitude?: number;
      className?: string;
    }

    const TIER_MULTIPLIER: Record<"mobile" | "tablet" | "desktop", number> = {
      mobile: 0,    // MOTION-02 obriga off no mobile
      tablet: 0.5,
      desktop: 1.0,
    };

    /** Quanto px de translateY máximo aplicar dado magnitude=1. */
    const PARALLAX_RANGE_PX = 100;

    export function ParallaxLayer({
      children,
      magnitude = 0.2,
      className,
    }: ParallaxLayerProps) {
      const tier = useDeviceTier();
      const reducedMotion = useReducedMotion();
      const ref = useRef<HTMLDivElement>(null);
      const progress = useScrollProgressInRange(ref);

      const effectiveMagnitude =
        reducedMotion || tier === "reduced"
          ? 0
          : magnitude * TIER_MULTIPLIER[tier as "mobile" | "tablet" | "desktop"];

      const maxPx = effectiveMagnitude * PARALLAX_RANGE_PX;
      // Entrada do viewport → +maxPx; saída → -maxPx
      const y = useTransform(progress, [0, 1], [maxPx, -maxPx]);

      // Quando magnitude efetiva = 0, ainda renderizamos motion.div com y=0 fixo;
      // alternativa de retornar <div> evita criar MotionValue mas overhead é
      // negligível e mantém DOM consistente entre tiers.
      if (effectiveMagnitude === 0) {
        return <div className={className} ref={ref}>{children}</div>;
      }

      return (
        <motion.div className={className} ref={ref} style={{ y }}>
          {children}
        </motion.div>
      );
    }
    ```

    Observações:

    1. **Sem easing custom:** parallax derivativo de scroll progress não precisa de easing — é linear por design (1:1 com scroll).
    2. **`PARALLAX_RANGE_PX = 100`:** valor conservador (D-context "sutil, quase imperceptível"). Para `magnitude=0.2` desktop = 20px max — perceptível como profundidade sem chamar atenção.
    3. **`y` via `style`:** motion/react reconhece `y` como shorthand de `translateY` no objeto style — usa transform, não top/left.
    4. **DOM consistency:** retornamos `<div>` quando off, mas com mesmo ref → mantém layout idêntico entre tiers (sem reflow ao trocar tier via resize).
    5. **NÃO adicionar export ao barrel ainda** — Task 3.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/parallax-layer.tsx` exit 0
    - `grep -q "@frozen" src/components/motion/parallax-layer.tsx`
    - `grep -q "MOTION-02" src/components/motion/parallax-layer.tsx`
    - `grep -q "useDeviceTier" src/components/motion/parallax-layer.tsx`
    - `grep -q "useScrollProgressInRange" src/components/motion/parallax-layer.tsx`
    - `grep -q "useReducedMotion" src/components/motion/parallax-layer.tsx`
    - `grep -q "mobile: 0" src/components/motion/parallax-layer.tsx`
    - `grep -q "ParallaxLayerProps" src/components/motion/parallax-layer.tsx`
    - `! grep -E "width:|height:|top:|left:" src/components/motion/parallax-layer.tsx` (MOTION-08)
    - `npx tsc --noEmit` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>ParallaxLayer implementado, mobile=0 garantido, reduced=0 garantido, magnitudes corretas por tier, sem props proibidas, typecheck passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Re-exportar RevealOnView e ParallaxLayer no barrel @/components/motion</name>
  <files>src/components/motion/index.ts</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-16" (barrel é a primeira camada do freeze)
    - src/components/motion/index.ts (estado pós Wave 1)
    - src/components/motion/reveal-on-view.tsx (criado em Task 1)
    - src/components/motion/parallax-layer.tsx (criado em Task 2)
  </read_first>
  <action>
    Atualizar `src/components/motion/index.ts` adicionando exports nomeados das 2 primitivas + seus tipos. Manter header @frozen e os placeholders para as outras 3 primitivas (virão nos plans 03 e 04).

    Conteúdo final do arquivo:

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
     */

    export { RevealOnView } from "./reveal-on-view";
    export type { RevealOnViewProps } from "./reveal-on-view";

    export { ParallaxLayer } from "./parallax-layer";
    export type { ParallaxLayerProps } from "./parallax-layer";

    // Próximos exports (Wave 2 plans 03, 04):
    // export { ScrollScene } from "./scroll-scene";
    // export type { ScrollSceneProps } from "./scroll-scene";
    // export { TextSplit } from "./text-split";
    // export type { TextSplitProps } from "./text-split";
    // export { StickyStage } from "./sticky-stage";
    // export type { StickyStageProps } from "./sticky-stage";
    ```

    Smoke test: criar import temporário inline (ou rodar build) — Next.js compila sem erro?
  </action>
  <acceptance_criteria>
    - `grep -q "export \\{ RevealOnView \\}" src/components/motion/index.ts`
    - `grep -q "export \\{ ParallaxLayer \\}" src/components/motion/index.ts`
    - `grep -q "export type \\{ RevealOnViewProps \\}" src/components/motion/index.ts`
    - `grep -q "export type \\{ ParallaxLayerProps \\}" src/components/motion/index.ts`
    - `grep -q "@frozen" src/components/motion/index.ts`
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Barrel re-exporta as 2 primitivas + tipos, header @frozen mantido, próximos exports listados como placeholder comentado, build passa.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
N/A — pure client-side motion library; no inputs/outputs.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-02 | N/A | Motion primitives | accept | Componentes puramente declarativos, sem chamadas de rede, sem inputs do usuário, sem dados. Vetor de ataque: zero. |
</threat_model>

<validation>
## Validação automatizada
1. `npx tsc --noEmit` exit 0
2. `npm run build` exit 0
3. Greps de acceptance_criteria passam (especialmente os negativos: nenhuma menção a `width:|height:|top:|left:`)

## Validação manual (one-off — formal /dev showcase é Wave 3)
- Criar página temporária `/dev/tmp` (ou usar /dev raiz) importando `RevealOnView` e `ParallaxLayer` com retângulo placeholder
- `npm run dev` → abrir → scrollar:
  - RevealOnView: retângulo entra com fade + slide-up no primeiro view
  - ParallaxLayer: retângulo se move levemente (desktop), zero (mobile via DevTools device emulation)
- DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`:
  - Ambas: renderizam ESTADO FINAL imediato (RevealOnView: opacity=1, y=0; ParallaxLayer: translateY=0 fixo)
- DevTools → Performance → record durante scroll → confirmar:
  - Apenas linhas de **Composite Layers** disparando, sem **Layout** ou **Paint** de scroll-driven changes
  - (Aceptance: zero CSS properties além de `transform` e `opacity` no rastro de mutações de animação)

## Real-device (não bloqueia este plano — plano 04 StickyStage cobre formalmente)
- Smoke test no iPhone Safari real (Vercel preview): RevealOnView dispara, ParallaxLayer não move (mobile=0)
- Smoke test no Android Chrome real: idem

## Reduced motion checklist
- macOS: System Settings → Accessibility → Display → Reduce Motion → ON → reload → RevealOnView snap, Parallax static
- Windows: Settings → Accessibility → Visual effects → Animation effects → OFF → idem
</validation>

<success_criteria>
1. `<RevealOnView>` renderiza children, anima na entrada em desktop/tablet/mobile com valores D-10
2. `<RevealOnView>` em reduced motion = render direto sem motion wrapper (snap)
3. `<ParallaxLayer>` aplica translateY em desktop, 0.5× em tablet, 0 em mobile, 0 em reduced
4. Barrel `@/components/motion` exporta `RevealOnView`, `ParallaxLayer` e seus types
5. `npm run build` passa sem regressão
6. Greps confirmam ausência de propriedades de layout (`width:|height:|top:|left:`) — MOTION-08
</success_criteria>

<output>
Após completion, criar `.planning/phases/02-motion-primitives/02-02-SUMMARY.md` documentando:
- 2 primitivas implementadas, contratos finais (props + defaults por tier)
- Easing canônico aplicado: `MOTION_EASING` (cubic-bezier(0.16, 1, 0.3, 1))
- Stagger entre múltiplos `<RevealOnView>` é via `delayMs` (consumidor compõe — guidance D-10 stagger é número incremento)
- Próximos planos: ScrollScene + TextSplit (P03), StickyStage (P04), Showcase (P05), README + freeze final (P06)
</output>
