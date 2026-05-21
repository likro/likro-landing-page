# Phase 7: SEO + A11y + Performance + Deploy Hardening — Context

**Gathered:** 2026-05-21
**Status:** Ready for planning
**Source:** Express path — última fase da v1; consolidado após conclusão das Phases 1-6

<domain>
## Phase Boundary

Fase final da v1. É um **pente-fino de hardening** multi-stream sobre o site já construído e já deployado em produção (`https://likro-landing-page.vercel.app`). NÃO constrói features novas — audita, corrige e valida o que existe contra 37 requisitos em 5 streams: SEO, A11y, Performance, Mobile QA, Deploy.

**Estado de partida:** Phases 1-6 completas. Site no ar em produção. Alguns requisitos da Phase 7 já estão parcialmente satisfeitos por trabalho de fases anteriores (ver "Já feito" abaixo) — a Phase 7 verifica e completa.

### Streams

**SEO (11 reqs):** `<title>`/`<meta description>` otimizados, Open Graph completo + OG image 1200×630, Twitter Card, JSON-LD Organization + WebPage tipado via `schema-dts`, validação no Rich Results Test, HTML semântico (h1 único, hierarquia), alt text, `lang="pt-BR"`, noindex de preview.

**A11y (7 reqs):** contraste WCAG AA, navegação por teclado + foco visível, form com label/aria (já feito Phase 5), `prefers-reduced-motion`, skip-link, `<button>`/`<a>` semânticos, alt de imagens decorativas vs informativas.

**Performance (9 reqs):** Lighthouse ≥90 desktop / ≥85 mobile, LCP <2.5s mobile, CLS <0.1, INP <200ms, bundle JS ≤150KB first-load, peso página ≤1.5MB, lazy-load below-fold via `next/dynamic`, image manifest (~50 prints → 12-18 imagens via `next/image` AVIF/WebP), degradação em conexões lentas.

**Mobile QA (5 reqs):** `useDeviceTier()` em todo motion, tap targets ≥44×44px, Lenis touch behavior, hover→`:active` fallback, validação em device matrix real.

**Deploy (5 reqs):** GitHub→Vercel auto-deploy em `main`, preview deploys em PR, env vars configuradas, deploy `.vercel.app`, Vercel Speed Insights habilitado.

### Já feito em fases anteriores (Phase 7 só VERIFICA)
- **SEO-11** (noindex preview): `src/app/robots.ts` já discrimina `VERCEL_ENV`. Verificar header `X-Robots-Tag` também.
- **A11Y-03** (form label/aria-invalid/aria-describedby): feito na Phase 5 (`LeadForm.tsx`).
- **A11Y-04** (`prefers-reduced-motion`): primitivas de motion da Phase 2 respeitam; Header da Phase 5 também. Verificar cobertura total.
- **MOBILE-02** (safe-area floating): feito na Phase 5.
- **MOBILE-06** (header hide-on-scroll): feito na Phase 5.
- **DEPLOY-04** (`.vercel.app`): site já em produção.
- **MOBILE-01** (`useDeviceTier`): hook existe desde Phase 1 — auditar uso real nas seções.

Fora de escopo:
- Features novas, copy nova, redesign — nada disso.
- Backlog 999.1 / 999.2 (polish visual/editorial) — milestone futuro, NÃO entra na Phase 7.
- Verificação de analytics nos dashboards (Phase 6 Parte B) — continua pendente.
- Domínio próprio / DNS — explicitamente pós-launch (DEPLOY-04).

</domain>

<decisions>
## Implementation Decisions

### SEO (LOCKED)
- Metadata via **Next.js Metadata API** (`export const metadata` / `generateMetadata`) em `app/layout.tsx` e/ou `app/page.tsx`. Zero `react-helmet`.
- **OG image 1200×630**: gerar via `app/opengraph-image.tsx` (já existe um arquivo `opengraph-image` no projeto — auditar se está correto e com a arte certa) OU asset estático. Deve renderizar polido no preview de WhatsApp e LinkedIn (canais de aquisição).
- **JSON-LD** tipado via `schema-dts` (já em `package.json`): Organization (logo, sameAs Instagram/LinkedIn, contato) + WebPage. Injetado via `<script type="application/ld+json">` com `JSON.stringify`. Validar no Google Rich Results Test.
- `<title>` < 60 chars, `<meta description>` < 160 chars — nicho clínicas + Likro.
- Auditar hierarquia de headings: **uma única `<h1>`** (hero), `<h2>` por seção, `<h3>` subitens. Grep + leitura.
- Alt text: toda imagem informativa com `alt` descritivo; decorativas com `alt=""` + `role="presentation"`.

### A11y (LOCKED)
- Contraste WCAG AA: auditar todos os pares texto/fundo (incluindo texto sobre as seções DARK Pain/Proof). Ferramenta: axe DevTools ou Lighthouse a11y + checagem manual dos pares suspeitos. Corrigir o que falhar ajustando tokens — respeitando o brand book (roxo `#7C3AED` só como destaque).
- **Skip-link** "Pular para conteúdo principal" — adicionar no topo do `<body>`/layout, visível ao receber foco, salta pro `<main>`.
- Navegação por teclado: Tab atravessa header → CTAs → form → floating; foco visível com outline alinhado ao brand. Já há `focus-visible:ring-accent-primary` no Button (Phase 1) — auditar cobertura.
- Audit `<div onClick>` → trocar por `<button>`/`<a>`. Grep.
- `prefers-reduced-motion`: verificar que TODAS as animações (primitivas Phase 2, Header, floating, scroll-driven) simplificam. Validar em macOS Reduce Motion + Windows Animations off.

### Performance (LOCKED)
- Gate: Lighthouse Performance **≥90 desktop / ≥85 mobile** rodado contra a Vercel (produção ou preview limpa). LCP <2.5s mobile / <2.0s desktop, CLS <0.1, INP <200ms.
- Bundle: `@next/bundle-analyzer` (já em devDeps) — first-load JS ≤150KB gzipped (sem contar Pixel/GA4/Clarity). Se estourar, investigar (Motion, Lenis, lucide tree-shaking).
- Imagens: hoje o projeto usa mockups placeholder. PERF-08 fala em "~50 prints reais → 12-18 imagens" — **depende de assets reais do Lenny**. Se os prints finais não existirem, a Phase 7 otimiza o que houver e marca o swap de assets reais como pendência. Todas via `next/image` com `sizes` declarados, AVIF/WebP automático.
- Lazy-load below-fold: avaliar `next/dynamic({ ssr: true })` para seções abaixo do fold — sem quebrar SEO (precisa SSR) nem LCP.
- CLS: imagens com `width`/`height`, seções com `min-h-*`.

### Mobile QA (LOCKED)
- Tap targets ≥44×44px — auditar CTAs, floating, links do footer, inputs.
- `useDeviceTier()` — auditar que todas as decisões de motion intensity passam por ele.
- Lenis em `pointer: coarse`: decisão final (não inicializar OU `smoothTouch: false`) tomada após teste real — vira item de HUMAN-UAT.
- Device matrix real (MOBILE-07): iPhone iOS Safari, Android mid-tier Chrome, iPad Safari — HUMAN-UAT.

### Deploy (LOCKED + com bloqueio conhecido)
- **DEPLOY-01/02 (GitHub auto-deploy) — BLOQUEADO:** a conta `lennywajcberg` não tem permissão de push no repo `likro/likro-landing-page` (erro 403 confirmado nas Phases 5-6). Auto-deploy em push pra `main` e preview deploys em PR exigem o repo conectado à Vercel com acesso. Resolver o acesso ao GitHub é pré-requisito — vira item de setup do Lenny. Até lá, deploys são manuais via `vercel` CLI (funcionam).
- **DEPLOY-03 (env vars):** `NEXT_PUBLIC_WA_NUMBER` já configurada. As 5 da Phase 5 (Resend/Sheets) configuradas. Faltam as 3 de analytics (`NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`) — Phase 6 Parte B. NOTA: o requisito original cita `LEAD_WEBHOOK_URL`, mas a v1 usou Resend + Google Sheets em vez de webhook — esse nome de var está desatualizado; o destino de leads real são as vars `RESEND_*`/`GOOGLE_*`.
- **DEPLOY-05:** habilitar Vercel Speed Insights (pacote `@vercel/speed-insights` + componente no layout) para CWV contínuo.

### Verificação manual (HUMAN-UAT)
Vários requisitos da Phase 7 só fecham com verificação humana/ferramenta externa: Lighthouse real, Rich Results Test, OG preview em WhatsApp/LinkedIn, device matrix, reduced-motion no OS. Consolidar num `07-HUMAN-UAT.md`.

</decisions>

<canonical_refs>
## Canonical References

### Metadata / SEO
- `src/app/layout.tsx` — root layout, onde metadata + JSON-LD + skip-link entram.
- `src/app/page.tsx` — page-level metadata se aplicável.
- `src/app/opengraph-image.tsx` (existe — auditar) — OG image.
- `src/app/icon.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` — já existem (Phase 1).
- `schema-dts` — já em package.json, para JSON-LD tipado.

### A11y / Performance
- `src/components/ui/button.tsx` — focus-visible ring já presente.
- `src/components/motion/` — primitivas, `prefers-reduced-motion` handling (Phase 2).
- `src/hooks/use-device-tier.ts` — MOBILE-01.
- `src/components/providers/smooth-scroll-provider.tsx` — Lenis (MOBILE-04).
- `@next/bundle-analyzer` — devDep, para PERF-05.
- Todas as `src/sections/*` — auditoria de headings, alt, contraste, tap targets.

### Deploy
- `.env.example` — referência das env vars.
- Projeto Vercel: `likros-projects/likro-landing-page`. Remote git: `likro/likro-landing-page` (sem acesso de push para `lennywajcberg`).

### Roadmap / requisitos
- `.planning/ROADMAP.md` — Phase 7 (linhas ~113-124), 5 success criteria.
- `.planning/REQUIREMENTS.md` — SEO-01..11, A11Y-01..07, PERF-01..09, MOBILE-01,03,04,05,07, DEPLOY-01..05.

</canonical_refs>

<specifics>
## Specific Ideas

- **OG image:** validar/refazer `opengraph-image.tsx`. Arte: fundo escuro premium, logo Likro, headline curta ("CRM e atendimento para clínicas" ou similar — aprovar com Lenny). 1200×630. Testar no validador da Meta + colar a URL no WhatsApp e ver o preview real.
- **JSON-LD Organization:** `name: "Likro"`, `url`, `logo`, `sameAs: [Instagram, LinkedIn]` — Lenny precisa confirmar os links das redes (se ainda não existirem, omitir `sameAs` em vez de inventar).
- **Lighthouse:** rodar via `@lhci/cli` ou Chrome DevTools contra a Vercel. Documentar score antes/depois de cada otimização.
- **Skip-link:** padrão — `<a href="#main-content" class="sr-only focus:not-sr-only ...">`; `<main id="main-content">`.
- **Phase split:** 37 requisitos é muito para um plano só. O planner deve quebrar em vários plans por stream (ex: SEO, A11y, Perf-código, Perf-imagens, Deploy, HUMAN-UAT). Se exceder o orçamento, `## PHASE SPLIT RECOMMENDED` é aceitável.

</specifics>

<deferred>
## Deferred Ideas

- **GitHub push access** — Lenny precisa resolver (entrar como colaborador da org `likro` ou ajustar remote). Bloqueia DEPLOY-01/02. Não bloqueia o resto da phase.
- **Analytics IDs (3)** — Phase 6 Parte B; DEPLOY-03 fica parcial até existirem.
- **Domínio próprio / DNS** — explicitamente pós-launch (DEPLOY-04).
- **Prints reais de produto** (PERF-08) — se os assets finais não existirem, otimizar placeholders e marcar swap como pendência.
- **Backlog 999.1 / 999.2** — polish visual/editorial, milestone futuro.
- **Cookie consent / LGPD banner** — não está nos 37 requisitos da Phase 7; se Lenny quiser, vira backlog.

</deferred>

---

*Phase: 07-seo-a11y-performance-deploy-hardening*
*Context gathered: 2026-05-21 via Express path*
