# Phase 3: Hero (benchmarked isolado) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 03-hero-benchmarked-isolado
**Areas discussed:** Composição visual + mockup (LCP), Direção da copy, Header + trust + animações secundárias, Operacionais + deploy isolado (LCP gate)

---

## Composição visual + mockup (LCP)

### Q1: Direção tonal do background do hero?

| Option | Description | Selected |
|--------|-------------|----------|
| Dark editorial premium (recomendado) | surface.dark base + glow roxo sutil + mockup brilhando contra o escuro | |
| Light premium editorial | surface.light base + tipografia gigante preta + mockup com sombra refinada | |
| Híbrido — dark com 'janela' clara | Background dark com mockup dentro de cartão/janela light com sombra grande | ✓ |

**User's choice:** Híbrido — dark com 'janela' clara
**Notes:** Equilíbrio entre profundidade cinematográfica + sensação premium + clareza + percepção de produto real. Evitar: dark mode pesado, glow exagerado, "AI SaaS template", dashboard perdido em fundo escuro vazio, sci-fi/cyberpunk. Sensação editorial, high-end, sofisticada, tecnológica, viva. Mockup como "produto real dentro do próprio ambiente".

### Q2: Layout estrutural do hero (acima da dobra)?

| Option | Description | Selected |
|--------|-------------|----------|
| Split assimétrico copy/mockup (recomendado) | Copy esquerda + mockup direita desktop; stack mobile | ✓ |
| Centralizado vertical com mockup abaixo do CTA | Copy centralizada no topo + mockup grande abaixo | |
| Mockup como hero fullbleed com overlay de copy | Mockup dominante atrás com gradient overlay | |

**User's choice:** Split assimétrico
**Notes:** Clareza imediata + percepção produto real + impacto visual + conversão + premium. Mockup aparece cedo e com presença forte sem dominar totalmente a tela. Evitar layout SaaS genérico, hero centralizado demais, fullbleed pesado. Composição assimétrica elegante com respiro.

### Q3: Qual o foco visual do mockup principal?

| Option | Description | Selected |
|--------|-------------|----------|
| Caixa de entrada multicanal Atendimentos (recomendado) | Print de Atendimentos — centralização canal/atendentes/etiquetas | ✓ |
| Painel Kanban CRM | Print do Kanban (Contato → Orçamento → Agendamento) | |
| Dashboard de relatórios | Heatmap, métricas | |
| Composição de 2-3 telas sobrepostas | Stack de mockups | |

**User's choice:** Atendimentos com possibilidade de 1 camada complementar discreta
**Notes:** Comunica instantaneamente centralização + WhatsApp + Instagram + atendimento organizado + operação viva + leads em um lugar. CRM e Relatórios ficam pra Phase 4 onde têm mais contexto. Pediu sensação leve de "plataforma viva" via card secundário sutil — explorado na pergunta de follow-up.

### Q4: Tratamento decorativo do entorno?

| Option | Description | Selected |
|--------|-------------|----------|
| Glow roxo muito sutil + grid/linhas abstratas (recomendado) | Único ponto de glow accent + grid/linhas tech leves baixa opacidade | |
| Apenas tipografia + mockup, zero decoração | Stripe-style flat | |
| Gradient sutil (não-roxo) + glow accent pontual | Gradiente neutro escuro + glow roxo pontual | |

**User's choice:** Combinação MUITO controlada das três (glow sutil + grid leve + gradient neutro quase imperceptível)
**Notes:** Atmosfera/iluminação ambiente, não ornamento. Glow em único ponto difuso suave, linhas extremamente sutis baixa opacidade abstratas/editoriais, gradient neutro quase imperceptível. Evitar: cyberpunk, glow exagerado, gradient exagerado, "AI SaaS template", poluição visual.

### Q5 (follow-up): Frame/tratamento do mockup principal?

| Option | Description | Selected |
|--------|-------------|----------|
| Sem chrome browser + radius + sombra + borda sutil (recomendado) | Mockup raw em janela clara radius 12px sombra refinada borda 1px | ✓ |
| Com browser chrome minimalista | 3 dots + url fake | |
| Mockup tilted/perspective + flutuando | 3d sutil | |

**User's choice:** Sem chrome de browser
**Notes:** Tratar produto como interface real / objeto premium / superfície editorial — não screenshot de navegador / tutorial / fake browser chrome. Mockup limpo, radius elegante, sombra refinada, borda extremamente sutil. Evitar perspective exagerada, tilt forte, "flutuando no espaço", visual Stripe-clone / AI SaaS template.

### Q6 (follow-up): O card secundário / notificação sutil entra já na v1 do Hero?

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, um único micro-card sobreposto (recomendado com restrições) | 1 elemento sobreposto, sem animar entrada (HERO-02 LCP-adjacent) | ✓ |
| Não — apenas o mockup principal | Sem sobreposições; vida fica pra Phase 4 | |
| Sim, mas anima entrada sutil post-LCP | Fade+slide ~600ms depois do load | |

**User's choice:** 1 único micro-card sobreposto com MUITO controle visual
**Notes:** Detalhe atmosférico / camada de vida / percepção sutil de plataforma ativa. Não widget chamativo nem card de marketing nem notificação exagerada. Cuidado com timing, escala, contraste, competição visual. Protagonista continua a caixa de entrada multicanal.

---

## Direção da copy (headline + sub + CTA label)

### Q1: Abordagem narrativa da headline (h1)?

| Option | Description | Selected |
|--------|-------------|----------|
| Afirmação de identidade vertical (recomendado) | "A operação da sua clínica, em um lugar só" | ✓ (primário) |
| Ataque à dor reconhecível | "Pare de perder lead no Instagram" | |
| Promessa de transformação concreta | "Cada lead da sua clínica vira agendamento" | |
| Categoria-criação (anti-CRM/anti-chatbot) | "Mais que CRM. Menos que chatbot." | (influência leve) |

**User's choice:** Afirmação de identidade vertical PRINCIPALMENTE + influência leve de categoria-criação ("não é só CRM" / "não é só chatbot" / "não é só atendimento")
**Notes:** Tem que parecer marca, parecer categoria própria, sofisticada, clara em segundos, transmitir organização e centralização operacional. Evitar: headline agressiva de tráfego pago, "pare de perder leads", promessas exageradas, tom vendedor, clichês SaaS. Sensação alvo: "isso foi feito exatamente para a operação da minha clínica".

### Q2: Especificidade clínica — onde a palavra 'clínica' aparece?

| Option | Description | Selected |
|--------|-------------|----------|
| Na headline E na sub (recomendado) | Repetição deliberada | ✓ |
| Só na sub-headline | Headline ampla, sub aterra na clínica | |
| Só na headline | Headline cravada, sub explica como/quê | |

**User's choice:** Headline E sub
**Notes:** Verticalização cristalina nos primeiros segundos. Repetição deliberada, segura, natural, sofisticada — não keyword stuffing. Reconhecimento imediato + identificação emocional + percepção de produto especializado.

### Q3: Quantas variantes de copy o Claude entrega?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 variantes contrastantes (recomendado) | Abordagens distintas (identidade / dor / promessa ou variações) | ✓ |
| 1 variante única + pivot se rejeitar | Aposta única | |
| 5+ variantes ampla exploração | Mais ângulos | |

**User's choice:** 3 variantes contrastantes
**Notes:** Variantes realmente diferentes em abordagem, não pequenas mudanças de frase. Equilíbrio entre impacto, clareza, memorabilidade, premium, identificação imediata da clínica. Sem overload nem Frankenstein.

### Q4: CTA principal do hero — texto do botão?

| Option | Description | Selected |
|--------|-------------|----------|
| 'Falar no WhatsApp' (recomendado fricção mínima) | Direto, canal explícito | ✓ |
| 'Conversar com a Likro' | Tom consultivo, esconde canal | |
| 'Ver Likro funcionando' / 'Pedir demo' | Vocabulário SaaS clássico | |
| Variantes por tier mobile vs desktop | Adaptação por contexto | |

**User's choice:** "Falar no WhatsApp"
**Notes:** Máxima clareza, mínima fricção. Tráfego mobile + Instagram/Meta Ads + WhatsApp canal principal. Usuário entende instantaneamente qual ação e qual canal. Refinamento vem de design, motion, composição, microinteração — não de esconder comportamento.

---

## Header + trust signal + animações secundárias

### Q1: Header entra já na Phase 3?

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, header estático simples (recomendado) | Logo + WhatsApp secundário; sem hide-on-scroll | ✓ |
| Não, hero puro até Phase 5 | Hero 100% viewport sem nada acima | |
| Só logo sem CTA no header | Logo no canto sem CTA | |

**User's choice:** Header estático simples já na Phase 3
**Notes:** Minimalista, leve, elegante, MUITO respiro, quase invisível estruturalmente. Sem navegação pesada, muitos links, mega menu, interações complexas. Não compete com hero. Logo + CTA secundário WhatsApp suficiente.

### Q2: Trust signal abaixo do CTA primário?

| Option | Description | Selected |
|--------|-------------|----------|
| Linha curta de tempo/referência (recomendado) | Ex: "Resposta humana em minutos" | ✓ |
| Menção explícita ao Dolce Home | "Em operação em clínicas como Dolce Home" | |
| Logo-bar institucional | Faixa de logos | |
| Nenhum trust signal no hero | Trust concentrado em Proof | |

**User's choice:** Linha curta "sussurrada"
**Notes:** Discreto, humano, sofisticado, editorial, quase "sussurrado". Transmite operação real / credibilidade / produto vivo / baixa fricção / confiança sem claims exagerados ou social proof forçado. Sem citar Dolce Home antes de autorização formal. Funciona como reforço sutil de realidade / camada emocional de confiança / detalhe premium da composição.

### Q3: Scroll cue?

| Option | Description | Selected |
|--------|-------------|----------|
| Não (recomendado para Phase 3 isolada) | Hero isolado, scroll cue mente | ✓ |
| Sim, seta sutil animada | Promete o que virá | |
| Adicionar quando Phase 4 entrar | Hero P3 sem cue; P4 adiciona | |

**User's choice:** Sem scroll cue
**Notes:** Phase 3 isolada — cue mentiria. Evitar ícones genéricos / seta clichê / template/Awwwards gimmick. Preferir composição que induza continuidade natural; conteúdo "vazando" abaixo da dobra na Phase 4. Reavaliar depois.

### Q4: Animações secundárias permitidas (HERO-03)?

| Option | Description | Selected |
|--------|-------------|----------|
| Glow ambiente pulsando MUITO devagar (recomendado mínimo) | 8-12s ciclo, escala 1↔1.05 + opacity, zero efeito em LCP | ✓ |
| Glow + micro-card animando entrada post-LCP | Card fade+slide ~600ms post-load | |
| Sem animação nenhuma no hero | Hero 100% estático | |
| Pacote completo (glow + card + parallax mockup) | Glow + card + parallax mouse | |

**User's choice:** Glow ambiente pulsando MUITO devagar
**Notes:** Sentir vivo / respirando / atmosférico / cinematográfico sem chamar atenção pra animação / competir com mockup / virar gimmick / "AI SaaS template". Iluminação ambiente / profundidade sutil / atmosfera premium — não efeito especial / orb neon / animação evidente. Movimento quase subconsciente, ciclos lentos, baixa opacidade, comportamento refinado.

---

## Operacionais + deploy isolado (LCP gate)

### Q1: Número oficial do WhatsApp da Likro?

| Option | Description | Selected |
|--------|-------------|----------|
| Fornecer agora (digite) | Lenny digita | ✓ |
| Deixar bloqueado até deploy isolado | Adia | |
| Usar número pessoal temporariamente | Pessoal + troca depois | |

**User's choice:** `5511922324329`
**Notes:** Número oficial Likro fornecido por Lenny. Desbloqueia validação real-device end-to-end e configuração Vercel.

### Q2: Cadência de copy review do Lenny (COPY-04)?

| Option | Description | Selected |
|--------|-------------|----------|
| Async via PR seção-a-seção (recomendado) | Variantes em content/<sec>.ts revisadas via GitHub | ✓ |
| Síncrono inline (chat) | Variantes no Claude Code | |
| Pass final único antes do deploy | Bloco final | |

**User's choice:** Async via PR seção-a-seção
**Notes:** Copy é parte central da construção da marca. Refinamento contínuo, revisão iterativa, evolução gradual do tom, histórico claro das decisões no git. Variantes por seção, calma, ajustes de nuance, validar clareza vs sofisticação, consistência. Evitar overload final, Frankenstein, patches tardios, inconsistência. Copy precisa parecer humana / premium / segura / moderna / específica / sem cara de IA.

### Q3: Estratégia de deploy isolado pra medir LCP?

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel preview no PR final da Phase 3 (recomendado) | Preview automático do PR final, sem feature flag | ✓ |
| Branch separada em URL própria | Sub-projeto Vercel | |
| Feature flag escondendo seções futuras | Hero em prod + flag p/ Phase 4 | |

**User's choice:** Vercel preview no PR final da Phase 3
**Notes:** Validar LCP real / performance mobile / comportamento hero isolado / impacto mockup / motion inicial / pacing primeira viewport no ambiente mais próximo de produção. Identificar gargalos com clareza, medir impacto real, estabilizar primeira viewport antes das narrativas. Fluxo simples, sem feature flags, sem branches paralelas, sem infra extra.

### Q4: Gate do LCP — automatizado ou manual?

| Option | Description | Selected |
|--------|-------------|----------|
| Checklist manual no fim da Phase 3 (recomendado) | Lighthouse + PSI manuais registrados em VERIFICATION | ✓ |
| Lighthouse CI gate em GitHub Actions | lhci autorun + assertions | |
| Vercel Speed Insights apenas | Monitoramento contínuo, sem gate | |

**User's choice:** Checklist manual no fim da Phase 3
**Notes:** Validar Lighthouse mobile / PSI / LCP / comportamento hero / motion / performance device real antes de concluir. Manter disciplina forte sem complexidade prematura de CI. Registrar métricas / observações / screenshots / verificações em doc de verificação. Lighthouse CI e automações mais rígidas podem entrar depois quando arquitetura e hero estiverem estabilizados.

---

## Claude's Discretion

Sintetizado em CONTEXT.md (D-decisions block). Áreas onde planner/executor tem flexibilidade dentro das decisões tomadas:
- Escolha do screenshot específico de Atendimentos
- Texto exato do micro-card sobreposto
- Valores numéricos do glow (raio, blur, opacidade, ciclo, easing)
- Dimensões exatas da headline (rem/clamp)
- Estrutura da copy nas variantes (formato no arquivo)
- Altura exata do hero (`min-h-dvh` vs `min-h-svh`)
- Estrutura interna de pastas dentro de `src/sections/Hero/`
- Calibragem da composição (alignment, peso de cada linha, espaçamentos)

## Deferred Ideas

Lista completa em CONTEXT.md `<deferred>`. Destaques:
- Floating WhatsApp + safe-area → Phase 5
- Header hide-on-scroll → Phase 5
- CTAs persistentes em 4+ pontos → Phase 5
- Citação explícita Dolce Home → Phase 4 (após autorização)
- Mockup tilted/perspective → descartado (risco "AI SaaS template" + LCP)
- Browser chrome no mockup → descartado (tutorial/datado)
- Múltiplos micro-cards → descartado (vira ruído)
- Scroll cue / seta animada → descartado (clichê + mente na Phase 3)
- Lighthouse CI / GitHub Actions → Phase 7
- Variantes de CTA por tier → descartado (sem ganho claro)
- 5+ variantes copy / pass final único → descartado
- Vercel Speed Insights → Phase 7
- OG image custom polish / JSON-LD → Phase 7
- Cookie banner LGPD → fora de v1
