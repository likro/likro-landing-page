---
phase: 09-funil-caminho-do-paciente
verified: 2026-06-15T15:30:00Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Mobile rail (≤639px) — rolagem e clímax"
    expected: "Rail de 4 chips avança da esquerda para a direita; um único MarinaCard grande e legível crossfade pelo conteúdo dos 4 beats; clímax (chip 4 + card) ignita roxo; nenhum squash de 4 colunas."
    why_human: "FunnelRail é DOM net-new sem protótipo; comportamento scroll-driven visual não é assertável headless. Testes de unidade cobrem a disciplina de import/métrica/copy mas não a progressão visual no touch."
  - test: "prefers-reduced-motion — estado final pré-montado sem scroll morto"
    expected: "Com Reduce Motion ativo (Windows Animations off / macOS Reduce Motion), a seção ocupa apenas 1 viewport (min-h-svh), Marina já aparece na coluna 4 com roxo aceso e selo 'Consulta confirmada · quinta, 14h' visível, sem nenhuma distância de scroll morto."
    why_human: "O caminho reduced depende do toggle de OS e de verificação visual no browser. Não é reproduzível via Playwright headless sem controlar a media query prefers-reduced-motion no nível do OS."
---

# Phase 9: Funil (Caminho do Paciente) — Relatório de Verificação

**Phase Goal:** Substituir HowItWorks por uma seção cinematográfica escura ("Caminho do Paciente") onde o card da Marina atravessa um Kanban (Chegou agora → Em atendimento → Escolhendo horário → Consulta marcada) conforme o scroll, com clímax roxo na chegada; mobile = rail + card em foco; reduced-motion = estado final pré-montado; ordem da página Product → Funnel → Proof.
**Verificado:** 2026-06-15T15:30:00Z
**Status:** human_needed
**Re-verificação:** Não — verificação inicial.

---

## Resultado do Objetivo

### Truths Observáveis

| # | Truth | Status | Evidência |
|---|-------|--------|-----------|
| 1 | Marina atravessa 4 colunas via scroll (translateX, footstep walk) | VERIFICADO | `FunnelBoard.tsx` L78-82: `useTransform(progress,[0,0.16,0.33,0.5,0.66,0.83,1],[x0,x1,x1,x2,x2,x3,x3])` + `<motion.div style={{ x }}>` envolve MarinaCard. Sticky corrigido em `96e543d` (removido `overflow-hidden` da `<section>` pai). |
| 2 | Clímax roxo exclusivo na coluna 4 (borda + glow + anel + tag) | VERIFICADO | `FunnelBoard.tsx` L93-94: `climax = useTransform(progress,[0.82,0.95],[0,1])`. `FunnelColumn.tsx`: estado `win` aplica `border-[rgba(124,58,237,0.85)]` + `bg-[linear-gradient(...)]` + shadow. Colunas 1–3 usam `border-[rgba(255,255,255,0.18)]` neutro, jamais roxo. Nenhum `#7c3aed` hex nos arquivos da seção. |
| 3 | prefers-reduced-motion entrega estado final pré-montado, sem scrub nem scroll morto | VERIFICADO (código) / NECESSITA HUMANO (visual) | `index.tsx` L60-91: `if (reduced) { return <section min-h-svh>...<FunnelStageBody finalState />` }. `FunnelBoard.tsx` L86,95,108-109: `finalState ? 3 : activeIndex`, `finalState \|\| isClimax`, `style={finalState ? { x: x3 } : { x }}`. Lógica correta no código; validação visual no OS dependente de teste humano. |
| 4 | Mobile renderiza rail de chips + card centrado (~420svh) sem duplicar componente | VERIFICADO (código) / NECESSITA HUMANO (visual) | `index.tsx` L62: `const length = isMobile ? ("420svh" as const) : ("560svh" as const)`. `FunnelStageBody` usa o mesmo `progress` e branch único `isMobile ? <FunnelRail> : <FunnelBoard>`. `FunnelRail.tsx` implementado com 4 chips, marcador translateX em px (sem %), card crossfade. Sem squash de 4 colunas. Verificação visual no mobile real: necessita humano. |
| 5 | HowItWorks completamente removido; ordem Product → Funnel → Proof na página | VERIFICADO | `src/sections/HowItWorks/` — dir não existe. `src/content/how-it-works.ts` — não existe. `tests/content/how-it-works.test.ts` — não existe. `tests/sections/how-it-works-invariants.test.ts` — não existe. `page.tsx` L7,31: `import { Funnel } from "@/sections/Funnel"` + `<TrackSection section="funnel"><Funnel /></TrackSection>` entre Product e Proof. |
| 6 | Toda a copy travada em `src/content/funnel.ts`; zero string PT-BR hard-coded no JSX | VERIFICADO | `funnel.ts` exporta `FUNNEL_COPY` com todas as strings do UI-SPEC. Grep nas seções não encontrou strings PT-BR inline. Tests de invariants (Test 5) + conteúdo (funnel.test.ts) passam. Módulo usa `as const satisfies FunnelCopy`. |
| 7 | Travessia usa APENAS primitivas `@/components/motion` + exceção render-prop; zero `useScroll`/`useMotionValue` | VERIFICADO | `index.tsx` L28: `import { ScrollScene, StickyStage } from "@/components/motion"`. `FunnelBoard.tsx` L26, `FunnelRail.tsx` L23: importam `{ motion, useMotionValueEvent, useTransform, type MotionValue }` de `motion/react` (allowlist MOTION-05 exata). Grep por `useScroll\|useMotionValue\b` retorna vazio. Invariants test (Test A) passa. |

**Placar:** 7/7 truths verificadas no código. 2 itens precisam de validação visual humana (mobile + reduced-motion).

---

## Artefatos Necessários

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `src/sections/Funnel/index.tsx` | Raiz da seção: ScrollScene>StickyStage, branch mobile/reduced | VERIFICADO | 124 linhas; exporta `Funnel`; `ScrollScene` + `StickyStage` importados; 420/560svh por tier; caminho reduced com `finalState`. |
| `src/sections/Funnel/FunnelBoard.tsx` | 4 colunas + ghosts + MarinaCard, translateX, clímax roxo | VERIFICADO | 180 linhas; `useTransform` 7-point travel; activeIndex discreto via `useMotionValueEvent`; beat crossfade 4 rampas de opacidade; `climax = useTransform(progress,[0.82,0.95],[0,1])`. |
| `src/sections/Funnel/MarinaCard.tsx` | Card protagonista: beat content + `.win` clímax + tag/seal | VERIFICADO | 103 linhas; `win` prop; `tagSlot` para ignição animada do board; `FUNNEL_COPY.protagonist` para nome; `FUNNEL_COPY.seal` no tagSlot padrão. |
| `src/sections/Funnel/FunnelRail.tsx` | Mobile: rail de 4 chips + card centrado + marcador translateX | VERIFICADO | 181 linhas; marcador em px (`chip(i)` de `railWidth`); activeIndex discreto; beat crossfade; clímax `useTransform(progress,[0.82,0.95],[0,1])`. |
| `src/sections/Funnel/FunnelHead.tsx` | Eyebrow `<p>` + `<h2 id="funnel-headline">` | VERIFICADO | 25 linhas; `<h2 id="funnel-headline">`; eyebrow como `<p>` (não heading); copy de `FUNNEL_COPY`. |
| `src/sections/Funnel/FunnelColumn.tsx` | 3 estados: resting/active(neutro)/win(roxo) | VERIFICADO | 65 linhas; active usa `border-[rgba(255,255,255,0.18)]` sem roxo; win usa `rgba(124,58,237,…)` apenas. |
| `src/sections/Funnel/GhostCard.tsx` | Placeholder apagado, `aria-hidden`, sem copy | VERIFICADO | 18 linhas; `opacity-[0.32]`; `aria-hidden="true"`; larguras via `w-3/5`/`w-2/5` (sem %). |
| `src/sections/Funnel/FunnelClosing.tsx` | Frase de fechamento com accent span; sem CTA, sem legenda | VERIFICADO | 21 linhas; `FUNNEL_COPY.closing.lead/accent/tail`; `<span class="text-accent-on-dark">`; sem CTA, sem legenda. |
| `src/content/funnel.ts` | FUNNEL_COPY com todas as strings travadas | VERIFICADO | 77 linhas; `as const satisfies FunnelCopy`; todas as 7 strings exatas do UI-SPEC; `protagonist: "Marina"`; sem Messenger/Facebook. |
| `.planning/REQUIREMENTS.md` | 7 IDs FUNIL-* com descrições + 7 linhas de traceability | VERIFICADO | 15 ocorrências de FUNIL-* (7 spec + 7 traceability + 1 nota de distribuição). Milestone v2.1 presente. |
| `src/app/globals.css` | 3 tokens `--color-funnel-*` no `@theme` + `.funnel-atmosphere` | VERIFICADO | Tokens nas linhas 42-44; `.funnel-atmosphere` na linha 111. |
| `tests/content/funnel.test.ts` | Contrato de copy (8 assertions) | VERIFICADO | 146 linhas; 8 testes (shape, valores travados, step heads, moments, closing, Messenger/Facebook, anti-IA, vocabulário vertical). |
| `tests/sections/funnel-invariants.test.ts` | Gates: import motion, vh, priority, copy inline | VERIFICADO | 232 linhas; Test A (import gate FUNIL-01), Test 3 (vh), Test 4 (priority), Test 5 (copy PT-BR), walk sanity. |
| `tests/sections/funnel-no-metric.test.ts` | Audit FUNIL-02: zero métrica/KPI/% | VERIFICADO | 114 linhas; stripComments + allowlist global `\d{1,2}h`; 9 padrões de métrica auditados. |
| `tests/landing/coherence.test.ts` | Ordem Hero → … → Product → Funnel → Proof; Funnel excluído do ban de motion | VERIFICADO | `SECTION_NAMES = ["Pain","Bridge","Product","Funnel","Proof"]`; `NARRATIVE_NO_MOTION = SECTION_NAMES.filter(s => s !== "Funnel")`; regex JSX inclui `<Funnel`. |
| `src/app/page.tsx` | Funnel wired com TrackSection section="funnel" entre Product e Proof | VERIFICADO | L7: `import { Funnel }`, L31-33: `<TrackSection section="funnel"><Funnel /></TrackSection>` na posição correta. |

---

## Verificação dos Links-Chave (Wiring)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `src/app/page.tsx` | `src/sections/Funnel/index.tsx` | `import { Funnel } from "@/sections/Funnel"` | WIRED | L7 + L31-33 confirmados. |
| `src/sections/Funnel/index.tsx` | `@/components/motion` | `import { ScrollScene, StickyStage }` | WIRED | L28 confirmado. |
| `src/sections/Funnel/index.tsx` | `src/content/funnel.ts` (via FunnelHead/Board/Rail/Closing) | Imports em cada subcomponente | WIRED | FunnelHead, FunnelClosing, FunnelBoard, FunnelRail, MarinaCard todos importam `FUNNEL_COPY`. |
| `src/sections/Funnel/FunnelBoard.tsx` | `progress MotionValue` (translateX) | `useTransform` render-prop | WIRED | L78-82: x derivado de progress, aplicado via `<motion.div style={{ x }}>`. |
| `src/sections/Funnel/FunnelBoard.tsx` | `climax` roxo exclusivo coluna 4 | `useTransform(progress,[0.82,0.95],[0,1])` | WIRED | L93; isClimax discreto via `useMotionValueEvent`; `FunnelColumn state="win"` condicionado a `i===3 && effClimax`. |
| `tests/landing/coherence.test.ts` | `src/app/page.tsx` ordem de seções | regex `<Product[\s\S]*?<Funnel[\s\S]*?<Proof` | WIRED | L109 confirmado; Test 2 roda (não pula) porque todos os section dirs existem. |

---

## Data-Flow Trace (Level 4)

| Artefato | Variável de dados | Fonte | Produz dados reais | Status |
|----------|-------------------|-------|--------------------|--------|
| `FunnelBoard.tsx` | `progress: MotionValue<number>` | `ScrollScene` render-prop (freeze primitiva Phase 2) | Sim — derivado do scroll position via Lenis/framer internals; não é hardcoded | FLOWING |
| `FunnelBoard.tsx` | `FUNNEL_COPY` | `src/content/funnel.ts` (static locked copy) | Sim — `as const satisfies FunnelCopy`, 4 beats completos | FLOWING |
| `FunnelBoard.tsx` | `boardWidth` | `ResizeObserver` + `clientWidth` | Sim — medição real do DOM, debounce 150ms | FLOWING |
| `FunnelRail.tsx` | `railWidth` | `clientWidth` via resize listener | Sim — mesma estratégia que o board | FLOWING |

Nota: a seção é estática quanto a dados (não fetch de API). O "dado" é a posição do scroll, derivada em tempo real das primitivas congeladas. Não há dados vazios nem estáticos fakes.

---

## Spot-Checks Comportamentais

| Comportamento | Comando | Resultado | Status |
|---------------|---------|-----------|--------|
| Commits Phase 9 (9 total) existem no histórico | `git cat-file -e <hash>` × 9 | Todos retornaram EXISTS | PASS |
| `#7c3aed` hex ausente em `src/sections/Funnel/` | `grep -rn "#7c3aed\|#7C3AED" src/sections/Funnel/` | Sem saída | PASS |
| `useScroll`/`useMotionValue` ausentes em `src/sections/Funnel/` | `grep -rn "useScroll\|useMotionValue\b" src/sections/Funnel/` | Sem saída | PASS |
| `vh` raw ausente em `src/sections/Funnel/` | `grep -rn "vh\]" src/sections/Funnel/` | Apenas comentário JSDoc (linha 16 do index.tsx, não CSS) | PASS |
| HowItWorks completamente removido | `ls src/sections/HowItWorks/`, `ls src/content/how-it-works.ts` | DIR_NOT_FOUND / FILE_NOT_FOUND | PASS |
| FUNIL-* no REQUIREMENTS.md | `grep -E "FUNIL-*" .planning/REQUIREMENTS.md \| wc -l` | 15 matches | PASS |
| `section="funnel"` + import Funnel em page.tsx | `grep -n "section=\"funnel\"\|from \"@/sections/Funnel\""` | 2 matches (L7 + L31) | PASS |
| Only `Check` icon from lucide-react | `grep -rn "lucide-react" src/sections/Funnel/` | Somente `{ Check }` nos 3 arquivos que usam ícone | PASS |
| Tokens `--color-funnel-*` no globals.css | `grep -rn "color-funnel-" src/app/globals.css` | 3 tokens + `.funnel-atmosphere` | PASS |

**Step 7b: SKIPPED** para a travessia visual (scroll-driven, requer browser real). Step 7b executado para checks programáticos acima.

---

## Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `src/sections/Proof/ProofBackground.tsx` | 4, 15 | Comentários mencionando "HowItWorks" (stale prose) | INFO | Não quebrável — comentário descritivo, não código. Limpeza cosmética opcional. |
| `src/sections/Proof/index.tsx` | 7 | Comentário mencionando "HowItWorks" (stale prose) | INFO | Idem — não quebrável. |

Nenhum anti-padrão bloqueante encontrado nos arquivos da Phase 9.

---

## Cobertura de Requisitos

| Requisito | Plano Fonte | Descrição | Status | Evidência |
|-----------|-------------|-----------|--------|-----------|
| FUNIL-01 | 09-01, 09-02, 09-03 | Travessia via ScrollScene+StickyStage; zero motion.div direto fora do render-prop | SATISFEITO | `index.tsx` L28; invariants test A passa; sem `useScroll`/`useMotionValue`. |
| FUNIL-02 | 09-01, 09-02 | Zero número/KPI/%/gráfico/taxa/contador/dashboard na seção | SATISFEITO | `funnel-no-metric.test.ts` passa; grep manual retorna vazio; `%` nas frações de CSS (`.w-3/5`) não são strings de porcentagem. |
| FUNIL-03 | 09-02 | Clímax roxo exclusivo na coluna 4 (borda+glow+anel+seal); roxo proibido nas colunas 1-3 | SATISFEITO | `FunnelBoard.tsx` L93 + `FunnelColumn.tsx` estado `win`; colunas 1-3 usam neutro `rgba(255,255,255,0.18)`. |
| FUNIL-04 | 09-02 | `prefers-reduced-motion` entrega estado final pré-montado sem scrub/dead-scroll | SATISFEITO (código) | `index.tsx` L60-91; `FunnelBoard`/`FunnelRail` recebem `finalState`. Validação visual OS: human_verification #2. |
| FUNIL-05 | 09-02 | Mobile renderiza rail (≤639px, ~420svh) sem duplicar componente — mesma fonte de progress | SATISFEITO (código) | `index.tsx` L62 + `FunnelStageBody`; `FunnelRail.tsx` usa mesmo progress. Validação visual: human_verification #1. |
| FUNIL-06 | 09-03 | HowItWorks absorvido e removido; ordem final Product → Funnel → Proof | SATISFEITO | 8 arquivos deletados confirmados; `page.tsx` + `coherence.test.ts` atualizados. |
| FUNIL-COPY | 09-01, 09-02 | Copy travada em `src/content/funnel.ts`; zero string hard-coded em JSX; todos os valores exatos; sem Messenger/Facebook | SATISFEITO | `funnel.ts` exporta todas as strings; `funnel.test.ts` 8/8 assertions passam; sem strings inline nos arquivos da seção. |

**Requisitos órfãos:** nenhum. Os 7 IDs FUNIL-* mapeados a Phase 9 foram todos verificados.

---

## Verificação Humana Necessária

### 1. Mobile Rail — Rail de 4 Chips + Card Centrado (FUNIL-05)

**Teste:** Acessar a página no dev server em um viewport ≤639px (ex: iPhone 390px no Playwright ou dispositivo real). Rolar devagar pela seção Funil (≈420svh de comprimento).

**Esperado:**
- Rail horizontal de 4 chips no topo ("Chegou agora" → "Em atendimento" → "Escolhendo horário" → "Consulta marcada")
- Um marcador de ponto avança da esquerda para a direita conforme o scroll
- O chip da etapa atual acende (texto primário)
- Um único MarinaCard grande e legível no centro crossfade entre os 4 conteúdos de beat (channel + moment)
- No clímax (scroll final): chip 4 + card ignitam roxo; tag "Consulta confirmada · quinta, 14h" + Check aparecem
- Nenhum squash de 4 colunas em tela estreita

**Por que precisa de humano:** `FunnelRail` é DOM net-new (sem protótipo aprovado previamente). O comportamento scroll-driven em touch/mobile não é reproduzível headless com precisão. Os testes de unidade cobrem disciplina de código mas não a progressão visual.

### 2. prefers-reduced-motion — Estado Final Pré-Montado (FUNIL-04)

**Teste:** Ativar "Reduce Motion" no OS (macOS: Acessibilidade → Exibição → Reduzir Movimento; Windows: Facilidade de Acesso → Exibição → Mostrar animações). Recarregar a página. Rolar até a seção Funil.

**Esperado:**
- A seção ocupa apenas 1 viewport de altura (sem ~5 telas de scroll morto)
- Marina já aparece na coluna 4 ("Consulta marcada") com roxo aceso
- Tag "Consulta confirmada · quinta, 14h" + ícone Check visíveis
- Nenhuma animação de travessia, nenhum scrub
- A frase de fechamento está visível logo abaixo

**Por que precisa de humano:** O caminho `reduced` depende do toggle de OS e de verificação visual no browser real. Não é reproduzível via Playwright headless sem controlar a media query `prefers-reduced-motion` no nível do sistema operacional.

---

## Resumo de Gaps

Nenhum gap bloqueante encontrado. A Phase 9 atingiu o seu objetivo: a seção Funil cinematográfica escura está construída e wired na página na posição Product → Funnel → Proof, com travessia scroll-driven via primitivas congeladas, clímax roxo exclusivo na coluna 4, HowItWorks completamente removido, e toda a copy travada em `src/content/funnel.ts`.

Os 2 itens de verificação humana são validações visuais de comportamentos que foram implementados corretamente no código mas que não foram re-verificados visualmente nesta sessão (conforme explicitado no próprio 09-03-SUMMARY):

- Desktop @1536×730: verificado via Playwright na sessão de execução (commit `96e543d`)
- Mobile rail e reduced-motion: implementados e cobertos por testes unitários, mas não re-verificados visualmente nesta sessão

---

_Verificado: 2026-06-15T15:30:00Z_
_Verificador: Claude (gsd-verifier)_
