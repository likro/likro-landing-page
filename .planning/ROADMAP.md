# Roadmap: Likro Landing Page (Clínicas e Estéticas)

**Created:** 2026-05-15
**Granularity:** standard (5-8 phases)
**Total v1 requirements:** 99 (reconfirmado pelo roadmapper — preâmbulo do REQUIREMENTS.md citava 84 como preliminar)
**Coverage:** 99/99 (100%)
**Core value:** Uma clínica entra na landing e sente em segundos: *"isso foi feito exatamente pra minha operação — e essa empresa é absurda"*.

## Phases

- [x] **Phase 1: Foundations & Design System** — Scaffold Next.js, brand book mecanicamente travado no Tailwind, helpers críticos (`buildWhatsAppUrl`, `track()`, `useDeviceTier`), providers, metadata, atoms UI. (completed 2026-05-16)
- [ ] **Phase 2: Motion Primitives** — Biblioteca isolada de primitivas de animação (`<ScrollScene>`, `<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>`) com API congelada e validada em `/dev` em iOS Safari + Android Chrome real.
- [ ] **Phase 3: Hero (benchmarked isolado)** — Hero deployado sozinho na Vercel com LCP < 2.5s mobile verificado, copy aprovada por Lenny, helper WhatsApp validado em devices reais.
- [ ] **Phase 4: Narrative Sections (Pain → Bridge → Product → HowItWorks → Proof)** — Cinco seções narrativas com copy aprovado seção a seção, primeira `<ScrollScene>` em produção (Bridge) como template do resto.
- [ ] **Phase 5: Conversion (Form + Footer + Floating + CTAs distribuídos)** — Form consultivo discreto + edge route + webhook, floating WhatsApp mobile, CTAs persistentes em 4+ pontos com `location` analytics, footer institucional.
- [ ] **Phase 6: Analytics Instrumentation Pass** — Verificação sistêmica de todos os eventos nos três dashboards (Pixel Test Events, GA4 DebugView, Clarity recordings), seção views, scroll-depth, PII masking validado em sessão real.
- [ ] **Phase 7: SEO + A11y + Performance + Deploy Hardening** — Lighthouse 90+/85+, JSON-LD validado, OG image testada no preview WhatsApp/LinkedIn, WCAG AA audit, mobile QA real-device, Vercel deploy + env vars + preview noindex.

## Phase Details

### Phase 1: Foundations & Design System
**Goal**: Estabelecer mecanicamente o brand book, os helpers críticos e os providers que tornam impossível violar restrições de marca, WhatsApp deeplink e tracking dispersão.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, FOUND-11, FOUND-12, CTA-01, CTA-02, TRACK-01, TRACK-02, TRACK-03
**Success Criteria** (what must be TRUE):
  1. Tailwind config impede mecanicamente criar `bg-accent-50/100/200` — só `accent.primary` (#7C3AED) existe no design system; tentar usar shade não-existente quebra build (risco crítico #4 mitigado).
  2. Helper `buildWhatsAppUrl(message, location)` em `lib/whatsapp.ts` é o único ponto da codebase que constrói URL WhatsApp; tentar passar `web.whatsapp.com` lança erro em dev (unit test passa) (risco crítico #5 mitigado).
  3. Módulo `lib/analytics.ts` expõe `track(event, payload)` com `event_id` UUID v4 em cada chamada; Pixel/GA4/Clarity carregam via `<Script strategy="afterInteractive">` no `AnalyticsProvider` (risco crítico #6 mitigado).
  4. Rota `/dev` carrega em dev (e só em dev) com placeholder para showcase de primitivas e seções; em produção retorna 404.
  5. Provider tree em `app/layout.tsx` mantém ordem correta (`AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children`); Lenis skip init quando `prefers-reduced-motion` ativo (validável no DevTools).
**Plans**: TBD

### Phase 2: Motion Primitives
**Goal**: Congelar a API das 5 primitivas de motion (especialmente `<ScrollScene>` como boundary GSAP-future-ready) antes de qualquer seção narrativa começar — eliminando ripple-refactor.
**Depends on**: Phase 1
**Requirements**: MOTION-01, MOTION-02, MOTION-03, MOTION-04, MOTION-05, MOTION-06, MOTION-07, MOTION-08
**Success Criteria** (what must be TRUE):
  1. As 5 primitivas (`<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>`, `<ScrollScene>`) funcionam em `/dev` com retângulos placeholder; cada primitiva tem demo isolada navegável.
  2. `<StickyStage>` validado em iOS Safari real (não emulador), Android Chrome real e desktop Safari/Chrome/Firefox sem release prematuro ou jump horizontal (risco crítico #3 mitigado).
  3. `<ScrollScene>` expõe `MotionValue<number>` 0→1; consumidores nunca importam Motion direto; API documentada em `components/motion/README.md` e congelada (mudanças exigem aprovação explícita).
  4. Toggle `prefers-reduced-motion` no OS faz todas as primitivas pularem para estado final imediatamente (verificado manualmente em macOS Reduce Motion e Windows Animations off).
  5. Audit DevTools confirma: zero animações usam `width`/`height`/`top`/`left`; só `transform` e `opacity`.
**Plans:** 6 plans (4 waves)
Plans:
- [x] 02-01-foundation-PLAN.md — Scaffold src/components/motion/, barrel @frozen, easing canônico, gate /dev → VERCEL_ENV (D-15)
- [x] 02-02-reveal-parallax-PLAN.md — Implementar <RevealOnView> (D-10) e <ParallaxLayer> (D-11) + exportar no barrel
- [x] 02-03-scrollscene-textsplit-PLAN.md — Implementar <ScrollScene> (D-01..D-04) e <TextSplit> (D-12) + helper useLineGrouping
- [x] 02-04-stickystage-PLAN.md — Implementar <StickyStage> (D-05..D-09, RISCO CRÍTICO #3) via position:sticky + svh; barrel completo
- [x] 02-05-showcase-dev-routes-PLAN.md — Showcase /dev/{reveal,parallax,sticky,textsplit,scene,all} + nav + helpers compartilhados
- [x] 02-06-readme-freeze-PLAN.md — README.md final (D-17), audit @frozen em 5 primitivas, checkpoint real-device com Lenny

### Phase 3: Hero (benchmarked isolado)
**Goal**: Hero deployado sozinho na Vercel passando LCP < 2.5s em Lighthouse mobile, com copy aprovada por Lenny e WhatsApp deep link funcionando em iOS e Android reais — antes de adicionar qualquer seção abaixo.
**Depends on**: Phase 2
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, HERO-06, HERO-07, COPY-01, COPY-04, CTA-04
**Success Criteria** (what must be TRUE):
  1. Hero deployado isoladamente na Vercel passa Lighthouse mobile com LCP < 2.5s; headline e mockup principal (LCP elements) renderizam no estado final imediatamente, zero animação de entrada neles (risco crítico #2 mitigado).
  2. Hero usa exatamente um `<Image>` com `priority` (o mockup principal); altura via `dvh`/`svh` (não `vh`) — sem jump na address bar do iOS.
  3. Hero passa no "5-second test": três pessoas sem contexto descrevem em 5 segundos olhando apenas a primeira viewport que é Likro, que é para clínicas, e que o CTA é WhatsApp.
  4. CTA WhatsApp do hero abre o app WhatsApp (não browser) em iPhone real e Android real; mensagem pré-preenchida correta com `location='hero'`.
  5. Copy do hero (em `content/hero.ts`, zero strings hard-coded em JSX) aprovada por Lenny via PR; cadência de copy review estabelecida e documentada para as seções seguintes.
**Plans:** 3 plans (3 waves)
Plans:
- [x] 03-01-PLAN.md — env vars + WhatsAppLocation extension + Wave 0 grep tests + mockup asset
- [ ] 03-02-PLAN.md — Hero + Header components + content/hero.ts (3 variantes) + page.tsx wiring
- [ ] 03-03-PLAN.md — copy-review docs + PR template + Vercel benchmark + real-device + 5-second test
**UI hint**: yes

### Phase 4: Narrative Sections (Pain → Bridge → Product → HowItWorks → Proof)
**Goal**: Entregar as cinco seções narrativas centrais (Dor → Solução/Bridge → Produto → Como Funciona → Prova) com copy aprovado seção-a-seção por Lenny, usando exclusivamente as primitivas de motion da Phase 2.
**Depends on**: Phase 3
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05, NARR-06, NARR-07, NARR-08, COPY-02, COPY-03, COPY-05, COPY-06
**Success Criteria** (what must be TRUE):
  1. As 5 seções (Pain, Bridge, Product, HowItWorks, Proof) renderizam em produção; cada uma usa apenas primitivas de `components/motion/` — zero `motion.div` direto em arquivos de seção (audit grep passa com zero matches).
  2. Bridge é a primeira `<ScrollScene>` em produção (mockup dashboard surge com blur/desfoque e expande); seu padrão é reutilizado pela seção Product (sticky stack revelando os 4 pilares Atendimentos/CRM/Agentes IA/Relatórios com prints reais).
  3. Toda copy das 5 seções passa no teste anti-IA: zero matches grep para frases banidas ("desbloqueie", "potencialize", "transforme sua X", "jornada do cliente", "próximo nível", "solução inovadora", "feito para você", "do início ao fim", "fricção" abstrato); cada frase aprovada por Lenny via PR seção-a-seção (risco crítico #1 mitigado).
  4. Cada seção tem versão mobile com motion choreography simplificada via `useDeviceTier()`; sem duplicar componentes exceto onde o DOM realmente diverge.
  5. Seção Proof comunica credibilidade pelo refinamento visual + menção à operação real (Dolce Home com autorização explícita do Lenny — pendência resolvida antes da seção entrar em dev); zero números fabricados, zero depoimentos placeholder, zero claims sem fonte.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Conversion (Form + Footer + Floating + CTAs distribuídos)
**Goal**: Fechar o funil de conversão — form consultivo discreto com webhook funcional, floating WhatsApp mobile na thumb zone, CTAs persistentes em 4+ pontos, footer institucional enxuto.
**Depends on**: Phase 4
**Requirements**: CTA-03, CTA-05, CTA-06, CTA-07, CTA-08, CTA-09, CTA-10, CTA-11, CTA-12, MOBILE-02, MOBILE-06
**Success Criteria** (what must be TRUE):
  1. CTAs WhatsApp persistentes em pelo menos 4 pontos da página (hero, fim da Pain, fim da Product, footer/fim); cada um com `location` prop, disparando evento de analytics e UTM por seção.
  2. Floating WhatsApp aparece em mobile após scroll > 50vh, posicionado na thumb zone do polegar e respeitando `env(safe-area-inset-bottom)` (notch/home indicator); some/aparece sem cobrir o form quando ele está em viewport.
  3. Form consultivo (3 campos: nome, WhatsApp, mensagem opcional + honeypot) submete em mobile real; edge route `/api/lead` valida com Zod, entrega ao webhook (target definido antes da Phase 5); sucesso inline sem redirect; double-submit prevenido (botão desabilitado + dedup server-side por número em janela de 60s).
  4. Header "hide-on-scroll-down, show-on-scroll-up" liberando viewport mobile mas sempre disponível em scroll up; não compete visualmente com o hero CTA na primeira viewport.
  5. WhatsApp deep link de TODOS os CTAs testado em iOS Safari real e Android Chrome real — todos abrem o app WhatsApp, não o browser; mensagem pré-preenchida específica por `location` aprovada pelo Lenny no PR.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Analytics Instrumentation Pass
**Goal**: Garantir que todos os eventos disparam corretamente nos três dashboards reais (Pixel/GA4/Clarity), com `event_id` para deduplicação futura via CAPI e PII masking validado em sessão real do Clarity — não apenas por leitura de docs.
**Depends on**: Phase 5
**Requirements**: TRACK-04, TRACK-05, TRACK-06, TRACK-07
**Success Criteria** (what must be TRUE):
  1. Eventos mínimos disparando e visíveis nos dashboards: `cta_click` (com `location`), `whatsapp_click` (com `location`), `form_submit_attempt`/`success`/`error`, `section_view` por seção narrativa, `scroll_depth_25/50/75/100` — verificados em Pixel Test Events + GA4 DebugView + Clarity recordings.
  2. Sessão real do Clarity revisada manualmente: form wrapper tem `data-clarity-mask="true"`; ao reproduzir a gravação, nenhum número de WhatsApp, email ou nome aparece visível (risco crítico #6 — PII — mitigado).
  3. Configuração GA4 para SPA correta (via `@next/third-parties/google` ou Script com `send_page_view: false` + envio manual no `usePathname` change); zero double-fire em network tab para o mesmo clique.
  4. Cada evento carrega `event_id` UUID v4 confirmado em payload Pixel Test Events — retrofit futuro para Meta CAPI será zero-cost (sem reescrever instrumentação).
**Plans**: TBD

### Phase 7: SEO + A11y + Performance + Deploy Hardening
**Goal**: Atingir os números de produção (Lighthouse 90+/85+, LCP/CLS/INP dentro de targets, WCAG AA limpo, JSON-LD validado, OG impecável) e deployar em URL `.vercel.app` com variáveis de ambiente configuradas e preview noindex.
**Depends on**: Phase 6
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10, SEO-11, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, A11Y-07, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08, PERF-09, MOBILE-01, MOBILE-03, MOBILE-04, MOBILE-05, MOBILE-07, DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05
**Success Criteria** (what must be TRUE):
  1. Lighthouse Performance ≥ 90 desktop e ≥ 85 mobile em Vercel preview limpa; LCP < 2.5s mobile / < 2.0s desktop; CLS < 0.1; INP < 200ms; peso total página ≤ 1.5MB mobile; bundle JS ≤ 150KB gzipped first-load.
  2. JSON-LD Organization + WebPage tipado via `schema-dts` valida sem erros em Google Rich Results Test; OG image 1200×630 testada em validador Meta + preview real em WhatsApp e LinkedIn (canais de aquisição) e renderiza polished.
  3. WCAG AA audit limpo: todos os pares texto/fundo passam contraste (4.5:1 texto normal, 3:1 texto grande), navegação completa por teclado com foco visível, `prefers-reduced-motion` simplifica todas as animações (validado em macOS Reduce Motion + Windows Animations off), `<h1>` único + hierarquia `<h2>`/`<h3>` correta, skip-link "Pular para conteúdo principal" funcional.
  4. Site validado em iPhone iOS Safari real, Android mid-tier Chrome real, iPad Safari — tap targets ≥ 44x44px, hover effects têm fallback `:active` no touch, animações suspendem/simplificam em conexões 4g/slow via `navigator.connection.effectiveType`.
  5. Deploy ao vivo em URL `.vercel.app`; variáveis de ambiente configuradas (`NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`, `LEAD_WEBHOOK_URL`); previews `.vercel.app` retornam `X-Robots-Tag: noindex` (produção permite indexação); Vercel Speed Insights habilitado para monitoramento contínuo de CWV.
**Plans**: TBD
**UI hint**: yes

## Phase Ordering Rationale

- **Foundations antes de qualquer animação:** a disciplina de design (brand book restrição mecânica de roxo, font weights, helpers de WhatsApp e analytics) precisa virar configuração de código antes que exista código de seção. Senão drift acumula e pitfalls #1, #4, #5, #6 todos disparam.
- **Motion primitives antes de Hero:** congelar API do `<ScrollScene>` cedo evita refactor das seções depois. ARCHITECTURE.md é enfático: ripple changes destroem timeline.
- **Hero isolado antes do resto:** LCP é o número que mata otimização Meta Ads. Validar com Hero deployado sozinho antes de adicionar peso embaixo.
- **Bridge antes de Product na Phase 4:** Bridge é mais simples mas usa o mesmo padrão sticky+scrub que Product — perfeito pra debug e fixar template antes de replicar.
- **Conversion como fase separada:** form + webhook + helper WhatsApp finalizado + UTM params formam um sistema próprio com sua própria DOD.
- **Analytics pass depois de conteúdo final:** instrumentar antes de copy estar travado gera retrabalho; verificação real nos dashboards exige eventos reais sendo disparados por usuários reais (você + Lenny testando).
- **Hardening como última fase:** SEO/A11y/Perf são audits que rodam contra o produto final — fazer antes seria medir um produto incompleto.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations & Design System | 4/4 | Complete | 2026-05-16 |
| 2. Motion Primitives | 0/6 | Planned | - |
| 3. Hero (benchmarked isolado) | 0/3 | Planned | - |
| 4. Narrative Sections | 0/0 | Not started | - |
| 5. Conversion | 0/0 | Not started | - |
| 6. Analytics Instrumentation Pass | 0/0 | Not started | - |
| 7. SEO + A11y + Performance + Deploy Hardening | 0/0 | Not started | - |

## Coverage Verification

**v1 requirements total:** 99 (12 FOUND + 8 MOTION + 7 HERO + 8 NARR + 6 COPY + 12 CTA + 7 TRACK + 9 PERF + 11 SEO + 7 A11Y + 7 MOBILE + 5 DEPLOY)
**Mapped:** 99/99 ✓
**Orphaned:** 0
**Duplicates:** 0

**Per-phase requirement counts:**
- Phase 1: 17 (FOUND 1-12 + CTA-01,02 + TRACK-01,02,03)
- Phase 2: 8 (MOTION 1-8)
- Phase 3: 10 (HERO 1-7 + COPY-01, COPY-04 + CTA-04)
- Phase 4: 12 (NARR 1-8 + COPY-02,03,05,06)
- Phase 5: 11 (CTA-03,05,06,07,08,09,10,11,12 + MOBILE-02,06)
- Phase 6: 4 (TRACK-04,05,06,07)
- Phase 7: 37 (SEO 1-11 + A11Y 1-7 + PERF 1-9 + MOBILE 1,3,4,5,7 + DEPLOY 1-5)

**Total:** 17+8+10+12+11+4+37 = 99 ✓

Phase 7 is intentionally larger — it's a multi-stream hardening pass (audits + deploy ops), not parallel feature work. Splitting would fragment cohesive activities (SEO+A11y+Perf+Deploy all run against the finished landing). Standard granularity allows 5-8 phases; 7 fits the natural delivery boundaries best.

## Notes on Cross-Cutting Categories

**COPY** is split across phases by section:
- COPY-01 (storage convention) + COPY-04 (Lenny review cadence) → Phase 3 (Hero is the first section to enforce both)
- COPY-02 (anti-IA filter), COPY-03 (vertical specificity), COPY-05 (glossary), COPY-06 (no fabricated claims) → Phase 4 (applied to all 5 narrative sections section-by-section)

**TRACK** is split between infra and validation:
- TRACK-01, 02, 03 (shell, event_id, script loading) → Phase 1 (infra established before any tracking call exists)
- TRACK-04, 05, 06, 07 (event coverage, PII masking, SPA config, vendor validation) → Phase 6 (validated end-to-end after content + conversion are live)

**MOBILE** is split between conversion-specific and audit:
- MOBILE-02 (safe area), MOBILE-06 (header hide-on-scroll) → Phase 5 (built as part of conversion UI)
- MOBILE-01 (deviceTier), MOBILE-03 (tap targets), MOBILE-04 (Lenis touch), MOBILE-05 (hover fallback), MOBILE-07 (device matrix QA) → Phase 7 (cross-cutting audit on finished site)

**CTA** is split between helper infra and consumption:
- CTA-01, 02 (helper, web.whatsapp.com guard) → Phase 1 (helper exists before first CTA)
- CTA-04 (env var) + CTA-07 (real-device test) embedded in Phase 3 (Hero is first consumer)
- CTA-03, 05, 06, 08, 09, 10, 11, 12 (component, distribution, form, edge route) → Phase 5

---
*Roadmap created: 2026-05-15*
