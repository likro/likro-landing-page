# Plan 05-04 SUMMARY — LeadForm UI + hook

**Status:** ✅ COMPLETE
**Wave:** 3
**Tasks:** 4/4 (inline execution)
**Completed:** 2026-05-19

## Commits

- `bb8aedc` feat(05-04): add useFormInView hook (IntersectionObserver shared)
- `b40dae1` feat(05-04): add FormSuccess + FormError inline blocks
- `5a76a64` feat(05-04): add LeadForm (RHF + Zod + fetch + state machine + clarity-mask)
- `f39d1ca` feat(05-04): add Form/index section wrapper (lead-form-section + clarity-mask)

## Files created

- `src/hooks/use-form-in-view.ts` — `useFormInView(): boolean` via `IntersectionObserver` no `#lead-form-section`. Threshold default 0.1. SSR-safe (`typeof window === "undefined"` guard). Plan 06 consome direto.
- `src/sections/Form/FormSuccess.tsx` — bloco de confirmação inline (sem redirect). Heading + body + `<WhatsAppCta variant="secondary" location="proof">` como CTA secundário. `role="status" aria-live="polite"`.
- `src/sections/Form/FormError.tsx` — bloco de erro com `onRetry` prop. Heading + body + `<Button onClick={onRetry}>` + `<WhatsAppCta variant="inline">` fallback. `role="alert"`.
- `src/sections/Form/LeadForm.tsx` — **peça central**:
  - `"use client"`, RHF + `zodResolver(leadSchema)`, `defaultValues` (incluindo honeypot `website`)
  - State machine: `idle | submitting | success | error`
  - `onSubmit` chama `fetch("/api/lead", { method: "POST", body: JSON.stringify({...values, utm}) })`
  - UTM extraído de `URLSearchParams(window.location.search)` no `useEffect` mount (5 keys padrão)
  - `track()` events: `form_focus` (1ª vez), `form_submit_attempt`, `form_submit_success`, `form_submit_error`
  - Honeypot off-screen: `<div aria-hidden="true" style={{position:"absolute", left:"-9999px", top:0, width:"1px", height:"1px", overflow:"hidden"}}>` com `<input name="website" tabIndex={-1} autoComplete="off">`
  - `data-clarity-mask="true"` no root (`<form>` no idle, wrapper `<div>` no success/error) — garantido em isolation
  - Botão `disabled` durante submit + spinner `Loader2`
  - Retry com `keepValues: true` (não apaga input ao falhar)
- `src/sections/Form/index.tsx` — server component wrapper:
  - `<section id="lead-form-section" data-clarity-mask="true" aria-labelledby="lead-form-heading">`
  - Eyebrow + h2 (`text-3xl md:text-4xl`) + subheading via `FORM_COPY`
  - Renderiza `<LeadForm />` por baixo
  - `bg-surface-light py-20 md:py-28` — combina com o gradiente desktop da Proof (Plan 05-06 valida)

## Tests

**Antes (Plan 02):** 7 RED em `tests/sections/lead-form.test.tsx`
**Depois:** **7/7 GREEN** ✓

**Regression Wave 1+2+3 Plan 04:** 39/39 tests GREEN (lead-schema 10, lead-dedup 9, whatsapp-messages 6, lead-route 7, lead-form 7).

**Erros TS restantes:** apenas 1 — `tests/sections/floating-whatsapp.test.tsx` aguarda `@/sections/Floating/FloatingWhatsApp` (Plan 06). Esperado.

## Contratos congelados

- LeadForm submete pra `/api/lead` com schema espelhado client ↔ server (mesmo Zod resolver)
- Honeypot field name = `website` (consistente com Plan 01 schema + Plan 03 route + Plan 04 form)
- `#lead-form-section` é o id observed pelo Plan 06 FloatingWhatsApp
- `data-clarity-mask` em 2 níveis (form root + section wrapper) — PII masked em qualquer estado da máquina

## Tokens Tailwind ajustados

O Plan original referenciava tokens que não existem no design system Phase 1 (`bg-bg-base`, `bg-bg-card`). Substituídos pelos canônicos do `src/app/globals.css`:
- `bg-bg-base` → `bg-surface-light` (section bg) / `bg-surface-card` (input bg)
- `bg-bg-card` → `bg-surface-card`
- `text-text-primary` ✓ existe
- `text-text-secondary` ✓ existe
- `text-text-muted` ✓ existe (placeholder + privacy note)
- `border-border-subtle` ✓ existe (containers)
- `border-border-default` (inputs neutral state)
- `accent-primary` ✓ existe

Sem nenhum uso de `bg-accent-50/100/200` (FOUND-03 guard preservado).

## Threat model touched

- T-05-16 (PII em Clarity) → `data-clarity-mask="true"` em 2 níveis (defense in depth)
- T-05-19 (multi-submit race) → `submitting` desabilita botão; RHF previne re-entry
- T-05-20 (1Password honeypot autofill) → field `website` em vez de `company`

## Next

- Plan 05-05 (Header hide-on-scroll) rodando em background — vai mergeear quando finalizar
- Plan 05-06 (FloatingWhatsApp + Footer + CTAs em Pain/Product/Proof + `/privacy` stub) é a próxima wave
- Plan 05-07 (page.tsx wire + HUMAN-UAT + VALIDATION update + checkpoint) fecha a phase

## Prep para PR de copy review

Microcopy do form já em `src/content/form.ts` v1 (premium silencioso, anti-infoproduto). Pré-aprovada na CONTEXT.md `<specifics>`. Variantes alternativas podem ser geradas pelo Lenny no PR de copy review se sentir necessidade — ou ficar pra Phase 7 hardening.
