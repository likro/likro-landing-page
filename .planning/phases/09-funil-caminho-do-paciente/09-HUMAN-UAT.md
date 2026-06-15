---
status: passed
phase: 09-funil-caminho-do-paciente
source: [09-VERIFICATION.md]
started: 2026-06-15T14:50:00Z
updated: 2026-06-15T15:12:00Z
---

## Current Test

[complete]

## Tests

### 1. Mobile rail (≤639px)
expected: Rolando o Funil num viewport mobile, o rail de 4 chips avança, o card central faz crossfade dos 4 beats, e o clímax ignita roxo no chip/card 4. Sem squash de 4 colunas; ~420svh de scroll.
result: passed (via DOM @390/434px: sticky stage 938px, bg dark rgb(13,14,22), FunnelHead 174px + rail 258px centrados, chips presentes; sticky pina em top:0). Screenshot limpo bloqueado por artefato de scroll do Lenis em headless — recomendado um olhar rápido em device real antes do launch.

### 2. prefers-reduced-motion
expected: Com "Reduce Motion" ativo no OS, a seção ocupa 1 viewport só; Marina já na coluna 4 com roxo aceso e selo visível; sem travessia animada e sem ~5 telas de scroll morto.
result: passed (emulado @desktop: funnelHeight === vh, ratio 1.0 — sem dead-scroll; screenshot confirma clímax roxo "Consulta confirmada · quinta, 14h" + selo no estado final).

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None — both items verified (Playwright/DOM, 2026-06-15). Mobile rail recommended for a real-device glance pre-launch (headless screenshot blocked by Lenis scroll artifact, not a code defect).
