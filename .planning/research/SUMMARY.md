# Project Research Summary

**Project:** Likro Landing Page (Clínicas e Estéticas)
**Domain:** Premium scroll-cinematic B2B SaaS landing page, single-page, Brazilian market
**Researched:** 2026-05-15
**Confidence:** HIGH

## Executive Summary

A Likro landing page é uma página única de conversão cinematográfica posicionada no segmento premium B2B SaaS para clínicas e estéticas brasileiras. O benchmark da categoria (Linear, Vercel, Stripe, Apple product pages) define um vocabulário claro: hero em dark com headline gigante, sticky pin-and-scrub em seções de produto, prints reais do app como prova implícita, zero fabricação de social proof, e CTA primário de atrito mínimo (Click-to-WhatsApp). O stack — Next.js 15.5 App Router + Tailwind v4 + Motion v12 (Framer Motion renomeado) + Lenis 1.3.x — é consenso de mercado, maduro em produção e alinhado com as constraints do PROJECT.md.

O maior risco não é técnico — é o copy. LLMs em PT-BR produzem texto fluente mas genérico, cheio de calcos do inglês e abstrações que destroem o posicionamento premium em segundos. O segundo maior risco é performance: ~50 prints reais + animações scroll-driven + 80% tráfego mobile cria múltiplos vetores de regressão em LCP. O terceiro é a orquestração Lenis + sticky: configuração errada do Lenis (modo transform em vez de scroll nativo) quebra `position: sticky` silenciosamente em mobile, afetando as seções cinematográficas centrais do produto.

A arquitetura por seções isoladas, primitivas de motion centralizadas, copy estática em `content/*.ts`, e o `<ScrollScene>` como boundary GSAP-future-ready resolve esses riscos estruturalmente. A ordem de build mais segura é: fundações/tokens → primitivas de motion → Hero benchmarked sozinho → seções narrativas → form/conversion → analytics → SEO/a11y/perf.

## Key Findings

### Recommended Stack

Stack travado em versões 2026, alinhado com o que o usuário pediu no PROJECT.md. Adições críticas: form via React Hook Form + Zod + Server Action; analytics consolidado num único `track()` que faz fan-out para Pixel/GA4/Clarity; image manifest tipado pra prevenir o killer #1 de LCP mobile.

**Core technologies (versions pinned):**
- `next@^15.5` — App Router, SSR/SSG, metadata API, edge runtime (NÃO 16 — ainda RC; ganhos marginais não justificam early adopter risk)
- `react@^19.0` — empacotado com Next 15.5
- `typescript@^5.6` — tipagem de schemas, events, image manifest
- `tailwindcss@^4.1` — CSS-first via `@theme` em `globals.css`; tokens do brand book vivem aqui
- `motion@^12.x` — import `from "motion/react"` (NÃO `framer-motion`; package foi renomeado)
- `lenis@^1.3.23` — pacote oficial darkroomengineering; NÃO `@studio-freight/lenis` (deprecated)
- `react-hook-form@^7.x` + `zod@^3.23+` + `@hookform/resolvers@^3.x` — form pequeno, validação compartilhada client/server
- `lucide-react@^0.460+` — ícones RSC-safe (NÃO `react-icons`)
- `clsx@^2.x` + `tailwind-merge@^2.x` — helper `cn()`
- `schema-dts@^1.1+` — JSON-LD tipado

**Explicitamente fora da v1:** `gsap`, `@gsap/react`, qualquer CMS, A/B testing framework.

**Nota crítica:** o racional "GSAP cobra licença comercial" no PROJECT.md Key Decisions está desatualizado — GSAP foi tornado 100% free pela Webflow em abril/2024. A deferral pra v1.5+ continua correta, mas o motivo real é **complexidade/curva de aprendizado e custo de manutenção** (mais uma lib pra atualizar, mais um modelo mental de timeline imperativa, sobreposição com Motion). Atualizar no PROJECT.md Key Decisions.

### Expected Features

Categorização vinda do FEATURES.md — alinhada com o nicho clínicas/estéticas e a estratégia Click-to-WhatsApp.

**Must have (table stakes — ausência mata o posicionamento premium):**
- Header minimalista sticky com hide-on-scroll-down — users expect navigation discoverability
- Hero com CTA acima da dobra (mobile + desktop) — primary conversion gate
- Mockups reais do produto em uso (não ilustrações genéricas) — credibilidade implícita
- CTAs WhatsApp persistentes em múltiplos pontos com UTM params — múltiplos momentos de conversão
- Footer enxuto com logo, redes, contato e links legais — fechamento institucional
- Open Graph + Twitter Card + JSON-LD Organization — preview correto no WhatsApp/LinkedIn (canal de aquisição)
- Lighthouse ≥ 90 desktop / ≥ 85 mobile — performance é signal de premium
- Tracking Pixel + GA4 + Clarity desde o dia 1 — otimização de campanha exige instrumentação
- WCAG AA contraste + navegação por teclado + `prefers-reduced-motion` — table stakes em sites premium 2026
- Lenis smooth scroll desktop, native scroll mobile — feel cinematográfico sem brigar com momentum nativo
- Direção visual escuro → claro → escuro entre seções — ritmo narrativo

**Should have (competitive — diferenciadores específicos pra clínicas):**
- Seção "Cenário Clínica Desorganizada" (Ato 1 — Dor) — reconhecimento imediato do dono da clínica
- Sticky pin-and-scrub na seção Produto (Atendimentos → CRM → Agentes IA → Relatórios) — storytelling cinematográfico apple-style
- Jornada visual "DM Instagram → Agendamento" (Ato 3 — Como Funciona) — explica o fluxo central da operação
- Kanban com etapas específicas de clínica (Contato Inicial → Orçamento → Agendamento → Compra Realizada) — usa imagem do CRM real
- Demo do Agente IA atendendo lead 24/7 — mockup animado da conversa
- FAQ vertical com 5-7 perguntas reais de dono de clínica — barreira de objeções
- Form consultivo 3 campos (nome, WhatsApp, mensagem opcional) — captura discreta premium
- Floating WhatsApp CTA mobile após primeiro scroll — thumb-zone access
- Menção elegante a operação real (Dolce Home) na seção Prova — credibilidade sem fabricar métricas (requer autorização)

**Defer (v2+ ou explicitamente fora de escopo):**
- Páginas verticais para varejo, e-commerce, serviços — v1 é 100% clínicas
- `/precos` dedicada — preço é negociado em conversa
- Blog / central de conteúdo — sem estratégia SEO de conteúdo agora
- Multi-idioma (i18n) — nicho é Brasil
- Login / área de cliente — vive em `app.likro.com.br`
- CMS (Sanity/Contentful) — copy estática em código basta
- A/B testing nativo — Vercel + Clarity bastam pros primeiros aprendizados
- GSAP/ScrollTrigger — arquitetura prepara, mas v1 não precisa
- Horizontal scroll na seção "Como Funciona" — começa com vertical staggered; migra se Clarity mostrar engajamento

**Anti-features (explicitamente proibidas, não apenas deferidas):**
Roxo em fundo gigante de seção (violação direta do brand book), métricas/depoimentos fabricados, múltiplos CTAs primários competindo, pop-up exit-intent, carrossel automático de features, vídeo autoplay com áudio, intro animation longa antes do conteúdo, form > 4 campos, foto stock genérica de spa, gradiente roxo exagerado em tudo, copy com cara de IA, qualquer link pra `web.whatsapp.com` (sempre `wa.me/`).

### Architecture Approach

Single-page Next.js App Router com seções isoladas por ato narrativo, primitivas de motion centralizadas, único loop RAF de Lenis, e `<ScrollScene>` como contrato GSAP-future-ready (consumer recebe `MotionValue<number>` 0→1 e nunca importa Motion direto).

**Major components:**
1. **`app/layout.tsx` + providers** — fontes Inter via `next/font`, metadata global, AnalyticsProvider > SmoothScrollProvider > MotionConfigProvider > children. Um único RAF loop.
2. **`sections/` (uma pasta = um ato)** — `Hero/`, `Pain/`, `Bridge/`, `Product/`, `HowItWorks/`, `Proof/`, `CtaForm/`, `Footer/`. Cada seção é black box: importa só primitives de motion, hooks, e seu próprio `copy.ts` + `images.ts`.
3. **`components/motion/` (primitivas)** — `<ScrollScene>` (boundary GSAP-future), `<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>`. Congeladas após Phase 2 — toda mudança ripple-affects todas as seções.
4. **`components/ui/` (atoms)** — `<Button>`, `<Container>`, `<Headline>`, `<Card>`, `<WhatsAppCta>`. Disciplina de brand book aplicada aqui mecanicamente (cores, tipografia).
5. **`hooks/useDeviceTier`** — retorna `'reduced' | 'mobile' | 'tablet' | 'desktop'`. Drives motion config por seção sem forkar componentes por breakpoint.
6. **`lib/analytics.ts`** — único `track(event, payload)` que faz fan-out pra Pixel/GA4/Clarity. `event_id` UUID em cada evento desde dia 1.
7. **`lib/buildWhatsAppUrl()`** — único helper usado em TODO CTA WhatsApp. Garante formato `wa.me/55...?text=...` em todos os pontos.
8. **`content/*.ts`** — copy + image manifest estáticos em TypeScript. CMS é out-of-scope v1.
9. **`app/api/lead/route.ts`** — POST → webhook (edge runtime); Zod valida; dedupe phone+60s.

**Performance strategy load-bearing:**
- Hero `next/image` com `priority` (exatamente um na página)
- Resto das seções via `dynamic({ ssr: true })` + `useInView` gating do motion runtime
- Image manifest com `sizes` presets corretos (LCP killer #1 mobile)
- Lenis `smoothTouch: false` SEMPRE; skip init em `prefers-reduced-motion`
- Transformações GPU-friendly apenas (translate3d/scale/opacity); zero layout-trigger properties

### Critical Pitfalls

Os 6 críticos. Lista completa (26 pitfalls) está em `PITFALLS.md`.

1. **Copy com voz de IA** — Maior risco do projeto. Frases banidas documentadas: "desbloqueie", "potencialize", "transforme sua X", "jornada do cliente", "fricção" abstrato, "solução inovadora", "próximo nível". Teste: *"essa frase funciona pra qualquer SaaS?"* Se sim, reescreve. Lenny = filtro final obrigatório por seção. **Prevenção contínua, não fase única.**

2. **Hero animation matando LCP** — LCP element (headline + mockup) renderiza no estado final imediatamente — zero fade-in ou translateY nele. Entrance animations só em secondary elements. Exatamente um `priority` em `next/image`. Lighthouse mobile CI gate desde o primeiro PR de hero. **Prevenção: Phase 3.**

3. **Lenis + `position: sticky` quebrando** — Lenis em native scroll mode (`smoothWheel: true`, sem wrapper/content transform). Mobile: `smoothTouch: false`. Validar todas as sticky sections em iOS Safari real e Android Chrome real. **Prevenção: Phase 2 (motion primitives) — `<StickyStage>` testado em `/dev` antes de qualquer seção.**

4. **Roxo `#7C3AED` em superfícies grandes** — Tailwind config restringe mecanicamente: roxo apenas como `accent.primary`, sem `bg-accent-50/100/200`. Dark sections em `#0A0A0B` ou `#0F1115`, nunca roxo-tinted. Gate de revisão: screenshot dessaturado de cada seção — se roxo lê como forma maior, está grande demais. **Prevenção: Phase 1 (Tailwind config).**

5. **WhatsApp CTA abrindo browser ao invés do app** — Único helper `buildWhatsAppUrl(message, location)` usado em todos os CTAs. Formato `https://wa.me/55<DDD><numero>?text=<encodeURIComponent(msg)>`. Zero `web.whatsapp.com`. Testado em iOS Safari real + Android Chrome real. **Prevenção: Phase 1 (helper criado e validado antes de qualquer CTA).**

6. **Tracking double-fire + Clarity gravando PII** — Todo analytics via `track()` em `lib/analytics.ts` — zero chamadas diretas a vendors em componentes. `event_id` UUID em cada evento desde início (retrofitar depois = reescrever toda instrumentação). `data-clarity-mask="true"` no form wrapper — verificado em sessão de teste REAL antes do launch, não só por leitura de docs. **Prevenção: Phase 1 (`track()` shell) + Phase 6 (verificação completa).**

## Implications for Roadmap

Estrutura de 7 fases, otimizada pra resolver os 6 críticos estruturalmente antes de chegar nas seções narrativas.

### Phase 1: Foundations + Design System
**Rationale:** Tailwind palette restrita mecanicamente impede roxo overuse antes que exista qualquer seção. `SmoothScrollProvider` validado isolado. `buildWhatsAppUrl()` helper definido antes do primeiro CTA. `track()` shell criado pra que toda chamada de analytics use o mesmo ponto.
**Delivers:** Next.js scaffold, `app/layout.tsx`, Tailwind v4 config com tokens do brand book, atoms UI (`Button`, `Container`, `Headline`, `WhatsAppCta`), providers (Lenis, MotionConfig, Analytics), `useDeviceTier`, helpers `cn()` e `buildWhatsAppUrl()`, metadata global, fonts Inter, sitemap/robots.
**Addresses:** infrastructure pra todas as features visuais e de conversão.
**Avoids:** Pitfalls #4 (roxo), #5 (WA helper), #6 (analytics fan-out), #19 (font weights).

### Phase 2: Motion Primitives
**Rationale:** ARCHITECTURE.md é explícito — construir `<ScrollScene>`, `<RevealOnView>`, `<ParallaxLayer>`, `<StickyStage>`, `<TextSplit>` em rota `/dev` com retângulos placeholder antes de qualquer seção. Congelar API do `<ScrollScene>` aqui — tudo que vier depois depende dela. Validar Lenis + sticky em iOS Safari real.
**Delivers:** Primitivas de motion testadas e documentadas, página `/dev` interna pra showcase, contrato `<ScrollScene>` GSAP-future-ready.
**Uses:** `motion@^12`, `lenis@^1.3.23`.
**Implements:** `components/motion/` completo.
**Avoids:** Pitfalls #1 (sticky), #8 (pin budget), #11 (easing config), #12 (reduced motion).

### Phase 3: Hero (benchmarked isolado)
**Rationale:** Hero deployado e LCP < 2.5s verificado antes de adicionar qualquer seção abaixo. Copy do hero aprovado por Lenny. É o "first impression" da landing inteira — vale isolar.
**Delivers:** Section `Hero/` em produção na Vercel, Lighthouse CI gate verde, copy hero versão 1 aprovada, mockup principal selecionado.
**Avoids:** Pitfalls #2 (LCP), #3 (copy review por seção), #7 (`100vh` iOS — usar `dvh`/`svh`), #17 (5-second test do value prop), #18 (CTA invisível mobile).

### Phase 4: Seções Narrativas (Pain → Bridge → Product → HowItWorks → Proof)
**Rationale:** Bridge é a primeira `<ScrollScene>` em produção (mais difícil) — suas decisões formam o template do resto. Product reutiliza padrão. HowItWorks é o segundo `<ScrollScene>` (jornada DM→Agendamento). Proof é mais leve. Image manifest com 12-18 prints triados dos 50 disponíveis.
**Delivers:** 5 seções narrativas completas com copy aprovado por Lenny seção a seção.
**Implements:** A narrativa central da landing.
**Avoids:** Pitfalls #3 (copy AI por seção), #9 (image pipeline), #15 (mobile parallax jank).
**Research flag:** Se sticky pin-and-scrub com Motion não se comportar bem em iOS Safari, avaliar GSAP antecipado pra essa seção específica.

### Phase 5: Conversion (CtaForm + Footer + Header final)
**Rationale:** Form 3 campos + honeypot + webhook edge + sucesso inline. Floating WhatsApp mobile. CTAs com `location` param em 4+ pontos da página.
**Delivers:** Form consultivo, edge route `/api/lead`, webhook integration, header sticky com CTA, footer institucional.
**Uses:** React Hook Form + Zod + Server Action (ou Route Handler edge).
**Avoids:** Pitfalls #13 (form curto), #18 (CTA mobile competing), #25 (double-submit).

### Phase 6: Analytics Instrumentation Pass
**Rationale:** Verificação sistêmica de todos os eventos nos três dashboards (Pixel Test Events, GA4 DebugView, Clarity recordings). `event_id` em cada evento. Section view events. Clarity PII masking verificado em sessão real.
**Delivers:** Todos os eventos validados nos vendors, dashboards configurados, alertas básicos.
**Avoids:** Pitfalls #6 (dedupe), #22 (scroll-depth per section), #14 (Meta CAPI deferred to v2).

### Phase 7: SEO + A11y + Performance Hardening
**Rationale:** Pass final pra garantir os números: Lighthouse 90+/85+, JSON-LD validado em Rich Results Test, OG image testada no preview do WhatsApp e LinkedIn (canais de aquisição), WCAG AA audit, page weight ≤1.5MB mobile, JS ≤150KB gzipped.
**Delivers:** Lighthouse CI gates, JSON-LD Organization, OG/Twitter cards, sitemap submetido, a11y audit limpo.
**Avoids:** Pitfalls #14 (SEO), #23 (preview indexado em produção), #24 (bundle bloat), #12 (reduced motion não auditado).

### Phase Ordering Rationale

- **Foundations antes de qualquer animação:** disciplina de design (brand book) precisa virar configuração mecânica antes que exista código de seção. Senão drift acumula.
- **Motion primitives antes de Hero:** congelar API do `<ScrollScene>` cedo evita refactor das seções depois. ARCHITECTURE.md é enfático.
- **Hero isolado antes do resto:** LCP é o número que mata otimização de campanha. Validar antes de adicionar tudo embaixo.
- **Bridge antes de Product:** Bridge é mais simples mas usa o mesmo padrão sticky+scrub do Product — perfeito pra debug e congelar template.
- **Conversion como fase separada:** form + webhook + helper de WhatsApp final + UTM params formam um sistema próprio.
- **Analytics + SEO depois de conteúdo final:** instrumentar antes de copy estar travado gera retrabalho.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 4 — Bridge/Product:** Se Motion não cobrir o pin-and-scrub específico em iOS Safari com Lenis, avaliar GSAP antecipado pra essa seção isolada. Prototipar primeiro.
- **Phase 4 — HowItWorks (horizontal scroll):** High complexity. Decisão entre horizontal scroll cinematográfico vs vertical staggered fallback depende de prototipagem rápida.

**Phases with standard patterns (skip research-phase):**
- **Phase 1, 2, 3, 5, 6, 7:** padrões bem-documentados, decisões já tomadas no PROJECT.md e nessa research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versões verificadas em docs oficiais maio/2026; compatibilidade cruzada confirmada; alternativas explícitas rejeitadas com racional |
| Features | HIGH | Padrões premium 2026 consistentes em Linear/Vercel/Stripe/Apple; anti-features alinhadas com brand book e decisões do usuário |
| Architecture | HIGH | Padrões Lenis+Motion+Next.js battle-tested; `<ScrollScene>` boundary é decisão de projeto com reasoning sólido |
| Pitfalls | HIGH (técnicos) / MEDIUM-HIGH (copy/design) | Técnicos: docs oficiais + GitHub issues. Copy: consenso de copywriters PT-BR e design B2B premium |

**Overall confidence:** HIGH

### Gaps to Address

Itens operacionais que precisam de input do Lenny antes ou durante as fases respectivas.

**🟡 PENDENTES bloqueantes (precisam de resposta antes da fase indicada):**

- **🟡 PENDENTE — Número oficial do WhatsApp da Likro** (DDD + número). Bloqueia `buildWhatsAppUrl()` em Phase 1 e validação real mobile em Phase 3. Sem isso, todo CTA da landing fica usando placeholder. *Handling:* perguntar ao Lenny antes do início da Phase 3.
- **🟡 PENDENTE — Autorização explícita pra citar Dolce Home na seção Proof.** Bloqueia copy final dessa seção. Se não houver autorização, ajusta pra "operação ativa em uso" sem nome. *Handling:* perguntar antes de a seção Proof entrar em desenvolvimento na Phase 4.

**Outros itens operacionais:**

- **Mensagem WhatsApp pré-preenchida por seção** (`?text=`): Claude rascunha por seção, Lenny aprova no PR. *Handling:* checklist de copy review por seção em Phase 4.
- **Webhook target pro form de lead:** email direto? Slack channel? n8n/Make? Função Vercel + Resend? *Handling:* decisão antes de Phase 5.
- **Cadência de copy review do Lenny:** síncrono por seção, async via PR, ou pass final? *Handling:* combinar antes de Phase 3.
- **GSAP rationale no PROJECT.md:** ✅ atualizado em 2026-05-15 — agora reflete complexidade/curva e manutenção, não licença/custo.

## Sources

### Primary (HIGH confidence)
- Next.js docs (nextjs.org/docs) — App Router, metadata API, Image, Script, `next/font`, lazy loading
- Tailwind CSS v4 docs (tailwindcss.com) — CSS-first config, `@theme` directive
- Motion docs (motion.dev) — `useScroll`, `useTransform`, `useReducedMotion`, accessibility
- Lenis README + GitHub (github.com/darkroomengineering/lenis) — config, mobile, GSAP integration
- GSAP ScrollTrigger docs (gsap.com/docs/v3/Plugins/ScrollTrigger) — integration pattern with Lenis
- Linear, Vercel, Stripe, Apple product pages — direct UI/UX inspection of premium scroll patterns

### Secondary (MEDIUM confidence)
- Bridger Tower — "Lenis in Next.js" (bridger.to/lenis-nextjs)
- Olivier Larose — Smooth Parallax tutorials
- DebugBear — Next.js Image Optimization best practices
- Vercel — Third-Party Scripts academy article
- Microsoft Clarity docs (clarity.microsoft.com) — PII masking, recordings

### Tertiary (LOW confidence — needs validation in execution)
- B2B SaaS landing page conversion benchmarks (vary by source)
- Brazilian clinic operator pain point survey data (sparse public sources; user/PROJECT.md is primary)
- Exact iOS Safari + Lenis sticky behavior in 2026 — validate empirically in Phase 2 `/dev` testing

---
*Research completed: 2026-05-15*
*Ready for roadmap: yes*
