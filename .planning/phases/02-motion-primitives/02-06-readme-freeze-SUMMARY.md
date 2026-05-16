---
phase: 02-motion-primitives
plan: 06
subsystem: motion-primitives
tags:
  - documentation
  - api-freeze
  - real-device-validation
  - checkpoint
  - phase-close
dependency_graph:
  requires:
    - phase-02 plans 01-05 (todas as 5 primitivas implementadas, barrel @frozen, showcase /dev funcional)
    - Vercel preview da branch phase-02-validation (real-device gate)
  provides:
    - "src/components/motion/README.md — documentação congelada da API (5 primitivas, exemplo de cada, exceção controlada de motion/react, política @frozen D-16, internals listados)"
    - "Validated Devices table — registro factual dos devices em que a biblioteca foi validada em produção-like (Vercel preview)"
    - "Cobertura pendente declarada — Android, macOS Safari, Firefox/Edge, prefers-reduced-motion marcados como triggers explícitos pra Phase 3+"
  affects:
    - "Phase 3+ pode consumir a biblioteca sabendo que o contrato está estável (D-16)"
    - "Backlog Phase 3+: refinar visualmente o composto StickyStage+ScrollScene em /dev/sticky (técnica provada, visual de showcase aceito como demonstrativo)"
tech_stack:
  added: []
  patterns:
    - "@frozen + motion-api-change label — política de mudança documentada no README e replicada como header em cada primitiva (D-16, auditada via grep nesta task)"
    - "Cobertura pendente declarada explicitamente no README em vez de só nas issues — trigger conditions ficam co-locadas com o artifact que precisa ser revisitado"
key_files:
  created:
    - src/components/motion/README.md
    - .planning/phases/02-motion-primitives/02-06-readme-freeze-SUMMARY.md
  modified:
    - src/app/dev/sticky/page.tsx
    - src/app/dev/all/page.tsx
deviations:
  - rule: 2 (additive)
    reason: |
      Durante a validação real-device (Task 3), Lenny observou que o `/dev/sticky` Stage B com label estático ("length=400svh — Stage B") perdia o sentido do pin de 4 viewports — usuário rola muito sem payoff visual. Foi solicitado e aprovado um tweak iterativo no `/dev/sticky/page.tsx` e na seção StickyStage do `/dev/all/page.tsx` pra compor `<StickyStage>` + `<ScrollScene>` com payoff visual contínuo (4 facets cross-fade derivadas do progress).

      4 iterações foram aplicadas (refinement do timing, da composição, do nível de noise visual). A versão final foi aceita pelo Lenny como **demonstrativa do padrão técnico**, mas explicitamente NÃO como visual de showcase final — refinamento real fica pra Phase 3+ quando seções reais precisarem desse composto com copy de produto e design system aplicados.

      Sem mudança na API das primitivas (barrel intacto, contrato @frozen mantido). Mudança contida em /dev/* (gate D-15 já protege produção).
verification:
  api_freeze:
    description: 6 arquivos com header @frozen + 6 menções a `motion-api-change` (5 primitivas + barrel index.ts)
    evidence: |
      grep -c "@frozen" src/components/motion/*.tsx src/components/motion/index.ts → 6
      grep -c "motion-api-change" src/components/motion/*.tsx src/components/motion/index.ts → 6
  readme_completeness:
    description: README cobre todas as 5 primitivas (props, trade-offs, reduced motion, demo URL) + internals + property guarantee MOTION-08 + validated devices + cobertura pendente
    evidence: |
      Tabela "Validated Devices" preenchida com iPhone 15 iOS 26 Safari ✓ + Windows 11 Chrome ✓
      Tabela "Cobertura pendente" lista 4 surfaces (Android, macOS Safari, Firefox/Edge, reduced-motion) com triggers explícitos
  build_green:
    description: tsc + next build exit 0; bundle de /dev/sticky 3.68 kB / /dev/all 1.97 kB
    evidence: npx next build (após commits 4ed0db5 e 4193543) → 13 rotas estáticas geradas, sem erros
real_device_validation:
  validated_via: Vercel preview da branch phase-02-validation (URL https://likro-landing-page-git-phase-02-validation-likros-projects.vercel.app)
  devices_passed:
    - iPhone 15, iOS 26 (latest), Safari — todas as 6 sub-rotas + /dev/all (Stage A e B do /dev/sticky passaram, sem release prematuro, sem chacoalho com address bar do iOS)
    - Windows 11, Chrome desktop — /dev/all
  pending:
    - Android real (sem device disponível)
    - macOS Safari
    - Firefox / Edge desktop
    - prefers-reduced-motion validation real
  pending_trigger: validar antes de Phase 3 começar a usar `<StickyStage>` em seção real
checkpoint_history:
  - type: human-action (real-device validation)
    reached_at: pós-Task 2 (README committed bf07aac)
    paused_for: Lenny abrir Vercel preview no iPhone real + Android real + 3 desktop browsers, preencher tabela "Validated Devices"
    resolution: |
      iPhone 15 iOS 26 Safari validado (✓ Stage A, ✓ Stage B, ✓ /dev/reveal, ✓ /dev/textsplit, ✓ /dev/parallax, ✓ /dev/scene, ✓ /dev/all).
      Risco Crítico #3 (smooth-scroll + sticky iOS) **mitigado e validado**: pin segurou, address bar do Safari recolhendo/expandindo não chacoalhou conteúdo pinado (D-07 svh-only confirmado).
      Tweak adicional aceito durante checkpoint: showcase do composto StickyStage+ScrollScene em /dev/sticky.
      Polish visual final do showcase deferido pra Phase 3+.
notes:
  - "Política @frozen reforçada: qualquer mudança nas props das 5 primitivas exige PR com label `motion-api-change` + aprovação do Lenny. Replicada como comentário JSDoc em cada arquivo de primitiva + no barrel."
  - "Imports diretos de motion/react permanecem proibidos pra seções de produção; exceção controlada (dentro do render prop de ScrollScene OU dentro de páginas /dev/*) documentada no README."
  - "Phase 3+ deve refinar visualmente o /dev/sticky Stage B quando precisar de um composto similar em seção real — a abordagem técnica (overlap de janelas, atmosphere neutra, accent fino) está validada; só o visual de showcase ficou aceito como demonstrativo."
---

# Plan 06 — README Freeze & Real-Device Validation

Fecha a Phase 2 com:

1. **API congelada e documentada** — `src/components/motion/README.md` cobre as 5 primitivas (RevealOnView, ParallaxLayer, ScrollScene, TextSplit, StickyStage) com props, trade-offs, reduced-motion handling e exemplos. Política @frozen (D-16) declarada explicitamente + replicada em cada primitiva via JSDoc header.

2. **Validação real-device executada** — Vercel preview gerado da branch `phase-02-validation`, gate D-15 (`VERCEL_ENV === 'preview'`) liberou acesso ao `/dev`. iPhone 15 com iOS 26 Safari + Windows 11 Chrome desktop testados nas 6 sub-rotas. Risco Crítico #3 (smooth-scroll + sticky no iOS) **mitigado** — pin segurou, address bar não chacoalhou conteúdo.

3. **Cobertura pendente declarada honestamente** — Android, macOS Safari, Firefox/Edge e reduced-motion ficaram fora desta validação (sem devices / sem tempo). Marcados no README com trigger explícito ("validar antes de Phase 3 usar StickyStage em seção real" / "validar antes do lançamento público").

4. **Tweak iterativo aceito como deviation Rule 2** — durante a validação, Lenny pediu payoff visual contínuo no `/dev/sticky` Stage B em vez de label estático. 4 iterações de refinement aplicadas em `/dev/sticky/page.tsx` e `/dev/all/page.tsx`. Versão final aceita como **demonstrativa do padrão técnico** (StickyStage + ScrollScene compostos), mas explicitamente NÃO como visual de showcase final. Polish visual real fica pra Phase 3+.

## Commits desta plan

- `bf07aac` — `docs(02-06): add motion primitives README with frozen API contract`
- (Task 1 auditoria @frozen — sem diff, headers já estavam corretos desde Plans 01-04)
- `6b1cfad` — `feat(02-05): compose StickyStage with ScrollScene for continuous visual payoff` (tweak deviation Rule 2)
- `a2e4a37` — `refine(02-05): tighter sticky showcase — less noise, more density`
- `4ed0db5` — `refine(02-05): editorial facet composition — label as protagonist`
- `4193543` — `refine(02-05): give each facet visible solo time, drop flanking-line noise`
- (Final commit deste SUMMARY + README atualizado com Validated Devices preenchido — pending)

## Self-Check

- [x] Headers `@frozen` em 5 primitivas + barrel verificados (6/6)
- [x] README cobre as 5 primitivas com props + reduced motion + demo URL
- [x] Tabela "Validated Devices" preenchida com info factual (não inventada)
- [x] Cobertura pendente declarada com triggers explícitos
- [x] Build/typecheck verdes após cada iteração (4193543)
- [x] Política `motion-api-change` declarada no README + replicada nas primitivas
- [x] Risco Crítico #3 (smooth-scroll + sticky iOS) validado em iPhone real
- [x] Deviation Rule 2 (tweak do showcase) documentada com aceite explícito do Lenny e responsabilidade transferida pra Phase 3+
