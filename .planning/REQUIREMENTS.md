# Requirements: Likro Landing Page (Clínicas e Estéticas)

**Defined:** 2026-05-15
**Core Value:** Uma clínica entra na landing e sente em segundos: *"isso foi feito exatamente pra minha operação — e essa empresa é absurda"*.

> **Como ler:** cada requisito é específico, testável e atômico. Categorias e REQ-IDs servem como contrato entre planejamento e execução. Os 6 riscos críticos identificados no research (copy com cara de IA, LCP do hero, Lenis+sticky no iOS, restrição mecânica do roxo, WhatsApp abrindo o app, tracking sem double-fire/PII) aparecem como requisitos explícitos nas categorias **COPY**, **HERO**, **MOTION**, **FOUND**, **CTA** e **TRACK** — não como notas soltas.

---

## Milestone v2.0 — Hero Premium (Travessia)

**Definido:** 2026-06-11 · Escopo: SÓ o Hero, rota `/preview` isolada. Base: pesquisa `research/HERO-V2-RESEARCH.md` + contrato em `PROJECT.md › Current Milestone`. Norte: **uma experiência que faz o usuário sentir que percorreu um caminho** (`caos → jornada → ordem`), não um efeito impressionante.

### Travessia — Experiência / Sensação (TRV)

- [x] **TRV-01**: O usuário sente **deslocamento** — percebe que está avançando *através* de um espaço, não observando uma transformação de fora. Entregue pela "câmera presa" (palco sticky scrubbed que re-atribui o movimento do scroll pro espaço) + optic flow (expansão radial a partir de um Foco de Expansão central e estável).
- [x] **TRV-02**: A travessia percorre **5 momentos distintos e reconhecíveis**, de forma contínua: (1) caos frio/distante/disperso, (2) entrada, (3) travessia/convergência, (4) quase-ordem, (5) ordem conquistada.
- [x] **TRV-03**: **Profundidade** percebida via oclusão (ordem de desenho far→near) + tamanho relativo + perspectiva atmosférica (longe dissolve no escuro, blur pré-assado) + parallax sutil em camadas (0.3/0.4/0.5) — não um campo chapado.
- [x] **TRV-04**: **Arco de escala** (enquadramento): começo amplo/distante/disperso (plano aberto) → meio envolvente (médio) → fim íntimo/contido/resolvido (fechado). Entregue por dolly do optic flow + contração do footprint da convergência + vinheta de enquadramento.
- [x] **TRV-05**: **Uma matéria-prima única** (campo de luz/poeira) evolui continuamente por morph de matéria compartilhada (target-lerp) — PROIBIDO crossfade, coleção de efeitos, um beat = uma animação diferente, slideshow.
- [x] **TRV-06**: **Atmosfera** evolui contínua e monotônica: frio/tensão → quente/calma, acoplada ao scroll; nada volta ao começo.
- [x] **TRV-07**: **Chegada conquistada** — estado final resolvido, limpo, claramente diferente do começo, com o acento roxo `#7C3AED` no auge da escassez (só matéria próxima/resolvida acende em roxo).
- [x] **TRV-08**: **Hero exit de vetores opostos** entrega o usuário na travessia no início — o campo recua/afunda enquanto a headline sobe e dissolve no primeiro scroll.
- [x] **TRV-09**: A **copy vive só no topo** (validar a experiência visual pura antes de amplificar com texto); some cedo conforme a travessia assume o palco.
- [x] **TRV-10**: Tudo **scrubbed pelo scroll** (held camera) — parar = descansa num quadro, rolar = avança. Sem relógio macro autônomo (sem loop ambiente).

### Verificação / Aceite (TVER) — a régua oficial

- [ ] **TVER-01**: **Teste dos 5 quadros** — 5 screenshots em 5 pontos do scroll lidos como 5 momentos distintos da MESMA jornada (5 quadros de um filme), não 5 versões do mesmo efeito; nada volta ao começo. (Validação: Lenny + screenshots Playwright)
- [ ] **TVER-02**: **Teste do retrospecto** — ao chegar no fim e olhar mentalmente pra trás, sente-se que percorreu uma distância emocional e visual relevante; o estado final parece **conquistado**, não só alcançado por uma animação. (Validação: Lenny no browser real)

### Performance & Técnica (TPRF) — mobile é sagrado

- [x] **TPRF-01**: Mobile não regride — campo limitado (≈350–700 partículas), DPR ≤ 1.5, **1 RAF único** (dono do Lenis), sprites de luz pré-assados, zero `ctx.filter`/`shadowBlur` por frame. LCP mobile não regride vs. produção atual (~2.3s).
- [x] **TPRF-02**: Canvas monta **pós-hidratação**; o LCP é a headline + atmosfera estática (nunca o canvas); CLS = 0 (caixa do palco reservada com `svh`/`dvh`).
- [x] **TPRF-03**: O loop **pausa** quando offscreen/aba oculta (IntersectionObserver + `visibilitychange`); ladder de degradação em runtime (count → DPR → ruído → estático).
- [x] **TPRF-04**: Progress lido via MotionValue/ref (**sem React state por frame**); o canvas lê `progress.get()` no próprio RAF (protege INP).

### Acessibilidade (TACC)

- [ ] **TACC-01**: `prefers-reduced-motion` mata o optic flow (fonte de enjoo), mantém profundidade estática + atmosfera, e apresenta a história caos→ordem como **antes/depois** (fade ≤200ms ou estado de ordem por padrão) — narrativa intacta, sem movimento vestibular.
- [ ] **TACC-02**: Foco de Expansão central e estável; fluxo acoplado ao scroll (nunca autoplay); velocidade do fluxo limitada (anti-náusea); parallax ≤ 0.5; sem expansão+rotação+pan simultâneos.

### Brand-lock & Escopo (TBND)

- [x] **TBND-01**: Roxo `#7C3AED` só acento (escasso, intensifica na chegada); fundo dark **tingido** (roxo-navy, não preto puro — anti-banding + premium); Inter, com ênfase em itálico da MESMA família (sem serif).
- [x] **TBND-02**: Sem WebGL pesado; sem prisma estilo Vercel; sem fotografia/IA literal; sem cursor/kinetic gimmick; sem vídeo autoplay; sem scroll-jacking (Lenis suaviza, não sequestra o scroll).
- [x] **TBND-03**: Rota `/preview` isolada e gated (404 em produção); produção `/` intocada até validação do Lenny.

### Out of Scope (v2.0)

- **Efeito visual impressionante como fim em si** — a régua é a sensação de jornada percorrida, não o espetáculo.
- Outras seções da landing, PDF/pricing, redesign completo — milestones futuros.
- "Mais partículas / brilho / espiral / complexidade" como solução — explicitamente rejeitado.
- Copy adicional na jornada (além do hero no topo) — só depois que a experiência visual pura validar.
- Integração na produção `/` — só após Lenny aprovar a travessia em `/preview`.

---

## Milestone v2.1 — Capítulos Visuais

**Definido:** 2026-06-15 · Escopo: dar identidade visual própria a cada capítulo da página no ritmo "bookend escuro" (a página perde contraste depois do topo). O **Funil (Caminho do Paciente)** é o primeiro capítulo — capítulo ESCURO que prova a tese *"nenhum paciente fica pelo caminho"*. Base: `09-CONTEXT.md` (decisões travadas com Lenny) + protótipo `funil-proto.html` (aprovado via Playwright @1536×730, 2026-06-15).

### Funil (Caminho do Paciente) — FUNIL

- [ ] **FUNIL-01**: Travessia scroll-driven via primitivas da Phase 2 (`<ScrollScene>` + `<StickyStage>`); zero `motion.div` direto e zero import de `motion/react` fora da exceção do render-prop do `<ScrollScene>`.
- [ ] **FUNIL-02**: Momento real e humano por etapa; zero número, KPI, %, gráfico, taxa de conversão, contador ou widget de dashboard em toda a seção (audit grep + visual).
- [ ] **FUNIL-03**: Clímax roxo `#7C3AED` exclusivo na coluna 4 ("Consulta marcada") — borda + glow + selo; um dos 4 únicos momentos de roxo da página. Roxo proibido nas colunas 1–3.
- [ ] **FUNIL-04**: `prefers-reduced-motion` entrega a jornada já montada no estado final (Marina na coluna 4, roxo aceso, selo visível) sem scrub e sem dead-scroll; validado no toggle do OS.
- [ ] **FUNIL-05**: Mobile (`useDeviceTier === "mobile"`, ≤639px) renderiza "1 coluna em foco + trilho horizontal" (~420svh), sem duplicar o componente — mesma fonte de progress, só o DOM/length diverge por tier.
- [ ] **FUNIL-06**: O antigo HowItWorks é absorvido e removido (seção + content + testes); ordem final da página `Product → Funnel → Proof`.
- [ ] **FUNIL-COPY**: Toda a copy travada em `src/content/funnel.ts` (zero string hard-coded em JSX); headline/eyebrow/4 beats/selo/fechamento exatos; anti-IA; sem "Messenger"/"Facebook" no fechamento.

### Out of Scope (v2.1, fora desta fase)

- Os outros capítulos (Problema, Virada, Produto, Prova, Conversão) — Phases 10–14 do v2.1.
- Reescrita da copy v2 das outras seções (ver `project_copy_v2_direction` na memória) — frente separada.

---

## v1 Requirements

Requisitos para o lançamento inicial. Cada um mapeia pra uma fase do roadmap.

### Foundations & Design System (FOUND)

- [ ] **FOUND-01**: Scaffold Next.js 15.5 com App Router, TypeScript estrito, ESLint + Prettier configurados
- [ ] **FOUND-02**: Tailwind CSS v4 configurado com tokens do brand book Likro via `@theme` em `globals.css` (cores, tipografia Inter, espaçamentos, bordas 10px/12px)
- [ ] **FOUND-03**: Roxo `#7C3AED` definido **apenas** como `accent.primary` na config Tailwind — sem `bg-accent-50/100/200/...` disponíveis no design system. Mecanicamente impossível criar uma seção com fundo roxo gigante a partir das classes utilitárias do sistema (RISCO CRÍTICO: restrição mecânica do roxo)
- [ ] **FOUND-04**: Tipografia Inter via `next/font` com no máximo 3 pesos (Regular 400, Medium 500, Bold 700) e `font-display: swap`
- [ ] **FOUND-05**: Helper `cn()` (clsx + tailwind-merge) disponível em `lib/utils.ts` para composição de classes
- [ ] **FOUND-06**: Hook `useDeviceTier()` retornando `'reduced' | 'mobile' | 'tablet' | 'desktop'` baseado em `matchMedia` + `prefers-reduced-motion`, usado por todas as seções pra escolher configurações de motion adaptativas
- [ ] **FOUND-07**: Provider tree em `app/layout.tsx`: `AnalyticsProvider > SmoothScrollProvider (Lenis) > MotionConfigProvider > children`, em um único loop RAF
- [ ] **FOUND-08**: Provider `SmoothScrollProvider` configurado com `smoothWheel: true`, `smoothTouch: false` sempre, e `skip init` quando `prefers-reduced-motion` ativo (RISCO CRÍTICO: Lenis + sticky no iOS)
- [ ] **FOUND-09**: Atoms UI implementados — `<Button>`, `<Container>`, `<Headline>`, `<Card>`, `<WhatsAppCta>` — com variantes alinhadas ao brand book e classes utilitárias travadas no design token
- [ ] **FOUND-10**: Metadata global em `app/layout.tsx` (title template, description, viewport, theme-color, manifest), favicon, OG image base e Open Graph defaults
- [ ] **FOUND-11**: `robots.txt` e `sitemap.ts` configurados para permitir produção e bloquear previews `.vercel.app`
- [ ] **FOUND-12**: Rota `/dev` interna disponível apenas em desenvolvimento para showcase das primitivas e seções isoladas

### Motion Primitives (MOTION)

- [ ] **MOTION-01**: Primitiva `<RevealOnView>` que faz fade + slide stagger ao entrar no viewport, com config adaptativa por `useDeviceTier()` (mobile = simplificada, reduced = sem motion)
- [ ] **MOTION-02**: Primitiva `<ParallaxLayer>` com profundidade configurável, ativa apenas em tablet/desktop (mobile sempre 0% profundidade) e desligada em `prefers-reduced-motion`
- [ ] **MOTION-03**: Primitiva `<StickyStage>` que pin'a uma seção pela altura do conteúdo, validada em iOS Safari real, Android Chrome real e desktop Safari/Chrome/Firefox (RISCO CRÍTICO: Lenis + sticky no iOS)
- [ ] **MOTION-04**: Primitiva `<TextSplit>` que faz reveal de headlines por palavra (desktop) ou por linha (mobile/tablet); desligada em reduced motion
- [ ] **MOTION-05**: Primitiva `<ScrollScene>` que expõe um `MotionValue<number>` de 0→1 derivado da posição da seção no viewport; seções consomem o `MotionValue` e nunca importam Motion diretamente — este é o contrato GSAP-future-ready
- [ ] **MOTION-06**: API das 5 primitivas congelada após Phase 2 e documentada em `components/motion/README.md`; mudanças subsequentes exigem aprovação explícita
- [ ] **MOTION-07**: Todas as primitivas respeitam `prefers-reduced-motion` retornando estado final imediatamente (sem motion) — verificado em CI ou checklist manual
- [ ] **MOTION-08**: Todas as animações usam apenas propriedades GPU-friendly (`transform`, `opacity`) — zero propriedades que disparam layout (`width`, `height`, `top`, `left`)

### Hero Section (HERO)

- [ ] **HERO-01**: Hero ocupa primeira tela com headline gigante em PT-BR, sub-headline curta e CTA WhatsApp acima da dobra em mobile e desktop
- [ ] **HERO-02**: Headline e mockup principal do hero (elementos LCP) renderizam no **estado final imediatamente** — zero `fade-in`, `translateY`, `scale-up` ou qualquer animação de entrada nesses elementos (RISCO CRÍTICO: Hero LCP morrendo)
- [ ] **HERO-03**: Entrance animations (se houver) afetam apenas elementos secundários (decorações, badges, brilho de fundo) — nunca o LCP element
- [ ] **HERO-04**: Hero usa exatamente um `<Image>` com `priority` (mockup principal); nenhum outro imagem na página usa `priority`
- [ ] **HERO-05**: Hero usa `dvh` ou `svh` para altura (não `vh`) para evitar o bug da address bar no iOS
- [ ] **HERO-06**: Lighthouse mobile mede LCP < 2.5s na rota raiz com apenas o hero deployado isoladamente na Vercel — gate CI ou validação manual no fim da Phase 3
- [ ] **HERO-07**: Hero passa no "5-second test" — usuário sem contexto descreve o produto e o público em 5 segundos olhando apenas a primeira viewport

### Narrative Sections (NARR)

- [ ] **NARR-01**: Seção **Pain** ("Cenário Clínica Desorganizada") visualiza cenário caótico atual: DMs do Instagram sem resposta, WhatsApp espalhado em múltiplos celulares, follow-up perdido, equipe sem visibilidade. Composição visual reconhecível pelo dono da clínica.
- [ ] **NARR-02**: Seção **Bridge** faz transição cinematográfica entre dor e produto usando `<ScrollScene>` — mockup do dashboard surge com blur/desfoque e expande conforme scroll (primeira `<ScrollScene>` em produção, template pras seguintes)
- [ ] **NARR-03**: Seção **Product** apresenta quatro pilares (Atendimentos, CRM, Agentes IA, Relatórios) em sticky stack revelado pelo scroll, cada pilar com print real do produto e copy específica
- [ ] **NARR-04**: Seção **HowItWorks** apresenta jornada visual "DM no Instagram → Agendamento" com etapas claras; v1 usa staggered reveal vertical (horizontal scroll é stretch goal apenas se Clarity mostrar engajamento alto na v1)
- [ ] **NARR-05**: Seção **Proof** comunica credibilidade pelo refinamento visual + menção elegante à operação real (Dolce Home — **🟡 pendente autorização explícita do Lenny**; sem autorização, copy ajusta pra "operação ativa em uso" sem nome). Zero números fabricados, zero depoimentos placeholder.
- [ ] **NARR-06**: Cada seção narrativa usa apenas primitivas de `components/motion/` — nenhum `motion.div` direto em arquivos de seção
- [ ] **NARR-07**: Cada seção narrativa tem versão mobile com motion choreography simplificada via `useDeviceTier()`, sem duplicar componentes — exceto se o DOM realmente diferir
- [ ] **NARR-08**: Seção **Product** inclui demo do Agente IA atendendo lead 24/7 (mockup animado da conversa, não vídeo real)

### Copy & Voice (COPY)

- [ ] **COPY-01**: Toda copy fica em `content/*.ts` (TS puro) — uma fonte de verdade por seção (`content/hero.ts`, `content/pain.ts`, etc.). Sem strings hard-coded em JSX.
- [ ] **COPY-02**: Copy é escrita pelo Claude com voz humana, sofisticada, premium, em PT-BR; passa pelo filtro **anti-IA**: nenhuma frase da lista banida ("desbloqueie", "potencialize", "transforme sua X", "jornada do cliente", "próximo nível", "solução inovadora", "feito para você", "do início ao fim", "fricção" usado abstratamente, etc.) (RISCO CRÍTICO: cara de IA)
- [ ] **COPY-03**: Toda frase de copy passa no teste de especificidade: *"essa frase funciona pra qualquer SaaS?"* — se sim, reescreve com termos verticais de clínica (agendamento, retorno, ficha, equipe de recepção, lead do Instagram, etc.)
- [ ] **COPY-04**: Lenny revisa copy seção a seção antes da seção ir pra develop (cadência exata combinada antes da Phase 3) — copy review é gate, não polish de fim
- [ ] **COPY-05**: Glossário de termos verticais de clínica é mantido em `content/glossary.ts` e referenciado por seções; novos termos exigem aprovação do Lenny
- [ ] **COPY-06**: Copy não contém claims numéricos sem fonte ou depoimentos fabricados — credibilidade vem do produto e da operação real

### CTAs & Conversion (CTA)

- [ ] **CTA-01**: Único helper `buildWhatsAppUrl(message: string, location: string)` em `lib/whatsapp.ts` constrói toda URL de WhatsApp do site — zero links hard-coded; formato sempre `https://wa.me/55<DDD><numero>?text=<encodeURIComponent(msg)>` (RISCO CRÍTICO: WhatsApp abrindo o app)
- [ ] **CTA-02**: Helper proíbe `web.whatsapp.com` (lança erro em dev se alguém passar essa URL); validado por unit test
- [ ] **CTA-03**: Componente `<WhatsAppCta>` usa o helper e recebe `location` como prop obrigatória (ex: `'hero'`, `'pain'`, `'product'`, `'footer'`, `'floating'`) — `location` vira evento de analytics e UTM
- [ ] **CTA-04**: Número oficial do WhatsApp da Likro configurado em variável de ambiente (`NEXT_PUBLIC_WA_NUMBER`) — **🟡 pendente input do Lenny antes da Phase 3**
- [ ] **CTA-05**: CTAs WhatsApp persistentes em pelo menos 4 pontos da página: hero, fim da seção Pain, fim da seção Product, footer/fim
- [ ] **CTA-06**: Floating WhatsApp CTA aparece em mobile após o primeiro scroll significativo (>50vh), posicionado dentro da thumb zone do polegar
- [ ] **CTA-07**: WhatsApp deep link testado em iOS Safari real e Android Chrome real — abre o app WhatsApp, não o browser
- [ ] **CTA-08**: Mensagem pré-preenchida (`?text=`) é específica por `location` da CTA, escrita por Claude e aprovada pelo Lenny no PR da seção
- [ ] **CTA-09**: Formulário consultivo discreto no fim da página com 3 campos (nome, WhatsApp, mensagem opcional) + honeypot; visual premium, alinhado ao brand book; nunca o CTA primário
- [ ] **CTA-10**: Submissão do form vai para edge route `/api/lead` (Next.js Route Handler) que valida com Zod e entrega ao webhook (target a definir antes da Phase 5)
- [ ] **CTA-11**: Form previne double-submit (botão desabilitado durante submit) e mostra estado de sucesso inline sem redirect
- [ ] **CTA-12**: Form e edge route deduplicam submissões pelo número de WhatsApp em janela de 60 segundos

### Tracking & Analytics (TRACK)

- [ ] **TRACK-01**: Único módulo `lib/analytics.ts` expõe `track(event: string, payload: object)` que faz fan-out para Meta Pixel, GA4 e Microsoft Clarity — zero chamadas diretas a vendors em componentes
- [ ] **TRACK-02**: Todo evento inclui `event_id` (UUID v4) gerado na origem para deduplicação client-side e futura integração com Meta CAPI sem retrofit (RISCO CRÍTICO: tracking double-fire)
- [ ] **TRACK-03**: Meta Pixel, GA4 e Clarity carregam via `<Script strategy="afterInteractive">` no `AnalyticsProvider` — não no `<head>`, não inline
- [ ] **TRACK-04**: Eventos rastreados no mínimo: `cta_click` (com `location`), `whatsapp_click` (com `location`), `form_submit_attempt`, `form_submit_success`, `form_submit_error`, `section_view` (com `section` para todas as seções narrativas), `scroll_depth_25/50/75/100`
- [ ] **TRACK-05**: Form wrapper recebe `data-clarity-mask="true"` (e atributos equivalentes em campos sensíveis) — verificado em sessão real do Clarity antes do launch, não apenas por leitura de docs (RISCO CRÍTICO: Clarity gravando PII)
- [ ] **TRACK-06**: Configuração GA4 para SPA configurada via `@next/third-parties/google` ou Script com `send_page_view: false` + envio manual no `usePathname` change
- [ ] **TRACK-07**: Eventos validados nos três dashboards (Pixel Test Events, GA4 DebugView, Clarity recordings) ao fim da Phase 6

### Performance (PERF)

- [ ] **PERF-01**: Lighthouse Performance ≥ 90 desktop e ≥ 85 mobile em produção (ou Vercel preview limpa) — gate antes do launch
- [ ] **PERF-02**: LCP < 2.5s mobile e < 2.0s desktop em produção, medido com WebPageTest ou Lighthouse 3G/4G profile
- [ ] **PERF-03**: CLS < 0.1 em todas as breakpoints — imagens com `width`/`height` declarados e seções com altura reservada via `min-h-*`
- [ ] **PERF-04**: INP < 200ms — animações não bloqueiam main thread, motion suspende durante scroll fast
- [ ] **PERF-05**: Bundle JS gzipped ≤ 150KB no first-load (sem incluir Pixel/GA4/Clarity de terceiros) — verificado com `@next/bundle-analyzer`
- [ ] **PERF-06**: Peso total da página inicial ≤ 1.5MB mobile (incluindo hero) — image manifest com `sizes` corretos
- [ ] **PERF-07**: Seções abaixo do fold carregam via `next/dynamic({ ssr: true })` + `useInView` gating do motion runtime
- [ ] **PERF-08**: ~50 prints reais triados pra 12-18 imagens efetivamente usadas; todos servidos via `next/image` com AVIF/WebP automáticos e `sizes` declarados
- [ ] **PERF-09**: Animações suspendem ou simplificam em conexões `4g`/slow (via `navigator.connection.effectiveType` quando disponível) — graceful degradation

### SEO & Discoverability (SEO)

- [ ] **SEO-01**: `<title>` único otimizado para nicho clínicas + Likro, < 60 caracteres
- [ ] **SEO-02**: `<meta description>` única e específica < 160 caracteres, mencionando proposta de valor clínicas
- [ ] **SEO-03**: Open Graph completo (`og:title`, `og:description`, `og:image` 1200x630, `og:url`, `og:type`, `og:locale=pt_BR`) — testado em validador Meta + preview real do WhatsApp e LinkedIn
- [ ] **SEO-04**: Twitter Card `summary_large_image` configurada
- [ ] **SEO-05**: JSON-LD Organization tipado via `schema-dts` (logo, sameAs com Instagram/LinkedIn, contato) injetado no `app/layout.tsx`
- [ ] **SEO-06**: JSON-LD Product/Service ou WebPage adicional para a landing especificamente
- [ ] **SEO-07**: JSON-LD validado em Rich Results Test sem erros
- [ ] **SEO-08**: HTML semântico — uma única `<h1>` (hero), hierarquia clara `<h2>`/`<h3>` por seção, `<section>`/`<nav>`/`<footer>` corretos
- [ ] **SEO-09**: Todas as imagens com `alt` descritivo (não `alt=""` em imagens com conteúdo informativo)
- [ ] **SEO-10**: `lang="pt-BR"` no `<html>`
- [ ] **SEO-11**: Vercel preview `*.vercel.app` retorna `X-Robots-Tag: noindex` ou tem `robots.txt` que bloqueia indexação; produção (likro.com.br ou domínio final) permite

### Accessibility (A11Y)

- [ ] **A11Y-01**: Todos os pares texto/fundo passam contraste WCAG AA (mínimo 4.5:1 para texto, 3:1 para texto grande)
- [ ] **A11Y-02**: Navegação completa por teclado em CTAs, form, header e floating button; foco visível com outline customizado alinhado ao brand book
- [ ] **A11Y-03**: Form usa `<label>` associado, `aria-describedby` para mensagens de erro, `aria-invalid` em campos com erro
- [ ] **A11Y-04**: `prefers-reduced-motion` desliga ou simplifica todas as animações da página (verificado manualmente em macOS Reduce Motion + Windows Animations off)
- [ ] **A11Y-05**: Skip-link "Pular para conteúdo principal" visível ao receber foco
- [ ] **A11Y-06**: `<button>` para ações e `<a>` para navegação — sem `onClick` em `<div>`
- [ ] **A11Y-07**: Imagens decorativas usam `alt=""` e `role="presentation"`; imagens informativas têm alt descritivo

### Mobile-Specific (MOBILE)

- [ ] **MOBILE-01**: Toda decisão de motion intensity passa por `useDeviceTier()` — mobile recebe versão simplificada mas premium (não simplificada de obrigação)
- [ ] **MOBILE-02**: Floating WhatsApp CTA respeita safe area bottom (notch/home indicator) via `env(safe-area-inset-bottom)`
- [ ] **MOBILE-03**: Todos os tap targets têm pelo menos 44x44px (recomendação Apple) e 48x48dp (recomendação Material)
- [ ] **MOBILE-04**: Lenis não inicializa em `pointer: coarse` OU inicializa com `smoothTouch: false` (decisão final tomada após teste real)
- [ ] **MOBILE-05**: Hover effects têm fallback `:active` no touch — nada da experiência depende de hover
- [ ] **MOBILE-06**: Header é "hide-on-scroll-down, show-on-scroll-up" para liberar viewport mobile, mas sempre disponível em scroll up
- [ ] **MOBILE-07**: Validado em pelo menos: iPhone com iOS Safari, Android mid-tier com Chrome, iPad Safari (lista exata de devices definida na Phase 7 QA)

### Deploy & Operations (DEPLOY)

- [ ] **DEPLOY-01**: Repositório no GitHub conectado à Vercel com deploy automático em push para `main`
- [ ] **DEPLOY-02**: Preview deploys automáticos em pull requests
- [ ] **DEPLOY-03**: Variáveis de ambiente configuradas na Vercel: `NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`, `LEAD_WEBHOOK_URL`
- [ ] **DEPLOY-04**: Deploy v1 ocorre em URL `.vercel.app`; DNS para domínio final fica como ação posterior ao launch
- [ ] **DEPLOY-05**: Vercel Analytics ou Speed Insights habilitado para monitoramento contínuo de Core Web Vitals em produção

## v2 Requirements

Deferidos pra release futura. Não estão no roadmap atual.

### Expansão de conteúdo (V2-CONTENT)

- **V2-CONTENT-01**: Páginas verticais para outros segmentos (varejo, e-commerce, serviços)
- **V2-CONTENT-02**: Página de preços dedicada `/precos`
- **V2-CONTENT-03**: Blog / central de conteúdo para SEO de conteúdo
- **V2-CONTENT-04**: Página `/sobre` institucional
- **V2-CONTENT-05**: Página `/contato` com mapa, endereço, formulário longo

### Conversão avançada (V2-CONV)

- **V2-CONV-01**: A/B testing nativo (Vercel Edge Config ou GrowthBook)
- **V2-CONV-02**: Calculadora de ROI interativa para clínica
- **V2-CONV-03**: Vídeo demo embeddado (Mux ou self-hosted)
- **V2-CONV-04**: Booking direto de demo (Calendly / Cal.com integrado)
- **V2-CONV-05**: Integração nativa do form com CRM Likro (não webhook simples)

### Tracking avançado (V2-TRACK)

- **V2-TRACK-01**: Meta Conversions API (CAPI) para deduplicação server-side
- **V2-TRACK-02**: GA4 enhanced ecommerce events
- **V2-TRACK-03**: Cookie banner LGPD compliance (Consentmanager, Iubenda, etc.)

### Internacionalização (V2-I18N)

- **V2-I18N-01**: Suporte multi-idioma (PT-BR primário, EN secundário)

### Animação avançada (V2-MOTION)

- **V2-MOTION-01**: Introdução de GSAP/ScrollTrigger em seções específicas (Product pin-and-scrub avançado ou HowItWorks horizontal scroll) — drop-in via `<ScrollScene>` boundary
- **V2-MOTION-02**: Horizontal scroll cinematográfico para seção HowItWorks (jornada DM→Agendamento)
- **V2-MOTION-03**: WebGL/canvas effects para hero (apenas se posicionamento exigir; risco de performance alto)

### CMS & autoria (V2-CMS)

- **V2-CMS-01**: Migração da copy de `content/*.ts` para CMS (Sanity ou Contentful) para autoria sem deploy

## Out of Scope

Explicitamente excluídos. Documentados pra prevenir scope creep e reaparição em milestones futuros sem revisão consciente.

| Feature | Reason |
|---------|--------|
| Roxo `#7C3AED` como fundo de seção/página grande | Violação direta do brand book (roxo é destaque, não pano de fundo) — restrição mecânica no Tailwind config impede |
| Métricas inventadas ou depoimentos fabricados | Risco reputacional; contradiz posicionamento "real, em uso". Credibilidade vem de qualidade visual + operação ativa |
| Animações exageradas, infantis ou com excesso de movimento | Fere posicionamento premium; usuário pediu refinamento, não espetáculo |
| Pop-up exit-intent | Cheap conversion tactic; incompatível com posicionamento high-end |
| Carrossel automático de features | Anti-feature em landings premium 2026 (Linear, Vercel não usam); engajamento ruim, retira controle do usuário |
| Vídeo autoplay com áudio | Anti-feature universal; bloqueio em mobile da maioria dos browsers de qualquer forma |
| Intro animation longa antes do conteúdo | Mata LCP, frustra usuário com tráfego Meta Ads (alto bounce) |
| Form > 4 campos | Excesso de fricção; CTA primário já é WhatsApp |
| Foto stock genérica (spa, aperto de mão, call center) | Violação de brand book; mata "essa empresa é real" |
| GSAP/ScrollTrigger na v1 | Motion v12 cobre o necessário; adicionar segunda lib de animação agora é complexidade/curva/manutenção desnecessária. Arquitetura preparada via `<ScrollScene>` boundary. |
| CMS na v1 | Copy estática em TS basta; CMS adiciona infra + esquema sem retorno antes de volume de iteração |
| A/B testing nativo na v1 | Vercel + Clarity bastam pros primeiros aprendizados; A/B framework adiciona infra sem retorno antes de ter tráfego |
| Login / área de cliente | Vive em `app.likro.com.br`; não é função desta landing |
| Multi-idioma | Nicho é Brasil; sem demanda |
| Cookie banner LGPD | Entra com revisão jurídica antes de tráfego pago em escala (próximas milestones); não bloqueia launch técnico |
| Imagens com `priority` além do hero mockup | Apenas um `priority` por página — regra Next.js para preservar LCP |
| `web.whatsapp.com` em qualquer link da página | Helper proíbe; deep link sempre via `wa.me/` |
| `@studio-freight/lenis` ou `framer-motion` (sem hífen) | Pacotes deprecated/renomeados; usar `lenis` e `motion` (Motion v12) |
| Mais de 3 pesos de fonte (Inter Regular/Medium/Bold) | Brand book — restrição mecânica via `next/font` |
| Animação no LCP element do hero | Mata LCP — Lighthouse mobile falha; perde ranking e otimização Meta Ads |

## Traceability

Mapping requirement → phase. Preenchido pelo gsd-roadmapper em 2026-05-15.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| FOUND-07 | Phase 1 | Pending |
| FOUND-08 | Phase 1 | Pending |
| FOUND-09 | Phase 1 | Pending |
| FOUND-10 | Phase 1 | Pending |
| FOUND-11 | Phase 1 | Pending |
| FOUND-12 | Phase 1 | Pending |
| MOTION-01 | Phase 2 | Pending |
| MOTION-02 | Phase 2 | Pending |
| MOTION-03 | Phase 2 | Pending |
| MOTION-04 | Phase 2 | Pending |
| MOTION-05 | Phase 2 | Pending |
| MOTION-06 | Phase 2 | Pending |
| MOTION-07 | Phase 2 | Pending |
| MOTION-08 | Phase 2 | Pending |
| HERO-01 | Phase 3 | Pending |
| HERO-02 | Phase 3 | Pending |
| HERO-03 | Phase 3 | Pending |
| HERO-04 | Phase 3 | Pending |
| HERO-05 | Phase 3 | Pending |
| HERO-06 | Phase 3 | Pending |
| HERO-07 | Phase 3 | Pending |
| NARR-01 | Phase 4 | Pending |
| NARR-02 | Phase 4 | Pending |
| NARR-03 | Phase 4 | Pending |
| NARR-04 | Phase 4 | Pending |
| NARR-05 | Phase 4 | Pending |
| NARR-06 | Phase 4 | Pending |
| NARR-07 | Phase 4 | Pending |
| NARR-08 | Phase 4 | Pending |
| COPY-01 | Phase 3 | Pending |
| COPY-02 | Phase 4 | Pending |
| COPY-03 | Phase 4 | Pending |
| COPY-04 | Phase 3 | Pending |
| COPY-05 | Phase 4 | Pending |
| COPY-06 | Phase 4 | Pending |
| CTA-01 | Phase 1 | Pending |
| CTA-02 | Phase 1 | Pending |
| CTA-03 | Phase 5 | Pending |
| CTA-04 | Phase 3 | Pending |
| CTA-05 | Phase 5 | Pending |
| CTA-06 | Phase 5 | Pending |
| CTA-07 | Phase 5 | Pending |
| CTA-08 | Phase 5 | Pending |
| CTA-09 | Phase 5 | Pending |
| CTA-10 | Phase 5 | Pending |
| CTA-11 | Phase 5 | Pending |
| CTA-12 | Phase 5 | Pending |
| TRACK-01 | Phase 1 | Pending |
| TRACK-02 | Phase 1 | Pending |
| TRACK-03 | Phase 1 | Pending |
| TRACK-04 | Phase 6 | Pending |
| TRACK-05 | Phase 6 | Pending |
| TRACK-06 | Phase 6 | Pending |
| TRACK-07 | Phase 6 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-02 | Phase 7 | Pending |
| PERF-03 | Phase 7 | Pending |
| PERF-04 | Phase 7 | Pending |
| PERF-05 | Phase 7 | Pending |
| PERF-06 | Phase 7 | Pending |
| PERF-07 | Phase 7 | Pending |
| PERF-08 | Phase 7 | Pending |
| PERF-09 | Phase 7 | Pending |
| SEO-01 | Phase 7 | Pending |
| SEO-02 | Phase 7 | Pending |
| SEO-03 | Phase 7 | Pending |
| SEO-04 | Phase 7 | Pending |
| SEO-05 | Phase 7 | Pending |
| SEO-06 | Phase 7 | Pending |
| SEO-07 | Phase 7 | Pending |
| SEO-08 | Phase 7 | Pending |
| SEO-09 | Phase 7 | Pending |
| SEO-10 | Phase 7 | Pending |
| SEO-11 | Phase 7 | Pending |
| A11Y-01 | Phase 7 | Pending |
| A11Y-02 | Phase 7 | Pending |
| A11Y-03 | Phase 7 | Pending |
| A11Y-04 | Phase 7 | Pending |
| A11Y-05 | Phase 7 | Pending |
| A11Y-06 | Phase 7 | Pending |
| A11Y-07 | Phase 7 | Pending |
| MOBILE-01 | Phase 7 | Pending |
| MOBILE-02 | Phase 5 | Pending |
| MOBILE-03 | Phase 7 | Pending |
| MOBILE-04 | Phase 7 | Pending |
| MOBILE-05 | Phase 7 | Pending |
| MOBILE-06 | Phase 5 | Pending |
| MOBILE-07 | Phase 7 | Pending |
| DEPLOY-01 | Phase 7 | Pending |
| DEPLOY-02 | Phase 7 | Pending |
| DEPLOY-03 | Phase 7 | Pending |
| DEPLOY-04 | Phase 7 | Pending |
| DEPLOY-05 | Phase 7 | Pending |
| FUNIL-01 | Phase 9 | Pending |
| FUNIL-02 | Phase 9 | Pending |
| FUNIL-03 | Phase 9 | Pending |
| FUNIL-04 | Phase 9 | Pending |
| FUNIL-05 | Phase 9 | Pending |
| FUNIL-06 | Phase 9 | Pending |
| FUNIL-COPY | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 99 total (preâmbulo da v1 mencionava 84 como preliminar; reconfirmado em 99 pelo roadmapper — 12 FOUND + 8 MOTION + 7 HERO + 8 NARR + 6 COPY + 12 CTA + 7 TRACK + 9 PERF + 11 SEO + 7 A11Y + 7 MOBILE + 5 DEPLOY)
- Mapped to phases: 99 ✓
- Unmapped: 0 ✓
- Duplicates: 0 ✓

**Per-phase distribution:**
- Phase 1 (Foundations & Design System): 17 reqs
- Phase 2 (Motion Primitives): 8 reqs
- Phase 3 (Hero): 10 reqs
- Phase 4 (Narrative Sections): 12 reqs
- Phase 5 (Conversion): 11 reqs
- Phase 6 (Analytics Instrumentation Pass): 4 reqs
- Phase 7 (SEO + A11y + Performance + Deploy Hardening): 37 reqs
- Phase 9 (Funil): 7 reqs (FUNIL-01..06 + FUNIL-COPY) — milestone v2.1, separados da contagem v1

---
*Requirements defined: 2026-05-15*
*Last updated: 2026-05-15 — Traceability preenchida pelo gsd-roadmapper*
