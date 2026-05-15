# Project State: Likro Landing Page

**Project:** Likro Landing Page (Clínicas e Estéticas)
**Started:** 2026-05-15
**Last updated:** 2026-05-15 (post-roadmap)

## Project Reference

**Core value:** Uma clínica entra na landing e sente em segundos: *"isso foi feito exatamente pra minha operação — e essa empresa é absurda"*.

**Current focus:** Phase 1 — Foundations & Design System

**Key documents:**
- `.planning/PROJECT.md` — vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` — 99 v1 requirements with traceability
- `.planning/ROADMAP.md` — 7-phase plan
- `.planning/research/SUMMARY.md` — research synthesis
- `.planning/research/STACK.md` / `FEATURES.md` / `ARCHITECTURE.md` / `PITFALLS.md` — deep research

## Current Position

**Milestone:** v1 (initial launch — clínicas vertical)
**Phase:** 1 of 7 — Foundations & Design System
**Plan:** Not yet planned (next: `/gsd-plan-phase 1`)
**Status:** Roadmap approved, awaiting Phase 1 planning

**Progress:** [░░░░░░░] 0/7 phases complete

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Phases complete | 7 | 0 |
| Requirements shipped | 99 | 0 |
| Lighthouse Performance (desktop) | ≥ 90 | — |
| Lighthouse Performance (mobile) | ≥ 85 | — |
| LCP mobile | < 2.5s | — |
| CLS | < 0.1 | — |
| INP | < 200ms | — |
| Bundle JS gzipped (first load) | ≤ 150KB | — |
| Page weight mobile | ≤ 1.5MB | — |

## Accumulated Context

### Decisions Logged
(See PROJECT.md "Key Decisions" for canonical list. Highlights):
- Stack: Next.js 15.5 + Tailwind v4 + Motion v12 + Lenis 1.3.x
- Architecture: GSAP-future-ready via `<ScrollScene>` boundary
- 7 fases derivadas dos 99 requisitos v1; granularidade standard
- Phase 7 intencionalmente maior (37 reqs) — hardening multi-stream coeso

### Open Todos / Pendências Bloqueantes

**🟡 PENDENTE — Antes da Phase 3:**
- Número oficial do WhatsApp da Likro (DDD + número) — bloqueia `NEXT_PUBLIC_WA_NUMBER` e validação real-device do helper
- Cadência de copy review do Lenny (síncrono por seção, async via PR, ou pass final)

**🟡 PENDENTE — Antes da seção Proof entrar em dev na Phase 4:**
- Autorização explícita do Lenny pra citar Dolce Home na seção Proof (caso negativo: copy ajusta pra "operação ativa em uso" sem nome)

**🟡 PENDENTE — Antes da Phase 5:**
- Webhook target pro form de lead (email direto? Slack channel? n8n/Make? Função Vercel + Resend?)

### Blockers
None.

## Session Continuity

**Last session work:** Initialization completed (PROJECT.md, REQUIREMENTS.md, research/, ROADMAP.md, STATE.md).

**Next session:**
1. Run `/gsd-plan-phase 1` to decompose Phase 1 into executable plans
2. Address pendência do número WhatsApp se for entrar em Phase 3 logo

**State invariants (do not violate):**
- Roxo `#7C3AED` é destaque, nunca fundo grande
- WhatsApp deep link sempre via `wa.me/`, nunca `web.whatsapp.com`
- Único `priority` em `<Image>` da página: o mockup do hero
- Copy nunca hard-coded em JSX; sempre em `content/*.ts`
- `motion.div` direto em arquivos de seção é proibido — só primitivas

---
*State initialized: 2026-05-15*
