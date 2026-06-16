---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: "**Goal**: Reconstruir o Hero em `/preview`"
status: executing
last_updated: "2026-06-15T14:56:03.320Z"
last_activity: 2026-06-15
progress:
  total_phases: 12
  completed_phases: 7
  total_plans: 44
  completed_plans: 42
  percent: 95
---

# Project State: Likro Landing Page

**Project:** Likro Landing Page (Clínicas e Estéticas)
**Started:** 2026-05-15
**Last updated:** 2026-06-09 (Phase 7 complete; v1 active phases done)

## Project Reference

**Core value:** Uma clínica entra na landing e sente em segundos: *"isso foi feito exatamente pra minha operação — e essa empresa é absurda"*.

**Current focus:** Milestone v2.0 "Hero Premium (Travessia)" — **Phase 8 PLANEJADA** (4 plans em 3 waves, checker PASSOU, 21/21 reqs). Aguardando Lenny aprovar o plano pra executar. Escopo: SÓ o Hero, na rota `/preview` isolada. Contrato em PROJECT.md (caos → jornada → ordem; deslocamento espacial percebido; 2 testes de aceite). v1 (fases 01–07) em produção, intocada. Backlog 999.x segue para milestone futuro.

**Key documents:**

- `.planning/PROJECT.md` — vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` — 99 v1 requirements with traceability
- `.planning/ROADMAP.md` — 7-phase plan
- `.planning/research/SUMMARY.md` — research synthesis
- `.planning/research/STACK.md` / `FEATURES.md` / `ARCHITECTURE.md` / `PITFALLS.md` — deep research

## Current Position

**Milestone:** v2.0 (Hero Premium — Travessia)
Phase: 999.1
Plan: Not started
Status: In Progress — 08-01 (fundação pseudo-3D) + 08-02 (narrativa caos→ordem: target-lerp, 5 momentos, arco de escala, roxo escasso) + 08-03 (atmosfera evolutiva monotônica, vinheta de enquadramento, escuros tingidos, film grain, hero exit de vetores opostos, copy some cedo) completos; tsc + brand-lock verdes
Last activity: 2026-06-16 - Completed quick task 260616-hkf: Google Sheets opcional no form de leads

**Progress:** [██████████] 98%

**Nota:** o protótipo `src/app/preview/` foi RECONSTRUÍDO contra o contrato no plano 08-01 e agora está versionado no git (commits 67267e0 + f350398). Travessia.tsx = palco held-camera (sticky alto, progress manual rect→MotionValue, mount pós-hidratação, pause via IntersectionObserver/visibilitychange). LightField.tsx = engine pseudo-3D (z, optic flow radial do Foco central, oclusão por baldes, atlas de blur assado, 1 RAF, DPR≤1.5). Falta: caos→ordem (02), atmosfera/roxo (03), a11y/5-quadros (04). Validação visual (Playwright) pertence ao 08-04 + checkpoint do Lenny.

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Phases complete | 7 | 1 |
| Requirements shipped | 99 | 19 (Phase 1 reqs FOUND-01..12 + CTA-01..02 + TRACK-01..03) |
| Lighthouse Performance (desktop) | ≥ 90 | — |
| Lighthouse Performance (mobile) | ≥ 85 | — |
| LCP mobile | < 2.5s | — |
| CLS | < 0.1 | — |
| INP | < 200ms | — |
| Bundle JS gzipped (first load) | ≤ 150KB | — |
| Page weight mobile | ≤ 1.5MB | — |
| Phase 01 P04 | 12min | 2 tasks | 26 files |
| Phase 08 P01 | 5min | 2 tasks | 4 files |
| Phase 08 P02 | 5min | 2 tasks | 1 files |
| Phase 08 P03 | 6min | 2 tasks | 1 files |

## Accumulated Context

### Decisions Logged

(See PROJECT.md "Key Decisions" for canonical list. Highlights):

- Stack: Next.js 15.5 + Tailwind v4 + Motion v12 + Lenis 1.3.x
- Architecture: GSAP-future-ready via `<ScrollScene>` boundary
- 7 fases derivadas dos 99 requisitos v1; granularidade standard
- Phase 7 intencionalmente maior (37 reqs) — hardening multi-stream coeso

### Open Todos / Pendências Bloqueantes

**✅ RESOLVIDO em discuss-phase 3 (2026-05-16):**

- Número oficial do WhatsApp da Likro = `5511922324329` (D-16 do 03-CONTEXT.md) — configurar em `.env.local` + Vercel env vars (Production + Preview + Development) durante a execução da Phase 3
- Cadência de copy review do Lenny = async via PR seção-a-seção (D-17 do 03-CONTEXT.md) — Claude abre PR com 3 variantes em `src/content/<sec>.ts`, Lenny aprova no GitHub, Phase 3 estabelece o ritmo

**✅ RESOLVIDO (2026-05-18):**

- Lenny **NÃO autoriza** citar Dolce Home na seção Proof. Copy da Phase 4 § Proof segue caminho genérico — sem nome específico de cliente. Categorias verticais (estética/derma/harmonização) podem ser mencionadas. Reavaliar em milestone posterior se autorização mudar.

**🟡 PENDENTE — Antes da Phase 5:**

- Webhook target pro form de lead (email direto? Slack channel? n8n/Make? Função Vercel + Resend?)

### Blockers

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260616-hkf | Tornar Google Sheets opcional no form de leads (Resend obrigatório, Sheets opcional) | 2026-06-16 | acceed0 | [260616-hkf-tornar-google-sheets-opcional-no-form-de](./quick/260616-hkf-tornar-google-sheets-opcional-no-form-de/) |

## Session Continuity

**Last session work:** Phase 3 context gathered (`/gsd-discuss-phase 3`). 4 áreas discutidas: composição visual + mockup (LCP), direção da copy, header + trust + animações secundárias, operacionais + deploy isolado. Decisões D-01..D-19 capturadas em `.planning/phases/03-hero-benchmarked-isolado/03-CONTEXT.md`. Pendências do STATE resolvidas: número WhatsApp Likro = `5511922324329` (configurar em `.env.local` + Vercel env vars antes de fechar Phase 3); cadência copy review = async via PR seção-a-seção.

**Next session:**

1. Run `/gsd-ui-phase 3` (UI hint=yes no roadmap) **ou** `/gsd-plan-phase 3` direto pra decompor Phase 3 (Hero) em plans executáveis
2. Configurar `NEXT_PUBLIC_WA_NUMBER=5511922324329` em Vercel (Production + Preview + Development) e `.env.local` antes do PR final da Phase 3
3. Pendências ainda abertas: autorização Dolce Home (Phase 4), webhook target form (Phase 5)

**State invariants (do not violate):**

- Roxo `#7C3AED` é destaque, nunca fundo grande
- WhatsApp deep link sempre via `wa.me/`, nunca `web.whatsapp.com`
- Único `priority` em `<Image>` da página: o mockup do hero
- Copy nunca hard-coded em JSX; sempre em `content/*.ts`
- `motion.div` direto em arquivos de seção é proibido — só primitivas

---
*State initialized: 2026-05-15*
