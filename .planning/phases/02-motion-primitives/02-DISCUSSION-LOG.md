# Phase 2: Motion Primitives - Discussion Log

> **Audit trail only.** Não usar como input direto para planning, research ou execution.
> As decisões canônicas estão em `02-CONTEXT.md` — este log preserva as alternativas consideradas.

**Date:** 2026-05-16
**Phase:** 2 — Motion Primitives
**Areas discussed:** API do `<ScrollScene>`, Estratégia de `<StickyStage>` (risco iOS), Matriz device-tier × primitiva, Showcase `/dev` + validação real-device + API freeze

---

## Área 1 · API do `<ScrollScene>` + contrato GSAP-future

### Q1 — Como as seções devem consumir o progress 0→1 do `<ScrollScene>`?

| Option | Description | Selected |
|--------|-------------|----------|
| Render prop apenas: `<ScrollScene>{(progress) => ...}` | Explicit, sem context overhead, sem 'magic'. Caller vê o MotionValue como argumento. Ótimo p/ GSAP future. | ✓ |
| Hook `useSceneProgress()` via Context | Mais legível em árvores profundas, mas re-render cascata, harder GSAP swap. | |
| Ambos: render prop default + hook como escape hatch | API surface dobra; risco de incoerência. | |
| Ref + imperative: `sceneRef.current.progress` | Não casa com React declarativo. NOT RECOMMENDED. | |

**Notes:** Render prop puro mantém o boundary mais limpo e portável para GSAP no futuro.

### Q2 — O que o ScrollScene expõe: só progress 0→1, ou objeto com sub-ranges?

| Option | Description | Selected |
|--------|-------------|----------|
| Só `progress: MotionValue<number>` 0→1 plain | Mínimo, expressivo. Caller deriva via `useTransform`. | ✓ |
| Objeto `{ progress, isInView, hasEntered, hasExited }` | Mais conveniência mas surface maior, freeze cobre mais coisas. | |
| Multi-stage `{ enter, scrub, exit }` | Provável exagero para v1. | |

**Notes:** Minimalismo do contrato; sub-ranges derivam via `useTransform`.

### Q3 — Como configurar o range de scroll que mapeia para 0→1 (offsets)?

| Option | Description | Selected |
|--------|-------------|----------|
| Default sensato + override opcional `offset?=['start end', 'end start']` | Casa com sintaxe FM useScroll, cobre 90% sem prop. | ✓ |
| Apenas o default, sem prop | Mais rígido; força adicionar prop depois (quebra freeze). | |
| Sintaxe própria simplificada `offset?='center' \| 'sticky' \| 'full'` | Amarra implementação aos presets escolhidos hoje. | |

**Notes:** Preserva simplicidade no default, flexibilidade quando precisar (hero, sticky, narrativas específicas).

### Q4 — Quem renderiza o `<ScrollScene>`: client component obrigatório?

| Option | Description | Selected |
|--------|-------------|----------|
| ScrollScene é 'use client' obrigatório; pai pode ser Server | App Router-friendly, page.tsx fica RSC. | ✓ |
| ScrollScene + tudo dentro vira client | Perde SSR de árvores grandes. NOT RECOMMENDED. | |

---

## Área 2 · Estratégia de `<StickyStage>` (risco iOS Safari)

### Q1 — Qual estratégia de pinning?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS `position: sticky` puro + Lenis colaborando | Lenis 1.3+ é transform-based, sticky funciona em iOS com syncTouch:false. Simples, performant, SEO-friendly, semântico. | ✓ |
| JS-driven: transform translateY conforme scroll | Mais controle, evita incógnita do sticky iOS. Mais cálculo/frame, sem fallback gracioso. | |
| Híbrido: sticky default + fallback JS via feature detection | Complexo, dois caminhos de teste, debugging difícil. | |

**Notes:** Lenny pediu priorizar comportamento nativo do browser; estabilidade, performance, semântica e manutenção simples acima de engine JS custom.

### Q2 — Como o StickyStage declara a "duração do pin"?

| Option | Description | Selected |
|--------|-------------|----------|
| Prop explícita `length` em viewport units (ex: length='200svh') | Previsível, legível, casa com sticky CSS (altura do container externo). | ✓ |
| Auto-medido: pin dura enquanto children > viewport | Risco de layout shift quando children animam ou imagens carregam tarde. | |
| `steps + stepHeight` | Amarra StickyStage à narrativa Product específica. | |

**Notes:** Controle criativo do pacing, evitar mágica e layout shift.

### Q3 — Como lidar com a address bar do iOS?

| Option | Description | Selected |
|--------|-------------|----------|
| Sempre `svh`; `dvh` banido em StickyStage | Estabiliza pin, usuário nunca vê stage esticar quando bar recolhe. | ✓ |
| Prop `unit?: 'svh' \| 'dvh' = 'svh'` | Aumenta API surface e risco de uso errado escapar em PR. | |
| Calcular altura via JS uma vez no mount + lock | Rotação quebra, over-engineering vs svh. | |

**Notes:** Aceita pequena perda de espaço em troca de estabilidade visual absoluta.

### Q4 — Como StickyStage interage com Lenis?

| Option | Description | Selected |
|--------|-------------|----------|
| Nada especial — sticky CSS + Lenis com syncTouch:false é suficiente | Pragmático, baixo overhead, validar real-device antes de adicionar coord. | ✓ |
| `useLenis` interno pra pausar/retomar smooth quando pinado | Pode dar sensação de scroll quebrado em transições do pin. | |
| `data-lenis-prevent` no stage | Quebra coerência do scroll cinematográfico inteiro. NOT RECOMMENDED. | |

**Notes:** Baixo acoplamento; ajustar empiricamente se aparecer necessidade real.

---

## Área 3 · Matriz device-tier × primitiva

### Q1 — `<RevealOnView>`: como variar fade+slide por tier?

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile distance/duration menor; desktop completo; reduced=instant | Mobile ~12px/400ms; tablet ~16px/500ms; desktop ~24px/600ms; stagger 60/70/80ms. | ✓ |
| Comportamento idêntico em todos os tiers; só reduced muda | Mobile fica pesado, gasta attention budget. Não casa com mobile-premium. | |
| Caller define overrides por tier opcionalmente | API muito mais complexa, congelamento cobre mais surface. | |

**Notes:** Lenny prioriza defaults sólidos e consistentes sobre overrides por seção. Mobile mais sutil, desktop mais cinematográfico.

### Q2 — `<ParallaxLayer>`: magnitudes por tier?

| Option | Description | Selected |
|--------|-------------|----------|
| Mobile: 0 / Tablet: ~0.1 / Desktop: ~0.2 / Reduced: 0 | Mobile flat (REQ MOTION-02), profundidade leve no tablet, médio no desktop. Sutil. | ✓ |
| Mobile: 0 / Tablet=Desktop: ~0.2 | Menos sutileza entre tiers. | |
| Mobile: 0 / Tablet: ~0.2 / Desktop: ~0.35 | Risco de feel "AI SaaS template" que o brand book proíbe. | |

**Notes:** Parallax como atmosfera/profundidade, quase imperceptível conscientemente. Não espetáculo.

### Q3 — `<TextSplit>`: granularidade + implementação?

| Option | Description | Selected |
|--------|-------------|----------|
| Desktop=palavra (stagger ~25ms) / Mobile-tablet=linha (stagger ~80ms) / Reduced=instant. Spans manuais sem lib. | Casa com REQ MOTION-04. Sem dep externa (~30 LoC). | ✓ |
| Mesma granularidade word em todos os tiers | Viola REQ MOTION-04. | |
| Usar splitting.js / Motion split util | Dep externa para problema pequeno; peso extra desnecessário. | |

**Notes:** Editorial e sofisticado, ajuda narrativa sem atrapalhar leitura. Mobile = leitura rápida; desktop = mais cinematicidade.

---

## Área 4 · Showcase /dev + validação real-device + API freeze

### Q1 — Como o `/dev` expõe as 5 primitivas?

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-rotas isoladas + uma rota `/dev/all` combinada | Isola debug + valida interação real. | ✓ |
| Sub-rotas isoladas apenas | Não valida co-existência de primitivas. | |
| Página única `/dev` com tudo empilhado | Difícil isolar bug. | |

**Notes:** Melhor dos dois mundos — isolamento para debug + validação combinada para experiência real.

### Q2 — Como o Lenny valida real-device (iPhone + Android)?

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel preview URLs por PR | Zero setup, mais próximo do ambiente real, preview noindex. | ✓ |
| Túnel local (ngrok / cloudflared / Vercel dev tunnel) | Setup recorrente, latência local pode mascarar perf real. | |
| IP local 192.168.x.x:3000 | Não testa build prod nem CDN behavior. | |

**Notes:** Túneis locais ficam reservados pra debugging rápido em casos específicos, não fluxo principal.

### Q2.1 — `/dev` retorna 404 em preview (NODE_ENV=production no Vercel). Como permitir?

| Option | Description | Selected |
|--------|-------------|----------|
| `VERCEL_ENV !== 'production'` (libera dev + preview, bloqueia produção real) | Distingue preview real de prod real. Fricção zero. | ✓ |
| Basic auth com senha | Overhead, friction pro Lenny no celular. | |
| Token na query string | Token vaza em logs, segurança ilusória. | |

**Notes:** Combinado com X-Robots-Tag noindex (FOUND-11) em previews, /dev fica acessível sem vazar em likro.com.br.

### Q3 — Como enforcar "API congelada após Phase 2" (MOTION-06)?

| Option | Description | Selected |
|--------|-------------|----------|
| Barrel `index.ts` + tipos rígidos + README + cabeçalho `@frozen` em cada arquivo | Defesa em 3 camadas, baixo overhead, processo claro via PR label. | ✓ |
| Só README + cultura | Nada impede caller de bypassar; sem enforcement em time pequeno é arriscado. | |
| ESLint custom rule bloqueando imports internos | Overhead pra escrever e manter; Phase 1 D-15 já descartou ESLint custom. | |

**Notes:** Abordagem disciplinada, explícita, simples e fácil de manter. Sem overengineering, sem tooling pesado.

### Q4 — `<StickyStage>` em `prefers-reduced-motion`: o que acontece?

| Option | Description | Selected |
|--------|-------------|----------|
| Mantém sticky CSS (estrutural) + zera animações dentro (scrub off, conteúdo em estado final) | Estrutura coerente, sem motion progressivo, casa com MOTION-07. | ✓ |
| Desliga sticky tamb: vira fluxo normal vertical com conteúdo em estado final | Espaço vazio enorme (length="Nsvh" continua reservado). Quebra leitura. | |
| Mantém tudo (sticky + scrub), reduz só fade/slide | Viola MOTION-07. NOT RECOMMENDED. | |

**Notes:** Sticky é layout, não motion. Preserva clareza, estrutura, estabilidade do layout em reduced.

---

## Claude's Discretion

Áreas onde o planner/executor decidirá detalhes dentro das decisões acima:

- Easing curves exatos por primitiva (Linear-Stripe feel: `cubic-bezier(0.16, 1, 0.3, 1)` ou similar)
- Threshold do `whileInView` do RevealOnView (sugestão amount=0.15-0.3, calibrar empiricamente)
- Estrutura interna de pastas em `components/motion/` (arquivo único por primitiva vs sub-pasta) — desde que barrel `index.ts` exponha o contrato
- Componentes auxiliares internos não exportados (helpers como `splitIntoLines`) — em `components/motion/internal/` ou similar
- Estratégia exata de measurement do TextSplit em mobile (debounce/recalc on resize)
- Cor / estilo dos placeholder rectangles no `/dev`

## Deferred Ideas

Capturadas na seção `<deferred>` do CONTEXT.md. Resumo:
- Easing customizados por primitiva (refinamento futuro)
- FPS counter / motion HUD no /dev (Phase 7 se necessário)
- Hook `useSceneProgress()` como escape hatch (requer freeze break)
- `StickyStage` em modo "steps discretos" (criar wrapper se Phase 4 pedir)
- ESLint custom rule (Phase 1 D-15 já descarta)
- Basic auth ou token /dev (fricção desnecessária)
- GSAP/ScrollTrigger drop-in real (V2-MOTION-01 milestone futuro)
- `<ParallaxLayer>` profundidade negativa (sem caso de uso na v1)
