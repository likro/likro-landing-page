# Phase 8 — Validação da Travessia (08-VALIDATION)

**Status:** Harness documentado + checklist objetivo preenchido por code-read. Captura dos 5 screenshots e os 2 testes de aceite (TVER-01 final + TVER-02) são **passos do orchestrator/humano** (Playwright MCP + Lenny no browser real) — ver "Execução do harness" e "TVER-02 — gate humano (pendente Lenny)".

**Rota:** `/preview` (gated — `assertDevAccess()` → 404 em produção). O harness roda **só em dev**.

---

## 1. TVER-01 — Teste dos 5 quadros

### O que prova
Os 5 screenshots em progress `{0, 0.25, 0.5, 0.75, 1}` devem ser **5 momentos distintos da MESMA jornada** — visualmente diferentes entre si (nenhum repete outro) e **monotônicos**: frio→quente, disperso→contido, roxo aparecendo só no fim. Nada volta ao começo. É o critério objetivo que sustenta a sensação de jornada percorrida (TVER-02).

### Os 5 momentos esperados (mapeados no progress)
| Frame | progress | Estado esperado | Screenshot |
|-------|----------|-----------------|------------|
| 00 | `0.00` | Caos frio/distante/disperso — wide, vinheta fechada, frio (violeta-azul), turbulento, dim. A clínica afogada. | `uat-08-frame-00.png` |
| 25 | `0.25` | Entrada — hero exit entregou (copy dissolveu); `z` começa a cair → expansão radial (avanço). | `uat-08-frame-25.png` |
| 50 | `0.50` | Travessia/convergência — passa *através*; poeira lerpa pros alvos (faixas de fluxo tomando forma); esquenta; primeiras partículas próximas começam a acender. | `uat-08-frame-50.png` |
| 75 | `0.75` | Quase-ordem — estrutura tomando forma; oclusão + perspectiva atmosférica dão volume; calor/clareza crescendo; footprint contraindo. | `uat-08-frame-75.png` |
| 100 | `1.00` | Ordem conquistada — assentada, quente, limpa, contida (íntima), roxo no auge da escassez. A chegada. | `uat-08-frame-100.png` |

### Critério objetivo (PASS quando)
- [ ] Os 5 frames são **visualmente distintos** (distância perceptível entre estados; nenhum frame é indistinguível de outro).
- [ ] A sequência é **monotônica**: temperatura frio→quente (atlas `COLD`→`WARM`), dispersão→contenção (footprint `1.0`→`0.42`), brilho `0.82`→`1.12`, roxo escasso só acendendo perto da chegada (`purpleProgress = clamp((progress-0.5)/0.5)`).
- [ ] **Nada volta ao começo** — o frame 100 não se parece com o 00; o roxo não aparece antes de ~0.5.

> Stills NÃO capturam a sensação completa (08-CONTEXT §specifics) — o harness dos 5 quadros serve só pra provar a **distinção entre momentos**. A régua final da experiência é o Lenny rolando no browser (TVER-02).

### Execução do harness (Playwright MCP — orchestrator-run)

> **NOTA:** Playwright NÃO está instalado como dependência. Usar o **Playwright MCP** (`mcp__plugin_playwright_playwright__*`). O executor GSD não tem esse MCP nem sobe dev server — estes passos rodam no orchestrator/sessão com MCP.

**Pré-requisito:** subir o dev server em background gerenciado (`npm run dev` — portas 3000–3010 podem estar ocupadas; checar a porta efetiva no terminal). NÃO usar subshell `&` que morre.

**Scroll determinístico** a partir do rect do palco (a seção tem `min-h-[320svh] sm:min-h-[360svh]`; progress = `clamp(-rect.top / (rect.height - innerHeight), 0, 1)` — o palco preso). Para cada `targetProgress ∈ {0, 0.25, 0.5, 0.75, 1}`:

```js
// Avaliar no browser via Playwright MCP, por targetProgress:
async function scrollToProgress(targetProgress) {
  // rect absoluto da seção do palco (a única <section> de /preview)
  const section = document.querySelector('section[aria-labelledby="hero-headline"]');
  const rect = section.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;          // topo absoluto da seção
  const travel = rect.height - window.innerHeight;        // distância scrubável
  const y = sectionTop + targetProgress * travel;         // scrollY determinístico
  window.scrollTo(0, y);                                   // (Lenis pode suavizar; ver nota)
}
```

**Passos por frame:**
1. Navegar `/preview` (porta efetiva do dev server).
2. Aguardar mount pós-hidratação do canvas (o `<LightField>` só monta após `mounted=true`) + alguns frames de estabilização.
3. `scrollToProgress(p)` para `p` no conjunto.
4. Aguardar estabilização (Lenis tem inércia — aguardar o scroll assentar; opcionalmente desabilitar o smooth ou aguardar ~400–600ms / RAFs).
5. Capturar 1 screenshot → salvar como `uat-08-frame-{00,25,50,75,100}.png` na **raiz do projeto** (padrão dos UATs anteriores).

> **Nota Lenis:** o smooth-scroll tem inércia; confirmar via `progress.get()` ou observar o `-rect.top` que o frame realmente assentou no alvo antes de capturar. Como o progress é lido do rect por RAF, o canvas reflete a posição real de scroll — basta esperar o assentamento.

**Anexar:** os 5 PNGs ficam referenciados nesta tabela; o julgamento distinto/monotônico (objetivo) + o veredito humano (TVER-02) fecham o gate.

---

## 2. Checklist objetivo TPRF / TACC / TBND

### TPRF — Performance (mobile é sagrado)
| Check | Método | Resultado |
|-------|--------|-----------|
| **1 RAF de desenho** (canvas) | code-read `LightField.tsx`: um único `loop` com `requestAnimationFrame` desenha o campo. O RAF do `Travessia.tsx` é separado e só **seta a MotionValue** de progress (não desenha) — padrão "2 rAFs leves desacoplados, zero React state por frame" do 08-01. | ✅ PASS |
| **Canvas pós-hidratação** | code-read: `<LightField>` só renderiza com `{mounted && ...}` após `useEffect(setMounted)`. O LCP é a headline + atmosfera estática (já no DOM). | ✅ PASS |
| **Progress sem React state por frame** | code-read: o loop lê `progressRef.current` (subscrito de `progress.on("change")`); o palco usa `useMotionValue`. Nenhum `setState` no caminho do scroll. | ✅ PASS |
| **DPR ≤ 1.5** | code-read: `dpr = Math.min(window.devicePixelRatio||1, dprCap)`, `dprCap` inicia em `1.5` (e o ladder pode baixar pra `1.0` sob carga). | ✅ PASS |
| **Zero `ctx.filter`/`shadowBlur` por frame** | grep `LightField.tsx`: 0 matches. Blur é **assado** no atlas de sprites no mount. | ✅ PASS |
| **Pause offscreen/aba oculta** | code-read: `active` (IntersectionObserver + `visibilitychange`) + `document.hidden` → `return` cedo no loop. | ✅ PASS |
| **Ladder de degradação (TPRF-03)** | code-read: média móvel do tempo de frame (`performance.now()` em torno de `drawFrame`); acima de `FRAME_BUDGET_MS=23` → degrau 1 `drawFraction=0.6` (count↓), degrau 2 `dprCap=1.0`+`resize()` (dpr↓). Degraus 3–4 (ruído↓/estático) documentados como fallback. | ✅ PASS (code) |
| **Lighthouse mobile** — LCP não regride vs ~2.3s, CLS=0 | **Orchestrator-run** (Playwright/Lighthouse contra a rota dev — `/preview` é gated). Caixa do palco reservada em `svh` ⇒ CLS=0 esperado por construção; canvas pós-hidratação não é LCP. | ☐ PENDENTE (orchestrator) |
| **fps ≥ ~50 no campo (mid-tier)** | **Orchestrator-run** (DevTools/Performance enquanto rola). O ladder protege o piso. | ☐ PENDENTE (orchestrator) |

### TACC — Acessibilidade / segurança vestibular
| Check | Método | Resultado |
|-------|--------|-----------|
| **reduced-motion mata o optic flow** | code-read: `if (reduced)` → `drawFrame(0.92, 0, false)` (estado ordenado, `animate=false`), **sem RAF macro** (só redraw em resize). Sem z-travel por progress, sem shimmer no tempo. | ✅ PASS |
| **Profundidade ESTÁTICA + atmosfera mantidas** | code-read: projeção focal, baldes de oclusão e atlas de blur continuam no quadro estático; `Travessia.tsx` cai pra valores estáticos do estado-DEPOIS (frio recuado, bloom/banho quentes, enquadramento íntimo). | ✅ PASS |
| **caos→ordem como antes/depois** | code-read: o end-state (ordenado, `progress~0.92`) é o "depois" desenhado por padrão; narrativa legível como dois estados, sem viagem vestibular. | ✅ PASS |
| **Invariantes vestibulares (TACC-02)** | code-read: Foco de Expansão = centro `(cx,cy)`, estável (nunca pan/rotaciona); fluxo acoplado ao scroll (nunca autoplay); parallax `0.3/0.4/0.5` (≤0.5); **sem rotação global** somada ao optic flow (`angle` é per-partícula via target-lerp, sem `globalAngle`/`ctx.rotate`). | ✅ PASS |
| **Toggle reduced-motion no browser** | **Orchestrator-run**: emular `prefers-reduced-motion: reduce` (Playwright/DevTools) → optic flow some, versão estática-premium aparece, história caos→ordem legível como antes/depois; **console sem erros JS**. | ☐ PENDENTE (orchestrator) |

### TBND — Brand / constraint
| Check | Método | Resultado |
|-------|--------|-----------|
| **brand-lock passa** | `npx vitest run tests/brand-lock.test.ts` → 3/3 PASS. Roxo só accent, via `rgba(124,58,237,…)` — zero hex de marca literal nos componentes. | ✅ PASS |
| **Sem WebGL** | grep `src/`: zero `getContext('webgl'` / `getContext("webgl"`. Só `getContext("2d")`. | ✅ PASS |
| **Sem `<video>` autoplay** | grep `src/`: zero `<video`. | ✅ PASS |
| **`/preview` 404 em produção** | code-read: `layout.tsx` chama `assertDevAccess()` (gate herdado VERCEL_ENV). | ✅ PASS |

---

## 3. Resumo objetivo

- **Código (executor GSD):** todos os checks de code-read TPRF/TACC/TBND **PASS**; `tsc --noEmit` limpo; `brand-lock` 3/3. reduced-motion estático-premium + ladder de degradação (2 degraus reais count→DPR) implementados e commitados (Task 1, `b76fff9`).
- **Browser (orchestrator):** captura dos 5 screenshots, Lighthouse mobile (LCP/CLS), fps no campo, toggle reduced-motion + console — **pendentes**, rodam com o dev server + Playwright MCP.
- **Humano (Lenny):** TVER-01 final + TVER-02 — gate de aceite no browser real (abaixo).

---

## 4. TVER-02 — gate humano (pendente Lenny)

**Não automatizável** — é o gate de aceite humano. O Lenny, no browser real (`/preview`, dev), confirma:

1. **TVER-01 (5 quadros):** rolando devagar do topo ao fim, percebe **5 momentos distintos e reconhecíveis** da MESMA jornada (caos frio/disperso → entrada → travessia/convergência → quase-ordem → ordem conquistada); nada volta ao começo. Comparar com os 5 screenshots desta validação.
2. **TVER-02 (retrospecto):** ao chegar no fim, olhar mentalmente pra trás — sentiu que **ATRAVESSOU um espaço** (não viu um efeito de fora)? O estado final parece **CONQUISTADO** (limpo, contido, quente, roxo no auge da escassez), claramente diferente do começo?
3. **Mobile:** abrir no celular (ou DevTools mobile) — a travessia recebe tratamento premium, fluida, sem jank.
4. **reduced-motion:** ativar "Reduzir movimento" no OS — confirmar que o optic flow some e a história caos→ordem ainda se lê como antes/depois, sem enjoo.

**Resume-signal:** Lenny digita **"aprovado"** se a travessia passa nos 2 testes de aceite, ou descreve o que ainda não entrega a sensação de jornada percorrida (vira insumo pra gap-closure).

---

*Phase: 08-hero-travessia-a-travessia-da-luz-milestone-v2-0*
*Harness + checklist objetivo: 2026-06-12. Screenshots + gate humano: pendentes (orchestrator + Lenny).*
