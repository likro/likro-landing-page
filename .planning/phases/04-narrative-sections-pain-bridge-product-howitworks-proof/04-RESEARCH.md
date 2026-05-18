# Phase 4: Narrative Sections (Pain → Bridge → Product → HowItWorks → Proof) — Research

**Researched:** 2026-05-18
**Domain:** Editorial premium section composition + section-level animation budget + multi-section visual coherence (Next.js 15.5 / React 19 / Tailwind v4 / CSS-only motion stack)
**Confidence:** HIGH (architecture + invariants — grounded em código que já shippou) / MEDIUM (referência estética Stripe/Linear/Attio — leitura interpretativa de padrões observados em training data + screenshots públicos; não há fonte primária citável por seção)

---

## Summary

Phase 4 entrega 5 seções abaixo do Hero (Pain → Bridge → Product → HowItWorks → Proof) com uma única responsabilidade arquitetural: **manter a percepção de "uma empresa, um produto" enquanto o backdrop alterna dark/light cinco vezes**. O risco real **não é design** — é fragmentação. Cada seção é uma oportunidade de regredir: uma sombra diferente, uma escala tipográfica nova, uma animação que destoa, um mockup que parece de outro app. A disciplina da Phase 3 (cards CSS isolados, keyframes prefixados, copy em `content/*.ts`, grep tests por seção) é o template; Phase 4 escala o template por 5.

A decisão crítica — **motion lib vs CSS-only** — está resolvida pelo CONTEXT.md (D-04: CSS-only IntersectionObserver é o default; motion lib só com argumento real). A análise abaixo (§Animation strategy) **confirma** essa direção quantitativamente: motion local em 5 seções devolve ~30-46KB gzipped ao bundle root via tree-shaking imperfeito, regredindo a otimização TBT da Phase 3 sem entregar valor visual que CSS+IO não cubra. Não há sticky-scrub ou pin-and-scrub no escopo — `useScroll`/`useTransform` do Motion são overkill. **Recomendação: zero motion lib em Phase 4. Tudo CSS + um único hook `useInView` baseado em IntersectionObserver nativo (~0.5KB inline).**

A decisão crítica **estética** — como evitar "clone de Stripe" mantendo refinamento Stripe-tier — está resolvida pela vertical: Likro é clínica brasileira. Stripe é infra de pagamentos americana. A linguagem operacional muda completamente: "DM no Instagram", "Dra. Camila", "retorno do paciente", "harmonização facial". Stripe/Linear/Attio são professores de **restraint, hierarchy, pacing, mockup composition** — não de copy nem de vertical positioning. A Likro herda o silêncio visual, não o lexicon.

**Recomendação primária:** Phase 4 deve ser dividida em **6 plans pequenos sequenciais** — Plan 0 (system tokens + utilities cross-section: `useInView` hook, section keyframes em `globals.css`, primitivas `<DarkSection>` e `<LightSection>` se houver repetição estrutural), Plan 1-5 (uma seção por plan, cada uma com copy PR review próprio antes da próxima começar — D-17 escalado). Plan 0 é o único que toca tokens; Plans 1-5 só consomem.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Princípio guia transversal:**
- **D-01** — Tom geral é "infraestrutura operacional premium", não "ferramenta SaaS". Linguagem reforça posicionamento "sistema operacional da clínica" do Hero.
- **D-02** — Cada seção mantém identidade visual coesa. Mudança de atmosfera entre seções é permitida; mudança de identidade não.
- **D-03** — Convenção `*_COPY_VARIANTS = { v1, v2, v3 }` + `export const X_COPY = X_COPY_VARIANTS.vN` reutilizada por seção. PRs de copy review seção-por-seção via `docs/copy-review.md`.
- **D-04** — Animações: discrição do Claude. **Preferir CSS-only IntersectionObserver inline; só re-introduzir motion lib local se entregar valor cinematográfico que CSS não consegue.** Bundle root continua sem motion (regressão de TBT bloqueada).

**Ritmo visual:**
- **D-05** — Sequência: Hero DARK ✓, Pain DARK, Bridge LIGHT, Product LIGHT (off-white, mais limpa), HowItWorks LIGHT (neutral), Proof DARK.
- **D-06** — Arco emocional: peso → fricção → alívio → clareza → autoridade.
- **D-07** — Transições entre seções são mudanças de atmosfera, não de identidade — mesmo brand, mesmo accent, mesma família tipográfica, mesma direção. Sem cortes bruscos de design system.
- **D-08** — Surface tokens reutilizam os já definidos em `globals.css`. Não criar novos tokens sem necessidade.

**Pain — direção:**
- **D-09** — Ângulo: fragmentação operacional sistêmica + 1 consequência humana concreta como reforço.
- **D-10** — Tom: editorial calmo, B2B sério, premium. Sem agressão "você está falhando".
- **D-11** — Estrutura sugerida: enumeração de ferramentas separadas (WhatsApp / Instagram / agenda / planilha) + linha-síntese mostrando consequência humana.
- **D-12** — Headline termina em afirmação, não em pergunta.

**Bridge — direção:**
- **D-13** — Statement editorial silencioso. 1-2 linhas centradas. Estilo Linear/Stripe editorial.
- **D-14** — Anti-IA strict (vide COPY-02 banned list).
- **D-15** — Primeira seção LIGHT. Transição abrupta proposital. Muito espaço em branco, tipografia centrada, sem cards/mockups.

**Product — direção:**
- **D-16** — 1 feature hero full-width + 3 features secundárias compactas em row. NÃO grid 2x2. NÃO scroll sticky Apple-style.
- **D-17** — Feature hero: "Atendimento multicanal". Mockup operacional vivo, "momento de valor" estilo HeroCardStack ampliado, não UI inteira.
- **D-18** — 3 secundárias: Distribuição automática / Follow-up e retorno / Agenda operacional.
- **D-19** — Capacidades operacionais, não checklist de funcionalidades. Sem "✓ CRM ✓ Automação".
- **D-20** — Seção mais limpa visualmente da landing. Off-white, muito espaço, tipografia editorial, mockup refinado, poucas cores.

**HowItWorks — direção:**
- **D-21** — 4 passos timeline vertical. Cada passo: número grande à esquerda + headline curta + descrição 1-2 linhas + mini-mockup CSS à direita. Linha conectora vertical sutil.
- **D-22** — Os 4 passos: Lead chega (Instagram/Facebook/WhatsApp captação) → Operação distribui (atribuição automática) → Atendente conversa (centralizado, contexto, tempo real) → Paciente agendado (com retorno e follow-up automático).
- **D-23** — Tom explicativo, NÃO competir visualmente com hero/product. Surface light neutral. Mini-mockups discretos.

**Proof — direção:**
- **D-24** — Categorias verticais minimal + dark editorial.
- **D-25** — Headline candidatos (Claude escolhe variante via D-17): "Em operação em clínicas que dependem de atendimento de alto volume." / "Infraestrutura operacional para clínicas de estética e dermatologia." / outras geradas pra review.
- **D-26** — Categorias em row: Estética · Dermatologia · Harmonização Facial · Odontologia · Bem-estar. Sem ícones forçados (texto separado por `·` OU lucide sutis).
- **D-27** — **PROIBIDO**: logos de cliente, números fabricados, testimonials genéricos, badges/estrelas/"trusted by", **menção a Dolce Home** (autorização explicitamente negada 2026-05-18).
- **D-28** — Tom institucional silencioso. "Essa infraestrutura já está sendo usada" > "olha quantos clientes temos". O silêncio visual vale mais que exagero.

### Claude's Discretion

- Tipografia fina (sizes exatos, line-heights, letter-spacing) seguindo padrão Phase 3.
- Spacing vertical entre seções (provavelmente `py-24 lg:py-32`, ajustar à arte).
- Container widths por seção (Product pode ser `max-w-6xl`; Bridge `max-w-3xl` centrado).
- Animações: CSS-only IntersectionObserver inline. Motion lib só com argumento real.
- Acentos roxos `#7C3AED`: apenas em micro-elementos (números HowItWorks step, dot indicators, ícones ativos) — nunca protagonista.
- Micro-card animations (live pulse, status icons) — replicar pattern HeroCardStack onde aplicável.
- CTA WhatsApp dentro das 5 seções: **default zero** (CTA final é Phase 5). Caso a caso se Phase 4 precisar (ex: depois do Pain). Recomendação desta research abaixo: **manter zero**.

### Deferred Ideas (OUT OF SCOPE)

- CTAs intermediários WhatsApp dentro das seções narrativas — Phase 5 (CTA-05 cobre 4+ CTAs; A/B v1.1 reavalia).
- Quote anônimo de cliente real no Proof — v1.1 quando houver autorização.
- Logo strip real de clientes — depende de autorizações futuras.
- Stats operacionais reais — quando produto tiver dados defensáveis.
- Scroll-scrubbed animations sofisticadas (motion + GSAP) — out of scope v1.
- Dark mode toggle / light mode total — v2+.
- Variantes regionais de copy — out of scope v1.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NARR-01 | Pain visualiza cenário caótico atual (DMs sem resposta, WhatsApp espalhado, follow-up perdido, sem visibilidade). Reconhecível pelo dono da clínica. | §Pain construction + §Mockup composition (Pain mockup = "constelação de chats fragmentados" CSS-only, 4 mini-pseudo-cards diagonais imitando WhatsApp/Instagram/agenda; lê em 1s "minha operação"). |
| NARR-02 | Bridge faz transição cinematográfica entre dor e produto **usando `<ScrollScene>`** — mockup do dashboard surge com blur e expande. | **CONFLITO COM CONTEXT.md D-04 + D-15.** REQUIREMENTS.md fala em `<ScrollScene>`; CONTEXT.md D-15 fala em "statement editorial silencioso, sem cards/mockups". CONTEXT.md superseda — vide §"Reconciliando NARR-02 com CONTEXT.md D-15". Recomendação: Bridge = statement puro (D-15); a transição cinematográfica é a quebra dark→light em si, não uma animação dentro da Bridge. |
| NARR-03 | Product apresenta quatro pilares (Atendimentos, CRM, Agentes IA, Relatórios) em sticky stack revelado pelo scroll. | **CONFLITO COM CONTEXT.md D-16.** REQUIREMENTS.md fala em "4 pilares sticky stack"; CONTEXT.md D-16 trava "1 hero feature + 3 secundárias em row, NÃO grid, NÃO sticky Apple-style". CONTEXT.md superseda — vide §"Reconciliando NARR-03 com CONTEXT.md D-16". Pilares são re-interpretados como "1 capacidade hero (Atendimento multicanal — engloba os 4 conceitos) + 3 sub-capacidades operacionais". |
| NARR-04 | Mobile choreography simplificada via `useDeviceTier()` sem duplicar componentes. | §Mobile choreography (sem motion lib, mobile diferencia via Tailwind breakpoints + IO threshold ajustado por matchMedia inline; `useDeviceTier()` atual depende de `motion/react` que está fora do bundle root agora — usar matchMedia direto ou um novo hook leve). |
| NARR-05 | Proof comunica credibilidade pelo refinamento + menção elegante à operação real (sem Dolce Home, autorização denied). Zero números fabricados, zero depoimentos placeholder. | §Proof construction. |
| NARR-06 | Cada seção usa apenas primitivas de `components/motion/` — nenhum `motion.div` direto. | §Animation strategy. **Atualização crítica:** Phase 3 removeu motion do bundle root; primitivas `components/motion/*` agora carregariam motion lib se importadas. Recomendação: zero import de `components/motion/*` em Phase 4 seções. Substituir invariant grep por "zero motion.* + zero import de @/components/motion em seções narrativas". |
| NARR-07 | Versão mobile com motion choreography simplificada via `useDeviceTier()`, sem duplicar componentes. | §Mobile choreography. |
| NARR-08 | Product inclui demo do Agente IA atendendo lead 24/7 (mockup animado da conversa, não vídeo). | **CONFLITO COM CONTEXT.md D-17.** REQUIREMENTS.md fala em "demo Agente IA"; CONTEXT.md D-17 trava feature hero como "Atendimento multicanal". Recomendação: o mockup hero **engloba** o conceito de Agente IA — pode mostrar uma conversa onde uma mensagem é "respondida automaticamente · sugestão de IA aceita" sem virar uma demo dedicada. NARR-08 satisfeito como parte do mockup hero, não como seção própria. |
| COPY-02 | Anti-IA grep test por seção. | §Test patterns. |
| COPY-03 | Teste de especificidade: trocar "clínica" por "empresa" deve quebrar o significado. | §Copy review cadence. |
| COPY-05 | Glossário de termos verticais em `content/glossary.ts`. Novos termos exigem aprovação. | §Copy review cadence (Plan 0 cria `content/glossary.ts` se ainda não existir; cada seção referencia). |
| COPY-06 | Zero claims numéricos sem fonte / depoimentos fabricados. | Já garantido por grep test global + zero-numbers gate no Proof. |

---

## Project Constraints (from CLAUDE.md)

Global (`~/.claude/CLAUDE.md`):
- Respostas pt-BR; commits podem ser inglês.
- "commita" = commit + push direto.
- Pipeline pré-teste: code-review skill + Playwright MCP. Phase 4 é frontend pesado — Playwright vai cobrir Pain/Bridge/Product/HowItWorks/Proof.
- Sem emojis em arquivos.

Projeto (`./CLAUDE.md`):
- Stack confirmado: Next.js 15.5.18 / React 19 / TypeScript 5.6 / Tailwind 4.3 / Motion 12.38 (NÃO no bundle root agora) / Lenis 1.3.23 / lucide-react 0.460. **[VERIFIED: package.json]**
- Brand: roxo `#7C3AED` accent apenas; Inter 3 pesos (400/500/700); ilustrações abstratas tech; voz humana sem cara de IA.
- **State invariants:** roxo nunca fundo grande; WhatsApp sempre `wa.me/`; único `<Image priority>` é o mockup do hero (que **não existe** mais — Phase 3 redesign B virou cards CSS, então não há `<Image priority>` na landing inteira atualmente; LCP é H1 SSR); copy nunca hard-coded em JSX; `motion.div` direto em sections é proibido. **[VERIFIED: tests/sections/hero-invariants.test.ts]**
- GSD Workflow Enforcement: edits via GSD command.
- `requesting-code-review` skill antes de commits.
- Playwright MCP após qualquer mudança de UI.

---

## Cross-Section Design System (atmospheres, surfaces, transitions)

### O princípio central — "uma empresa, um produto, 5 atmosferas"

A coerência cross-section vem de 5 invariantes que **NÃO mudam entre seções**, mesmo com surface dark/light alternando:

| Invariante | Valor | Por quê é coerência |
|------------|-------|---------------------|
| Tipografia | Inter, 3 pesos (400/500/700), tracking tight (`-0.01em` a `-0.025em`), font-feature `cv02 cv11 ss01 ss03` (já em `globals.css`) | Mesma voz tipográfica em 6 atmosferas = identidade |
| Radius | `rounded-[12px]` cards / `rounded-[10px]` buttons / `rounded-[14px]` micro-cards (HeroCard usa 14px) | Brand book; consistência tátil |
| Accent | `#7C3AED` apenas em micro-elementos (dot indicator, número de step, ícone ativo, dot pulse "ao vivo") — nunca fundo, nunca >5% da área | Discipline da Phase 3 escalada |
| Container | `max-w-7xl` default (Container existente); seções específicas podem reduzir (Bridge `max-w-3xl`, Product `max-w-6xl` se quiser ar) — nunca aumentar | Mesma estrutura espacial |
| Stagger reveal | 80-160ms entre elementos (mesmo que Phase 3 HeroCardStack via `animation-delay`) | Mesma cadência de chegada |

Estas 5 são **não-negociáveis** entre seções — replicam exatamente os valores já calibrados na Phase 3. Qualquer "ah deixa eu testar um radius diferente nessa seção" é regressão.

### Surface palette — quais tokens em qual seção

Reuso direto dos tokens existentes em `globals.css` (Phase 1 D-13/14 + Phase 3 D-08). **Phase 4 não adiciona tokens novos.**

| Seção | Surface principal | Surface card (overlay) | Texto primário | Texto secundário | Border |
|-------|-------------------|------------------------|----------------|------------------|--------|
| Pain (DARK) | `bg-surface-darker` (#0A0F1A) com gradient overlay mais "denso" que Hero | `bg-surface-card` (#FBFCFD) — mesmos cards Hero | `text-text-on-dark-primary` (#F5F7FA) | `text-text-on-dark-secondary` (#B6BDC9) | `border-border-on-dark-subtle` (rgba 6%) |
| Bridge (LIGHT) | `bg-surface-light` (#fafaf9) | — (sem cards) | `text-text-primary` (#0a0a0b) | `text-text-secondary` (#3f3f46) | — |
| Product (LIGHT off-white) | `bg-surface-light` ou `bg-surface-lighter` (#fff) — testar qual fica "mais limpa"; recomendação: `surface-light` (#fafaf9) com cards `surface-lighter` (#fff) pra contraste | `bg-surface-card-strong` (#fff) com `border-border-subtle` | `text-text-primary` | `text-text-secondary` | `border-border-subtle` (oklch 0.92) |
| HowItWorks (LIGHT neutral) | `bg-surface-lighter` (#fff) puro — diferenciação sutil do Product (Product é cinza muito leve com cards brancos; HowItWorks é branco puro com cards `surface-card` cinza muito leve) | `bg-surface-card` (#FBFCFD) | `text-text-primary` | `text-text-secondary` | `border-border-subtle` |
| Proof (DARK) | `bg-surface-darker` com decoração **MAIS contida** que Hero (sem haze drift; sem radial roxo no topo; só gradient + grid extra sutil) | — (sem cards) | `text-text-on-dark-primary` (#F5F7FA) | `text-text-on-dark-secondary` (#B6BDC9) | — |

**Pain vs Hero — diferenciação visual (mesma família, intensidade diferente):**
- Hero (Phase 3 redesign B): 6 camadas (azul-petróleo top, radial roxo top-center, radial azul-frio top-right, grid 64px com máscara radial, haze drift atrás do card central, vinheta inferior). Composição "respirada", protagonista é o card stack central.
- Pain: 4 camadas (azul-petróleo top, **gradient escuro mais profundo** — mais "weight" emocional, sem radial roxo no topo — Pain NÃO precisa de "warmth", precisa de tensão), grid 64px **menos opaco** (linhas mais sumidas — atmosfera de "fim de tarde antes do problema"), **vinheta nas 4 bordas** (não só inferior — sensação de "fechado", contido). Sem haze drift. Sem radial roxo. **Roxo na Pain só no texto-síntese final** (a linha-consequência "Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro." pode ter o verbo "espalhada" sublinhado/destacado em accent, ou nada — preferência: nada, deixar o roxo sumir totalmente da Pain).

**Proof vs Hero — diferenciação visual:**
- Proof não precisa de "vida" (haze drift, glow, pulse) — precisa de **autoridade**. Composição: gradient escuro vertical único + grid 64px ainda mais sumido (1% opacity) + zero radial + zero haze + zero vinheta inferior (porque Proof É o fim, vinheta dá sensação de continuação). Headline editorial centrada (não à esquerda como Hero), peso grande mas restrito a 2-3 linhas, sub muted contido, categorias em row.

### Transições entre seções — "atmosfera, não identidade"

A transição **não é uma animação**. É a justaposição. Quando o usuário scrollou da Pain (dark, denso) pra Bridge (light, espaço aberto) — o contraste em si é a transição. Tentar suavizar com um fade gradient na junção **mata o efeito**. Linear/Stripe fazem isso explicitamente: bordas duras entre seções, surfaces sem fade na transição, o cérebro do usuário lê "respiro" justamente porque o corte é seco.

**Recomendação técnica:**
- Cada seção é um `<section>` com `bg-{token}` direto, sem padding-top "compartilhado" com a anterior, sem gradient na borda.
- Vinheta inferior do Hero (atual) precisa **sair** se Pain vier logo abaixo — a vinheta resolve o final isolado da Phase 3 mas conflita com a chegada da Pain. Recomendação: **manter vinheta inferior do Hero** porque ela faz o Hero continuar parecendo Hero (não exposto ao Pain) e a chegada da Pain em `surface-darker` (igual à cor final da vinheta) torna a junção visualmente contínua sem precisar de animation — o Hero fade-to-dark "encontra" o Pain no mesmo dark.
- Pain → Bridge: corte seco. Sem gradient. Pain `bg-surface-darker` → Bridge `bg-surface-light`. Cérebro lê "respiro" pelo choque cromático puro. **Esta é a "transição cinematográfica" do NARR-02** — sem animação, só justaposição.
- Bridge → Product: ambos light. Diferença muito sutil (`surface-light` vs `surface-light` com cards `surface-lighter`). Recomendação: separar com 1 linha 1px `border-border-subtle` divider full-width OU mais espaço vertical (`py-32` Product) — deixar Product respirar mais que Bridge.
- Product → HowItWorks: ambos light, mais sutil ainda. `surface-light` (Product) → `surface-lighter` (HowItWorks). HowItWorks ganha `border-t border-border-subtle` divider editorial 1px.
- HowItWorks → Proof: light → dark, corte seco. Mesmo princípio Pain → Bridge invertido.

### O accent budget — quanto roxo cabe em cada seção

| Seção | Onde o roxo aparece | Onde NÃO aparece |
|-------|---------------------|-------------------|
| Pain | Possivelmente em zero. Recomendação: zero — a ausência de roxo na Pain é parte da tensão (a clínica não tem Likro ainda → não tem o accent). | Backgrounds, badges, ícones |
| Bridge | Zero. Bridge é statement editorial puro. | Tudo |
| Product | Hero feature: dot indicator "ao vivo" (verde) — não roxo. Roxo só em pull-quote sutil OU em badge "Em destaque" no hero feature OU zero. Secundárias: zero. **Recomendação: zero roxo em Product**. A limpeza visual é o ponto (D-20). | Cards, headlines, ícones grandes |
| HowItWorks | **Único lugar onde roxo brilha** — números dos 4 steps em accent (`text-accent-primary`), grandes (text-5xl/6xl). Linha conectora vertical entre steps em `border-accent-primary/20`. | Cards, headlines |
| Proof | Zero. Autoridade vem do silêncio. | Tudo |

Hero (Phase 3) já gasta o accent budget em: glow ambient (já presente no `surface-darker` background via `accent-glow` token), CTA primário (botão sólido roxo), dot pulse "ao vivo" nos cards, ícone routing card violet. Phase 4 deve **reduzir** o roxo, não escalar — protege o efeito que Hero já estabeleceu.

---

## Per-Section Construction Patterns

### Pain (DARK) — fragmentação operacional visualizada

**Layout:**
- `<section bg-surface-darker py-24 lg:py-32 relative isolate overflow-hidden>` com `<PainBackground>` (4 camadas, mais "denso" que Hero — ver tabela acima).
- `<Container>` interno, max-w-7xl (igual Hero).
- Composição vertical: headline curta no topo, sub abaixo, **constelação de pseudo-mockups CSS** centralizada (4 cards menores, espalhados, sem ordem aparente, baixa opacidade ou rotação aleatória — visualizam "fragmentação"), linha-síntese embaixo (frase forte sobre fundo).

**Headline + sub:**
- Headline: afirmação em 2 linhas (`Headline as="h2" size="section"` com `text-text-on-dark-primary` + tracking tight) — ex. variante candidata "A sua operação está espalhada em 4 apps que não falam entre si." (D-12 termina em ponto, afirmação).
- Sub: 1-2 linhas em `text-text-on-dark-secondary`, calibrando o problema na operação real (mensagens não respondidas, leads esquecidos, agenda em planilha separada).

**A "constelação de fragmentação" — mockup CSS-only:**

A imagem mental: **4 pseudo-cards pequenos**, cada um representando uma ferramenta diferente, espalhados em diagonal (não grid, não alinhamento — propositalmente desorganizados), em rotações distintas (~`-3deg`, `+2deg`, `-5deg`, `+4deg`), opacidades distintas (alguns mais "sumidos", alguns "ativos") — o cérebro lê em ~1s: "isto é a minha operação hoje, isto é caos sem violência visual".

Cada card é **menor que o HeroCard** (~140x90px desktop), com:
- Header: ícone lucide (Instagram / MessageCircle / Calendar / FileSpreadsheet) + nome da ferramenta em uppercase tracked
- Conteúdo: 1-2 linhas curtas representando estado (notificação não lida, conversa truncada, slot vazio, célula desatualizada)
- Cor: surface-card (#FBFCFD) — mesmos cards do Hero, mantém coerência

**Por que não usar "screenshot reais distorcidos":** brand book ban + foto-stock vibe + complexidade. CSS-only pseudo-cards comunicam "ferramenta separada" em uma camada de abstração mais elegante (Linear, Stripe e Attio fazem isso — não mostram screenshots reais de competidores; mostram representações abstratas).

**Linha-síntese (fecha a Pain):**
- Frase forte centralizada, depois da constelação, em `<p>` grande (`text-2xl lg:text-3xl`), `text-text-on-dark-primary`, `font-medium`, `max-w-3xl mx-auto`, com leading relaxed (`leading-[1.35]`).
- Tom: editorial calmo, não interrogativo. Ex. candidato: "Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro." (CONTEXT.md §Specifics).
- **Sem CTA WhatsApp na Pain.** D-29 default + recomendação desta research: a Pain não vende; deixa o usuário sentir antes do Bridge propor "tem outro jeito".

**Animação:**
- Headline + sub: estado final imediato (igual Hero — não animar entrada). Razão: scroll-triggered animation no protagonista textual da Pain compete com a chegada da Pain em si.
- Constelação dos 4 pseudo-cards: `useInView` (IntersectionObserver) dispara o `hero-card-rise` (mesma keyframe da Phase 3) com stagger 0/100/200/300ms quando 30% da seção entra no viewport. Once-only.
- Linha-síntese: `useInView` com threshold 60% dispara fade-in mais demorado (700ms) — chega depois dos cards, fechando a leitura.

**Confidence: HIGH** (composição derivada de pattern Hero existente + princípios Stripe/Linear de problem visualization). [ASSUMED] A1 — não há mockup real desta visualização ainda; é proposta.

### Bridge (LIGHT) — statement editorial silencioso

**Layout:**
- `<section bg-surface-light py-32 lg:py-40>` (mais respiro vertical que outras seções).
- `<Container className="max-w-3xl text-center mx-auto">` — narrow, centrado, **sem cards, sem mockups, sem ícones, sem CTAs**.

**Composição:**
- Um único bloco textual: 1-2 linhas centradas, peso semibold ou bold, tamanho `text-3xl sm:text-4xl lg:text-5xl` (igual ou ligeiramente menor que headline section).
- Cor: `text-text-primary` (#0a0a0b — escuro profundo no light surface). Tracking tight (`-0.02em`).
- Frase candidata (CONTEXT.md §Specifics): *"Existe um jeito de operar isso sem rodar 4 apps abertos. Sem perder lead. Sem mandar a equipe procurar onde está a conversa."* — Claude testa em 3 variantes; Lenny escolhe no PR de copy.
- **Pode ter um lead-in editorial mini-pill** acima da frase em uppercase tracking generoso (`text-xs font-medium uppercase tracking-[0.25em] text-text-secondary`): por exemplo "Outro jeito" ou nada — testar.

**O choque dark→light é a transição:**
- Pain termina em `bg-surface-darker`; Bridge começa em `bg-surface-light` — o cérebro lê "alívio" pela mudança cromática violenta.
- Nada de gradient na junção. Nada de fade. Corte seco.
- Esta seção tem que durar **pouco no scroll** — ~50svh máximo. Bridge é uma pausa, não uma parada. Recomendação: `py-32 lg:py-40` (espaço amplo vertical) mas conteúdo único e curto (1-2 linhas) — o resultado é que o usuário scrolla pela Bridge em 1.5s, mas tem espaço para a frase respirar.

**Animação:**
- Frase: estado final imediato. Sem reveal. Sem motion. A Bridge **não quer** animação — qualquer animação aqui transforma o statement em "frase com efeitinho" e mata o tom editorial.
- Único elemento que pode ter sutileza: o lead-in pill (se houver) com fade-in suave via CSS quando `useInView` dispara — opcional, default zero.

**Confidence: HIGH** (Linear/Stripe usam este pattern explicitamente em seções pivot — "There's a better way" — sempre centradas, sempre sem mockup, sempre estáticas).

**Reconciliando NARR-02 com CONTEXT.md D-15:**
- REQUIREMENTS.md NARR-02 fala "Bridge faz transição cinematográfica entre dor e produto **usando `<ScrollScene>`** — mockup do dashboard surge com blur/desfoque e expande conforme scroll (primeira `<ScrollScene>` em produção, template pras seguintes)".
- CONTEXT.md D-15 fala "Bridge é a primeira seção LIGHT da landing — transição abrupta proposital pra criar sensação de 'alívio' após Pain dark. Composição minimalista: muito espaço em branco, tipografia centrada, **sem cards/mockups**."
- **CONTEXT.md superseda.** D-15 é mais recente (2026-05-18) e está alinhado com a direção operacional/editorial decidida com o Lenny. A "transição cinematográfica" do NARR-02 está sendo entregue pela **justaposição dark→light** (que é cinematográfica em si), não por um mockup expandindo via ScrollScene.
- Adicionalmente, `<ScrollScene>` está no barrel `components/motion/*` que importa `motion/react` — usá-lo em Phase 4 reintroduz motion lib no bundle root, regredindo TBT da Phase 3. **Não é viável tecnicamente** sem alocar bundle budget que CONTEXT.md D-04 explicitamente proíbe.
- **Decisão de planner:** marcar NARR-02 como satisfeito pela combinação (Pain dark → Bridge light corte seco + Product light com mockup hero full-width sendo a "expansão"). Documentar em SUMMARY.md da Phase 4 que a interpretação de NARR-02 mudou da redação original.

### Product (LIGHT off-white) — 1 feature hero + 3 secundárias em row

**Layout vertical:**
1. `<section bg-surface-light py-24 lg:py-32 relative>` — wrapper.
2. `<Container className="max-w-7xl">` — mesmo do Hero (não reduzir aqui — Product precisa de presença).
3. Bloco header: small eyebrow (`text-xs uppercase tracking-[0.18em] text-text-secondary`) "Produto" ou "Capacidades" OU zero (recomendação: zero eyebrow — Product não precisa de label) → headline section (h2) → sub max-w-2xl.
4. Bloco feature hero (full-width dentro do Container) — ver abaixo.
5. Bloco 3 secundárias em row (grid 1 col mobile, 3 cols lg).
6. **Sem CTA no fim da Product** (D-29 default + recomendação desta research).

**Feature hero — "Atendimento multicanal":**

Composição: split horizontal **assimétrico** (texto à esquerda 40%, mockup à direita 60%) em desktop; stack vertical em mobile (texto em cima, mockup embaixo). Mesma proporção do split que o Hero original sugeriu (Phase 3 CONTEXT.md D-02), mas aqui é dentro de Product, com **light surface** ao invés de dark.

**Texto à esquerda (40%):**
- Eyebrow opcional: "Capacidade hero" ou nada (recomendação: nada).
- Headline mini (h3 ou h4 — não h2 — h2 já foi gasto no header da Product section): `text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight` "Atendimento multicanal" + uma descrição em sub `text-base lg:text-lg text-text-secondary leading-relaxed`.
- 3 bullet pontos operacionais (não checklist com `✓` — usar lucide-react `Check` muito sutil, neutro, não verde saturado): cada bullet 1 linha curta — ex. "Instagram, WhatsApp, Direct, web em uma caixa" / "Histórico contínuo por paciente" / "Equipe recebe com contexto da última conversa".
- **Zero CTA aqui.** Bullet points operacionais fecham; o leitor segue para as secundárias.

**Mockup à direita (60%) — "operação fluindo":**

Este é o componente que **define se Product parece software sério**. Lenny: *"A Product section provavelmente vai definir se isso parece software sério ou landing de startup"* (CONTEXT.md §Specifics).

**Direção:** uma cena de "operação acontecendo agora" — não um screenshot da UI inteira. Mostrar o **momento de valor**: lead chegando + sendo atribuído + atendente respondendo, **três coisas em um único frame**, mas com a clareza visual de que isso é uma operação real fluindo.

**Composição técnica (extensão direta do HeroCardStack — mesmo vocabulário visual, escala diferente):**

```
┌──────────────────────────────────────────────────────────┐
│  Caixa central larga (mockup de inbox simplificada)      │
│  • 3 linhas de conversa empilhadas, cada uma mostrando: │
│    avatar mini + nome paciente + canal (Instagram/WA)   │
│    + última msg truncada + timestamp "há Xm"             │
│  • Linha 1 destacada (cor accent muito sutil ou dot      │
│    pulsing verde) — "ao vivo, agora"                     │
│                                                          │
│  ┌─ Card overlay top-right ─┐  ┌─ Card overlay bot-L ─┐ │
│  │ "Atribuído: Dra. Camila"  │  │ "Resposta enviada"   │ │
│  │ chip de status            │  │ check verde sutil    │ │
│  └───────────────────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

- Caixa central: `bg-surface-card-strong` (#fff puro), border-radius 14px, border 1px `border-border-subtle`, shadow em camadas **idêntico ao HeroCard** (`shadow-[0_24px_60px_-20px_rgba(8,12,24,0.18),0_8px_24px_-12px_rgba(8,12,24,0.12)]` — atenção: aqui em light surface, então as sombras são MENOS escuras que no Hero dark; baixar opacity ~3-5x).
- 3 linhas de conversa: cada linha ~52px altura, separadas por `border-b border-neutral-100`, padding x-4 y-3, com avatar mini (lucide-react `User` em circle ou inicial em accent muito sutil), texto verticalmente alinhado, mono pequeno pro timestamp à direita.
- Dot pulse verde na linha "ao vivo" (mesma keyframe `hero-live-pulse` do `globals.css` — não criar nova).
- 2 cards overlay sobre o mockup central (canto superior direito + canto inferior esquerdo, leve rotação opcional ou alinhados certos — testar): cada um pequeno chip estilo HeroCard (`bg-surface-card` #FBFCFD, border-radius 12px, padding compacto, sombra ainda menor, mostrando: "Atribuído: Dra. Camila" com ícone `MoveRight` accent + "Resposta enviada" com `Check` verde sutil).
- **Rotação dos cards overlay:** muito sutil (~`+2deg` e `-2deg`) ou zero — testar empiricamente; recomendação: zero rotação aqui (Product é a seção mais limpa — D-20 — rotação de cards quebra a limpeza; rotação fica no Hero).
- **Float animation:** os cards overlay podem ter `hero-card-float-a` / `hero-card-float-c` (já existem) — sutilíssimo, dá sensação de "operação viva" sem competir.

**Por que este mockup é "operação alive" e não "screenshot estático":**
- Tem 3 níveis de profundidade (mockup central + 2 overlays) — produz sensação de camadas, de algo acontecendo em planos diferentes.
- Tem 1 elemento pulsante (dot live) — sinaliza "agora".
- Tem 1 chip de "atribuição" — sinaliza "decisão tomada automaticamente".
- Tem 1 chip de "resposta enviada" — sinaliza "ação completada".
- Em um único frame: chegada + decisão + resposta = "a operação acontece".

**Linear faz isso explicitamente** em sua hero (issue + comentário + status update em paralelo). É replicável dentro do vocabulário Likro.

**Confidence: MEDIUM-HIGH** (pattern baseado em observação de Linear + extensão direta do HeroCardStack existente — execução exata exige iteração visual).

**3 features secundárias em row:**

Cada uma é um **card baixo, equally weighted**, em `grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-24`.

Cada card:
- `bg-surface-card-strong` (#fff), border 1px `border-border-subtle`, radius 14px, padding `p-6 lg:p-8`.
- Sombra muito sutil (mais sutil que feature hero — secundárias não dominam).
- Layout interno: ícone lucide-react (`UserCheck` Distribuição automática / `Calendar` Follow-up e retorno / `CalendarCheck` Agenda operacional — escolher ícones que comuniquem operação, não geometria abstrata) tamanho ~28px em `text-text-secondary` (não accent), depois título h4 (`text-lg lg:text-xl font-semibold`), depois descrição 2-3 linhas em `text-sm lg:text-base text-text-secondary leading-relaxed`.
- Opcional: mini-mockup CSS abaixo do texto — 1 elemento visual representativo (ex: Distribuição automática mostra mini-pill "Lead → Dra. Camila" com seta; Follow-up mostra mini-timeline horizontal de 3 pontos; Agenda mostra mini-grid 3x2 representando slots). Recomendação: **incluir mini-mockup compactíssimo** em cada secundária — sem isso, viram 3 cards de "feature description" indistinguíveis de SaaS template. Com mini-mockup, viram "evidência operacional".

**Animação:**
- Header (eyebrow + h2 + sub): estado final imediato.
- Feature hero (split): `useInView` 30% → fade-up stagger (texto à esquerda primeiro 0ms, mockup à direita 200ms).
- 3 secundárias: `useInView` 20% → stagger 0/100/200ms.

**Confidence: HIGH** (architecture grounded em pattern Hero existente).

**Reconciliando NARR-03 com CONTEXT.md D-16:**
- REQUIREMENTS.md NARR-03 fala "Product apresenta quatro pilares (Atendimentos, CRM, Agentes IA, Relatórios) em sticky stack revelado pelo scroll".
- CONTEXT.md D-16 fala "Layout: 1 feature hero full-width + 3 features secundárias compactas em row. NÃO grid 2x2. NÃO scroll sticky Apple-style".
- **CONTEXT.md superseda.** Re-interpretação: o "hero feature Atendimento multicanal" engloba conceitualmente Atendimentos+CRM+Agentes IA em um único mockup operacional (caixa de entrada multicanal + decisão automática = Atendimento + CRM lite + Agente IA atendendo 24/7). As 3 secundárias cobrem Distribuição/Follow-up/Agenda — Relatórios é deferido (em Phase 4 não cabe; pode aparecer em v1.1 ou v2). NARR-08 ("demo Agente IA") satisfeito pelo "lead atribuído automaticamente" no mockup hero, sem virar seção própria.

### HowItWorks (LIGHT neutral) — 4 passos timeline vertical

**Layout:**
- `<section bg-surface-lighter py-24 lg:py-32 border-t border-border-subtle>` — branco puro + divider top.
- `<Container className="max-w-5xl">` — narrower que Product. HowItWorks é explicação focada, não exibição.
- Header: eyebrow "Como funciona" + h2 `Headline as="h2" size="section"` + sub 1 linha.
- 4 steps em coluna vertical (mobile + desktop — não vira grid horizontal).

**Cada step (4 deles):**

```
┌─ left: número grande accent ─┐    ┌─ right: conteúdo ─────────┐
│                              │    │  H3 do step                │
│      01                      │    │  Descrição 1-2 linhas      │
│   (text-5xl lg:text-7xl      │    │  ┌── mini-mockup ──┐       │
│    font-bold tracking-tight  │    │  │                  │       │
│    text-accent-primary)      │    │  └──────────────────┘       │
│                              │    │                            │
└──────────────────────────────┘    └────────────────────────────┘
        ↓
   linha conectora vertical (border-l border-accent-primary/15
   ou border-neutral-200) descendo até o próximo step
```

- **Número:** este é o único lugar onde o roxo brilha cheio em Phase 4. Grande (text-5xl lg:text-7xl), font-bold, tracking tight, `text-accent-primary`. Width fixa (~80-100px) pra alinhar todos. Acompanhado de `"01"`, `"02"`, `"03"`, `"04"` — leading zero é parte do refinamento editorial.
- **Linha conectora vertical:** entre o número de um step e o próximo, uma linha 1-2px vertical, `border-accent-primary/15` (roxo bem desaturado/translucid) — funciona como timeline visual. Recomendação: **gradient vertical** (`bg-gradient-to-b from-accent-primary/20 to-accent-primary/0`) que vai sumindo na metade, em vez de linha sólida — mais editorial.
- **Conteúdo do step (direita):**
  - H3 curto: 4-6 palavras (ex: "Lead chega pelo Instagram", "Operação distribui automaticamente").
  - Descrição 1-2 linhas em `text-text-secondary`, leading relaxed.
  - **Mini-mockup CSS** discreto, ~120-180px altura, escala MENOR que HeroCard / Product secondary cards. Cada mini-mockup mostra **um único elemento ilustrativo do step** — não tenta replicar a UI completa:
    - Step 1 "Lead chega": mini-card de notificação com ícone Instagram + linha "Nova mensagem · @marina_souza" + dot pulse.
    - Step 2 "Operação distribui": mini-pill `"Marina → Dra. Camila"` com seta + chip `"23s"` (tempo de atribuição).
    - Step 3 "Atendente conversa": mini-conversa de 2 balões (1 paciente, 1 atendente, alinhamento esquerdo/direito), com badge `"contexto: 3 mensagens anteriores"` mini.
    - Step 4 "Paciente agendado": mini-card calendário com slot destacado em accent + linha "Confirmação enviada".
  - Cada mini-mockup `bg-surface-card-strong`, border 1px subtle, radius 12px, padding 3-4, **sombra mínima** (`shadow-sm`).

**Mobile reflow:**
- Mobile: número fica em cima (não à esquerda), reduzido (text-4xl), e o conteúdo desce embaixo. Sem linha conectora vertical em mobile (ocupa espaço sem trazer valor — sequence é óbvia em viewport vertical estreito).

**Animação:**
- Header: estado final imediato.
- Cada step: `useInView` 25% threshold → fade-up + slide 12px do conteúdo da direita, número-grande revela com clip-path da esquerda (reusa keyframe `hero-headline-reveal` já existente — não criar novo). Stagger interno do step: número 0ms, h3 100ms, descrição 200ms, mini-mockup 300ms. Cada step é independente — quando o usuário rola e o step 2 entra no viewport, **só ele anima**, não tudo de novo.

**Confidence: HIGH** (vertical timeline com number + content é pattern Linear/Stripe canônico — ver `linear.app/method` que tem variação disso).

### Proof (DARK) — autoridade pelo silêncio

**Layout:**
- `<section bg-surface-darker py-24 lg:py-32 relative isolate overflow-hidden>` com `<ProofBackground>` (gradient editorial vertical + grid super sutil + zero radial, zero haze — austero).
- `<Container className="max-w-4xl text-center">` — narrow, centrado.
- 3 blocos verticais: eyebrow mini → headline section → row de categorias.

**Composição:**

1. **Eyebrow:** `<p className="text-xs font-medium uppercase tracking-[0.22em] text-text-on-dark-muted">` — texto micro tipo "Em uso" ou "Operação ativa" (testar variantes).
2. **Headline (h2):** uma frase só, centrada, com mais respiro vertical que outras h2 (margin-top 16-20). Tamanho `text-3xl sm:text-4xl lg:text-5xl` com tracking tight, `text-text-on-dark-primary`, max-w-3xl mx-auto. Candidatos (D-25):
   - "Em operação em clínicas que dependem de atendimento de alto volume."
   - "Infraestrutura operacional para clínicas de estética e dermatologia."
   - "Em uso em clínicas onde o atendimento não pode parar."
   - "Construído para a operação real de clínicas brasileiras."

3. **Row de categorias** (margin-top ~12-16):
   - Layout: flex row, gap-6 lg:gap-10, justify-center, wrap em mobile.
   - Cada categoria: texto simples, `text-sm lg:text-base font-medium text-text-on-dark-secondary` + ponto separador `·` em `text-text-on-dark-muted` entre cada uma.
   - "Estética · Dermatologia · Harmonização Facial · Odontologia · Bem-estar"
   - **Recomendação: SEM ícones lucide.** Texto puro com `·` é mais editorial premium que ícone + texto (ícone vira "logo bar lite" que viola o tom). Lenny pode pedir ícones depois — manter texto puro como default e iterar se PR review pedir.

**O que NÃO está aqui (PROIBIDO — D-27):**
- Logos de cliente reais ou fake.
- Números fabricados ("+500 clínicas").
- Testimonials genéricos.
- Badges, estrelinhas, "trusted by", "as seen in".
- Menção a Dolce Home (autorização explicitamente denied 2026-05-18).

**Animação:**
- Eyebrow + headline: estado final imediato.
- Categorias row: `useInView` 40% → fade-in sequencial pelas categorias (delay 0/80/160/240/320ms entre cada uma) — sutil, faz o usuário ler a row da esquerda pra direita naturalmente.

**Confidence: HIGH** (este é exatamente o pattern Stripe e Plaid usam quando não querem mostrar logo bar — texto editorial + categorias).

---

## Animation Strategy (motion lib trade-off + scroll-based effects taxonomy)

### Decisão central: zero motion lib em Phase 4 sections

**Quantificação do trade-off:**

| Opção | Bundle root impact | TBT impact | Quão cinematográfico | Recomendação |
|-------|--------------------|-----------|----------------------|--------------|
| Motion lib local (import em cada seção, code-split Next.js) | Cada seção que importa `motion/react` aumenta a chunk dela em ~12-18KB gzipped (post tree-shaking) + ~20KB se também usar `useScroll`/`useTransform`. 5 seções importando = 5 chunks com motion. Em prática, Next.js inline o module se for usado RSC-imported. **Risco real:** se uma única seção usar motion e estiver em rota raiz, motion vai pro First Load JS via React Server Component boundary. Phase 3 explicitamente removeu motion do root porque TBT mobile estava ruim. Re-introduzir em Phase 4 reverte essa otimização. | Re-introduz hydration cost em 5 client islands ao invés de 0. | Permite `useScroll`/`useTransform` scroll-scrubbed effects que CSS não consegue (parallax fino com scroll progress, scrub timeline). | **Não recomendado para Phase 4** — escopo D-04 não pede scrub effects; CTAs do user pedem "motion restraint, nada gimmicky". |
| CSS keyframes + IntersectionObserver inline | 0KB JS extra além de um hook `useInView` (~0.5KB inline). IO é nativo do browser, GPU-friendly via `transform`/`opacity`. | Zero. | Cobre 100% do escopo de Phase 4: fade-in viewport-triggered, stagger reveal, hover transitions, float ambient, pulse live, clip-path reveals. Não cobre scroll-scrub. Phase 4 **não precisa de scroll-scrub** (D-04 + CTAs do Lenny: "motion restraint"). | **Recomendado.** |
| `<RevealOnView>` do barrel `@/components/motion` | Importa motion lib via primitive — efetivamente igual à opção 1. | Igual à opção 1. | Igual à opção 1. | **Não recomendado.** Vide §"NARR-06 reinterpretation". |

**[VERIFIED: package.json + Phase 3 STATE.md + globals.css already has 5 keyframes from Phase 3]**
**[ASSUMED] A2** — números exatos de bundle size de motion lib em chunk pós-tree-shaking dependem da configuração específica de Next.js 15.5 + tree-shaking de `motion/react`. Estimativa baseada em [docs.motion.dev/reduce-bundle-size](https://motion.dev/docs/react-reduce-bundle-size) (core 8KB; com features padrão ~18KB; com `useScroll`/`useTransform` ~30-40KB). Verificação real só via `@next/bundle-analyzer` na Phase 7.

### Taxonomy de scroll-based effects necessários em Phase 4

| Efeito | Onde aparece | CSS-only viável? | Implementação |
|--------|--------------|------------------|---------------|
| Fade-up on viewport entry | Pain cards, Bridge frase (zero — Bridge é estática), Product feature hero blocks, Product secundárias, HowItWorks steps, Proof categorias | ✅ Sim | `useInView` hook + add `hero-card-rise` className quando true. Keyframe já existe em `globals.css`. |
| Staggered reveal (múltiplos elementos com delay incremental) | Pain constelação (4 cards 0/100/200/300ms), Product secundárias (3 cards 0/100/200ms), HowItWorks step internals, Proof categorias | ✅ Sim | `animation-delay` inline style por index. Keyframe único reusado. |
| Clip-path reveal (cinematográfico Hero) | HowItWorks step number entry — opcional | ✅ Sim | Keyframe `hero-headline-reveal` já existe. |
| Float ambient (idle motion) | Product feature hero overlay cards, HowItWorks mini-mockups | ✅ Sim | `hero-card-float-a/b/c` keyframes já existem; reusar. |
| Live pulse (dot pulsing) | Product feature hero "ao vivo" dot, HowItWorks step 1 mini-mockup notification dot | ✅ Sim | `hero-live-pulse` já existe. |
| Scroll-scrubbed parallax/scale | — | N/A | **Não está no escopo de Phase 4.** Lenny pediu "motion restraint", "quase invisível, nada gimmicky". |
| Pin-and-scrub timeline | — | N/A | **Não está no escopo de Phase 4.** Apple-style sticky explicitamente recusado em D-16. |
| Horizontal scroll | — | N/A | **Stretch goal v1.1** (REQUIREMENTS NARR-04 menciona, defer). |

**Conclusão:** **100% do escopo Phase 4 é CSS-friendly.** Motion lib não adiciona capacidade necessária; só adiciona bundle cost.

### O hook `useInView` necessário

Recomendação: criar **um único** hook em `src/hooks/use-in-view.ts` baseado em IntersectionObserver nativo (sem `motion/react`). É o que substitui `<RevealOnView>` (que importa motion lib) para o uso 100% de Phase 4.

**Pseudo-API:**
```ts
// src/hooks/use-in-view.ts
"use client";
import { useEffect, useRef, useState } from "react";
export function useInView<T extends Element = HTMLDivElement>(opts?: {
  threshold?: number; // default 0.2
  rootMargin?: string; // default "0px 0px -10% 0px"
  once?: boolean; // default true
}): [React.RefObject<T>, boolean] {
  // standard IO setup, returns ref + bool
}
```

- ~30 lines de código, ~500 bytes minified.
- Já adapta para `prefers-reduced-motion`: hook pode retornar `[ref, true]` imediatamente se reduced (estado final, sem esperar IO).
- SSR-safe (não chama IO no server).

**Uso típico em seção:**
```tsx
const [ref, inView] = useInView({ threshold: 0.3 });
return (
  <div ref={ref} className={inView ? "hero-card-rise" : "opacity-0"}>
    ...
  </div>
);
```

Por que não pode ser RSC: IntersectionObserver é DOM API, exige client component. **Mas** os filhos dele continuam sendo RSC — só o wrapper que escuta IO precisa ser `"use client"`. Padrão: cada seção tem 1-2 client islands mínimas (PainCardConstellation, HowItWorksStep) que consumem `useInView`; resto é RSC.

### NARR-06 reinterpretation

Texto original: *"Cada seção narrativa usa apenas primitivas de `components/motion/` — nenhum `motion.div` direto em arquivos de seção"*.

**Problema:** "apenas primitivas de `components/motion/`" pressupõe motion lib no bundle root. Phase 3 removeu motion do bundle root pra otimizar TBT. Manter NARR-06 ao pé da letra **reverte** essa otimização.

**Interpretação atualizada (planner deve documentar em SUMMARY.md da Phase 4):**
- A *intenção* original do NARR-06 é: "zero `<motion.div>` direto em sections — discipline de animação fica isolada".
- A *forma* atualizada: zero `motion.*` JSX **e** zero imports de `@/components/motion/*` em `src/sections/Pain|Bridge|Product|HowItWorks|Proof/*`. A disciplina de animação fica em CSS keyframes (centralizadas em `globals.css` com prefixos por seção: `pain-*`, `product-*`, etc — ou reusando os existentes `hero-*` quando o pattern for idêntico) + um hook `useInView` que é puro IO.
- Test invariant atualizado: grep proíbe tanto `\bmotion\.(div|h1|...)` **quanto** `from ['"]@/components/motion/` em sections de Phase 4.

---

## Mobile Choreography Strategy (NARR-04, NARR-07)

### O problema com `useDeviceTier()` atual

`src/hooks/use-device-tier.ts` importa `useReducedMotion` de `motion/react`. Isso significa: usar `useDeviceTier` em uma seção Phase 4 **reintroduz motion lib** no bundle dessa seção (mesmo só pra ler `prefers-reduced-motion`).

**Solução:** criar um hook leve substituto `useReducedMotionLite` (~20 lines) que usa `window.matchMedia("(prefers-reduced-motion: reduce)")` diretamente. Phase 4 sections usam esse + matchMedia inline para tier detection.

Alternativa mais simples: **não usar device tier em Phase 4 sections via JS.** Em vez disso:
- Diferenciar mobile vs desktop **via Tailwind breakpoints** no markup e no CSS (já é o padrão atual).
- Diferenciar motion intensity via media queries CSS — ex.:
  ```css
  @media (max-width: 639px) {
    .pain-card-rise { animation-duration: 0.4s; }
  }
  @media (min-width: 1024px) {
    .pain-card-rise { animation-duration: 0.6s; }
  }
  ```
- Reduced motion: já tratado globalmente em `globals.css:99-107` (zera `animation-duration` para `0.01ms`).

**Recomendação:** **não criar novo hook** para Phase 4. Usar:
1. Tailwind breakpoints para layout reflow (já é padrão).
2. CSS media queries para motion intensity por viewport.
3. `globals.css` reduced-motion rule global (já existe — vide L99-107).

Este é o caminho mais leve e está alinhado com D-04 ("CSS-only IntersectionObserver inline; motion lib só com argumento real").

Quando virar problema (ex: HowItWorks step animation tem que diferir conceptualmente entre mobile e desktop, não só intensity): introduzir hook leve `useViewportTier` baseado em matchMedia inline — sem dependência de motion lib. Plan 0 pode criar isso preemptivamente se planner decidir.

### Per-section mobile reflow rules

| Seção | Desktop | Mobile | Diferença chave |
|-------|---------|--------|----------------|
| Pain | Constelação 4 pseudo-cards diagonal absolute positioned | Mesma constelação porém escala menor + rotações reduzidas (`±2deg` em vez de `±5deg`) — ou stack 2x2 vertical se rotation absolute não couber em 375px | Layout reflow simples via Tailwind breakpoints |
| Bridge | max-w-3xl text-center, padding y-40 | max-w-full px-6, padding y-24 | Apenas size reduction |
| Product feature hero | Split 40/60 horizontal | Stack vertical (texto em cima, mockup embaixo); mockup cards overlay rotações reduzidas | Tailwind `lg:grid-cols-[2fr_3fr]` vs `grid-cols-1` |
| Product secundárias | grid 3-col | grid 1-col stacked | `grid-cols-1 lg:grid-cols-3` |
| HowItWorks steps | Número à esquerda + conteúdo à direita, linha conectora vertical entre | Número em cima + conteúdo abaixo, sem linha conectora | `flex-col lg:flex-row` + conditional render da linha via `hidden lg:block` |
| Proof | row de categorias horizontal, justify-center | row wrap (Tailwind `flex-wrap`) ou stack vertical com `·` ainda separando — testar; recomendação: `flex-wrap justify-center` mantém o feel "row" | `flex flex-wrap justify-center gap-4 lg:gap-10` |

Nenhuma seção precisa de duplicação de componente (NARR-07 satisfeito). Mobile é versão "simplificada mas premium" via Tailwind + CSS media queries — não simplificada de obrigação.

---

## Test/Invariant Patterns to Replicate

Cada seção replica o pattern de Phase 3 `tests/sections/hero-invariants.test.ts` + `tests/content/hero.test.ts`. **Plan 0 pode criar uma factory genérica** se evitar copy-paste, mas simplicidade é preferível — replicar literal é OK.

### Per-section invariant tests (replicate Phase 3 pattern)

Para cada `src/sections/<Section>/`:

```
tests/sections/<section>-invariants.test.ts
```

Tests:
1. **Zero `motion.*` JSX** em todos `.tsx` de `src/sections/<Section>/` — mesmo regex do Hero invariant.
2. **Zero `import ... from '@/components/motion/'`** em todos `.tsx` de `src/sections/<Section>/` — **NOVO INVARIANT** (vide NARR-06 reinterpretation).
3. **Zero `vh` raw / `h-screen` / `min-h-screen`** — usar `svh`/`dvh` se altura mínima necessária.
4. **Zero `priority` em `<Image>`** dentro de sections (single priority é Hero, e Hero redesign B já removeu — atualmente landing tem **zero** `<Image priority>` segundo `hero-invariants.test.ts:127-170`, então cada section invariant verifica que adições de imagens não regridem isso).
5. **Zero PT-BR sentence-like strings hard-coded em JSX** (COPY-01 — mesmo regex Hero).
6. **Zero "cara de IA" banned phrases** em `src/content/<section>.ts` (COPY-02 — mesmo regex Hero).
7. **NOVO em Proof:** Zero menção a Dolce Home (D-27) + Zero números (`/\b\d{2,}\b/` em copy file não deve match exceto em datas/horários que não devem aparecer em Proof; checar matches) + Zero "trusted by"/"em parceria com" buzzwords.

### Per-section copy contract tests (replicate `tests/content/hero.test.ts`)

```
tests/content/<section>.test.ts
```

Tests:
1. Shape do tipo (h2, sub, etc — depende da seção).
2. **`clínica` aparece** na headline da seção (NARR-04 verticalização — opcional por seção; recomendado para Pain, Product, HowItWorks, Proof; opcional para Bridge).
3. Anti-IA banned phrases regex global.
4. Sem menção a Dolce Home (D-13/D-27).
5. **NOVO para Proof:** zero números fabricados (ex: regex pra qualquer `+\d+` ou `\d+%` no content file).
6. **NOVO para Pain/Bridge/Product/HowItWorks:** teste de especificidade (COPY-03) — programaticamente difícil, mas pode ter unit test que valida que "clínica" aparece e que termos como "estética", "atendimento", "lead", "paciente" estão presentes no copy module.

### Cross-section global test

Criar `tests/landing/coherence.test.ts`:
- Verifica que `src/app/page.tsx` renderiza as 6 sections na ordem esperada (Hero → Pain → Bridge → Product → HowItWorks → Proof) via parse de imports.
- Verifica que zero `<Image priority>` na page (manutenção da decisão Hero redesign B).
- Verifica que `accent-primary` aparece em quantidade razoável (não fundo grande — mas isso já é coberto por `tests/brand-lock.test.ts` existente).

---

## Copy Review Cadence (D-17 applied per section)

Replica literal do `docs/copy-review.md` existente, **por seção**, em sequence:

1. **Pain primeiro:** Plan que cria `src/content/pain.ts` (3 variantes) + section component → abre PR → Lenny aprova `LGTM v?` ou edita inline → merge.
2. **Bridge segundo:** Plan idem (após Pain merged).
3. **Product terceiro:** Plan idem.
4. **HowItWorks quarto:** Plan idem.
5. **Proof quinto:** Plan idem.

**Por que sequencial e não paralelo:** D-17 explicitamente diz "Copy review é gate, não polish de fim — uma seção só fecha quando a copy dela tiver merge aprovado". Paralelizar 5 PRs de copy quebra a cadência. Cada seção também aprende da anterior (Pain estabelece o tom de fragmentação; Bridge se calibra contra Pain; Product calibra contra Bridge; etc).

**Estimativa de tempo:** se Lenny tem cycle time típico de ~1 dia útil entre push e LGTM (média async assumida) — Phase 4 leva ~5-7 dias úteis para fechar copy + implementação de todas as 5 sections em sequence. Plan 0 (utilities + tests) pode ser feito em paralelo aos primeiros PRs de copy.

**Optional optimization:** Plan 0 pode incluir os **drafts de copy** das 5 seções (3 variantes cada) em um único arquivo de "copy proposals", abrindo 1 PR consolidado para Lenny revisar **a estratégia toda**, antes dos PRs individuais por seção. Isto **não substitui** os PRs por seção (cada copy é gate), mas reduz o número de iterações ao permitir que Lenny veja o arco editorial completo antes de aprovar peça por peça. Recomendação: **fazer isso como step opcional** se planner quiser otimizar tempo Lenny; default é seguir cadência sequencial.

### Glossary file (COPY-05)

Plan 0 cria `src/content/glossary.ts` se ainda não existir. Conteúdo inicial:

```ts
// src/content/glossary.ts — termos verticais aprovados (COPY-05).
// Novos termos exigem aprovação Lenny via PR.
export const CLINICA_GLOSSARY = {
  atendimento: "atendimento", // singular preferred
  agendamento: "agendamento",
  paciente: "paciente",
  retorno: "retorno (consulta/sessão futura agendada)",
  followUp: "follow-up", // hífen
  recepcao: "recepção",
  equipeAtendimento: "equipe de atendimento", // não "atendentes"
  lead: "lead",
  // Verticais
  estetica: "estética",
  dermatologia: "dermatologia",
  harmonizacao: "harmonização facial",
  odontologia: "odontologia",
  bemEstar: "bem-estar",
  // Canais
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  // Operacionais
  inboxMulticanal: "caixa de entrada multicanal",
  distribuicaoAutomatica: "distribuição automática",
  agendaIntegrada: "agenda integrada",
} as const;
```

Não é importado obrigatoriamente por seções (cada copy module pode escrever as strings finais diretamente — Phase 3 hero.ts faz isso). É **referência canônica** consultada na redação de cada variante.

---

## Mockup Composition Rules (extending HeroCardStack pattern)

### Princípios gerais (válidos para todos os mockups CSS de Phase 4)

1. **Surface:** Cards sempre `bg-surface-card` (#FBFCFD) ou `bg-surface-card-strong` (#fff). Nunca pure white se há outras superfícies brancas próximas — variar entre #FBFCFD e #fff cria leve hierarquia (mockups sobre `surface-light` (#fafaf9) Product = cards em `#fff`; mockups sobre `surface-darker` Pain = cards em `#FBFCFD`).
2. **Border:** sempre `1px border` em `border-neutral-200/70` (light surface) ou `border-border-on-dark-subtle` (dark surface) + `ring-1 ring-inset ring-white/80` (inset highlight no topo do card — vide HeroCardStack:48) que dá "lighting cinematográfico" — herda direto de Phase 3.
3. **Shadow:** sempre 2 camadas — drop deep + soft (`shadow-[0_24px_60px_-20px_rgba(8,12,24,0.65),0_8px_24px_-12px_rgba(8,12,24,0.45)]` para dark backgrounds; baixar opacities 3-5x para light backgrounds).
4. **Radius:** **14px** para cards "principais" tipo HeroCard (mesma escala — herda); **12px** para chips/overlays menores; **10px** para botões/pills mini.
5. **Typography dentro de cards:** tracking tight (-0.01em), font-mono pra metadata (timestamps, IDs), uppercase mini pra labels.
6. **Iconography:** sempre lucide-react, strokeWidth 2.25-2.75 (mesmo que HeroCardStack:60), size 13-16px dentro de cards, sempre cor neutra ou accent muito sutil — nunca cor saturada full em ícone (verde-emerald-600, rose-500, violet-600 são OK como variation; nunca pure red, pure yellow).
7. **Dot indicators:** `size-[5px] rounded-full bg-emerald-500` para "ao vivo" + `hero-live-pulse` animation. Mesmo size e cor em todos mockups da landing.
8. **Float animation:** se card está em mockup ambient (Product feature hero overlays, HowItWorks mini-mockups), usar `hero-card-float-a/b/c` (mesmas keyframes) — não criar variações novas; reusar.

### Como cada seção estende o pattern

| Seção | Cards | Escala vs HeroCard | Comportamento de motion | Notas |
|-------|-------|---------------------|--------------------------|-------|
| Pain (constelação) | 4 pseudo-cards menores representando ferramentas separadas (Instagram inbox / WhatsApp / Planilha agenda / Notas) | ~70% do HeroCard (140-180px wide, padding compacto) | Stagger rise quando seção entra viewport; depois disso, **estáticos** (não float — pain quer "parada", não vida) | Rotação ±3-5°; baixa opacidade em alguns (~0.6) pra mostrar "esquecidos" |
| Product feature hero | 1 mockup central grande (inbox 3-linhas) + 2 overlays small | Central = ~150% do HeroCard width (full feature hero); overlays = ~60% do HeroCard | Central estático; overlays com float ambient | Esta é a composição **mais densa** de Phase 4 — single mockup carrega o peso |
| Product secundárias | 1 mini-mockup compacto por card secundário (mini-pill, mini-timeline, mini-grid) | ~40-50% do HeroCard | Estático | Não compete com feature hero |
| HowItWorks steps | 1 mini-mockup por step (4 total) | ~50% do HeroCard | Estáticos; rise on enter step | Cada step tem mini distinto (notification / pill+seta / 2 balões conversa / calendar slot) |
| Proof | Nenhum mockup | — | — | Tom é silêncio; mockup quebraria |

### Anti-patterns explicitamente proibidos (extensão do CONTEXT.md)

- ❌ Screenshot real da UI Likro tela inteira (já abandonado em Phase 3 — Hero redesign B mudou para cards CSS; Phase 4 segue o mesmo princípio).
- ❌ Mockup com browser chrome (Safari/Chrome top bar) — vira "tutorial".
- ❌ Perspective/tilt 3D pesado em mockup — vira "AI SaaS template".
- ❌ Múltiplos micro-cards collage exagerado (>3 overlays sobre um mockup) — vira ruído.
- ❌ Animar entrance do mockup principal de uma seção quando o mockup é o LCP-candidate da seção — segue HERO-02 principle escalado.
- ❌ Cards com gradient roxo de fundo — viola brand-lock (roxo é accent, não fundo).
- ❌ Glow gigante atrás dos cards — Hero usa haze sutil, Phase 4 não escala isso.

---

## Project Constraints (from CLAUDE.md) — Recap

Vide §"Project Constraints" acima. **Pontos críticos pro planner:**

- Pipeline pré-teste: code-review skill + Playwright MCP **antes** de cada commit. Phase 4 é frontend-heavy — Playwright vai validar cada seção (caminho feliz: scroll, fade-ins triggered, mobile reflow, dark/light transitions visualmente coerentes; edge cases: prefers-reduced-motion ativo zera tudo, viewport very narrow não quebra layout).
- "commita" do usuário = commit + push direto.
- Sem emojis em arquivos.
- Stack travado: nada de adicionar lib nova em Phase 4 (zero pacotes novos — todo o escopo cabe em deps existentes: lucide-react para ícones + React 19 nativo + Tailwind v4 + CSS keyframes).
- State invariants (vide STATE.md): roxo nunca grande, WhatsApp sempre wa.me/, único Image priority é hero (atualmente zero — manter), copy nunca hard-coded JSX, `motion.div` proibido em sections.

---

## Standard Stack

### Core (já instalado, nada novo)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.18` | App Router, RSC | **[VERIFIED: package.json]** Já estabelecido. |
| `react` | `^19.0.0` | UI runtime | **[VERIFIED: package.json]** |
| `typescript` | `^5.6` | Types | **[VERIFIED: package.json]** |
| `tailwindcss` | `^4.3.0` | Utility + `@theme` tokens | **[VERIFIED: package.json]** Phase 4 só consome — não adiciona token. |
| `lucide-react` | `^0.460.0` | Ícones nos mockups + HowItWorks step icons + Pain pseudo-card icons | **[VERIFIED: package.json]** Pattern já estabelecido em HeroCardStack. |

### Supporting (já existente)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `@/components/ui/container` | Wrapper max-width consistente | Cada seção `<Container>` exceto Bridge (que reduz para `max-w-3xl` via className) e Proof (`max-w-4xl`) |
| `@/components/ui/headline` | H2 das seções | `<Headline as="h2" size="section">` para Pain, Product, HowItWorks, Proof headlines |
| `@/components/ui/card` | Base opcional para cards | Provavelmente NÃO usar — cards de Phase 4 são `<article>` ou `<div>` custom (igual HeroCard pattern). Card primitive pode ser overkill. |
| `@/lib/utils` `cn()` | Composição de classes | Usar livremente |

### Não instalado (decisão explícita: NÃO instalar)

| Package | Reason |
|---------|--------|
| `motion` re-add to bundle root | D-04 explicit. CSS+IO covers 100% of scope. |
| `gsap` / `@gsap/react` | Fora de v1 (Project Out of Scope). |
| `@react-three/fiber`, `three.js` | Sem 3D scenes. |
| `aos`, `wow.js`, `animate.css` | Não-React idiomatic. CSS keyframes direto. |
| `react-spring` | Redundante com Motion (que já não está sendo usado). |

### Verification da decisão "no new packages"

Phase 4 não adiciona nenhum import de pacote npm além do que já está em uso. Confirma com:
```bash
grep -r "^import .* from ['\"]\(?!@/\|\.\)" src/sections/Pain src/sections/Bridge src/sections/Product src/sections/HowItWorks src/sections/Proof
# Esperado: apenas imports de react, lucide-react (já instalados)
```

**[VERIFIED: scope inspection do CONTEXT.md + Phase 3 patterns]**

---

## Architecture Patterns

### Folder structure (delta do current state)

```
src/
├── app/
│   └── page.tsx                              # EDITAR — adicionar render das 5 sections abaixo de <Hero />
├── components/
│   ├── layout/
│   │   └── Header.tsx                        # NÃO TOCAR
│   ├── motion/                               # NÃO USAR em sections de Phase 4 (NARR-06 reinterpretation)
│   └── ui/                                   # NÃO TOCAR (consumir Container, Headline)
├── content/
│   ├── pain.ts                               # NOVO — 3 variantes de copy
│   ├── bridge.ts                             # NOVO — 3 variantes
│   ├── product.ts                            # NOVO — 3 variantes (hero feature copy + 3 secundárias)
│   ├── how-it-works.ts                       # NOVO — 3 variantes (header copy + 4 steps)
│   ├── proof.ts                              # NOVO — 3 variantes (eyebrow + headline + categorias)
│   ├── glossary.ts                           # NOVO — termos verticais aprovados (COPY-05)
│   └── hero.ts                               # NÃO TOCAR
├── hooks/
│   ├── use-device-tier.ts                    # Não usar em Phase 4 (importa motion/react)
│   └── use-in-view.ts                        # NOVO — IO-based, ~30 lines, motion-free
├── sections/
│   ├── Hero/                                 # NÃO TOCAR
│   ├── Pain/
│   │   ├── index.tsx                         # RSC orchestrator
│   │   ├── PainBackground.tsx                # RSC (CSS-only — adapt Hero pattern, more dense)
│   │   ├── PainCardConstellation.tsx         # "use client" — uses useInView
│   │   ├── PainCard.tsx                      # RSC — single pseudo-card primitive
│   │   └── PainStatement.tsx                 # "use client" — synthesis line with delayed reveal
│   ├── Bridge/
│   │   └── index.tsx                         # RSC, static — Bridge é frase pura
│   ├── Product/
│   │   ├── index.tsx                         # RSC orchestrator
│   │   ├── ProductHeader.tsx                 # RSC (h2 + sub)
│   │   ├── ProductHeroFeature.tsx            # "use client" — split + useInView
│   │   ├── ProductHeroFeatureMockup.tsx      # RSC — composition (central inbox + 2 overlays)
│   │   ├── ProductSecondaryGrid.tsx          # "use client" — uses useInView for stagger
│   │   └── ProductSecondaryCard.tsx          # RSC — single card primitive
│   ├── HowItWorks/
│   │   ├── index.tsx                         # RSC orchestrator
│   │   ├── HowItWorksHeader.tsx              # RSC
│   │   ├── HowItWorksStep.tsx                # "use client" — uses useInView per step
│   │   └── HowItWorksMiniMockup.tsx          # RSC — switch by step kind
│   └── Proof/
│       ├── index.tsx                         # RSC orchestrator
│       ├── ProofBackground.tsx               # RSC — austere dark
│       └── ProofCategories.tsx               # "use client" — uses useInView for sequential fade
└── app/
    └── globals.css                           # EDITAR — adicionar keyframes section-específicas (ou reusar hero-* — preferido)
tests/
├── content/
│   ├── pain.test.ts                          # NOVO
│   ├── bridge.test.ts                        # NOVO
│   ├── product.test.ts                       # NOVO
│   ├── how-it-works.test.ts                  # NOVO
│   └── proof.test.ts                         # NOVO
├── sections/
│   ├── pain-invariants.test.ts               # NOVO
│   ├── bridge-invariants.test.ts             # NOVO
│   ├── product-invariants.test.ts            # NOVO
│   ├── how-it-works-invariants.test.ts       # NOVO
│   └── proof-invariants.test.ts              # NOVO
└── landing/
    └── coherence.test.ts                     # NOVO — global ordering + no priority Image
```

### Pattern 1: RSC por padrão, client island só para useInView

Cada `index.tsx` é RSC. Sub-componentes que precisam `useInView` viram `"use client"`. Mockups e backgrounds (puros CSS, sem hook) permanecem RSC. **Hydration footprint baixíssimo** — só dispara client para o wrapper que escuta IO.

### Pattern 2: Stagger via inline `animation-delay`

Replicar Phase 3 `HeroCardStack:124` — `style={{ animationDelay: "80ms" }}`. Não criar novo mecanismo.

```tsx
{cards.map((card, i) => (
  <PainCard
    key={card.id}
    card={card}
    className={inView ? "pain-card-rise" : "opacity-0"}
    style={{ animationDelay: `${i * 100}ms` }}
  />
))}
```

### Pattern 3: Keyframe prefix por seção (ou reuse hero-*)

Decisão: **reusar `hero-*` keyframes** sempre que comportamento for idêntico. Criar prefix novo (`pain-*`, `product-*`, etc) só quando comportamento difere materialmente. Recomendação inicial: **zero keyframe novo na Phase 4** — todas as keyframes existentes do `globals.css` (hero-card-rise, hero-headline-reveal, hero-card-float-a/b/c, hero-live-pulse, hero-haze-drift) cobrem o vocabulário. Plan 0 não adiciona keyframe nova; Plans 1-5 só consomem.

Se descobrir necessidade (ex: HowItWorks step number reveal precisa de timing diferente), criar keyframe nova com prefix da seção — não modificar as `hero-*` existentes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Viewport-triggered reveal | Custom IO listener inline em cada section | Hook `useInView` único em `src/hooks/use-in-view.ts` | Centralizar lógica IO; ~30 lines vs 30×5=150 duplicadas |
| Stagger reveal | Setup setTimeout chained per element | `animation-delay` inline + keyframe único | GPU-friendly; declarative; já é pattern Phase 3 |
| Reduced motion handling | `useState` + `matchMedia` boilerplate em cada hook | `globals.css` global rule (já existe L99-107) + opcional `useReducedMotionLite` hook | Já resolvido em CSS; hook só se precisar comportamento JS distinto |
| Surface tokens | Hardcoded hex em className | Tokens do `@theme` (`bg-surface-darker`, `text-text-on-dark-primary`, etc) | Já em globals.css; brand-lock test garante |
| Card design | Custom shadow/border per section | Pattern HeroCard (border + ring inset + 2-layer shadow + radius 14px) | Já calibrado |
| H2 styles | Tailwind classes ad-hoc | `<Headline as="h2" size="section">` | Já provisionado |
| Container width | Manual `max-w-7xl mx-auto px-4...` | `<Container>` | Já provisionado |
| Section coherence enforcement | Manual review | Cross-section coherence test (`tests/landing/coherence.test.ts`) | Automated regression catch |
| Copy storage | Inline strings | `src/content/<section>.ts` | COPY-01 + grep tests |
| Anti-IA enforcement | Manual review | Grep test in invariants (regex existente em hero tests) | Catches drift mecanicamente |
| Phone deep link em Proof/etc | — | Não há CTA em Phase 4 sections — não construir |  — |

**Key insight:** Quase tudo já existe. O risco real de Phase 4 é **construir paralelos** (novo keyframe, novo card pattern, novo container width) ao invés de **consumir o vocabulário Phase 3**.

---

## Runtime State Inventory

**Não aplicável.** Phase 4 é greenfield em cima de Phase 3 — sem rename, sem migration, sem mudança de schema/store.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None novos. `NEXT_PUBLIC_WA_NUMBER` já configurado (Phase 3 D-16). | — |
| Build artifacts | None | — |

---

## Common Pitfalls

### Pitfall A: Re-introducing motion lib via "innocent" useDeviceTier import

**What goes wrong:** Plan executor importa `useDeviceTier()` em uma section Phase 4 (parece útil — "preciso saber mobile vs desktop pra ajustar motion intensity"). `useDeviceTier` importa `useReducedMotion` de `motion/react`. Next.js chunks motion lib na chunk dessa section. Section está em route root → motion vai pro First Load JS. TBT regression invisível.

**How to avoid:** Plan 0 cria hook leve `useReducedMotionLite` (matchMedia direto) e documenta em `src/sections/README.md` que Phase 4 sections **não importam** de `@/components/motion/*` nem de `@/hooks/use-device-tier` — usar Tailwind breakpoints + `useReducedMotionLite` quando precisar.

Adicionalmente, invariant test grep proíbe esses imports em sections.

**Warning signs:** Bundle analyzer mostra motion lib na First Load JS de `/` na Phase 4 quando Phase 3 não tinha. TBT mobile regride.

**Confidence: HIGH.**

### Pitfall B: Section transitions com fade gradient (kills cinematographic feel)

**What goes wrong:** "Smooth transition entre Pain dark e Bridge light" parece premium em mockup — implementador adiciona `bg-gradient-to-b from-surface-darker to-surface-light` na junção. Resultado: zona morta de 200px com cor lama, perde "alívio" do choque cromático, vira "fade SaaS template".

**How to avoid:** Junção entre seções é corte seco. Cada `<section>` tem `bg-{token}` direto, sem padding sharing.

**Warning signs:** Visual reviewer comenta "a transição entre Pain e Bridge tá meio aguada". Comparar com Stripe/Linear screenshots — eles usam corte seco.

**Confidence: HIGH.**

### Pitfall C: Mockup composition over-engineering

**What goes wrong:** Product hero feature mockup tenta replicar a UI Likro real (toolbar, sidebar, filters, multiple panels). Vira screenshot redesigned. Phase 3 abandonou screenshot pra cards CSS justamente por isso.

**How to avoid:** Mockup mostra **3-5 elementos visuais máximo**, em arranjo que comunica o "momento de valor" da capacidade (vide §Product feature hero mockup composition).

**Warning signs:** Mockup começa a precisar de scroll interno; tem mais de 5 textos diferentes; tem mais de 3 ícones.

**Confidence: HIGH.**

### Pitfall D: Proof section que vira "trusted by" minimalista

**What goes wrong:** Categorias verticais ficam em row, alguém pensa "deixa eu adicionar ícones lucide pequenos pra cada uma — fica mais visual". Vira logo bar lite. Viola D-27 + tom institucional silencioso (D-28).

**How to avoid:** Default é texto puro com `·` separador. Adicionar ícones só se PR review explicitamente pedir, e mesmo assim usar lucide com strokeWidth 1.5 (mais sumido) em cor `text-text-on-dark-muted` — não accent.

**Warning signs:** Proof começa a parecer "as seen in"/"trusted by" bar de SaaS template.

**Confidence: HIGH.**

### Pitfall E: HowItWorks step number animation que compete com Hero

**What goes wrong:** Step numbers do HowItWorks são grandes e accent — é tentador adicionar uma animação spectacular (gradient sweep, count-up, scale-in pesado). Vira "feature" da seção. HowItWorks é explicativa (D-23), não competir visualmente.

**How to avoid:** Step number anima com `hero-headline-reveal` (clip-path da esquerda, 800ms, ease-premium-out — sutil) ou estado final imediato. Sem count-up. Sem scale-in. Sem gradient sweep.

**Confidence: HIGH.**

### Pitfall F: Bridge section com animação que destrói o "statement editorial silencioso"

**What goes wrong:** Bridge é só uma frase centrada. Implementador acha que "uma frase só sem motion fica vazio" e adiciona text-split por palavra reveal. Vira "frase com efeito", tom editorial morre.

**How to avoid:** Bridge é estática. Estado final imediato. Lead-in pill (se houver) tem fade-in MUITO sutil opcional. Default: zero motion na Bridge.

**Warning signs:** Demo da Bridge tem efeito visual perceptível.

**Confidence: HIGH.**

### Pitfall G: Pain section que vira agressiva

**What goes wrong:** Headline da Pain vira "Pare de perder leads" ou "Você está falhando" ou "Sua clínica está afogando". Viola D-10 + D-12. Tom de tráfego pago, não premium B2B.

**How to avoid:** Headline da Pain é **afirmação calma**: "A sua operação está espalhada em 4 apps que não falam entre si." ou similar. Constatação, não acusação.

**Warning signs:** PR de copy da Pain inclui palavras como "afogando", "perdendo", "falhando", "caos", interrogativos.

**Confidence: HIGH.**

### Pitfall H: Cross-section regression — Phase 4 quebra Hero LCP

**What goes wrong:** Phase 4 adiciona 5 seções abaixo do Hero; cada uma com CSS keyframes próprios, imagens (mesmo lazy), client islands. Bundle root cresce; LCP mobile do Hero regride.

**How to avoid:**
- Zero `<Image>` em Phase 4 sections (mockups são CSS-only — vide pattern). Se uma section eventualmente precisar de raster image (ex: ilustração abstrata), usar `<Image priority={false} loading="lazy">` + lazy under fold.
- Plan 0 inclui benchmark: rodar bundle analyzer antes e depois de cada section ser merged; se First Load JS cresce significativamente, investigar.
- Phase 7 (PERF-01) re-mede LCP com landing completa — mas Phase 4 deve **antecipar** regressões via benchmark intermediate.

**Warning signs:** Bundle analyzer mostra crescimento >5KB em First Load JS por section.

**Confidence: HIGH (architecture) / MEDIUM (empirical numbers — só medindo).**

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact for Phase 4 |
|--------------|------------------|--------------|--------------------|
| Sticky scroll Apple-style for product sections | Editorial section flow with restraint (Linear/Stripe/Attio standard) | Started ~2023; canonical by 2025 | D-16 explicitly rejects sticky Apple-style |
| Logo wall "trusted by" | Restraint — categories text-only OR none | Stripe/Linear lead since 2023 | D-26+D-27 — categories row only |
| Animated heroes with motion library | CSS-only + static SSR LCP element | Web Vitals push 2022-2024 made this standard | Phase 3 already adopted; Phase 4 extends |
| `framer-motion` package name | `motion` package name (rebrand 2024) | Mid-2024 | Already in package.json; Phase 4 doesn't use anyway |
| Screenshot-of-UI hero mockups | Curated "moment of value" composition (Linear pioneered this) | 2023-2024 | Phase 3 redesign B adopted; Phase 4 follows |
| Scroll-jacking heavy | Restraint — `prefers-reduced-motion` honored, micro motion only | iOS Safari pressure + a11y pressure 2023+ | Phase 4 stays restrained |

**Deprecated/outdated:**
- `aos`, `wow.js`, `animate.css` — pre-React-era, class-toggle on-scroll libs. Replaced by IntersectionObserver + CSS keyframes natively.
- `@studio-freight/lenis` package name — deprecated, use `lenis`.
- Pages Router patterns — Phase 4 uses App Router throughout.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Pain "constelação de 4 pseudo-cards" lê em ~1s como "fragmentação operacional" para dono de clínica | Per-Section / Pain | Pain mockup precisa de iteração visual; Lenny vê o PR e pode pedir layout diferente. Mitigation: planner inclui visual iteration buffer no plan timeline. |
| A2 | Motion lib local em 5 sections adds 30-46KB gzipped a First Load JS (vs CSS-only 0KB) | Animation Strategy | Números exatos dependem de Next.js tree-shaking; só medível via `@next/bundle-analyzer`. Decisão "zero motion lib" continua válida mesmo se número real for menor — D-04 já trava. |
| A3 | NARR-02 satisfeito pela justaposição dark→light entre Pain e Bridge (sem `<ScrollScene>`) | Bridge construction | Lenny pode discordar e querer "transição cinematográfica" mais explícita. Mitigation: planner documenta a reinterpretação em SUMMARY e oferece alternativa (Plan opcional adicionar suave mockup-expansion na Bridge via motion local) caso Lenny demande. |
| A4 | NARR-03 satisfeito pela combinação "1 feature hero (engloba Atendimento+CRM+Agente IA) + 3 secundárias (Distribuição/Follow-up/Agenda)" — Relatórios deferido | Product construction | Lenny pode querer Relatórios visível em Phase 4. Mitigation: Plan de Product secundárias pode reservar slot pra Relatórios card opcional via PR review. |
| A5 | NARR-08 (demo Agente IA) satisfeito por uma linha "atribuído automaticamente · sugestão de IA aceita" dentro do Product hero feature mockup | Product mockup | Pode não comunicar suficientemente "Agente IA" como capability autônoma. Mitigation: planner pode propor segundo card overlay no Product hero feature dedicado a "IA atendeu por mim" + iterar via PR. |
| A6 | Lenny não pedirá ícones lucide em Proof categories — texto puro com `·` é mais editorial | Proof construction | Subjetivo. Default texto puro, iterar via PR se Lenny pedir ícones. |
| A7 | `useInView` hook ~30 lines + 500B é suficiente para todo viewport-trigger de Phase 4 | Animation Strategy | Edge case: IO em iOS Safari versões antigas pode ter quirks. iOS Safari 12.1+ tem IO; 12.0 e abaixo (<0.1% mercado 2026) requerem polyfill. Mitigation: Phase 7 a11y/compat audit cobre. |
| A8 | NARR-04 satisfeito por Tailwind breakpoints + CSS media queries (sem hook JS) | Mobile Choreography | Caso surja necessidade de motion conceitualmente distinta entre mobile/desktop (não só intensity), criar hook leve em Plan posterior. Documentar em SUMMARY se acontecer. |

**8 assumptions identified.** Decisões com risk se wrong = MEDIUM precisam confirmação explícita do Lenny no PR de planning (não no PR de copy — antes). Planner deve listar A1, A3, A4, A5, A6 no PR de plan-check pra Lenny aprovar a reinterpretação dos NARR-* antes de execução começar.

---

## Open Questions (RESOLVED)

1. **NARR-02 reinterpretation aceita?**
   - **RESOLVED:** D-15 (CONTEXT.md) confirms reinterpretation; ScrollScene + mockup expand removed from scope.
   - What we know: CONTEXT.md D-15 supersedes NARR-02. Bridge é statement puro, sem mockup expansion.
   - What's unclear: Se Lenny ler Phase 4 plan e quiser a versão NARR-02 (mockup expanding via ScrollScene), planner precisa retornar para discuss.
   - Recommendation: Plan-check inclui pergunta explícita "NARR-02 reinterpretado: a transição cinematográfica é a justaposição dark→light, não mockup expansion. Confirma?"

2. **NARR-03 reinterpretation aceita?**
   - **RESOLVED:** D-16/D-17/D-18 (CONTEXT.md) confirm 1 hero feature + 3 secundárias; Relatórios out of v1.
   - What we know: CONTEXT.md D-16 trava "1 hero + 3 secundárias", não sticky-stack de 4 pilares.
   - What's unclear: Se Lenny quer Relatórios visível em Phase 4 ou está OK em v1.1.
   - Recommendation: Plan-check pergunta "Relatórios fora de Product na Phase 4 — entra em v1.1?".

3. **Pain layout — constelação CSS-only é suficiente, ou Lenny prefere ilustração abstrata mais customizada?**
   - **RESOLVED:** Claude's discretion per D-04 (CONTEXT.md); PR includes screenshot before merge for validation.
   - What we know: Pattern HeroCard escalado para "fragmentação".
   - What's unclear: Subjetivo — só visual review confirma.
   - Recommendation: Plan de Pain inclui screenshot do mockup proposto no PR description antes de implementar; Lenny aprova o conceito antes do esforço.

4. **HowItWorks step linha conectora — gradient vertical ou linha sólida?**
   - **RESOLVED:** Plan 04-04 Task 2 specifies sólido `w-px bg-neutral-200` connector; Lenny refines via PR if gradient preferred.
   - What we know: D-21 fala "linha conectora vertical sutil". Esta research recomenda gradient.
   - What's unclear: Visual fit final.
   - Recommendation: implementar gradient default; Lenny ajusta no PR review.

5. **Plan 0 — necessário ou plans 1-5 inline o que precisarem?**
   - **RESOLVED:** Plan 04-00 exists as Wave 1 foundation (hook + glossary + coherence test + scaffolds).
   - What we know: Plan 0 consolidaria `useInView` hook + glossary.ts + invariant test factory + page.tsx initial scaffold (com placeholders das 5 sections).
   - What's unclear: Trade-off entre organização (Plan 0 dedicado) vs velocidade (inline em Plan 1).
   - Recommendation: **Plan 0 separate.** Reduz risco de Plans 1-5 cada um criar versão própria do hook ou tests scaffolding.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Dev + build | ✓ | ≥20 LTS (verified via Phase 1 setup) | — |
| Next.js | Build/runtime | ✓ | 15.5.18 | — |
| Vercel CLI (preview deploys) | Optional during Phase 4 dev | ✓ | (Phase 3 already used) | — |
| `@next/bundle-analyzer` | Bundle measurement (Plan 0 benchmark) | ✗ | — | `next build` + manual analysis OR add as devDep |
| Playwright MCP | Pipeline validation per `~/.claude/CLAUDE.md` | ✓ (assumed) | — | — |

**Missing dependencies with fallback:**
- `@next/bundle-analyzer` — not currently in devDependencies. Plan 0 should `npm install -D @next/bundle-analyzer` to enable measuring "Phase 4 bundle impact" gate.

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 (already configured — `tests/sections/hero-invariants.test.ts` runs green) |
| Config file | `vitest.config.ts` (assumed; Phase 3 has running tests) |
| Quick run command | `npm test -- tests/content/pain.test.ts` (single file) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NARR-01 | Pain section renders + cards present + headline visible | smoke + unit | `npm test tests/sections/pain-invariants.test.ts` | ❌ Wave 0 (Plan 0 / Plan 1 cria) |
| NARR-02 | Bridge section exists with statement structure | unit | `npm test tests/content/bridge.test.ts` | ❌ Wave 0 |
| NARR-03 | Product has 1 hero feature block + 3 secondary cards | unit | `npm test tests/sections/product-invariants.test.ts` | ❌ Wave 0 |
| NARR-04 | Mobile choreography uses Tailwind responsive classes (no duplicated component) | manual (visual via Playwright) | n/a | n/a |
| NARR-05 | Proof renders categories row, zero Dolce Home, zero fabricated numbers | unit | `npm test tests/content/proof.test.ts` | ❌ Wave 0 |
| NARR-06 | Zero `motion.*` JSX + zero `@/components/motion/` imports in sections | grep test | `npm test tests/sections/*-invariants.test.ts` | ❌ Wave 0 |
| NARR-07 | Mobile reflow tested in Playwright manual | manual | Playwright MCP | n/a |
| NARR-08 | Agente IA representation in Product hero feature mockup | manual (visual) | Playwright MCP | n/a |
| COPY-02 | Anti-IA banned phrases regex per section | unit | `npm test tests/content/*.test.ts` | ❌ Wave 0 |
| COPY-03 | "clínica" present in headline per section | unit | (in each `<section>.test.ts`) | ❌ Wave 0 |
| COPY-05 | Glossary file exists and is referenced | smoke | `npm test tests/content/glossary.test.ts` (optional) | ❌ Wave 0 (Plan 0 cria glossary) |
| COPY-06 | No fabricated numbers/testimonials in section copy | grep test | `npm test tests/content/proof.test.ts` (mainly) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- tests/content/<section>.test.ts tests/sections/<section>-invariants.test.ts` (rápido, ~2-3s).
- **Per wave merge:** `npm test` (full suite, including all Phase 1-3 tests still passing).
- **Phase gate:** Full suite green + Playwright MCP roteiro completo (scroll do topo até Proof, em desktop e mobile viewport) antes de `/gsd-verify-work`.

### Wave 0 Gaps

- [ ] `tests/sections/pain-invariants.test.ts` — covers NARR-01, NARR-06
- [ ] `tests/sections/bridge-invariants.test.ts` — covers NARR-02 (reinterpreted), NARR-06
- [ ] `tests/sections/product-invariants.test.ts` — covers NARR-03 (reinterpreted), NARR-06
- [ ] `tests/sections/how-it-works-invariants.test.ts` — covers NARR-04 (via class assertions), NARR-06
- [ ] `tests/sections/proof-invariants.test.ts` — covers NARR-05, COPY-06 (zero numbers grep), NARR-06, zero Dolce Home grep
- [ ] `tests/content/pain.test.ts` — shape + clínica + anti-IA + no Dolce Home
- [ ] `tests/content/bridge.test.ts` — shape + anti-IA + no Dolce Home
- [ ] `tests/content/product.test.ts` — shape (feature hero + 3 secundárias) + anti-IA + clínica in headline
- [ ] `tests/content/how-it-works.test.ts` — shape (4 steps) + anti-IA + clínica somewhere
- [ ] `tests/content/proof.test.ts` — shape + zero Dolce Home + zero fabricated numbers + anti-IA
- [ ] `tests/landing/coherence.test.ts` — page ordering + zero `<Image priority>`
- [ ] `src/hooks/use-in-view.ts` — IO hook (Plan 0)
- [ ] `src/content/glossary.ts` — glossary file (Plan 0)

---

## Security Domain

Phase 4 is presentational — sections are RSC + static client islands, no forms, no auth, no user input, no API calls, no sensitive data handling.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | (form is Phase 5) |
| V6 Cryptography | no | — |
| V14 Configuration | yes (minor) | No new env vars; existing `NEXT_PUBLIC_*` is for client analytics only |

### Known Threat Patterns for marketing landing pages

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via injected copy | Tampering | Copy is build-time TS literals — zero user input → not exploitable |
| Tracking pixel injection | Information Disclosure | Phase 4 doesn't add new pixels (Phase 6 owns) |
| Click-jacking on CTAs | Tampering | Phase 4 has no CTAs in sections (default) — N/A this phase; Phase 5 CTA covers in form section |

No security-specific work needed in Phase 4.

---

## Sources

### Primary (HIGH confidence — codebase grounded)
- `package.json` — stack versions [VERIFIED]
- `src/app/globals.css` — existing keyframes & tokens [VERIFIED]
- `src/sections/Hero/HeroCardStack.tsx` — pattern to extend [VERIFIED]
- `src/sections/Hero/HeroBackground.tsx` — atmosphere pattern [VERIFIED]
- `src/sections/Hero/index.tsx` — orchestrator pattern [VERIFIED]
- `src/sections/Hero/HeroCopy.tsx` — copy section RSC pattern [VERIFIED]
- `src/content/hero.ts` — copy module shape [VERIFIED]
- `src/components/layout/Header.tsx` — header pattern [VERIFIED]
- `src/components/ui/{container,headline,button}.tsx` — primitives [VERIFIED]
- `src/hooks/use-device-tier.ts` — pitfall A reference (motion import) [VERIFIED]
- `tests/sections/hero-invariants.test.ts` — invariant pattern to replicate [VERIFIED]
- `tests/content/hero.test.ts` — copy contract pattern to replicate [VERIFIED]
- `docs/copy-review.md` — D-17 cadence documented [VERIFIED]
- `.planning/phases/04-narrative-sections-pain-bridge-product-howitworks-proof/04-CONTEXT.md` — locked decisions [VERIFIED]
- `.planning/phases/03-hero-benchmarked-isolado/03-CONTEXT.md` — predecessor decisions [VERIFIED]
- `.planning/phases/03-hero-benchmarked-isolado/03-RESEARCH.md` — predecessor research [VERIFIED]
- `.planning/REQUIREMENTS.md` — full requirements + traceability [VERIFIED]
- `.planning/PROJECT.md` — brand, constraints, key decisions [VERIFIED]
- `.planning/STATE.md` — Dolce Home denied, motion removed from root [VERIFIED]

### Secondary (MEDIUM confidence — referência de mercado/design)
- [Motion bundle size docs](https://motion.dev/docs/react-reduce-bundle-size) — 8KB core, ~18KB com features, ~30-40KB com scroll APIs [CITED]
- [Best SaaS Landing Page Examples 2026 — Framiq Blog](https://framiq.app/blog/best-saas-landing-pages-2026) — observação sobre Linear/Stripe trends 2026
- [10 SaaS Landing Page Trends for 2026 — SaaSFrame Blog](https://www.saasframe.io/blog/10-saas-landing-page-trends-for-2026-with-real-examples) — "rather than uniform grid, visual hierarchy"
- [LogRocket — Comparing React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — bundle benchmarks
- [Linear's landing page] (https://linear.app/) — referência observada (sem citação por seção; estrutura editorial padrão)
- [Stripe's homepage](https://stripe.com/) — referência observada
- [Attio's homepage](https://attio.com/) — referência observada

### Tertiary (LOW confidence — interpretação de padrões)
- "Linear/Stripe/Attio fazem X" — observação de padrões em training data; não há citation por seção. Marcado como [ASSUMED] onde aplicável.

---

## Metadata

**Confidence breakdown:**
- User constraints capture (locked from CONTEXT.md): HIGH — verbatim copy
- Standard stack: HIGH — verified in package.json + Phase 3 patterns
- Architecture (folder structure, RSC/client split): HIGH — direct extension of Phase 3
- Motion strategy (CSS-only vs lib): HIGH technical / MEDIUM empirical (bundle numbers approximated)
- Per-section construction (Pain/Bridge/Product/HowItWorks/Proof): MEDIUM-HIGH — composition is design-derived from observed Linear/Stripe patterns + Hero pattern extension; needs visual iteration via PR review
- Mockup composition rules: HIGH — direct extension of HeroCardStack
- Test patterns: HIGH — literal replication of existing Phase 3 tests
- Copy cadence: HIGH — D-17 documented in docs/copy-review.md
- NARR-02/NARR-03/NARR-08 reinterpretations: MEDIUM — supersession by CONTEXT.md is sound, but requires Lenny confirmation in plan-check

**Research date:** 2026-05-18
**Valid until:** 2026-06-15 (4 weeks — Phase 3 patterns are stable; motion library landscape stable through 2026)

---

## RESEARCH COMPLETE
