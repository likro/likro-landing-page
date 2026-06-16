# Deferred Items — quick-260616-hkf

## Out-of-scope discoveries (NOT fixed)

### 1. Post-teardown `window is not defined` em whatsapp-cta.test.tsx
- **Found during:** Task 3 (rodar suite inteira)
- **Sintoma:** `npm run test` reporta `1 error` (não test failure — os 240 testes passam). Erro `ReferenceError: window is not defined` originado em `tests/components/ui/whatsapp-cta.test.tsx`, disparado por um `setLoading(false)` no `finally` do `handleClick` que resolve depois do teardown do ambiente jsdom.
- **Por que out-of-scope:** Arquivo tocado pela última vez em `e7faae6` (Phase 01-04 atoms), sem relação com este plano (que mexe só em `server-env.ts` + `lead-sheets.ts`). É race de teardown assíncrono pré-existente.
- **Fix sugerido (futuro):** aguardar a promise pendente no teste antes de finalizar, ou cancelar o estado no unmount.
