# 07 — HUMAN-UAT · Phase 7 (SEO / A11y / Performance / Deploy Hardening)

> Checklist de verificação manual da Phase 7. Cobre tudo que **não** pode ser automatizado:
> gates numéricos (Lighthouse / Core Web Vitals), ferramentas externas (Rich Results Test,
> validadores de OG), device matrix real e itens de setup bloqueados.
>
> Derivado de `07-RESEARCH.md` § Validation Architecture (tabela Manual-Only Verifications)
> e `07-VALIDATION.md` (Manual-Only Verifications + External Blockers).
>
> **Como usar:** percorra cada item, execute os passos, marque `[x]` quando passar e anote
> o resultado real no campo `Resultado:`. Cada item tem um ID estável (`B1`, `B2`, …) para
> rastreio. Pendências da Seção E são aceitáveis — não são gaps da phase.

**Pré-requisito de todas as seções A–D:** existe um deploy `.vercel.app` atualizado com o
código da Phase 7. Como o auto-deploy GitHub→Vercel está bloqueado (ver item `B14`), rode um
deploy manual antes de começar:

```bash
vercel --prod
```

Anote a URL de produção aqui antes de começar — todos os itens A–D usam ela:

`URL de produção:` `https://likro-landing-page.vercel.app` (deploy `vercel --prod` em 2026-05-23)

**Nota de canonicalização (afeta B8/B9/B10):** com `VERCEL_ENV=production`, o `getSiteUrl()` (07-04) retorna o domínio canônico `https://likro.com.br` em todas as meta tags absolutas (og:url, og:image, twitter:image, canonical, JSON-LD url). Como o DNS de `likro.com.br` ainda não está configurado, os validadores externos de OG (B8/B9/B10) vão falhar agora — não por bug, mas por DNS pendente. **Decisão (Lenny, 2026-05-23): adiar B8/B9/B10 como pendência conhecida — revalidar após DNS apontar.** Não bloqueia a Phase 7.

---

## Seção A — Performance (gates numéricos)

Medir contra a URL `.vercel.app` de produção. Ferramenta: Lighthouse no Chrome DevTools
(aba Lighthouse → modo Navigation) **ou** PageSpeed Insights web (`pagespeed.web.dev`).
Rodar **duas vezes**: um relatório Mobile e um relatório Desktop.

- [ ] **B1 — PERF-01: Lighthouse Performance ≥ 90 desktop / ≥ 85 mobile**
  - Como: abrir a URL de produção no Chrome → DevTools (F12) → aba **Lighthouse** → escolher
    *Device: Desktop*, categoria *Performance*, *Analyze page load*. Repetir com *Device: Mobile*.
    Alternativa: colar a URL em `pagespeed.web.dev` (já roda mobile + desktop).
  - Esperado: score Performance **≥ 90 no desktop** e **≥ 85 no mobile**.
  - `Resultado:` desktop ____ / mobile ____

- [ ] **B2 — PERF-02: LCP < 2.5s mobile / < 2.0s desktop**
  - Como: no **mesmo relatório Lighthouse** da B1, ver a métrica *Largest Contentful Paint*.
  - Esperado: LCP **< 2.5s no mobile** e **< 2.0s no desktop**.
  - `Resultado:` desktop ____ s / mobile ____ s

- [ ] **B3 — PERF-03: CLS < 0.1 em todos os breakpoints**
  - Como: ver *Cumulative Layout Shift* no relatório Lighthouse. Confirmar também
    redimensionando a janela (mobile ~375px, tablet ~768px, desktop ~1280px) e observando
    se algum elemento "pula" durante o load.
  - Esperado: CLS **< 0.1** em mobile, tablet e desktop.
  - `Resultado:` ____

- [ ] **B4 — PERF-04: INP < 200ms**
  - Como: no relatório Lighthouse ver *Interaction to Next Paint* (ou *Total Blocking Time*
    como proxy no lab). Para medição de campo real, abrir o painel **Performance** do DevTools,
    gravar enquanto interage (clicar CTAs, abrir/fechar elementos) e ver o INP reportado.
    Speed Insights da Vercel (07-05) também acumula INP de produção no dashboard.
  - Esperado: INP **< 200ms**.
  - `Resultado:` ____ ms

- [ ] **B5 — PERF-06: peso total da página ≤ 1.5MB mobile**
  - Como: DevTools → aba **Network** → ativar throttling *Fast 3G* ou *Slow 4G* + device toolbar
    em modo mobile → recarregar a página com cache desativado (*Disable cache*) → ver o
    *transfer size* total na barra inferior do Network.
  - Esperado: soma de transfer **≤ 1.5 MB** no carregamento mobile.
  - `Resultado:` ____ MB

- [ ] **B6 — PERF-05 (referência, já medido): First Load JS**
  - Não precisa medir aqui — apenas registrar. O plan 07-05 mediu via `npm run build`:
    a rota `/` está em **159 kB First Load JS**, ~9 kB acima do gate de 150 KB.
    Há um follow-up registrado no `07-05-SUMMARY.md` (tree-shaking `@radix-ui`, lazy-load
    do `sonner`/Toaster, footprint do `framer-motion`) a priorizar **após** a medição
    Lighthouse desta seção. Se a B1 passar com folga, o excedente de bundle pode ser aceito
    para a v1; se a B1 falhar no mobile, o follow-up vira gap prioritário.
  - `Resultado:` First Load JS atual ____ kB (rodar `npm run build` se quiser revalidar) — gate B1 passou? ____

---

## Seção B — SEO / OG (ferramentas externas)

- [x] **B7 — SEO-07: JSON-LD validado no Google Rich Results Test**
  - Como: abrir `search.google.com/test/rich-results` → colar a URL de produção → *Test URL*.
  - Esperado: **Organization** e **WebPage** detectados, **zero erros** (avisos sobre campos
    recomendados opcionais — ex. `sameAs` — são aceitáveis; `sameAs` foi omitido de propósito
    no 07-02 porque os perfis sociais não foram confirmados).
  - `Resultado:` PASS estrutural (curl direto no HTML em 2026-05-23): ambos `<script type="application/ld+json">` presentes, `@type: Organization` e `@type: WebPage`, `inLanguage: pt-BR`, schema válido. Rich Results Test web pendente — adiado junto com B8/B9/B10 até DNS (a ferramenta também segue redirects/canônicos).

- [ ] **B8 — SEO-03: preview da arte OG no validador da Meta (Sharing Debugger) — ADIADO ATÉ DNS**
  - Como: abrir `developers.facebook.com/tools/debug` → colar a URL de produção → *Debug*.
  - Bloqueio atual: og:image aponta pra `likro.com.br/opengraph-image`, DNS ainda não resolve.
  - `Resultado:` adiado — revalidar após DNS de `likro.com.br` ativo (não é gap da phase).

- [ ] **B9 — SEO-03: preview real da OG no WhatsApp — ADIADO ATÉ DNS**
  - Mesmo bloqueio que B8.
  - `Resultado:` adiado — revalidar após DNS.

- [ ] **B10 — SEO-03: preview real da OG no LinkedIn — ADIADO ATÉ DNS**
  - Mesmo bloqueio que B8.
  - `Resultado:` adiado — revalidar após DNS.

- [x] **B11 — SEO/robots: header X-Robots-Tag em deploy não-produção**
  - Como: pegar uma URL de **preview** `.vercel.app` (não a de produção) e rodar:
    `curl -I https://<preview>.vercel.app` — observar o header de resposta.
  - Esperado: `X-Robots-Tag: noindex, nofollow` presente na preview; **ausente** na produção.
  - `Resultado:` PASS lado produção (`curl -I https://likro-landing-page.vercel.app` em 2026-05-23 — header ausente, como esperado). Lado preview adiado até gerar preview deploy (pode ser feito junto com a revalidação pós-DNS).

---

## Seção C — Acessibilidade (ferramenta + olho humano)

- [ ] **B12 — A11Y-01: contraste (axe DevTools)**
  - Como: instalar a extensão **axe DevTools** no Chrome → abrir a URL de produção →
    DevTools → aba *axe DevTools* → *Scan all of my page*. Conferir especialmente os pares
    das seções **DARK** (Pain, Proof) listados no `07-03-SUMMARY.md` — o par mais apertado
    é `text-on-dark-muted` em 5.35:1.
  - Esperado: **zero violações de contraste** (a auditoria de cálculo do 07-03 já deu PASS;
    isto confirma com a ferramenta no render real).
  - `Resultado:` ____

- [ ] **B13 — A11Y-02: navegação por teclado**
  - Como: na URL de produção, clicar uma vez na barra de endereço e depois percorrer o site
    inteiro **só com a tecla Tab** (Shift+Tab para voltar). Ordem esperada:
    skip-link → header (logo + CTA) → CTAs do conteúdo → campos do form → CTA flutuante.
    Apertar Enter no skip-link logo no início deve saltar o foco para `#main-content`.
  - Esperado: **foco visível** (anel roxo) em todos os elementos interativos, ordem lógica,
    skip-link funciona, nenhum foco "preso" ou invisível.
  - `Resultado:` ____

- [ ] **B14 — A11Y-04: prefers-reduced-motion**
  - Como: ativar a redução de movimento no sistema operacional e recarregar a página:
    - **macOS:** Ajustes do Sistema → Acessibilidade → Tela → *Reduzir movimento*.
    - **Windows:** Configurações → Acessibilidade → Efeitos visuais → *Efeitos de animação* OFF.
  - Esperado: todas as animações scroll-based simplificam ou desligam (conteúdo aparece no
    estado final imediatamente), **nada quebra**, layout intacto.
  - `Resultado:` ____

---

## Seção D — Mobile (device matrix real)

- [ ] **B15 — MOBILE-07: device matrix real**
  - Como: abrir a URL de produção em pelo menos:
    - **iPhone** (iOS Safari)
    - **Android mid-tier** (Chrome)
    - **iPad** (Safari) — se disponível
  - Verificar em cada device: layout sem quebra, CTAs grandes o suficiente para tocar
    (≥44px — corrigido no 07-07), scroll fluido, **sem overflow horizontal** (a página não
    "vaza" para os lados).
  - `Resultado:` iPhone ____ / Android ____ / iPad ____

- [ ] **B16 — MOBILE-04: decisão final do Lenis em touch**
  - Como: no **iPhone real**, rolar a página de cima a baixo algumas vezes. Sentir se o
    scroll está natural — sem atrito, sem lag, sem "borracha" estranha. O 07-07 manteve
    `syncTouch: false` (touch usa scroll nativo); esta é a validação final dessa decisão.
  - Esperado: scroll touch natural e fluido.
  - Se houver atrito/lag → **ação de follow-up:** pular o init do Lenis em `pointer: coarse`
    (registrar como follow-up, não como gap bloqueante da phase).
  - `Resultado:` ____

---

## Seção E — Itens de setup / bloqueios (ação do Lenny)

> Estes itens **não contam como gap da Phase 7** — são pendências externas/de setup.
> Registrar o estado de cada um; a phase pode fechar com eles em aberto.

- [ ] **B17 — DEPLOY-01/02: GitHub→Vercel auto-deploy (BLOQUEADO — pendência externa)**
  - Estado: a conta `lennywajcberg` **não tem push** no repo `likro/likro-landing-page`
    (erro 403). Por isso o auto-deploy contínuo via GitHub está bloqueado e os deploys da
    v1 são **manuais via `vercel` CLI**.
  - Ação do Lenny: virar colaborador da org `likro` (ou ajustar o `remote` do git), depois
    conectar o repo ao projeto na Vercel para ligar o auto-deploy.
  - **Não é gap da phase** — é bloqueio de acesso. Marcar `[x]` quando resolvido ou registrar
    que segue pendente.
  - `Resultado:` ____

- [ ] **B18 — DEPLOY-03: configurar as 3 env vars de analytics na Vercel**
  - Estado: pendente da Phase 6 Parte B. O `.env.example` (07-07) já documenta todas as vars.
  - Ação do Lenny: no painel da Vercel (Project → Settings → Environment Variables),
    configurar nos **3 escopos** (Production + Preview + Development):
    - `NEXT_PUBLIC_GA4_ID`
    - `NEXT_PUBLIC_META_PIXEL_ID`
    - `NEXT_PUBLIC_CLARITY_ID`
  - As demais (`NEXT_PUBLIC_WA_NUMBER`, `RESEND_*`, `GOOGLE_*`) já estão configuradas.
  - `Resultado:` ____

- [ ] **B19 — PERF-08: prints reais de produto**
  - Estado: o site usa **apenas mockups CSS** hoje — não há `next/image` com prints reais.
  - Ação do Lenny: se houver prints reais do produto Likro, entregá-los para um swap futuro
    via `next/image` (vira plano futuro). Se não houver, **PERF-08 fica como "otimizado o que
    existe"** — sem manifesto de imagens inventado, conforme o invariante de credibilidade
    do projeto.
  - `Resultado:` ____

---

## Seção F — Sign-off

- [ ] **B20 — Suíte de testes automatizada verde**
  - Como: `npm test` + `npm run typecheck` + `npm run lint` — tudo passa (warning
    pré-existente em `analytics.ts:80` é conhecido e fora de escopo).
  - `Resultado:` ____

- [ ] **B21 — Seções A–D marcadas pass**
  - Todos os gates numéricos (A) passaram, ferramentas externas de SEO (B) OK, acessibilidade
    (C) sem violações, device matrix (D) OK. Se algum gate falhar, descrever abaixo — vira
    gap para `/gsd-plan-phase --gaps`.
  - `Gates que falharam (se houver):` ____

- [ ] **B22 — Pendências da Seção E registradas**
  - O estado de B17/B18/B19 está anotado acima como pendência (não como falha da phase).
  - `Resultado:` ____

- [ ] **B23 — Aprovação final do Lenny**
  - Digite "aprovado" se todos os gates A–D passaram (pendências da Seção E são aceitáveis),
    ou descreva os gates que falharam.
  - `Aprovação:` ____
  - `Data:` ____
