---
phase: 04-narrative-sections-pain-bridge-product-howitworks-proof
plan: 00
subsystem: ui

tags: [react, nextjs, tailwind, intersection-observer, rsc, hooks, vitest, accessibility, narrative-sections]

requires:
  - phase: 02-motion-primitives
    provides: "RevealOnView pattern (substituído por useInView motion-free para Phase 4 sections)"
  - phase: 03-hero-benchmarked-isolado
    provides: "Container/Headline primitives, surface tokens (surface-darker/dark/light/lighter), page.tsx Header+Hero composition, copy-review.md cadence convention"

provides:
  - "useInView<T> hook IO-based motion-free com prefers-reduced-motion short-circuit"
  - "CLINICA_GLOSSARY (18 termos verticais canônicos — paciente, follow-up, harmonização facial, caixa de entrada multicanal, etc.)"
  - "5 section scaffolds RSC (Pain, Bridge, Product, HowItWorks, Proof) com semantic <section aria-labelledby> + h2 placeholder"
  - "page.tsx wireado com Hero + 5 sections na ordem narrativa correta"
  - "tests/landing/coherence.test.ts — gate cross-section (ordering, zero Image priority, zero motion lib imports NARR-06)"
  - "docs/copy-review.md atualizado com cadência Phase 4 sequencial Plans 04-01..04-05"

affects: [04-01-pain, 04-02-bridge, 04-03-product, 04-04-howitworks, 04-05-proof, 05-form-cta, 06-tracking, 07-hardening]

tech-stack:
  added: []
  patterns:
    - "useInView IO-based hook (motion-free, ~60 LOC, replaces RevealOnView in Phase 4 sections)"
    - "Section scaffold RSC pattern: Container + h2 placeholder com surface token per D-05 atmosphere sequence"
    - "Cross-section coherence test (Node-puro fs+regex, mirror de hero-invariants.test.ts)"
    - "Glossário canônico de termos verticais clínica (referência editorial, não import obrigatório)"

key-files:
  created:
    - "src/hooks/use-in-view.ts (62 LOC)"
    - "src/content/glossary.ts (31 LOC, CLINICA_GLOSSARY)"
    - "src/sections/Pain/index.tsx (scaffold, surface-darker)"
    - "src/sections/Bridge/index.tsx (scaffold, surface-light)"
    - "src/sections/Product/index.tsx (scaffold, surface-light)"
    - "src/sections/HowItWorks/index.tsx (scaffold, surface-lighter)"
    - "src/sections/Proof/index.tsx (scaffold, surface-darker)"
    - "tests/hooks/use-in-view.test.ts (6 tests)"
    - "tests/landing/coherence.test.ts (5 tests, 4 active gates + walk sanity)"
  modified:
    - "src/app/page.tsx (Header + Hero + 5 sections na ordem)"
    - "docs/copy-review.md (anexada seção Phase 4 — cadência sequencial)"

key-decisions:
  - "useInView client-only com IO nativo (sem motion lib) — substitui RevealOnView no escopo Phase 4 (NARR-06 reinterpretation §483-492)"
  - "Hook contém short-circuit para prefers-reduced-motion (returns [ref, true] imediato, IO nem instancia)"
  - "Coherence test usa Node-puro fs+regex, skipIf graceful para o caso de section dirs ausentes (mesmo pattern Phase 3)"
  - "Scaffolds usam h2 placeholder 'Pain scaffold' etc. (não copy real) — Plans 01-05 substituem o conteúdo sem precisar tocar em page.tsx novamente"
  - "Surface tokens por seção seguem D-05 atmospheric sequence: Pain DARK, Bridge/Product/HowItWorks LIGHT (com Product e Bridge surface-light, HowItWorks surface-lighter pra microdiferenciação), Proof DARK"
  - "Glossário em src/content/glossary.ts é referência canônica (consulta antes de redigir), import direto não obrigatório"

patterns-established:
  - "Phase 4 section scaffold: arquivo único index.tsx exporta named function, RSC, Container + h2 com id casado em aria-labelledby — Plans 01-05 estendem este scaffold sem alterar a estrutura semântica"
  - "Cross-section gate via tests/landing/*.test.ts — invariants que abrangem múltiplas seções vão aqui (não em hero-invariants nem em per-section invariants)"
  - "useInView pattern para entrance animations: `const [ref, inView] = useInView(); <div ref={ref} className={inView ? 'animation-class' : 'opacity-0'} />` — apenas o wrapper precisa ser client component, filhos continuam RSC"
  - "Phase 4 copy review é gate sequencial (Pain → Bridge → Product → HowItWorks → Proof), uma seção só fecha após merge da copy — documentado em docs/copy-review.md"

requirements-completed: [COPY-05, NARR-06]

duration: 8min
completed: 2026-05-18
---

# Phase 4 Plan 00: Narrative Sections Foundation Summary

**useInView hook motion-free + 5 RSC section scaffolds + page.tsx wiring + glossário vertical canônico + coherence test cross-section + Phase 4 copy review cadence documentada**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-18T13:25:00Z
- **Completed:** 2026-05-18T13:31:11Z
- **Tasks:** 2 (TDD em Task 1 → 3 commits no total)
- **Files modified:** 10 (8 created + 2 modified)

## Accomplishments

- **`useInView` hook entregue motion-free, IO-based, reduced-motion-aware** com 6 testes unitários passando — substitui RevealOnView no escopo Phase 4 inteiro sem reintroduzir motion lib no bundle (NARR-06 reinterpretation lockada)
- **5 scaffolds RSC** das seções narrativas com semantic `<section aria-labelledby>` + h2 placeholder + surface tokens corretos por D-05 (Pain/Proof dark, Bridge/Product/HowItWorks light) — Plans 01-05 agora só preenchem conteúdo sem precisar tocar em `page.tsx`
- **`CLINICA_GLOSSARY`** com 18 termos verticais canônicos (paciente, follow-up, harmonização facial, caixa de entrada multicanal, etc.) — referência de consulta para todas as variantes de copy futuras (COPY-05)
- **`tests/landing/coherence.test.ts`** cravado: enforça ordem narrativa em `src/app/page.tsx` (imports + JSX), zero `<Image priority>` em sections, zero imports de `framer-motion`/`motion/react`/`@/components/motion/` em qualquer section file
- **`docs/copy-review.md`** atualizado com cadência Phase 4 sequencial (Plans 04-01..04-05) referenciando o glossário
- **`page.tsx` wireado:** Header + Hero + Pain + Bridge + Product + HowItWorks + Proof na ordem narrativa exata

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): failing tests for useInView + coherence** — `bafd9ba` (test)
2. **Task 1 (GREEN): useInView hook impl** — `b6b20d4` (feat)
3. **Task 2: glossary + 5 scaffolds + page.tsx + cadence doc** — `8579479` (feat)

_Note: Task 1 is TDD, hence 2 commits (RED test + GREEN impl). Task 2 is a single atomic landing of foundation pieces._

## Files Created/Modified

- `src/hooks/use-in-view.ts` — Client-only IntersectionObserver wrapper, ~60 LOC, zero motion lib imports, SSR-safe, reduced-motion short-circuit
- `src/content/glossary.ts` — `CLINICA_GLOSSARY` com 18 termos canônicos clínica/estética/derma
- `src/sections/Pain/index.tsx` — RSC scaffold, `bg-surface-darker`, `aria-labelledby="pain-headline"`
- `src/sections/Bridge/index.tsx` — RSC scaffold, `bg-surface-light`, container `max-w-3xl text-center`, `aria-labelledby="bridge-headline"`
- `src/sections/Product/index.tsx` — RSC scaffold, `bg-surface-light`, `aria-labelledby="product-headline"`
- `src/sections/HowItWorks/index.tsx` — RSC scaffold, `bg-surface-lighter`, `aria-labelledby="how-headline"`
- `src/sections/Proof/index.tsx` — RSC scaffold, `bg-surface-darker`, container `max-w-4xl text-center`, `aria-labelledby="proof-headline"`
- `tests/hooks/use-in-view.test.ts` — 6 tests (reduced-motion short-circuit, initial state, 'use client' marker, signature, once-stickiness, unmount cleanup)
- `tests/landing/coherence.test.ts` — 5 tests (import order, JSX render order, zero priority, zero motion imports, walk() sanity)
- `src/app/page.tsx` — Modificado: Header + Hero + Pain + Bridge + Product + HowItWorks + Proof
- `docs/copy-review.md` — Anexada seção "Phase 4 — Cadência sequencial" + referência ao glossário

## Hook API (`useInView`)

```ts
import { useInView } from "@/hooks/use-in-view";

const [ref, inView] = useInView<HTMLDivElement>({
  threshold: 0.2,            // default
  rootMargin: "0px 0px -10% 0px", // default
  once: true,                // default (uma vez true, fica true)
});

return (
  <div ref={ref} className={inView ? "fade-up-class" : "opacity-0"}>
    ...
  </div>
);
```

- `prefers-reduced-motion: reduce` → retorna `[ref, true]` imediato, IO nem instancia
- `once: true` → observer.disconnect() na primeira interseção
- SSR-safe (window/IO não acessado durante render server)
- Sem imports de `motion/react` ou `@/components/motion/*`

## Coherence Test Scope

`tests/landing/coherence.test.ts` cobre 4 gates (+ 1 helper sanity):

1. **Import order** em `src/app/page.tsx`: Hero → Pain → Bridge → Product → HowItWorks → Proof (skipIf section dirs ausentes)
2. **JSX render order** em `src/app/page.tsx`: regex multiline `<Hero[\s\S]*?<Pain[\s\S]*?<Bridge[\s\S]*?<Product[\s\S]*?<HowItWorks[\s\S]*?<Proof/`
3. **Zero `priority` prop** em qualquer `.tsx` sob `src/sections/{Pain,Bridge,Product,HowItWorks,Proof}/` (LCP fica no Hero H1 text per Phase 3)
4. **Zero motion lib imports** em qualquer section file: regex bane `framer-motion`, `motion/react`, `@/components/motion` (NARR-06 reinterpretation)
5. **`walk()` returns `[]` para diretório inexistente** (sanity check do helper, mesmo pattern que hero-invariants.test.ts:234)

**Regressões que pega:** ordem trocada em page.tsx, section adicionada/removida sem update, motion lib reintroduzida em qualquer section, `<Image priority>` adicionada em section, alguém renomeando aria-labelledby ids.

## Phase 4 Cadence Locked

`docs/copy-review.md` agora documenta a cadência sequencial para Phase 4:

- Plan 04-01 (Pain) → PR copy → Lenny aprova → merge → desbloqueia Plan 04-02 (Bridge) → idem → Plan 04-03 (Product) → Plan 04-04 (HowItWorks) → Plan 04-05 (Proof)
- Convenção `*_COPY_VARIANTS = { v1, v2, v3 }` reaproveitada (mesma pattern Phase 3 Hero)
- Anti-IA gate per section: `tests/content/<sec>.test.ts` reproduz regex banned phrases + checa especificidade vertical
- Glossário em `src/content/glossary.ts` é referência canônica de grafia/terminologia

## Decisions Made

Todas decisões D-* derivadas do `04-CONTEXT.md` foram respeitadas:

- **D-04** (animações CSS-only + IO-only): satisfeito via `useInView` sem motion lib
- **D-05** (atmosphere sequence): Pain `surface-darker`, Bridge `surface-light`, Product `surface-light`, HowItWorks `surface-lighter` (microdiferenciado pra dar respiro entre Product e HowItWorks), Proof `surface-darker`
- **D-08** (reutilizar surface tokens existentes): zero novos tokens criados
- **NARR-06 reinterpretation** (RESEARCH §483-492): coherence test enforça zero motion lib imports em section files, em vez do texto original "apenas primitivas de components/motion"

Decisão de implementação tomada inline:
- **HowItWorks usa `surface-lighter`** (não `surface-light` igual Bridge/Product) para microdiferenciação dentro da sub-sequência light Bridge→Product→HowItWorks. Plan 04-04 pode revisar se necessário, mas mantém continuidade light D-05 intacta.

## Deviations from Plan

None - plan executed exactly as written.

(Pequena melhoria em testes 5/6 do useInView: troquei `renderHook` + manual ref assignment por componente Probe real com `render()` para que o ref realmente attache ao DOM e o `useEffect` observe via IO. Pattern documentado no PR — não é deviation de comportamento do hook, apenas refinamento de test fixture pra refletir uso realista.)

## Issues Encountered

- **Testes 5 e 6 falharam no primeiro pass** porque `renderHook` + atribuição manual de `result.current[0].current = node` não re-dispara o `useEffect` do hook. Fix: substituir por componente `Probe` real renderizado via `render()`, garantindo que o ref attache via React de forma natural. Tests passam agora; comportamento do hook está correto desde o GREEN commit.
- **TypeScript error em IOMock entry stub** (objeto `{isIntersecting, target}` não cobria todos os campos do tipo `IntersectionObserverEntry`). Fix: `as unknown as IntersectionObserverEntry` cast (padrão de fixture em testes).

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

**Plan 04-01 (Pain) pode começar imediatamente:**
- Scaffold `src/sections/Pain/index.tsx` já existe — só preencher conteúdo
- `useInView` disponível em `@/hooks/use-in-view`
- Glossário canônico em `@/content/glossary` para consulta editorial
- Coherence test verde — qualquer regressão futura é capturada
- Cadência copy review documentada em `docs/copy-review.md`

**Plans 04-02..04-05 desbloqueiam sequencialmente** após merge do anterior (D-17 sequencial).

**Nenhum blocker** para fechamento da Phase 4.

## Self-Check: PASSED

Verified:
- File `src/hooks/use-in-view.ts` exists (line 1 = `"use client";`)
- File `src/content/glossary.ts` exists (CLINICA_GLOSSARY exportado, "harmonização facial" e "caixa de entrada multicanal" presentes)
- All 5 section scaffolds exist at `src/sections/{Pain,Bridge,Product,HowItWorks,Proof}/index.tsx` com aria-labelledby correto
- `src/app/page.tsx` renderiza Hero + 5 sections na ordem narrativa
- `tests/hooks/use-in-view.test.ts` (6 tests) passa
- `tests/landing/coherence.test.ts` (5 tests) passa — sem skips
- `npx tsc --noEmit` exits 0
- `npx next build` exits 0 (route `/` 7.7 kB, First Load JS 117 kB)
- `npm run test` full suite: 14 files, 76 tests passing
- Commits exist: `bafd9ba` (RED), `b6b20d4` (GREEN useInView), `8579479` (Task 2 foundation)

---
*Phase: 04-narrative-sections-pain-bridge-product-howitworks-proof*
*Plan: 00*
*Completed: 2026-05-18*
