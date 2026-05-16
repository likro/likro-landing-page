# Motion Primitives

Biblioteca isolada de 5 primitivas de motion da Likro Landing Page.
**API CONGELADA** após Phase 2 (MOTION-06).

## Política de mudanças (D-16)

Mudanças na API exportada por este módulo exigem:

1. PR com label `motion-api-change`
2. Aprovação explícita do Lenny no PR
3. Atualização deste README e dos JSDocs `@frozen` correspondentes

Sem ESLint custom rule por escolha consciente (Phase 1 D-15: overhead sem retorno comprovado em time pequeno). A disciplina vem de revisão humana + os 3 mecanismos de freeze: barrel (`index.ts`) + tipos exportados (`*Props`) + headers `@frozen` em cada arquivo.

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
import { motion } from "motion/react";                                     // ❌ direto
import { RevealOnView } from "@/components/motion/reveal-on-view";         // ❌ path interno
import { useLineGrouping } from "@/components/motion/internal/use-line-grouping"; // ❌ internal
```

**Exceção controlada (MOTION-05 + D-02):**

Dentro do render prop de `<ScrollScene>`, seções PODEM importar `useTransform` (e `motion.<tag>` para wrappar elementos) de `motion/react` — para derivar sub-ranges do `progress: MotionValue<number>` recebido.

```tsx
"use client";
import { useTransform, motion } from "motion/react"; // permitido APENAS para isto
import { ScrollScene } from "@/components/motion";

export function BridgeSection() {
  return (
    <ScrollScene>
      {(progress) => {
        const opacity = useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.2]);
        const scale = useTransform(progress, [0, 1], [0.92, 1.08]);
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

- Ignorar e renderizar estado final → tratamento explícito do reduced.
- Confiar no `<MotionConfig reducedMotion="user">` global (presente desde Phase 1) — `motion.*` respeita o flag automaticamente.

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

**Trade-off explícito (D-07):** apenas `svh` é aceito (template literal type bloqueia `vh` e `dvh` em compile-time). Pequena perda de espaço vertical quando address bar do iOS recolhe, em troca de pin absolutamente estável.

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

Real-device validation executada via Vercel preview da branch `phase-02-validation` em 2026-05-16. Critério `StickyStage OK?` = pin segura ao rolar, sem release prematuro, sem jump horizontal, sem chacoalhar quando address bar do iOS recolhe/expande.

| Device | OS / Version | Browser | StickyStage OK? | All primitives OK? |
|---|---|---|---|---|
| iPhone 15 | iOS 26 (latest) | Safari | ✓ | ✓ |
| Desktop (Windows 11) | Windows 11 | Chrome | ✓ | ✓ |

### Cobertura pendente

| Device / Surface | Justificativa | Trigger pra fechar |
|---|---|---|
| Android real (mid-tier, Chrome) | Sem device disponível no momento da validação | Validar antes de Phase 3 começar a usar `<StickyStage>` em seção real |
| macOS Safari | Sem máquina Mac disponível | Validar antes do lançamento público |
| Firefox / Edge desktop | Não testado | Validar antes do lançamento público |
| `prefers-reduced-motion: reduce` | Não testado em device real | Validar quando rodar Lighthouse a11y na Phase 3+ |

### Notas de polish diferido

- **`/dev/sticky` Stage B (showcase do composto `StickyStage + ScrollScene`):** o exemplo atual (4 facets cross-fade — Captura / Atendimento / Conversão / Operação) prova o **padrão técnico** mas não é o visual final. Refinamento real (typography, hierarquia, atmosfera, ritmo das transições) é responsabilidade da Phase 3+ quando seções reais precisarem desse composto com copy e design system aplicados. Status: técnico ✓, visual de showcase **aceito como demonstrativo, não final**.

## Internals (não exportado)

Co-locado em `src/components/motion/internal/`. Imports daqui APENAS por arquivos dentro de `src/components/motion/`.

- `easing.ts` — `MOTION_EASING` (`cubic-bezier(0.16, 1, 0.3, 1)`) + `REVEAL_DURATION_MS`
- `use-scroll-progress-in-range.ts` — wrappa `motion/react` `useScroll` com defaults (D-03)
- `use-line-grouping.ts` — agrupa spans-palavras em linhas via `offsetTop` + resize debounce 150ms

## Property guarantee (MOTION-08)

Todas as 5 primitivas animam APENAS `transform` (translateY, translateX, scale) e `opacity`. Zero `width`, `height`, `top`, `left`, ou qualquer propriedade que dispare layout. Verificável via grep negativo no CI:

```bash
! grep -nE "(width|height|top|left): " src/components/motion/{reveal-on-view,parallax-layer,scroll-scene,text-split,sticky-stage}.tsx
```

(`top-0` Tailwind class no StickyStage é layout estático posicional do sticky, não animação — fica fora do grep acima por usar `-` em vez de `: `.)
