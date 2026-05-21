---
phase: 6
slug: analytics-instrumentation-pass
status: draft
nyquist_compliant: true
wave_0_complete: true
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

*Parte A automatável; Parte B é manual/bloqueada (HUMAN-UAT).*

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| Wave 0 specs | 01 | 0 | TRACK-04, TRACK-05 | unit (RED) | `npm test -- --run use-section-view scroll-depth-tracker clarity-mask` | ✅ | ✅ done |
| Task 1 — useSectionView + TrackSection | 02 | 1 | TRACK-04 | unit | `npm test -- --run use-section-view` | ✅ | ✅ done |
| Task 2 — ScrollDepthTracker | 02 | 1 | TRACK-04 | unit | `npm test -- --run scroll-depth-tracker` | ✅ | ✅ done |
| Task 3 — data-clarity-mask no LeadForm | 02 | 1 | TRACK-05 | unit | `npm test -- --run clarity-mask` | ✅ | ✅ done |
| Task 1 — wiring page.tsx | 03 | 3 | TRACK-04 | unit (suite) | `npm test -- --run cta-distribution` | ✅ | ✅ done |
| Task 2 — TRACK-06 GA4 SPA | 03 | 3 | TRACK-06 | grep | ver "TRACK-06 — Verificação GA4 SPA" abaixo | ✅ | ✅ done |
| Parte B — cross-dashboard | 04 | — | TRACK-07 + TRACK-05 (real) | manual | HUMAN-UAT (bloqueado) | N/A | ⬜ pending |

---

## Wave 0 Requirements

- [x] `tests/hooks/use-section-view.test.tsx` — `section_view` dispara com `section` correto, uma vez, sem re-disparo. Cobre TRACK-04. **GREEN (5/5).**
- [x] `tests/components/scroll-depth-tracker.test.tsx` — `scroll_depth` nos marcos 25/50/75/100, sem duplicar, no-op quando não-rolável. Cobre TRACK-04. **GREEN (5/5).**
- [x] `tests/analytics/clarity-mask.test.tsx` — `<Form>` section + `<form>` do LeadForm têm `data-clarity-mask="true"`. Cobre TRACK-05 (Parte A). **GREEN (3/3).**
- [x] TRACK-06 — exatamente um `<GoogleAnalytics>`, zero scripts GA manuais. Verificado por grep test (subseção abaixo) — não foi necessário test file dedicado.

**Framework install:** nenhum — vitest + jsdom + testing-library já configurados.

---

## TRACK-06 — Verificação GA4 SPA

> Requisito: GA4 com page_view automático em navegação SPA, fonte única de `page_view` (sem double-fire). Resolvido na Phase 1 via `<GoogleAnalytics>` de `@next/third-parties` — Plan 06-03 apenas verifica e documenta.

**Comandos (executados 2026-05-21, Plan 06-03 Task 2):**

```
$ grep -rn "GoogleAnalytics" src/
src/components/providers/analytics-provider.tsx:3:import { GoogleAnalytics } from "@next/third-parties/google";
src/components/providers/analytics-provider.tsx:27:      {env.NEXT_PUBLIC_GA4_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA4_ID} />}
src/lib/analytics.ts:63:  // GA4 — via window.gtag (instalado por @next/third-parties' <GoogleAnalytics>)

$ grep -rn "page_view" src/
(zero ocorrências)

$ grep -rn "gtag" src/lib/analytics.ts
src/lib/analytics.ts:5:  * Componentes JAMAIS chamam window.fbq, window.gtag, window.clarity diretamente.
src/lib/analytics.ts:31:    gtag?: (action: "event", event: string, payload?: Payload) => void;
src/lib/analytics.ts:63:  // GA4 — via window.gtag (instalado por @next/third-parties' <GoogleAnalytics>)
src/lib/analytics.ts:64:  window.gtag?.("event", event, enriched);
```

**Resultado: PASS.**

- Existe **exatamente uma** renderização de `<GoogleAnalytics>` — `analytics-provider.tsx:27` (+ a linha de import). Nenhum segundo `<GoogleAnalytics>` ou script GA manual em qualquer outro arquivo.
- **Zero** chamadas manuais a `gtag('event','page_view')` — o `page_view` é emitido exclusivamente pelo componente `<GoogleAnalytics>` (handles route changes corretamente). Sem superfície de double-fire (T-06-07 mitigado).
- A única chamada `gtag` no código é `window.gtag?.("event", event, enriched)` dentro de `track()` (`analytics.ts:64`) — eventos custom via optional chaining, fonte única de eventos client-side (TRACK-01). Não é um mecanismo GA paralelo.

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

- [x] Parte A: todas as tasks com `<automated>` verify ou Wave 0 deps — suite completa GREEN (221/221, 35 test files)
- [x] Wave 0 cobre os 3-4 test files — 3 test files Wave 0 GREEN + TRACK-06 por grep
- [x] Sem watch-mode flags — todos os comandos usam `--run`
- [ ] Parte B documentada em HUMAN-UAT (bloqueada, não conta como gap) — pendente Plan 04 (`06-HUMAN-UAT.md`)
- [x] `nyquist_compliant: true` após Wave 0 verde

**Approval:** Parte A aprovada (2026-05-21). Parte B aguarda Plan 04 (HUMAN-UAT) — bloqueada até Lenny criar as 3 contas Meta/GA4/Clarity e configurar os `NEXT_PUBLIC_*` IDs na Vercel.
