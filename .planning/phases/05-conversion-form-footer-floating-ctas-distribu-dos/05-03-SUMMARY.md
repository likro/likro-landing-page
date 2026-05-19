# Plan 05-03 SUMMARY — Edge Route + Dual-Write

**Status:** ✅ COMPLETE
**Wave:** 2
**Tasks:** 3/3 (Task 1 via worktree agent + Tasks 2-3 inline após stall)
**Completed:** 2026-05-19

## Recovery note

Worktree agent (ad0cdd7b78d00eed6 → ab41163d7088a712d) completou Task 1 (lead-resend.ts, commit `89bc607`) e stalled durante Task 2. Orquestrador recuperou commit via merge direto por SHA, fez cleanup do worktree travado e executou Tasks 2-3 inline. Comportamento esperado documentado em `<failure_handling>` do workflow.

## Commits

- `89bc607` feat(05-03): add lead-resend.ts (Resend SDK, edge-compat) — via worktree agent
- `3ac8c11` feat(05-03): add lead-sheets.ts (JWT via jose + Sheets REST, edge) — inline
- `d845b1c` feat(05-03): add /api/lead edge route — dual-write Promise.allSettled + honeypot + dedup — inline
- `5f8a0fb` test(05-03): mock server-only in setup + fix dedup test helper

## Files created

- `src/lib/lead-resend.ts` — `sendLeadEmail(lead): Promise<void>` via Resend SDK v6 (edge-compat, fetch-based). Inclui `escapeHtml()` (mitiga T-05-09 XSS) e gate `VERCEL_ENV === "production"` para `from` verified vs sandbox (Pitfall 2).
- `src/lib/lead-sheets.ts` — `appendLeadRow(lead): Promise<void>` via `jose.SignJWT` (RS256) + `fetch` direto na Sheets REST API. Zero `googleapis` SDK (Node-only, 171MB banido). Pitfall 1 (`replace(/\\n/g, "\n")`) aplicado na private key.
- `src/app/api/lead/route.ts` — POST handler em `runtime = "edge"`. Sequência:
  1. Parse JSON → 400 se inválido
  2. Honeypot `body.website` truthy → 200 fake success
  3. `leadSchema.safeParse` → 422 se falhar
  4. `checkAndRegisterDedup(lead.whatsapp)` → 200 deduped
  5. `Promise.allSettled([sendLeadEmail, appendLeadRow])` → 200 se ≥1 ok, 502 se ambos falharam
  - GET retorna 405

## Files modified

- `tests/setup.ts` — adicionado `vi.mock("server-only", () => ({}))` (pattern Next.js + vitest)
- `tests/api/lead-route.test.ts` — `__resetDedupForTests()` movido pro `beforeEach` (estava dentro de `callPost`, anulando o teste dedup)

## Tests

**Antes (Plan 02):** 7 RED em `tests/api/lead-route.test.ts`
**Depois:** **7/7 GREEN** ✓
- `400 on invalid JSON`
- `honeypot triggered (website filled) → 200 + fake success, no fetch`
- `422 on schema validation fail (name too short)`
- `200 when both integrations succeed`
- `200 when only Sheets succeeds (Resend fails)`
- `502 when both fail`
- `dedup: 2nd submit in window returns 200 deduped`

Regression check: 32/32 GREEN nos arquivos atualmente implementáveis (lead-schema 10, lead-dedup 9, whatsapp-messages 6, lead-route 7).

## Contratos congelados

- `POST /api/lead` aceita JSON, retorna 200/400/422/502 conforme spec acima
- Honeypot field name = `website` (NÃO `company` — Pitfall 8)
- Dedup: 60s window por número WhatsApp normalizado
- Dual-write: idempotência via `Promise.allSettled` — success se pelo menos UMA perna pegou

## Threat model touched

- T-05-06 (spam submission) → honeypot + dedup implementados
- T-05-09 (XSS no email) → `escapeHtml()` aplicado em todos os dynamic fields
- T-05-10 (info disclosure) → responses em erro carregam apenas error code; reason fica em `console.error` server-side
- T-05-14 (JWT forgery) → RS256 via jose, 1h TTL

## ⚠️ Lenny action items (antes da UAT de Wave 5)

Necessário ter no Vercel → Settings → Environment Variables (Preview + Production):

| Var | Como obter |
|---|---|
| `RESEND_API_KEY` | resend.com/api-keys → criar key |
| `LEAD_TO_EMAIL` | Email seu (qualquer) |
| `RESEND_FROM` (opcional) | Default: `Likro Leads <onboarding@resend.dev>` (sandbox); em prod usar `leads@likro.com.br` após DNS verificado em resend.com/domains |
| `GOOGLE_SA_CLIENT_EMAIL` | Service account JSON → `client_email` |
| `GOOGLE_SA_PRIVATE_KEY` | Service account JSON → `private_key` (inteiro, com `\n` escapados pela Vercel) |
| `GOOGLE_SHEET_ID` | URL da planilha → `/spreadsheets/d/{SHEET_ID}/` |

Planilha "Likro — Leads" precisa ter aba `Leads` com headers `timestamp | name | whatsapp | message | utm` (linha 1) e ser **compartilhada com o `client_email`** da service account com permissão de Editor.

Sem essas env vars o código compila, build passa, testes passam (mockados) — mas leads reais em produção falham com `delivery_failed`.

## Next

Wave 3 (Plans 05-04 + 05-05) — LeadForm UI + Header hide-on-scroll. Zero overlap, autônomos, podem rodar em paralelo.
