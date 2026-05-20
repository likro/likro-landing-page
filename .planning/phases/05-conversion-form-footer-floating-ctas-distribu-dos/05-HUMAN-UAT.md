---
status: partial
phase: 05-conversion-form-footer-floating-ctas-distribu-dos
source: [05-07-PLAN.md, 05-VALIDATION.md]
started: 2026-05-20
updated: 2026-05-20
---

# Phase 5 — Human UAT

**Status:** awaiting Lenny
**Pré-requisitos:** Vercel preview deployada; 5 env vars de produção configuradas (RESEND_API_KEY, LEAD_TO_EMAIL, GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY, GOOGLE_SHEET_ID); domínio Resend verificado OU sandbox aceitável em preview.

## Current Test

[awaiting human testing]

## A. WhatsApp deeplink — real device (CTA-07)

Para CADA um dos 7 CTAs WhatsApp, clicar e verificar que abre o app WhatsApp instalado (não browser, não web.whatsapp.com). Mensagem pré-preenchida deve casar com WHATSAPP_MESSAGES da location.

### iPhone (iOS Safari)
- [ ] CTA hero (location='hero')
- [ ] CTA header (location='header')
- [ ] CTA fim Pain (location='pain')
- [ ] CTA fim Product (location='product')
- [ ] CTA fim Proof (location='proof')
- [ ] CTA footer (location='footer')
- [ ] CTA floating mobile (location='floating')

### Android Chrome (mid-tier)
- [ ] CTA hero
- [ ] CTA header
- [ ] CTA fim Pain
- [ ] CTA fim Product
- [ ] CTA fim Proof
- [ ] CTA footer
- [ ] CTA floating mobile

## B. Floating WhatsApp — comportamento mobile (CTA-06 + MOBILE-02)

Mobile (iPhone + Android):
- [ ] Floating NÃO aparece na primeira viewport (antes de 50vh)
- [ ] Após scroll > 50vh, floating aparece com fade suave (200ms)
- [ ] Quando scrolla até o form em viewport, floating desaparece
- [ ] Ao focar input do form, floating fica escondido (Pitfall 9)
- [ ] Floating NÃO cobre o home indicator do iPhone (safe-area-inset-bottom respeitado)
- [ ] Floating é discreto: sem pulse, sem bounce, sem badge, sem crescimento

iPad Safari:
- [ ] Floating NÃO aparece (≤ md breakpoint cutoff)

Desktop:
- [ ] Floating NÃO aparece em nenhuma largura desktop

## C. Header hide-on-scroll (MOBILE-06)

iPhone + Android:
- [ ] Primeira viewport: header sempre visível
- [ ] Após primeira viewport, scroll down significativo (>80px delta) esconde o header
- [ ] Scroll up reaparece o header
- [ ] Transição translateY é suave, sem jitter visível
- [ ] Z-index OK: header (z-30) NÃO fica abaixo do conteúdo

Desktop:
- [ ] Mesmo comportamento (Chrome / Safari / Firefox)

Reduced motion:
- [ ] macOS System Settings → Accessibility → Reduce Motion ATIVADO: header fica SEMPRE visível, NÃO esconde
- [ ] Windows Settings → Accessibility → Visual effects → Animation effects OFF: header fica SEMPRE visível

## D. Form de leads — submissão real (CTA-10 + CTA-11)

iPhone Safari ou Android Chrome:
- [ ] Form renderiza 3 campos visíveis (Nome, WhatsApp, Mensagem opcional)
- [ ] Submit com nome vazio mostra erro inline + aria-invalid
- [ ] Submit com WhatsApp inválido (ex: "12345") mostra erro inline
- [ ] Submit com dados válidos: botão fica disabled, spinner aparece
- [ ] Após sucesso, bloco success ("Recebido. Vou te chamar no WhatsApp...") substitui o form sem redirect
- [ ] Em até 60 segundos, Lenny recebe email em LEAD_TO_EMAIL (assunto "Novo lead — <nome>")
- [ ] Em até 60 segundos, nova linha aparece em Google Sheet "Leads!A:E" com timestamp, nome, WhatsApp, mensagem, utm
- [ ] Resubmeter com MESMO WhatsApp em <60s retorna sucesso silencioso (sem novo email/linha duplicada)

## E. Tracking events (preparação Phase 6)

Chrome DevTools → Network tab + Console (filtro "track"):
- [ ] Focar primeiro campo do form: `form_focus` event dispara
- [ ] Submeter form com dados válidos: `form_submit_attempt` + `form_submit_success` events
- [ ] Clicar qualquer CTA WhatsApp: `whatsapp_click` event com `location` correto
- [ ] Cada event tem `event_id` UUID v4 no payload (preparação Meta CAPI)

## F. Honeypot anti-spam (CTA-09 segurança)

Manual via DevTools Console:
```js
await fetch("/api/lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Test",
    whatsapp: "11999999999",
    website: "http://spam.example", // honeypot triggered (field = website)
  }),
}).then(r => r.json());
```
- [ ] Resposta = `{ ok: true }` (fake success)
- [ ] Lenny NÃO recebe email
- [ ] Sheet NÃO recebe linha

## G. Acessibilidade básica (preparação Phase 7)

- [ ] Form navegável por teclado (Tab atravessa nome → WhatsApp → mensagem → botão)
- [ ] Honeypot NÃO recebe foco via Tab (tabIndex=-1)
- [ ] aria-invalid em campos com erro
- [ ] Focus visível em todos os campos

## H. Copy review (CTA-08, COPY-04)

Lenny revisa no PR:
- [ ] Microcopy do form (eyebrow, heading, sub, placeholders, submit, success, error) sem cara de IA, sem urgência fabricada, alinhado tom premium silencioso
- [ ] Children dos CTAs distribuídos (Pain, Product, Proof) sem buzzwords, específicos pra clínica
- [ ] Mensagens pré-preenchidas em WHATSAPP_MESSAGES.{location} aprovadas

## Sign-off

- [ ] Todas as 8 categorias acima 100% checadas
- [ ] Vercel preview URL: ___
- [ ] Aprovado por Lenny em (data): ___

## Summary

total: 8 categorias (A-H), ~50 checkboxes
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
