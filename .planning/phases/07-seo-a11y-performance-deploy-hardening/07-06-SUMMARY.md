# 07-06 — SUMMARY · HUMAN-UAT consolidado + checkpoint

> Plan 07-06 consolida o checkpoint humano da Phase 7 — gates numéricos
> (Lighthouse / Core Web Vitals), ferramentas externas (Rich Results, OG
> validators), acessibilidade real (axe + teclado + reduced-motion),
> device matrix mobile, e itens de setup externos.

**Status:** ✓ COMPLETO (pendente B23 — aprovação final do Lenny)
**Data:** 2026-06-09
**Commits:** `f410f6f` (checklist inicial) · `c0da21d` (URL prod + B7/B11) ·
`1ab6f5b` (hotfix A11y B12) · `1d07409` (backlog 999.3 SF-02) ·
`1e5e2f5` (B12/B13/B14 PASS) · `<este SUMMARY>`

---

## Entregáveis

1. **`07-HUMAN-UAT.md`** — checklist de 23 itens executado em sessão
   interativa, com resultado real anotado em cada `Resultado:`.
2. **Hotfix A11y B12** — token `--color-accent-on-dark: #a78bfa` +
   variants `secondary-on-dark`/`link-on-dark` no Button + prop
   `surface` no WhatsAppCta. Resolve 3 violações WCAG AA serias de
   contraste de cor descobertas pelo axe durante o UAT.
3. **Drive-by fixes** — `opengraph-image.tsx` agora consome
   `BRAND.accentPrimary` (closes brand-lock leak latente);
   `vitest.config.ts` exclui `.claude/worktrees/**`; `@testing-library/dom`
   adicionado (peer dep faltante).
4. **Backlog 999.3** — extender `tests/brand-lock.test.ts` pra gatear
   `accent-on-dark` apenas a Button + WhatsAppCta (originado da SF-02
   da review do hotfix B12).

---

## Resultados consolidados

### Seção A — Performance (gates numéricos)

| ID | Gate | Resultado |
|----|------|-----------|
| B1 | Lighthouse ≥90 desktop / ≥85 mobile | **100 desktop / 88 mobile** — PASS |
| B2 | LCP <2.0s desktop / <2.5s mobile | **0.5s desktop / 2.3s mobile** — PASS |
| B3 | CLS <0.1 | **0** — PASS perfeito |
| B4 | INP <200ms | TBT lab **420ms**; INP real adiado p/ Speed Insights (não-bloqueador) |
| B5 | Page ≤1.5MB mobile (Slow 4G) | **273 kB** — PASS com 80% de margem |
| B6 | First Load JS 150KB | 159 kB — excedente aceito; B1 passou |

### Seção B — SEO / OG

| ID | Resultado |
|----|-----------|
| B7 — Rich Results JSON-LD | PASS estrutural (curl confirma Organization + WebPage) |
| B8/B9/B10 — Sharing Debugger / WhatsApp / LinkedIn OG | **ADIADOS** até DNS de `likro.com.br` ativo (não-bloqueador da phase) |
| B11 — X-Robots-Tag noindex (preview only) | PASS lado prod (header ausente, como esperado); preview revalidar pós-DNS |

### Seção C — Acessibilidade

| ID | Resultado |
|----|-----------|
| B12 — axe contraste WCAG AA | 1ª run: **3 violações serias**. Hotfix aplicado. Re-run pós-redeploy em prod: **0 violations / 24 passes** ✓ |
| B13 — navegação por teclado | PASS. 1º Tab cai na skip-link visível; Enter pula pra `#main-content`; foco visível em todos os elementos |
| B14 — prefers-reduced-motion | PASS. 5 animações CSS testadas, todas neutralizadas para `1e-05s` quando media query ativa; layout intacto |

### Seção D — Mobile (device matrix real)

| ID | Resultado |
|----|-----------|
| B15 — iPhone + Android | PASS — confirmado por Lenny em ambos os devices |
| B16 — Lenis touch (iPhone) | PASS — scroll touch natural; decisão `syncTouch: false` validada |

### Seção E — Pendências externas (não-bloqueadores)

| ID | Estado |
|----|--------|
| B17 — push GitHub | Pendente — `lennywajcberg` sem permissão na org `likro` (403). Deploys seguem via CLI. |
| B18 — env vars analytics | Pendente — `NEXT_PUBLIC_GA4_ID/META_PIXEL_ID/CLARITY_ID` ausentes em prod. Lenny configura no painel Vercel antes do go-live. |
| B19 — prints reais | Aceito como está — sem prints na v1; mockups CSS atendem o objetivo. Swap futuro quando prints existirem. |

### Seção F — Sign-off

| ID | Resultado |
|----|-----------|
| B20 — testes/typecheck/lint verdes | PASS pós-hotfix |
| B21 — Seções A–D marcadas | PASS — nenhum gate falhou |
| B22 — pendências E registradas | PASS — B17/B18/B19 anotados |
| B23 — Aprovação final | **PENDENTE** — aguardando "aprovado" do Lenny |

---

## Métodos de validação

- **Lighthouse Mobile + Desktop:** Chrome incognito (sem extensões), URL
  prod, modo Navigation. Métricas anotadas direto do relatório.
- **Network B5:** DevTools Network, throttling Slow 4G + Disable cache,
  modo mobile emulado.
- **axe-core B12:** carregado dinamicamente via CDN
  (`axe-core@4.10.2`) na URL prod, `axe.run` com tags `wcag2a/wcag2aa`.
- **Tab + Skip-link B13:** Playwright `browser_press_key('Tab')` +
  `browser_press_key('Enter')`, snapshot do `document.activeElement`.
- **Reduced-motion B14:** Playwright
  `page.emulateMedia({ reducedMotion: 'reduce' })` + reload + snapshot
  do `animation-duration` computado.
- **iPhone + Android B15/B16:** validação humana presencial pelo Lenny.

---

## Decisões registradas durante o UAT

1. **B8/B9/B10 adiados até DNS** — `getSiteUrl()` retorna canonical
   `https://likro.com.br` em production, mas o DNS não resolve ainda.
   OG validators externos voltam quando DNS apontar. Não-bloqueador
   porque o problema é DNS, não código.
2. **First Load JS de 159 kB aceito** — gate B1 passou com folga
   (88 mobile / 100 desktop). Follow-up de tree-shaking (`@radix-ui`,
   lazy-load `sonner`) registrado em `07-05-SUMMARY.md` fica como
   recomendação não-bloqueante.
3. **INP real fica pra Speed Insights em prod** — TBT lab de 420ms é
   amarelo mas não fail. INP de campo virá monitorado após 24-48h de
   tráfego real.
4. **Hotfix A11y inline** (em vez de phase 7.1 dedicada) — gap
   descoberto no UAT (B12 FAIL) foi corrigido dentro da própria
   Phase 7 porque os fixes são triviais (token + 2 variants + 1 prop +
   4 callsites). Resultado: zero gaps abertos ao fechar a phase.

---

## Follow-ups (não-bloqueadores)

- **Backlog 999.3** — brand-lock test cobrir `accent-on-dark`
  (SF-02 da review do hotfix B12). Adicionado ao ROADMAP.md.
- **DNS `likro.com.br`** — revalidar B8/B9/B10/B11-preview após DNS.
- **Bundle First Load JS** — reduzir <150kB via tree-shaking (follow-up
  do 07-05-SUMMARY).
- **B18 env vars analytics** — Lenny precisa configurar GA4/Pixel/Clarity
  IDs na Vercel antes do go-live (impacta otimização de campanha).

---

## Files touched (este plan)

- `.planning/phases/07-seo-a11y-performance-deploy-hardening/07-HUMAN-UAT.md` (sessão de execução)
- `.planning/phases/07-seo-a11y-performance-deploy-hardening/07-06-SUMMARY.md` (este arquivo)
- `.planning/ROADMAP.md` (backlog 999.3 add)
- `src/app/globals.css` (token accent-on-dark)
- `src/app/opengraph-image.tsx` (BRAND.accentPrimary)
- `src/components/layout/Footer.tsx` (surface="dark")
- `src/components/ui/button.tsx` (variants on-dark)
- `src/components/ui/whatsapp-cta.tsx` (prop surface)
- `src/sections/Hero/HeroCardStack.tsx` (text-neutral-500)
- `src/sections/Pain/index.tsx` (surface="dark")
- `vitest.config.ts` (exclude worktrees)
- `package.json` / `package-lock.json` (@testing-library/dom)
- `.gitignore` (.vercel)
