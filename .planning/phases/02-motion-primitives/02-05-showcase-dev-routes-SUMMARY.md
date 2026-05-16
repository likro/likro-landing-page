---
phase: 02-motion-primitives
plan: 05
subsystem: motion-primitives
tags:
  - dev-showcase
  - sub-routes
  - real-device-validation
  - dev-gate-reuse
  - placeholder-block
  - frozen-api-consumer
dependency_graph:
  requires:
    - phase-02 plan-01 (assertDevAccess pattern em /dev/page.tsx; barrel @frozen scaffold)
    - phase-02 plan-02 (RevealOnView + ParallaxLayer exportadas pelo barrel)
    - phase-02 plan-03 (ScrollScene render-prop contract + TextSplit exportados pelo barrel)
    - phase-02 plan-04 (StickyStage exportada com `length: ${number}svh` compile-time guard)
    - phase-01 (Container, Headline, tokens surface-*/text-*/neutral-*/border-subtle, cn helper)
  provides:
    - "6 sub-rotas funcionais /dev/{reveal,parallax,sticky,textsplit,scene,all} — gateway de validação real-device iOS/Android via Vercel previews"
    - "Helpers DRY: assertDevAccess() (server-only gate D-15 reutilizável) + <PlaceholderBlock> (placeholder visual premium, 4 sizes × 3 tones, sem accent)"
    - "Pattern arquitetural validado: layout.tsx server (gate D-15) + page.tsx eventualmente client (consome render-prop ScrollScene com useTransform)"
    - "Nav consolidada em /dev raiz com 6 cards premium linkando as sub-rotas — Lenny abre 1 click por primitiva no device-alvo"
  affects:
    - "Plan 06 (README.md) documentará as 6 URLs como pontos de entrada da validação real-device + lista de devices testados"
    - "Phase 4 seções terão patterns reais (sticky+scrub+parallax co-existindo em /dev/all) pra copiar — smoke test antes de cada seção"
    - "Bloqueia fechamento da Phase 2 até Lenny validar /dev/sticky e /dev/all em iPhone iOS real + Android real"
tech_stack:
  added: []
  patterns:
    - "Server layout.tsx + client page.tsx — layout aplica gate D-15 em todas as requests, page.tsx pode ser client (necessário para useTransform no render-prop do ScrollScene). Aplicado em /dev/scene, /dev/sticky e /dev/all"
    - "assertDevAccess() em src/app/dev/_components/dev-gate.tsx — extrai a lógica do gate D-15 da /dev/page.tsx para reuso DRY. Marcador `server-only` força erro em build se importado por client component"
    - "PlaceholderBlock em src/app/dev/_components/placeholder-block.tsx — 4 sizes (sm/md/lg/xl) × 3 tones (dark/light/tinted) usando exclusivamente tokens surface/neutral/border. Tom 'tinted' mapeia para neutral-100 (token real do globals.css; não existe surface-tinted)"
    - "Underscore-prefix `_components/` — convenção Next.js App Router (pastas que começam com `_` não são rotas), co-locando helpers de /dev sem poluir routing"
    - "Plain <a href> em vez de <Link> no nav de /dev raiz — força page reload entre primitivas, evitando state leak (não é SPA-critical)"
    - "EXCEÇÃO controlada do barrel reforçada: em /dev/scene/page.tsx e /dev/all/page.tsx, importar useTransform/motion direto de 'motion/react' é o ÚNICO bypass legítimo da regra MOTION-05 — é exatamente o que o contrato D-02 viabiliza (caller deriva sub-ranges do MotionValue exposto pelo ScrollScene render prop)"
key_files:
  created:
    - src/app/dev/_components/dev-gate.tsx
    - src/app/dev/_components/placeholder-block.tsx
    - src/app/dev/reveal/page.tsx
    - src/app/dev/parallax/page.tsx
    - src/app/dev/sticky/page.tsx
    - src/app/dev/sticky/layout.tsx
    - src/app/dev/textsplit/page.tsx
    - src/app/dev/scene/page.tsx
    - src/app/dev/scene/layout.tsx
    - src/app/dev/all/page.tsx
    - src/app/dev/all/layout.tsx
  modified:
    - src/app/dev/page.tsx
decisions:
  - "Tokens adaptados ao globals.css real — plan original mencionava `bg-surface-tinted` e `border-border`, mas globals.css declara apenas surface-{dark,darker,light,lighter} + border-{subtle,default}. Mapeamento aplicado: tone='tinted' → bg-neutral-100 + border-border-subtle; tone='light' → bg-surface-lighter + border-border-subtle. Paleta neutra preservada (zero accent), brand book honrado"
  - "ESLint react-hooks/rules-of-hooks disabled localmente em /dev/scene/page.tsx e /dev/all/page.tsx — ESLint não consegue inferir estaticamente que o render prop é executado no scope do componente client React. eslint-disable-next-line posicionado na linha exata de cada useTransform (não no return wrapper). Pattern segue Plan 03 (ScrollScene cast)"
  - "Tom 'dark' usa text-text-on-dark-primary (token Phase 1) em vez de text-white plain — coerência com o sistema de tipografia on-dark já estabelecido"
  - "/dev/sticky usa text-text-on-dark-primary no Stage A para os mesmos motivos. Negative grep '! grep dvh' passou (zero menções literais — comentários paráfrasados como 'viewport units estáveis')"
  - "/dev/scene/page.tsx + /dev/all/page.tsx têm cabeçalho documentando explicitamente a exceção controlada de useTransform — reforça o contrato congelado para futuros consumidores que vierem ler estas pages como referência (Phase 3+ seções)"
  - "/dev/sticky.page.tsx renderiza checklist visível de 5 critérios real-device (no <ul>) — Lenny tem a lista na tela quando abre no iPhone, não precisa alternar entre URL e plano"
metrics:
  duration: "~12min"
  completed: "2026-05-16"
  tasks: 4
  files_created: 11
  files_modified: 1
requirements:
  - MOTION-01
  - MOTION-02
  - MOTION-03
  - MOTION-04
  - MOTION-05
  - MOTION-07
  - MOTION-08
---

# Phase 2 Plan 5: Showcase /dev Sub-Routes Summary

**One-liner:** Showcase isolado de cada uma das 5 primitivas em sub-rotas dedicadas (`/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene`) + uma rota combinada (`/dev/all`) que integra as 5 num scroll único — gateway de validação real-device iOS/Android via Vercel preview URLs, fechando o caminho crítico para fechamento da Phase 2.

## What Was Built

### Helpers compartilhados — `src/app/dev/_components/`

- **`dev-gate.tsx`** — `assertDevAccess()` server-only. Mesma matriz de comportamento do gate inline da `/dev/page.tsx` (Plan 01), agora DRY e reutilizável pelas sub-rotas e seus layouts. Marcador `import "server-only"` força build error se importado em client component.
- **`placeholder-block.tsx`** — `<PlaceholderBlock>` aesthetic premium. 4 sizes (`sm`=h-24, `md`=h-40, `lg`=h-64, `xl`=h-96) × 3 tones (`dark` / `light` / `tinted`). Paleta exclusivamente neutra (zero accent — brand book não permite roxo aqui).

### 6 sub-rotas

| Rota | Tipo | Gate | Foco |
|------|------|------|------|
| `/dev/reveal` | server page | inline | RevealOnView: single + manual stagger (3 siblings via delayMs) + repeat=true |
| `/dev/parallax` | server page | inline | ParallaxLayer: single + layered (depth via 2 magnitudes 0.1/0.3) |
| `/dev/textsplit` | server page | inline | TextSplit: h2 hero + p paragrafo (alternar tier via DevTools) |
| `/dev/sticky` | server page | layout server | StickyStage: Stage A (200svh) + Stage B (400svh, Product-like) + checklist real-device on-screen |
| `/dev/scene` | **client page** | layout server | ScrollScene render-prop com useTransform (exceção controlada D-02) |
| `/dev/all` | **client page** | layout server | 5 primitivas em scroll único — smoke test pra Phase 4 |

### Pattern arquitetural: layout server + page client

`/dev/scene` e `/dev/all` precisam ser client porque consomem `useTransform` no scope do componente para derivar sub-ranges do `MotionValue<number>` exposto pelo render prop do `<ScrollScene>` (D-02 / MOTION-05).

Como gates do tipo `if (process.env.VERCEL_ENV === "production") notFound()` exigem server boundary (`process.env.VERCEL_ENV` não existe no client), o pattern adotado é:

```
src/app/dev/{scene,all}/
├── layout.tsx     ← Server Component — chama assertDevAccess()
└── page.tsx       ← "use client" — demonstra render prop
```

Layout roda antes da page client em toda request — gate executa universalmente sem precisar de duplicação no client.

`/dev/sticky` também usa `layout.tsx` server (mesmo a page sendo server hoje) para uniformidade arquitetural e flexibilidade futura.

### Nav consolidada em `/dev` raiz

Seção "Motion Primitives (Phase 2)" reescrita: substitui o placeholder "Será populado na Phase 2" por uma grade de 6 cards premium (sm:2 lg:3 colunas) linkando cada sub-rota com título + descrição curta. Cards usam `bg-surface-lighter` + `border-border-subtle` + hover `bg-neutral-100` — sem accent, alinhado com brand.

Cada card é `<a href>` plain (não `<Link>`) — força reload entre primitivas, evita state leak entre demos animadas.

## Verification Results

- `npm run build` exit 0 — 4 builds verdes (1 por task)
- 7 rotas estáticas geradas em /dev/* (raiz + 6 sub-rotas):
  - `/dev` 74.9 kB / First Load 184 kB
  - `/dev/all` 1.24 kB / 156 kB
  - `/dev/parallax` 1.8 kB / 155 kB
  - `/dev/reveal` 1.8 kB / 155 kB
  - `/dev/scene` 687 B / 156 kB
  - `/dev/sticky` 1.8 kB / 155 kB
  - `/dev/textsplit` 1.8 kB / 155 kB
- Acceptance criteria — todos os greps passam:
  - **Existência:** 11 arquivos criados, 1 modificado ✓
  - **Gate aplicado:** `assertDevAccess` presente em todas as sub-rotas (inline nas server pages; via layout.tsx em scene/sticky/all) ✓
  - **Imports do barrel:** `from "@/components/motion"` presente em reveal/parallax/textsplit/scene/sticky/all ✓
  - **Sem import direto de motion/react** em reveal/parallax/textsplit (3 server pages que não precisam) ✓
  - **EXCEÇÃO controlada** em /dev/scene e /dev/all (`from "motion/react"`) ✓ — esperado e documentado
  - **/dev/sticky negativos:** zero `lenis`, zero `dvh`, apenas `svh` (D-07 + D-08) ✓
  - **/dev/page.tsx nav:** 6 hrefs presentes, placeholder "Será populado na Phase 2" removido ✓

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Tokens do PlaceholderBlock não existiam no globals.css**

- **Found during:** Task 1 (durante leitura do globals.css para confirmar tokens disponíveis antes de escrever o componente).
- **Issue:** Plano original sugeria `bg-surface-tinted`, `text-text-secondary`, `border-border`. Os dois últimos existem (`--color-text-secondary`, `--color-border-default/subtle`), mas `surface-tinted` NÃO existe — globals.css declara apenas `surface-{dark,darker,light,lighter}`. Em Tailwind v4, classes que referenciam tokens não declarados viram no-op silencioso — placeholders renderizariam transparentes em produção.
- **Por que auto-fix:** O plano explicita exatamente este cenário no `<action>` da Task 1 ("Se algum nome divergir, **adaptar para o nome real** mantendo a paleta neutra (sem usar accent)"). Não é deviation real — é instrução explícita executada.
- **Fix aplicado:** Mapeamento de tones:
  - `tone="tinted"` → `bg-neutral-100 text-text-secondary border border-border-subtle`
  - `tone="light"` → `bg-surface-lighter text-text-secondary border border-border-subtle`
  - `tone="dark"` → `bg-surface-dark text-text-on-dark-primary`
- **Files modified:** `src/app/dev/_components/placeholder-block.tsx`
- **Commit:** `71173f8`

**2. [Rule 3 — Blocking] ESLint react-hooks/rules-of-hooks no useTransform dentro de render prop do ScrollScene**

- **Found during:** Task 2 (`npm run build` exigido por acceptance criteria) — também rebatido na Task 4 em /dev/all.
- **Issue:** ESLint flagou erros `React Hook "useTransform" cannot be called inside a callback` em `/dev/scene/page.tsx:38,43` e similarmente em `/dev/all/page.tsx`. O render prop do `<ScrollScene>` é a EXCEÇÃO controlada documentada no barrel (D-02 / MOTION-05) — chamar `useTransform` ali É válido em runtime (callback executa no scope do componente client React durante render), mas ESLint não consegue inferir isso estaticamente. Sem o disable, o build falha (TS strict + ESLint as errors).
- **Por que auto-fix:** Acceptance criteria da Task 2/4 inclui `npm run build` exit 0. Sem corrigir, o build trava. Fix é estritamente sobre disable do warning na linha exata (não comportamento) — pattern já estabelecido em Plan 03 (cast `ref as any` em ScrollScene tinha o mesmo problema de inferência ESLint).
- **Fix aplicado:** `// eslint-disable-next-line react-hooks/rules-of-hooks` imediatamente acima de cada call de `useTransform` dentro do render prop. Comentário inline reforçando que é a exceção controlada D-02.
- **Files modified:** `src/app/dev/scene/page.tsx`, `src/app/dev/all/page.tsx`
- **Commits:** `4057af7` (scene), `8ccae61` (all)

Nenhuma outra deviation. Plano executado conforme escrito.

### Deferred Items (fora do escopo deste plan)

- **Warning ESLint pré-existente em `src/lib/analytics.ts:80`** — `Unused eslint-disable directive`. Drift de Phase 1 / Plan 01, herdado pelos plans 02-04 e agora 05. Não bloqueia o build (apenas warning). Fora do escopo desta plan (Rule SCOPE BOUNDARY). Não corrigido aqui.

## Real-Device Validation — Workflow Pronto

Esta plan é o gateway da validação real-device (D-14). Workflow esperado após merge deste plan:

1. **PR → Vercel preview URL** (`<sha>-likro.vercel.app` ou similar)
2. **Lenny abre `<preview>.vercel.app/dev` no iPhone iOS real (Safari, não emulator):**
   - Toca em "StickyStage" no nav → `/dev/sticky` carrega
   - Lê os 5 critérios on-screen (no `<ul>`)
   - Scrolla Stage A (200svh):
     - [ ] Pina por exatamente 2 viewports svh
     - [ ] SEM jump horizontal
     - [ ] SEM release prematuro
     - [ ] Address bar do iOS recolhe/expande SEM puxar o conteúdo pinado
   - Scrolla Stage B (400svh):
     - [ ] Mesmos critérios para 4 viewports svh
   - Volta para /dev → toca em "all" → `/dev/all` carrega:
     - [ ] Scroll completo sem bugs
     - [ ] StickyStage interage corretamente com seções acima/abaixo
     - [ ] Texto TextSplit aparece por linha (mobile granularity, D-12)
     - [ ] Parallax mobile = 0 (REQ MOTION-02)
3. **Mesma checklist em Android mid-tier real Chrome.**
4. **Reduced motion:** Settings → Accessibility → Reduce Motion (iOS) ou Animations (Android). Recarrega `/dev/reveal`, `/dev/textsplit`, `/dev/parallax`:
   - [ ] Reveal: estado final imediato
   - [ ] TextSplit: texto plano (zero spans aparecendo)
   - [ ] Parallax: zero translation
   - [ ] StickyStage (`/dev/sticky`): sticky preservado (D-09 — estrutura mantida)
5. **DevTools audit (MOTION-08):** em `/dev/all`, Performance recording de scroll completo:
   - [ ] Nenhum Layout reflow por animação
   - [ ] Apenas Composite Layers no rastro
   - [ ] FPS ≥ 50 sustentado em mobile-emulated 4x CPU throttle

Se alguma checklist falhar, **D-08 explícito:** diagnosticar antes de adicionar coordenação JS com smooth-scroll engine. Soluções por ordem: confirmar `syncTouch: false`; revisar uso de `svh` no caller; só então considerar JS adicional.

## Próximas Waves

- **Plan 06 (Wave 4 — fechamento da Phase 2):** `README.md` em `components/motion/` (D-17) — contrato congelado das 5 primitivas com exemplos, freeze policy, lista de devices validados, política de extensão. Linka as 6 URLs criadas neste plan como pontos de entrada de validação.

## Pattern Validado (continuação)

Plan 05 consolida 4 patterns úteis para futuro:

1. **assertDevAccess() server-only helper** — qualquer rota interna futura (`/admin`, `/debug`) pode reusar diretamente; matriz de comportamento dos 4 cenários VERCEL_ENV × NODE_ENV já testada.
2. **PlaceholderBlock como placeholder visual padrão** — qualquer showcase futuro (Phase 4 internal demos, Phase 7 hardening pages) pode reusar. Pattern de "premium aesthetic mesmo em /dev" — Linear/Stripe feel está nos detalhes.
3. **Layout server + page client** — pattern reusável para qualquer rota interna que precise consumir `useTransform`/render-prop de ScrollScene mantendo gate server. Generaliza além de /dev.
4. **EXCEÇÃO controlada D-02 + eslint-disable-next-line** — documentação on-site do bypass legítimo. Quando Phase 4 seções consumirem ScrollScene, este pattern será o template.

## Known Stubs

Nenhum stub introduzido. Todas as sub-rotas renderizam conteúdo funcional (placeholders + primitivas reais). O nav de `/dev` raiz aponta para rotas existentes e gera 200 em todos os ambientes liberados (local dev + Vercel preview). Em produção real, todas as rotas /dev/* dão 404 graças aos gates D-15 cascateados.

`PlaceholderBlock` retorna placeholders por design — não é stub funcional, é a UX intencional do showcase. Phase 4 seções consumirão `next/image` + mockups reais conforme PROJECT.md.

## Threat Flags

Nenhuma nova superfície de ameaça (T-02-05 disposition=accept do plan):

- 6 sub-rotas + 1 nav consolidada → todas server-rendered ou client-only-React. Sem inputs do usuário, sem chamadas de rede, sem persistência.
- `assertDevAccess` blocking em produção real (`VERCEL_ENV === "production"`) — mesma defesa-em-profundidade do Plan 01.
- Previews `.vercel.app` permanecem noindex via FOUND-11 (robots.txt + X-Robots-Tag).
- Placeholders + texto explicativo de primitivas WIP — sem credenciais, PII ou dados operacionais.

STRIDE vetor = zero.

## Self-Check: PASSED

- FOUND: `src/app/dev/_components/dev-gate.tsx`
- FOUND: `src/app/dev/_components/placeholder-block.tsx`
- FOUND: `src/app/dev/reveal/page.tsx`
- FOUND: `src/app/dev/parallax/page.tsx`
- FOUND: `src/app/dev/sticky/page.tsx`
- FOUND: `src/app/dev/sticky/layout.tsx`
- FOUND: `src/app/dev/textsplit/page.tsx`
- FOUND: `src/app/dev/scene/page.tsx`
- FOUND: `src/app/dev/scene/layout.tsx`
- FOUND: `src/app/dev/all/page.tsx`
- FOUND: `src/app/dev/all/layout.tsx`
- FOUND: `src/app/dev/page.tsx` (modified — nav com 6 cards)
- FOUND: commit `71173f8` (Task 1 — helpers)
- FOUND: commit `4057af7` (Task 2 — 4 sub-routes)
- FOUND: commit `de51ab2` (Task 3 — /dev/sticky)
- FOUND: commit `8ccae61` (Task 4 — /dev/all + nav)
- `npm run build` exit 0 (Tasks 1-4)
- Todos os greps de acceptance_criteria passam (positivos + negativos)
