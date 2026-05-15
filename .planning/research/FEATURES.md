# Feature Research — Likro Landing Page

**Domain:** Premium scroll-cinematic B2B SaaS landing page (vertical: clínicas e estéticas BR, tráfego Meta Ads Click-to-WhatsApp)
**Researched:** 2026-05-15
**Confidence:** HIGH (padrões de mercado bem documentados em 2026, refs primárias verificadas: Linear, Vercel, Stripe, Apple, Awwwards)

---

## TL;DR Estratégico

A landing precisa entregar três coisas simultaneamente, na ordem em que aparecem:

1. **Reconhecimento vertical em <3s** ("isso é pra clínica como a minha")
2. **Sensação premium contínua** (cinematografia controlada, nunca espetáculo barato)
3. **Atrito zero pro CTA primário** (WhatsApp acessível a qualquer momento do scroll, mas sem floating bar agressivo que comprometa o premium)

Tudo neste documento serve essas três metas. Toda feature que não serve, vai pra Anti-Features.

---

## Feature Landscape

### Table Stakes — O Que o Mercado Premium 2026 Já Tem

Não diferenciam, mas a ausência mata o posicionamento premium na hora.

| Feature | Por Que é Esperado | Complexidade | Notas de Implementação |
|---------|---------------------|--------------|------------------------|
| **Header minimalista sticky com transição on-scroll** | Padrão Linear/Vercel/Stripe. Logo + 1 CTA (WhatsApp). Some/encolhe no scroll up, reaparece no scroll down. | LOW | Framer Motion `useScroll` + `useTransform` para opacity/blur do background; backdrop-blur ao scrollar |
| **Hero com headline gigante + sub-copy + CTA primário acima da dobra** | Convenção universal SaaS premium. No mobile (80%+ do tráfego Instagram) a primary CTA precisa estar visível em <1 scroll. | LOW | Tipografia Inter 700/800 ~60-80px desktop, 36-44px mobile |
| **Localização nativa PT-BR** | Vertical brasileira; nicho não tolera "tradução de SaaS gringo". Inclui formatação R$, números, idiomas no copy. | LOW | Copy estática em código, sem i18n na v1 |
| **Mockups/screenshots reais do produto** | Linear, Stripe e Vercel viraram referência usando UI real, não ilustração genérica. ~50 prints já existem no projeto. | LOW-MED | Otimização WebP/AVIF, dimensões responsivas, lazy loading |
| **CTAs múltiplos ao longo do scroll** | Padrão validado em SaaS: pages com CTA único acima da dobra + repetido em pontos-chave do scroll convertem ~13.5% vs ~10.5% pulverizadas. | LOW | Mesmo deeplink `wa.me/...` com `?text=` pré-preenchido por seção (parâmetro UTM-like permite rastrear de qual seção veio) |
| **Footer enxuto com contato + redes + legal mínimo** | Final de scroll precisa fechar com profissionalismo, não anticlímax. | LOW | Logo, contato direto, Instagram, link legal (Política/Termos) — sem nav cruzada |
| **Favicon + Open Graph metadata + JSON-LD Organization** | Sem isso, link compartilhado no WhatsApp parece amador. Mata o premium antes do clique. | LOW | Next.js metadata API; OG image 1200x630 com branding |
| **Performance Lighthouse ≥90 desktop / ≥85 mobile** | Vercel/Linear são referência justamente por entregar cinema + LCP <2.5s. Cair abaixo disso quebra o "absurdo" prometido. | MED | Next/Image, fontes self-hosted ou preload, code-splitting por seção, animações em transform/opacity apenas |
| **Tracking Meta Pixel + GA4 + Microsoft Clarity instalado e disparando eventos** | Para tráfego pago, sem instrumentação a campanha é cega. Clarity especialmente útil pra ver onde o scroll perde atenção. | MED | Eventos: `cta_whatsapp_click` (com origem), `form_submit`, `scroll_depth` (25/50/75/100), `section_viewed`, `time_on_section` |
| **Acessibilidade WCAG AA básica** | Contraste, navegação por teclado, alt text, foco visível. Premium implica cuidado, não só estética. | LOW-MED | Tailwind permite contraste; foco visível custom; alts descritivos nos mockups |
| **`prefers-reduced-motion` respeitado em todas as animações cinematográficas** | Padrão moderno obrigatório (WCAG 2.2 + AAA opcional). Sem isso, usuários com distúrbio vestibular têm enjoo real. | MED | Hook `useReducedMotion` do Framer Motion já desabilita transitions; mas animações scroll-driven via `useScroll` precisam de fallback manual (variante estática) |
| **Smooth scroll (Lenis)** | Lenis virou padrão 2025-2026 em sites premium (já adotado oficialmente pelo Framer). Diferença entre "site bonito" e "site que se sente caro". | LOW | Pacote `@studio-freight/lenis` ou `lenis`; integração com Framer Motion via `useScroll` requer ScrollContext custom |
| **Section-based layout com snap parcial ou ritmo visual claro** | Padrão estabelecido: usuários digerem chunks discretos. Sem ritmo, scroll vira "mar de divs". | LOW | CSS `scroll-snap-type: y proximity` opcional; mais importante é espaçamento vertical generoso (160-240px entre seções desktop, 96-128px mobile) |
| **Direção visual escuro → claro → escuro** | Já é decisão do brand. Padrão Linear/Vercel também usa contraste forte entre seções pra criar atos narrativos. | LOW | Background da seção controla; transição via gradient blur opcional |
| **Lazy-load de imagens abaixo da dobra** | Web Vitals exige. LCP < 2.5s não acontece com 50 prints carregando junto. | LOW | `next/image` com `loading="lazy"` automático fora do viewport inicial |

---

### Cinematic Scroll Patterns — Vocabulário Cinematográfico 2026

Estes são os "movimentos de câmera" que diferenciam landing premium de site genérico. Cada um tem **lugar específico** na narrativa Dor → Solução → Produto → Prova → CTA.

| Padrão | Onde Usar | Complexidade | Impacto / Retenção | Notas |
|--------|-----------|--------------|---------------------|-------|
| **Sticky section / pin-and-scrub** (seção fica fixa enquanto conteúdo interno avança com scroll) | Seção Produto (camadas de features) e Seção "Como Funciona" (jornada do lead) | HIGH | ALTO — segura atenção 2-4x mais que scroll comum | Framer Motion: `position: sticky` no container + `useScroll` com `target` no inner. No mobile, simplificar (sticky pode brigar com address bar do Safari iOS) |
| **Headline reveal gigante** (texto enorme entrando palavra por palavra ou linha por linha conforme aparece no viewport) | Transições entre atos (Dor → Solução) e abertura de seções-chave | LOW-MED | ALTO — cria momento de pausa cinematográfica | Framer Motion `whileInView` com stagger `0.05-0.1s`; Inter 800 em 80-140px desktop, manter legibilidade mobile (60-80px max) |
| **Mockup crescendo do fundo com blur → focus** (dashboard surge desfocado, ganha nitidez, escala 0.9 → 1.0 com fade) | Transição Dor → Solução (revela da plataforma) | MED | ALTO — sensação "Apple keynote" | `useTransform` em filter blur(20px → 0) + scale(0.9 → 1) + opacity(0 → 1) sincronizado com scroll progress de 0 → 0.4 |
| **Layered parallax sutil** (background, midground, foreground em velocidades diferentes — máximo 3 camadas) | Hero, seção de Dor, seção de Prova | MED | MÉDIO — depth sem ser brega | **Limitar a 1 efeito sutil por página** (recomendação acessibilidade); usar `useScroll` + `useTransform` em y; respeitar `prefers-reduced-motion` desabilitando |
| **Feature reveal em camadas (stacked sticky cards)** | Seção Produto: Atendimentos → CRM → Agentes IA → Relatórios entrando um sobre o outro | HIGH | ALTO — substitui carrossel chato por narrativa | Container com altura `400vh`, cada feature pinada por 100vh; cards com z-index e leve scale-down quando o próximo entra (efeito Apple Watch comparison) |
| **Scroll-synced number/value count-up** (R$, %, contadores entrando em viewport) | **NÃO USAR** — usuário proibiu métricas fabricadas | — | — | Listado pra deixar explícito que está fora |
| **Mouse-tracking spotlight / glow follow** (gradient roxo seguindo o cursor sutilmente em zonas escuras) | Hero, seção final de CTA | LOW-MED | MÉDIO — desktop only, ignorado mobile | CSS `radial-gradient` com `--mouse-x`/`--mouse-y` custom properties via JS listener; performance OK se usar `transform` em vez de redraw |
| **Horizontal scroll dentro de seção sticky** (seção fica pinada, conteúdo move horizontalmente conforme scroll vertical) | Seção "Como Funciona" — jornada do lead (Instagram → DM → CRM → Agendamento) | HIGH | ALTO — storytelling linear visual | `useScroll` em container `400vh`, `useTransform` em x do inner; **nunca substituir scroll vertical em página inteira** (alienação UX) |
| **Background gradient animado sutil** (ondas, blobs, mesh gradient em movimento lento) | Hero escuro, seção final de CTA escura | LOW | BAIXO-MÉDIO | CSS conic/radial gradient animado em `@keyframes` ou via Framer Motion; roxo `#7C3AED` como destaque pontual, não fundo dominante |
| **Text scrub / character-by-character reveal sincronizado com scroll** | Headline ato final ("Pronto pra organizar sua clínica?") | MED | MÉDIO | Sem precisar de GSAP SplitText; Framer Motion + split nativo JS dá conta. Cuidado pra não usar em texto longo (cansa) |
| **Bento grid revealing on scroll** (cards com features se montando conforme entram em viewport, com stagger) | Seção Produto (alternativa ou complemento ao sticky stack) | MED | MÉDIO-ALTO | Padrão Linear/Apple 2024-2026; cards com tamanhos variados, alguns com mockup animado embutido. Stagger 0.08s entre cards |
| **Video scrubbing** (vídeo tocando ao scroll, sem áudio) | **NÃO RECOMENDADO v1** — peso alto pra ganho marginal vs sticky+pin | HIGH | ALTO mas custo alto | Apple usa, mas requer vídeo otimizado (~5-10MB) + handling de seek em iOS Safari (limitado). Considerar v1.x se justificar |
| **Image sequence scroll (canvas frame-by-frame)** | **NÃO RECOMENDADO v1** — Apple AirPods page faz, mas é overkill aqui | HIGH | ALTO mas custo proibitivo | 60-120 frames PNG/WebP + canvas redraw; só faz sentido se houver storytelling 3D real (rotacionar produto físico) |
| **Cursor magnetic / button hover with affordance amplification** | CTAs primários (WhatsApp) no desktop | LOW | BAIXO mas eleva o tátil | Framer Motion `whileHover` com scale 1.03 + spring leve; cuidado pra não infantilizar |
| **Section transition com mask/clip-path reveal** | Transição entre atos visuais escuro → claro | MED | MÉDIO | `clip-path: inset()` animado via scroll progress; mais sutil que fade puro |
| **Persistent floating CTA mobile** (botão WhatsApp flutuante após primeiro scroll, com timing entry) | Mobile apenas, aparece após 30-40% scroll | LOW | ALTO em conversão, RISCO premium | **Decisão tática**: dado o tráfego 80% mobile + CTA primário WhatsApp, recomenda-se versão *discreta* (ícone só, canto inferior direito, semi-translúcido, aparece após hero sair de tela). Anti-pattern se for barra grossa ou pulsante |

---

### Vertical-Specific Content Modules — Clínicas e Estéticas

Modules que **só fazem sentido neste vertical** e geram reconhecimento imediato.

| Módulo | Função Narrativa | Implementação | Complexidade |
|--------|------------------|---------------|--------------|
| **"Cenário da Clínica Desorganizada"** (mosaico/grid visual de dores: prints de Instagram com DMs sem resposta, WhatsApp espalhado em vários celulares mockados, follow-up esquecido em post-its, agenda com horário vago) | Ato 1 — Dor. Reconhecimento vertical imediato. | Composição visual de mockups customizados (não foto stock); pode usar SVG/ilustração tech ou prints mockados em devices reais (iPhone frame com tela de DM) | MED |
| **"DM Instagram → Agendamento" visualização do funil** | Ato 3 — Como Funciona. Storytelling visual da jornada de um lead. | Sequência horizontal sticky: tela do Instagram DM → entrada no CRM Likro → tag/atribuição automática → kanban movendo card → agendamento marcado | HIGH (mas core do storytelling) |
| **Mock de inbox multicanal real** (caixa de entrada Likro com Instagram + WhatsApp + Messenger lado a lado, mensagens reais sintetizadas) | Ato 3 — Produto. Demonstra centralização tangível. | Print real do produto (já existe nos 50 screenshots); pode ter animação leve de "nova mensagem entrando" via Framer Motion | LOW-MED |
| **Kanban CRM com etapas específicas de clínica** (Contato Inicial → Orçamento → Agendamento → Compra → Pós-venda) | Ato 3 — Produto, segmento CRM. | Print real com leve animação de card movendo entre colunas (pode ser GIF/Lottie ou Framer Motion sobre print) | MED |
| **"Agente IA atendendo lead 24/7"** (chat fictício mostrando agente Likro respondendo lead noturno, qualificando e agendando) | Ato 3 — Produto, segmento Agentes IA. Diferenciação real. | Animação de balões de chat aparecendo com timing (Framer Motion + delay); evitar "loop infinito chato" | MED |
| **Heatmap de volume / dashboard de resultados (print real)** | Ato 3 — Produto, segmento Relatórios. | Print direto do produto; pode ter scroll reveal sutil em cards de número (sem fabricar valores, mostrar o real) | LOW |
| **"Operação ativa hoje" — menção elegante a Dolce Home** | Ato 4 — Prova. Credibilidade sem inventar. | Card lateral discreto: "Plataforma em uso em operação real — Dolce Home" + logo (se autorizado) ou descrição. Sem números, sem depoimento — apenas constatação de existência | LOW |
| **Bloco "feito pra clínicas como a sua"** (lista de cenários específicos: 5-20 atendentes, múltiplos profissionais, alta sazonalidade de promoções, agenda compartilhada) | Ato 2 — Solução. Aprofunda reconhecimento vertical. | Lista visual com ícones discretos + texto curto; pode ser bento de 3-4 cards | LOW |
| **FAQ vertical** ("Funciona com meu WhatsApp atual?", "Preciso trocar de sistema de agenda?", "Quanto tempo demora pra implantar?", "Funciona com 1 ou 5 atendentes?") | Próximo ao CTA final. Remove fricção de objeções específicas do vertical. | Accordion simples; máximo 5-7 perguntas; respostas curtas e diretas (3-5 linhas) | LOW |
| **Formulário consultivo discreto** ("Prefere que a gente entre em contato?" — nome, clínica, telefone, melhor horário) | Captura secundária no fim do scroll. | Form simples com 4 campos; envio via webhook (email ou Slack) — sem integração CRM nativa v1; validação inline | MED |
| **CTA WhatsApp com mensagem pré-preenchida e UTM por seção** | Toda repetição de CTA primário. | `wa.me/55XXXXX?text=Vim pela seção Y do site` — permite rastrear qual seção converte mais via Pixel/GA4 custom event | LOW |

---

### Differentiators — Onde Likro Vai Além

Features que ninguém no vertical brasileiro de clínicas faz com este nível. **Não trate como obrigatórias** — escolha 2-3 pra realmente brilhar.

| Differentiator | Proposta de Valor | Complexidade | Notas |
|----------------|-------------------|--------------|-------|
| **Demo interativa embarcada de uma feature** (ex: usuário pode "arrastar" um card no kanban mockado, ou clicar num lead pra ver o histórico) | Sai do passivo: faz o decisor *sentir* o produto em 10 segundos | HIGH | Limitar a 1 interação por landing (não vira playground); Framer Motion `drag` constrained; cuidado mobile (touch handling) |
| **Dashboard "vivo" no hero** (números do dashboard com micro-animação contínua sutil de update — não fabricar valor, mas dar sensação de produto em uso) | Sinaliza "produto real, em operação", coerente com posicionamento | MED | Animação de pulse em um indicador, badge "online", barra de progresso variando levemente — TUDO visual, zero claim numérico |
| **Scroll-synced storytelling com áudio off** (legendas/cards aparecem em ritmo de filme) | Eleva o ato 3 (Como Funciona) a peça de portfolio | HIGH | Sticky + scrub controlado; sem áudio jamais (anti-pattern abaixo) |
| **Transição cinemática entre Dor e Solução** (escuro vira claro com expansão radial do mockup do centro, mascarando a transição) | Momento "eureka" visual — define o premium da landing | MED-HIGH | `clip-path: circle()` animado de 0 → 150vw conforme scroll; pode encadear com blur reveal do mockup |
| **Microcopy em PT-BR com voz da marca refinada** (sem "Bem-vindo!", sem "Descubra agora!", sem "Conecte-se", sem buzzword SaaS) | Diferenciador silencioso: 95% das landings BR de SaaS são tradução genérica | LOW (escrita) / HIGH (curadoria) | Lenny revisa cada string; rascunho IA é input, não output |
| **Easter egg sutil no console / título da aba** (mensagem pra devs ou variação no `<title>` quando aba inativa: "Volta aqui 👀") | Sinaliza atenção a detalhe, viraliza em nicho técnico | LOW | Opcional, mas barato |
| **Header de seção com índice de scroll** (indicador discreto lateral mostrando em qual ato narrativo o usuário está: 1/5, 2/5...) | Storytelling explícito, antecipa o ritmo cinematográfico | LOW-MED | Stripe e algumas SOTD usam; cuidado pra não poluir |
| **Open Graph dinâmico animado** (preview do link no WhatsApp/Instagram já gera curiosidade) | Compartilhamento ganha vida própria | MED | Next.js `og` route com layout custom; não animado em si (OG é estático), mas com design forte |

**Recomendação:** Eleger 3 diferenciais reais. Sugestão pra Likro v1:
1. **Transição cinemática Dor → Solução** (define o ato técnico que faz "uau")
2. **Storytelling sticky horizontal "DM → Agendamento"** (entrega o vertical de forma única)
3. **Microcopy curado em PT-BR** (gratuito tecnicamente, mortal pro posicionamento)

---

### Como Comunicar Credibilidade Sem Métricas/Depoimentos Fabricados

Restrição explícita do usuário. O que sites premium B2B fazem quando não querem (ou ainda não podem) liderar com números:

| Tática | Como Likro Aplica | Complexidade |
|--------|---------------------|--------------|
| **Qualidade visual como prova** | Refinamento extremo da landing comunica "empresa séria" antes de qualquer texto. Linear, Vercel e Stripe convertem por isso. | (já é o projeto inteiro) |
| **Mockups reais do produto em ação** | 50 prints existem — usá-los exaustivamente. Cada feature mostra a tela real, não ilustração. | LOW (curadoria de qual print onde) |
| **Linguagem específica do nicho** | Frases que só quem entende clínica escreveria: "leads que somem", "atendente errada respondendo", "Instagram virou ticket de SAC". Reconhecimento > claim. | LOW |
| **Demonstração funcional embarcada** | Demo interativa (mesmo que limitada) > 10 testemunhos vagos. | MED-HIGH |
| **Menção honesta da operação existente** | "Plataforma em uso em operação real" + nome (Dolce Home, se autorizado) — fato verificável, não claim. | LOW |
| **Co-fundadores visíveis (foto + nome + LinkedIn)** | Sinaliza "tem gente real por trás". Discreto, no footer ou seção "quem está construindo". | LOW |
| **Brand book aparente** (tipografia consistente, paleta disciplinada, espaçamento generoso) | Empresa que cuida do brand cuida do produto. Comunicação inconsciente. | (já é o projeto) |
| **Open Graph + favicon impecáveis** | Primeira impressão antes do clique. Amador morre aqui. | LOW |
| **Resposta WhatsApp rápida e humana** | O CTA é WhatsApp — se quem atende responder em 2 minutos com tom consultivo, fecha a prova social. | (operacional, não landing) |
| **Página estável, sem bugs, sem 404, sem texto cortado** | Premium falha em detalhes; QA é prova. | (QA obrigatório) |
| **Indicação leve de stack/segurança** ("dados em servidor BR", "comunicação criptografada", "LGPD compliant") | Sinaliza maturidade técnica sem precisar de selos | LOW |

---

### Anti-Features — Não Construir

Coisas que parecem boas mas matam o posicionamento premium ou o vertical clínicas especificamente.

| Anti-Feature | Por Que é Pedido / Tentador | Por Que é Problemático | Alternativa |
|--------------|------------------------------|------------------------|-------------|
| **Vídeo autoplay com áudio no hero** | Imersão "cinematográfica" instantânea | Mobile bloqueia por padrão; quem deixa toca som inesperado e o usuário fecha aba; viola UX moderna | Vídeo silencioso com loop curto OU dashboard animado interativo |
| **Intro animation de 3-5s antes do conteúdo** ("Likro" caindo, loader bonito) | "É como Apple keynote" | Mata o LCP, frustra mobile (Instagram traffic vem ansioso), Google penaliza | Hero já com conteúdo + animação contínua sutil (glow, gradient lento) |
| **Carrossel de features** | Padrão antigo SaaS, "cabe muita coisa em pouco espaço" | Usuário não interage — última feature nunca é vista; baixa retenção; viola progressive disclosure | Bento grid ou sticky stack vertical |
| **Carrossel de logos de clientes "como visto em…"** | Social proof rápido | **PROIBIDO pelo usuário** — não há clientes pra mostrar ainda além de Dolce Home; logo único parece pobre, falso parece falso | Menção textual elegante da operação real |
| **Contadores fabricados** ("+10.000 atendimentos", "3x mais conversão") | Quick social proof | **PROIBIDO pelo usuário** — claim sem base destrói credibilidade quando questionado; risco LGPD/CDC | Demonstração funcional do produto |
| **Testemunhos com foto de banco de imagem** | "Quase ninguém percebe" | Todo mundo percebe. Mata a marca pra quem percebe. **PROIBIDO**. | Sem depoimentos OU depoimentos reais futuros (v1.x) |
| **Floating chat widget genérico (Tawk, Intercom-style)** | "Captura quem tem dúvida" | Compete com o CTA WhatsApp primário, polui premium, mais um popup pra mobile | CTA WhatsApp já cumpre essa função |
| **Cookie banner full-screen agressivo na v1** | "Compliance LGPD" | Mata o impacto da hero; usuário decidiu adiar pra revisão jurídica | Banner discreto no rodapé quando entrar em escala (pós-v1) |
| **Pop-up de exit-intent** | "Captura quem ia sair" | Anti-padrão premium absoluto; barateia a marca; bloqueia em mobile | Form consultivo discreto + CTA WhatsApp persistente já cobrem |
| **Dark mode toggle** | "Padrão moderno" | Landing tem direção visual definida (escuro→claro→escuro); toggle quebra o storytelling; complexidade desnecessária | Direção visual única, controlada |
| **Página de preços (`/precos`)** | "Transparência" | **Decisão estratégica do usuário** — preço é conversa no WhatsApp; expor tabela tira o lead da jornada consultiva | CTA WhatsApp pra falar de preço |
| **Blog / changelog / docs na v1** | "Conteúdo gera SEO" | Foge do escopo "uma página só"; SEO de conteúdo é estratégia separada | Adicionar depois quando volume justificar |
| **Animações exageradas (rotação 3D, partículas excessivas, glitch, neon)** | "Awwwards SOTD vibes" | Vira brega no vertical clínicas; decisor (dono de clínica, 35-55 anos, B2B) interpreta como instável | Cinemática contida: blur reveal, sticky scroll, parallax sutil |
| **Roxo `#7C3AED` como fundo de seção inteira** | "Brand color forte" | **PROIBIDO pelo brand book** — roxo é destaque pontual | Roxo em CTAs, glows, ícones, badges, links |
| **Tipografia variada (3+ famílias)** | "Mais expressivo" | **PROIBIDO pelo brand book** — Inter, máximo 3 pesos | Hierarquia tipográfica via tamanho e peso, não via família |
| **Foto stock genérica de "mulher sorrindo no spa"** | "Humaniza" | Banaliza, vira clichê de salão; descredibiliza B2B premium | Mockups do produto + ilustração abstrata tech sutil com roxo |
| **Múltiplos CTAs primários competindo** (Cadastre-se / Fale conosco / Veja demo / WhatsApp) | "Mais opções, mais conversão" | Pesquisa mostra que página com 5+ CTAs converte ~3pp menos; usuário paralisa | CTA primário único (WhatsApp) repetido; form consultivo como secundário discreto |
| **A/B testing nativo na v1** | "Otimização desde o dia 1" | Sem volume de tráfego, A/B é ruído; Clarity + GA já dão hipóteses | Adicionar quando volume justificar (v1.x) |
| **CMS (Sanity/Contentful)** | "Edição sem deploy" | Overhead pra copy que muda raramente; v1 estável é prioridade | Copy em código; CMS se/quando volume de iteração justificar |
| **GSAP/ScrollTrigger na v1** | "Padrão profissional de scroll" | Licença comercial + curva extra; Framer Motion + Lenis cobre 90% do necessário; arquitetura preparada pra adicionar depois | Framer Motion + Lenis + animações modulares por seção |
| **Form longo (8+ campos, qualificação BANT)** | "Mais qualificação" | Conversion killer em mobile; vertical clínicas é consultivo, não enterprise | 4 campos no form (nome, clínica, telefone, melhor horário) |
| **Botões circulares grandes "pulsantes" estilo glow infinito** | "Chama atenção pro CTA" | Vira chamariz barato; viola premium | CTA com hover sutil (scale 1.03 + spring) + microcopy clara |

---

## Feature Dependencies

```
Lenis (smooth scroll global)
    └── habilita Framer Motion useScroll com fluidez real
            ├── habilita Sticky pin-and-scrub
            │       └── habilita Stack reveal de Features (Ato 3)
            │       └── habilita Storytelling horizontal "DM → Agendamento"
            ├── habilita Headline reveal
            ├── habilita Mockup blur+scale reveal
            └── habilita Parallax sutil

prefers-reduced-motion
    └── REQUER fallback estático pra TODA animação scroll-driven
            └── conflita com pin-and-scrub se não houver variante simples
            └── conflita com horizontal scroll forçado (precisa vertical fallback)

Tracking (Meta Pixel + GA4 + Clarity)
    └── REQUER eventos de CTA por seção
            └── REQUER UTM/identificador por seção no link wa.me
            └── REQUER scroll-depth tracking
                    └── habilita análise de onde o storytelling perde atenção

CTA WhatsApp
    └── REQUER número Likro definido (operacional, não landing)
    └── REQUER cópia pré-preenchida por seção
    └── enhanced por mensagem contextual da seção de origem

Form Consultivo
    └── REQUER endpoint webhook (email/Slack) ou function Vercel
    └── REQUER validação inline + estado de loading + sucesso
    └── enhanced por reCAPTCHA invisível se spam aparecer (v1.x)

Mockups Reais do Produto (50 prints)
    └── REQUER curadoria por seção (qual print conta qual história)
    └── REQUER otimização WebP/AVIF + responsive
    └── REQUER alt text descritivo (acessibilidade + SEO)

Direção Visual escuro → claro → escuro
    └── REQUER transições entre seções pensadas (não corte seco)
    └── conflita com dark mode toggle (anti-feature)

Performance (Lighthouse 90/85)
    └── REQUER lazy load de imagens + fontes preload
    └── REQUER animações em transform/opacity apenas (não width/height/top/left)
    └── REQUER code-splitting por seção (Next.js dynamic import pra seções pesadas)
    └── conflita com vídeo scrubbing + image sequence (anti-features v1)
```

### Dependency Notes

- **Lenis é fundação:** sem smooth scroll, animações scroll-driven do Framer Motion ficam serrilhadas em alta densidade de eventos. Instalar primeiro, todas as outras animações são consumidoras.
- **`prefers-reduced-motion` não é opcional:** toda animação cinematográfica precisa ter versão "static reveal" (aparição simples por opacity). Sem isso, falha acessibilidade WCAG e gera enjoo real em usuários sensíveis. Hook `useReducedMotion` deve ser usado em todo componente animado.
- **Tracking define o aprendizado:** sem eventos por seção, Clarity vira só "vídeo bonito"; precisa cruzar scroll-depth com cliques no CTA pra entender onde o funil quebra.
- **Sticky pin-and-scrub e horizontal scroll dependem da mesma fundação técnica:** se uma funciona, a outra funciona; investir uma vez na infra de scroll progress sincronizado paga ambas.
- **Mockups reais são commodity escassa:** os 50 prints são ativo crítico. Sem eles, Likro teria que ilustrar — o que mataria parte da credibilidade "produto real".

---

## MVP Definition

### Launch With (v1)

Tudo o que está em **Active** no PROJECT.md já é a definição de MVP. Filtrando pelas features priorizadas neste documento:

**Estrutura Narrativa:**
- [ ] Hero com headline + sub-copy + CTA WhatsApp + dashboard mockup com animação sutil
- [ ] Seção Dor — "Cenário da Clínica Desorganizada" (mosaico visual)
- [ ] Seção Solução — Transição cinemática (Mockup blur+scale reveal)
- [ ] Seção Produto — Sticky stack reveal de Atendimentos / CRM / Agentes IA / Relatórios com prints reais
- [ ] Seção Como Funciona — Jornada "DM Instagram → Agendamento" (sticky com sequência visual; horizontal scroll é stretch goal, pode ser vertical staggered na v1)
- [ ] Seção Prova — Bloco elegante mencionando operação real + visual premium como prova implícita
- [ ] Seção CTA Final — CTA WhatsApp em destaque + Form consultivo discreto
- [ ] FAQ vertical (5-7 perguntas específicas de clínica)

**Componentes Persistentes:**
- [ ] Header minimalista sticky com Logo + CTA WhatsApp
- [ ] Footer enxuto (contato + redes + legal)
- [ ] CTAs WhatsApp repetidos em ~4 pontos do scroll com UTM/parâmetro de origem
- [ ] Floating CTA WhatsApp discreto mobile (após primeiro scroll)

**Cinematografia Core:**
- [ ] Lenis smooth scroll global
- [ ] Headline reveal nas transições entre atos
- [ ] Mockup blur+scale reveal (transição Dor → Solução)
- [ ] Sticky pin-and-scrub na seção Produto
- [ ] Parallax sutil (1 efeito por página)
- [ ] `prefers-reduced-motion` respeitado em tudo

**Técnico Não-Negociável:**
- [ ] Lighthouse ≥90 desktop / ≥85 mobile
- [ ] Meta Pixel + GA4 + Clarity instalados com eventos custom
- [ ] SEO: Open Graph, sitemap, robots, favicon, JSON-LD Organization
- [ ] WCAG AA básico
- [ ] Deploy Vercel

### Add After Validation (v1.x)

Trigger: primeiros 30 dias de tráfego pago, ≥1.000 sessões, dados Clarity claros.

- [ ] **Demo interativa embarcada** (kanban drag, ou mock de inbox interativo) — se Clarity mostrar que usuário fica preso/perdido na seção Produto, demo interativa pode salvar
- [ ] **Storytelling horizontal scroll** na seção Como Funciona — se a versão vertical não engajar
- [ ] **A/B testing de headlines** via Vercel Edge Config + experiments — quando volume justificar
- [ ] **Cookie banner LGPD discreto** — antes de escalar tráfego pago acima de R$ 5k/mês
- [ ] **reCAPTCHA invisível no form** — se spam aparecer
- [ ] **Integração nativa do form com CRM Likro** — substituir webhook email/Slack
- [ ] **Variações de página por origem de tráfego** (UTM-based) — copy ajustada por anúncio
- [ ] **Vídeo scrubbing real do dashboard** (substituir mockup estático no hero) — se houver budget de produção
- [ ] **Indicador de scroll lateral** (1/5, 2/5...) — se Clarity mostrar abandono mid-page

### Future Consideration (v2+)

- [ ] **CMS (Sanity)** — quando copy mudar 2+ vezes/mês
- [ ] **Páginas verticais adicionais** (varejo, e-commerce, serviços) — quando aquisição expandir
- [ ] **Página `/precos`** — só se a estratégia comercial mudar (improvável v1-v2)
- [ ] **Blog / central de conteúdo** — quando SEO orgânico virar canal prioritário
- [ ] **GSAP/ScrollTrigger em seções específicas** — se Framer Motion travar em alguma animação complexa que justifique licença
- [ ] **Image sequence scrolling (canvas frame-by-frame)** estilo Apple AirPods — se houver storytelling 3D que peça
- [ ] **Multi-idioma (en, es)** — quando expansão LATAM/internacional entrar no radar
- [ ] **Área de cliente / login na landing** — não faz sentido (vai pro app.likro.com.br)

---

## Feature Prioritization Matrix

| Feature | Valor pro Usuário | Custo de Implementação | Prioridade |
|---------|---------------------|--------------------------|------------|
| Hero com mockup e CTA WhatsApp | HIGH | LOW | **P1** |
| Sticky stack reveal — seção Produto | HIGH | HIGH | **P1** |
| Mockup blur+scale reveal — transição Dor→Solução | HIGH | MED | **P1** |
| Headline reveal nas transições | MED | LOW | **P1** |
| Lenis smooth scroll | HIGH (sensação) | LOW | **P1** |
| `prefers-reduced-motion` fallback | HIGH (acessibilidade) | MED | **P1** |
| Tracking Pixel + GA4 + Clarity | HIGH (negócio) | MED | **P1** |
| Mockups reais do produto curados por seção | HIGH | LOW (já existem) | **P1** |
| FAQ vertical | MED | LOW | **P1** |
| Form consultivo discreto + webhook | MED | MED | **P1** |
| Floating CTA WhatsApp mobile | HIGH | LOW | **P1** |
| Microcopy curado PT-BR | HIGH | HIGH (curadoria) | **P1** |
| SEO técnico (OG, sitemap, JSON-LD) | HIGH | LOW | **P1** |
| Storytelling horizontal "DM→Agendamento" | HIGH | HIGH | **P2** (vertical staggered na v1 OK) |
| Parallax sutil | MED | LOW-MED | **P2** |
| Mouse-tracking spotlight desktop | LOW-MED | LOW-MED | **P2** |
| Demo interativa embarcada | HIGH | HIGH | **P2** |
| Dashboard "vivo" no hero (micro-animações) | MED | MED | **P2** |
| Indicador de scroll lateral | LOW | LOW | **P3** |
| Easter egg console / title | LOW | LOW | **P3** |
| Video scrubbing | HIGH | HIGH | **P3** |
| Image sequence canvas | HIGH | VERY HIGH | **P3** |

---

## Reference Site Pattern Analysis

| Site | O Que Faz Bem | Aplicação Likro |
|------|---------------|------------------|
| **Linear.app** | Dark hero + bento grid de features com prints reais; densidade alta + whitespace controlado; "unapologetic specificity" no posicionamento (gold standard SaaS premium) | Bento grid pra seção Produto OU sticky stack; dark hero/closing; especificidade vertical clínicas |
| **Vercel.com** | Animated gradients no hero; code snippets + deployment previews lado a lado; interactive demos em feature sections | Gradients sutis no hero escuro; mockup interativo possível na seção Produto v1.x |
| **Stripe Sessions / stripe.com** | Engineering feat: hero gradient animado mudando ao scroll; ritmo entre seções; tipografia gigante em momentos-chave | Headline reveal gigante; gradient sutil mudando ao scroll; ritmo entre seções |
| **Apple product pages** | Motion design around intent (cada animação serve narrativa); video scrubbing + image sequences; sticky pinning; content motion vs graphical motion separation | Sticky pin-and-scrub na seção Produto; transição cinemática Dor→Solução; disciplina de movimento (nada gratuito) |
| **Framer.com (próprio site)** | Showcase de animações scroll-driven; Lenis oficialmente adotado; texture e brilho em mockups | Lenis (já decidido); brilho discreto nos mockups via blur+glow |
| **Awwwards SOTD (várias)** | Horizontal scroll dentro de seção; transições entre seções com mask/clip-path; cursor magnetic; ambient gradients | Mask reveal Dor→Solução; cursor magnetic em CTAs desktop; ambient gradient roxo discreto |
| **Notion.com** | Story-driven hero showing product value em 3-5s; micro-animações em workflow illustrations; progressive disclosure de features | Hero com dashboard + CTA já comunicando valor em <5s; progressive disclosure via sticky stack |
| **Basement Studio scrollytelling lib** | Pinned sections + scroll-linked hooks + progressive reveals + parallax layers + sequential narrative | Vocabulário técnico já mapeado pro stack Framer Motion (não precisa adotar a lib em si) |

---

## Sources

### Padrões de Landing Premium 2026
- [10 SaaS Landing Page Trends for 2026 — SaaSFrame](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples) (HIGH confidence)
- [What Makes a Great SaaS Landing Page in 2026 — Framiq](https://framiq.app/blog/best-saas-landing-pages-2026) (HIGH)
- [Best Practices for Designing B2B SaaS Landing Pages 2026 — GenesysGrowth](https://genesysgrowth.com/blog/designing-b2b-saas-landing-pages) (MEDIUM)
- [12 Best SaaS Landing Page Examples of 2026 — Swipe Pages](https://swipepages.com/blog/12-best-saas-landing-page-examples-of-2026/) (MEDIUM)
- [Top B2B SaaS Website Examples 2026 — VezaDigital](https://www.vezadigital.com/post/best-b2b-saas-websites-2026) (MEDIUM)

### Scroll Animation Patterns
- [Let's Make One of Those Fancy Scrolling Animations Used on Apple Product Pages — CSS-Tricks](https://css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/) (HIGH)
- [Why Most Scroll Animations Miss What Apple Gets Right — Brad Holmes](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/) (HIGH)
- [Scrollytelling in Web Design — Webflow Blog](https://webflow.com/blog/scrollytelling-guide) (HIGH)
- [Scrolling Designs: 8 Patterns and When to Use Each 2026 — Lovable](https://lovable.dev/guides/scrolling-designs-patterns-when-to-use) (MEDIUM)
- [4 Types of Website Scrolling Patterns Every Designer Should Know 2026 — UXPin](https://www.uxpin.com/studio/blog/4-types-creative-website-scrolling-patterns/) (MEDIUM)
- [Basement Studio Scrollytelling (React + GSAP)](https://github.com/basementstudio/scrollytelling) (HIGH — referência técnica)

### Framer Motion + Lenis
- [Smooth Scroll in Seconds: Official Lenis for Framer — Framer Community](https://www.framer.community/c/resources/smooth-scroll-in-seconds-meet-the-official-lenis-for-framer) (HIGH)
- [Getting Started with Framer Motion & Lenis — michantebi](https://michantebi.com/vibelog/week1) (MEDIUM)
- [React Scroll Animation — Motion.dev (Framer Motion docs)](https://motion.dev/docs/react-scroll-animations) (HIGH)
- [Framer Motion Scroll Animations Guide — JB Desishub](https://jb.desishub.com/blog/framer-motion) (MEDIUM)

### Bento Grid Patterns
- [Designing Bento Grids That Actually Work: 2026 — SaaSFrame](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide) (MEDIUM)
- [Bento Grid Design Guide 2026 — Landdding](https://landdding.com/blog/blog-bento-grid-design-guide) (MEDIUM)

### Acessibilidade
- [prefers-reduced-motion CSS — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) (HIGH)
- [Design Accessible Animation and Movement — Pope Tech](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) (HIGH)
- [WCAG C39: Using prefers-reduced-motion — W3C](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) (HIGH)

### Vertical Clínicas / Meta Ads / WhatsApp
- [Facebook Ads for Aesthetic Clinics — ClinicGrower](https://clinicgrower.co.uk/blog/facebook-ads-for-aesthetic-clinics-the-complete-conversion-strategy/) (MEDIUM)
- [WhatsApp for Business: The Performance Marketer's Guide — Bir.ch](https://bir.ch/blog/whatsapp-for-business) (MEDIUM)
- [Click to WhatsApp Ads — Infobip](https://www.infobip.com/blog/click-to-whatsapp-ads) (MEDIUM)
- [What Makes a High-Converting Landing Page for Med Spa Paid Ads — Wellstreet Media](https://wellstreetmedia.com/2025/05/what-makes-a-high-converting-landing-page-for-med-spa-paid-ads/) (MEDIUM)

### Mobile / Above-the-Fold / CTA
- [Best CTA Placement Strategies for 2026 — LandingPageFlow](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages) (MEDIUM)
- [Above the Fold Landing Page Design — Apexure](https://www.apexure.com/blog/above-the-fold-landing-page-design) (MEDIUM)
- [Mobile Landing Pages: Visual Hierarchy for Conversion — Influencers Time](https://www.influencers-time.com/mobile-landing-pages-master-visual-hierarchy-for-conversion/) (LOW-MED)

### Credibilidade sem Testemunhos
- [Power of Social Proof in SaaS Sales: Beyond Testimonials — Medium / Yury Larichev](https://medium.com/@yurylarichev/the-power-of-social-proof-in-saas-sales-beyond-testimonials-c2fb92a4876e) (MEDIUM)
- [12 Effective Formats of Social Proof for B2B SaaS — Thunderclap](https://www.thethunderclap.com/blog/types-of-social-proof-for-b2b-saas) (MEDIUM)

### Inspiração Direta
- [Linear.app](https://linear.app/) (HIGH — referência primária)
- [Awwwards Landing Page Scrolling Animations](https://www.awwwards.com/inspiration/landing-page-scrolling-animations-mathical) (HIGH — curadoria)
- [Awwwards Scroll Triggered Transition in Single Page Site](https://www.awwwards.com/inspiration/scroll-triggered-transition-in-single-page-site) (HIGH)

---

*Feature research for: Likro Landing Page — premium scroll-cinematic B2B SaaS vertical clínicas BR*
*Researched: 2026-05-15*
