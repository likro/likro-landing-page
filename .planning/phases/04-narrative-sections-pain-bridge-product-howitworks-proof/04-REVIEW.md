---
phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
reviewed: 2026-05-18T00:00:00Z
depth: standard
files_reviewed: 41
files_reviewed_list:
  - docs/copy-review.md
  - src/app/page.tsx
  - src/content/bridge.ts
  - src/content/glossary.ts
  - src/content/how-it-works.ts
  - src/content/pain.ts
  - src/content/product.ts
  - src/content/proof.ts
  - src/hooks/use-in-view.ts
  - src/sections/Bridge/BridgeStatement.tsx
  - src/sections/Bridge/index.tsx
  - src/sections/HowItWorks/HowItWorksHeader.tsx
  - src/sections/HowItWorks/HowItWorksMiniMockup.tsx
  - src/sections/HowItWorks/HowItWorksStep.tsx
  - src/sections/HowItWorks/index.tsx
  - src/sections/Pain/PainBackground.tsx
  - src/sections/Pain/PainCard.tsx
  - src/sections/Pain/PainCardConstellation.tsx
  - src/sections/Pain/PainStatement.tsx
  - src/sections/Pain/index.tsx
  - src/sections/Product/ProductHeader.tsx
  - src/sections/Product/ProductHeroFeature.tsx
  - src/sections/Product/ProductHeroFeatureMockup.tsx
  - src/sections/Product/ProductSecondaryCard.tsx
  - src/sections/Product/ProductSecondaryGrid.tsx
  - src/sections/Product/index.tsx
  - src/sections/Proof/ProofBackground.tsx
  - src/sections/Proof/ProofCategories.tsx
  - src/sections/Proof/index.tsx
  - tests/content/bridge.test.ts
  - tests/content/how-it-works.test.ts
  - tests/content/pain.test.ts
  - tests/content/product.test.ts
  - tests/content/proof.test.ts
  - tests/hooks/use-in-view.test.ts
  - tests/landing/coherence.test.ts
  - tests/sections/bridge-invariants.test.ts
  - tests/sections/how-it-works-invariants.test.ts
  - tests/sections/pain-invariants.test.ts
  - tests/sections/product-invariants.test.ts
  - tests/sections/proof-invariants.test.ts
findings:
  critical: 0
  warning: 3
  info: 5
  total: 8
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-18
**Depth:** standard
**Files Reviewed:** 41
**Status:** issues_found

## Summary

Revisão das 5 seções narrativas da Phase 4 (Pain → Bridge → Product → HowItWorks → Proof) cobrindo: 7 módulos de copy (`src/content/*`), 1 hook IO (`useInView`), 18 componentes de seção e 12 arquivos de teste.

Avaliação geral: **código sólido, sem bugs críticos nem brechas de segurança.** A arquitetura respeita as decisões fundamentais da fase (D-13/D-15/D-17/D-20.1/D-26/D-27/NARR-06): copy 100% em `src/content/*`, zero motion lib em narrative sections, animações CSS-only via keyframes Phase 3, SSR-safe `useInView`, tokens de brand consistentes. Os 8 findings são todos de qualidade/manutenibilidade — nada bloqueia merge.

Pontos de atenção (todos Warning ou Info):

- **WR-01**: `HowItWorksStep` posiciona o connector vertical com `top-20` fixo, o que assume altura específica do número grande — pode quebrar visualmente se o número rolar (raro, mas mobile-first o connector é desktop-only então o risco é contido).
- **WR-02**: `ProductHeroFeatureMockup:121` tem string PT-BR hardcoded ("DISTRIBUIÇÃO"/"ATRIBUIÇÃO") com lógica condicional baseada no nome literal `"Marina"` — viola COPY-01 (todo PT-BR em content) e cria acoplamento frágil ao valor mock.
- **WR-03**: `ProductHeroFeatureMockup:139` tem string `AGENDADO` hardcoded inline — mesma classe de problema.
- **IN-01..05**: melhorias de manutenibilidade (eyebrows em `as const` array já acessível, `prefers-reduced-motion` listener não-reativo, magic numbers de stagger duplicados entre seções, etc.).

Nenhum desses findings é gate de merge. O conjunto está pronto.

## Critical Issues

_Nenhum._

## Warnings

### WR-01: Connector vertical do HowItWorksStep usa `top-20` absoluto, frágil a mudanças de tamanho do número

**File:** `src/sections/HowItWorks/HowItWorksStep.tsx:60-63`
**Issue:** O divider vertical entre steps no desktop é posicionado com `top-20` (80px) fixo, partindo da base do número grande (`lg:text-7xl` = 4.5rem ≈ 72px + leading). Se a tipografia do número mudar (ou se o `lg:text-7xl` virar `text-8xl`), o connector vai descolar do número (gap visual ou sobreposição). Além disso, o `left-12` parte do mesmo cálculo arbitrário (largura da coluna do número `lg:w-32` = 128px / centro ≈ 64px, mas o código usa `left-12` = 48px). Visualmente funciona hoje, mas é alinhamento por coincidência.

**Fix:** Trocar para alinhamento relativo ao próprio número, e.g. usando um pseudo-element no `<div>` que envolve o número, ou um wrapper flex com gap controlado. Alternativa mais barata: documentar a dependência via comentário explícito acima do connector (`// left-12/top-20 alinham com o número text-7xl lg:w-32 — atualizar juntos`). Hoje o teste de invariantes não cobre esse alinhamento.

```tsx
// Opção A — connector vira filho do div do número, ancorado:
<div className="relative w-24 shrink-0 lg:w-32">
  <div className="font-mono text-5xl ...">{step.number}</div>
  {!isLast && (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-full hidden h-[calc(100%+theme(spacing.10))] w-px -translate-x-1/2 bg-neutral-200 lg:block"
    />
  )}
</div>
```

---

### WR-02: `ProductHeroFeatureMockup` hardcoda PT-BR + condicional baseado em valor mock (`from === "Marina"`)

**File:** `src/sections/Product/ProductHeroFeatureMockup.tsx:121`
**Issue:** A linha

```tsx
{mockup.overlayRouting.from === "Marina" ? "DISTRIBUIÇÃO" : "ATRIBUIÇÃO"}
```

tem dois problemas concatenados:

1. **Violação de COPY-01** (PT-BR hardcoded em JSX) — as palavras "DISTRIBUIÇÃO" e "ATRIBUIÇÃO" estão direto no JSX, sem virem de `PRODUCT_COPY`. Os testes de invariante (`product-invariants.test.ts` Test 5) provavelmente passam porque o regex `HARDCODED_PT_ACCENTED` só dispara em texto entre `>` e `</` (estes strings estão dentro de uma ternária JSX-expression `{...}`, escapam do regex).
2. **Acoplamento frágil ao mock** — a ternária assume que o nome "Marina" é canônico do mock e troca o label se alguém editar o nome para qualquer outra string. Lenny edita `SHARED_OVERLAY_ROUTING = { from: "Marina", to: "Dra. Camila" }` para "Carla", e a copy do overlay mudaria silenciosamente para "ATRIBUIÇÃO" sem nenhum sinal de revisão.

**Fix:** Mover o label para o content module e referenciar como dado, não como lógica derivada.

```tsx
// src/content/product.ts — adicionar campo em mockup
mockup: {
  // ... existing
  overlayRouting: {
    label: "DISTRIBUIÇÃO", // ou "ATRIBUIÇÃO" — escolha do Lenny via copy review
    from: "Marina",
    to: "Dra. Camila",
  },
}

// ProductHeroFeatureMockup.tsx:121
<div className="text-[10px] ...">
  {mockup.overlayRouting.label}
</div>
```

---

### WR-03: `AGENDADO` hardcoded inline em ProductHeroFeatureMockup

**File:** `src/sections/Product/ProductHeroFeatureMockup.tsx:139`
**Issue:** Logo abaixo do `<CalendarCheck2>` o JSX renderiza:

```tsx
<div className="flex items-center gap-1.5 ...">
  <CalendarCheck2 className="size-3 text-emerald-600" strokeWidth={2.5} />
  AGENDADO
</div>
```

A string "AGENDADO" é PT-BR hardcoded — mesma classe que WR-02. Escapa do regex de invariante porque está como text node direto dentro de `<div>` sem accent characters (a acentuada "AGENDADO" só tem caracter "Ã" se for "AGENDADA" — "AGENDADO" tem zero acentos no PT-BR), portanto o regex `HARDCODED_PT_ACCENTED` não pega, e o `HARDCODED_PT_LONG` exige 3+ palavras.

**Fix:** Adicionar `overlayConfirm.label` em `PRODUCT_COPY.feature.mockup`.

```tsx
// src/content/product.ts
overlayConfirm: { label: "AGENDADO", name: "Carla Mendes", slot: "Ter · 14:30" }

// ProductHeroFeatureMockup.tsx:139
<CalendarCheck2 className="size-3 text-emerald-600" strokeWidth={2.5} />
{mockup.overlayConfirm.label}
```

Bonus: Test 5 do `product-invariants.test.ts` poderia ser endurecido para pegar text-node-only PT-BR uppercase sem acentos (regex tipo `>\s*[A-ZÇ]{5,}\s*[<{]`) — fica como sugestão.

## Info

### IN-01: `useInView` não reage a mudanças de `prefers-reduced-motion` durante a vida do hook

**File:** `src/hooks/use-in-view.ts:30-38`
**Issue:** O check `window.matchMedia?.("(prefers-reduced-motion: reduce)").matches` roda uma vez no mount do `useEffect`. Se o usuário trocar a preferência de SO em runtime (raríssimo, mas válido), o hook não re-avalia até unmount/remount. Para uma landing isso é praticamente irrelevante (sessão curta), mas em tickets futuros pode confundir.

**Fix:** Trocar para `useReducedMotion`-style listener (`addEventListener("change", ...)`) ou aceitar o comportamento atual e documentar explicitamente "snapshot at mount" no comentário do hook.

```ts
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
if (mq.matches) { setInView(true); return; }
// (opcional) reagir a mudanças:
const onChange = () => { if (mq.matches) setInView(true); };
mq.addEventListener("change", onChange);
return () => mq.removeEventListener("change", onChange);
```

---

### IN-02: Stagger delay duplicado entre seções (magic numbers 80/100/150/200/500 ms)

**File:** `src/sections/Pain/PainCardConstellation.tsx:47`, `src/sections/Pain/PainStatement.tsx:23`, `src/sections/HowItWorks/HowItWorksStep.tsx:38`, `src/sections/Product/ProductHeroFeature.tsx:47`, `src/sections/Product/ProductSecondaryGrid.tsx:29`, `src/sections/Proof/ProofCategories.tsx:28`, `src/sections/Bridge/BridgeStatement.tsx:35`
**Issue:** Cada seção define seu próprio `animationDelay` em ms como literal inline (`i * 80`, `i * 100`, `i * 200`, `500`, `150`, etc.). Não há fonte única — se Lenny decidir reduzir o pacing global em 20%, é uma caça pelas 7 ocorrências.

**Fix:** Extrair para `src/lib/motion-tokens.ts` algo como:

```ts
export const STAGGER = {
  card: 100, // PainCardConstellation, ProductSecondaryGrid
  step: 80,  // HowItWorksStep
  statement: 200, // BridgeStatement
  paragraph: 500, // PainStatement
  mockup: 150, // ProductHeroFeature
  category: 100, // ProofCategories
} as const;
```

Não é gate — fica como dívida de design system. Mais relevante quando virmos Phase 5+.

---

### IN-03: `SHARED_SECONDARY_EYEBROWS` é tipado como tuple mas indexado por number sem narrowing

**File:** `src/content/product.ts:103, 128, 135, 142, 172, 179, 186, 216, 223, 229`
**Issue:** `SHARED_SECONDARY_EYEBROWS[0]` etc. retorna `string` (não `"DISTRIBUIÇÃO"` literal) porque o array é typed `as const` mas acessado por number genérico. Funciona, mas perde-se a type-safety da tuple. Hoje não causa bug; se alguém renomear "FOLLOW-UP" para "FOLLOWUP", nada quebra type-side.

**Fix (opcional):** Acessar via destructure ou nomear:

```ts
const [EYEBROW_DISTRIBUTION, EYEBROW_FOLLOWUP, EYEBROW_AGENDA] = SHARED_SECONDARY_EYEBROWS;
```

Ou mover pra um objeto:

```ts
const SECONDARY_EYEBROWS = { distribution: "DISTRIBUIÇÃO", followup: "FOLLOW-UP", agenda: "AGENDA" } as const;
```

---

### IN-04: `PainCardConstellation` usa `key={card.kind}` mas a relação index↔posição vem de `POSITIONS[i]`

**File:** `src/sections/Pain/PainCardConstellation.tsx:43-44`
**Issue:** O loop é `PAIN_COPY.cards.map((card, i) => ...)` e usa `card.kind` como key (bom — kinds são únicas: `instagram`/`whatsapp`/`spreadsheet`/`notes`). Mas a posição é indexada pelo index `POSITIONS[i]`. Se algum dia o Lenny reordenar `SHARED_CARDS` (que está em `pain.ts`), o `PainCardConstellation` aplica posições diferentes silenciosamente — sem teste de invariante cobrindo essa expectativa.

**Fix (defensivo):** Indexar `POSITIONS` por `card.kind` em vez de `i`:

```ts
const POSITIONS_BY_KIND: Record<PainCardKind, string> = {
  instagram: "...", whatsapp: "...", spreadsheet: "...", notes: "...",
};
// uso: POSITIONS_BY_KIND[card.kind]
```

Não é bug hoje; é proteção contra refactor futuro.

---

### IN-05: Componentes "use client" importam de `src/content/*.ts` que é módulo isomorphic — múltiplos pontos de hidratação

**File:** `src/sections/Bridge/BridgeStatement.tsx:5`, `src/sections/Pain/PainCardConstellation.tsx:17`, `src/sections/Pain/PainStatement.tsx:13`, `src/sections/HowItWorks/HowItWorksStep.tsx:20`, `src/sections/Product/ProductHeroFeature.tsx:20`, `src/sections/Product/ProductSecondaryGrid.tsx:14`, `src/sections/Proof/ProofCategories.tsx:3`
**Issue:** Cada wrapper "use client" importa `PAIN_COPY` / `BRIDGE_COPY` / etc. e re-renderiza o conteúdo no client. Isso significa o conteúdo das frases viaja no RSC payload + no client bundle. Para copy estática isso é desperdício de bytes (pequeno: a copy total é < 5KB JSON). Padrão alternativo: o wrapper "use client" recebe `children` (o RSC pai injeta o JSX com a copy) e só anima.

**Exemplo do problema (Bridge):**

- `Bridge/index.tsx` é RSC, chama `<BridgeStatement />`.
- `BridgeStatement` é "use client" e importa `BRIDGE_COPY`.
- Resultado: o h2 inteiro é renderizado no client; o RSC só shelha um wrapper vazio.

**Fix (refactor sugerido, não bloqueante):** Passar a copy como props ou children do RSC pai:

```tsx
// Bridge/index.tsx (RSC)
<BridgeStatement statements={BRIDGE_COPY.statements} />

// BridgeStatement.tsx ("use client")
export function BridgeStatement({ statements }: { statements: readonly string[] }) {
  const [ref, inView] = useInView<HTMLHeadingElement>({ threshold: 0.4 });
  return <h2 ref={ref}>...{statements.map(...)}...</h2>;
}
```

Ganho: o RSC payload contém o texto pronto; client só hidrata o reveal. Marketing site → todo byte conta. Não é gate — fica como otimização futura quando o `@next/bundle-analyzer` da Phase 5/6 expuser o custo.

---

_Reviewed: 2026-05-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
