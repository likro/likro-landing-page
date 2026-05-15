---
phase: 01-foundations-design-system
plan: 02
subsystem: cta-whatsapp
tags: [whatsapp, cta, deeplink, tdd, security-guard]
requires:
  - "Plan 01-01: vitest@3 configurado + alias @ + tsconfig strict + ./src layout"
provides:
  - "buildWhatsAppUrl(message, location) — ÚNICO produtor de URLs wa.me na codebase (CTA-01)"
  - "WhatsAppLocation type union (hero|pain|product|how|proof|footer|floating)"
  - "WHATSAPP_MESSAGES Record<WhatsAppLocation, string> — 7 mensagens placeholder pt-BR (D-12)"
  - "FORBIDDEN_HOSTS runtime guard rejeitando web.whatsapp.com e api.whatsapp.com (CTA-02)"
  - "Phone format guard /^\\d{12,13}$/ — bloqueia formato humano (+55 11 9...) early"
  - "encodeMessage helper RFC 3986 estrito (! → %21, ( → %28, etc) para compat WhatsApp"
  - "8 unit tests cobrindo CTA-01 + CTA-02 (canonical, encoding, forbidden hosts, phone guards, dev placeholder)"
affects:
  - "Plan 01-04 (atoms + providers): <WhatsAppCta> vai consumir buildWhatsAppUrl + WHATSAPP_MESSAGES"
  - "Plan 01-03 (lib/env): refactor opcional pra trocar process.env.NEXT_PUBLIC_WA_NUMBER por env.NEXT_PUBLIC_WA_NUMBER — não bloqueante"
  - "Phase 3+ (todas as seções): todo CTA WhatsApp passa por este helper, garantindo deeplink mobile-safe"
tech-stack-added: []
patterns-introduced:
  - "Single-point-of-truth helper pra construção de URL externa de risco crítico (PITFALLS #5)"
  - "Defensive runtime guards com error messages que apontam o caller (location param) — facilita debug"
  - "RFC 3986 strict encoding via encodeURIComponent + regex replace pra `!*'()` (encodeURIComponent legacy deixa esses sem escape; WhatsApp prefere encoded)"
  - "TDD RED-GREEN no Phase 1: tests escritos primeiro, falha confirmada por import resolution, implementação só depois"
key-files-created:
  - path: "tests/lib/whatsapp.test.ts"
    purpose: "8 vitest cases cobrindo CTA-01 (canonical wa.me + encoding) e CTA-02 (forbidden hosts + phone validation + dev placeholder)"
  - path: "src/lib/whatsapp.ts"
    purpose: "buildWhatsAppUrl helper + WhatsAppLocation type + FORBIDDEN_HOSTS + encodeMessage. ~80 linhas."
  - path: "src/content/whatsapp.ts"
    purpose: "WHATSAPP_MESSAGES Record com 7 placeholders pt-BR (hero/pain/product/how/proof/footer/floating)"
key-files-modified: []
key-decisions:
  - "encodeURIComponent NÃO encoda `!*'()` por padrão (legacy RFC 2396). Adicionei encodeMessage que faz replace pós-encode pra garantir `Oi!` vire `Oi%21` — alinha com expectativa explícita do plan (must_haves: '! vira %21') e melhora compat WhatsApp"
  - "process.env.NEXT_PUBLIC_WA_NUMBER lido direto (sem lib/env). Refactor pra lib/env é safe-merge na Plan 04 — fora de escopo desta plan"
  - "Placeholder phone 0000000000 + console.warn em dev > throw em prod. Permite dev local sem env var configurada; prod falha fast"
  - "Phone regex `/^\\d{12,13}$/` cobre DDDs sem 9 (12 dígitos, ex: SP antigo) e DDDs com 9 (13 dígitos, ex: 5511 + 9XXXXXXXX). Validado com test case explícito"
metrics:
  tasks-completed: 2
  duration: "~4min (inclui npm install no worktree)"
  completed-date: "2026-05-15"
---

# Phase 1 Plan 2: WhatsApp Helper + Content Map Summary

Helper `buildWhatsAppUrl` blindado com guards anti-`web.whatsapp.com`/`api.whatsapp.com` e validação de formato de telefone — o coração do RISCO CRÍTICO #5 (PITFALLS.md: WhatsApp abrindo browser em vez do app). 8 unit tests TDD verdes garantem que nenhum CTA da Phase 3+ vai vazar formato inválido. Mapa de 7 mensagens placeholder pt-BR por location pronto para revisão do Lenny no PR.

## What Shipped

### Task 1 — Tests primeiro (RED) — commit `9539773`

- `tests/lib/whatsapp.test.ts` com 8 cases:
  1. `builds canonical wa.me URL with encoded message`
  2. `URL-encodes spaces and special chars` (`a b & c` → `a%20b%20%26%20c`)
  3. `throws on web.whatsapp.com in message (CTA-02 guard)`
  4. `throws on api.whatsapp.com in message (CTA-02 guard)`
  5. `throws on invalid phone format (+ or spaces)`
  6. `throws on phone too short (< 12 digits)`
  7. `accepts 12-digit phone (DDD without 9 prefix)`
  8. `uses placeholder when NEXT_PUBLIC_WA_NUMBER missing in dev`
- Vitest run confirmou RED: `Failed to resolve import "@/lib/whatsapp"` — módulo ainda não existia.

### Task 2 — Implementação (GREEN) — commit `6cb9bee`

- `src/lib/whatsapp.ts` (~80 linhas):
  - `FORBIDDEN_HOSTS = ["web.whatsapp.com", "api.whatsapp.com"]` — guard runtime
  - `WhatsAppLocation` type union de 7 strings
  - `encodeMessage()` helper RFC 3986 estrito (`encodeURIComponent` + replace pra `!*'()`)
  - `buildWhatsAppUrl(message, location)` — guards (forbidden hosts → phone regex) → retorna `https://wa.me/${phone}?text=${encoded}`
  - Dev fallback: placeholder `0000000000` + `console.warn` quando env var falta; prod throws
- `src/content/whatsapp.ts`: `WHATSAPP_MESSAGES` Record com 7 mensagens placeholder pt-BR
- `npx vitest run` ✅ 8/8 passing em 8ms
- `npx tsc --noEmit` ✅ 0 errors

## Verification

| Gate                                                    | Command                                                  | Result                                                |
| ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Unit tests                                              | `npx vitest run tests/lib/whatsapp.test.ts`              | ✅ 8/8 passed                                         |
| Typecheck strict                                        | `npx tsc --noEmit`                                       | ✅ 0 errors                                           |
| Uniqueness do helper (CTA-01: único produtor de wa.me)  | grep `wa\.me` em `src/`                                  | ✅ apenas em `src/lib/whatsapp.ts` (docs + 2 returns) |
| Forbidden hosts não vazam fora do guard                 | grep `web\.whatsapp\.com\|api\.whatsapp\.com` em `src/`  | ✅ apenas em FORBIDDEN_HOSTS + JSDoc de `whatsapp.ts` |
| Mensagens em pt-BR                                      | inspect `WHATSAPP_MESSAGES`                              | ✅ todas contêm "Oi" e/ou "clínica"/"Likro"           |
| `WhatsAppLocation` type tem 7 keys                      | grep `\| "` em `whatsapp.ts`                             | ✅ hero, pain, product, how, proof, footer, floating  |

## Lista de mensagens placeholder (Lenny aprova no PR)

| Location     | Mensagem                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `hero`       | Oi! Vi a Likro no Instagram e quero entender como funciona pra minha clínica.                                       |
| `pain`       | Oi! Tô com dificuldade pra organizar o atendimento da clínica — pode me explicar como a Likro ajuda?                |
| `product`    | Oi! Vi os recursos da Likro e quero conversar sobre como aplicar na minha clínica.                                  |
| `how`        | Oi! Quero entender como ficaria o fluxo de lead do Instagram até a marcação na minha clínica.                       |
| `proof`      | Oi! Quero conversar sobre a Likro pra minha clínica.                                                                |
| `footer`     | Oi! Quero saber mais sobre a Likro.                                                                                 |
| `floating`   | Oi! Quero conversar sobre a Likro.                                                                                  |

> **Nota pro Lenny:** mensagens devem soar humanas, sem buzzwords. `proof` e `floating` ficaram propositalmente curtas (CTA já foi escalado nas seções anteriores). Sinta-se livre pra reescrever no PR.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocker] `node_modules` ausente no worktree**

- **Found during:** Task 1 (primeira execução de vitest)
- **Issue:** Worktree foi criado a partir do commit base `f79d1e2` (que tem `package.json` + scaffold) mas sem `node_modules` populado. Vitest falhou com `Cannot find module 'vitest/config'`.
- **Fix:** `npm install --no-audit --no-fund` — 499 packages, ~1min. Não impacta o branch base.
- **Commit:** N/A (não checa-se `node_modules`; é setup do worktree)

**2. [Rule 1 — Bug] `encodeURIComponent("!")` retorna `!` (legacy RFC 2396), mas plan espera `%21`**

- **Found during:** Task 2 (vitest após implementação inicial)
- **Issue:** O case `builds canonical wa.me URL with encoded message` checa `Oi%21%20Vi%20a%20Likro`, mas a impl original com `encodeURIComponent` produzia `Oi!%20Vi%20a%20Likro`. Plan `must_haves` explicita: "`!` vira `%21`". `encodeURIComponent` deixa `!*'()` sem escape porque foi spec'd contra RFC 2396 (legacy).
- **Fix:** Adicionei `encodeMessage()` helper: `encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())`. Garante encoding RFC 3986 estrito. Substituí ambos os call sites no helper.
- **Files modified:** `src/lib/whatsapp.ts` (encodeMessage adicionado, 2 call sites trocados)
- **Commit:** `6cb9bee`

### Non-deviations (intentional plan-following)

- Plano pedia "8 `it(...)` test cases" — entreguei exatamente 8.
- Plano pedia `process.env.NEXT_PUBLIC_WA_NUMBER` lido direto (sem lib/env). Mantive (lib/env entra na Plan 03 e refactor pra usar lib/env é safe-merge na Plan 04 — fora de escopo).
- Plano pedia 7 chaves específicas em `WhatsAppLocation` — entreguei exatamente as 7 (hero, pain, product, how, proof, footer, floating).
- Conteúdo do helper segue RESEARCH §Pattern 6 ipsis litteris exceto pelo `encodeMessage` adicionado (deviation #2 acima).

## Threat Flags

None new. Threat register original (T-01-05..08 do plan) cobre todos os trust boundaries deste código:
- T-01-05 (Tampering URL): mitigated por `encodeMessage` (tested).
- T-01-06 (Info leak via web client): mitigated por FORBIDDEN_HOSTS throw (tested).
- T-01-07 (Silent fail por phone malformado): mitigated por regex `/^\d{12,13}$/` throw (tested).
- T-01-08 (env exposure): accepted — phone WhatsApp é PUBLIC info por design.

## Requirements Covered

- **CTA-01** — Helper único + canonical `wa.me/<phone>?text=...` format ✅ (verificado por grep + 2 test cases)
- **CTA-02** — Forbidden hosts guard + unit test ✅ (2 test cases cobrem `web.whatsapp.com` e `api.whatsapp.com`; phone format guard com 3 cases adicionais)

## Notes for Downstream

- **Plan 01-03 (lib/env):** este código lê `process.env.NEXT_PUBLIC_WA_NUMBER` direto. Quando `lib/env.ts` (esquema zod com `NEXT_PUBLIC_WA_NUMBER` validado) existir, pode-se refatorar trocando `process.env.NEXT_PUBLIC_WA_NUMBER` por `env.NEXT_PUBLIC_WA_NUMBER` — safe-merge em Plan 04. Não bloqueante.
- **Plan 01-04 (atoms + providers):** `<WhatsAppCta location="hero">` deve:
  ```tsx
  import { buildWhatsAppUrl, type WhatsAppLocation } from "@/lib/whatsapp";
  import { WHATSAPP_MESSAGES } from "@/content/whatsapp";
  const href = buildWhatsAppUrl(WHATSAPP_MESSAGES[location], location);
  ```
  Importante: **nunca** construir URL inline — sempre via helper. Lint rule futura pode banir `wa.me` literal em `*.tsx`.
- **Phase 3+ (seções):** copy review do Lenny por location no PR antes da seção entrar em dev (D-12). Strings em `WHATSAPP_MESSAGES` são single source of truth — mudou aqui, mudou em todas as seções.
- **Testes futuros:** se quiser brand-lock test (Plan 03 sugere): grep `wa\.me/` sobre `src/**/*.{ts,tsx}` excluindo `src/lib/whatsapp.ts` — deve retornar 0 matches.

## Self-Check: PASSED

- FOUND: tests/lib/whatsapp.test.ts (commit 9539773)
- FOUND: src/lib/whatsapp.ts (commit 6cb9bee)
- FOUND: src/content/whatsapp.ts (commit 6cb9bee)
- FOUND commit 9539773: `git log --oneline | grep 9539773` ✅
- FOUND commit 6cb9bee: `git log --oneline | grep 6cb9bee` ✅
- VERIFIED: 8/8 vitest cases passing
- VERIFIED: 0 tsc errors
- VERIFIED: `wa.me` grep returns only `src/lib/whatsapp.ts`
- VERIFIED: `web.whatsapp.com|api.whatsapp.com` grep returns only `src/lib/whatsapp.ts` (FORBIDDEN_HOSTS + docs)
