---
phase: 07-seo-a11y-performance-deploy-hardening
plan: 07
subsystem: mobile-qa-deploy
tags: [mobile, tap-targets, accessibility, touch, env-vars, deploy]
dependency_graph:
  requires:
    - "src/components/ui/button.tsx — variants de tamanho (auditados/corrigidos)"
    - "src/hooks/use-device-tier.ts — hook de tier (auditado, sem mudança)"
    - "tests/mobile/device-tier-usage.test.ts — contrato MOBILE-01"
  provides:
    - "src/components/ui/button.tsx — tap targets mobile >=44px via max-md:min-h"
    - ".env.example — documentação completa das env vars de deploy"
  affects:
    - "07-06 (HUMAN-UAT) valida device matrix real, Lenis touch real e config das IDs de analytics na Vercel"
tech_stack:
  added: []
  patterns:
    - "max-md:min-h-[44px] — tap target touch-safe sem alterar visual desktop (>=md)"
    - "active: como fallback de hover: para feedback de affordance em touch (MOBILE-05)"
key_files:
  created: []
  modified:
    - src/components/ui/button.tsx
    - src/components/ui/whatsapp-cta.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Footer.tsx
    - src/sections/Hero/HeroCopy.tsx
    - .env.example
decisions:
  - "Tap target fix via max-md:min-h-[44px] (viewport <768px) em vez de min-h-[44px] global — preserva h-10/h-9 do desktop intacto, dá 44px só onde o toque acontece"
  - "active: adicionado a todos os variants de Button com affordance de hover (secondary/ghost/outline/link) — feedback de toque consistente, default já tinha active:translate-y-px"
  - "MOBILE-04 (Lenis touch): syncTouch:false confirmado, NENHUMA mudança de código — decisão final validada em device real no HUMAN-UAT 07-06 conforme escopo do plano"
  - "LEAD_WEBHOOK_URL do REQUIREMENTS.md documentado como nome morto no .env.example sem ser criado — v1 usa Resend + Google Sheets"
metrics:
  duration: "~12min"
  completed: "2026-05-21"
  tasks: 2
  files: 6
---

# Phase 7 Plan 07: Mobile QA + Deploy Hardening Summary

Auditoria de mobile QA de código (MOBILE-01/03/04/05) e documentação de deploy (DEPLOY-03/04). Tap targets corrigidos para ≥44×44px em todos os CTAs/links tocáveis mobile via `max-md:min-h-[44px]` (desktop intacto), fallbacks `active:` adicionados onde a affordance dependia de `hover:`, e `.env.example` documenta todas as env vars de deploy. Validação em device real é HUMAN-UAT no 07-06.

## O Que Foi Feito

### Task 1 — Auditoria de tap targets + hover→active fallback (commit `c133082`)

**Tap targets (MOBILE-03)** — todos os alvos tocáveis em viewport mobile auditados:

| Alvo | Tamanho antes | Veredito | Correção |
|------|---------------|----------|----------|
| Hero WhatsApp CTA (`variant=primary`) | `h-11` (44px) via override | ✓ PASS | Reforçado por `max-md:min-h-[44px]` no Button `default` |
| Hero CTA secundário (`<Link>` âncora) | `px-3 py-2 text-sm` ≈36px | ✗ → corrigido | `max-md:min-h-[44px]` adicionado |
| Header WhatsApp CTA (`variant=secondary`) | Button `default` h-10 (40px) | ✗ → corrigido | `max-md:min-h-[44px]` no size `default` |
| Header logo (`<Link href="/">`) | `size-7` ≈28px | ✗ → corrigido | `max-md:min-h-[44px]` adicionado |
| Footer links de texto | `text-sm`, sem padding ≈20px | ✗ → corrigido | `inline-flex items-center max-md:min-h-[44px]` |
| Footer WhatsApp CTA (`variant=inline`) | `h-auto p-0` ≈20px | ✗ → corrigido | `max-md:min-h-[44px]` no className inline |
| Form submit Button (`variant=default`) | Button `default` h-10 (40px) | ✗ → corrigido | `max-md:min-h-[44px]` no size `default` |
| FloatingWhatsApp (`variant=floating`) | `size-14` (56px) | ✓ PASS | — (referência, sem mudança) |

Estratégia: `max-md:min-h-[44px]` aplica o mínimo de 44px apenas em viewport `<768px` (mobile + tablet pequeno — onde o toque acontece). O visual desktop (`h-10`/`h-9`) fica 100% intacto em telas `≥md`. O `icon` size recebeu também `max-md:min-w-[44px]` (size-10=40px é insuficiente para touch).

**hover→`:active` fallback (MOBILE-05)** — efeitos de hover auditados:

| Efeito de hover | Tipo | Veredito | Fallback `active:` |
|-----------------|------|----------|--------------------|
| Button `default` `hover:bg-accent-hover hover:shadow-md` | affordance | ✓ já tinha | `active:translate-y-px` (pré-existente) |
| Button `secondary` `hover:bg-accent-primary/5` | affordance | ✗ → corrigido | `active:bg-accent-primary/10` |
| Button `ghost` `hover:bg-neutral-100` | affordance | ✗ → corrigido | `active:bg-neutral-200` |
| Button `outline` `hover:bg-neutral-50` | affordance | ✗ → corrigido | `active:bg-neutral-100` |
| Button `link` `hover:underline` | affordance | ✗ → corrigido | `active:underline` |
| Hero CTA secundário `hover:text-text-on-dark-primary` | affordance | ✗ → corrigido | `active:text-text-on-dark-primary` |
| Hero CTA secundário arrow `group-hover:translate-x-0.5` | decorativo | ✓ PASS | — (puramente decorativo, não precisa) |
| Footer links `hover:text-text-on-dark-primary` | affordance | ✗ → corrigido | `active:text-text-on-dark-primary` |
| `privacy/page.tsx` link `hover:text-text-primary` | polish | ✓ PASS | — (affordance real é o `underline` sempre visível; fora do escopo de files_modified) |
| `dialog.tsx` / `sheet.tsx` hover | n/a | ✓ PASS | — (primitivas shadcn não renderizadas na landing) |
| `dev/page.tsx` hover | n/a | ✓ PASS | — (página dev-only, não produção) |

Todas as alterações preservam o visual desktop e o brand book. Verificação: `npm run typecheck` limpo, `npm run lint` passa (só o warning pré-existente de `analytics.ts:80`, fora de escopo).

### Task 2 — Auditoria useDeviceTier + Lenis touch + .env.example (commit `8716ecf`)

**useDeviceTier (MOBILE-01)** — `tests/mobile/device-tier-usage.test.ts` **GREEN**: zero ocorrências de `whileInView` direto em `src/sections/`. Grep confirmou: as duas únicas menções a `motion.` em `src/sections/` são comentários afirmando "zero motion.* JSX" (`HeroCardStack.tsx`, `Pain/index.tsx`). A arquitetura de animação adaptativa está limpa — toda intensidade de motion passa por primitiva de `@/components/motion` (que encapsula o tier) ou pelo hook `useDeviceTier`. Nenhuma correção necessária.

**MOBILE-04 (Lenis touch)** — `smooth-scroll-provider.tsx` confirmado com `syncTouch: false` (Lenis só `smoothWheel`, touch usa scroll nativo do browser; o provider ainda faz skip inteiro do chunk Lenis em `prefers-reduced-motion`). **Nenhuma mudança de código** — conforme o escopo do plano. A decisão final (manter `syncTouch: false` vs. pular o init em `pointer: coarse`) é validada em device real no **HUMAN-UAT 07-06**.

**DEPLOY-03/04 (env vars)** — `.env.example` atualizado:
- Documenta as vars de deploy: `NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID` (já presentes), `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `GOOGLE_SA_*`, `GOOGLE_SHEET_ID`.
- Nova seção "Deploy (Vercel)" com instrução de DEPLOY-03 (configurar nos 3 escopos: Production/Preview/Development; config das IDs de analytics na Vercel é HUMAN-UAT 07-06) e DEPLOY-04 (site já no ar em `.vercel.app`).
- Nota explícita: `LEAD_WEBHOOK_URL` do REQUIREMENTS.md é **nome morto** — a v1 usa Resend + Google Sheets. A var NÃO foi criada.
- `VERCEL_ENV`/`VERCEL_URL` documentadas como injetadas automaticamente pela Vercel (não declaradas).

Verificação: `tests/mobile/device-tier-usage.test.ts` GREEN, `npm run typecheck` limpo.

## Status de Deploy (DEPLOY-03/04)

- **DEPLOY-04** (`.vercel.app`): ✓ FEITO — site no ar em URL `.vercel.app` (confirmado no plano e no 07-04 SUMMARY).
- **DEPLOY-03** (env vars na Vercel): **PARCIAL** — `.env.example` documenta todas as vars; a configuração efetiva das 3 IDs de analytics nos painéis da Vercel é HUMAN-UAT no 07-06.

## Verificação Manual (HUMAN-UAT 07-06)

Pendente de validação humana no 07-06:
- Device matrix real: tap targets ≥44px verificados em iPhone/Android reais.
- Lenis touch: comportamento de scroll em device real (decisão final `syncTouch: false`).
- Configuração das 3 IDs de analytics (GA4 / Meta Pixel / Clarity) nos 3 escopos da Vercel.

## Deviations from Plan

None - plano executado exatamente como escrito.

## Deferred Issues

Nenhum. (Warning de lint pré-existente em `src/lib/analytics.ts:80` — `Unused eslint-disable directive` — fora do escopo deste plano; já documentado nos SUMMARYs 07-02/07-03/07-04.)

## Self-Check: PASSED

Arquivos (verificados em disco):
- MODIFIED: src/components/ui/button.tsx (max-md:min-h em sizes + active: nos variants)
- MODIFIED: src/components/ui/whatsapp-cta.tsx (max-md:min-h no variant inline)
- MODIFIED: src/components/layout/Header.tsx (max-md:min-h no logo Link)
- MODIFIED: src/components/layout/Footer.tsx (inline-flex + min-h + active: nos links)
- MODIFIED: src/sections/Hero/HeroCopy.tsx (min-h + active: no CTA secundário)
- MODIFIED: .env.example (seção Deploy + nota LEAD_WEBHOOK_URL morto)

Commits (verificados via git log):
- FOUND: c133082 — fix(07-07): mobile tap targets >=44px + hover->active fallbacks
- FOUND: 8716ecf — docs(07-07): document deploy env vars in .env.example

Testes/verificação: `tests/mobile/device-tier-usage.test.ts` GREEN, `npm run typecheck` limpo, `npm run lint` passa (só warning pré-existente fora de escopo).
