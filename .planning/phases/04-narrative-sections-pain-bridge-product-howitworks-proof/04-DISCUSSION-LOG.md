# Phase 04: Narrative Sections — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 04-narrative-sections-pain-bridge-product-howitworks-proof
**Areas discussed:** Ritmo visual da landing, Direção de copy das 5 seções (Pain, Bridge, Product, HowItWorks, Proof)
**Mode:** Interactive (não-auto), text mode disabled

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Direção de copy das 5 seções | Para cada uma (Pain/Bridge/Product/HowItWorks/Proof): gancho de dor concreto, ângulo do produto, exemplos vs abstrato, tom. Inclui Proof sem Dolce Home. | ✓ |
| Visual dos mockups inline (Product + HowItWorks) | As 2 seções mais visuais. Pattern HeroCardStack ou outras direções. | |
| Animações scroll-based (motion lib ou CSS-only?) | Motion lib reveal-on-scroll vs CSS-only IntersectionObserver inline. | |
| Ritmo visual — alternation light/dark ou tudo dark? | (a) Tudo dark; (b) alternation; (c) gradient decrescente. | ✓ |

**Notes:** Lenny optou por discutir apenas 2 das 4 áreas. Mockups e animações ficam à discrição do Claude (Claude's Discretion em D-04 e dentro de cada seção). Decisão eficiente — esses 2 itens são tactical, não estratégicos.

---

## Área 1: Ritmo visual da landing

### Pergunta inicial: Qual ritmo visual pras 5 seções narrativas?

| Option | Description | Selected |
|--------|-------------|----------|
| Tudo dark editorial | 5 seções dark coesas, premium B2B sério estilo Linear/Vercel | |
| Alternation dark→light→dark→light→dark | Cada seção alterna fundo, respiro estilo Stripe/Notion | |
| Tudo dark + 1 única seção light de destaque | Máximo destaque pra Product/Proof | |
| Gradient decrescente (escuro → menos escuro) | Mais sofisticado, requer execução cuidadosa | |
| **Other (free-text)** | **Mistura 1+2, muito mais perto da 2.** | ✓ |

**User's choice (free-text, integral):**
> Pra mim a melhor direção é uma mistura entre 1 e 2, mas MUITO mais próxima da 2. Não faria landing inteira dark. Acho que isso vai deixar pesado, cansativo, "AI startup" demais, sem respiro, visualmente monótono. Mas também não quero alternância exagerada tipo template SaaS.
>
> A direção que eu faria: Hero dark premium cinematográfico. Esse é o momento "statement". Depois disso, respiro. Product section: surface clara/off-white premium, muito espaço, cards limpos, sensação de software editorial. How it works: light neutral, fluxo operacional, mais explicativo. Proof/social: volta pro dark elegante, mais denso, mais confiança, mais "empresa séria". CTA final: ou clean premium estilo Notion ou dark cinematográfico minimalista.
>
> Quero que o scroll tenha sensação de progressão, ritmo, respiração, narrativa. Não quero: dark infinito, glow infinito, gradiente infinito. A landing precisa parecer "infraestrutura operacional premium" e não "startup AI tentando parecer futurista". Os momentos light vão fazer os cards/mockups parecerem MUITO mais premium. Hoje o hero dark funciona justamente porque ele vira exceção, não regra.
>
> Mais Stripe/Linear editorial. Menos "SaaS dark template".

### Pergunta confirmatória: Essa sequência faz sentido?

Proposta de Claude: Hero DARK → Pain DARK → Bridge LIGHT → Product LIGHT off-white → HowItWorks LIGHT neutral → Proof DARK.

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, exatamente isso | Locked com essa sequência | ✓ |
| Sim, mas Pain deveria ser light | Tom mais documentário menos emocional | |
| Sim, mas Bridge mantém dark | Rampa menos abrupta | |

**User's choice:** "Sim. Exatamente essa sequência."

**Notes (integral do user):**
> Essa estrutura tem cara de landing premium de produto real. Ela cria peso, narrativa, respiro, progressão, autoridade. E principalmente: não deixa a experiência visual cansativa. O arco emocional está MUITO correto: peso → fricção → alívio → clareza → autoridade. Isso é bem mais sofisticado que "hero bonito + várias sections iguais".
>
> Hero DARK cinematográfico: momento de statement, infraestrutura, sistema operacional, produto sério.
> Pain DARK: mantém tensão emocional, caos operacional, paciente perdido, retrabalho, atendimento espalhado.
> Bridge LIGHT fica MUITO mais forte emocionalmente — "ok, existe uma saída". Essa transição evita monotonia, dark infinito, sensação opressiva.
> Product OFF-WHITE: provavelmente a seção mais premium da landing inteira, parece mais sofisticado, editorial, aumenta percepção de clareza, deixa os mocks brilharem.
> HowItWorks LIGHT neutral: explica, simplifica, respira, não compete visualmente com o hero.
> Proof DARK: devolve peso, autoridade, sensação de fechamento forte. Muito mais "empresa séria" do que deixar tudo claro.
>
> Principio importante: **não exagerar nas transições** — quero mudança de atmosfera, não mudança brusca de identidade. Tudo ainda precisa parecer o mesmo produto, a mesma empresa, a mesma direção de arte.
> Essa estrutura vai fazer o hero parecer MUITO mais premium — porque o dark cinematográfico vira um momento especial, não um padrão repetido.

---

## Área 2: Copy direction — Pain + Bridge

### Pergunta: Pain — qual ângulo de dor?

| Option | Description | Selected |
|--------|-------------|----------|
| Operacional — perda concreta de paciente | "Paciente que entrou no DM, ninguém respondeu..." Mais concreto, alta conversão Meta Ads. | |
| Sistêmico — caos das ferramentas | "WhatsApp pra atender, Instagram pra captar..." Mais B2B sério, problema arquitetônico. | |
| Provocativo — "você não gerencia, apaga incêndio" | Confronto direto, Stripe-style desafio. | |
| **Other (free-text)** | **Mistura 1+2 muito mais perto de 2. Fragmentação operacional + consequências humanas concretas como reforço.** | ✓ |

**User's choice (integral):**
> Pra mim o caminho mais forte é uma mistura entre 1 e 2, mas MUITO mais próximo do 2. Não acho que a landing inteira deva girar em "paciente perdido 😱". Isso converte anúncio, mas numa homepage premium pode deixar a marca emocional demais, agressiva demais, parecendo operação improvisada. O posicionamento "sistema operacional da clínica" é mais sofisticado.
>
> Então eu faria: Pain = dor sistêmica / fragmentação operacional, mas sem ficar frio demais. WhatsApp pra atender, Instagram/Facebook pra captar, agenda separada, retornos espalhados, atendimento dependendo de memória humana. O problema não é "um atendente esqueceu" — é que a operação inteira é fragmentada. Isso eleva MUITO a percepção do produto. Porque aí a Likro deixa de parecer ferramenta/CRM/automação e começa a parecer infraestrutura operacional / camada central / sistema crítico.
>
> Eu usaria a dor concreta de paciente perdido apenas como consequência emocional do problema estrutural. Ex: "Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro." Isso é MUITO mais forte porque mantém empatia, mantém peso emocional, mas continua B2B premium.
>
> Opção 3 (você não gerencia) tem energia boa mas é agressiva demais. Parece manifesto / LinkedIn post / Stripe challenge. A homepage principal precisa de mais clareza, menos confronto, mais autoridade calma.
>
> **Mais "sua operação está espalhada", menos "você está falhando".**

### Pergunta: Bridge — como fazer a transição?

| Option | Description | Selected |
|--------|-------------|----------|
| Statement editorial silencioso | 1-2 linhas centradas, frase forte sem promessa milagrosa. Estilo Linear/Stripe. | ✓ |
| Antes/Depois visual | Print abstrato comparativo lado a lado. | |
| Pergunta retórica forte | "E se cada lead..." provoca projeção. | |

**User's choice:** "Statement editorial silencioso"

---

## Área 3: Copy direction — Product + HowItWorks

### Pergunta: Product — como apresentar as features?

| Option | Description | Selected |
|--------|-------------|----------|
| 4 features em grid 2x2 (Linear Features) | Compacto, scannable. | |
| 1 feature hero + 3 secundárias (Stripe) | Hierarquia, narrativa, foco. | ✓ |
| 3 features em scroll vertical com mockup sticky (Apple) | Cinema premium, scroll longo. | |

**User's choice:** "1 feature hero + 3 secundárias"

**Notes (integral):**
> A direção mais forte é claramente a 2 — 1 hero feature + 3 secundárias. Porque ela cria hierarquia, narrativa, foco, percepção premium. O grid 2x2 corre MUITO risco de virar "features section de SaaS" — muito previsível, muito template, muito "cards explicando features". A opção 3 (Apple sticky) é overkill pro estágio atual — risco de exagerar no motion, gimmicky, aumentar complexidade. A landing está ficando forte porque está contida, editorial, confiante — não porque está fazendo malabarismo visual.
>
> Eu faria:
> - **Feature principal: "Atendimento multicanal"** — grande, full-width, mockup operacional vivo, sensação de "toda a operação passa daqui". Essa é a feature que vende a categoria.
> - **Abaixo: 3 features secundárias compactas** — Distribuição automática, Follow-up e retorno, Agenda operacional. Copy curta, tom editorial, mini mocks, pouco texto, muito espaço.
>
> A sensação deve ser "produto maduro", não "lista de funcionalidades".
>
> **MUITO importante:** não quero section tipo:
> ✓ CRM ✓ Automação ✓ WhatsApp ✓ Pipeline ✓ Dashboard
> Isso mata imediatamente a percepção premium. As features precisam ser apresentadas como **capacidades operacionais**.
>
> Mais "a operação flui", menos "temos funcionalidade X".
>
> Visualmente: Product section provavelmente a mais limpa da landing inteira. Muito espaço, surface off-white, tipografia editorial, mockup refinado, poucas cores, muito controle visual. Essa seção vai definir "isso parece software sério" ou "isso parece landing de startup".
>
> hero feature cinematográfica + 3 capabilities menores supporting the core narrative. Mais Stripe, menos "feature grid de SaaS".

### Pergunta: HowItWorks — formato do fluxo?

| Option | Description | Selected |
|--------|-------------|----------|
| 4 passos timeline vertical | Linear/Stripe-style. | ✓ |
| 3 passos horizontal cards | Simples, scannable, mobile vertical. | |
| 1 mockup grande com overlays explicativos | Tour de produto. | |

**User's choice:** "4 passos timeline vertical"

---

## Área 4: Copy direction — Proof (sem Dolce Home)

### Pergunta: Como mostrar credibilidade no Proof sem Dolce Home?

| Option | Description | Selected |
|--------|-------------|----------|
| Categorias verticais minimal | Editorial silencioso, sem inventar nada. | ✓ |
| 1 quote anônimo destacado + categorias | Mais humano editorial. | |
| Stats operacionais sem nomes (se tiver dados reais) | Só se dados defensáveis. | |
| Minimal — 1 statement institucional só | Máximo editorial, risco de abstrato. | |

**User's choice:** "Categorias verticais minimal"

**Notes (integral):**
> A direção mais forte é a 1 — categorias verticais minimal. Mantém sofisticação, honestidade, autoridade, sensação institucional. E principalmente não força prova fake cedo demais.
>
> Opção 2 (quote anônimo) tem MUITO risco de parecer inventado/genérico/"startup fabricando social proof", especialmente sem nome/logo real.
> Opção 3 (stats) só funciona se os números forem reais/defensáveis/sólidos. Senão vira "+10 mil leads" e mata credibilidade premium.
> Opção 4 (statement puro) é elegante mas talvez abstrata demais pro estágio atual.
>
> Então eu faria: Proof dark elegante. Muito editorial, muito contido.
> Headline curta tipo: "Em operação em clínicas que dependem de atendimento de alto volume." ou "Infraestrutura operacional para clínicas de estética e dermatologia."
> Abaixo: categorias verticais em row. Ex: Estética · Dermatologia · Harmonização Facial · Odontologia · Bem-estar
>
> Sem: logos fake, números inventados, badges, estrelinhas, testimonials genéricos.
>
> A força aqui deve vir de: especificidade, tom, contenção, maturidade. Porque a landing inteira está caminhando pra "empresa séria e produto premium", não pra "startup tentando provar desesperadamente que é grande".
>
> Essa seção precisa parecer **institucional**, não marketing.
> Mais "essa infraestrutura já está sendo usada", menos "olha quantos clientes temos".
> **O silêncio visual aqui vai valer MUITO mais que exagero.**

---

## Claude's Discretion

Áreas onde o Lenny não pediu discussão (Claude decide):

- **Visual mockups Product + HowItWorks** — pattern HeroCardStack reutilizado (cards CSS isolados) ampliado pro Product hero feature, replicado em escala menor pros 3 features secundárias e pra cada step do HowItWorks. Stripe-style refinado, sem gimmicks.
- **Animações scroll-based** — CSS-only com IntersectionObserver inline + keyframes em `globals.css` específicas por seção. Motion lib NÃO retorna ao bundle root salvo argumento técnico forte (que Claude ainda não tem).
- **CTAs intermediários WhatsApp dentro das seções** — default zero. CTA final é Phase 5.
- **Spacing vertical** entre seções: alinhado com hierarquia visual (mais espaço antes de mudança de atmosfera dark↔light).
- **Container widths por seção** — Hero/Pain/Proof usam max-w-7xl. Bridge usa max-w-3xl (frase centrada com ênfase). Product e HowItWorks ajustam à necessidade do mockup (provavelmente max-w-6xl pro Product hero feature, max-w-5xl pro HowItWorks timeline).
- **Acentos roxos #7C3AED** — apenas em micro-elementos (números dos steps, dot indicators, ícones ativos), nunca como fundo grande.

---

## Deferred Ideas

(Lenny não levantou ideias fora de escopo durante essa discussion. Ideias fora de Phase 4 que vieram à mente do Claude e ficam documentadas em `<deferred>` do CONTEXT.md:)

- CTAs intermediários WhatsApp (default fora pra v1)
- Quote anônimo de cliente real (depende de quote real autorizado pelo Lenny)
- Logo strip real de clientes (depende de autorizações)
- Stats operacionais reais (depende do produto ter dados defensáveis)
- Scroll-scrubbed animations sofisticadas com motion+GSAP (out of scope v1)
- Dark mode toggle / light mode total da landing (v2+)
- Variantes regionais de copy (v2+)
