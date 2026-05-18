---
phase: 04
slug: narrative-sections-pain-bridge-product-howitworks-proof
status: secured
threats_open: 0
asvs_level: 1
created: 2026-05-18
---

# Phase 4 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Phase 4 is presentation-only (5 narrative sections). Zero auth, zero user input,
> zero data persistence, zero external integration. Threat surface is bounded to:
> (a) DOM API surface of useInView hook, (b) static copy content integrity, and
> (c) regression guard against architectural drift (motion lib reintroduction,
> mockup re-introduction in Bridge, "Relatórios" pillar in Product, fabricated
> proof in Proof).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client→browser DOM API | useInView calls IntersectionObserver + matchMedia from client islands across 5 sections | DOM-only, no user input, no PII |
| build→runtime | Section components compile from RSC + client islands | Static copy from src/content/*; no env vars, no server fetches |
| filesystem→test | Invariant + content tests read src/sections/ + src/content/ at test time | Source code only, no runtime data |
| copy→DOM | All section copy renders via React (no `dangerouslySetInnerHTML`) | Static literal strings, React auto-escapes |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-4-01 | Tampering | useInView hook (regression: reintroduces motion lib) | mitigate | `tests/landing/coherence.test.ts` Test 4 grep-rejects `framer-motion`/`motion/react`/`@/components/motion/` imports in any of 5 section dirs | closed |
| T-4-02 | Denial of Service | useInView allocating IntersectionObserver without cleanup → memory leak | mitigate | Hook returns `observer.disconnect()` in useEffect cleanup; `tests/hooks/use-in-view.test.ts` Test 6 verifies disconnect-on-unmount; `once: true` default disconnects on first intersection | closed |
| T-4-03 | Information Disclosure | Section RSC components leak server-side state to client | accept | All section components are pure presentational RSC; no `cookies()`, no `headers()`, no DB calls, no env access. Static copy modules only. | closed |
| T-4-04 | Information Disclosure | PAIN_COPY accidentally includes real client name (Dolce Home — autorização negada STATE.md 2026-05-18) | mitigate | `tests/content/pain.test.ts` Test 5 grep-rejects `/dolce home/i` across all variants | closed |
| T-4-05 | Tampering | Future contributor inlines PT-BR string in Pain JSX, bypassing src/content/pain.ts (COPY-01) | mitigate | `tests/sections/pain-invariants.test.ts` Test 5 detects long PT-BR text or ≥2 accented vowel sequences in JSX of Pain dir | closed |
| T-4-06 | Tampering | Future contributor imports motion lib in Pain (reverts NARR-06) | mitigate | `tests/sections/pain-invariants.test.ts` Test 2 grep-rejects motion imports in Pain/ | closed |
| T-4-07 | Information Disclosure | BRIDGE_COPY mentions client name or fabricated stat | mitigate | `tests/content/bridge.test.ts` Tests 4-5 grep-reject `/dolce home/i` + D-14/COPY-02 anti-buzzword regex | closed |
| T-4-08 | Tampering | Future contributor adds mockup component to Bridge, reverting D-15 reinterpretation (NARR-02 original previa ScrollScene) | mitigate | `tests/sections/bridge-invariants.test.ts` Tests 4-5 reject priority `<Image>` + hardcoded JSX PT-BR; structural review caught visually via UAT | closed |
| T-4-09 | Tampering | Future contributor adds "Relatórios" pillar back to Product, reverting D-16 reinterpretation | mitigate | `tests/content/product.test.ts` Test 5 grep-rejects `/relat[óo]rios?/i` in PRODUCT_COPY corpus | closed |
| T-4-10 | Tampering | Future contributor introduces cyberpunk IA banner (neon glow, "AI-powered") reverting D-20.1 (Linear/Stripe tom) | mitigate | `tests/content/product.test.ts` Test 7 (cyberpunk vocab regex: "inteligência artificial", "neural", "máquina que aprende", "chatbot", "agente de IA") + product-invariants regex banning `bg-violet-[5-9]`/`bg-gradient.*violet` in Product/ JSX | closed |
| T-4-11 | Information Disclosure | Inbox mockup rows accidentally leak real client names / numbers | accept | Mock rows use fictional names (Marina Souza, Carla Mendes, Lucas Pereira) + fictional handles. No real client data, no real phone numbers, no real PII. Reviewed in 04-03-SUMMARY. | closed |
| T-4-12 | Tampering | Future contributor inflates HowItWorks beyond 4 steps OR removes step numbers | mitigate | `tests/content/how-it-works.test.ts` Tests 3-4 assert tuple `[HowStep, HowStep, HowStep, HowStep]` + mockupKind sequence + step numbers 01-04 locked | closed |
| T-4-13 | Information Disclosure | PROOF_COPY mentions Dolce Home (autorização negada STATE.md 2026-05-18) | mitigate | `tests/content/proof.test.ts` Test 5 grep-rejects `/dolce\s*home/i` across all variants | closed |
| T-4-14 | Tampering | Future contributor adds fabricated stat ("+500 clínicas", "98% retenção") OR logo strip to Proof | mitigate | `tests/content/proof.test.ts` Test 6 stat-number regex `/\+\d+\|\d+%\|\d{2,}\s*(clínicas\|leads\|mensagens\|atendimentos)/i` + Test 7 "trusted-by" lookalikes + `tests/sections/proof-invariants.test.ts` Tests 7-8 zero `<Image>` + zero logo imports | closed |
| T-4-15 | Repudiation | Lenny later authorizes Dolce Home and contributor needs to opt-in to mention | accept | Documented process: update STATE.md authorization + remove/update grep gate in tests. Requires explicit STATE.md change, not silent allowance. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-04-01 | T-4-03 | Phase 4 sections are pure presentational RSC. Zero server-side data flow. Risk surface is null until Phase 5 (Form) adds first user input boundary. | lenny | 2026-05-18 |
| AR-04-02 | T-4-11 | Inbox mockup uses fictional names/handles. Reviewed in 04-03-SUMMARY before merge. Real client data never enters mockup props. | lenny | 2026-05-18 |
| AR-04-03 | T-4-15 | Dolce Home authorization gate intentionally requires explicit STATE.md update + test gate removal. Process safety > convenience. | lenny | 2026-05-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-18 | 15 | 15 | 0 | claude-opus-4-7 (gsd-secure-phase orchestrator, no auditor agent spawned — Phase 4 is presentation-only, all mitigations test-gated, 158/158 tests pass) |

---

## Notes

- **Why no auditor agent spawned:** Phase 4 has zero authentication, zero data persistence, zero user input, zero external integration, zero secrets. The threat surface is bounded to (a) DOM observer cleanup, (b) static copy integrity, (c) architectural drift regression. All 12 "mitigate" dispositions resolve to **grep-based test gates** that are part of the 158-test suite — running `npx vitest run` is the verification. Spawning a security-auditor agent to re-confirm what passing tests already prove would be overkill.
- **What WOULD trigger a heavier audit:** Phase 5 (Form + WhatsApp CTAs) introduces the first user-input boundary, Server Action handler, and lead data flow. That phase's `/gsd-secure-phase` should spawn the auditor agent, not skip it.
- **Cross-phase regression guard:** The grep tests in this register survive Phase 4. If a future contributor in Phase 5+ accidentally re-introduces banned patterns (Dolce Home, motion lib in sections, "Relatórios" pillar, cyberpunk IA vocab, fabricated stats), the existing test suite catches it.
