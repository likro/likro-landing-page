---
phase: 02-motion-primitives
plan: 05
type: execute
wave: 5
depends_on: [02, 03, 04]
files_modified:
  - src/app/dev/_components/dev-gate.tsx
  - src/app/dev/_components/placeholder-block.tsx
  - src/app/dev/page.tsx
  - src/app/dev/reveal/page.tsx
  - src/app/dev/parallax/page.tsx
  - src/app/dev/sticky/page.tsx
  - src/app/dev/textsplit/page.tsx
  - src/app/dev/scene/page.tsx
  - src/app/dev/all/page.tsx
requirements:
  - MOTION-01
  - MOTION-02
  - MOTION-03
  - MOTION-04
  - MOTION-05
  - MOTION-07
  - MOTION-08
autonomous: true
must_haves:
  truths:
    - "Rota `/dev/reveal` renderiza demos do <RevealOnView> cobrindo os 4 tiers visualmente claros"
    - "Rota `/dev/parallax` renderiza demos do <ParallaxLayer> mostrando profundidade desktop, leve tablet, off mobile"
    - "Rota `/dev/sticky` renderiza um demo de <StickyStage length='200svh'> com placeholder claro de pin"
    - "Rota `/dev/textsplit` mostra reveal por palavra (desktop) e linha (mobile) usando emulação de viewport"
    - "Rota `/dev/scene` mostra um ScrollScene com render prop derivando opacity/y do progress"
    - "Rota `/dev/all` combina as 5 primitivas em scroll único — testa interação entre elas"
    - "Rota `/dev` (raiz) tem nav linkando as 6 sub-rotas com tipografia premium"
    - "Cada sub-rota é gated igualmente à raiz (VERCEL_ENV !== 'production')"
  artifacts:
    - path: "src/app/dev/_components/dev-gate.tsx"
      provides: "Server-only check reutilizável que chama notFound() em produção real"
      exports: ["assertDevAccess"]
    - path: "src/app/dev/_components/placeholder-block.tsx"
      provides: "Retângulo placeholder reutilizável (premium aesthetics, não slap-dashed)"
      exports: ["PlaceholderBlock"]
    - path: "src/app/dev/reveal/page.tsx"
      provides: "Showcase de RevealOnView"
    - path: "src/app/dev/parallax/page.tsx"
      provides: "Showcase de ParallaxLayer"
    - path: "src/app/dev/sticky/page.tsx"
      provides: "Showcase de StickyStage — alvo principal de validação real-device iOS/Android"
    - path: "src/app/dev/textsplit/page.tsx"
      provides: "Showcase de TextSplit"
    - path: "src/app/dev/scene/page.tsx"
      provides: "Showcase de ScrollScene"
    - path: "src/app/dev/all/page.tsx"
      provides: "Combinação de todas as primitivas — interação real"
    - path: "src/app/dev/page.tsx"
      provides: "Nav simples linkando as 6 sub-rotas"
  key_links:
    - from: "src/app/dev/{sub}/page.tsx"
      to: "@/components/motion (barrel)"
      via: "import único"
      pattern: "from \"@/components/motion\""
    - from: "src/app/dev/{sub}/page.tsx"
      to: "assertDevAccess()"
      via: "primeira linha do componente"
      pattern: "assertDevAccess"
---

<objective>
Implementar o showcase completo das 5 primitivas em sub-rotas isoladas de `/dev` (D-13), + uma rota combinada `/dev/all` (testa interação entre primitivas — sticky+scrub+parallax co-existindo). Atualizar `/dev` raiz com nav para as 6 sub-rotas.

Cada sub-rota:
1. Aplica o mesmo gate D-15 (`assertDevAccess` reutilizável — DRY)
2. Demonstra a primitiva com **placeholder rectangles premium** (não slap-dashed — frontend-design skill aplicada: spacing, hierarquia, typography mesmo em /dev)
3. Cobre os 4 tiers via emulação de viewport (DevTools) — D-13 explícito
4. Usa SOMENTE imports do barrel `@/components/motion` (validação prática do contrato congelado)

Purpose: Esta é a base da **validação real-device** (D-14): cada PR da Phase 2 gera um preview Vercel; Lenny abre `<preview>.vercel.app/dev/sticky` no iPhone real e Android real para validar MOTION-03 (RISCO CRÍTICO #3). Sem showcase, validação não pode acontecer.

Output: 7 páginas novas (2 helpers + 5 sub-rotas + 1 combinada) + nav na raiz.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@src/app/dev/page.tsx
@src/components/motion/index.ts
@src/components/ui/container.tsx
@src/components/ui/headline.tsx
@src/lib/utils.ts

<interfaces>
<!-- Helpers e padrão das sub-rotas. Helpers ficam em src/app/dev/_components/
     (underscore prefix = não roteável no Next.js App Router, co-locado com /dev). -->

From src/app/dev/_components/dev-gate.tsx (a ser criado):
```typescript
import "server-only";
import { notFound } from "next/navigation";

/**
 * Mesma lógica de gate de src/app/dev/page.tsx (D-15) — extraída pra reuso
 * em todas as sub-rotas /dev/*.
 * Chama notFound() se estiver em produção real (VERCEL_ENV='production').
 * Server-only — força build error se importado em client component.
 */
export function assertDevAccess(): void;
```

From src/app/dev/_components/placeholder-block.tsx (a ser criado):
```typescript
/**
 * Retângulo placeholder com aesthetic premium (não slap-dashed).
 * Variantes coloridas neutras + caption opcional + numeração.
 * Usado em todas as demos de /dev/* — uniformidade visual sinaliza intencionalidade.
 */
export interface PlaceholderBlockProps {
  label?: string;          // ex: "1", "Hero", "Pillar 1"
  caption?: string;        // ex: "RevealOnView · delay 0ms"
  tone?: "dark" | "light" | "tinted"; // surface palette only — não usar accent
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}
export function PlaceholderBlock(props: PlaceholderBlockProps): JSX.Element;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Criar helpers compartilhados `assertDevAccess` + `PlaceholderBlock` (DRY + premium aesthetic)</name>
  <files>
    src/app/dev/_components/dev-gate.tsx,
    src/app/dev/_components/placeholder-block.tsx
  </files>
  <read_first>
    - src/app/dev/page.tsx (lógica do gate D-15, comentários de intent)
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-15" (gate logic) e §"Claude's Discretion" (cor/estilo placeholders — surface, não accent)
    - src/app/globals.css (tokens disponíveis: surface.dark, surface.light, surface.tinted, text.muted, border)
    - src/components/ui/headline.tsx (estilo de tipografia da casa)
  </read_first>
  <action>
    **1. `src/app/dev/_components/dev-gate.tsx`** — extrai a checagem D-15 pra reuso:

    ```typescript
    import "server-only";
    import { notFound } from "next/navigation";

    /**
     * Gate D-15 reutilizável.
     * Comportamento:
     *   - VERCEL_ENV === "production"                                    → 404
     *   - VERCEL_ENV === undefined && NODE_ENV === "production"          → 404 (local prod build)
     *   - VERCEL_ENV === "preview" / "development" / undefined em dev    → libera
     *
     * Server-only (não importar em client component — build error).
     */
    export function assertDevAccess(): void {
      if (
        process.env.VERCEL_ENV === "production" ||
        (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production")
      ) {
        notFound();
      }
    }
    ```

    **2. `src/app/dev/_components/placeholder-block.tsx`** — retângulo premium (frontend-design skill: spacing, hierarchy, intentional):

    ```typescript
    import { cn } from "@/lib/utils";

    export interface PlaceholderBlockProps {
      label?: string;
      caption?: string;
      tone?: "dark" | "light" | "tinted";
      size?: "sm" | "md" | "lg" | "xl";
      className?: string;
    }

    const SIZE_CLASS: Record<NonNullable<PlaceholderBlockProps["size"]>, string> = {
      sm: "h-24",
      md: "h-40",
      lg: "h-64",
      xl: "h-96",
    };

    const TONE_CLASS: Record<NonNullable<PlaceholderBlockProps["tone"]>, string> = {
      // Tokens vêm do globals.css (Phase 1). NÃO usar accent.* aqui (brand: roxo é destaque).
      dark:   "bg-surface-dark   text-white",
      light:  "bg-surface-light  text-text-secondary border border-border",
      tinted: "bg-surface-tinted text-text-secondary border border-border",
    };

    export function PlaceholderBlock({
      label,
      caption,
      tone = "tinted",
      size = "md",
      className,
    }: PlaceholderBlockProps) {
      return (
        <div
          className={cn(
            "w-full rounded-xl grid place-items-center text-center px-6",
            "transition-shadow",
            SIZE_CLASS[size],
            TONE_CLASS[tone],
            className,
          )}
        >
          <div className="space-y-1">
            {label ? (
              <div className="text-2xl font-medium tracking-tight">{label}</div>
            ) : null}
            {caption ? (
              <div className="text-xs uppercase tracking-wider opacity-70">
                {caption}
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    ```

    **Confirmar tokens em `src/app/globals.css`:** o código assume `bg-surface-dark`, `bg-surface-light`, `bg-surface-tinted`, `text-text-secondary`, `border-border` existem (Phase 1 D-13/D-14). Se algum nome divergir, **adaptar para o nome real** mantendo a paleta neutra (sem usar accent).
  </action>
  <acceptance_criteria>
    - `test -f src/app/dev/_components/dev-gate.tsx` exit 0
    - `test -f src/app/dev/_components/placeholder-block.tsx` exit 0
    - `grep -q "assertDevAccess" src/app/dev/_components/dev-gate.tsx`
    - `grep -q "server-only" src/app/dev/_components/dev-gate.tsx`
    - `grep -q "VERCEL_ENV" src/app/dev/_components/dev-gate.tsx`
    - `grep -q "PlaceholderBlock" src/app/dev/_components/placeholder-block.tsx`
    - `! grep -i "accent" src/app/dev/_components/placeholder-block.tsx` (brand: sem roxo aqui)
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>2 helpers criados, gate reutilizável extraído, placeholder premium com 4 sizes × 3 tones, sem accent, build passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Showcases isolados — /dev/reveal, /dev/parallax, /dev/textsplit, /dev/scene</name>
  <files>
    src/app/dev/reveal/page.tsx,
    src/app/dev/parallax/page.tsx,
    src/app/dev/textsplit/page.tsx,
    src/app/dev/scene/page.tsx
  </files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-13" (sub-rotas isoladas, cobertura dos 4 tiers)
    - src/components/motion/index.ts (verificar exports disponíveis)
    - src/app/dev/_components/dev-gate.tsx (criado em Task 1)
    - src/app/dev/_components/placeholder-block.tsx (criado em Task 1)
    - src/components/ui/container.tsx (layout padrão)
    - src/components/ui/headline.tsx (typography)
  </read_first>
  <action>
    Cada página é Server Component (chama `assertDevAccess()`) mas renderiza primitivas que são client. App Router permite — `'use client'` nas primitivas, não nas páginas.

    **`src/app/dev/reveal/page.tsx`:**

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import { PlaceholderBlock } from "../_components/placeholder-block";
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { RevealOnView } from "@/components/motion";

    export default function DevRevealPage() {
      assertDevAccess();

      return (
        <main className="min-h-dvh bg-surface-light py-12">
          <Container>
            <Headline as="h1" size="hero">/dev/reveal</Headline>
            <p className="mt-2 text-text-muted">
              <code>&lt;RevealOnView&gt;</code> — adapta distance/duration por tier (D-10).
              Toggle <em>prefers-reduced-motion</em> no OS → render direto sem motion.
              Emule mobile/tablet/desktop via DevTools para ver matriz completa.
            </p>

            {/* Espaço pra forçar primeiro scroll antes de entrar no viewport */}
            <div className="h-svh" />

            <section className="space-y-6 mt-12">
              <Headline as="h2" size="section">Single reveal</Headline>
              <RevealOnView>
                <PlaceholderBlock label="A" caption="RevealOnView default · once=true" size="lg" tone="dark" />
              </RevealOnView>
            </section>

            <section className="space-y-6 mt-24">
              <Headline as="h2" size="section">Manual stagger (3 siblings com delayMs)</Headline>
              <div className="grid gap-4 sm:grid-cols-3">
                <RevealOnView delayMs={0}>
                  <PlaceholderBlock label="1" caption="delay 0ms" size="md" />
                </RevealOnView>
                <RevealOnView delayMs={80}>
                  <PlaceholderBlock label="2" caption="delay 80ms" size="md" />
                </RevealOnView>
                <RevealOnView delayMs={160}>
                  <PlaceholderBlock label="3" caption="delay 160ms" size="md" />
                </RevealOnView>
              </div>
            </section>

            <section className="space-y-6 mt-24">
              <Headline as="h2" size="section">Repeat=true (re-anima ao re-entrar)</Headline>
              <RevealOnView repeat>
                <PlaceholderBlock label="R" caption="repeat=true · scrollar pra cima/baixo" size="lg" tone="tinted" />
              </RevealOnView>
            </section>

            {/* Espaço final pra permitir scroll completo das demos */}
            <div className="h-svh" />
          </Container>
        </main>
      );
    }
    ```

    **`src/app/dev/parallax/page.tsx`** (similar — 1 demo single, 1 demo lado-a-lado de tiers via DevTools, 1 demo dentro de seção com texto fixo para contraste):

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import { PlaceholderBlock } from "../_components/placeholder-block";
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { ParallaxLayer } from "@/components/motion";

    export default function DevParallaxPage() {
      assertDevAccess();

      return (
        <main className="min-h-dvh bg-surface-light py-12">
          <Container>
            <Headline as="h1" size="hero">/dev/parallax</Headline>
            <p className="mt-2 text-text-muted">
              <code>&lt;ParallaxLayer&gt;</code> — magnitudes por tier (D-11):
              mobile=0, tablet=0.5×, desktop=1×. Reduced=0. MOTION-08 conforme.
            </p>

            <div className="h-svh" />

            <section className="space-y-6 mt-12">
              <Headline as="h2" size="section">Single layer (magnitude=0.2 default)</Headline>
              <ParallaxLayer>
                <PlaceholderBlock label="Default" caption="magnitude=0.2 (desktop 20px max)" size="xl" tone="dark" />
              </ParallaxLayer>
            </section>

            <section className="space-y-6 mt-24">
              <Headline as="h2" size="section">Layered (overlap mostrando profundidade)</Headline>
              <div className="relative h-[60svh]">
                <ParallaxLayer magnitude={0.1} className="absolute inset-0">
                  <PlaceholderBlock label="back" caption="magnitude=0.1" size="xl" tone="tinted" />
                </ParallaxLayer>
                <ParallaxLayer magnitude={0.3} className="absolute inset-x-12 inset-y-12">
                  <PlaceholderBlock label="front" caption="magnitude=0.3" size="lg" tone="dark" />
                </ParallaxLayer>
              </div>
            </section>

            <div className="h-svh" />
          </Container>
        </main>
      );
    }
    ```

    **`src/app/dev/textsplit/page.tsx`:**

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { TextSplit } from "@/components/motion";

    export default function DevTextSplitPage() {
      assertDevAccess();

      return (
        <main className="min-h-dvh bg-surface-light py-12">
          <Container>
            <Headline as="h1" size="hero">/dev/textsplit</Headline>
            <p className="mt-2 text-text-muted">
              <code>&lt;TextSplit&gt;</code> — desktop: palavra (stagger 25ms);
              tablet/mobile: linha (stagger 80ms); reduced: instant (D-12).
              Use DevTools device emulation pra alternar.
            </p>

            <div className="h-svh" />

            <section className="space-y-12 mt-12">
              <TextSplit
                as="h2"
                text="Likro foi feito exatamente pra sua clínica"
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
              />

              <TextSplit
                as="p"
                text="Sua equipe responde no WhatsApp, agenda no calendário certo e nunca mais perde um lead do Instagram."
                className="max-w-2xl text-lg text-text-secondary leading-relaxed"
              />
            </section>

            <div className="h-svh" />
          </Container>
        </main>
      );
    }
    ```

    **`src/app/dev/scene/page.tsx`** (precisa de `'use client'` na página pois usa motion direto no render prop — exceção controlada documentada no barrel):

    ```typescript
    "use client";
    // OBS: esta /dev page é client porque demonstra o render prop do ScrollScene,
    // que recebe MotionValue<number>. Em código de produção, esta exceção é
    // controlada (documentada no barrel motion/index.ts).
    // O gate D-15 fica em uma server boundary acima — solução: importar gate em
    // server wrapper. Para /dev showcase, aceitamos client direto.

    import { useTransform, motion } from "motion/react";
    import { ScrollScene } from "@/components/motion";
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { PlaceholderBlock } from "../_components/placeholder-block";

    export default function DevScenePage() {
      // Nota: gate D-15 em client é impossível (process.env.VERCEL_ENV não
      // existe no client). Para esta sub-rota, dependemos do gate da raiz
      // /dev/page.tsx — se a raiz for 404, sub-rota deveria ser also-404.
      // Alternativa: layout.tsx server em /dev/scene/ chamando assertDevAccess.
      // Implementamos a alternativa abaixo: ver src/app/dev/scene/layout.tsx.

      return (
        <main className="min-h-dvh bg-surface-light py-12">
          <Container>
            <Headline as="h1" size="hero">/dev/scene</Headline>
            <p className="mt-2 text-text-muted">
              <code>&lt;ScrollScene&gt;</code> — render prop recebe MotionValue&lt;number&gt; 0→1.
              Caller deriva sub-ranges via <code>useTransform</code> (exceção controlada — D-02, MOTION-05).
            </p>

            <div className="h-svh" />

            <ScrollScene className="my-24">
              {(progress) => {
                const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.2]);
                const y = useTransform(progress, [0, 1], [40, -40]);
                return (
                  <motion.div style={{ opacity, y }}>
                    <PlaceholderBlock
                      label="Scene"
                      caption="opacity & y derived from progress 0→1"
                      size="xl"
                      tone="dark"
                    />
                  </motion.div>
                );
              }}
            </ScrollScene>

            <div className="h-svh" />
          </Container>
        </main>
      );
    }
    ```

    **+ criar `src/app/dev/scene/layout.tsx`** (Server Component) com o gate:

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import type { ReactNode } from "react";

    /** Server-side gate D-15 para /dev/scene — page.tsx é client devido a render prop. */
    export default function DevSceneLayout({ children }: { children: ReactNode }) {
      assertDevAccess();
      return <>{children}</>;
    }
    ```

    **NOTA arquitetural:** o pattern "layout server + page client" funciona porque o layout roda primeiro. Aplica-se também a /dev/all (Task 3) que precisa de ScrollScene + StickyStage misturados.
  </action>
  <acceptance_criteria>
    - `test -f src/app/dev/reveal/page.tsx` exit 0
    - `test -f src/app/dev/parallax/page.tsx` exit 0
    - `test -f src/app/dev/textsplit/page.tsx` exit 0
    - `test -f src/app/dev/scene/page.tsx` exit 0
    - `test -f src/app/dev/scene/layout.tsx` exit 0
    - `grep -q "assertDevAccess" src/app/dev/reveal/page.tsx`
    - `grep -q "assertDevAccess" src/app/dev/parallax/page.tsx`
    - `grep -q "assertDevAccess" src/app/dev/textsplit/page.tsx`
    - `grep -q "assertDevAccess" src/app/dev/scene/layout.tsx`
    - `grep -q "from \"@/components/motion\"" src/app/dev/reveal/page.tsx`
    - `grep -q "from \"@/components/motion\"" src/app/dev/parallax/page.tsx`
    - `grep -q "from \"@/components/motion\"" src/app/dev/textsplit/page.tsx`
    - `grep -q "from \"@/components/motion\"" src/app/dev/scene/page.tsx`
    - `grep -q "use client" src/app/dev/scene/page.tsx`
    - `! grep -E "from \"motion/react\"" src/app/dev/reveal/page.tsx` (não importa direto)
    - `! grep -E "from \"motion/react\"" src/app/dev/parallax/page.tsx`
    - `! grep -E "from \"motion/react\"" src/app/dev/textsplit/page.tsx`
    - `grep -q "from \"motion/react\"" src/app/dev/scene/page.tsx` (exceção controlada — useTransform dentro de render prop)
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>4 sub-rotas criadas + layout server pra /dev/scene, gates aplicados, imports só pelo barrel exceto exceção documentada de useTransform em /dev/scene, build passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Showcase /dev/sticky (CRÍTICO — alvo de validação real-device iOS/Android)</name>
  <files>
    src/app/dev/sticky/page.tsx,
    src/app/dev/sticky/layout.tsx
  </files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-05..D-09, D-13, D-14" (StickyStage + showcase + real-device)
    - .planning/phases/02-motion-primitives/02-04-stickystage-PLAN.md (criterios real-device documentados lá)
    - src/components/motion/sticky-stage.tsx (assinatura StickyStage)
    - src/app/dev/_components/dev-gate.tsx
  </read_first>
  <action>
    `/dev/sticky` é a sub-rota mais crítica — é onde o RISCO CRÍTICO #3 (Lenis + sticky iOS) é validado em device real.

    **`src/app/dev/sticky/layout.tsx`** (server gate):

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import type { ReactNode } from "react";

    export default function DevStickyLayout({ children }: { children: ReactNode }) {
      assertDevAccess();
      return <>{children}</>;
    }
    ```

    **`src/app/dev/sticky/page.tsx`:**

    ```typescript
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { StickyStage } from "@/components/motion";
    import { PlaceholderBlock } from "../_components/placeholder-block";

    export default function DevStickyPage() {
      return (
        <main className="min-h-svh bg-surface-light">
          <Container className="py-12">
            <Headline as="h1" size="hero">/dev/sticky</Headline>
            <p className="mt-2 text-text-muted max-w-2xl">
              <code>&lt;StickyStage&gt;</code> — pin via <code>position: sticky</code> CSS +
              <code>svh</code> (D-05..D-09). Zero coordenação com Lenis. Validação real-device
              é mandatória aqui — abra esta URL no iPhone/Android real.
            </p>
            <ul className="mt-4 text-sm text-text-muted list-disc list-inside space-y-1">
              <li>Stage deve permanecer pinado durante toda a extensão de <code>length</code></li>
              <li>SEM release prematuro</li>
              <li>SEM jump horizontal</li>
              <li>iOS: SEM address bar pulando o conteúdo</li>
              <li>Reduced motion: estrutura sticky deve permanecer (D-09)</li>
            </ul>
          </Container>

          {/* Spacer antes do primeiro stage pra forçar scroll */}
          <div className="h-svh grid place-items-center text-text-muted">
            <span>↓ scrolla pra ver o pin ↓</span>
          </div>

          {/* Stage 1: 200svh — 2 viewports pinado */}
          <StickyStage length="200svh">
            <div className="h-full w-full bg-surface-dark text-white grid place-items-center">
              <div className="text-center space-y-2 px-6">
                <div className="text-4xl font-medium tracking-tight">Stage A</div>
                <div className="text-sm uppercase tracking-wider opacity-70">
                  length=&quot;200svh&quot; · 2 viewports pinned
                </div>
              </div>
            </div>
          </StickyStage>

          {/* Spacer entre stages */}
          <div className="h-svh grid place-items-center text-text-muted">
            <span>↓ próximo stage ↓</span>
          </div>

          {/* Stage 2: 400svh — 4 viewports (semelhante a Product 4 pilares) */}
          <StickyStage length="400svh">
            <div className="h-full w-full bg-surface-tinted grid place-items-center">
              <div className="text-center space-y-2 px-6">
                <div className="text-4xl font-medium tracking-tight">Stage B</div>
                <div className="text-sm uppercase tracking-wider opacity-70 text-text-secondary">
                  length=&quot;400svh&quot; · 4 viewports pinned (Product-like)
                </div>
              </div>
            </div>
          </StickyStage>

          {/* Spacer final pra confirmar release */}
          <div className="h-svh grid place-items-center text-text-muted">
            <span>após Stage B — release confirmado</span>
          </div>
        </main>
      );
    }
    ```

    Observações:

    1. **NÃO usar Container ao redor dos StickyStage** — Container tem `max-w-*` e padding lateral. StickyStage precisa de full-width pra layout sticky funcionar previsivelmente. Container só ao redor do header introdutório.
    2. **`h-svh` interno dos children** — match com o `h-svh` interno do StickyStage (que o stage filho tem altura de 1 viewport svh).
    3. **Conteúdos contrastantes** (surface-dark + surface-tinted) → fácil ver visualmente onde o pin começa/termina durante scroll real-device.
    4. **Texto orientativo** com `<ul>` lista 4 critérios de validação real-device — Lenny tem checklist na tela quando abre no iPhone.
  </action>
  <acceptance_criteria>
    - `test -f src/app/dev/sticky/page.tsx` exit 0
    - `test -f src/app/dev/sticky/layout.tsx` exit 0
    - `grep -q "assertDevAccess" src/app/dev/sticky/layout.tsx`
    - `grep -q "StickyStage" src/app/dev/sticky/page.tsx`
    - `grep -q "from \"@/components/motion\"" src/app/dev/sticky/page.tsx`
    - `grep -q "length=\"200svh\"" src/app/dev/sticky/page.tsx`
    - `grep -q "length=\"400svh\"" src/app/dev/sticky/page.tsx`
    - `! grep -i "lenis" src/app/dev/sticky/page.tsx` (D-08: zero acoplamento)
    - `! grep "dvh" src/app/dev/sticky/page.tsx` (D-07: dvh proibido no contexto StickyStage)
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>/dev/sticky page criada com 2 stages distintos (200svh + 400svh), checklist de validação visível na tela, layout server gate aplicado, build passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Showcase combinado /dev/all + nav atualizada em /dev/page.tsx</name>
  <files>
    src/app/dev/all/page.tsx,
    src/app/dev/all/layout.tsx,
    src/app/dev/page.tsx
  </files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-13" (/dev/all combinada)
    - src/app/dev/page.tsx (estado pós Plan 01 — gate já em VERCEL_ENV)
    - Sub-rotas criadas em Tasks 2-3 (lista para nav)
    - src/components/motion/index.ts (5 primitivas exportadas)
  </read_first>
  <action>
    **1. `src/app/dev/all/layout.tsx`** (server gate):

    ```typescript
    import { assertDevAccess } from "../_components/dev-gate";
    import type { ReactNode } from "react";

    export default function DevAllLayout({ children }: { children: ReactNode }) {
      assertDevAccess();
      return <>{children}</>;
    }
    ```

    **2. `src/app/dev/all/page.tsx`** — composição cumulativa pra testar interação entre primitivas. Esta é a página que vai mais perto de simular uma seção real (preview da Phase 4):

    ```typescript
    "use client";
    import { motion, useTransform } from "motion/react";
    import {
      RevealOnView,
      ParallaxLayer,
      ScrollScene,
      TextSplit,
      StickyStage,
    } from "@/components/motion";
    import { Container } from "@/components/ui/container";
    import { Headline } from "@/components/ui/headline";
    import { PlaceholderBlock } from "../_components/placeholder-block";

    export default function DevAllPage() {
      return (
        <main className="min-h-svh bg-surface-light">
          <Container className="py-12">
            <Headline as="h1" size="hero">/dev/all</Headline>
            <p className="mt-2 text-text-muted max-w-2xl">
              As 5 primitivas combinadas em scroll único. Objetivo: testar
              interação real (sticky + scrub + parallax co-existindo).
              Smoke test antes das seções da Phase 4.
            </p>
          </Container>

          {/* Spacer */}
          <div className="h-svh" />

          {/* Seção 1: RevealOnView + TextSplit */}
          <Container className="py-24">
            <TextSplit
              as="h2"
              text="Likro para clínicas e estéticas"
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-12"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <RevealOnView delayMs={0}>
                <PlaceholderBlock label="1" caption="reveal" size="lg" tone="dark" />
              </RevealOnView>
              <RevealOnView delayMs={80}>
                <PlaceholderBlock label="2" caption="reveal · 80ms" size="lg" tone="tinted" />
              </RevealOnView>
              <RevealOnView delayMs={160}>
                <PlaceholderBlock label="3" caption="reveal · 160ms" size="lg" />
              </RevealOnView>
            </div>
          </Container>

          {/* Seção 2: ParallaxLayer com depth */}
          <Container className="py-24">
            <Headline as="h2" size="section" className="mb-8">Parallax layered</Headline>
            <div className="relative h-[60svh]">
              <ParallaxLayer magnitude={0.1} className="absolute inset-0">
                <PlaceholderBlock label="back" caption="0.1" size="xl" tone="tinted" />
              </ParallaxLayer>
              <ParallaxLayer magnitude={0.3} className="absolute inset-x-16 inset-y-16">
                <PlaceholderBlock label="front" caption="0.3" size="lg" tone="dark" />
              </ParallaxLayer>
            </div>
          </Container>

          {/* Seção 3: ScrollScene → Bridge-like */}
          <ScrollScene className="my-24">
            {(progress) => {
              const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.2]);
              const scale = useTransform(progress, [0, 1], [0.92, 1.08]);
              return (
                <Container>
                  <motion.div style={{ opacity, scale }}>
                    <PlaceholderBlock
                      label="Bridge"
                      caption="ScrollScene · opacity & scale derived"
                      size="xl"
                      tone="dark"
                    />
                  </motion.div>
                </Container>
              );
            }}
          </ScrollScene>

          {/* Seção 4: StickyStage com 4 "pilares" — Product-like */}
          <StickyStage length="400svh">
            <div className="h-full w-full bg-surface-dark text-white grid place-items-center">
              <div className="text-center space-y-4 px-6 max-w-lg">
                <div className="text-3xl font-medium tracking-tight">Sticky Stage</div>
                <div className="text-sm uppercase tracking-wider opacity-70">
                  length=&quot;400svh&quot; · simula Product 4 pilares
                </div>
                <div className="text-sm text-white/60 mt-4">
                  Em produção (Phase 4), aninha um <code>&lt;ScrollScene&gt;</code> aqui
                  derivando o progress para revelar 4 pilares em sequência.
                </div>
              </div>
            </div>
          </StickyStage>

          <div className="h-svh grid place-items-center text-text-muted">
            <span>fim</span>
          </div>
        </main>
      );
    }
    ```

    **3. Atualizar `src/app/dev/page.tsx`** — preencher a seção "Motion Primitives (Phase 2)" (linhas 96-101) com a nav. Manter resto do arquivo:

    Substituir o bloco:
    ```jsx
    <section className="mt-12 space-y-6">
      <Headline as="h2" size="section">
        Motion Primitives (Phase 2)
      </Headline>
      <p className="text-text-muted">Será populado na Phase 2.</p>
    </section>
    ```

    Por:
    ```jsx
    <section className="mt-12 space-y-6">
      <Headline as="h2" size="section">
        Motion Primitives (Phase 2)
      </Headline>
      <p className="text-text-muted">
        Showcase isolado por primitiva — abra cada link no device-alvo
        (use Vercel preview pra iPhone/Android reais — D-14).
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/dev/reveal",    title: "RevealOnView",  desc: "Fade + slide on viewport entry" },
          { href: "/dev/parallax",  title: "ParallaxLayer", desc: "Translate sutil por scroll" },
          { href: "/dev/sticky",    title: "StickyStage",   desc: "Pin via sticky CSS + svh · RISCO #3" },
          { href: "/dev/textsplit", title: "TextSplit",     desc: "Word desktop / line mobile" },
          { href: "/dev/scene",     title: "ScrollScene",   desc: "Render-prop · MotionValue 0→1" },
          { href: "/dev/all",       title: "all",           desc: "Combinação — interação real" },
        ].map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block rounded-xl border border-border bg-surface-light p-4 hover:bg-surface-tinted transition-colors"
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-text-muted mt-1">{item.desc}</div>
            </a>
          </li>
        ))}
      </ul>
    </section>
    ```

    Notar: usar `<a href>` simples (não `<Link>`) é OK para /dev — não é SPA-critical, e queremos forçar reload entre primitivas pra evitar state leak.
  </action>
  <acceptance_criteria>
    - `test -f src/app/dev/all/page.tsx` exit 0
    - `test -f src/app/dev/all/layout.tsx` exit 0
    - `grep -q "assertDevAccess" src/app/dev/all/layout.tsx`
    - `grep -q "RevealOnView" src/app/dev/all/page.tsx`
    - `grep -q "ParallaxLayer" src/app/dev/all/page.tsx`
    - `grep -q "ScrollScene" src/app/dev/all/page.tsx`
    - `grep -q "TextSplit" src/app/dev/all/page.tsx`
    - `grep -q "StickyStage" src/app/dev/all/page.tsx`
    - `grep -q "/dev/reveal" src/app/dev/page.tsx`
    - `grep -q "/dev/parallax" src/app/dev/page.tsx`
    - `grep -q "/dev/sticky" src/app/dev/page.tsx`
    - `grep -q "/dev/textsplit" src/app/dev/page.tsx`
    - `grep -q "/dev/scene" src/app/dev/page.tsx`
    - `grep -q "/dev/all" src/app/dev/page.tsx`
    - `! grep -q "Será populado na Phase 2" src/app/dev/page.tsx` (placeholder original removido)
    - `npm run build` exit 0
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>/dev/all combina as 5 primitivas, /dev raiz tem nav linkando 6 sub-rotas em cards premium, todos gates aplicados, build passa.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
N/A — pure client-side motion showcase; sem inputs do usuário, sem dados, sem rede além de assets estáticos do próprio Next.js.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-05 | I (Info Disclosure) | /dev sub-routes em Vercel preview público | accept | Previews .vercel.app são noindex (FOUND-11). Conteúdo: placeholder rectangles + texto explicativo de primitivas WIP. Sem dados operacionais, sem credenciais, sem PII. Gate D-15 + assertDevAccess bloqueia produção real. |
</threat_model>

<validation>
## Validação automatizada
1. `npx tsc --noEmit` exit 0
2. `npm run build` exit 0
3. Greps de acceptance_criteria passam (especialmente os negativos: `! grep -E "from \"motion/react\""` nas pages que devem usar barrel)

## Validação manual via Vercel preview (workflow D-14)
- Push deste PR → Vercel gera preview URL
- Em desktop Chrome: abrir `<preview>.vercel.app/dev` → nav cards renderizam premium
- Visitar cada sub-rota:
  - `/dev/reveal` — scrollar; observar reveals; toggle Reduce Motion no DevTools → snap to final
  - `/dev/parallax` — scrollar; observar leve translation; emular mobile no DevTools → off
  - `/dev/sticky` — Stage A pina 200svh, Stage B pina 400svh; pinning libera no fim
  - `/dev/textsplit` — palavras escalonam (desktop), linhas (mobile emulation)
  - `/dev/scene` — placeholder fade-in 0→1 e fade-out conforme scroll
  - `/dev/all` — sequência completa sem bugs, scroll fluido

## REAL-DEVICE (BLOQUEANTE pra fechamento da fase)
- Lenny abre `<preview>.vercel.app/dev/sticky` no iPhone real (iOS 17+) Safari:
  - [ ] Stage A pina exatamente 2 viewports svh, depois libera
  - [ ] Stage B pina exatamente 4 viewports svh, depois libera
  - [ ] SEM jump horizontal
  - [ ] SEM release prematuro
  - [ ] Address bar do iOS recolhe/expande SEM puxar o conteúdo pinado
- Lenny abre mesmo URL no Android mid-tier Chrome:
  - [ ] Mesmos critérios
  - [ ] SEM scroll bouncing despinando
- Lenny abre `<preview>.vercel.app/dev/all` no iPhone real:
  - [ ] Scroll completo da página sem bugs
  - [ ] StickyStage interage corretamente com seções acima/abaixo

## DevTools audit (MOTION-08 verification)
- Em /dev/all, Performance recording de scroll completo:
  - [ ] Nenhum Layout reflow disparado por animação
  - [ ] Apenas Composite Layers mutations no rastro de scroll
  - [ ] FPS ≥ 50 sustentado em scroll mobile-emulated com 4x CPU throttle

## Reduced motion checklist
- macOS Reduce Motion ON → reload `/dev/reveal`, `/dev/textsplit`, `/dev/parallax`:
  - [ ] Reveal: estado final imediato
  - [ ] TextSplit: texto plano sem spans aparecendo um por um
  - [ ] Parallax: zero translation
  - [ ] StickyStage (`/dev/sticky`): sticky preservado (D-09 — estrutura mantida)
</validation>

<success_criteria>
1. 6 sub-rotas funcionais: /dev/reveal, /dev/parallax, /dev/sticky, /dev/textsplit, /dev/scene, /dev/all
2. /dev raiz exibe nav premium linkando as 6 sub-rotas
3. Sub-rotas server importam apenas do barrel `@/components/motion` (exceto /dev/scene e /dev/all que usam `useTransform` direto — exceção controlada documentada)
4. Gate D-15 aplicado em todas via assertDevAccess (raiz, sub-rotas server, layouts server pra sub-rotas client)
5. Build passa, MOTION-08 verificável via DevTools
6. Real-device validation workflow documentado e pronto pra Lenny executar
</success_criteria>

<output>
Após completion, criar `.planning/phases/02-motion-primitives/02-05-SUMMARY.md` documentando:
- 6 sub-rotas + 1 nav consolidada
- Pattern arquitetural: server layout.tsx aplica gate D-15, client page.tsx demonstra primitivas
- Exceção controlada para `useTransform` em /dev/scene e /dev/all (preview da exceção que seções da Phase 4 usarão dentro de render prop de ScrollScene)
- Checklist real-device pronta — Lenny abre preview no iPhone/Android e roda critérios listados em validation block
- Próximo plano: P06 — README.md + freeze final + dispositivos validados registrados
</output>
