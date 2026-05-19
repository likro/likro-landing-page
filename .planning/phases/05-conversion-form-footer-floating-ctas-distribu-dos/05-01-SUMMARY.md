---
phase: 05-conversion-form-footer-floating-ctas-distribu-dos
plan: 01
subsystem: lead-form-foundation
tags: [server-env, zod, dedup, microcopy, foundation]
requires:
  - phase: 01
    provides: ["src/lib/env.ts (NEXT_PUBLIC_* schema)", "src/lib/whatsapp.ts (buildWhatsAppUrl)"]
provides:
  - "src/lib/server-env.ts → getServerEnv() + serverEnv Proxy (5 secrets validados)"
  - "src/lib/lead-schema.ts → leadSchema, normalizeWhatsapp, type Lead"
  - "src/lib/lead-dedup.ts → checkAndRegisterDedup, helpers de teste"
  - "src/content/form.ts → FORM_COPY (microcopy v1)"
  - "src/content/footer.ts → FOOTER_COPY"
  - ".env.example → contrato de env vars (NEXT_PUBLIC_* + server secrets)"
affects:
  - "Plan 05-02 (testes): consome leadSchema, normalizeWhatsapp, __resetDedupForTests"
  - "Plan 05-03 (edge route): consome serverEnv, leadSchema, checkAndRegisterDedup"
  - "Plan 05-04 (form UI): consome FORM_COPY, leadSchema (RHF resolver)"
  - "Plan 05-06 (footer + floating): consome FOOTER_COPY, FORM_COPY.sectionId"
tech-stack:
  added: ["resend@^6.12.3", "jose@^6.2.3", "server-only@^0.0.1"]
  patterns: ["lazy env validation (Proxy + cache)", "in-memory dedup com cleanup oportunista", "schema compartilhado client/server via Zod"]
key-files:
  created:
    - "src/lib/server-env.ts"
    - "src/lib/lead-schema.ts"
    - "src/lib/lead-dedup.ts"
    - "src/content/form.ts"
    - "src/content/footer.ts"
    - ".env.example"
  modified:
    - "package.json"
    - "package-lock.json"
decisions:
  - "Lazy validation no server-env.ts (Proxy + cache) em vez de top-level throw — evita quebrar next build sem env vars (override do plan via additional_constraints, RESEARCH Pitfall 3)"
  - "Honeypot field name = 'website' (anti 1Password/LastPass — Pitfall 8)"
  - "Dedup in-memory per-instance aceito v1; spans multi-instance produzem 2 emails no pior caso (promover pra Upstash KV se virar problema)"
metrics:
  duration: "~7m 31s"
  tasks_completed: 5
  files_created: 6
  files_modified: 2
  completed: 2026-05-19
---

# Phase 5 Plan 01: Fundação do Lead Form — Resumo

Fundação completa do funil de conversão: dependências instaladas (Resend, jose, server-only), módulos de lib criados (server-env lazy-validado, lead-schema com normalizeWhatsapp compartilhada, dedup in-memory com TTL 60s), microcopy do form e footer disponíveis como TS puro e `.env.example` documentando o contrato server vs public.

## Tarefas Executadas

| Task | Nome                                            | Commit    | Arquivos                                                                 |
| ---- | ----------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| 1    | Instalar deps + .env.example                    | `aeab5c4` | package.json, package-lock.json, .env.example                            |
| 2    | Criar src/lib/server-env.ts                     | `292eb41` | src/lib/server-env.ts                                                    |
| 3    | Criar src/lib/lead-schema.ts                    | `409c303` | src/lib/lead-schema.ts                                                   |
| 4    | Criar src/lib/lead-dedup.ts                     | `9022c65` | src/lib/lead-dedup.ts                                                    |
| 5    | Criar content/form.ts + footer.ts               | `8cffe8c` | src/content/form.ts, src/content/footer.ts                               |

## Contratos Exportados

### `src/lib/server-env.ts`
```typescript
export function getServerEnv(): {
  RESEND_API_KEY: string;
  LEAD_TO_EMAIL: string;
  GOOGLE_SA_CLIENT_EMAIL: string;
  GOOGLE_SA_PRIVATE_KEY: string;
  GOOGLE_SHEET_ID: string;
};
export const serverEnv: ServerEnv; // Proxy lazy — mantém API ergonômica
```
- Marcado com `import "server-only"` na primeira linha — Next.js bloqueia build se for importado de client component (mesmo via cadeia transitiva).
- Validação lazy: a primeira chamada de `getServerEnv()` (ou primeiro acesso ao `serverEnv` Proxy) faz `safeParse(process.env)` e cacheia. Se faltar var → throw com lista de issues do Zod + ponteiro pra `.env.example`.
- Zero callers atualmente (Plan 03 adiciona).

### `src/lib/lead-schema.ts`
```typescript
export function normalizeWhatsapp(raw: string): string; // só dígitos
export const leadSchema: z.ZodSchema<Lead>;
export type Lead = {
  name: string;       // >= 2 chars, trimmed, <= 120
  whatsapp: string;   // normalized (10-13 digits, refine após transform)
  message?: string;   // <= 1000 chars, empty string vira undefined
  utm?: string;       // opaque, <= 500
  website?: string;   // honeypot — schema aceita; route handler trata
};
```
- `normalizeWhatsapp("+55 (11) 99999-9999")` → `"5511999999999"`.
- Honeypot field name = `website` (NÃO `company`) — anti 1Password/LastPass (Pitfall 8).

### `src/lib/lead-dedup.ts`
```typescript
export function checkAndRegisterDedup(normalizedPhone: string): boolean;
// true → duplicate dentro da janela 60s
// false → novo (registrado agora)

export function __resetDedupForTests(): void;
export function __getDedupSizeForTests(): number;
```
- `WINDOW_MS = 60_000`, cleanup oportunista O(n) por chamada — evita memory leak sem timer/cron.
- Caller responsabilidade: normalizar o número ANTES de chamar (consistência com `lead-schema.normalizeWhatsapp`).

### `src/content/form.ts`
- `FORM_COPY.sectionId = "lead-form-section"` (IntersectionObserver no Plan 06 — floating WA se esconde quando form em viewport).
- `FORM_COPY.fields.honeypot.name = "website"` (anti-autofill).
- Tom premium silencioso, anti-infoproduto — heading "Prefere que a gente te procure?", submit "Quero conversar".

### `src/content/footer.ts`
- `FOOTER_COPY.copyright = "© 2026 Likro. Operação para clínicas e estéticas."`
- `FOOTER_COPY.links` inclui `/privacy` (placeholder rota — Phase 7 escreve) e `#whatsapp` (href real vem via `buildWhatsAppUrl` no consumer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Refactor de server-env.ts para validação LAZY em vez de module-load throw**
- **Found during:** Task 2
- **Issue:** O plan especifica `schema.parse(process.env)` em escopo de módulo, com `throw` no boot. Isso conflita com o `additional_constraints` do prompt (override do plan): "Zod schema validation should be lazy — don't validate at module load; validate inside the function on first call". O motivo do override é concreto: o `next build` executa módulos server durante prerender; se as env vars não estiverem disponíveis no momento do build (típico em CI), o build inteiro quebra antes do route handler existir. Plans 03+ ainda nem foram executados — se mantivéssemos top-level throw, qualquer `next build` quebraria agora.
- **Fix:** Schema definido em module scope (não custa nada — é só metadata Zod). Validação executada em `getServerEnv()` que cacheia o resultado em `let cached: ServerEnv | null`. Adicionei um `Proxy<ServerEnv>` exportado como `serverEnv` para manter a API ergonômica do plan original (`serverEnv.RESEND_API_KEY`) — qualquer acesso de field dispara o `getServerEnv()` por trás dos panos. UX de erro idêntica (lista de issues Zod + ponteiro pra `.env.example`).
- **Files modified:** `src/lib/server-env.ts`
- **Commit:** `292eb41`
- **Impact:** API de consumo idêntica ao plan (`serverEnv.RESEND_API_KEY` funciona). Build não quebra sem env vars. Primeira chamada em runtime valida. Trade-off: validação acontece em request-time em vez de boot-time — em troca, build é resiliente. Acceptable porque o erro vira 500 explícito (com mensagem clara) em vez de build falhando.

Nenhuma outra deviation. Todos os outros tasks executados exatamente como o plan especificou.

## Threat Mitigations Aplicadas

| Threat ID | Mitigação                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------ |
| T-05-01   | `import "server-only"` na linha 16 do server-env.ts — Next bloqueia client imports               |
| T-05-02   | Zod `safeParse` + throw com lista de issues — server falha alta e visível (lazy via Proxy)       |
| T-05-03   | Cleanup oportunista O(n) a cada chamada de `checkAndRegisterDedup` + TTL 60s                     |
| T-05-04   | `normalizeWhatsapp` exportada de `lead-schema.ts` única — client e server usam o mesmo módulo    |
| T-05-05   | Honeypot field name = `website` em schema e content — Plan 04 adiciona off-screen CSS + a11y    |

## Verification

- [x] `npm run typecheck` exits 0
- [x] `npm ls resend jose server-only` exits 0 (3 deps instaladas)
- [x] `.env.example` contém `RESEND_API_KEY=`, `LEAD_TO_EMAIL=`, `GOOGLE_SA_CLIENT_EMAIL=`, `GOOGLE_SA_PRIVATE_KEY=`, `GOOGLE_SHEET_ID=` sem prefixo `NEXT_PUBLIC_`
- [x] `grep -r "RESEND_API_KEY" src/` retorna apenas `src/lib/server-env.ts`
- [x] `grep -r 'name: "company"' src/` retorna 0 matches (honeypot é `website`)
- [x] `grep "Quero conversar" src/sections/ src/components/` retorna 0 (copy ainda não consumida em JSX — esperado, Plans 04/06 fazem o wire-up)
- [x] Nenhum consumer importa `@/lib/server-env` ainda (Plan 03 adiciona)
- [x] `src/lib/env.ts` intocado (server secrets NÃO foram misturados com NEXT_PUBLIC_*)
- [x] `src/lib/analytics.ts` intocado (território do Plan 05-02)

## Known Stubs

Nenhum stub. Todos os módulos exportam funções/objetos completos e usáveis pelos plans seguintes — só falta o caller code (Plans 02, 03, 04, 06).

`.env.example` contém placeholders de credenciais (ex: `re_xxxxxxxxxxxx`) — isso é parte do contrato do arquivo (template), não stub funcional.

## Self-Check: PASSED

**Arquivos criados confirmados:**
- FOUND: `src/lib/server-env.ts`
- FOUND: `src/lib/lead-schema.ts`
- FOUND: `src/lib/lead-dedup.ts`
- FOUND: `src/content/form.ts`
- FOUND: `src/content/footer.ts`
- FOUND: `.env.example`

**Commits confirmados:**
- FOUND: `aeab5c4` (Task 1 — deps + .env.example)
- FOUND: `292eb41` (Task 2 — server-env.ts)
- FOUND: `409c303` (Task 3 — lead-schema.ts)
- FOUND: `9022c65` (Task 4 — lead-dedup.ts)
- FOUND: `8cffe8c` (Task 5 — content files)

**Typecheck:** `npm run typecheck` exits 0

**Anti-pattern checks:**
- Zero `name: "company"` (honeypot é `website`)
- Zero menções de `RESEND_API_KEY` fora de `src/lib/server-env.ts`
- Zero imports de `@/lib/server-env` em consumers (esperado, Plan 03 adiciona)
- `src/lib/env.ts` intocado
- `src/lib/analytics.ts` intocado
