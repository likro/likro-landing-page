---
phase: quick-260616-hkf
plan: 01
subsystem: lead-form
tags: [server-env, google-sheets, resend, env-validation, edge-runtime]
requires:
  - "src/lib/server-env.ts (getServerEnv lazy + Proxy)"
  - "src/lib/lead-sheets.ts (appendLeadRow via fetch + jose)"
provides:
  - "getGoogleEnv() — gate de estado do Sheets (null/objeto/throw)"
  - "appendLeadRow no-op gracioso quando Sheets off"
  - "getServerEnv() valida só Resend (Google desacoplado)"
affects:
  - "src/lib/lead-resend.ts (inalterado — só lê RESEND_API_KEY/LEAD_TO_EMAIL)"
  - "src/app/api/lead/route.ts (inalterado — Promise.allSettled já absorve o no-op/throw)"
tech-stack:
  added: []
  patterns:
    - "Split de schema env: obrigatórias (Resend) validadas eager-lazy; opcionais (Google) via helper de estado tristate"
    - "Gate tristate null/objeto/throw para feature secundária opcional"
key-files:
  created:
    - "tests/lib/server-env.test.ts"
  modified:
    - "src/lib/server-env.ts"
    - "src/lib/lead-sheets.ts"
decisions:
  - "Config parcial do Google (1-2/3 vars) lança erro claro em vez de no-op silencioso — operador percebe o erro nos logs, mas allSettled na route preserva a entrega Resend (200)"
  - "Caso parcial NÃO cacheia, para reavaliar correções de env durante dev"
metrics:
  duration: "~3min"
  completed: "2026-06-16"
  tasks: 3
  files: 3
requirements:
  - SHEETS-OPT-01
  - SHEETS-OPT-02
  - SHEETS-OPT-03
  - SHEETS-OPT-04
---

# Phase quick-260616-hkf Plan 01: Tornar Google Sheets opcional no form de leads — Summary

Google Sheets virou entrega **secundária opcional** no form de leads: com só `RESEND_API_KEY` + `LEAD_TO_EMAIL` setadas (zero vars Google), o form entrega por email e a rota devolve 200, sem promise rejeitada barulhenta. O acoplamento que fazia `sendLeadEmail` disparar a validação do schema inteiro (502 sem vars Google) foi quebrado separando o schema obrigatório (Resend) do gate opcional (Google).

## What Was Built

- **`server-env.ts`** — `getServerEnv()` agora valida apenas `RESEND_API_KEY` + `LEAD_TO_EMAIL`; o Proxy `serverEnv` cobre só esses 2 campos, então ler `serverEnv.RESEND_API_KEY` nunca toca em var Google. Novo `getGoogleEnv()` tristate: `null` (0/3 → Sheets off), `GoogleEnv` (3/3 → on), `throw` (1-2/3 → config parcial, listando faltantes). `__resetServerEnvForTests()` para isolamento.
- **`lead-sheets.ts`** — `appendLeadRow()` faz gate via `getGoogleEnv()` no início: `null` → no-op silencioso (sem fetch, sem log). `getAccessToken(google: GoogleEnv)` recebe as credenciais por argumento em vez de ler o Proxy. Preservados: `server-only`, jose (`SignJWT`/`importPKCS8`), Pitfall 1 (unescape `\\n`), constantes, formato da row, lógica de fetch/erro, edge runtime.
- **`tests/lib/server-env.test.ts`** — 10 testes cobrindo OFF/ON/PARCIAL + obrigatórias Resend faltando + não-cache do parcial + trim de whitespace.

## Verification

- `npm run typecheck` — verde.
- `npm run test` — 43 arquivos, **240 testes passam** (inclui a suite nova de 10).
- Grep: `lead-resend.ts` não contém `GOOGLE_`; `lead-sheets.ts` não contém `serverEnv`.

## Deviations from Plan

None — plano executado exatamente como escrito. (Task 1 foi marcada `tdd="true"` no plano, mas seus testes pertencem à Task 3 — segui a estrutura do plano: Task 1 verificada por typecheck, suite de testes na Task 3.)

## Deferred Issues

Ver `deferred-items.md`. Resumo: `npm run test` reporta `1 error` (não test failure — todos os 240 testes passam) — um `ReferenceError: window is not defined` pós-teardown originado em `tests/components/ui/whatsapp-cta.test.tsx`, arquivo pré-existente (último commit `e7faae6`, Phase 01-04) sem relação com este plano. Fora de escopo; não corrigido.

## Self-Check: PASSED
