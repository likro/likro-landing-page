# Plan 05-07 SUMMARY — Wire-up + UAT + Phase 5 close

**Status:** ✅ COMPLETE
**Wave:** 5
**Tasks:** 4/4 (tasks 1-3 inline; task 4 checkpoint aprovado por Lenny 2026-05-20)
**Completed:** 2026-05-20

## Commits

- `ed238ff` feat(05-07): wire Form + Footer + FloatingWhatsApp into page.tsx
- `a9949db` docs(05-07): update VALIDATION.md — nyquist compliant, verification map, 7 locations
- `56539c8` test(05-07): persist human verification items as UAT
- `cadbca0` fix(05-05): Header without motion.* — plain header + ref + style mutation (HERO-02)
- `9a716f7` fix(05-03): default Resend sender to sandbox unless RESEND_FROM set (Pitfall 2)

## Estado final de page.tsx

```
<Header />
<main>
  <Hero /> <Pain /> <Bridge /> <Product /> <HowItWorks /> <Proof /> <Form />
</main>
<Footer />
<FloatingWhatsApp />
```

7 locations de CTA WhatsApp: hero, header, pain, product, proof, footer, floating.

## Métricas

- **Testes:** 208/208 GREEN (full suite). Era o último RED (`cta-distribution`) — agora passa.
- **typecheck:** 0 erros
- **lint:** 0 erros
- **build:** passa — `/api/lead` edge, `/privacy` estático, `/` 158 kB first-load
- **Requirements:** 11/11 cobertos (CTA-03,05,06,07,08,09,10,11,12 + MOBILE-02,06)

## Correções durante a wave

- **HERO-02 regressão** — Header refatorado pra `<header>` plano + ref + style mutation (Plan 05-05 tinha introduzido `motion.header`, violando o invariante de LCP da Phase 3). Hide-on-scroll idêntico, zero `motion.*` JSX.
- **IntersectionObserver** — stub global adicionado em `tests/setup.ts` (jsdom não implementa).
- **Resend Pitfall 2** — `fromAddress()` usava domínio `likro.com.br` (não verificado) em produção → email falhava. Corrigido: default `onboarding@resend.dev` (sandbox), domínio custom só via env var `RESEND_FROM`.

## Deploy

- **URL produção:** https://likro-landing-page.vercel.app
- Deploy em produção (não preview) porque o CLI Vercel estava bloqueado por wrapper de plugin pra setar env vars em Preview — Production tinha as 6 env vars.

## Action items resolvidos (setup externo)

- ✅ Conta Resend criada + `RESEND_API_KEY`
- ✅ `LEAD_TO_EMAIL` = likro1818@gmail.com
- ✅ GCP project `likro-leads` + Sheets API habilitada
- ✅ Service account `likro-sheets-writer` + chave JSON RS256
- ✅ Planilha "Likro — Leads" (headers timestamp/name/whatsapp/message/utm, aba `Leads`) compartilhada com a SA como Editor
- ✅ 5 env vars de produção na Vercel (RESEND_API_KEY, LEAD_TO_EMAIL, GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_SHEET_ID)
- ✅ Smoke test: 2 leads de teste → 2 emails entregues + 2 linhas na planilha

## UAT

Lenny validou em mobile (2026-05-20): **funcionalidade 100% — "tudo funcionando perfeito"**. CTAs WhatsApp, floating, header hide-on-scroll, form submit, dual-write — todos OK.

**1 observação de design (não bloqueante):** densidade de informação / ritmo narrativo da landing. Encaminhada ao backlog **999.2** (`information density / narrative pacing editorial rework`). Não é falha da Phase 5 — abrange composição das seções narrativas (Phase 4).

## Pendências v1 → futuro

- Rate limit por IP no `/api/lead` (Upstash KV) — Phase 7 / backlog
- Verificação DNS do domínio `likro.com.br` em Resend + setar `RESEND_FROM` — quando o domínio entrar
- Meta CAPI retrofit (`event_id` já carregado em todos os eventos)
- Conteúdo real da página `/privacy` — Phase 7
- Lighthouse / A11y / SEO hardening + noindex de preview — Phase 7
- Env vars em Preview/Development (atualmente só Production) — quando o fluxo de PR preview for usado
- Backlog 999.1 (repetição de cards) + 999.2 (densidade/ritmo editorial)

## Approval

Aprovado por Lenny — 2026-05-20.
