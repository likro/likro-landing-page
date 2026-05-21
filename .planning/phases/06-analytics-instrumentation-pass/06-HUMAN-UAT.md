---
phase: 06-analytics-instrumentation-pass
type: human-uat
status: blocked
blocked_on: "contas Meta Pixel + GA4 + Clarity inexistentes"
created: 2026-05-21
---

# Phase 6 — Human UAT (Parte B: verificação cross-dashboard)

## Status

- **Parte A — COMPLETA e verificada.** Implementação de `section_view` (hook `useSectionView` + wrapper `TrackSection` nas 7 seções), `scroll_depth` (`ScrollDepthTracker`, marcos 25/50/75/100), `data-clarity-mask` confirmado no form, TRACK-06 (GA4 SPA) verificado por grep. Suite 221/221 GREEN.
- **Parte B — BLOQUEADA (este documento).** A verificação de que os eventos chegam de fato aos 3 dashboards reais (Meta Pixel, GA4, Clarity) e que o PII masking funciona numa gravação real só pode rodar depois que as 3 contas de analytics existirem e os IDs forem configurados na Vercel.

## Pré-requisito (Lenny)

Antes de executar o checklist abaixo:

1. **Meta Pixel** — criar conta Meta Business + Pixel → obter `NEXT_PUBLIC_META_PIXEL_ID` (Meta Business → Events Manager → Pixel → Settings).
2. **GA4** — criar propriedade Google Analytics 4 → obter `NEXT_PUBLIC_GA4_ID` (formato `G-XXXXXXX`; GA4 → Admin → Data Streams → Web stream → Measurement ID).
3. **Microsoft Clarity** — criar projeto Clarity → obter `NEXT_PUBLIC_CLARITY_ID` (Clarity → Settings → Setup → Project ID).
4. Configurar os 3 IDs como env vars na Vercel (Production + Preview + Development) → redeploy.

Pode ser uma sessão guiada separada, no mesmo formato passo-a-passo que fizemos com Resend e Google Cloud na Phase 5.

## Checklist de Verificação (B1-B8)

| # | Verificação | Ferramenta | Esperado | Resultado |
|---|-------------|------------|----------|-----------|
| B1 | `whatsapp_click` ao clicar um CTA | Meta Pixel Test Events (Events Manager → Test Events) | Evento `Contact` com `eventID` (= `event_id`) no payload | [pendente] |
| B2 | `form_submit_success` ao enviar o form | Meta Pixel Test Events | Evento `Lead` com `eventID` | [pendente] |
| B3 | `section_view` / `scroll_depth` | Meta Pixel Test Events | Custom events com `eventID` e payload (`section` / `depth`) | [pendente] |
| B4 | Eventos custom + `page_view` | GA4 DebugView (Admin → DebugView) | `cta_click`, `whatsapp_click`, `form_submit_*`, `section_view`, `scroll_depth`, `page_view` listados | [pendente] |
| B5 | Zero double-fire | GA4 DebugView + Network tab | Um único `page_view` por reload; um `collect` por clique de CTA | [pendente] |
| B6 | `section_view` não em burst | GA4 DebugView | `section_view` aparece conforme o scroll, não tudo no load | [pendente] |
| B7 | PII masking | Clarity Recordings | Na gravação de quem preencheu o form, nome/WhatsApp/email aparecem mascarados (blocos cinza) | [pendente] |
| B8 | Eventos custom no Clarity | Clarity Dashboard | `section_view` / `scroll_depth` registrados | [pendente] |

## Notas

- O Clarity demora ~30 min para processar gravações e mudanças de settings — não esperar resultado imediato.
- O masking do Clarity é client-side: o conteúdo mascarado nunca chega aos servidores da Microsoft.
- O `event_id` (UUID v4 anexado pelo `track()` a todo evento) aparece como `eventID` no payload do Pixel — isso torna o retrofit futuro do Meta CAPI (deduplicação server-side) zero-cost.
- B5/B6 cobrem o risco de double-fire e burst — se algum aparecer, vira gap para `/gsd-plan-phase 6 --gaps`.

## Sign-off

- [ ] B1-B8 todos verificados
- [ ] Vercel deploy com os 3 IDs: ___
- [ ] Aprovado por Lenny em (data): ___
