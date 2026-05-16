---
phase: 02-motion-primitives
plan: 01
subsystem: motion-primitives
tags:
  - scaffold
  - barrel
  - frozen-api
  - dev-gate
  - vercel-env
dependency_graph:
  requires:
    - phase-01 (FOUND-12 /dev route, providers, useDeviceTier)
  provides:
    - "src/components/motion/ barrel (placeholder) + internal helpers prontos para waves 2-3"
    - "/dev acessível em Vercel previews para real-device validation (D-15)"
  affects:
    - "Todas as 5 primitivas futuras (RevealOnView/ParallaxLayer/StickyStage/TextSplit/ScrollScene) consomem o easing canônico"
    - "ScrollScene + ParallaxLayer consumirão useScrollProgressInRange()"
tech_stack:
  added: []
  patterns:
    - "Barrel único `src/components/motion/index.ts` com header @frozen (MOTION-06 / D-16)"
    - "Sub-pasta `internal/` para helpers NÃO exportados pelo barrel"
    - "Gate /dev híbrido: VERCEL_ENV (prioridade) + NODE_ENV (fallback local)"
key_files:
  created:
    - src/components/motion/index.ts
    - src/components/motion/internal/easing.ts
    - src/components/motion/internal/use-scroll-progress-in-range.ts
  modified:
    - src/app/dev/page.tsx
    - src/lib/analytics.ts
decisions:
  - "Easing canônico único `cubic-bezier(0.16, 1, 0.3, 1)` (Stripe/Linear feel) — registrado como MOTION_EASING; reutilizado por TODAS as 5 primitivas futuras"
  - "REVEAL_DURATION_MS=500 como duração base de reveal (primitivas vão ajustar por tier)"
  - "Gate /dev: prioridade ao VERCEL_ENV; fallback NODE_ENV cobre uso local. Cobre 4 cenários (local dev/local prod/preview/prod)"
metrics:
  duration: "~10min"
  completed: "2026-05-16"
  tasks: 2
  files_created: 3
  files_modified: 2
requirements:
  - MOTION-06
---

# Phase 2 Plan 1: Foundation Summary

**One-liner:** Scaffold físico isolado da biblioteca de primitivas — barrel `@frozen` vazio, easing canônico único, helper interno stub, e gate `/dev` ajustado para liberar Vercel previews mantendo produção real bloqueada.

## What Was Built

### Estrutura criada

```
src/components/motion/
├── index.ts                                    # barrel @frozen (MOTION-06 / D-16)
└── internal/
    ├── easing.ts                                # MOTION_EASING + REVEAL_DURATION_MS
    └── use-scroll-progress-in-range.ts          # hook stub para ScrollScene + ParallaxLayer
```

- **`src/components/motion/index.ts`** — barrel oficial das primitivas. Propositalmente sem `export {...}` concretos ainda (`export {};` apenas) — apenas o header de política `@frozen` documentando:
  - Mudanças exigem PR com label `motion-api-change` e aprovação explícita do Lenny (D-16).
  - Consumidores NUNCA importam `motion/react` direto, apenas deste barrel.
  - Imports de `./internal/*` não são permitidos fora desta pasta (convenção, não enforced).
- **`src/components/motion/internal/easing.ts`** — Duas constantes públicas (dentro da pasta `motion/`):
  - `MOTION_EASING = [0.16, 1, 0.3, 1] as const` — única curva canônica permitida. Diferenças entre primitivas devem vir de duration/distance/stagger, NUNCA de easing.
  - `REVEAL_DURATION_MS = 500` — duração base; primitivas modulam por tier (D-10).
- **`src/components/motion/internal/use-scroll-progress-in-range.ts`** — Helper `"use client"` que wrappa `useScroll` da `motion/react` com defaults sensatos (`['start end', 'end start']`). Stub mínimo, retorna `scrollYProgress: MotionValue<number>`. Será consumido por `<ScrollScene>` (D-01..D-04) e `<ParallaxLayer>` (D-11) nas próximas waves.

### Gate `/dev` (D-15)

Antes:
```typescript
if (process.env.NODE_ENV === "production") { notFound(); }
```

Depois:
```typescript
if (
  process.env.VERCEL_ENV === "production" ||
  (process.env.VERCEL_ENV === undefined && process.env.NODE_ENV === "production")
) {
  notFound();
}
```

Matriz de comportamento dos 4 cenários:

| Cenário | `VERCEL_ENV` | `NODE_ENV` | Resultado |
|---------|--------------|------------|-----------|
| Localhost dev (`npm run dev`) | undefined | development | libera |
| Localhost build prod (`npm run start`) | undefined | production | 404 |
| Vercel preview (`.vercel.app`) | `preview` | production | libera |
| Vercel produção (likro.com.br) | `production` | production | 404 |

Resultado prático: cada PR vira um preview `.vercel.app/dev` que o Lenny abre direto no iPhone/Android — zero setup, sem ngrok. Domínio público real permanece 404. Previews ficam noindex via FOUND-11 (robots.txt + X-Robots-Tag), então `/dev` em preview não corre risco de indexação.

JSDoc do arquivo atualizado para citar FOUND-12 + D-15 e a matriz acima.

## Verification Results

- `npx tsc --noEmit` exit 0 (limpo após o fix do drift em `analytics.ts`).
- `npm run build` exit 0 — site compila com `/dev` route prerendered estático (81.7 kB, First Load 184 kB — sem regressão de Phase 1).
- Todos os greps de acceptance criteria das 2 tasks passam.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Adicionar `'whatsapp_cta_error'` ao union `AnalyticsEvent`**

- **Found during:** Task 2 (`npm run build` exigido por acceptance criteria)
- **Issue:** `src/components/ui/whatsapp-cta.tsx:58` chama `track("whatsapp_cta_error", ...)` mas esse event name nunca foi adicionado ao union type `AnalyticsEvent` em `src/lib/analytics.ts`. Erro TS2345 já existia no HEAD (`4c60a0e`) — drift de Phase 1 entre código e tipo.
- **Por que auto-fix:** O acceptance criteria explícito da Task 2 inclui `npm run build exit 0`. Sem corrigir esse erro, a Task 2 não pode ser declarada completa. Fix é trivial (uma linha no union) e está estritamente dentro do escopo de "fazer o build verde" deste plan.
- **Fix:** Adicionada `"whatsapp_cta_error"` ao union `AnalyticsEvent` em `src/lib/analytics.ts`.
- **Files modified:** `src/lib/analytics.ts`
- **Commit:** `3cc2ff5` (junto com a Task 2 para manter atomicidade do "passar o build")

## Próximas Waves

- **Wave 2 (plans 02-04):** Implementação concreta das 5 primitivas — `<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>`, `<ScrollScene>`. Cada uma re-exportada pelo barrel `src/components/motion/index.ts`.
- **Wave 3 (plan 05):** Sub-rotas isoladas `/dev/reveal`, `/dev/parallax`, `/dev/sticky`, `/dev/textsplit`, `/dev/scene` + `/dev/all` para validação real-device via Vercel preview URLs.
- **Wave 4 (plan 06):** `README.md` em `components/motion/` documentando contrato (D-17), política de freeze, e lista de devices validados.

## Known Stubs

- `src/components/motion/index.ts` — barrel propositalmente vazio (`export {};`). É um stub intencional: os re-exports serão adicionados pelas waves 2-3, após cada primitiva existir. Documentado no header e no plan.
- `src/components/motion/internal/use-scroll-progress-in-range.ts` — funcional, não é stub de comportamento, mas API contract pode ser expandida pelas primitivas reais (ScrollScene pode precisar de container/layoutEffect refinements).

Nenhum stub bloqueia o objetivo deste plan (scaffold + gate). Resolução: waves 2-3.

## Threat Flags

Nenhuma nova superfície de ameaça introduzida. Mudança do gate é defesa-em-profundidade adicional (preview já tinha noindex via FOUND-11). Sem novos endpoints, sem inputs de usuário, sem chamadas externas.

## Self-Check: PASSED

- FOUND: `src/components/motion/index.ts`
- FOUND: `src/components/motion/internal/easing.ts`
- FOUND: `src/components/motion/internal/use-scroll-progress-in-range.ts`
- FOUND: commit `b484f08` (Task 1 scaffold)
- FOUND: commit `3cc2ff5` (Task 2 gate + drift fix)
- `npm run typecheck` exit 0
- `npm run build` exit 0
- Todos os greps de acceptance_criteria passam
