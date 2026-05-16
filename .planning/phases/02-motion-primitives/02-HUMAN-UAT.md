---
status: partial
phase: 02-motion-primitives
source: [.planning/phases/02-motion-primitives/02-VERIFICATION.md]
started: 2026-05-16T18:30:00Z
updated: 2026-05-16T18:30:00Z
---

## Current Test

[awaiting human testing — items deferred per Lenny's accept on 2026-05-16]

## Tests

### 1. Android real (mid-tier, Chrome) — StickyStage validation
expected: pin segura em /dev/sticky, sem release prematuro, sem jump horizontal, sem chacoalho na barra do Chrome
result: pending
trigger: validar antes de Phase 3 começar a usar `<StickyStage>` em seção real

### 2. macOS Safari — full /dev/* sweep
expected: as 6 sub-rotas funcionam sem regressão; StickyStage estável
result: pending
trigger: validar antes do lançamento público

### 3. Firefox + Edge desktop — full /dev/* sweep
expected: as 6 sub-rotas funcionam; sem regressão de bundle ou interação
result: pending
trigger: validar antes do lançamento público

### 4. prefers-reduced-motion (real OS toggle) — full /dev/all
expected: RevealOnView/TextSplit renderizam HTML puro instantâneo (sem fade-up), ParallaxLayer estático, ScrollScene continua emitindo progress mas consumidor (StageA/StageB no /dev/sticky) renderiza fallback estático. StickyStage preserva estrutura sticky.
result: pending
trigger: validar quando rodar Lighthouse a11y na Phase 3+, ou antes do lançamento público

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
