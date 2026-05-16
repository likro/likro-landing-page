# Likro — Landing Page (Clínicas e Estéticas)

## What This Is

Landing page institucional e de conversão da Likro — SaaS B2B de CRM, atendimento multicanal e automação com IA. Esta v1 é uma página única, longa e cinematográfica, verticalizada 100% para clínicas e estéticas, com CTA primário para iniciar conversa no WhatsApp e um formulário consultivo discreto no final para captura secundária.

A landing precisa transmitir, em segundos, que a Likro é uma plataforma de operação comercial moderna e premium, claramente já em uso real — não um CRM pesado tradicional, não um chatbot genérico.

## Core Value

Uma clínica entra na landing e sente em segundos: *"isso foi feito exatamente pra minha operação — e essa empresa é absurda"*. Tudo no site (copy, animações, hierarquia visual) serve essa única sensação. Se isso falha, nada mais importa.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Página única scroll-cinematográfica, performance alta e SEO sólido (Next.js + Tailwind + Framer Motion + Lenis)
- [ ] Narrativa em 5 atos: Dor → Solução → Produto → Prova → CTA
- [ ] Hero de impacto verticalizado para clínicas (dor instantaneamente reconhecível + CTA WhatsApp)
- [ ] Seção de dor visualizando o cenário real da clínica desorganizada (leads no Instagram, WhatsApp espalhado, follow-up perdido, agendamentos caindo)
- [ ] Seção de solução com transição cinematográfica entre dor e produto (dashboard expandindo / mockup vindo do fundo com blur)
- [ ] Seção de produto com features reais em camadas reveladas pelo scroll (Atendimentos, CRM, Agentes IA, Relatórios), usando prints reais do app
- [ ] Seção "como funciona" — jornada de um lead do Instagram entrando no funil (storytelling visual)
- [ ] Seção de prova elegante: credibilidade pela qualidade do produto + menção leve a operação real (Dolce Home como referência viva), sem números ou depoimentos fabricados
- [ ] Seção final de conversão: CTA WhatsApp em destaque + formulário consultivo premium e discreto (alternativa "prefere que a gente te procure?")
- [ ] CTAs de WhatsApp persistentes em vários pontos do scroll (não só no hero/fim)
- [ ] Direção visual híbrida escuro → claro → escuro entre seções, com roxo Likro (#7C3AED) usado como destaque pontual (CTAs, glows, detalhes), nunca como fundo gigante
- [ ] Tipografia Inter, no máximo 3 pesos, hierarquia tipográfica forte com headlines gigantes em momentos-chave do scroll
- [ ] Experiência cinematográfica adaptativa por device:
  - Mobile (prioridade de tráfego — Instagram/Meta Ads): impacto rápido, animações simplificadas mas fluidas, leitura confortável
  - Desktop: storytelling visual completo com profundidade, sticky sections, parallax, mockups crescendo
- [ ] Header minimalista (logo Likro + CTA WhatsApp), sem menu carregado
- [ ] Footer enxuto (contato, redes, links legais mínimos)
- [ ] Tracking profissional desde v1: Meta Pixel + Google Analytics 4 + Microsoft Clarity
- [ ] Eventos rastreados: clique em qualquer CTA, clique em WhatsApp, submissão de formulário, scroll-depth por seção, tempo de retenção
- [ ] SEO técnico: metadata Open Graph, sitemap, robots, favicon, JSON-LD para Organization
- [ ] Performance: Lighthouse ≥ 90 em todas as categorias no desktop, ≥ 85 mobile; LCP < 2.5s; CLS < 0.1
- [ ] Acessibilidade básica (WCAG AA): contraste, navegação por teclado, alt text em imagens, prefers-reduced-motion respeitado nas animações
- [ ] Arquitetura de animações modular: cada seção é um componente isolado, fácil de trocar/reorganizar; preparado para introduzir GSAP/ScrollTrigger em seções específicas no futuro sem refactor estrutural
- [ ] Deploy na Vercel já na v1 (URL .vercel.app); domínio próprio é configuração de DNS posterior

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Páginas verticais para outros segmentos (varejo, e-commerce, serviços) — v1 é 100% clínicas; outras verticais entram em milestones futuros
- Página de preços dedicada (`/precos`) — preço é negociado em conversa pelo WhatsApp; expor tabela na v1 não serve à estratégia comercial atual
- Blog / central de conteúdo — não é prioridade; entra quando houver estratégia de SEO de conteúdo
- Página de produto / docs / changelog — fica no app (`app.likro.com.br`), não no marketing
- Multi-idioma (i18n) — landing é PT-BR; nicho é Brasil
- Login / área de cliente — não é função desta landing; usuário ativo vai direto pra `app.likro.com.br`
- Cookie banner de LGPD na v1 — entra junto com revisão jurídica antes de tráfego pago em escala (próximas milestones), não bloqueia o lançamento técnico
- Métricas ou depoimentos fabricados como social proof — risco reputacional; credibilidade vem do produto e da operação real
- Animações exageradas, infantis, com excesso de movimento ou poluição visual — fere o posicionamento premium
- Uso de roxo como fundo de página inteira ou seções gigantes — violação direta do brand book (roxo é destaque, não pano de fundo)
- GSAP/ScrollTrigger na v1 — Framer Motion + Lenis cobre o necessário; arquitetura fica preparada, mas adicionar GSAP agora é overhead (licença comercial, curva extra) sem retorno proporcional
- CMS (Sanity, Contentful, etc.) — copy é estática em código por enquanto; CMS entra se/quando volume de iteração justificar
- Sistema de A/B testing built-in — Vercel/Clarity bastam pra primeiros aprendizados
- Integração direta com CRM da Likro recebendo leads do form — v1 entrega via webhook simples (email/Slack); integração nativa entra depois

## Context

**Empresa.** Likro é SaaS B2B de CRM + atendimento multicanal + automação com IA, com produto ativo e cliente pagante (Dolce Home — varejo). Co-fundada por Lenny Wajcberg (comercial/marketing) e Gabriel Lask (técnico/produto). Plataforma roda em `app.likro.com.br`.

**Posicionamento da marca.** "Menos CRM pesado tradicional, mais plataforma inteligente de operação comercial." Marca deve ser percebida como moderna, confiável, inteligente e prática (resolve problema real, não só feature).

**Nicho de aquisição inicial.** Clínicas e estéticas, médias empresas com 5-20 atendentes. Estratégia de mídia atual: Meta Ads (Instagram + Facebook) com objetivo Click-to-WhatsApp ou Click-to-DM. A landing é a peça central do funil — recebe tráfego de Meta Ads, Instagram orgânico, WhatsApp, outbound, indicações e networking.

**Dores específicas da clínica (centrais para a narrativa).**
- Leads chegam pelo Instagram e não viram agendamento
- Demora no primeiro atendimento
- Follow-up inconsistente — leads esquecidos
- Equipe desorganizada, sem visibilidade do que cada um está fazendo
- WhatsApp sem controle (vários celulares, sem histórico, sem métrica)
- Atendimento espalhado em múltiplos canais sem centralização

**Capacidades reais do produto (para a seção Produto).**
- Atendimentos: caixa de entrada multicanal, distribuição automática por equipe, transbordo, classificação por objetivo atingido/perdido com valor R$, etiquetas
- CRM: contatos com importação/exportação, painéis Kanban configuráveis por equipe (Contato Inicial → Orçamento → Agendamento → Compra), tarefas pessoais
- Apps: campanhas de disparo, chatbots (atendimento e automação), Agentes Inteligentes com perfil/comportamento/conhecimento/habilidades (transferir, etiquetar, criar card no CRM, API), sequências, modelos de mensagem
- Relatórios: dashboard de capacidade, tempo de espera, duração, distribuição por canal, etiquetas, heatmap de volume por hora, qualidade por usuário, classificação por resultado, rastreio de campanhas Meta
- Ajustes: usuários e perfis, equipes/departamentos, integrações

**Materiais de marca disponíveis.**
- Logo SVG e PNG (`/c/Users/lenny/Desktop/Likro/logos_likro/`)
- ~50 screenshots reais do produto (`/c/Users/lenny/Desktop/Likro/prints_funcionalidades/`)
- Brand Book PDF
- Documento Interno Master com posicionamento, paleta, regras tipográficas
- Apresentação comercial, briefings de vendas e específico de clínicas

**Brand book — regras visuais críticas.**
- Roxo oficial `#7C3AED` (hover `#6D28D9`); usar como destaque (CTA, links, ícones ativos, badges), nunca como fundo de página inteiro ou seção gigante
- Fonte principal Inter (Google Fonts), alternativa Roboto, máximo 3 pesos por peça
- Bordas levemente arredondadas (12px cards, 10px botões)
- Cards: fundo branco, borda sutil `#E5E7EB` ou sombra mínima
- Imagens: mockups e prints reais sempre limpos com fundo claro; ilustrações abstratas tech (formas, linhas, ondas) com roxo sutil. Evitar foto genérica de banco, cartoon, gradiente exagerado.

**Voz da marca.** Direta, moderna, profissional mas acessível, orientada a resultado, consultiva. Palavras-chave: automação, CRM, IA, atendimento, leads, centralização, multicanal, conversão, qualificação, dashboard, produtividade, escala, funil, follow-up, organização, performance. Não é só chatbot, não é só CRM, não é tom enterprise.

## Constraints

- **Tech stack**: Next.js + Tailwind + Framer Motion + Lenis — escolhido pelo cliente. Performance, SEO, animações scroll-based premium, deploy Vercel. Arquitetura precisa permitir introdução de GSAP em seções específicas no futuro sem refactor estrutural.
- **Visual identity**: brand book Likro (roxo `#7C3AED` apenas como destaque, fonte Inter, bordas suaves, ilustrações abstratas tech) — não negociável.
- **Tom**: copy precisa parecer humana, sofisticada, premium — explicitamente *sem* cara de IA, sem buzzwords SaaS, sem clichês de marketing.
- **Conversão**: CTA primário em todos os pontos da página é "Falar no WhatsApp"; formulário consultivo discreto é alternativa, não substituto.
- **Credibilidade**: zero números inventados, zero depoimentos fabricados, zero placeholders falsos de prova social. Prova vem da qualidade visual e da operação real (Dolce Home pode ser mencionado com elegância).
- **Performance**: o uso intenso de animações scroll-based não pode comprometer Lighthouse, LCP, ou fluidez no mobile. Animações respeitam `prefers-reduced-motion`.
- **Tracking**: Meta Pixel + GA4 + Microsoft Clarity são obrigatórios na v1 — sem isso, otimização de campanha é cega.
- **Mobile primeiro de fato**: 80%+ do tráfego virá de Instagram/Meta Ads no celular; mobile precisa receber tratamento premium real, não versão simplificada de obrigação.
- **Escopo travado**: v1 é uma página só. Resistir a inflar com /precos, blog, ou variantes verticais antes de subir.
- **Deploy**: Vercel agora, domínio depois — não bloquear publicação na v1 esperando DNS.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decisão | Racional | Outcome |
|---------|----------|---------|
| Stack Next.js + Tailwind + Framer Motion (Motion v12) + Lenis | Combinação madura pra landing cinematográfica com SEO/SSR e deploy Vercel. Cobre o necessário sem adicionar uma segunda biblioteca de animação na v1. | — Pending |
| Arquitetura preparada para GSAP futuro | Framer Motion cobre o necessário hoje, mas seções específicas (scroll storytelling complexo, pin-and-scrub) podem precisar de GSAP/ScrollTrigger depois. Componentes de animação isolados permitem swap sem refactor. | — Pending |
| Foco vertical 100% clínicas/estéticas na v1 | Toda a cadeia de aquisição atual aponta pra esse nicho. Diluir mensagem em "B2B genérico" mataria o efeito "feito pra minha operação". Outras verticais viram páginas dedicadas em milestones futuros. | — Pending |
| WhatsApp como CTA primário + form consultivo secundário | Estratégia comercial atual é conversa rápida no WhatsApp; o form atende quem ainda não quer falar mas é refinamento, não default. Fricção mínima como princípio. | — Pending |
| Narrativa Dor → Solução → Produto → Prova → CTA | Clínica precisa reconhecer a si mesma antes de comprar a solução. Abrir com produto (Apple-style) sem ancorar na dor diluiria o impacto vertical. | — Pending |
| Direção visual híbrida escuro → claro → escuro | Cinematográfico sem violar brand book (roxo não vira fundo gigante); contraste entre seções dá ritmo; mockups brilham em hero/fechamento escuros e ficam legíveis em seções claras de produto. | — Pending |
| Sem social proof fabricado | Risco reputacional alto e claims falsos contradizem o posicionamento "real, em uso". Credibilidade vem do refinamento + operação ativa mencionada com elegância. | — Pending |
| Meta Pixel + GA4 + Microsoft Clarity desde a v1 | Tráfego pago e orgânico desde dia 1; sem instrumentação completa, qualquer aprendizado é anedótico. Clarity especialmente útil pra ver onde o storytelling perde atenção. | — Pending |
| Mobile-first com paridade premium no desktop | 80%+ tráfego mobile (Instagram/Meta), mas decisor (dono da clínica) pode ver no desktop. Tratar mobile como cidadão de segunda classe quebraria a primeira impressão. | — Pending |
| Sem GSAP, sem CMS, sem A/B testing nativo na v1 | GSAP é gratuito desde abr/2024 (Webflow) — o trade-off real **não é mais licença/custo**, e sim complexidade/curva de aprendizado e manutenção (segunda lib de animação, modelo mental de timeline imperativa sobreposto a Motion). CMS e A/B testing adicionam infra/dados sem retorno antes da landing existir. Adicionar quando justificado. | — Pending |
| Copy em português, escrita por Claude com revisão humana | Voz da marca é exigente (humana, sofisticada, premium, sem cara de IA); rascunhos iniciais aceleram, mas revisão final do Lenny é o filtro de marca. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-16 after Phase 2 (Motion Primitives) completion — 5 primitivas (RevealOnView, ParallaxLayer, ScrollScene, TextSplit, StickyStage) com API @frozen no barrel `src/components/motion`. Risco Crítico #3 (smooth-scroll + sticky iOS) mitigado e validado em iPhone 15 real. 4 itens de cobertura real-device deferidos (Android, macOS Safari, Firefox/Edge, prefers-reduced-motion real) — rastreados em 02-HUMAN-UAT.md com triggers explícitos.*
