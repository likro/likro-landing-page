# Phase 04: Narrative Sections (Pain → Bridge → Product → HowItWorks → Proof) — Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar 5 seções narrativas abaixo do Hero, na ordem **Pain → Bridge → Product → HowItWorks → Proof**, com:

- Copy editorial sofisticada por seção (3 variantes contrastantes seguindo D-17, todas em `src/content/<sec>.ts`)
- Mockups inline em código (cards CSS / SVG / composição visual — pattern HeroCardStack reaproveitado)
- Tom B2B premium "infraestrutura operacional", não "ferramenta SaaS"
- Vertical 100% clínica de estética/derma/harmonização
- Animações scroll-based discretas (à discrição do Claude — provavelmente CSS-only IntersectionObserver, evitar motion lib reentrar no bundle root salvo necessidade real)

**Não inclui (escopo de outras fases):**

- Formulário consultivo / CTA flutuante / Footer (→ Phase 5)
- Tracking de events por seção (→ Phase 6)
- SEO/OG/JSON-LD/sitemap finais (→ Phase 7)

</domain>

<decisions>
## Implementation Decisions

### Princípio guia (transversal a toda Phase 4)

- **D-01:** Tom geral é **"infraestrutura operacional premium"**, não "ferramenta SaaS". Linguagem reforça posicionamento de "sistema operacional da clínica" estabelecido no Hero (Phase 3).
- **D-02:** Cada seção mantém **identidade visual coesa** (mesma direção de arte) — mudança de atmosfera entre seções é permitida, mudança de identidade não. Tudo precisa parecer "a mesma empresa, o mesmo produto".
- **D-03:** Convenção `*_COPY_VARIANTS = { v1, v2, v3 }` com `export const X_COPY = X_COPY_VARIANTS.vN` (estabelecida D-17 Phase 3) é **reutilizada em cada seção**. PRs de copy review seção-por-seção via `docs/copy-review.md`.
- **D-04:** Animações: à **discrição do Claude** — preferir CSS-only IntersectionObserver inline; só re-introduzir motion lib local se entregar valor cinematográfico que CSS não consegue. Bundle root continua sem motion (regressão de TBT bloqueada).

### Ritmo visual da landing (sequência light/dark)

- **D-05:** Sequência atmosférica final:
  ```
  Hero          → DARK    blue-black cinematográfico   [Phase 3 ✓]
  Pain          → DARK    continua o peso, intensifica tensão
  Bridge        → LIGHT   transição abrupta proposital
  Product       → LIGHT   off-white premium, mais limpa da landing
  HowItWorks    → LIGHT   neutral suave, explicativo
  Proof         → DARK    denso, autoridade institucional
  ```
- **D-06:** Razão da sequência: arco emocional **peso → fricção → alívio → clareza → autoridade**. Hero dark vira "momento especial" porque é exceção, não regra. Bridge LIGHT cria sensação de "tem outro caminho" sem narração explícita.
- **D-07:** Transições entre seções são **mudanças de atmosfera, não de identidade** — mesmo brand, mesmo accent, mesma família tipográfica, mesma direção. Sem cortes bruscos de design system.
- **D-08:** Surface tokens reutilizam os já definidos em `globals.css` (`surface-darker`/`surface-dark` pra dark; `surface-light`/`surface-lighter`/`surface-card` pra light). Não criar novos tokens sem necessidade.

### Pain — direção de copy

- **D-09:** Ângulo: **fragmentação operacional sistêmica + 1 consequência humana concreta como reforço**. Não é "paciente perdido 😱" emocional puro; é "a operação inteira está espalhada e o paciente sente primeiro".
- **D-10:** Tom: editorial calmo, B2B sério, premium. Sem agressão tipo "você não gerencia, você apaga incêndio". Postura de autoridade calma, não confronto.
- **D-11:** Estrutura sugerida: enumeração de ferramentas separadas (WhatsApp / Instagram / agenda / planilha) + linha-síntese mostrando consequência humana ("Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro" ou similar).
- **D-12:** Headline da seção termina em afirmação, **não em pergunta**. Tom de constatação, não diagnóstico interrogativo.

### Bridge — direção de transição

- **D-13:** Formato: **statement editorial silencioso** — 1-2 linhas centradas, frase forte, sem promessa milagrosa. Estilo Linear/Stripe editorial.
- **D-14:** Conteúdo evita: "transforme sua clínica", "potencialize seu atendimento", "leve sua operação ao próximo nível" (COPY-02 anti-IA). Conteúdo afirmativo, contido, premium.
- **D-15:** Bridge é a primeira seção LIGHT da landing — transição abrupta proposital pra criar sensação de "alívio" após Pain dark. Composição minimalista: muito espaço em branco, tipografia centrada, sem cards/mockups.

### Product — hero feature + 3 secundárias

- **D-16:** Layout: **1 feature hero full-width + 3 features secundárias compactas em row** (estilo Stripe). NÃO grid 2x2 de features (mata percepção premium). NÃO scroll sticky Apple-style (overkill, gimmicky).
- **D-17:** Feature hero: **"Atendimento multicanal"** — a feature que vende a categoria. Mockup operacional vivo full-width, mostra a operação fluindo (não UI inteira; "momento de valor" estilo HeroCardStack ampliado).
- **D-18:** Features secundárias (3, em row):
  - **Distribuição automática** — roteamento de leads entre atendentes
  - **Follow-up e retorno** — não perder paciente que ficou de voltar
  - **Agenda operacional** — agendamento integrado, não isolado
- **D-19:** Apresentação das features como **"capacidades operacionais"**, não "lista de funcionalidades". Sem checklist (✓ CRM ✓ Automação ✓ WhatsApp...) — isso mata percepção premium imediato.
- **D-20:** Section Product é a **mais limpa visualmente da landing inteira**: surface off-white, muito espaço, tipografia editorial, mockup refinado, poucas cores. Define "isso parece software sério".

### HowItWorks — fluxo operacional

- **D-21:** Formato: **4 passos timeline vertical**. Cada passo: número grande à esquerda + headline curta + descrição 1-2 linhas + mini-mockup CSS à direita. Linha conectora vertical sutil entre passos.
- **D-22:** Os 4 passos seguem o fluxo real do lead na clínica:
  1. **Lead chega** (Instagram/Facebook/WhatsApp captação multicanal)
  2. **Operação distribui** (atribuição automática pro atendente certo)
  3. **Atendente conversa** (centralizado, com contexto, em tempo real)
  4. **Paciente agendado** (com retorno e follow-up automático)
- **D-23:** Tom da seção: **explicativo e simplificador**, NÃO competir visualmente com hero ou product. Surface light neutral. Mini-mockups discretos — só dão evidência, não roubam atenção.

### Proof — credibilidade institucional sem nomes

- **D-24:** Direção: **categorias verticais minimal + dark editorial**.
- **D-25:** Headline candidatos (Claude escolhe melhor variante na hora de gerar `proof.ts`):
  - "Em operação em clínicas que dependem de atendimento de alto volume."
  - "Infraestrutura operacional para clínicas de estética e dermatologia."
  - (Variantes adicionais geradas pra D-17 review)
- **D-26:** Categorias verticais em row: **Estética · Dermatologia · Harmonização Facial · Odontologia · Bem-estar**. Sem ícones forçados — pode ter ícones lucide sutis ou só texto separado por dot.
- **D-27:** **PROIBIDO** nesta seção (até receber autorização explícita):
  - Logos de cliente (sem autorização)
  - Números fabricados ("+500 clínicas", "+10mil leads")
  - Testimonials genéricos / quotes sem atribuição real
  - Badges, estrelinhas, "trusted by", "as seen in"
  - **Menção a Dolce Home** (autorização explicitamente negada pelo Lenny em 2026-05-18 — ver STATE.md)
- **D-28:** Tom: institucional silencioso, não marketing. Mais "essa infraestrutura já está sendo usada" do que "olha quantos clientes temos". O silêncio visual vale mais que exagero.

### Claude's Discretion

- Tipografia fina (sizes exatos, line-heights, letter-spacing) seguindo padrão da Phase 3
- Spacing vertical entre seções (provavelmente py-24 lg:py-32, ajustar à arte)
- Container widths por seção (Product pode ser max-w-6xl pra dar mais ar, Bridge pode ser max-w-3xl centrado pra ênfase)
- Animações: CSS-only IntersectionObserver inline. Motion lib só se Claude argumentar necessidade real.
- Acentos roxos `#7C3AED`: apenas em micro-elementos (números do HowItWorks step, dot indicators, ícones ativos) — nunca como protagonista
- Micro-card animations (live pulse, status icons) — replicar pattern HeroCardStack onde aplicável
- Skip CTA WhatsApp dentro das 5 seções? — pendência de decisão. Default: 0 CTAs dentro das seções narrativas; CTA Final vem na Phase 5. Se Phase 4 precisar CTA intermediário (ex: depois do Pain), Claude decide caso a caso.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase docs e decisões anteriores

- `.planning/PROJECT.md` — vision Likro, brand book, constraints, posicionamento "operação comercial moderna pra clínicas"
- `.planning/REQUIREMENTS.md` — 99 requirements v1 com traceability (Phase 4 cobre PAIN-01..05, BRIDGE-01..02, PROD-01..08, HOW-01..06, PROOF-01..04 ou equivalentes — confirmar no roadmap)
- `.planning/ROADMAP.md` — Phase 4 entry com goals + req IDs
- `.planning/STATE.md` — incluindo decisão "Dolce Home NÃO autorizado (2026-05-18)" e copy convention estabelecida Phase 3
- `.planning/phases/03-hero-benchmarked-isolado/03-CONTEXT.md` — D-01..D-19 do Hero (brand, copy convention, glow rules, light/dark surface tokens, accent rules, mockup pattern)
- `.planning/phases/03-hero-benchmarked-isolado/03-RESEARCH.md` — patterns de Linear/Stripe/Attio que aplicam aqui também
- `.planning/phases/03-hero-benchmarked-isolado/03-UI-SPEC.md` — design contract das primitivas (Container, Headline, Button, Cards) reaproveitadas

### Code patterns reutilizáveis

- `src/sections/Hero/HeroCardStack.tsx` — pattern de cards CSS isolados com depth/rotation/float animation
- `src/sections/Hero/HeroCopy.tsx` — pattern de copy section RSC (headline + sub + CTAs + trust)
- `src/content/hero.ts` — pattern de COPY module com type + 3 variantes contrastantes
- `src/components/ui/headline.tsx` — Headline primitive (sizes hero/section/sub)
- `src/components/ui/container.tsx` — Container max-w-7xl com padding responsivo
- `src/components/ui/whatsapp-cta.tsx` — WhatsAppCta com analytics integrado
- `src/app/globals.css` — surface tokens, keyframes premium (`hero-headline-reveal`, `hero-card-rise`, `hero-card-float-*`, `hero-live-pulse`, `hero-haze-drift`)
- `tests/sections/hero-invariants.test.ts` — invariants grep test pattern (replicar pra cada seção: zero motion.* JSX, zero vh, zero PT-BR hardcoded em JSX, zero buzzwords anti-IA)
- `tests/content/hero.test.ts` — pattern de teste de copy contracts (clínica em h1+sub, anti-IA, sem Dolce Home, shape do tipo, etc)

### Convenções operacionais

- `docs/copy-review.md` — cadência D-17 async via PR de copy review (3 variantes per section, Lenny aprova via `LGTM vN` comment ou edit inline)
- `.github/PULL_REQUEST_TEMPLATE.md` — template com bloco "Copy review" obrigatório quando PR toca `src/content/*.ts`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **HeroCardStack pattern** — cards CSS com depth (3 cards em camadas, rotação sutil, animation float lento). Provavelmente aplicado em Product hero feature e HowItWorks mini-mockups.
- **HeroBackground pattern** — gradients em camadas + grid sutil + vinheta. Pode ser adaptado pra seções dark (Pain, Proof).
- **Headline primitive** — sizes hero/section/sub já calibrados — usar `size="section"` pras h2 das seções narrativas.
- **WhatsAppCta** — disponível mas Phase 4 default sem CTAs intermediários (D-29).

### Established Patterns

- **Copy storage:** todo string em `src/content/<sec>.ts`, jamais hard-coded em JSX (COPY-01 grep test cubre isso por seção).
- **Type-safe variants:** `export const X_COPY_VARIANTS = { v1, v2, v3 } satisfies Record<string, XCopy>` + `export const X_COPY = X_COPY_VARIANTS.v1` (provisional).
- **Bridge anti-IA:** todo copy file passa pelo grep regex `/desbloqueie|potencialize|transforme sua|próximo nível|.../i` — automated CI check.
- **Animations:** CSS-only no `globals.css` com prefixo `hero-` — Phase 4 pode adicionar prefixo `section-` ou específico por seção (`pain-`, `product-`, etc) com mesma estratégia (transform+opacity, GPU-friendly, reduced-motion respeitado).
- **Mockups:** Composição de divs CSS com Tailwind, lucide-react icons, shadow em camadas, border duplo (outer + inset ring). Sem `next/image` salvo absoluta necessidade (Hero não tem mais `priority` Image — LCP é H1 texto SSR).

### Integration Points

- **`src/app/page.tsx`** — adicionar import + render das 5 seções abaixo de `<Hero />`. Estrutura provável:
  ```tsx
  <main>
    <Hero />
    <Pain />
    <Bridge />
    <Product />
    <HowItWorks />
    <Proof />
  </main>
  ```
- **Cada seção em `src/sections/<Name>/index.tsx`** seguindo pattern Hero — orchestrator RSC + componentes filhos isolados.
- **Cada conteúdo em `src/content/<name>.ts`** — pain.ts, bridge.ts, product.ts, how-it-works.ts, proof.ts.
- **Cada section pode ter mini-mockup CSS — componentes filhos** (ex: `src/sections/Product/HeroFeatureMockup.tsx`, `src/sections/HowItWorks/StepCard.tsx`).
- **globals.css** — adicionar keyframes específicos se animations exigirem (escopadas por seção: `pain-reveal`, `product-feature-float`, etc).
- **tests/content/<name>.test.ts** + **tests/sections/<name>-invariants.test.ts** — replicar pattern do Hero pra cada seção.

</code_context>

<specifics>
## Specific Ideas (referências e "quero como X" do Lenny)

- **Referências visuais explícitas:** Stripe, Linear, Attio, Notion (B2B editorial premium). NÃO Apple sticky scroll (overkill). NÃO grid SaaS template.
- **"A Product section provavelmente vai definir se isso parece software sério ou landing de startup"** — pressão alta no acabamento dessa seção específica.
- **"O silêncio visual vale mais que exagero"** — princípio pro Proof especificamente, mas aplicável a todas seções dark.
- **Headline da Pain — preferência:** afirmação tipo *"Sua operação está espalhada"*, NÃO acusação tipo *"Você está falhando"*. Tom de constatação calma.
- **Bridge** — exemplo de frase no estilo desejado: *"Existe um jeito de operar isso sem rodar 4 apps abertos. Sem perder lead. Sem mandar a equipe procurar onde está a conversa."*
- **Pain — exemplo de phrasing forte:** *"Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro."*
- **Product hero feature mockup** — replicar densidade de info do HeroCardStack mas maior (single mockup full-width vez de 3 cards em camadas). Mostrar operação acontecendo (lead chegando + sendo atribuído + atendente respondendo).
- **HowItWorks** — passos têm que parecer **o fluxo real**, não 4 features rebranded. Cada passo é uma fase temporal da jornada do lead.
- **Proof** — categorias podem ter ícones lucide MUITO sutis ou só ser texto separado por `·` (depende do equilíbrio visual final).

</specifics>

<deferred>
## Deferred Ideas (escopo de outras fases ou v1.1)

- **CTAs intermediários WhatsApp dentro das seções narrativas** — default Phase 4 é zero CTAs intermediários (CTA final fica Phase 5). Se A/B test futuro mostrar necessidade, adicionar 1 CTA depois do Pain (não antes de Product) em v1.1.
- **Quote anônimo de cliente real (Proof)** — quando Lenny tiver quote real anonimizado autorizado, virar opção pra v1.1 do Proof.
- **Logo strip real de clientes** — depende de autorizações futuras (Dolce Home + outras). Hoje proibido.
- **Stats operacionais reais** — quando produto Likro tiver dados defensáveis (X mensagens/mês, equipes ativas, etc), considerar reintroduzir no Proof v1.x.
- **Scroll-scrubbed animations sofisticadas (motion + GSAP)** — out of scope v1. Motion lib local em seções é admitido, mas storytelling scroll-scrub fica futuro.
- **Dark mode toggle / light mode total** — landing é fixa na sequência D-05; toggle é v2+.
- **Variantes regionais de copy (SP/RJ/sul)** — out of scope v1, copy é PT-BR genérica.

</deferred>

---

*Phase: 04-narrative-sections-pain-bridge-product-howitworks-proof*
*Context gathered: 2026-05-18*
