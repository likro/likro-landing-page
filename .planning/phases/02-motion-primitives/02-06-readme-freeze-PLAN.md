---
phase: 02-motion-primitives
plan: 06
type: execute
wave: 4
depends_on: [05]
files_modified:
  - src/components/motion/README.md
  - src/components/motion/index.ts
  - src/components/motion/reveal-on-view.tsx
  - src/components/motion/parallax-layer.tsx
  - src/components/motion/scroll-scene.tsx
  - src/components/motion/text-split.tsx
  - src/components/motion/sticky-stage.tsx
requirements:
  - MOTION-06
  - MOTION-07
  - MOTION-08
autonomous: false
must_haves:
  truths:
    - "Arquivo `src/components/motion/README.md` existe e documenta as 5 primitivas com tabela de props, defaults por tier, exemplo mínimo e comportamento em reduced (D-17)"
    - "README registra a política de freeze: mudanças exigem PR `motion-api-change` + aprovação Lenny (D-16)"
    - "README registra a regra `consumidores nunca importam motion/react direto` + exceção controlada de useTransform dentro de render prop de ScrollScene (MOTION-05)"
    - "README contém matriz de dispositivos validados (devices reais + browsers desktop, modelos e versões testadas)"
    - "Cabeçalho `@frozen` presente em todos os 5 arquivos de primitiva + no barrel"
    - "Checkpoint humano executado: Lenny abre Vercel preview e roda critérios real-device do Plan 05 — registra resultados no PR"
  artifacts:
    - path: "src/components/motion/README.md"
      provides: "Contrato técnico completo das primitivas (D-17)"
      min_lines: 120
    - path: "Headers @frozen confirmados em 5 primitivas + barrel"
      provides: "Camada 3 do freeze enforcement (D-16)"
  key_links:
    - from: "src/components/motion/README.md"
      to: "src/components/motion/index.ts"
      via: "README cita o barrel como único import path"
      pattern: "@/components/motion"
    - from: "README freeze policy"
      to: "PR label motion-api-change"
      via: "instrução explícita"
      pattern: "motion-api-change"
---

<objective>
Fechar a Phase 2 com a **documentação congelada da API**: criar `src/components/motion/README.md` (D-17) completo + auditar que todos os arquivos de primitiva têm header `@frozen` (D-16 camada 3) + executar o checkpoint de validação real-device em Vercel preview com Lenny + registrar dispositivos validados no README.

Este plano é a única `autonomous: false` da fase porque finaliza com checkpoint humano:
- Lenny abre o preview no iPhone real + Android real
- Roda os critérios documentados no Plan 04 + Plan 05 validation blocks
- Reporta resultados — esses resultados viram a seção "Validated Devices" do README

Purpose: MOTION-06 obriga API congelada documentada. Sem este plano, a fase tecnicamente compila mas não cumpre o success criteria #3 do roadmap (API documentada + congelada). Sem o checkpoint real-device, RISCO CRÍTICO #3 não é mitigado de fato — apenas no papel.

Output: README.md de ~150 linhas, headers `@frozen` auditados, dispositivos validados registrados, fase fechada.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-motion-primitives/02-CONTEXT.md
@.planning/phases/02-motion-primitives/02-04-stickystage-PLAN.md
@.planning/phases/02-motion-primitives/02-05-showcase-dev-routes-PLAN.md
@src/components/motion/index.ts
@src/components/motion/reveal-on-view.tsx
@src/components/motion/parallax-layer.tsx
@src/components/motion/scroll-scene.tsx
@src/components/motion/text-split.tsx
@src/components/motion/sticky-stage.tsx
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Auditar headers `@frozen` em todos os 5 arquivos de primitiva + barrel</name>
  <files>
    src/components/motion/reveal-on-view.tsx,
    src/components/motion/parallax-layer.tsx,
    src/components/motion/scroll-scene.tsx,
    src/components/motion/text-split.tsx,
    src/components/motion/sticky-stage.tsx,
    src/components/motion/index.ts
  </files>
  <read_first>
    - src/components/motion/index.ts
    - src/components/motion/reveal-on-view.tsx
    - src/components/motion/parallax-layer.tsx
    - src/components/motion/scroll-scene.tsx
    - src/components/motion/text-split.tsx
    - src/components/motion/sticky-stage.tsx
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-16" (3 camadas de freeze; @frozen é a 3ª)
  </read_first>
  <action>
    **Auditar** cada arquivo. Se algum estiver faltando o header `@frozen` ou a política curta, **adicionar/normalizar**. Plans 02-04 já instruem adicionar `@frozen` — esta task é safety net + normalização do conteúdo.

    **Padrão de header normalizado** (aplicar a todos os 5 arquivos de primitiva):

    Top do arquivo (após `"use client";` se houver), JSDoc inclui pelo menos:
    ```
    /**
     * @frozen — <Nome>Primitive (MOTION-XX).
     * <descrição existente do componente>
     *
     * Política de mudanças (D-16):
     *   Mudanças na API exigem PR com label `motion-api-change`
     *   e aprovação explícita do Lenny.
     */
    ```

    **Auditoria por arquivo:**

    1. `reveal-on-view.tsx` (MOTION-01) — verificar `@frozen` + política presentes
    2. `parallax-layer.tsx` (MOTION-02) — idem
    3. `scroll-scene.tsx` (MOTION-05) — idem
    4. `text-split.tsx` (MOTION-04) — idem
    5. `sticky-stage.tsx` (MOTION-03) — idem
    6. `index.ts` (MOTION-06) — `@frozen` no header já presente desde Plan 01; verificar e manter

    **Se algum arquivo estiver com header divergente**, normalizar SEM mudar a implementação (apenas o bloco JSDoc top).

    **Importante:** não modificar a API exportada nem o comportamento — esta task é estritamente documentação/conformance.
  </action>
  <acceptance_criteria>
    - `grep -c "@frozen" src/components/motion/reveal-on-view.tsx` ≥ 1
    - `grep -c "@frozen" src/components/motion/parallax-layer.tsx` ≥ 1
    - `grep -c "@frozen" src/components/motion/scroll-scene.tsx` ≥ 1
    - `grep -c "@frozen" src/components/motion/text-split.tsx` ≥ 1
    - `grep -c "@frozen" src/components/motion/sticky-stage.tsx` ≥ 1
    - `grep -c "@frozen" src/components/motion/index.ts` ≥ 1
    - `grep -q "motion-api-change" src/components/motion/reveal-on-view.tsx`
    - `grep -q "motion-api-change" src/components/motion/parallax-layer.tsx`
    - `grep -q "motion-api-change" src/components/motion/scroll-scene.tsx`
    - `grep -q "motion-api-change" src/components/motion/text-split.tsx`
    - `grep -q "motion-api-change" src/components/motion/sticky-stage.tsx`
    - `grep -q "motion-api-change" src/components/motion/index.ts`
    - `npm run build` exit 0 (nenhuma mudança quebrou)
  </acceptance_criteria>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>5 primitivas + barrel todos com header @frozen + política motion-api-change; nada na API/implementação muda; build passa.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Criar `src/components/motion/README.md` completo (D-17)</name>
  <files>src/components/motion/README.md</files>
  <read_first>
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-17" (estrutura mandatória do README)
    - .planning/phases/02-motion-primitives/02-CONTEXT.md §"D-10, D-11, D-12" (defaults por tier — tabelas)
    - src/components/motion/index.ts (lista oficial de exports)
    - Todas as 5 primitivas (assinaturas reais a documentar)
    - .planning/phases/02-motion-primitives/02-05-showcase-dev-routes-PLAN.md (sub-rotas para citar como referência viva)
  </read_first>
  <action>
    Criar `src/components/motion/README.md`. Estrutura completa abaixo. **Não pular sections** — README é contrato.

    Conteúdo do README.md:

    ```markdown
    # Motion Primitives

    Biblioteca isolada de 5 primitivas de motion da Likro Landing Page.
    **API CONGELADA** após Phase 2 (MOTION-06).

    ## Política de mudanças (D-16)

    Mudanças na API exportada por este módulo exigem:
    1. PR com label `motion-api-change`
    2. Aprovação explícita do Lenny no PR
    3. Atualização deste README e dos JSDocs `@frozen` correspondentes

    Sem ESLint custom rule por escolha consciente (Phase 1 D-15: overhead sem retorno comprovado em time pequeno). A disciplina vem de revisão humana + os 3 mecanismos de freeze (barrel + tipos + headers `@frozen`).

    ## Regra de import (MOTION-05)

    **Consumidores (seções, atoms, UI) importam SOMENTE deste barrel:**

    ```typescript
    import {
      RevealOnView,
      ParallaxLayer,
      ScrollScene,
      TextSplit,
      StickyStage,
    } from "@/components/motion";
    ```

    **Proibido:**
    ```typescript
    import { motion } from "motion/react";              // ❌ direto
    import { RevealOnView } from "@/components/motion/reveal-on-view"; // ❌ path interno
    import { useLineGrouping } from "@/components/motion/internal/use-line-grouping"; // ❌ internal
    ```

    **Exceção controlada (MOTION-05 + D-02):**

    Dentro do render prop de `<ScrollScene>`, seções PODEM importar `useTransform` (e somente `useTransform` ou `motion.<tag>` para wrappar elementos) de `motion/react` — para derivar sub-ranges do `progress: MotionValue<number>` recebido.

    ```typescript
    "use client";
    import { useTransform, motion } from "motion/react"; // permitido APENAS para isto
    import { ScrollScene } from "@/components/motion";

    export function BridgeSection() {
      return (
        <ScrollScene>
          {(progress) => {
            const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.2]);
            const scale   = useTransform(progress, [0, 1], [0.92, 1.08]);
            return <motion.div style={{ opacity, scale }}>{/* ... */}</motion.div>;
          }}
        </ScrollScene>
      );
    }
    ```

    Esta exceção é o que torna `<ScrollScene>` o boundary GSAP-future-ready: o caller continua o mesmo se o interior do ScrollScene for migrado para GSAP no futuro (V2-MOTION-01).

    ## Primitivas

    ### `<RevealOnView>` (MOTION-01)

    Fade + slide-up no primeiro viewport entry. Adaptativo por `useDeviceTier()`.

    **Props:**

    | Prop | Tipo | Default | Descrição |
    |---|---|---|---|
    | `children` | `ReactNode` | — | Conteúdo a revelar |
    | `delayMs` | `number` | `0` | Atraso para composição manual de stagger |
    | `as` | `"div" \| "section" \| "li" \| "span" \| "article"` | `"div"` | Tag DOM |
    | `className` | `string` | — | className passthrough |
    | `amount` | `number` | `0.2` | Threshold do `whileInView` |
    | `repeat` | `boolean` | `false` | Re-anima ao re-entrar |

    **Defaults por tier (D-10):**

    | Tier | Distance | Duration | Stagger (guidance) |
    |---|---|---|---|
    | mobile | 12 px | 400 ms | 60 ms |
    | tablet | 16 px | 500 ms | 70 ms |
    | desktop | 24 px | 600 ms | 80 ms |
    | reduced | snap to final, sem motion wrapper | — | — |

    **Stagger:** composição manual via `delayMs` em filhos múltiplos:

    ```tsx
    <RevealOnView delayMs={0}><Card /></RevealOnView>
    <RevealOnView delayMs={80}><Card /></RevealOnView>
    <RevealOnView delayMs={160}><Card /></RevealOnView>
    ```

    **Reduced motion:** render direto `<Tag>{children}</Tag>` sem wrapper de motion.

    Demo: `/dev/reveal`.

    ---

    ### `<ParallaxLayer>` (MOTION-02)

    TranslateY sutil derivado de scroll progress da seção.

    **Props:**

    | Prop | Tipo | Default | Descrição |
    |---|---|---|---|
    | `children` | `ReactNode` | — | Conteúdo |
    | `magnitude` | `number` | `0.2` | Magnitude relativa |
    | `className` | `string` | — | className passthrough |

    **Magnitudes por tier (D-11):**

    | Tier | Multiplier efetivo | Notas |
    |---|---|---|
    | mobile | `0` | OFF — REQ MOTION-02 obriga |
    | tablet | `0.5 ×` | leve |
    | desktop | `1.0 ×` | médio |
    | reduced | `0` | OFF |

    Range: progress `0→1` → translateY de `+magnitude×100px` a `-magnitude×100px`.
    Para `magnitude=0.2` em desktop → 20px máx (subliminal, "premium editorial").

    **Reduced motion:** render `<div>` (sem motion) com children — translateY=0 implícito.

    Demo: `/dev/parallax`.

    ---

    ### `<ScrollScene>` (MOTION-05) — **boundary GSAP-future-ready**

    Render prop expondo `MotionValue<number>` 0→1 da seção no viewport. **Contrato mais crítico da fase.**

    **Props:**

    | Prop | Tipo | Default | Descrição |
    |---|---|---|---|
    | `children` | `(progress: MotionValue<number>) => ReactNode` | — | Render prop (D-01) |
    | `offset` | `[string, string]` | `["start end", "end start"]` | Range Framer Motion useScroll (D-03) |
    | `className` | `string` | — | className do wrapper |
    | `as` | `"section" \| "div" \| "article"` | `"section"` | Tag DOM do wrapper |

    **Exemplo Bridge-like:**

    ```tsx
    <ScrollScene>
      {(progress) => {
        const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.2]);
        const scale = useTransform(progress, [0, 1], [0.92, 1.08]);
        return <motion.div style={{ opacity, scale }}>...</motion.div>;
      }}
    </ScrollScene>
    ```

    **Reduced motion:** ScrollScene continua emitindo `progress`. O caller decide:
    - Ignorar e renderizar estado final → tratamento explícito do reduced
    - Confiar no `<MotionConfig reducedMotion="user">` global (presente desde Phase 1) — motion.* respeita o flag automaticamente

    Demo: `/dev/scene`.

    ---

    ### `<TextSplit>` (MOTION-04)

    Reveal de headlines por palavra (desktop) ou linha (mobile/tablet).

    **Props:**

    | Prop | Tipo | Default | Descrição |
    |---|---|---|---|
    | `text` | `string` | — | Texto (string simples, sem HTML) |
    | `as` | `"h1" .. "h6" \| "p" \| "span"` | `"h2"` | Tag DOM |
    | `className` | `string` | — | className passthrough |
    | `delayMs` | `number` | `0` | Atraso start global |
    | `amount` | `number` | `0.4` | Threshold viewport |

    **Granularidade por tier (D-12):**

    | Tier | Granularidade | Stagger |
    |---|---|---|
    | mobile | linha | 80 ms |
    | tablet | linha | 80 ms |
    | desktop | palavra | 25 ms |
    | reduced | instant — render direto sem spans | — |

    **A11y:** wrapper recebe `aria-label={text}`; spans de palavra recebem `aria-hidden="true"`. Screen readers leem a frase completa.

    Demo: `/dev/textsplit`.

    ---

    ### `<StickyStage>` (MOTION-03) — **RISCO CRÍTICO mitigado**

    Pin estrutural via `position: sticky` CSS nativo + `svh` exclusivo. Zero acoplamento com Lenis (D-08).

    **Props:**

    | Prop | Tipo | Default | Descrição |
    |---|---|---|---|
    | `children` | `ReactNode` | — | Stage pinado (recomendado: 1 filho) |
    | `length` | `` `${number}svh` `` | — | **Obrigatória.** Duração do pin em svh (D-06, D-07) |
    | `className` | `string` | — | className do wrapper externo |

    **Trade-off explícito (D-07):** apenas `svh` é aceito (template literal type compile-time bloqueia `vh` e `dvh`). Pequena perda de espaço vertical quando address bar do iOS recolhe, em troca de pin absolutamente estável.

    **Reduced motion (D-09):** sticky CSS preservado (estrutura). Conteúdo aninhado (ScrollScene, ParallaxLayer, TextSplit) trata reduced internamente.

    **Exemplo Product-like (4 pilares):**

    ```tsx
    <StickyStage length="400svh">
      <ScrollScene offset={["start start", "end end"]}>
        {(progress) => {
          // derive 4 reveals from progress sub-ranges
        }}
      </ScrollScene>
    </StickyStage>
    ```

    Demo: `/dev/sticky`.

    ## Validated Devices

    Lista preenchida pelo Task 3 (checkpoint humano).

    | Device | OS / Version | Browser | StickyStage OK? | All primitives OK? |
    |---|---|---|---|---|
    | _(a preencher)_ | | | | |

    ## Internals (não exportado)

    Co-locado em `src/components/motion/internal/`. Imports daqui APENAS por arquivos dentro de `src/components/motion/`.

    - `easing.ts` — `MOTION_EASING` (`cubic-bezier(0.16, 1, 0.3, 1)`) + `REVEAL_DURATION_MS`
    - `use-scroll-progress-in-range.ts` — wrappa `motion/react` useScroll com defaults (D-03)
    - `use-line-grouping.ts` — agrupa spans-palavras em linhas via `offsetTop` + resize debounce 150ms

    ## Property guarantee (MOTION-08)

    Todas as 5 primitivas animam APENAS `transform` (translateY, translateX, scale) e `opacity`. Zero `width`, `height`, `top`, `left`, ou qualquer propriedade que dispare layout. Verificável via grep negativo no CI:

    ```bash
    ! grep -nE "(width|height|top|left): " src/components/motion/{reveal-on-view,parallax-layer,scroll-scene,text-split,sticky-stage}.tsx
    ```

    (`top-0` Tailwind class no StickyStage é OK — é layout estático posicional do sticky, não animação.)
    ```

    Notas finais sobre o conteúdo:

    1. **Tabela "Validated Devices" começa vazia** — Task 3 (checkpoint) preenche.
    2. **NÃO incluir** seções "Versionamento" ou "Roadmap futuro" — fora do escopo D-17 e geram drift.
    3. **Tom:** técnico, direto, premium — match com o estilo de copy do projeto. SEM "Welcome to motion primitives!", SEM emojis.
  </action>
  <acceptance_criteria>
    - `test -f src/components/motion/README.md` exit 0
    - `wc -l src/components/motion/README.md | awk '{print $1}'` ≥ 120
    - `grep -q "RevealOnView" src/components/motion/README.md`
    - `grep -q "ParallaxLayer" src/components/motion/README.md`
    - `grep -q "ScrollScene" src/components/motion/README.md`
    - `grep -q "TextSplit" src/components/motion/README.md`
    - `grep -q "StickyStage" src/components/motion/README.md`
    - `grep -q "motion-api-change" src/components/motion/README.md`
    - `grep -q "Validated Devices" src/components/motion/README.md`
    - `grep -q "MOTION-08" src/components/motion/README.md`
    - `grep -q "Exceção controlada" src/components/motion/README.md`
    - `grep -q "cubic-bezier(0.16, 1, 0.3, 1)" src/components/motion/README.md`
    - `grep -q "@/components/motion" src/components/motion/README.md`
  </acceptance_criteria>
  <verify>
    <automated>test -f src/components/motion/README.md && wc -l src/components/motion/README.md</automated>
  </verify>
  <done>README.md de ~120-180 linhas existindo com todas as sections obrigatórias D-17, tabelas de props, defaults por tier, política de freeze, exceção de useTransform, regra de import; Validated Devices placeholder.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: CHECKPOINT — Lenny valida primitivas em iPhone real + Android real + preenche Validated Devices</name>
  <files>src/components/motion/README.md</files>
  <action>Após Tasks 1 e 2 mergeadas e Vercel preview gerado, Lenny executa o protocolo descrito em &lt;how-to-verify&gt; em iPhone real, Android real e desktop (3 browsers). Em seguida edita src/components/motion/README.md preenchendo a tabela "Validated Devices" com os modelos/OS/browser efetivamente testados (NÃO inventar). Critério de aceitação real-device é o do Plan 04 + Plan 05 validation blocks.</action>
  <what-built>
    5 primitivas de motion (`<RevealOnView>`, `<ParallaxLayer>`, `<ScrollScene>`, `<TextSplit>`, `<StickyStage>`) com showcase em `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`, `/dev/all` — disponíveis no Vercel preview deste PR.
  </what-built>
  <how-to-verify>
    **Antes de iniciar:** confirme que o Vercel preview do PR atual está pronto (Vercel comment no PR com o URL `.vercel.app`).

    ## Em iPhone real (iOS 17+, Safari)

    1. Abrir `<preview>.vercel.app/dev` → nav cards carregam premium
    2. Abrir `<preview>.vercel.app/dev/sticky`:
       - Scrollar até Stage A → deve pinar exatamente 2 viewports svh, então liberar
       - Continuar até Stage B → deve pinar 4 viewports svh, então liberar
       - **Address bar do Safari recolhendo/expandindo: o conteúdo pinado NÃO deve pular**
       - **Sem release prematuro**
       - **Sem jump horizontal**
    3. Abrir `<preview>.vercel.app/dev/reveal`:
       - Scrollar — placeholders entram com fade+slide
    4. Abrir `<preview>.vercel.app/dev/textsplit`:
       - Headline deve revelar por LINHA (não palavra) — mobile tier
    5. Abrir `<preview>.vercel.app/dev/parallax`:
       - Placeholders devem ficar ESTÁTICOS (sem translation) — mobile=0 (D-11)
    6. Abrir `<preview>.vercel.app/dev/scene` e `/dev/all`:
       - Scroll fluido, sem bugs

    ## Em Android real (mid-tier, Chrome)

    Mesmos passos. Foco no `/dev/sticky` (RISCO CRÍTICO #3).

    ## Desktop

    1. macOS Safari + Chrome + Firefox: percorrer as 6 sub-rotas
    2. macOS: System Settings → Accessibility → Display → Reduce Motion ON → reload:
       - `/dev/reveal`: snap to final
       - `/dev/textsplit`: texto plano sem spans
       - `/dev/parallax`: zero translation
       - `/dev/sticky`: sticky preservado (estrutura — D-09)
    3. DevTools Performance recording em `/dev/all` scroll completo:
       - Confirmar Composite Layers only, zero Layout reflow disparado por animação

    ## Após validação

    Editar `src/components/motion/README.md` seção **"Validated Devices"** preenchendo a tabela com os devices testados, ex:

    ```markdown
    | Device | OS / Version | Browser | StickyStage OK? | All primitives OK? |
    |---|---|---|---|---|
    | iPhone 14 Pro | iOS 17.4 | Safari | ✓ | ✓ |
    | Pixel 7 | Android 14 | Chrome 124 | ✓ | ✓ |
    | MacBook Pro M2 | macOS 14.5 | Safari 17.4 | ✓ | ✓ |
    | MacBook Pro M2 | macOS 14.5 | Chrome 124 | ✓ | ✓ |
    | MacBook Pro M2 | macOS 14.5 | Firefox 125 | ✓ | ✓ |
    ```

    Se algum critério FALHAR:
    - Documentar comportamento exato + device no comment do PR
    - Decidir: ajuste local na primitiva (acrescentar coordenação Lenis empiricamente — D-08 permite caso real) OU split em sub-issue posterior
    - Atualizar este checkpoint após resolver
  </how-to-verify>
  <verify>
    <automated>grep -E "^\| (iPhone|iPad|Pixel|Android|MacBook|Windows|Linux)" src/components/motion/README.md</automated>
  </verify>
  <done>Tabela "Validated Devices" no README contém pelo menos 1 iPhone real + 1 Android real + 3 desktop browsers, todos com resultado ✓; Lenny commentou "approved" no PR.</done>
  <resume-signal>
    Comente "approved" no PR após preencher Validated Devices E todos critérios passarem. Se houver falhas, descreva-as e Claude itera no fix.
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries
N/A — documentação + auditoria de headers. Sem código novo executável.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-06 | N/A | README.md + JSDoc audits | accept | Apenas markdown e JSDocs, nenhuma execução. Risco zero. |
</threat_model>

<validation>
## Validação automatizada
1. `npm run build` exit 0 (sanity após audit Task 1)
2. Greps de acceptance_criteria passam (especialmente README sections obrigatórias)
3. `wc -l src/components/motion/README.md` ≥ 120

## Validação manual (checkpoint humano — Task 3 é gate da fase)
Ver Task 3 — workflow completo em iPhone/Android/desktop + reduced motion + DevTools audit.

## Reduced motion (cobertura completa — última verificação da fase)
- macOS Reduce Motion ON em todas as 6 sub-rotas: comportamentos esperados conferem com Plan 05 validation block
- Windows Animations OFF: idem

## API freeze (camadas 1+2+3 verificadas)
1. **Barrel** (`index.ts`) — único import path documentado no README + `@frozen` header
2. **Tipos exportados** — `RevealOnViewProps`, `ParallaxLayerProps`, `ScrollSceneProps`, `TextSplitProps`, `StickyStageProps` — todos no barrel
3. **Headers `@frozen`** — auditados em Task 1
</validation>

<success_criteria>
1. README.md existe, ≥120 linhas, todas as seções D-17 presentes
2. Tabela "Validated Devices" preenchida com mínimo 2 reais (iPhone + Android) + 3 desktop browsers
3. Todos os 5 arquivos de primitiva + barrel têm header `@frozen` + referência a `motion-api-change`
4. Critérios real-device do `/dev/sticky` passam em iPhone real E Android real
5. Reduced motion verificado em todas as 6 sub-rotas
6. DevTools Performance recording em `/dev/all` confirma MOTION-08 (transform/opacity only)
7. Lenny aprovou o PR via comment "approved"
</success_criteria>

<output>
Após completion (incluindo checkpoint), criar `.planning/phases/02-motion-primitives/02-06-SUMMARY.md` documentando:
- README.md final entregue (link interno: `src/components/motion/README.md`)
- 3 camadas de freeze ativas e auditadas
- Devices validados em real-device (lista da tabela)
- RISCO CRÍTICO #3 (Lenis + sticky iOS) mitigado de fato — registrado nos resultados
- Fase 2 fechada — próxima: `/gsd-plan-phase 3` (Hero benchmarked isolado)
</output>
