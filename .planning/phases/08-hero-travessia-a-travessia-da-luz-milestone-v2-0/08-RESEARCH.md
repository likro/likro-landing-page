# Phase 8: Hero Travessia — Research

**Status:** RESEARCH COMPLETE
**Base:** A pesquisa profunda (5 agentes, nível diretor) já está em `.planning/research/HERO-V2-RESEARCH.md` — este doc é o recorte de **implementação** + **validação** pra esta fase. Leia o doc-base para o teardown Cairn, o catálogo técnico completo e as fontes.

## Decisão de stack (no-WebGL, dentro do constraint)
- **Canvas 2D** (não WebGL). Sprite de luz macia + glow pré-renderizados em offscreen (atlas), `drawImage` aditivo (`globalCompositeOperation='lighter'` só no núcleo brilhante).
- **Motion (framer)** pra transforms scrubbed da copy/atmosfera (`useTransform` sobre uma MotionValue de progress).
- **Lenis** já no root (`SmoothScrollProvider`), 1 RAF.
- **simplex-noise** (lib JS pequena) pra flow field orgânico num grid grosso — adicionar como dep se ainda não existir (`npm i simplex-noise`); alternativa: ruído por sin/cos em camadas (sem dep) se o budget pedir.

## 🔴 Gotcha crítico já descoberto (não repetir)
`useScroll({ target, offset:['start start','end end'] })` com **Lenis + sticky** comprime o progress (warning "non-static position"; progress mal sai de ~0). **Solução validada:** calcular progress manualmente num rAF a partir do rect da seção e setar uma `useMotionValue`:
`progress = clamp(-rect.top / (rect.height - innerHeight), 0, 1)`. O canvas lê `progress.get()` no próprio loop; a copy/atmosfera consomem via `useTransform`.

## Ordem de build sugerida (o planner refina em waves)
1. **Engine de progress + palco** — seção sticky alta, progress manual (rect→MotionValue), gate `/preview`, caixa reservada (CLS=0), mount do canvas pós-hidratação. (TRV-10, TPRF-02/04, TBND-03)
2. **Campo pseudo-3D base** — partículas com `z`, projeção (escala/alpha/tamanho), oclusão por baldes de profundidade, atlas de sprites assados, 1 RAF lendo progress. Sem narrativa ainda — só profundidade + deslocamento (optic flow: z↓ → expansão radial do FoE central). (TRV-01, TRV-03, TPRF-01)
3. **Caos→ordem por target-lerp** — alvos ordenados, lerp `easeInOutCubic`, ruído com envelope 1→0, 5 momentos no progress; arco de escala (contração do footprint + dolly + vinheta). (TRV-02, TRV-04, TRV-05, TRV-07)
4. **Atmosfera evolutiva** — vinhetas frio/tensão→quente/calma, bloom, grain, escuros tingidos, roxo escasso intensificando. (TRV-06, TBND-01)
5. **Copy + hero exit de vetores opostos** — headline/sub/CTA no topo, exit (campo recua / headline sobe+dissolve), copy some cedo. (TRV-08, TRV-09)
6. **Degradação & a11y** — `prefers-reduced-motion` (mata optic flow, estático-premium, caos→ordem como antes/depois), tiers mobile (count/DPR), pausa offscreen, ladder de degradação. (TACC-01, TACC-02, TPRF-03)
7. **Harness de validação + verificação** — Playwright 5-quadros, Lighthouse mobile, toggle reduced-motion, console limpo. (TVER-01, TVER-02, TPRF-01)

## Validation Architecture

Esta fase entrega uma **experiência perceptual** — a régua é humana (Lenny no browser), reforçada por verificações objetivas. Dimensões de validação:

- **TVER-01 — Teste dos 5 quadros (automatizável):** script Playwright que navega `/preview`, força progress = {0, .25, .5, .75, 1} (via scroll determinístico calculado do rect, como nas sessões anteriores), captura 5 screenshots. Critério objetivo: os 5 frames são visualmente distintos (distância perceptível entre estados; nenhum repete outro) e a sequência é monotônica (frio→quente, disperso→contido). Confirmação final: humana (Lenny).
- **TVER-02 — Teste do retrospecto (humano):** Lenny no browser real confirma que percorreu distância emocional/visual e que a chegada parece conquistada. Não automatizável — é o gate de aceite humano.
- **TPRF (objetivo):** Lighthouse mobile na rota → LCP não regride vs ~2.3s e CLS=0; checagem de fps (DevTools/Performance) ≥ ~50fps no campo em mid-tier; confirmar `1` RAF, canvas montado pós-hidratação, progress sem React state (code read).
- **TACC (objetivo):** toggle `prefers-reduced-motion` (emulado no Playwright/DevTools) → optic flow some, versão estática-premium aparece, história caos→ordem ainda legível como antes/depois; console sem erros JS.
- **TBND (objetivo):** `tests/brand-lock.test.ts` continua passando (roxo só accent); grep confirma sem WebGL/`<video>` autoplay; rota `/preview` 404 em produção (gate).

**Cobertura:** cada REQ-ID da fase tem ao menos uma checagem acima (objetiva) e/ou o gate humano (TVER-02). Plans devem incluir uma task `[BLOCKING]` de harness de validação antes da verificação final.

---
*Phase research consolidado 2026-06-11 — base em `research/HERO-V2-RESEARCH.md`.*
