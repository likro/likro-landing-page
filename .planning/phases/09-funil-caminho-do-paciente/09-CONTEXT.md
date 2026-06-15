# Phase 9 — Funil (Caminho do Paciente) — CONTEXT

**Origem:** decisões travadas com Lenny em conversa (2026-06-14/15) + protótipo HTML validado. Não é discuss-phase formal; este arquivo consolida o que JÁ está decidido para que researcher/planner NÃO re-perguntem.

## O que é esta fase

Primeiro capítulo do milestone **v2.1 — Capítulos Visuais**. A página perde contraste depois do topo; este milestone dá identidade visual própria a cada capítulo no ritmo "bookend escuro". O Funil é o capítulo ESCURO que prova a tese da página inteira: *"nenhum paciente fica pelo caminho"*. Foi escolhido como primeiro porque valida o novo ritmo visual.

## Protótipo de referência (FONTE DA VERDADE VISUAL)

`funil-proto.html` na raiz do projeto — protótipo descartável, **aprovado pelo Lenny** (validado via Playwright @1536×730, 2026-06-15). Ele define o comportamento alvo. NÃO copiar o HTML para produção; **portar a ideia** para o stack real (Next.js + Tailwind v4 + Motion + Lenis + primitivas da Phase 2). O protótipo é só a prova de conceito do ritmo.

Aprovado explicitamente pelo Lenny no protótipo:
- A travessia da Marina lendo como "uma pessoa caminhando", não colunas estáticas.
- O ritmo da travessia (~6s easeInOut no protótipo) — "achei o ritmo ótimo".
- O acender do roxo no clímax — "o acender tb [ótimo]".

## Decisões TRAVADAS (não reabrir)

1. **Protagonista único.** UM paciente, "Marina", atravessa o board. O board é palco, ela é a história. Outros cards = ghost apagados (~0.3 opacity) ao fundo.
2. **4 colunas:** "Chegou agora" → "Em atendimento" → "Escolhendo horário" → "Consulta marcada". O card da Marina viaja da 1ª à 4ª conforme o scroll; a coluna ativa acende, as outras esmaecem.
3. **Momento real por etapa (NÃO métrica).** Cada etapa mostra um beat pequeno e humano:
   - Chegou agora → "Oi, queria saber sobre os horários de vocês 🙂" (via WhatsApp)
   - Em atendimento → "Júlia respondeu e já está cuidando da Marina." (atendente assumiu)
   - Escolhendo horário → "Marina escolheu quinta às 14h entre os horários livres." (agenda aberta)
   - Consulta marcada → "Lembrete enviado. Marina confirmou a presença." (confirmado) + selo ✓ "Consulta confirmada · quinta, 14h"
   - **PROIBIDO** na seção inteira: número, KPI, %, gráfico, taxa de conversão, contador, widget de dashboard. Se aparecer métrica, vira CRM genérico e perde a força.
4. **Clímax roxo.** A chegada na coluna "Consulta marcada" acende `#7C3AED` (borda + glow + sombra + selo de confirmação) pra SENTIR que aconteceu. É um dos **4 únicos momentos de roxo** da página inteira (disciplina do roxo do milestone). Roxo NÃO aparece nas colunas intermediárias.
5. **Headline (TRAVADA):** "Você vê cada paciente, do primeiro oi até a consulta." Eyebrow: "O caminho do paciente".
6. **Fechamento (TRAVADO):** "WhatsApp, Instagram, agenda, funil e IA trabalhando juntos pra transformar conversa em consulta." — **Messenger/Facebook FORA** (mesma regra do Hero; Facebook só aparece no capítulo Produto).
7. **SEM legenda.** Testamos a tripla "entra/anda/volta" (rejeitada — espertinha demais, "volta" não encaixa) e a frase única "Nenhum paciente fica esquecido no meio do caminho" (rejeitada — redundante com headline+board+fechamento). Decisão final: **nenhuma legenda**; o board fala por si.
8. **Absorve o HowItWorks.** O antigo `src/sections/HowItWorks` (4 passos timeline) é absorvido por este capítulo e removido da página — não pode haver duas seções sequenciais parecidas. Tirar do `page.tsx` e do conteúdo.
9. **Capítulo ESCURO com identidade própria.** Palco escuro (`~#0d0e16`) com glow radial roxo sutil no topo, diferente da textura do Hero (travessia de luz). Não é "mais um escuro" — tem motivo visual próprio (Kanban como palco).

## Constraints técnicas (do CLAUDE.md / stack do projeto)

- **Motion via primitivas da Phase 2** (`<StickyStage>`, `<ScrollScene>` que expõe `MotionValue<number>` 0→1). ZERO `motion.div` direto na seção (audit grep do projeto). Sticky stage + scrub.
- **prefers-reduced-motion:** entrega a jornada JÁ MONTADA no estado final (card na coluna "Consulta marcada", roxo aceso) — sem scrub, sem viagem. Validar no toggle do OS.
- **Mobile primeiro de verdade** (80% tráfego mobile). 4 colunas apertadas em tela estreita é risco — researcher deve definir o padrão mobile (board miniaturizado vs. foco em 1 coluna por vez). Lenny ainda NÃO decidiu mobile; está aberto (única pergunta legítima de mobile).
- **Copy em `src/content/`** (convenção COPY-01: zero string hard-coded em JSX). Criar `src/content/funnel.ts` (ou nome equivalente) com variantes + ponteiro ativo, como os outros módulos de content.
- **Brand lock:** roxo é só destaque; respeitar tokens do Tailwind (`accent.primary` = #7C3AED; cuidado com `accent-on-dark` em superfície escura — ver brand-lock test).
- **Perf:** não regredir LCP; canvas/animação pós-hidratação; pausar offscreen; `transform`/`opacity` só.
- **Analytics:** seção entra no padrão `TrackSection` + `section_view` como as outras (ver page.tsx).

## Skills de frontend a usar (pedido explícito do Lenny)

Lenny pediu: "usa skills de frontend que eu tenho... usa todas que precisar". Disponíveis e relevantes: **impeccable** (craft/motion/polish premium), **frontend-design** (interfaces autorais, anti-estética-genérica de IA), **taste-skill** (anti-slop, pré-flight), **redesign-skill** (elevar seção existente sem quebrar). Usar conforme a etapa pedir.

## Decisões em aberto — RESOLVIDAS por Lenny (2026-06-15, pós UI-SPEC)

1. **Mobile = "1 coluna em foco + trilho".** No celular (<640px) NÃO renderizar as 4 colunas espremidas. Trilho horizontal dos 4 passos no topo (acende o ativo) + card da Marina grande e legível no centro, conteúdo trocando por crossfade conforme o scroll; clímax acende roxo no chip final + card. Preserva "a pessoa caminhando" e a progressão esquerda→direita. ("board miniaturizado" REJEITADO.) Comprimento do palco mobile ~420svh (vs 560svh desktop) via `useDeviceTier`, sem duplicar componente.
2. **Sem CTA no Funil.** Capítulo de demonstração puro; os CTAs persistentes de WhatsApp (Phase 5) já cobrem a página. Não adicionar botão depois do fechamento (evita gastar um dos 4 momentos de roxo e competir com o clímax).
3. **Colunas intermediárias (1–3) sem roxo** — só realce neutro (borda branca ~0.18, head acende pra primary). Roxo exclusivo do clímax (coluna 4). (Production tightening vs. protótipo, que tinha leve roxo nas ativas.)
4. **Tokens de palco escuro:** criar 3 tokens `@theme` (ex.: stage/column/ghost) reutilizáveis pelos capítulos escuros irmãos (Problema, Conversão), em vez de hex/rgba solto na seção.

## Fora de escopo desta fase

- Os outros capítulos (Problema, Virada, Produto, Prova, Conversão) — são as Phases 10-14 do v2.1.
- Reescrita da copy v2 das outras seções (ver `project_copy_v2_direction` na memória) — frente separada.
