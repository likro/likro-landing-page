# Phase 3: Hero (benchmarked isolado) - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega o **hero verticalizado para clínicas deployado sozinho na Vercel**, validando LCP < 2.5s mobile, copy aprovada pelo Lenny e WhatsApp deep link funcionando em iOS Safari e Android Chrome reais — antes de qualquer outra seção entrar na página. No fim dela:

- `/` em produção (preview Vercel) renderiza apenas o hero (zero outras seções abaixo)
- Header institucional minimalista (logo Likro + CTA WhatsApp secundário) no topo
- Hero split assimétrico: copy à esquerda + mockup à direita (desktop); stack vertical (mobile)
- Mockup principal = caixa de entrada multicanal **Atendimentos** (único `<Image>` com `priority`)
- 1 micro-card sobreposto no mockup (notificação/chip de status) — estático, sem animar entrada
- CTA primário **"Falar no WhatsApp"** com `location='hero'` + trust signal "sussurrado" abaixo
- Glow ambiente roxo pulsando muito devagar atrás do mockup (única animação no hero)
- 3 variantes de copy entregues no PR; Lenny aprova async via PR e merge
- Número WhatsApp `5511922324329` configurado em `NEXT_PUBLIC_WA_NUMBER` (Vercel + `.env.local`)
- Lighthouse mobile + PageSpeed Insights rodados manualmente contra a preview no fim da fase, registrados em `03-VERIFICATION.md`

**Não está nesta fase:**
- Seções narrativas (Pain/Bridge/Product/HowItWorks/Proof) — Phase 4
- Floating WhatsApp mobile, header hide-on-scroll, mobile menu — Phase 5
- Form consultivo, edge route `/api/lead` — Phase 5
- Validação sistêmica de eventos analytics nos 3 dashboards — Phase 6
- Lighthouse CI gate, WCAG AA audit completo, OG image polish — Phase 7
- Citação explícita do Dolce Home — depende de autorização do Lenny (prevista pra Phase 4)

</domain>

<decisions>
## Implementation Decisions

### Composição visual + mockup (LCP)

- **D-01:** Direção tonal **híbrida** — background dark editorial/cinematográfico com o mockup vivendo dentro de uma "janela"/superfície clara refinada. Ambiente escuro cria atmosfera e foco; mockup aparece como produto real dentro do próprio espaço. Sensação alvo: editorial, high-end, sofisticada, tecnológica, viva. A evitar: dark mode pesado demais, glow exagerado, "AI SaaS template", dashboard perdido em fundo escuro vazio, sci-fi/cyberpunk.

- **D-02:** Layout **split assimétrico** copy/mockup. Desktop: copy à esquerda (headline, sub, CTA, trust signal), mockup à direita ocupando ~55-60% horizontal com presença forte mas sem dominar. Mobile: stack vertical (copy em cima, mockup abaixo) com CTA acima da dobra (HERO-01). Bastante respiro entre blocos; composição assimétrica elegante. A evitar: layout SaaS genérico, hero excessivamente centralizado, mockup fullbleed pesado.

- **D-03:** Mockup principal = **caixa de entrada multicanal (Atendimentos)**. É o único `<Image>` com `priority` na página inteira (HERO-04). Comunica em segundos: centralização, WhatsApp + Instagram, atendimento organizado, operação viva, leads em um só lugar — exatamente a dor central da clínica. CRM Kanban e Relatórios ficam pra Phase 4 (seção Product). O screenshot exato é escolhido pelo executor a partir de `../prints_funcionalidades/` baseado em qualidade visual e densidade informacional adequada ao framing.

- **D-04:** Frame do mockup = **sem chrome de browser**. Mockup raw dentro de "janela" clara com radius 12px (brand book), sombra refinada (grande, difusa, baixa opacidade), borda 1px `border.subtle` (#E5E7EB). Tratado como interface real / objeto premium / superfície editorial. A evitar: chrome de Safari/Chrome (fica datado/tutorial), perspective/tilt forte (vira "AI SaaS template" + complica LCP), mockup flutuando no espaço.

- **D-05:** **1 único micro-card sobreposto** no mockup principal. Notificação curta tipo "Novo lead pelo Instagram" ou chip de status de atendimento — discreto, pequeno, com sombra própria suave, integrado visualmente. Funciona como **detalhe atmosférico/camada de vida**, não widget de marketing. Estático no carregamento (HERO-02 e HERO-03 — não anima entrada, mesmo sendo "secundário", pra evitar competir visualmente com o protagonista). Conteúdo exato (texto da notificação, ícone) — Claude propõe, Lenny aprova no PR junto com a copy.

- **D-06:** Decoração do entorno = **glow roxo extremamente sutil + grid/linhas abstratas leves + gradient neutro editorial quase imperceptível**, todos combinados sob disciplina pesada. Glow roxo (`accent.glow`) em um único ponto principal atrás do mockup, muito difuso, muito suave — sensação de iluminação ambiente, não orb neon. Grid/linhas extremamente sutis em baixa opacidade dando textura editorial abstrata (não dashboard sci-fi). Gradient neutro vertical/diagonal escuro→mais escuro como base atmosférica. Tudo em CSS puro (zero impacto LCP). A evitar: cyberpunk, glow exagerado, gradient saturado, poluição visual.

### Direção da copy

- **D-07:** **3 variantes contrastantes** de headline+sub entregues pelo Claude por PR. Abordagens distintas (não pequenas variações de frase): (a) afirmação de identidade vertical pura, (b) afirmação com leve influência de "categoria própria" (não é só CRM/não é só chatbot/não é só atendimento), (c) ângulo alternativo dentro da mesma família de tom (ex: especificidade operacional concreta tipo "DM → agendamento → retorno"). Todas mantêm tom premium, sofisticação, clareza imediata.

- **D-08:** Direção principal da H1 = **afirmação de identidade vertical** com influência leve de categoria-criação. Tem que soar como marca/categoria própria, ser sofisticada, clara em segundos, transmitir organização e centralização operacional. O usuário precisa sentir: *"isso foi feito exatamente para a operação da minha clínica"*. A evitar explicitamente: headline agressiva de tráfego pago, "Pare de perder leads", promessas exageradas, tom muito vendedor, clichês SaaS.

- **D-09:** Palavra **"clínica" aparece tanto na headline quanto na sub-headline** — repetição deliberada, segura, natural, sofisticada (não keyword stuffing). Verticalização cristalina já nos primeiros segundos. Atende COPY-03 (teste de especificidade — frase tem que falhar pra "qualquer SaaS"). Nada de SaaS genérico/amplo demais.

- **D-10:** **Sub-headline** complementa a H1 aterrando na operação concreta da clínica (lead do Instagram, atendimento centralizado, follow-up, agendamento). Tom complementar — se H1 é identidade, sub é "o quê na prática". Limite prático: 1-2 linhas mobile sem quebrar layout.

- **D-11:** **CTA primário do hero = "Falar no WhatsApp"**. Direto, canal explícito, zero ambiguidade — máxima clareza e mínima fricção. Tráfego majoritariamente mobile vindo de Instagram/Meta Ads; WhatsApp é o canal principal de conversão; usuário tem que saber instantaneamente qual ação vai acontecer. Refinamento vem de design, motion, composição visual e microinteração — não de esconder o comportamento. Usa `<WhatsAppCta variant="primary" location="hero">`.

### Header + trust signal + animações secundárias

- **D-12:** **Header estático simples** já na Phase 3. Layout: logo Likro à esquerda + `<WhatsAppCta variant="secondary" location="header">` à direita. Minimalista, leve, elegante, MUITO respiro, quase invisível estruturalmente — não compete com o hero. **Sem hide-on-scroll, sem mobile menu, sem mega menu, sem navegação extra** — esses comportamentos vivem na Phase 5 (MOBILE-06). Logo usa `../logos_likro/LIKRO LOGO.svg` copiado pra `public/`.

- **D-13:** **Trust signal "sussurrado"** abaixo do CTA primário — uma linha curta em `text.muted` que transmite operação real / credibilidade / produto vivo / baixa fricção / confiança, sem claims exagerados, sem números agressivos, sem logo bar, sem social proof forçado. **Sem citar Dolce Home explicitamente no hero** — autorização ainda pendente (STATE.md), prevista pra antes da seção Proof na Phase 4. Frase exata vem nas 3 variantes de copy do Claude e Lenny aprova junto.

- **D-14:** **Sem scroll cue** na Phase 3 — hero está isolado, scroll cue mente. Quando Phase 4 entrar, prefere-se conteúdo "vazando" abaixo da dobra / continuidade visual / composição sugerindo profundidade ao invés de seta animada explícita (clichê Awwwards).

- **D-15:** **Glow ambiente pulsando muito devagar** é a única animação no hero. Ciclo 8-12s, escala ~1 ↔ 1.05 + opacity sutil, ease-in-out. Atrás do mockup (compositing layer separado), zero impacto em LCP element. Funciona como iluminação ambiente / profundidade sutil / atmosfera premium — não efeito especial / orb neon / animação evidente. **Reduced motion (MOTION-07):** pulsação some, glow estático permanece (estrutura visual preservada). HERO-02/HERO-03 respeitados: headline, sub, CTA, mockup e micro-card NÃO animam entrada — renderizam estado final imediato.

### Operacionais (bloqueadores resolvidos)

- **D-16:** **`NEXT_PUBLIC_WA_NUMBER = 5511922324329`** — número oficial do WhatsApp da Likro fornecido pelo Lenny nesta discuss. Executor configura: (a) `.env.local` para dev, (b) variável de ambiente no painel Vercel (Production + Preview + Development), (c) atualiza STATE.md removendo a pendência. Desbloqueia validação real-device de HERO + helper `buildWhatsAppUrl` (que hoje só valida formato 12-13 dígitos com placeholder).

- **D-17:** **Cadência de copy review = async via PR seção-a-seção** (COPY-04). Para cada seção, Claude abre PR com as 3 variantes em `src/content/<secao>.ts` (variantes como comentário no header do arquivo + escolha provisória ativa), Lenny revisa no GitHub, sugere edits/escolha, Claude ajusta, merge. Phase 3 estabelece o ritmo e documenta a convenção no PR description. Aproveita o git como histórico de decisões de copy. **Copy review é gate, não polish de fim** — uma seção só fecha quando a copy dela tiver merge aprovado.

### Deploy isolado + LCP gate

- **D-18:** **Estratégia de validação = Vercel preview no PR final da Phase 3**. Cada PR durante a fase já gera preview automático (DEPLOY-02 vem na Phase 7, mas a feature padrão da Vercel já existe). Quando todas as plans da Phase 3 estiverem mergeadas em uma feature branch (ou na main com hero como única seção), rodar Lighthouse mobile + PageSpeed Insights contra a URL `.vercel.app` do preview final ANTES da Phase 4 começar a adicionar seções. Sem feature flag, sem branch deployment paralelo, sem sub-projeto Vercel separado — fluxo simples e previsível.

- **D-19:** **LCP gate = checklist manual** registrado em `03-VERIFICATION.md`. Não usar Lighthouse CI / GitHub Actions na v1 (alinha com Phase 1 D-15 e Phase 2 D-16 — sem ESLint custom, sem automação prematura). Checklist mínimo a registrar: (a) Lighthouse mobile score Performance ≥ 85, (b) LCP < 2.5s, (c) CLS < 0.1, (d) PageSpeed Insights URL + score, (e) WhatsApp deep link testado em iPhone real (abre app, mensagem `hero` pré-preenchida), (f) WhatsApp deep link testado em Android real (idem), (g) 5-second test com pelo menos 3 pessoas (HERO-07) — quem, quando, o que descreveram. Lighthouse CI/Speed Insights pode entrar na Phase 7 (PERF-01) quando arquitetura toda estiver estabilizada.

### Claude's Discretion

Áreas onde planner/executor tem flexibilidade dentro das decisões acima:

- **Escolha do screenshot exato** do mockup principal entre os ~50 em `../prints_funcionalidades/` — D-03 fixa "Atendimentos / caixa de entrada multicanal" mas o melhor frame específico (que canais aparecem, quantos atendentes, qualidade da composição) fica a critério do executor + revisão do Lenny no PR. Considerar densidade informacional + legibilidade em viewport mobile.
- **Conteúdo exato do micro-card sobreposto** (texto da notificação ou tipo de chip) — D-05 propõe duas direções; Claude escreve a versão final junto com as variantes de copy e Lenny aprova.
- **Valores exatos do glow** (raio, blur, opacidade base, easing do pulse, duração do ciclo) — D-15 dá os princípios; executor calibra empiricamente.
- **Dimensões exatas da headline** (font-size mobile/desktop em rem/clamp) — desde que "gigante" (PROJECT.md), legível e não quebre layout.
- **Estrutura do trust signal** — D-13 define princípio; uma linha curta `text-muted` é o default, mas se Claude propor mini-pill / ícone + texto, fica aberto pra discussão no PR.
- **Padrão da copy nas 3 variantes** — formato no arquivo (export const COPY = {...variant1}; const VARIANTS = {variant1, variant2, variant3}); convenção a estabelecer no primeiro PR.
- **Altura do hero** — `min-h-dvh` ou `min-h-svh` aceitável aqui (não é StickyStage; HERO-05 só veta `vh` puro); calibrar pra que CTA mobile fique acima da dobra (HERO-01).
- **Estrutura de pastas internas** dentro de `src/sections/Hero/` — `index.tsx` + co-locação (HeroHeader.tsx, HeroCopy.tsx, HeroMockup.tsx, HeroMicroCard.tsx, HeroBackground.tsx) é o default sugerido (Phase 1 D-20), mas executor pode consolidar se conteúdo for pequeno.
- **Layout da copy à esquerda** (alignment, peso de cada linha, espaçamento entre h1 → sub → CTA → trust) — calibrar empiricamente.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing Phase 3.**

### Visão e constraints do projeto
- `.planning/PROJECT.md` — Vision, core value, key decisions, brand book regras críticas (roxo apenas accent, Inter 3 pesos, ilustrações abstratas tech, voz humana sem cara de IA)
- `.planning/REQUIREMENTS.md` §"Hero Section (HERO)" + §"Copy & Voice (COPY)" + §"CTAs & Conversion (CTA)" — 10 requisitos mapeados pra Phase 3: HERO-01..07, COPY-01, COPY-04, CTA-04
- `.planning/ROADMAP.md` §"Phase 3: Hero (benchmarked isolado)" — Goal, 5 success criteria, dependência de Phase 2

### Context das phases anteriores (decisões que constrangem Phase 3)
- `.planning/phases/01-foundations-design-system/01-CONTEXT.md` — D-01..D-21: atoms Linear+Stripe feel, 4 extremos visuais a evitar, WhatsAppCta API, tokens roxo apenas como accent, surface dark/light, pasta `src/sections/`, copy em `src/content/`
- `.planning/phases/01-foundations-design-system/01-VERIFICATION.md` — Confirma o que Phase 1 entregou (atoms, providers, helpers, /dev)
- `.planning/phases/02-motion-primitives/02-CONTEXT.md` — Primitivas congeladas; Hero usa `<RevealOnView>` apenas em elementos secundários (no caso só o glow, e mesmo assim é CSS pulse não primitiva); barrel `@/components/motion` é o único import path
- `.planning/phases/02-motion-primitives/02-VERIFICATION.md` — Estado real das primitivas + checklist HUMAN-UAT pendente
- `.planning/phases/02-motion-primitives/02-HUMAN-UAT.md` — 4 testes deferidos (Android real, macOS Safari, Firefox/Edge, prefers-reduced-motion). **Trigger relevante pra Phase 3:** Phase 3 NÃO usa StickyStage no hero, então o trigger "validar Android antes de StickyStage em seção real" só acende na Phase 4. Mas o hero usa Lenis + sticky-adjacent CSS (header pode usar position sticky no futuro) — vale antecipar teste Android quando o preview da Phase 3 for ar.

### Research do projeto (read antes de planejar)
- `.planning/research/SUMMARY.md` — Síntese executiva: top 6 pitfalls
- `.planning/research/STACK.md` — Versões pinadas, image strategy (`next/image` AVIF/WebP, único `priority` no LCP), font strategy
- `.planning/research/ARCHITECTURE.md` — Image manifest, motion choreography hero, build order, sections folder layout
- `.planning/research/PITFALLS.md` — Pitfalls críticos pra Phase 3: #1 (copy com cara de IA), #2 (LCP do hero morrendo por animação no LCP element), #3 (Lenis + sticky no iOS), #4 (roxo overuse), #5 (WhatsApp deep link), #19 (font weights — 3 max), #26 (gradient overuse)

### Código existente que Phase 3 consome
- `src/components/ui/whatsapp-cta.tsx` — `<WhatsAppCta>` com variants `primary/secondary/floating/inline` e prop `location`. Hero usa `variant="primary"` + `location="hero"`; header usa `variant="secondary"` + `location="header"` (location nova — adicionar ao tipo `WhatsAppLocation` em `src/lib/whatsapp.ts`).
- `src/lib/whatsapp.ts` — Helper `buildWhatsAppUrl(message, location)`. Tipo `WhatsAppLocation` precisa de novo membro `"header"` (atualizar união). Validação 12-13 dígitos já garante que `5511922324329` passa.
- `src/content/whatsapp.ts` — Mapa de mensagens por `location` (ex: `WHATSAPP_MESSAGES.hero`). Adicionar entrada `header` + reescrever entrada `hero` (Claude propõe junto com a copy).
- `src/lib/analytics.ts` — Helper `track('whatsapp_click', { location })` já chamado por `<WhatsAppCta>`. Hero CTA + Header CTA automaticamente disparam evento com `location` correto.
- `src/hooks/use-device-tier.ts` — `useDeviceTier()` disponível pra ajustar layout responsivo se preciso (mas Tailwind breakpoints provavelmente cobrem a maioria — usar `useDeviceTier()` apenas se motion intensity diferir).
- `src/components/providers/*` — Provider tree (Analytics > SmoothScroll > MotionConfig) — Phase 3 não toca aqui.
- `src/app/page.tsx` — Substituir placeholder atual ("Foundations OK — landing real chega na Phase 3") pelo hero real.
- `src/app/globals.css` — `@theme` Tailwind v4: tokens `accent.primary`, `accent.glow`, `surface.dark`, `surface.darker`, `surface.light`, `text.primary/secondary/muted`, `border.subtle`. Hero consome esses tokens; Phase 3 NÃO adiciona tokens novos (alinha com Phase 1 D-13/D-14).

### Brand assets (no diretório pai)
- `../logos_likro/LIKRO LOGO.svg` — Logo SVG oficial (vetor) — copiar pra `public/likro-logo.svg` pro header
- `../logos_likro/logolikro_2000x2000.png` — Fallback PNG (provavelmente não necessário se SVG resolve em todos os browsers)
- `../prints_funcionalidades/Screenshot 2026-03-04 *.png` — ~50 screenshots do produto. Phase 3 escolhe 1 para o mockup principal (Atendimentos — D-03). Otimização: rodar tinypng + converter pra AVIF/WebP via `next/image` automaticamente; ajustar dimensões pra match exato do framing (não servir 4K se mockup renderiza em 800px desktop).
- `../📘 BRAND BOOK — LIKRO (2).pdf` — Brand book (reconsultar se dúvida visual surgir)

### Pendências resolvidas nesta discuss (atualizar STATE.md)
- ✅ Número WhatsApp Likro = `5511922324329` (D-16)
- ✅ Cadência copy review = async via PR seção-a-seção (D-17)

### Pendências ainda abertas (rastreadas pra fases futuras)
- 🟡 Autorização Dolce Home na seção Proof — Phase 4 (não bloqueia Phase 3 pois D-13 explicitamente evita citar Dolce Home no hero)
- 🟡 Webhook target pro form de lead — Phase 5

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`<WhatsAppCta>`** (`src/components/ui/whatsapp-cta.tsx`) — Pronto pra usar com `variant="primary"` (hero) e `variant="secondary"` (header). Já encapsula: helper `buildWhatsAppUrl`, `track('whatsapp_click', {location})` antes do open, loading 250ms, abertura via target="_blank" + noopener.
- **`<Button>`, `<Container>`, `<Headline>`, `<Card>`** (`src/components/ui/`) — Atoms shadcn customizados com Linear+Stripe feel disponíveis. Headline pode ser a tag base pra h1 do hero (verificar variants e pesos).
- **`buildWhatsAppUrl(message, location)`** (`src/lib/whatsapp.ts`) — Único construtor de URL WhatsApp; valida formato 12-13 dígitos, bloqueia `web.whatsapp.com` e `api.whatsapp.com`.
- **`useDeviceTier()`** (`src/hooks/use-device-tier.ts`) — Hook adaptativo (`'reduced' | 'mobile' | 'tablet' | 'desktop'`); usar SOMENTE se motion intensity diferir. Layout responsivo padrão deve usar Tailwind breakpoints.
- **`cn()`** (`src/lib/utils.ts`) — Composição de classes Tailwind.
- **Provider tree** (`src/app/layout.tsx`) — AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider já wiring; Hero renderiza dentro de `<MotionConfigProvider>` que aplica `reducedMotion="user"` globalmente.
- **`<RevealOnView>`, `<ParallaxLayer>`** (`@/components/motion`) — Não usar no hero (HERO-02/03 vetam animação no LCP). Glow ambiente do D-15 é CSS keyframe puro, não primitiva Motion.

### Established Patterns

- **Provider order** (Phase 1 D-08, D-09) — Hero respira essa ordem; nada novo.
- **Co-locação por seção** (Phase 1 D-20) — Hero vira `src/sections/Hero/index.tsx` com co-locação de sub-componentes na mesma pasta.
- **Copy em `src/content/*.ts`** (Phase 1 D-21, COPY-01) — `src/content/hero.ts` é onde toda string textual do hero vive. Zero strings hard-coded em JSX.
- **Tokens Tailwind via `@theme`** (Phase 1 D-13/D-14) — Hero só consome tokens existentes; não adiciona token novo.
- **Único `<Image>` priority por página** (Phase 1 D-20, HERO-04) — Reservado pro mockup principal do hero.
- **Server Components por padrão** — `src/app/page.tsx` continua RSC; sub-componentes do hero que precisam de hook/state (ex: o pulse do glow se for `useReducedMotion`-aware, micro-card se virar interativo no futuro) ficam `'use client'` isolados.
- **WhatsApp location é a chave do mapa de mensagens** — `src/content/whatsapp.ts[location]` é a fonte de verdade; Hero usa `hero`, Header usa novo `header`.

### Integration Points

- **`src/lib/whatsapp.ts` tipo `WhatsAppLocation`** — Adicionar `"header"` à união (hoje: `'hero' | 'pain' | 'product' | 'how' | 'proof' | 'footer' | 'floating'`).
- **`src/content/whatsapp.ts` mapa de mensagens** — Adicionar entrada `header` + reescrever `hero` junto com a copy.
- **`src/app/page.tsx`** — Substituir o placeholder atual pelo `<Hero />` (de `@/sections/Hero`). Adicionar `<Header />` (de `@/components/layout/Header` — novo, layer separado da `sections/`).
- **`public/likro-logo.svg`** — Copiar `../logos_likro/LIKRO LOGO.svg` pro repo (Vercel não tem acesso ao filesystem pai do build).
- **Vercel env vars** — Configurar `NEXT_PUBLIC_WA_NUMBER=5511922324329` em Production + Preview + Development na dashboard Vercel; mirror em `.env.local` (gitignored).
- **`.env.example`** — Atualizar com `NEXT_PUBLIC_WA_NUMBER=5511XXXXXXXXX` (placeholder anônimo) pra novos contributors.
- **Brand assets pasta pública** — `public/` pode ganhar pasta `public/mockups/` pro mockup do hero (otimizado); `next/image` referencia via path absoluto `/mockups/atendimentos.png` (ou variant `.webp`).

</code_context>

<specifics>
## Specific Ideas

- **Direção tonal alvo:** "produto real dentro do próprio ambiente". Dark editorial cria atmosfera; mockup vive numa superfície clara refinada (radius 12, sombra grande difusa, border 1px). A combinação evita simultaneamente "AI SaaS template" (dark + glow saturado) e "documentação flat" (light puro sem profundidade).
- **Sensação cinematográfica é a ambição, sutileza é a disciplina.** Glow pulsa devagar pra parecer iluminação ambiente, não efeito especial. Linhas/grids decorativos têm que "quase desaparecer conscientemente" — atmosfera, não ornamento.
- **Mockup = Atendimentos.** Reconhecível em 1 segundo pelo dono de clínica (WhatsApp + Instagram + leads centralizados). Outras telas (CRM Kanban, Relatórios) ficam pra Phase 4 onde têm contexto narrativo.
- **"Falar no WhatsApp" sem ambiguidade.** Tráfego mobile + Meta Ads + canal principal de conversão = clareza absoluta no CTA. Sofisticação vem do design ao redor, não de esconder o canal.
- **Repetição deliberada de "clínica" em h1 e sub** é estratégia, não keyword stuffing. Verticalização cristalina em segundos.
- **3 variantes contrastantes** evita Frankenstein de headline (que aconteceria com 5+) e dá ao Lenny escolha real entre direções distintas (não micro-ajustes).
- **Header agora é pra ter contexto institucional**, não pra resolver UX mobile (hide-on-scroll vive na Phase 5). Logo + 1 CTA secundário, MUITO respiro, quase invisível estruturalmente.
- **Trust signal "sussurrado"** — uma linha em `text-muted` reforçando realidade/operação viva. Sem logo bar, sem números, sem Dolce Home (autorização pendente). Frase vem nas variantes de copy.
- **Sem scroll cue** — clichê Awwwards + hero está isolado de propósito na Phase 3 (mente se promete mais abaixo).
- **WhatsApp `5511922324329`** é número oficial Likro fornecido pelo Lenny nesta discuss — destrava validação real-device end-to-end.
- **Async via PR é o ritmo de copy review** — copy vira parte central da construção da marca, git é o histórico das decisões de tom. Phase 3 estabelece o padrão pras 5 seções da Phase 4.
- **Vercel preview + Lighthouse manual** é o gate de LCP na v1. Lighthouse CI entra na Phase 7 quando arquitetura estabilizar.

</specifics>

<deferred>
## Deferred Ideas

- **Floating WhatsApp mobile** após scroll > 50vh com safe-area — Phase 5 (CTA-06 + MOBILE-02).
- **Header hide-on-scroll-down, show-on-scroll-up** — Phase 5 (MOBILE-06). Phase 3 entrega header estático.
- **Mobile menu / navegação extra no header** — não é v1 (PROJECT.md "Header minimalista, sem menu carregado"). Hipoteticamente entra em V2 se site crescer.
- **CTAs persistentes em 4+ pontos da página** (CTA-05) — Phase 5, depois das seções narrativas existirem.
- **Logo-bar com clientes** — fora de escopo v1 (PROJECT.md "zero números/depoimentos fabricados"; Dolce Home solitário não justifica uma bar).
- **Citação explícita do Dolce Home** — depende de autorização do Lenny, prevista pra Phase 4 (seção Proof). Hero usa trust signal genérico até lá.
- **Mockup tilted/perspective 3D** — descartado em D-04 (risco "AI SaaS template" + complica LCP).
- **Mockup com browser chrome** — descartado em D-04 (parece tutorial, viola brand book).
- **Múltiplos micro-cards sobrepostos (collage)** — descartado em D-05 (vira ruído visual; máximo 1).
- **Parallax no mockup** — descartado (LCP element não pode animar — HERO-02).
- **Variantes de CTA por device tier** ("📬 Falar no WhatsApp" mobile / "Falar com a gente" desktop) — descartado em D-11 (sem ganho claro, complica componente que já existe).
- **5+ variantes de copy** — descartado em D-07 (overload de revisão, risco de Frankenstein).
- **Pass final único de copy review** — descartado em D-17 (COPY-04 explicitamente diz "copy review é gate, não polish de fim").
- **Scroll cue / seta animada** — descartado em D-14 (clichê + mente na Phase 3 isolada). Reavaliar na Phase 4 se composição não der continuidade natural.
- **Lighthouse CI gate em GitHub Actions** — adiado pra Phase 7 (PERF-01) onde arquitetura inteira estabiliza. Phase 3 usa checklist manual.
- **Branch separada / sub-projeto Vercel pro deploy isolado** — descartado em D-18 (over-engineering pra v1; Vercel preview do PR final cobre).
- **Feature flag escondendo seções futuras** — descartado em D-18 (PROJECT.md veta A/B testing nativo na v1; complexidade desnecessária).
- **Vercel Speed Insights** — habilitação fica pra Phase 7 (DEPLOY-05); Phase 3 mede LCP pontualmente via Lighthouse manual.
- **Animação de entrada no micro-card sobreposto post-LCP** — descartado em D-05 (timing complicado pra não parecer truque; risco competir visualmente com protagonista).
- **OG image custom do hero** — fica em `src/app/opengraph-image.tsx` placeholder já gerado na Phase 1; polish/customização na Phase 7 (SEO-03).
- **JSON-LD Organization** — Phase 7 (SEO-05).
- **JSON-LD Product/Service** — Phase 7 (SEO-06).
- **Cookie banner LGPD** — fora de v1 (PROJECT.md Out of Scope).

</deferred>

---

*Phase: 03-hero-benchmarked-isolado*
*Context gathered: 2026-05-16*
