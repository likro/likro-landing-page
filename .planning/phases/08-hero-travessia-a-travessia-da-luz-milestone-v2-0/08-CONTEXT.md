# Phase 8: Hero Travessia (A Travessia da Luz) — Context

**Gathered:** 2026-06-11
**Status:** Ready for planning
**Source:** Alinhamento profundo em conversa (estilo PRD express) + pesquisa `research/HERO-V2-RESEARCH.md`. Não houve `/gsd-discuss-phase` separado — todas as decisões abaixo foram travadas com o Lenny ao longo da definição da milestone v2.0.

<domain>
## Phase Boundary

Reconstruir **somente o Hero**, na rota isolada `src/app/preview/` (gated, 404 em produção), como **"A Travessia da Luz"**: uma única matéria de luz pseudo-3D que o usuário **atravessa** no scroll, evoluindo `caos → jornada → ordem` em **5 momentos distintos**, com profundidade e arco de escala (aberto→envolvente→íntimo), até passar os 2 testes de aceite.

**A produção (`/`) NÃO é tocada.** Integração só depois que o Lenny aprovar a travessia em `/preview` (milestone futura).

**O norte é a SENSAÇÃO de jornada percorrida, não um efeito impressionante.** "Efeito visual impressionante como fim em si" é não-objetivo explícito.

**🧭 PRINCÍPIO REGENTE (Lenny, ao aprovar a execução 2026-06-11):** se em QUALQUER ponto da construção surgir uma decisão que troque SENSAÇÃO por complexidade técnica, **priorizar a SENSAÇÃO**. Uma solução mais simples que faz o usuário SENTIR a travessia vale mais que uma solução tecnicamente impressionante que parece apenas um efeito visual. Na dúvida entre sofisticação técnica e a sensação de deslocamento/jornada, escolher a sensação.

Fora de escopo: outras seções, PDF/pricing, redesign completo, copy adicional além do hero no topo, "mais partículas/brilho/espiral/complexidade".
</domain>

<decisions>
## Implementation Decisions (locked)

### Mecânica central — "held camera" (deslocamento)
- **Palco preso (sticky) + scrub** é a fundação do deslocamento: prender o frame re-atribui o movimento do scroll pro espaço ("eu avanço", não "a página rola"). Seção alta (~320–360svh desktop, ≤350svh mobile) com um `sticky top:0 h-svh` dentro.
- **Progress 0→1 via cálculo MANUAL do rect da seção num rAF, alimentando uma `useMotionValue` — NÃO usar `useScroll({target, offset})` aqui.** 🔴 Bug já descoberto no protótipo: com Lenis + sticky, `useScroll({target})` comprimia o progress (mal saía de ~0; warning "non-static position"). A solução validada foi: `progress = clamp(-rect.top / (rect.height - innerHeight), 0, 1)` lido por frame, setando uma MotionValue. NÃO repetir o bug.
- **Scrubbed puro:** a macro-transformação é 100% amarrada ao scroll. Parar = descansa num quadro; rolar = avança. Só micro-vida (cintilação/shimmer ≤2px) roda no tempo. SEM relógio macro autônomo (sem loop ambiente) — isso foi reclamação direta do Lenny ("girava mas não acontecia nada / virava loop").

### A matéria — campo de luz pseudo-3D (profundidade + travessia)
- **Canvas 2D leve** (NÃO WebGL). Uma sprite de luz macia pré-renderizada + `drawImage` aditivo.
- **Pseudo-3D por partícula:** cada partícula tem `z`; projeção `escala = focal/(focal+z)`, `tamanho ∝ escala`, `alpha = f(z)`, a partir de um **Foco de Expansão central e estável**.
- **Deslocamento = optic flow:** diminuir `z` conforme o progress → partículas se expandem radialmente pra fora e crescem ("estou entrando"). Reciclar partículas que passam a câmera (voltam ao fundo, pequenas/dim) = travessia contínua sem custo de spawn.
- **Profundidade:** oclusão por **ordem de desenho** (far→near, usar **baldes de profundidade**, não sort por frame) + tamanho relativo + **perspectiva atmosférica** (longe = alpha menor + cor lerpada pro escuro do fundo; blur **pré-assado** em 3–5 sprites offscreen, NUNCA `ctx.filter`/`shadowBlur` por frame) + parallax sutil de camadas (razão 0.3/0.4/0.5, **nunca >0.5**).
- **Arco de escala (aberto→envolvente→íntimo):** combinar (a) dolly do optic flow, (b) **contração do footprint** do estado ordenado (caos espalhado por toda a tela → ordem numa região central contida), (c) **vinheta de enquadramento** que abre no meio e fecha no fim.

### Continuidade — caos → ordem (coesão)
- **UMA matéria só, morph de matéria compartilhada (target-lerp), NUNCA crossfade.** Cada partícula tem `targetX/Y/cor` no estado ordenado; ao longo do progress, `pos = lerp(caosPos, targetPos, easeInOutCubic(progress))` e a amplitude do ruído cai 1→0 (o alvo vence no fim). A poeira **condensa** na forma ordenada. Crossfade quebra o "um espaço" — proibido.
- **Ruído simplex/curl** num grid grosso (células 16–32px, amostra bilinear) pra vida orgânica que nunca repete exato (descoberta). Amplitude com envelope 1→0 do caos pra ordem.
- **Estado ordenado** = arranjo limpo/calmo (faixas de fluxo alinhadas / lattice / sugestão de estrutura), **NÃO literal** (sem cards de UI, dashboards, chat). Abstrato.

### Atmosfera (evolui junto, monotônica)
- Frio/tensão → quente/calma, contínuo e monotônico, acoplado ao scroll. Camadas: vinheta fria no topo (recua) + vinheta de tensão (fecha no caos, abre na calma) + bloom quente central (cresce) + banho quente de ambiente (no fim).
- **Luz com fonte, não decoração:** glows com fonte/direção, esparsos. **Escuros tingidos** (roxo-navy muito escuro, NUNCA `#000` — anti-banding + premium). **Film grain** overlay (mix-blend 3–7%) mata banding e dá textura.
- **Roxo `#7C3AED` escasso, intensifica na chegada** — só partículas próximas/resolvidas acendem em roxo. A escassez é o payoff. Neutros escuros perceptualmente uniformes (disciplina tipo Linear/LCH).

### Copy
- Copy do hero **só no topo** (headline Inter com ênfase em itálico da mesma família — "sua clínica"; sub; CTA WhatsApp + CTA secundário). **Hero exit de vetores opostos:** no 1º scroll, o campo recua/afunda enquanto a headline sobe + dissolve — entrega o usuário na travessia. Copy some cedo; o resto é luz pura (validar experiência visual sem texto antes de amplificar). Reusar `HERO_COPY` de `src/content/hero.ts`. CTA via `WhatsAppCta` existente.

### Os 5 momentos (mapeados no progress)
1. `~0.00` caos frio/distante/disperso (a clínica afogada) — wide, vinheta fechada, frio, turbulento, dim.
2. `~0.25` entrada — hero exit entrega; `z` começa a cair → expansão radial (avanço).
3. `~0.50` travessia/convergência — passa *através* (scale-through nas bordas); poeira lerpa pros alvos; esquenta; primeiras partículas próximas acendem roxo.
4. `~0.75` quase-ordem — estrutura tomando forma; oclusão + atmosférica dão volume; calor/clareza crescendo.
5. `~1.00` ordem conquistada — assentada, quente, limpa, contida (íntima), roxo no auge da escassez. A chegada.

### Performance (mobile é sagrado)
- Budgets: ~350–700 partículas mobile (mais no desktop, ex. ~900–1200, ajustável), **DPR ≤ 1.5**, **1 RAF único dono do Lenis**, sprites de luz/glow **pré-assados** (atlas offscreen), zero `ctx.filter`/`shadowBlur` por frame, coordenadas inteiras no `drawImage`.
- **Canvas monta pós-hidratação** (dynamic import / após interactive); o **LCP é a headline + atmosfera estática**, nunca o canvas. **CLS = 0** (caixa do palco reservada com `svh`/`dvh`).
- **Progress via MotionValue/ref — SEM React state por frame.** Canvas lê `progress.get()` no próprio RAF (protege INP).
- **Pausa** quando offscreen/aba oculta (IntersectionObserver + `visibilitychange`). Ladder de degradação em runtime: count → DPR → resolução do ruído → estático.
- LCP mobile não regride vs. produção atual (~2.3s).

### Acessibilidade & segurança vestibular
- `prefers-reduced-motion`: **mata o optic flow** (fonte de enjoo), mantém profundidade ESTÁTICA + atmosfera, e apresenta caos→ordem como **antes/depois** (estado de ordem por padrão, ou fade de opacidade ≤200ms) — narrativa intacta, sem movimento vestibular. Autorar **estático-premium primeiro**, adicionar o fluxo só atrás do check (`useReducedMotion` + `prefers-reduced-motion`).
- Foco de Expansão central e estável; fluxo acoplado ao scroll (nunca autoplay); velocidade do fluxo limitada; parallax ≤ 0.5; sem expansão+rotação+pan simultâneos. Reusar `useDeviceTier()` (já dá `'reduced'|'mobile'|'tablet'|'desktop'`).

### Validação (como provar que passou)
- **TVER-01 (5 quadros):** harness Playwright que rola pra 5 pontos de progress (0, .25, .5, .75, 1), tira 5 screenshots e os apresenta — devem ser 5 momentos distintos da mesma jornada (nada volta ao começo). Validação final é do Lenny no browser real.
- **TVER-02 (retrospecto):** validação humana do Lenny no browser real (distância emocional/visual relevante; chegada conquistada).
- **Perf/a11y:** Lighthouse mobile (LCP não regride, CLS=0) + checagem de fps no campo + toggle `prefers-reduced-motion` (versão estática-premium aparece).
- Pipeline padrão do Lenny: code review (skill `requesting-code-review`) → Playwright (caminho feliz + reduced-motion + mobile + console sem erro JS) antes de reportar.

### Claude's Discretion
- Contagem exata de partículas dentro do budget; curvas de easing exatas; valores de cor exatos dentro do brand; nº de sub-plans/waves; estrutura de arquivos dentro de `src/app/preview/_components/`; se reescreve `LightField.tsx`/`Travessia.tsx` do zero ou eleva o que existe (provável reescrita do campo pra pseudo-3D + manual progress).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pesquisa & contrato (a fonte da verdade desta fase)
- `.planning/research/HERO-V2-RESEARCH.md` — teardown Cairn corrigido, catálogo técnico no-WebGL (perception, held camera, depth-projected particle field, target-lerp, atmosfera, perf playbook, a11y), matriz técnica→sensação, budgets mobile. **Leitura obrigatória.**
- `.planning/PROJECT.md` › "Current Milestone: v2.0" — o contrato (emoção, caos→jornada→ordem, deslocamento, arco de escala, 2 testes, não-objetivos).
- `.planning/REQUIREMENTS.md` › "Milestone v2.0" — TRV/TVER/TPRF/TACC/TBND.

### Protótipo atual a elevar/reescrever
- `src/app/preview/page.tsx` — composição da rota (client).
- `src/app/preview/_components/Travessia.tsx` — palco sticky + progress MANUAL via rect (o padrão que funcionou) + atmosfera + copy.
- `src/app/preview/_components/LightField.tsx` — campo de luz canvas 2D atual (a reescrever pra pseudo-3D com z/optic-flow).
- `src/app/preview/layout.tsx` — gate server (404 em produção via `assertDevAccess`).

### Infra reutilizável (não reinventar)
- `src/hooks/use-device-tier.ts` — tiers reduced/mobile/tablet/desktop.
- `src/app/dev/_components/dev-gate.tsx` — `assertDevAccess()` (gate VERCEL_ENV).
- `src/content/hero.ts` — `HERO_COPY` (headline/sub/CTA/trust).
- `src/components/ui/whatsapp-cta.tsx` — `WhatsAppCta` (CTA WhatsApp via env).
- `src/components/ui/container.tsx` — `Container`.
- `src/app/globals.css` + `src/lib/brand-tokens.ts` — tokens de marca (roxo, surfaces dark, Inter, easing premium). Brand-lock: roxo só accent; teste `tests/brand-lock.test.ts`.
- `src/components/providers/smooth-scroll-provider.tsx` — Lenis (lazy, pós-idle; skip em reduced-motion) — já no root layout, `/preview` herda.
- `src/components/motion/` — primitivas (ScrollScene etc.) disponíveis, mas NOTA: o progress desta fase usa rect manual, não ScrollScene (ver decisão do bug).
</canonical_refs>

<specifics>
## Specific Ideas
- Stills NÃO capturam a sensação — a validação real é o Lenny rolando no browser. O harness de screenshots serve só pro teste dos 5 quadros (distinção entre momentos).
- O protótipo já provou: o "campo de luz vivo + cursor" agrada; o que faltava era deslocamento/profundidade/escala e a continuidade (sem loop). Esta fase resolve isso, não recomeça do zero.
- Servir o dev nesta máquina: subir `npm run dev` em background gerenciado (não subshell `&` que morre); portas variam (3000–3010 ocupadas em sessões anteriores).
</specifics>

<deferred>
## Deferred Ideas
- Copy adicional ancorada na jornada (2º/3º beat) — só depois que a experiência visual pura validar.
- Integração na produção `/` e propagação da linguagem pro resto da landing — milestone futura.
- Substituir mock CSS por prints reais / aplicar linguagem no PDF de preços — fora desta fase.
</deferred>

---

*Phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0*
*Context gathered: 2026-06-11 (alinhamento de milestone, estilo PRD express)*
