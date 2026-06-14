# Pesquisa de Direção — Hero Premium Likro v2 ("Travessia")

> Documento de **direção criativa/experiência**, não de implementação. Sintetiza 5 frentes de pesquisa em paralelo (teardown da Cairn no código rodando; SaaS premium Linear/Vercel/Raycast/Stripe; espacialidade Apple Vision Pro/Arc/Pitch; mineração Relume/Awwwards; catálogo técnico no-WebGL + ciência da percepção). Lentes aplicadas: Taste, Huashu, UI/UX Pro Max, Impeccable, Frontend Design.
>
> **Contrato que esta pesquisa serve** (ver PROJECT.md › Current Milestone): `caos → jornada → ordem`; deslocamento percebido tão importante quanto a transformação; chegada conquistada; uma matéria só; testes dos 5 quadros + retrospecto. Não-objetivo: efeito impressionante como fim.

---

## 0. As 4 sensações, decodificadas (a espinha de percepção)

Antes de qualquer referência: o cérebro lê essas sensações a partir de **pistas específicas**. Gastar pixel/CPU nas pistas fortes primeiro.

**Deslocamento (sentir que avanço)** = *optic flow*: quando você anda pra frente em linha reta, o mundo **se expande radialmente a partir de um ponto fixo** (seu rumo — o "Foco de Expansão"). Partículas crescem e deslizam pra fora, mais rápido na periferia, e o centro fica quieto. É **a** assinatura de "estou entrando no espaço". Risco: é também a pista que mais dá enjoo → manter o Foco de Expansão **central e estável**, acoplar ao scroll (nunca autoplay), limitar velocidade. (Apple usa "scale-through" — coisas crescem e saem pelas bordas = você passou por elas.)

**Profundidade** = ranking de pistas, da mais forte à mais fraca: **oclusão** (perto cobre longe — a mais forte e inequívoca) › **parallax de movimento** (perto se move mais que longe) › **tamanho relativo** (menor = mais longe) › **perspectiva atmosférica** (longe = menos contraste, dessaturado, fundido no escuro, mais mole) › densidade/textura › blur › sombra. As três primeiras são quase de graça em Canvas 2D (ordem de desenho + escala). A atmosférica é o que faz parecer **premium e fundo**, não um campo de estrelas chapado.

**Travessia (uma jornada, não um loop)** = câmera **presa** (pinned/sticky) + estado **scrubbed** pelo scroll + **continuidade de matéria**. Prender o palco **re-atribui o movimento da página para o espaço**: o frame não rola embora, então o cérebro para de ler "a página subiu" e passa a ler "o mundo dentro do frame se move / eu me movo por ele". Sem prender, é decoração parallax; com prender, é uma câmera segurando uma cena.

**Descoberta contínua** = **revelar uma ideia por viewport** com retenção (Arc: esconde → revela → resolve), **drift orgânico** que nunca repete exato (ruído simplex/curl), e **deriva tonal** (frio→quente) que marca avanço no tempo, então você nunca sente que voltou ao início.

---

## 1. Padrões recorrentes (o que os melhores compartilham)

1. **Um palco segurado, não vários efeitos pequenos.** Apple, Linear, Terminal Industries: prendem um frame e deixam o scroll dirigir a mudança *dentro* dele. Travessia = transformação dentro de um viewport segurado, não um desfile de fade-ups. (= a sua restrição "uma matéria só, não coleção de efeitos".)
2. **Atmosfera acima de objetos.** Stripe/Vercel/Linear: o premium vem de **luz/gradiente/profundidade mudando devagar no fundo**, não de animação ocupada no primeiro plano.
3. **Luz, não decoração.** Brilho tratado como **emissor numa sala escura**: uma fonte de luz implícita, direcional, esparsa; sombras tingidas (nunca preto puro); bordas caindo pro escuro. Nunca gradiente-como-papel-de-parede.
4. **Neutros perceptualmente uniformes.** Linear reconstruiu o tema em **LCH** pra que cada cinza/escuro tenha o mesmo "peso de luz". É o que separa "dark premium" de "dark barrento". Quase todo clone falha aqui.
5. **Escassez de acento = confiança.** O acento ocupa uma fração mínima dos pixels. (Casa direto com o brand-lock: roxo `#7C3AED` só destaque — a escassez é o **payoff**, não o papel de parede.)
6. **Espaço negativo como sinal de status.** Margens largas dizem "o produto importa mais que o imóvel". Uma ideia por viewport.
7. **Movimento que significa algo.** Raycast (revelação sequencial) e Stripe (warp lento) *comunicam* (montagem / vida líquida). Nada se move só pra se mexer.
8. **Pacing lento e confiante = luxo.** Cartier e Apple parecem caros porque são **sem pressa** — um sujeito por vez, distância de scroll generosa por beat.
9. **O usuário dirige o movimento.** O scroll *scrubba* a sequência → movimento 1:1 com a ação do usuário. Essa autoria é o que faz parecer *viajar*, não *assistir*.

---

## 2. O que faz a Cairn funcionar (teardown corrigido)

**Correção de premissa (lido do código rodando, não do vídeo):** a Cairn **não** tem um mundo 3D contínuo que se transforma floresta→montanha→campo como um espaço viajado. São **fotos full-bleed discretas, uma por seção**, costuradas por **continuidade de cor/atmosfera + sequenciamento editorial + um grain/veil global**. O "atravessei um ambiente" é uma **ilusão curatorial (montagem / efeito Kuleshov)** — a travessia acontece **no corte entre as imagens**, não dentro de uma cena animada. (Stack real: GSAP+ScrollTrigger+Lenis, 1 canvas WebGL só no hero pra um efeito de lente cosmético.)

Por que funciona, em ordem de contribuição:
1. **Sequenciamento editorial com um "operador de câmera" consistente** — toda imagem é na altura dos olhos, no nível do chão, "você está dentro dela". O cérebro preenche o gap entre fotos como *distância percorrida*.
2. **Continuidade tonal entre cortes** — a temperatura deriva suave (luz fria do amanhecer → verdes → outono quente → crepúsculo frio → névoa), então as transições viram *progressão de tempo/lugar*, não slideshow. Um **grain + veil fixos globais** unificam tudo sob um "filme" só.
3. **Parallax de avanço dentro de cada imagem** — a imagem é levemente oversized (`scale 1.16`) e desliza contra a moldura no scroll (6–9%). Converte "uma foto" em "um lugar por onde passo".
4. **O hero te entrega pro movimento** — o gesto definidor: a imagem do hero é empurrada **pra baixo/trás** (`+16%`) enquanto a headline **sobe e dissolve** (`-12%`, opacidade→0.3). Você não rola *pela* hero, você rola *pra fora das costas dela*. Esse **vetor oposto** seta o frame "agora estou avançando".
5. **A copy é isomórfica ao vetor visual** — o arco emocional da copy (alto/ansioso → quieto/resolvido) conta a *mesma* história que a imagem (inquietação do amanhecer → calma da manhã). Coerência copy↔visual é o que faz parecer premium — não a animação. (E "cairn" = pilha de pedras que marca trilha na névoa: a metáfora *é* o nome.)

**Resumo honesto:** atravessar = montagem + continuidade tonal + grain unificador + parallax gentil. **Nenhum espaço 3D existe.** O princípio transferível: a sensação de jornada é **arquitetura emocional + continuidade**, não um mundo renderizado.

---

## 3. O que NÃO devemos copiar

- **Fotografia literal (florestas/natureza) como ambiente.** Só funciona na Cairn porque o produto se chama "Cairn". Pra um CRM de clínica não há licença metafórica — leria como genérico/banco-de-imagem, e o brand book pede ilustração tech abstrata. **Maior armadilha.**
- **O "look de IA generativa".** Imagens perfeitas-demais/uncanny são exatamente o que o CLAUDE.md proíbe ("sem cara de IA"). Pra uma clínica que precisa parecer real/em-uso, isso é o oposto de credibilidade.
- **O prisma estilo Vercel** (near-black uniforme + bloom azul→roxo→magenta). É **o tell de SaaS premium mais clonado de 2024–2026**. Copiar = parecer template de AI-startup. Roxo fica escasso, **não** vira gradiente de hero.
- **Mesh-gradient genérico de papel de parede** (blob arco-íris atrás de texto centralizado) → lê "template Webflow".
- **Glow em tudo / neon everything.** Glow só funciona *esparso e com fonte*. Brilhar toda borda/card é tell.
- **Gimmicks:** lente RGB/aberração cromática no hero, cursores custom (coração/blob), kinetic type maximalista como identidade inteira, vídeo de fundo autoplay no mobile (mata LCP), **scroll-snap/scrolljacking** que sequestra o `wheel` (briga com Lenis, enjoa, quebra a travessia contínua).
- **3D dirigível/gamey/WebGL pesado** (Bruno Simon, configuradores). Destrói credibilidade B2B e o mobile.
- **Parallax acima de ~0.7×** (limiar de náusea) e **`ctx.filter`/`shadowBlur` por frame** (mata fps mobile).
- **Deixar uma jornada bonita virar desculpa pra copy/argumento fraco** (a Cairn se safa com copy fina porque a imagem carrega; Likro precisa do *conteúdo* avançar também — mas isso é pós-Hero).

---

## 4. Deslocamento sem WebGL

A peça que faltava, e é 100% viável no nosso stack:

1. **Câmera presa (a fundação).** Palco `sticky top:0` dentro de um spacer alto (~300–360vh). Motion `useScroll({target, offset:['start start','end end']})` → `progress` 0→1. O canvas lê `progress.get()` no **próprio RAF** (sem React state). Prender re-atribui o movimento do scroll pro espaço — **sem isso, tudo vira decoração**.
2. **Optic flow = avanço.** No Canvas 2D, dê a cada partícula um `z`; projete `escala = focal/(focal+z)`, `tamanho ∝ escala`, posição a partir de um **Foco de Expansão central e estável**. Conforme o scroll avança, **diminua `z`** → as partículas se expandem radialmente pra fora e crescem = "estou entrando". Recicle partículas que passam a câmera (voltam ao fundo, pequenas/dim) = travessia sem fim sem custo de spawn.
3. **Scale-through (Apple).** Deixe as partículas mais próximas crescerem e **saírem pelas bordas** do viewport (não pararem nelas) = "passei por elas", não "objeto deu zoom".
4. **Streaming periférico calmo no centro.** Movimento rápido nas bordas, centro (perto do Foco) quieto → vende self-motion **e** é mais seguro contra enjoo (~20% menos).
5. **Hero exit de vetores opostos (Cairn).** O fundo/campo recua enquanto a headline sobe + dissolve no primeiro scroll → o gesto de "entrada na travessia". Mais alto ROI, zero canvas (Motion `useTransform` em `y`/`opacity`).

**Segurança vestibular (mobile é sagrado):** Foco de Expansão fixo e central; fluxo acoplado ao scroll (nunca autoplay); teto de velocidade (~25–35% do viewport por ~100ms de scroll); nunca expansão + rotação + pan simultâneos. Lenis (inércia) faz o fluxo parecer "deslizar", não "cair".

---

## 5. Profundidade sem parallax clichê

Parallax sozinho = "mais um site com parallax". Profundidade de verdade vem do empilhamento de pistas, **lideradas pela oclusão**:

1. **Oclusão por ordem de desenho** (a pista mais forte, e de graça): desenhe **do fundo pro perto** (painter's algorithm). Perto pinta por cima de longe = profundidade inequívoca. Use **baldes de profundidade** (não sort O(n log n) por frame).
2. **Tamanho relativo** sai de graça da mesma projeção (`tamanho ∝ 1/z`).
3. **Perspectiva atmosférica** = o que vira premium: partículas longe com **alpha menor + cor lerpada pro escuro do fundo** (dissolvem na escuridão); perto, nítidas, e só elas carregam o acento roxo. Blur **pré-assado** em 3–5 sprites offscreen (escolhe por profundidade) — **nunca** `ctx.filter` por frame.
4. **Parallax como coadjuvante**, não protagonista: 3 camadas em razão **0.3 / 0.4 / 0.5** (longe/médio/perto). Acima de 0.7 = enjoo.
5. **Atmosfera "luz numa sala escura"** (sem WebGL): radial-gradients em camadas + 2–3 glows grandes/moles com fonte + vinheta (empurra o olho pro Foco) + **grain de filme** (mix-blend 3–7% — mata banding *e* dá textura analógica) + **escuros tingidos** (roxo-navy muito escuro, nunca `#000` — banda menos, mais rico, on-brand).
6. **Profundidade estática é segura.** Oclusão + tamanho + atmosférica não se movem → ficam ligadas até em `prefers-reduced-motion`.

---

## 6. Travessia contínua (sem virar slideshow)

O segredo anti-slideshow (Pitch + a correção da Cairn):

1. **Morph de matéria compartilhada, NUNCA crossfade.** O estado de ordem é a *mesma* matéria reorganizada. Cada partícula tem um **alvo** (posição/cor) no estado ordenado; ao longo do progress ela **lerpa pro alvo** (e a amplitude do ruído cai de 1→0, então o alvo vence no fim). A poeira **condensa** na forma ordenada. Crossfade diz "cena A acabou, cena B começou" (dois espaços); target-lerp diz "a matéria que eu via *é* esta" (um espaço). **A continuidade do "um espaço" morre num dissolve.**
2. **Câmera presa + scrub** (seção 4) = base.
3. **Deriva tonal monotônica** (frio violeta-azul → roxo mais quente/brilhante) acoplada ao progress = arco emocional (tensão→resolução) sem geometria nova, e garante que **nada volta ao começo**.
4. **Ruído simplex/curl** num grid grosso (células 16–32px, amostra bilinear) dá vida orgânica que nunca repete exato (descoberta) — barato e mobile-safe.
5. **Pacing:** spacer 300–360vh (desktop), ≤350vh mobile. Sub-fases no progress: `0–0.33` caos · `0.33–0.66` travessia/convergência · `0.66–1` ordem/chegada. Distância generosa por beat (lento e confiante = premium).

---

## 7. Como adaptar à Likro

- **Troque a floresta literal da Cairn pela "floresta abstrata da Likro":** um **campo de luz/poeira pseudo-3D** = a operação comercial como matéria. Caos = pontos dispersos, frios, turbulentos, com conexões aleatórias (a clínica afogada). Ordem = a mesma poeira **condensando** num arranjo limpo — faixas de fluxo alinhadas / um lattice calmo / uma sugestão de estrutura (grid/kanban) **sem virar literal** (nada de cards de UI voando). Honesto e on-brand: entrega a "transformação contínua" que a Cairn só *finge* com cortes de foto.
- **Mantenha as mecânicas da Cairn, jogue fora a estética:** hero exit de vetores opostos; deriva atmosférica por progress; copy isomórfica ao vetor; uma metáfora sustentada (caos→calma/controle).
- **Roxo como recompensa:** escasso o tempo todo, **intensificando conforme a ordem chega** — só as partículas próximas/resolvidas carregam `#7C3AED`. A escassez é o payoff.
- **Neutros perceptualmente uniformes** (disciplina Linear/LCH): os escuros precisam estar *certos* — é metade do "premium". Escuro tingido de roxo-navy, não preto.
- **Copy só no topo** (decisão atual do Lenny): a linha do hero + o exit de vetores opostos entregam a travessia; o resto é luz pura. (Arc valida que copy carrega o arco caos→ordem — guardado pra amplificar depois.)
- **Mobile/perf (sagrado):** 350–700 partículas, DPR ≤1.5, sprites assados, 1 RAF dono do Lenis, mount do canvas pós-hidratação (LCP é a headline estática + atmosfera), caixa reservada (CLS=0), pause em `visibilitychange`/IntersectionObserver, ladder de degradação (count→DPR→ruído→estático).
- **`prefers-reduced-motion`:** mata o optic flow (a fonte de enjoo), mantém profundidade estática + atmosfera + a **história caos→ordem como antes/depois** (fade de opacidade ≤200ms entre dois quadros), não como viagem. Autorar **estático-premium primeiro**, adicionar o fluxo só atrás do check.

---

## 8. Proposta de direção criativa final — Hero Premium v2 ("A Travessia da Luz")

Uma síntese só, decidida, pronta pra virar requisitos/plano:

**A matéria.** Um campo de luz/poeira **pseudo-3D** (cada ponto tem `z`) num palco escuro tingido de roxo-navy. É a operação da clínica como substância — abstrata, nunca literal.

**A câmera.** Palco **`sticky` segurado** (~340vh), scrubbed pelo scroll via Motion `useScroll` → `progress` 0→1. O Foco de Expansão fica **central e estável**. Você não vê a luz se reorganizar de fora: você **entra** nela.

**A jornada (caos → travessia → ordem), em 5 quadros distintos** (= teste dos 5 quadros):
1. **Caos frio, à distância** (`progress ~0`): poeira dispersa, fria (violeta-azul), turbulenta (ruído alto), longe/dim, vinheta fechada, tensão. A clínica afogada.
2. **Entrada / o mundo começa a fluir** (`~0.25`): o hero exit de vetores opostos te entrega; `z` começa a cair → as partículas se **expandem radialmente** (optic flow) = "estou avançando". Direção emerge do ruído.
3. **Travessia / convergência** (`~0.5`): você se move *através* do campo (scale-through nas bordas); a poeira começa a **lerpar pros alvos** — fluxos se formando; temperatura sobe; primeiras partículas próximas acendem em roxo.
4. **Quase-ordem** (`~0.75`): a estrutura ganha forma (faixas alinhadas / lattice calmo); oclusão + perspectiva atmosférica dão volume; calor e clareza crescendo.
5. **Ordem conquistada** (`~1`): a matéria **assentou** num estado limpo, quente, brilhante, organizado — claramente diferente do começo, com o acento roxo no auge da escassez. A chegada. (= teste do retrospecto: percorri distância emocional e visual; o estado final parece **conquistado**, não só alcançado.)

**Continuidade garantida:** é **uma matéria só** com **target-lerp** (nunca crossfade) + deriva tonal monotônica + scrub. Nada volta ao começo; nada é uma "cena" separada.

**Profundidade:** oclusão (ordem de desenho) + tamanho (`∝1/z`) + perspectiva atmosférica (longe dissolve no escuro, blur assado) + 3 camadas de parallax leve (0.3/0.4/0.5) + atmosfera "luz numa sala escura" (glows com fonte, vinheta, grain, escuros tingidos).

**Por que é premium e não gimmick:** o trabalho pesado está nos **neutros uniformes + luz com fonte + espaço negativo + scrub acoplado ao usuário**; a luz é o tempero. Roxo escasso que só intensifica na chegada. Movimento que *significa* (caos→ordem), não decoração.

**Guard-rails (não-objetivos do contrato):** sem WebGL pesado, sem prisma Vercel, sem foto/IA literal, sem cursor/kinetic gimmick, sem mais-partículas-por-mais; e **a régua é sensação, não espetáculo**.

> **Próximo passo no GSD:** transformar a Seção 8 nos **requisitos rastreáveis** (REQUIREMENTS.md) e numa **fase com critérios de sucesso = os 2 testes de aceite** (ROADMAP.md → PLAN.md), que vira o contrato executável que o Lenny aprova antes do código.

---

## Apêndice — 10 referências B2B-apropriadas (mineração)

Stripe (atmosfera/continuidade) · Linear (pinned reveal dark, disciplina LCH) · Apple (scrub/scale-through/occlusão) · **Terminal Industries** (morph superfície→wireframe = caos→ordem literal) · Cartier/Immersive Garden (pacing de luxo) · Vercel (teto de restrição) · Adriaans Bouwbedrijf (parallax+revelação premium sem WebGL) · Home Société (monocromático + acento único) · Obys (transição de kinetic type — pegar a mecânica, não a gritaria) · Igloo Inc (norte da "descoberta espacial contínua" — implementação WebGL fora de escopo).

## Fontes (principais)
- Cairn — site rodando inspecionado direto (GSAP+ScrollTrigger+Lenis; parallax por seção; hero vetores opostos)
- Linear: redesign UI / Liquid Glass / análise LCH dark-mode · Stripe gradient teardowns (Hufnagl, Bram.us, minigl) · Vercel/Geist design system
- Apple Vision Pro / Apple product pages — recreações CSS-Tricks (sticky pin, oclusão em 1 grid cell, scrub de frames em canvas) · Pitch continuity transitions (shared-element morph) · Arc (chaos→order como copy-spine)
- Awwwards (storytelling/immersive/SaaS collections), Metabole Studio (immersive examples + scrollytelling), HTMLBurger (best scrolling sites), Relume showcase
- Percepção/perf: depth cues (UC Irvine, Piter Pasma), motion parallax (PMC), optic flow/FoE (eyesonjason, Frontiers), náusea/vestibular (Web Axe ~28% iOS7, PubMed FoE −20%, A List Apart, WCAG 2.3.3), Canvas perf (offscreen sprites, integer coords, no per-frame blur), flow fields/curl noise, banding/grain/dither, Motion useScroll/useTransform, Lenis single-RAF

*Pesquisa concluída 2026-06-11 · 5 agentes paralelos · entregável de direção, sem código.*
