---
phase: 6
slug: analytics-instrumentation-pass
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `06-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@^3.2.4` + `@testing-library/react@^16` + `jsdom@^25` |
| **Config file** | `vitest.config.ts` (alias `@`, setup `./tests/setup.ts` — já stuba `IntersectionObserver` global + mocka `server-only`) |
| **Quick run command** | `npm test -- --run <pattern>` |
| **Full suite command** | `npm test` + `npm run typecheck` |
| **Estimated runtime** | ~30 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** `npm test -- --run <changed-file-pattern>` (< 5s)
- **After every plan wave:** `npm test` (full) + `npm run typecheck`
- **Phase gate:** full suite green + `npm run lint` + code review do diff antes de commit
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

*Preenchida pelo planner. Parte A automatável; Parte B é manual/bloqueada (HUMAN-UAT).*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TRACK-04, TRACK-05, TRACK-06 | unit | TBD | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | TRACK-07 + TRACK-05 (real) | manual | HUMAN-UAT (bloqueado) | N/A | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `tests/hooks/use-section-view.test.tsx` — `section_view` dispara com `section` correto, uma vez, sem re-disparo. Cobre TRACK-04.
- [ ] `tests/components/scroll-depth-tracker.test.tsx` — `scroll_depth` nos marcos 25/50/75/100, sem duplicar, no-op quando não-rolável. Cobre TRACK-04.
- [ ] `tests/analytics/clarity-mask.test.tsx` — `<Form>` section + `<form>` do LeadForm têm `data-clarity-mask="true"`. Cobre TRACK-05 (Parte A).
- [ ] (opcional) `tests/components/analytics-provider.test.tsx` — exatamente um `<GoogleAnalytics>`, zero scripts GA manuais. Cobre TRACK-06.

**Framework install:** nenhum — vitest + jsdom + testing-library já configurados.

---

## Manual-Only Verifications (Parte B — BLOQUEADA até contas de analytics existirem)

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Eventos visíveis em Meta Pixel Test Events (`Contact`/`Lead`/custom com `eventID`) | TRACK-07 | Exige conta Meta + Pixel ID real recebendo eventos | Events Manager → Test Events; clicar CTAs, enviar form, scrollar |
| Eventos + `page_view` em GA4 DebugView, zero double-fire | TRACK-07 | Exige propriedade GA4 + ID real | GA4 Admin → DebugView; verificar 1 `page_view` por reload |
| `section_view` / `scroll_depth` chegam nos 3 dashboards | TRACK-07 | Idem | Scrollar a página completa, conferir marcos |
| Gravação real do Clarity NÃO mostra nome/WhatsApp do form | TRACK-05 | Exige projeto Clarity + sessão real gravada | Clarity recordings; reproduzir submit do form, conferir mascaramento |

→ Vira `06-HUMAN-UAT.md`. Pré-requisito: Lenny cria contas Meta/GA4/Clarity, configura os 3 `NEXT_PUBLIC_*` IDs na Vercel, redeploy.

---

## Validation Sign-Off

- [ ] Parte A: todas as tasks com `<automated>` verify ou Wave 0 deps
- [ ] Wave 0 cobre os 3-4 test files
- [ ] Sem watch-mode flags
- [ ] Parte B documentada em HUMAN-UAT (bloqueada, não conta como gap)
- [ ] `nyquist_compliant: true` após Wave 0 verde

**Approval:** pending
