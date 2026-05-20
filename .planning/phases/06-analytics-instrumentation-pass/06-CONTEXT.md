# Phase 6: Analytics Instrumentation Pass — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning
**Source:** Express path — decisões consolidadas em conversa com Lenny após conclusão da Phase 5

<domain>
## Phase Boundary

Esta phase fecha a instrumentação de analytics da landing. Tem DUAS partes:

**Parte A — Implementação (não bloqueada por contas externas):**
1. Disparar `section_view` para cada seção narrativa (Pain, Bridge, Product, HowItWorks, Proof — e idealmente Hero e Form). O evento existe no tipo `AnalyticsEvent` mas **nunca é chamado** no código atual.
2. Disparar `scroll_depth` nos marcos 25/50/75/100% da página. Também existe no tipo mas **nunca é chamado**.
3. Garantir que `cta_click`, `whatsapp_click`, `form_submit_attempt/success/error`, `form_focus` continuam disparando corretamente com os payloads certos (`location`, `event_id`, etc.) — esses JÁ estão implementados (whatsapp-cta, LeadForm).
4. Confirmar GA4 SPA config — já usa `@next/third-parties/google` `<GoogleAnalytics>` que trata route changes; validar que não há double-fire.

**Parte B — Verificação em dashboards reais (BLOQUEADA até Lenny ter as 3 contas):**
5. Verificar eventos disparando em Meta Pixel Test Events, GA4 DebugView, Clarity recordings.
6. Verificar PII masking numa sessão real do Clarity (form não pode mostrar nome/WhatsApp na gravação).

**Decisão do Lenny (2026-05-20):** planejar a phase agora; a Parte B (verificação) fica pendente até as contas Meta/GA4/Clarity existirem e os IDs serem configurados. A Parte A (implementação dos eventos faltantes) pode ser feita e testada com testes unitários sem as contas.

Fora de escopo:
- Lighthouse / Performance / SEO / A11y → Phase 7
- Meta CAPI server-side (retrofit futuro — `event_id` já está pronto em todos os eventos)
- Criar as contas Meta/GA4/Clarity — Lenny faz quando decidir (pode ser com ajuda guiada, igual Resend/GCP)

</domain>

<decisions>
## Implementation Decisions

### Eventos a implementar (LOCKED — TRACK-04)
- **`section_view`**: disparar quando cada seção narrativa entra no viewport. Payload `{ section: "pain" | "bridge" | "product" | "how" | "proof" | ... }`. Usar IntersectionObserver — o projeto já tem `useInView` hook (`src/hooks/use-in-view.ts`) que pode ser a base, OU um novo hook dedicado. Disparar UMA vez por seção (não a cada re-entrada).
- **`scroll_depth`**: disparar nos marcos 25%, 50%, 75%, 100% do scroll da página. Payload `{ depth: 25 | 50 | 75 | 100 }`. Cada marco dispara UMA vez por sessão. NÃO usar um evento separado por marco — usar o evento `scroll_depth` único com payload `depth` (o tipo `AnalyticsEvent` já tem `scroll_depth` singular; o requirement menciona `scroll_depth_25/50/75/100` como conceito, mas a implementação usa um evento com payload).
- Eventos já implementados (`cta_click`, `whatsapp_click`, `form_*`, `form_focus`) — NÃO reimplementar; só verificar via teste que continuam corretos.

### Arquitetura (LOCKED)
- Todo evento passa por `track()` de `src/lib/analytics.ts` — fan-out único pra GA4/Pixel/Clarity. **Zero** chamadas diretas a `window.gtag`/`fbq`/`clarity` em componentes (regra TRACK-01 da Phase 1).
- `track()` já anexa `event_id` UUID v4 em todo evento — não mexer nisso.
- `section_view` e `scroll_depth` são client-side (precisam de scroll/viewport) — componentes/hooks que os disparam são `"use client"`.
- Respeitar `prefers-reduced-motion`? Não aplicável a analytics — mas o scroll-depth listener deve ser throttled (`requestAnimationFrame` ou similar) pra não pesar.

### GA4 SPA config (TRACK-06)
- Já resolvido pela Phase 1: `<GoogleAnalytics gaId={...} />` do `@next/third-parties/google` trata route changes automaticamente. Como a landing é página única (sem rotas internas além de `/privacy`), o risco de double-fire de pageview é baixo. Phase 6 só **verifica** — não precisa reimplementar. Se o checker/research achar risco de double-fire, documentar.

### PII masking (TRACK-05)
- O `<form>` do LeadForm e a `<section>` wrapper já têm `data-clarity-mask="true"` (entregue na Phase 5). Phase 6 **verifica** que está lá (teste de grep/render) e — na Parte B — valida numa gravação real do Clarity que nome/WhatsApp não aparecem.
- Se algum campo sensível adicional precisar de masking, adicionar.

### Verificação cross-dashboard (TRACK-07 — Parte B, bloqueada)
- Quando Lenny tiver os 3 IDs: configurar `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_CLARITY_ID` na Vercel, redeploy, e validar nos painéis (Pixel Test Events, GA4 DebugView, Clarity recordings).
- Essa verificação é manual/humana — vai virar item de HUMAN-UAT da Phase 6.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Infra de analytics (Phase 1)
- `src/lib/analytics.ts` — `track(event, payload)`, tipo `AnalyticsEvent`, fan-out GA4/Pixel/Clarity, `event_id`. **Único ponto** de tracking. `section_view` e `scroll_depth` já no tipo, faltam os disparos.
- `src/components/providers/analytics-provider.tsx` — monta scripts GA4/Pixel/Clarity gated em env vars. Clarity script id é `ms-clarity` (Pitfall E — não mudar).
- `src/lib/env.ts` — `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID` (todas opcionais, undefined hoje).

### Hooks existentes
- `src/hooks/use-in-view.ts` — IntersectionObserver hook (Phase 4). Base possível pro `section_view`.
- `src/hooks/use-form-in-view.ts` — observer do form (Phase 5).

### Seções (onde plugar section_view)
- `src/sections/Hero/`, `Pain/`, `Bridge/`, `Product/`, `HowItWorks/`, `Proof/`, `Form/` — cada `index.tsx`.
- `src/app/page.tsx` — wiring das seções.

### Consumers de evento já implementados (verificar, não reimplementar)
- `src/components/ui/whatsapp-cta.tsx` — dispara `whatsapp_click` / `cta_click`.
- `src/sections/Form/LeadForm.tsx` — dispara `form_focus`, `form_submit_attempt/success/error`.

### Roadmap e requisitos
- `.planning/ROADMAP.md` — Phase 6 section (linhas ~102-111).
- `.planning/REQUIREMENTS.md` — TRACK-04, TRACK-05, TRACK-06, TRACK-07.

### Memória da sessão
- `feedback-whatsapp-centralized`, `feedback-conversion-tone` — contexto geral do projeto.

</canonical_refs>

<specifics>
## Specific Ideas

- **`section_view` — implementação sugerida:** um componente wrapper leve `<TrackSection name="pain">` OU um hook `useSectionView("pain")` que cada seção chama. O hook usa IntersectionObserver, dispara `track("section_view", { section })` uma vez quando ≥ X% visível. Reaproveitar a lógica de `use-in-view.ts` se fizer sentido.
- **`scroll_depth` — implementação sugerida:** um único componente client `<ScrollDepthTracker />` montado uma vez em `page.tsx` (ou no layout). Escuta scroll com `requestAnimationFrame` throttle, calcula `% = scrollY / (scrollHeight - innerHeight)`, dispara `track("scroll_depth", { depth })` ao cruzar cada marco (25/50/75/100), cada um só uma vez via um Set de marcos já disparados.
- **Testes (Parte A):** unit tests mockando `track` e `IntersectionObserver` — verificar que `section_view` dispara com o `section` certo e só uma vez; que `scroll_depth` dispara nos marcos certos e não duplica. Sem Playwright (consistente com Phases 4-5).
- **HUMAN-UAT da Parte B:** checklist pra Lenny validar os 3 dashboards quando tiver as contas — Pixel Test Events mostra `Contact`/`Lead`/custom events com `eventID`; GA4 DebugView mostra os eventos; Clarity recording não mostra PII no form.

</specifics>

<deferred>
## Deferred Ideas

- **Verificação cross-dashboard (TRACK-07)** — bloqueada até Lenny ter contas Meta Pixel + GA4 + Clarity. Vira HUMAN-UAT pendente; a phase pode ficar com status "implementação completa, verificação pendente".
- **Meta CAPI server-side** — retrofit futuro; `event_id` já está em todos os eventos, custo zero quando ativar.
- **Consent / cookie banner** — LGPD; Phase 7 ou backlog.
- **Criação das contas de analytics** — Lenny faz quando decidir; pode ser sessão guiada separada (igual Resend/GCP).

</deferred>

---

*Phase: 06-analytics-instrumentation-pass*
*Context gathered: 2026-05-20 via Express path*
