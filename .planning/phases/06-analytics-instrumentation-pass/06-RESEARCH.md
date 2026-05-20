# Phase 6: Analytics Instrumentation Pass — Research

**Researched:** 2026-05-20
**Domain:** Client-side analytics instrumentation (IntersectionObserver, scroll tracking, vendor verification) em Next.js 15.5 / React 19
**Confidence:** HIGH (Parte A — implementação); MEDIUM (Parte B — verificação, bloqueada por contas externas)
**Language:** pt-BR

## Summary

A Phase 6 fecha a instrumentação de analytics da landing. O trabalho real e desbloqueável (Parte A) é pequeno e bem delimitado: implementar os dois eventos que existem no tipo `AnalyticsEvent` mas **nunca são disparados** — `section_view` e `scroll_depth`. Toda a infra (`track()` fan-out, `event_id` UUID v4, fan-out GA4/Pixel/Clarity, scripts gated em env vars) já está pronta da Phase 1, e os eventos de conversão (`cta_click`, `whatsapp_click`, `form_*`) já disparam corretamente das Phases 3 e 5. O `data-clarity-mask="true"` já está no `<form>` e na `<section>` wrapper (Phase 5).

A Parte B — verificar os eventos rodando em Meta Pixel Test Events, GA4 DebugView e Clarity recordings — está **bloqueada** até o Lenny criar as 3 contas e configurar os IDs na Vercel. Essa parte vira um documento `06-HUMAN-UAT.md` com um checklist guiado, executado depois das contas existirem.

A pesquisa confirma duas decisões de implementação de baixo risco: (1) `section_view` reaproveita o padrão IntersectionObserver já validado em `use-in-view.ts`/`use-form-in-view.ts`, encapsulado num hook dedicado leve `useSectionView(name)` que dispara `track()` uma única vez; (2) `scroll_depth` é um único componente client `<ScrollDepthTracker />` montado uma vez em `page.tsx`, com listener de scroll throttled via `requestAnimationFrame` e dedup por `Set` de milestones. Sobre o risco de GA4 double-fire em SPA: **não existe risco material** — a landing é single-page sem rotas internas navegáveis (exceto `/privacy`, uma página separada), e o `<GoogleAnalytics>` do `@next/third-parties` é a única fonte de `page_view`; double-fire só ocorreria se houvesse um segundo script GA, o que não há.

**Primary recommendation:** Hook dedicado `useSectionView(name)` consumido pelas 7 seções + componente único `<ScrollDepthTracker />` em `page.tsx`. Ambos disparam exclusivamente via `track()`. Testes unitários vitest+jsdom mockando `track`, `IntersectionObserver` e geometria de scroll. Parte B = `06-HUMAN-UAT.md` bloqueado.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **`section_view`**: dispara quando cada seção narrativa entra no viewport. Payload `{ section: "pain" | "bridge" | "product" | "how" | "proof" | ... }`. Usa IntersectionObserver. Dispara **UMA vez** por seção (não a cada re-entrada). Pode reaproveitar `use-in-view.ts` OU ser hook dedicado.
- **`scroll_depth`**: dispara nos marcos 25/50/75/100% do scroll da página. Payload `{ depth: 25 | 50 | 75 | 100 }`. Cada marco dispara **UMA vez** por sessão. É **um único evento** `scroll_depth` com payload `depth` — NÃO 4 eventos separados (`scroll_depth_25/50/75/100`). O requirement TRACK-04 menciona `scroll_depth_25/50/75/100` como conceito; a implementação usa o evento singular já no tipo `AnalyticsEvent`.
- Eventos já implementados (`cta_click`, `whatsapp_click`, `form_*`, `form_focus`) — **NÃO reimplementar**, só verificar via teste que continuam corretos.
- Todo evento passa por `track()` de `src/lib/analytics.ts`. **Zero** chamadas diretas a `window.gtag`/`fbq`/`clarity` em componentes (regra TRACK-01).
- `track()` já anexa `event_id` UUID v4 — **não mexer**.
- `section_view` e `scroll_depth` são client-side — componentes/hooks `"use client"`.
- Scroll-depth listener deve ser throttled (`requestAnimationFrame` ou similar).
- GA4 SPA config (TRACK-06): já resolvido na Phase 1 via `<GoogleAnalytics>`. Phase 6 só **verifica** double-fire — não reimplementa.
- PII masking (TRACK-05): `data-clarity-mask="true"` já no `<form>` e `<section>` (Phase 5). Phase 6 **verifica** (teste de render/grep) + valida em gravação real (Parte B).
- Verificação cross-dashboard (TRACK-07, Parte B): **deferida** — vira HUMAN-UAT, bloqueada até Lenny ter as 3 contas + IDs configurados na Vercel.
- `response_language`: pt-BR.

### Claude's Discretion

- Escolha entre componente wrapper `<TrackSection name="pain">` vs hook `useSectionView("pain")` para `section_view`.
- Reaproveitar `use-in-view.ts` vs construir hook dedicado.
- Threshold do IntersectionObserver para "seção entrou no viewport".
- Estrutura exata dos testes unitários (mocks de IntersectionObserver, scroll geometry).
- Quais seções recebem `section_view` (mínimo: Pain, Bridge, Product, HowItWorks, Proof; idealmente Hero e Form também).
- Se algum campo sensível adicional precisar de `data-clarity-mask`, adicionar.

### Deferred Ideas (OUT OF SCOPE)

- **Verificação cross-dashboard (TRACK-07)** — bloqueada até Lenny ter contas Meta Pixel + GA4 + Clarity. Vira HUMAN-UAT pendente; a phase pode ficar "implementação completa, verificação pendente".
- **Meta CAPI server-side** — retrofit futuro; `event_id` já está em todos os eventos.
- **Consent / cookie banner LGPD** — Phase 7 ou backlog.
- **Criação das contas de analytics** — Lenny faz quando decidir; sessão guiada separada.
- Lighthouse / Performance / SEO / A11y → Phase 7.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRACK-04 | Eventos rastreados no mínimo: `cta_click`, `whatsapp_click`, `form_submit_*`, `section_view` (com `section` para todas as seções narrativas), `scroll_depth_25/50/75/100` | Parte A: implementar `section_view` (hook `useSectionView`) e `scroll_depth` (componente `<ScrollDepthTracker />`). `cta_click`/`whatsapp_click`/`form_*` já implementados — só cobrir com teste de regressão. Padrão IntersectionObserver e scroll-throttle documentados abaixo. **Automatável.** |
| TRACK-05 | Form wrapper recebe `data-clarity-mask="true"` (+ atributos em campos sensíveis) — verificado em sessão real do Clarity antes do launch | Parte A automatável: teste de render confirma `data-clarity-mask="true"` em `<form>` (LeadForm) e `<section id="lead-form-section">` (Form/index). Parte B manual: validar numa gravação real que nome/WhatsApp/email não aparecem (HUMAN-UAT). Comportamento do Clarity documentado abaixo. |
| TRACK-06 | GA4 para SPA configurada via `@next/third-parties/google` ou Script com `send_page_view: false` + envio manual | Já resolvido na Phase 1. Pesquisa confirma: `<GoogleAnalytics>` trata route changes; double-fire só ocorre com 2 scripts GA. Phase 6 verifica via teste (grep: só um `<GoogleAnalytics>`, zero scripts GA manuais) + DebugView (Parte B). **Sem reimplementação.** |
| TRACK-07 | Eventos validados nos três dashboards (Pixel Test Events, GA4 DebugView, Clarity recordings) ao fim da Phase 6 | **BLOQUEADO** — Parte B. Vira `06-HUMAN-UAT.md` com checklist guiado. Executável só após Lenny criar as 3 contas e configurar `NEXT_PUBLIC_*` IDs na Vercel + redeploy. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Diretivas acionáveis extraídas de `CLAUDE.md` (projeto + global) — o planner deve garantir conformidade:

- **Stack travada**: Next.js 15.5 + Tailwind v4 + Motion v12 + Lenis 1.3.x + `@next/third-parties`. NÃO sugerir trocar nada.
- **Tracking obrigatório v1**: Meta Pixel + GA4 + Microsoft Clarity — sem isso, otimização de campanha é cega. Os 3 vendors carregam via `<Script strategy="afterInteractive">` (TRACK-03).
- **Zero fan-out disperso**: `lib/analytics.ts` é o único módulo que toca vendors. Componentes nunca chamam `window.gtag`/`fbq`/`clarity` diretamente.
- **`event_id` UUID v4**: todo evento, gerado na origem, para dedup futura via Meta CAPI sem retrofit.
- **Mobile-first real**: 80%+ do tráfego é Instagram/Meta Ads no celular — o `scroll_depth` precisa computar % de forma correta no mobile (address bar dinâmica).
- **Performance não negociável**: animações e listeners de scroll não podem comprometer Lighthouse/LCP/INP. Scroll listener throttled obrigatoriamente.
- **GSD Workflow**: trabalho passa por comando GSD; sem edits diretos fora do fluxo.
- **Code review antes de commit** (global CLAUDE.md): ativar skill `requesting-code-review` sobre o diff antes de qualquer commit. Para mudança de UI/frontend, rodar Playwright MCP — mas aqui o padrão das Phases 4-5 foi testes unitários sem Playwright; o planner deve seguir o precedente (vitest) e o code review continua obrigatório.
- **Idioma**: respostas em pt-BR; mensagens de commit podem ser em inglês.

## Standard Stack

Tudo já instalado. **Phase 6 não adiciona nenhuma dependência.**

### Core (já presente)
| Library | Version | Purpose | Por que é o padrão |
|---------|---------|---------|--------------------|
| Next.js | `15.5.18` | App Router, `<Script>` | Stack travada. `next/script` já usado no `AnalyticsProvider`. [VERIFIED: package.json] |
| React | `^19.0.0` | Hooks (`useEffect`, `useRef`, `useState`) | Stack travada. [VERIFIED: package.json] |
| `@next/third-parties` | `^15.5.0` | `<GoogleAnalytics>` — trata route changes GA4 | Já montado no `AnalyticsProvider`; abordagem oficial Next.js. [VERIFIED: package.json + nextjs.org/docs/app/guides/third-party-libraries] |
| vitest | `^3.2.4` | Test runner | Já configurado (`vitest.config.ts`, env jsdom). [VERIFIED: package.json] |
| jsdom | `^25.0.0` | Ambiente DOM de teste | Configurado em `vitest.config.ts`. [VERIFIED] |
| `@testing-library/react` | `^16.0.0` | Render de hooks/componentes em teste | Já usado em `tests/hooks/`. [VERIFIED] |

### Supporting (nativos do browser — zero dependência nova)
| API | Purpose | Quando usar |
|-----|---------|-------------|
| `IntersectionObserver` | Detectar seção entrando no viewport (`section_view`) | Já usado em `use-in-view.ts` e `use-form-in-view.ts` — padrão validado no projeto. |
| `requestAnimationFrame` | Throttle do listener de scroll (`scroll_depth`) | Padrão 2026 para scroll handlers — não bloqueia main thread, sincroniza com o paint. |
| `document.documentElement.scrollHeight` / `window.scrollY` / `window.innerHeight` | Cálculo do % de scroll | Geometria de página inteira. Ver pitfall mobile abaixo. |

### Alternatives Considered
| Em vez de | Poderia usar | Tradeoff |
|-----------|--------------|----------|
| `requestAnimationFrame` throttle no scroll | `scroll` listener direto sem throttle | Scroll dispara dezenas de vezes/segundo → recálculo de geometria desnecessário, risco de jank. RAF coalesce para 1x/frame. **Usar RAF.** [CITED: padrão consolidado MDN scroll performance] |
| `requestAnimationFrame` throttle | IntersectionObserver com sentinelas (4 divs invisíveis em 25/50/75/100%) | Sentinelas funcionam e são elegantes, mas exigem inserir 4 elementos posicionados absolutamente e recalcular posição em resize. RAF+scrollY é mais simples para 4 milestones fixos numa página única. Sentinelas brilham quando os marcos são "elementos reais" (ex: seções). Para % puro, RAF vence em simplicidade. **Usar RAF.** [ASSUMED — síntese] |
| Hook dedicado `useSectionView` | Reusar `use-in-view.ts` diretamente | `use-in-view.ts` retorna `[ref, boolean]` para *motion* e tem lógica de `prefers-reduced-motion` que força `inView=true` imediatamente — inadequado para analytics (dispararia `section_view` sem o usuário ter visto a seção). Um hook dedicado evita acoplar semântica de motion à de tracking. **Hook dedicado.** Ver pitfall 3. |
| Componente `<TrackSection name="pain">` wrapper | Hook `useSectionView("pain")` | Ambos válidos. Hook é menos invasivo — cada seção adiciona uma linha (`const ref = useSectionView("pain")`) e aplica o `ref` no `<section>` já existente, sem novo nível de DOM. Wrapper adiciona um `<div>` que pode interferir com layout/sticky. **Hook.** [ASSUMED — discretion] |

## Architecture Patterns

### Estrutura de arquivos proposta
```
src/
├── hooks/
│   ├── use-in-view.ts            # EXISTENTE — motion, não tocar
│   ├── use-form-in-view.ts       # EXISTENTE — não tocar
│   └── use-section-view.ts       # NOVO — section_view tracking
├── components/
│   └── analytics/
│       └── ScrollDepthTracker.tsx  # NOVO — scroll_depth tracking, montado 1x
├── lib/
│   └── analytics.ts              # EXISTENTE — track(), não tocar a lógica
└── sections/
    └── */index.tsx               # cada seção chama useSectionView(name)
tests/
├── hooks/
│   └── use-section-view.test.tsx   # NOVO
├── components/
│   └── scroll-depth-tracker.test.tsx  # NOVO
└── analytics/
    └── clarity-mask.test.tsx       # NOVO — verifica data-clarity-mask
```

### Pattern 1: `useSectionView(section)` — section_view tracking
**O quê:** Hook `"use client"` dedicado. Recebe o nome da seção, retorna um `ref` para aplicar no `<section>`. Usa IntersectionObserver; ao primeiro `isIntersecting`, dispara `track("section_view", { section })` e desconecta o observer (fire-once).

**Por que dedicado e não `use-in-view.ts`:** o hook de motion força `inView=true` imediatamente sob `prefers-reduced-motion` — para analytics isso seria um falso positivo (evento dispara sem o usuário ter rolado até a seção). Analytics deve refletir comportamento *real*, independente de preferência de motion.

```typescript
// Source: síntese do padrão use-in-view.ts + use-form-in-view.ts já no projeto
"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export function useSectionView<T extends Element = HTMLElement>(
  section: string,
  { threshold = 0.3 }: { threshold?: number } = {},
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          track("section_view", { section });
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [section, threshold]);

  return ref;
}
```

Consumo numa seção (ex: `Pain/index.tsx`):
```tsx
const sectionRef = useSectionView<HTMLElement>("pain");
return <section ref={sectionRef} id="pain" ...>
```

**Threshold:** `0.3` (30% da seção visível) é uma escolha boa para "o usuário viu esta seção" sem disparar cedo demais. Seções longas (Product sticky stack) podem nunca atingir 30% num viewport mobile pequeno — considerar `threshold: 0` + `rootMargin` negativo, OU threshold mais baixo (`0.15`). **Decisão final do planner**; documentar o threshold escolhido. Nota: a seção Pain já tem `id="pain"`; o hook precisa só do `ref`, não do `id`.

### Pattern 2: `<ScrollDepthTracker />` — scroll_depth tracking
**O quê:** Componente client único, sem render visual (`return null`), montado uma vez em `page.tsx`. Escuta `scroll` com throttle via `requestAnimationFrame`, calcula o % de progresso da página, e dispara `track("scroll_depth", { depth })` ao cruzar cada marco — cada marco uma única vez via `Set`.

```typescript
// Source: síntese — padrão RAF-throttled scroll, consolidado 2026
"use client";
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

const MILESTONES = [25, 50, 75, 100] as const;

export function ScrollDepthTracker() {
  const firedRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      tickingRef.current = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const m of MILESTONES) {
        if (pct >= m && !firedRef.current.has(m)) {
          firedRef.current.add(m);
          track("scroll_depth", { depth: m });
        }
      }
    };
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    compute(); // checa estado inicial (página curta / restaurada com scroll)
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
```

Montagem em `page.tsx`:
```tsx
<main> ... </main>
<ScrollDepthTracker />
```

**Por que componente único em `page.tsx` e não no `layout.tsx`:** `layout.tsx` envolve também `/privacy`, onde scroll_depth da landing não faz sentido. `page.tsx` escopa ao home. Listener `passive: true` é obrigatório para não bloquear a thread de scroll.

**Interação com Lenis:** Lenis controla o scroll suave mas continua atualizando `window.scrollY` e disparando eventos `scroll` nativos no `window` (Lenis faz scroll real, não fake). Portanto o listener nativo funciona. Não é necessário hook do Lenis. [ASSUMED — Lenis 1.3.x usa scroll nativo do document; confirmar em smoke test]

### Anti-padrões a evitar
- **Disparar `section_view` a cada re-entrada no viewport.** O usuário rola pra cima e pra baixo — sem `firedRef`/`disconnect()` o evento dispara N vezes. Fire-once é mandatório (decisão LOCKED).
- **`scroll` listener sem throttle.** Recalcular `scrollHeight` (causa reflow) a cada evento de scroll = jank. RAF coalesce.
- **Ler `scrollHeight` dentro do handler de scroll a cada chamada sem RAF.** `scrollHeight` força layout sync. Dentro do RAF callback é aceitável (1x/frame).
- **Reusar `use-in-view.ts` para `section_view`.** Acopla semântica de motion (`prefers-reduced-motion` → `inView` imediato) a analytics → falso positivo.
- **Chamar `window.gtag`/`fbq`/`clarity` direto no hook/componente.** Viola TRACK-01. Sempre via `track()`.

## Don't Hand-Roll

| Problema | Não construir | Usar | Por quê |
|----------|---------------|------|---------|
| Detecção de elemento no viewport | Cálculo manual `getBoundingClientRect()` em scroll | `IntersectionObserver` | Nativo, off-main-thread, já é o padrão do projeto (`use-in-view.ts`). |
| Throttle de scroll | `setTimeout`/`setInterval` debounce | `requestAnimationFrame` | RAF sincroniza com o paint, não há "lag" perceptível, coalesce automático. |
| UUID de evento | Gerador próprio | `track()` (já faz, `crypto.randomUUID()`) | Já implementado e testado na Phase 1. Não tocar. |
| Mapeamento evento→Meta standard event | Lógica nos componentes | `META_EVENT_MAP` em `analytics.ts` | Já existe. `section_view`/`scroll_depth` não estão mapeados → caem em `trackCustom` automaticamente (correto). |
| Route-change page_view GA4 | `usePathname` + `gtag('event','page_view')` manual | `<GoogleAnalytics>` do `@next/third-parties` | Já montado, trata route changes. Adicionar tracking manual = **causa do double-fire**. |
| PII masking no Clarity | Lógica de redação de campos | `data-clarity-mask="true"` | Já no `<form>` e `<section>`. Clarity mascara client-side antes de enviar. |

**Key insight:** A Phase 6 é quase inteiramente "ligar fios que já existem". O risco não é técnico — é de regressão (mexer no que já funciona) e de double-fire (adicionar tracking GA redundante). Disciplina > código novo.

## Common Pitfalls

### Pitfall 1: `scroll_depth` 100% nunca dispara no mobile (address bar dinâmica)
**O que dá errado:** Em iOS Safari / Android Chrome, a barra de endereço encolhe ao rolar pra baixo. Isso muda `window.innerHeight` *durante* o scroll. Se você calcula `scrollHeight - innerHeight` com a `innerHeight` "grande" (barra visível) mas o usuário rola com a barra recolhida, o denominador fica menor que o real e o 100% pode nunca ser atingido — ou ser atingido cedo demais.
**Por que acontece:** `innerHeight` é dinâmico no mobile; `scrollHeight` não.
**Como evitar:** (a) Recalcular `scrollHeight` e `innerHeight` *dentro* do RAF callback a cada cómputo (já feito no padrão acima) — pega o valor atual. (b) Tolerância no marco 100%: tratar `pct >= 99` como 100% (a barra de endereço pode deixar 1-2px sobrando). (c) Considerar disparar 100% também num listener de `scrollend` ou quando `scrollY + innerHeight >= scrollHeight - tolerância`. **Recomendação: usar tolerância `pct >= 99` para o marco 100.**
**Sinais de alerta:** No teste real (Parte B), o GA4 mostra `scroll_depth depth=75` muito mais que `depth=100`.
[VERIFIED: comportamento conhecido de `vh`/`innerHeight` mobile — o projeto já mitiga isso no Hero via `dvh`/`svh`, HERO-05]

### Pitfall 2: jsdom não implementa geometria de scroll
**O que dá errado:** Em jsdom, `window.scrollY`, `document.documentElement.scrollHeight`, `window.innerHeight` retornam `0` (ou valores estáticos) e `window.scrollTo` é um no-op. O evento `scroll` não dispara naturalmente. Um teste ingênuo de `<ScrollDepthTracker />` nunca verá um milestone.
**Por que acontece:** jsdom não faz layout/rendering real — não há geometria.
**Como evitar:** No teste, fazer stub explícito das propriedades e disparar o evento manualmente:
```typescript
// definir geometria antes de montar
Object.defineProperty(document.documentElement, "scrollHeight", { value: 4000, configurable: true });
Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
// stub do RAF para rodar síncrono
vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 0; });
// simular scroll
(window as any).scrollY = 2000; // 2000 / (4000-1000) = 66% → cruza 25 e 50
window.dispatchEvent(new Event("scroll"));
```
**Sinais de alerta:** Teste passa "vacuamente" (zero asserts disparam) ou trava esperando um evento.

### Pitfall 3: `use-in-view.ts` reaproveitado dispararia `section_view` falso
**O que dá errado:** `use-in-view.ts` força `inView = true` imediatamente quando `prefers-reduced-motion: reduce` está ativo (para mostrar o estado final sem animação). Se `section_view` fosse construído em cima dele, todo usuário com reduced-motion dispararia `section_view` de todas as 7 seções no mount — sem ter visto nenhuma.
**Por que acontece:** A lógica de motion e a de analytics têm objetivos opostos sob reduced-motion.
**Como evitar:** Hook dedicado `useSectionView` que **não** consulta `prefers-reduced-motion` — analytics rastreia comportamento real.
**Sinais de alerta:** Em DebugView (Parte B), `section_view` de todas as seções aparece num burst no carregamento da página.

### Pitfall 4: GA4 double-fire de `page_view`
**O que dá errado:** Dois eventos `page_view` por carregamento de página.
**Por que acontece:** Ter `<GoogleAnalytics>` **E** um segundo mecanismo GA (Script manual de GA, ou `gtag('event','page_view')` manual). [VERIFIED: nextjs.org docs + Swetrix guide — "use one or the other, not both"]
**Como evitar:** Confirmar via grep/teste que existe **exatamente um** `<GoogleAnalytics>` (em `analytics-provider.tsx`) e **zero** scripts GA manuais e **zero** chamadas manuais a `page_view`. O código atual já está correto. A landing não tem rotas internas navegáveis (`/privacy` é página separada, navegação via `<a href>` recarrega contexto GA normalmente), então não há ambiguidade de route-change. **Risco material: baixo.** Phase 6 documenta isso e verifica em DebugView na Parte B (checar que cada reload = 1 `page_view`).
**Sinais de alerta:** GA4 Realtime mostra 2x os usuários reais.

### Pitfall 5: Clarity script id deve ser `ms-clarity`
**O que dá errado:** Se o `<Script id="...">` do Clarity for `"clarity"`, conflita com a função `window.clarity` que o próprio script define → `Cannot redefine property`.
**Por que acontece:** Colisão de namespace.
**Como evitar:** O id já é `"ms-clarity"` no `analytics-provider.tsx` (comentado explicitamente como Pitfall E). **Não mexer.** Se a Phase 6 tocar no provider por qualquer motivo, preservar o id.
**Sinais de alerta:** Erro de console "Cannot redefine property: clarity".

### Pitfall 6: `section_view` em seção que nunca atinge o threshold no mobile
**O que dá errado:** Seções longas (Product sticky stack) podem ocupar mais de uma viewport mobile. Com `threshold: 0.3`, "30% da seção visível" pode nunca ser verdade num viewport de 700px observando uma seção de 3000px.
**Por que acontece:** `threshold` é fração da *seção*, não do viewport.
**Como evitar:** Para `section_view`, threshold baixo (`0.1`–`0.15`) OU `threshold: 0` com `rootMargin` que exija que o topo da seção passe de uma fração do viewport. **Recomendação: `threshold: 0.15`** — robusto para seções de qualquer altura. O planner valida com smoke test visual.
**Sinais de alerta:** Product/HowItWorks nunca aparecem em `section_view` no DebugView.

## Code Examples

### Verificar `data-clarity-mask` por render (TRACK-05, Parte A automatável)
```tsx
// Source: @testing-library/react — padrão do projeto (tests/hooks/)
import { render } from "@testing-library/react";
import { Form } from "@/sections/Form";

it("Form section wrapper tem data-clarity-mask", () => {
  const { container } = render(<Form />);
  const section = container.querySelector("section#lead-form-section");
  expect(section).toHaveAttribute("data-clarity-mask", "true");
});
```
(O `<form>` interno do `LeadForm` também — teste análogo. Defense in depth já entregue na Phase 5.)

### Testar `useSectionView` com IntersectionObserver mockado
```tsx
// Source: síntese — controle manual do callback de IO em vitest
import { renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { useSectionView } from "@/hooks/use-section-view";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
import { track } from "@/lib/analytics";

it("dispara section_view uma vez ao entrar no viewport", () => {
  let ioCallback: IntersectionObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal("IntersectionObserver", class {
    constructor(cb: IntersectionObserverCallback) { ioCallback = cb; }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
  });

  const { result } = renderHook(() => useSectionView("pain"));
  // attach ref a um nó real para o observer rodar
  const node = document.createElement("section");
  (result.current as any).current = node;
  // re-render para o useEffect pegar o ref... (ou usar um componente de teste wrapper)

  // simular interseção
  ioCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  expect(track).toHaveBeenCalledWith("section_view", { section: "pain" });

  // segunda interseção não re-dispara
  ioCallback!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  expect(track).toHaveBeenCalledTimes(1);
});
```
**Nota de implementação:** `renderHook` não dá controle fácil sobre o `ref.current` antes do `useEffect`. O padrão mais robusto é um **componente de teste** que renderiza `<section ref={useSectionView("pain")} />` via `render()` — o jsdom anexa o nó real e o `useEffect` pega o `ref.current`. O planner deve preferir essa abordagem (componente wrapper de teste) à manipulação manual do ref.

### Testar `<ScrollDepthTracker />` (ver Pitfall 2 para o stub de geometria)
```tsx
// Source: síntese — geometria de scroll stubada em jsdom
it("dispara scroll_depth 25 e 50 ao rolar 60%", () => {
  Object.defineProperty(document.documentElement, "scrollHeight", { value: 4000, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => { cb(0); return 0; });

  render(<ScrollDepthTracker />);
  (window as any).scrollY = 1800; // 1800/3000 = 60%
  window.dispatchEvent(new Event("scroll"));

  expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 25 });
  expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 50 });
  expect(track).not.toHaveBeenCalledWith("scroll_depth", { depth: 75 });
});
```

## State of the Art

| Abordagem antiga | Abordagem atual | Quando mudou | Impacto |
|------------------|-----------------|--------------|---------|
| `gtag.js` manual no `<head>` + `usePathname` para route change | `<GoogleAnalytics>` de `@next/third-parties` | Next 13.4+ (2023), consolidado 2024-2026 | Já adotado no projeto. Phase 6 só verifica. |
| `scroll` listener com `lodash.throttle`/`debounce` | `requestAnimationFrame` throttle | Padrão consolidado desde ~2020 | Sem dependência, sincronizado com paint. |
| `getBoundingClientRect()` em scroll para detectar viewport | `IntersectionObserver` | API estável desde 2019, universal em 2026 | Off-main-thread, já é o padrão do projeto. |
| GA `scroll_depth` via Enhanced Measurement automático do GA4 | Evento custom via `track()` | — | Decisão do projeto: tracking unificado por `track()`, não Enhanced Measurement (que só alimenta GA4, não Pixel/Clarity, e não carrega `event_id`). |

**Deprecado/desatualizado:**
- `next/script` inline para GA — substituído por `@next/third-parties`.
- Enhanced Measurement do GA4 para scroll — não usar; quebraria o princípio de fan-out único e não levaria `event_id`.

## Validation Architecture

> `workflow.nyquist_validation` não está explicitamente `false` (não há `.planning/config.json` com a chave) — seção incluída.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest `^3.2.4` |
| Config file | `vitest.config.ts` (env `jsdom`, `globals: true`, setup `./tests/setup.ts`, alias `@`) |
| Quick run command | `npm run test` (`vitest run`) |
| Full suite command | `npm run test` + `npm run typecheck` (`tsc --noEmit`) |
| Setup notable | `tests/setup.ts` já stuba `IntersectionObserver` global no-op e mocka `server-only`. Testes que controlam o IO sobrescrevem o stub no próprio `beforeEach` (precedente: `floating-whatsapp.test.tsx`). |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| TRACK-04 | `useSectionView` dispara `section_view` com `section` correto, **uma vez** | unit | `npm run test -- use-section-view` | ❌ Wave 0 |
| TRACK-04 | `useSectionView` não re-dispara em re-interseção | unit | `npm run test -- use-section-view` | ❌ Wave 0 |
| TRACK-04 | `ScrollDepthTracker` dispara `scroll_depth` nos marcos cruzados, com `depth` correto | unit | `npm run test -- scroll-depth-tracker` | ❌ Wave 0 |
| TRACK-04 | `ScrollDepthTracker` não duplica marco já disparado | unit | `npm run test -- scroll-depth-tracker` | ❌ Wave 0 |
| TRACK-04 | `scroll_depth` não dispara quando página não é rolável (`scrollable <= 0`) | unit | `npm run test -- scroll-depth-tracker` | ❌ Wave 0 |
| TRACK-04 (regressão) | `cta_click`/`whatsapp_click`/`form_*` continuam disparando via `track()` com payloads corretos | unit | `npm run test -- analytics` (já existe parcialmente) + testes de componente Phase 3/5 já presentes | ⚠️ Parcial — `tests/lib/analytics.test.ts` cobre `track()`; o disparo pelos componentes pode já estar coberto pelos testes de Phase 5 — planner verifica |
| TRACK-05 | `<Form>` `<section>` e `<form>` do `LeadForm` têm `data-clarity-mask="true"` | unit (render) | `npm run test -- clarity-mask` | ❌ Wave 0 |
| TRACK-06 | Exatamente um `<GoogleAnalytics>`, zero scripts GA manuais | unit (render/grep) | `npm run test -- analytics-provider` ou grep test | ❌ Wave 0 (ou grep em VALIDATION) |
| TRACK-07 | Eventos visíveis em Pixel Test Events / GA4 DebugView / Clarity recordings | **manual** | — HUMAN-UAT, **bloqueado** | N/A — `06-HUMAN-UAT.md` |
| TRACK-05 (parte B) | Gravação real do Clarity não mostra PII | **manual** | — HUMAN-UAT, **bloqueado** | N/A — `06-HUMAN-UAT.md` |

### Sampling Rate
- **Per task commit:** `npm run test -- <arquivo afetado>` (rápido, < 5s)
- **Per wave merge:** `npm run test` (suite completa) + `npm run typecheck`
- **Phase gate:** suite completa verde + `npm run lint` antes de `/gsd-verify-work`. Code review (`requesting-code-review`) sobre o diff antes do commit.

### Wave 0 Gaps
- [ ] `tests/hooks/use-section-view.test.tsx` — cobre TRACK-04 (`section_view`)
- [ ] `tests/components/scroll-depth-tracker.test.tsx` — cobre TRACK-04 (`scroll_depth`)
- [ ] `tests/analytics/clarity-mask.test.tsx` — cobre TRACK-05 (Parte A)
- [ ] (opcional) `tests/components/analytics-provider.test.tsx` — cobre TRACK-06 (um único `<GoogleAnalytics>`); pode ser um grep test em VALIDATION em vez de teste de render
- Framework install: **nenhum** — vitest + jsdom + testing-library já instalados e configurados.

### Part B — HUMAN-UAT (manual, BLOQUEADO)
Não automatável. Vira `06-HUMAN-UAT.md`, executável só depois de Lenny:
1. Criar conta Meta Business + Pixel → obter `NEXT_PUBLIC_META_PIXEL_ID`.
2. Criar propriedade GA4 → obter `NEXT_PUBLIC_GA4_ID`.
3. Criar projeto Clarity → obter `NEXT_PUBLIC_CLARITY_ID`.
4. Configurar os 3 IDs em Vercel env vars (Production + Preview + Development) → redeploy.

Checklist HUMAN-UAT proposto:

| # | Verificação | Ferramenta | Esperado |
|---|-------------|------------|----------|
| B1 | `whatsapp_click` aparece ao clicar CTA | Meta Pixel Test Events (Events Manager → Test Events) | Evento `Contact` com `eventID` (= `event_id`) visível no payload |
| B2 | `form_submit_success` ao enviar form | Meta Pixel Test Events | Evento `Lead` com `eventID` |
| B3 | `section_view` / `scroll_depth` aparecem | Meta Pixel Test Events | Custom events `section_view`/`scroll_depth` com `eventID` e payload (`section`/`depth`) |
| B4 | Eventos custom + `page_view` aparecem | GA4 DebugView (Admin → DebugView; ativar via extensão GA Debugger ou `?_dbg`) | `cta_click`, `whatsapp_click`, `form_submit_*`, `section_view`, `scroll_depth`, `page_view` listados |
| B5 | **Zero double-fire** | GA4 DebugView + Network tab | Um único `page_view` por reload; um `collect` por clique de CTA |
| B6 | `section_view` não dispara em burst | GA4 DebugView | `section_view` aparece conforme o usuário rola, não tudo no load |
| B7 | PII masking no form | Clarity → Recordings (≈30 min após a sessão) | Ao reproduzir gravação de quem preencheu o form, nome / WhatsApp / email aparecem **mascarados** (blocos cinza), não legíveis |
| B8 | Eventos custom no Clarity | Clarity → Dashboard → smart events / filtros | `section_view`, `scroll_depth` etc. registrados como custom events |

Observação: o Clarity demora ~30 min para processar settings/gravações ([CITED: learn.microsoft.com/clarity/setup-and-installation/clarity-masking]). O masking é client-side — conteúdo mascarado nunca chega aos servidores ([VERIFIED: learn.microsoft.com — "never captures anything that is masked"]).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| vitest + jsdom + testing-library | Parte A — testes unitários | ✓ | vitest 3.2.4 / jsdom 25 | — |
| `@next/third-parties` | GA4 (já montado) | ✓ | 15.5.0 | — |
| Conta Meta Pixel + ID | Parte B — verificação | ✗ | — | **Sem fallback** — bloqueia Parte B |
| Conta GA4 + ID | Parte B — verificação | ✗ | — | **Sem fallback** — bloqueia Parte B |
| Projeto Clarity + ID | Parte B — verificação | ✗ | — | **Sem fallback** — bloqueia Parte B |
| Deploy Vercel com IDs configurados | Parte B | ✗ (IDs não existem) | — | **Sem fallback** — bloqueia Parte B |

**Missing dependencies with no fallback:**
- As 3 contas de analytics (Meta/GA4/Clarity) e seus IDs. **Bloqueiam toda a Parte B (TRACK-07 + verificação real de TRACK-05).** A Parte A (implementação de `section_view`/`scroll_depth` + todos os testes unitários) é **100% executável sem essas contas** — `track()` faz no-op gracioso quando `window.gtag`/`fbq`/`clarity` ausentes (já testado em `analytics.test.ts`).

**Missing dependencies with fallback:** Nenhuma.

## Security Domain

> `security_enforcement` não está `false` em config — seção incluída. Escopo de segurança aqui é estreito: analytics client-side e PII em gravação de sessão.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | não | — |
| V3 Session Management | não | — |
| V4 Access Control | não | — |
| V5 Input Validation | parcial | `scroll_depth` `depth` e `section_view` `section` são valores literais controlados pelo código (não input de usuário) — sem superfície de injeção. |
| V6 Cryptography | não | `event_id` usa `crypto.randomUUID()` (já implementado) — não é segredo, é dedup id. |
| V8 Data Protection / Privacy | **sim** | PII (nome, WhatsApp, email no form) não pode vazar para gravações de sessão. Controle: `data-clarity-mask="true"` (já presente). |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| PII (nome/WhatsApp/email) capturada em gravação de sessão Clarity | Information Disclosure | `data-clarity-mask="true"` no `<form>` e `<section>` (já entregue Phase 5). Masking é client-side — conteúdo nunca sai do browser. Verificar em gravação real (B7). |
| `event_id` ou payload com PII enviados a vendors | Information Disclosure | Payloads de `section_view`/`scroll_depth` carregam só `section`/`depth` + `event_id` — zero PII. `form_*` events já carregam só metadados (`has_message`, `status`), nunca o conteúdo dos campos. Manter assim — **não adicionar campos de PII a payload de analytics**. |
| Consent/LGPD — scripts de tracking sem consentimento | Compliance | **Out of scope** desta phase (deferido — cookie banner LGPD → Phase 7/backlog). Documentado como dívida conhecida. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Lenis 1.3.x faz scroll real do document → `window.scrollY` e evento `scroll` nativo continuam válidos para `<ScrollDepthTracker />` | Pattern 2 | Se Lenis interceptasse o scroll de forma não-nativa, o listener nativo não veria scroll → mitigar consultando a instância Lenis (`lenis.on('scroll')`). Verificar em smoke test visual / DebugView (B). |
| A2 | RAF síncrono via `vi.stubGlobal` é suficiente para testar `ScrollDepthTracker` em jsdom | Code Examples / Pitfall 2 | Se o componente usar RAF de forma diferente do exemplo, o stub precisa ajustar — baixo risco, padrão conhecido. |
| A3 | `threshold: 0.15` é robusto para `section_view` em seções de qualquer altura no mobile | Pitfall 6 | Se Product (sticky stack) ainda não disparar, ajustar para `threshold: 0` + `rootMargin`. Validável em smoke test, sem custo de rework estrutural. |
| A4 | IO sentinelas vs RAF — RAF é a escolha mais simples para 4 marcos de % fixos | Alternatives Considered | Decisão de design; ambas funcionam. Se RAF revelar jank (improvável), trocar por sentinelas é refactor isolado de 1 arquivo. |
| A5 | Os testes de componente da Phase 5 já cobrem o disparo de `cta_click`/`whatsapp_click`/`form_*` pelos componentes | Validation §Test Map | Se não cobrirem, o planner adiciona testes de regressão leves. `tests/lib/analytics.test.ts` já cobre o `track()` em si. |

## Open Questions

1. **`section_view` cobre Hero e Form além das 5 narrativas?**
   - O que sabemos: CONTEXT diz "Pain, Bridge, Product, HowItWorks, Proof — e idealmente Hero e Form".
   - O que não está claro: payload `section` para Hero/Form (`"hero"`, `"form"`).
   - Recomendação: incluir as 7 seções — custo marginal zero (uma linha por seção), e Hero/Form view são sinais úteis de funil. Planner decide; default = 7 seções.

2. **TRACK-06 vira teste de render ou grep test em VALIDATION.md?**
   - O que sabemos: precisa garantir um único `<GoogleAnalytics>`, zero GA manual.
   - Recomendação: grep test simples (`grep -c GoogleAnalytics` = 1; grep por `gtag.*page_view` manual = 0) em VALIDATION.md é mais barato e direto que um teste de render do provider. Planner decide.

3. **`section` keys — string literal solta ou tipo?**
   - Recomendação: definir um tipo `SectionName` (ou usar as `id`s de seção já existentes: `pain`, `bridge`, etc.) para evitar typo silencioso. Baixo custo, melhora a verificabilidade. Discricionário.

## Sources

### Primary (HIGH confidence)
- Codebase (`Read`): `src/lib/analytics.ts`, `src/components/providers/analytics-provider.tsx`, `src/hooks/use-in-view.ts`, `src/hooks/use-form-in-view.ts`, `src/sections/Form/index.tsx`, `src/sections/Pain/index.tsx`, `src/components/ui/whatsapp-cta.tsx`, `src/sections/Form/LeadForm.tsx`, `vitest.config.ts`, `tests/setup.ts`, `tests/lib/analytics.test.ts`, `package.json` — estado real da instrumentação verificado.
- [Next.js — Third Party Libraries guide](https://nextjs.org/docs/app/guides/third-party-libraries) — `<GoogleAnalytics>` trata route changes — HIGH
- [Microsoft Learn — Masking content (Clarity)](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking) — `data-clarity-mask`, masking client-side, ~30 min de processamento — HIGH

### Secondary (MEDIUM confidence)
- [Swetrix — Next JS Google Analytics 2026](https://swetrix.com/blog/next-js-google-analytics) — double-fire causado por dois mecanismos GA — MEDIUM
- [Medium — GA4 in Next.js 15 with @next/third-parties](https://medium.com/@koriigami/google-analytics-in-next-js-15-with-next-third-parties-164be149e7b7) — corrobora abordagem oficial — MEDIUM

### Tertiary (LOW confidence)
- Padrão RAF-throttle de scroll e IO-sentinelas — síntese de conhecimento consolidado; verificável em smoke test (A1, A4).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tudo já instalado e verificado em `package.json`.
- Architecture (Parte A): HIGH — padrões IO/RAF são consolidados e o projeto já tem precedente (`use-in-view.ts`, `use-form-in-view.ts`, `floating-whatsapp.test.tsx`).
- Pitfalls: HIGH para 2-5, MEDIUM para 1 e 6 (comportamento mobile/threshold validável só em device real / smoke test).
- Parte B: MEDIUM — bloqueada por contas externas; checklist é sólido mas só executável quando os IDs existirem.

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (stack estável; revisar se `@next/third-parties` ou Clarity mudarem API de masking)
