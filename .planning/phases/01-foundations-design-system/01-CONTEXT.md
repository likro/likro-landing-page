# Phase 1: Foundations & Design System - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega o scaffold do projeto e os mecanismos de disciplina visual que tornam impossível violar as restrições centrais do brand book Likro. No fim dela, o repositório tem:

- Next.js 15.5 App Router rodando local + Vercel preview ativo
- Tailwind v4 configurado com tokens do brand book em `@theme` (CSS-first)
- Atoms UI shadcn (Button, Card, Input, Textarea, Label, Dialog, Sheet, Sonner) customizados pesadamente — feel mix Linear+Stripe, premium completo, sem cara de template
- Helper único `buildWhatsAppUrl()` + componente `<WhatsAppCta>` cobrindo os 12+ CTAs futuros
- Módulo único `track()` com fan-out pra Meta Pixel, GA4 e Microsoft Clarity, `event_id` UUID por evento
- Hook `useDeviceTier()` retornando `'reduced' | 'mobile' | 'tablet' | 'desktop'`
- Provider tree (Analytics > SmoothScroll > MotionConfig > children) em um único loop RAF
- Metadata global, fontes Inter via `next/font`, sitemap, robots, rota `/dev` interna

Nenhuma seção narrativa, nenhuma animação cinematográfica e nenhum form ainda — essas fases dependem dos contratos definidos aqui.

</domain>

<decisions>
## Implementation Decisions

### Base dos atoms UI (shadcn customizado)
- **D-01:** Instalar shadcn essencial+interativos na Phase 1: `Button`, `Card`, `Input`, `Textarea`, `Label`, `Dialog`, `Sheet`, `Sonner` (toast). Outros componentes shadcn entram on-demand nas fases que precisarem.
- **D-02:** Todos os atoms recebem customização visual pesada — variants tailwind, microinterações, tipografia e cores próprias do brand book Likro. Objetivo: zero aparência genérica de shadcn/template.
- **D-03:** Referência visual: mistura **Linear + Stripe**. Peso/refinamento da Linear + profundidade/polish da Stripe. Premium editorial, high-end tech, moderna e viva. Evitar: developer tool genérica, startup IA clichê, interface fria demais.
- **D-04:** Atoms ganham polish premium completo nos micro-estados: transições suaves (200-300ms ease-out), hover/focus-visible/active/disabled bem resolvidos, respeitam `prefers-reduced-motion`. SEM ripple effects, SEM cursor-follow glow, SEM efeitos que chamem atenção pra si mesmos. Refinamento sem ostentação.
- **D-05:** Direção cromática crítica — equilíbrio editorial entre áreas escuras cinematográficas e áreas claras com respiro. **Quatro extremos a evitar simultaneamente**: branco demais ("vazio/sem personalidade"), preto demais ("pesado/cansativo"), glow demais ("AI SaaS template"), minimalismo frio extremo ("clínico sem emoção"). Translúcidos, shadows e glows existem mas são extremamente sutis e intencionais.

### Theme strategy (alternation escuro→claro→escuro)
- **D-06:** Cada `<section>` declara seu próprio fundo via classes Tailwind tokenizadas (`bg-surface-dark` / `bg-surface-light` etc) e tokens de texto correspondentes. **Sem theme provider global, sem `next-themes`, sem `data-theme`, sem JS de troca de tema.**
- **D-07:** Razão: a alternation é determinística por seção (hero escuro → conteúdo claro → fechamento escuro), não é preferência do usuário. Theme provider global adiciona hidratação + estado sem ganho real.

### Composição do CTA WhatsApp
- **D-08:** Componente `<WhatsAppCta>` com API **híbrida**: variants pré-definidas (`primary`, `secondary`, `floating`, `inline`) cobrem 90% dos casos com texto/ícone padrão; slot opcional `children` permite customização de conteúdo interno quando necessário sem quebrar o contrato.
- **D-09:** Componente é o único ponto de criação de CTA WhatsApp na landing — encapsula URL building (via `buildWhatsAppUrl` helper interno), tracking (`track('whatsapp_click', { location })`), estado de loading e abertura do link. Caller passa apenas `variant`, `location`, e (opcionalmente) `label` ou `children`.
- **D-10:** Feedback ao clicar: **loading 200-300ms** (spinner sutil no botão) → tracking dispara → abre `wa.me/...`. Garante que evento de analytics envia antes do unload do browser e dá sensação tátil premium.
- **D-11:** Ícone: SVG oficial do WhatsApp embarcado como componente (`<WhatsAppIcon />`), com `currentColor` pra herdar do contexto. Reforça intenção da ação.
- **D-12:** Mensagem pré-preenchida (`?text=`) por `location`: mapa central em `src/content/whatsapp.ts` (`{ hero: "...", pain: "...", product: "...", floating: "...", ... }`). Claude rascunha cada mensagem, Lenny aprova no PR antes da seção entrar em dev.

### Enforcement mecânico do roxo
- **D-13:** Paleta enxuta declarada no `@theme` do Tailwind v4 (em `globals.css`):
  - **Accent:** `accent.primary` (#7C3AED), `accent.hover` (#6D28D9), `accent.glow` (rgba sutil pra rings/shadows)
  - **Surface:** `surface.dark` (#0A0A0B ou tom editorial calibrado), `surface.darker`, `surface.light` (off-white não-clínico, ex: #FAFAF9), `surface.lighter`
  - **Text:** `text.primary`, `text.secondary`, `text.muted` — variantes pra contexto dark e light
  - **Border:** `border.subtle`, `border.default`
  - **Neutrals:** `neutral.50..900` (Stone ou Zinc calibrado pra não ser frio)
- **D-14:** Tokens roxo são **apenas** `accent.primary`, `accent.hover`, `accent.glow`. Sem `accent.50/100/200/.../900`. Tailwind v4 não gera o CSS que não foi declarado — `bg-accent-50` vira no-op (classe sem efeito), `bg-accent-primary` funciona.
- **D-15:** Sem ESLint custom adicional na v1 — `@theme` restrito é proteção suficiente. Adicionar regra customizada é overhead sem retorno comprovado em time pequeno; pode entrar em milestone futuro se drift acumular.
- **D-16:** Regra prática (revisão visual, não mecânica): roxo nunca é protagonista de área. Permitido em CTAs, badges/chips, ícones ativos, focus rings, dots/indicators, texto de destaque pontual. Proibido em fundos de seção, cards inteiros grandes, gradients ocupando viewport.
- **D-17:** Documentação leve e prática: comentário curto no `globals.css` junto à declaração dos tokens explicando a regra; seção sucinta no `CLAUDE.md` raiz do projeto (já gerado) listando os 4 extremos a evitar (cromático) e os usos permitidos do roxo. Sem documento separado.

### Estrutura de pastas e path aliases
- **D-18:** Estrutura baseada em `src/`:
  ```
  src/
    app/           # App Router (layout.tsx, page.tsx, /dev, /api/lead, sitemap.ts, robots.ts, opengraph-image.tsx)
    components/
      ui/          # Atoms shadcn customizados (button, card, input, ...)
      motion/      # Primitivas de animação (Phase 2 popula)
      layout/      # Header, Footer, ScrollProgress
      providers/   # AnalyticsProvider, SmoothScrollProvider, MotionConfigProvider
    sections/      # Uma pasta por ato narrativo (Hero/, Pain/, Bridge/, Product/, ...) — Phase 3+
    lib/           # Helpers: whatsapp.ts, analytics.ts, utils.ts (cn), seo.ts, validation.ts
    hooks/         # useDeviceTier, useScrollProgress, useInView, useLenis, useAnalyticsEvent
    content/       # Copy + image manifests por seção: hero.ts, pain.ts, product.ts, whatsapp.ts, images.ts
  ```
- **D-19:** Path alias único: `@/*` apontando pra `src/`. `import { Button } from '@/components/ui/button'`. Sem aliases segmentados — simplicidade > expressividade extra.
- **D-20:** Cada seção narrativa (a partir da Phase 3) é **pasta isolada com co-locação completa**: `sections/Hero/index.tsx` exporta a seção; `sections/Hero/HeroVisuals.tsx`, `sections/Hero/HeroMockup.tsx`, `sections/Hero/types.ts`, `sections/Hero/hooks.ts` vivem juntos quando necessários. Cada seção é black-box que pode crescer sem poluir outras.
- **D-21:** Copy fica **centralizada** em `src/content/*.ts` — uma fonte de verdade por seção (`content/hero.ts`, `content/pain.ts`, `content/product.ts`, `content/whatsapp.ts`, etc). Seções importam de `@/content/...`. Razão: review de copy fica como diff por arquivo de texto, não misturada com mudanças de JSX/motion. Crítico pro filtro anti-IA (COPY-02) e revisão seção-a-seção do Lenny (COPY-04).

### Claude's Discretion
Áreas onde o planner/executor tem flexibilidade dentro das decisões acima:
- Estrutura interna do `track()` (UUID via `crypto.randomUUID()` vs `nanoid`, dedupe via Set in-memory vs nenhum) — entrega o contrato, escolha a implementação simples
- Sub-pacotes do Lucide React a importar (tree-shake correto) — Lucide é o ícone pack default do shadcn, mantém
- Estratégia da OG image: começar com `app/opengraph-image.tsx` dinâmico (gerado por route handler com `next/og`) — permite variantes futuras sem refactor
- Exact pixel breakpoints do `useDeviceTier()` (sugestão: mobile ≤640, tablet ≤1023, desktop ≥1024, reduced via `prefers-reduced-motion`)
- Inter font weights: 400/500/700 (alinhado ao brand book "máximo 3 pesos"); subset Latin only ou Latin+Latin-ext — Latin only se cobrir português; ajustar se notar caracteres faltando
- Configuração inicial do Lenny no `SmoothScrollProvider`: `smoothWheel: true`, `smoothTouch: false`, `lerp: 0.1` (ajustar com base em sensação real), skip init em `prefers-reduced-motion`
- Naming/estrutura interna dos atoms shadcn customizados — mantenha kebab-case shadcn (`button.tsx`) por consistência com docs/community
- Estratégia exata de variants do `<WhatsAppCta>` (cva config) — Claude estrutura, qualquer ajuste fica via PR

</decisions>

<specifics>
## Specific Ideas

- **Sensação visual alvo:** "essa empresa é absurda" em segundos. Equilíbrio editorial, calor visual, hierarquia clara, profundidade leve, glow extremamente controlado. Premium editorial + high-end tech + moderna e viva.
- **Quatro extremos visuais a evitar simultaneamente:** branco demais (vazio/sem personalidade) / preto demais (pesado/cansativo) / glow demais (AI SaaS template) / minimalismo frio extremo (clínico sem emoção).
- **Atoms: feel Linear + Stripe.** Pegar o peso visual e refinamento da Linear (botões com glow sutil em hover, cards com border-1 e leve shadow, inputs com border-bottom em foco) + a profundidade e polish da Stripe (botões com profundidade leve, cards com gradient sutil + shadow refinada).
- **CTA primário (WhatsApp) é o foco em todos os pontos do scroll.** Form consultivo é refinamento, não substituto.
- **shadcn é base estrutural, mas customização é pesada** — usuário foi explícito: "sem aparência genérica de template".
- **Roxo é guia visual, nunca protagonista.** Direção repetida em múltiplos pontos da discussão — vira regra cultural do projeto.
- **Bundle controlado mesmo com 8 componentes shadcn instalados** — instalar não importa, importar sim. Tree-shake correto e lazy de Dialog/Sheet/Sonner se possível.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing Phase 1.**

### Visão e constraints do projeto
- `.planning/PROJECT.md` — Vision, core value, key decisions, brand book regras críticas, voice/tone
- `.planning/REQUIREMENTS.md` — 99 requisitos v1, especialmente as 17 reqs mapeadas pra Phase 1 (FOUND-01..12, CTA-01, CTA-02, TRACK-01, TRACK-02, TRACK-03)
- `.planning/ROADMAP.md` §"Phase 1: Foundations & Design System" — Goal, success criteria, dependências

### Research do projeto (read antes de planejar)
- `.planning/research/SUMMARY.md` — Síntese executiva: stack pinada, arquitetura, top 6 pitfalls, gaps operacionais pendentes
- `.planning/research/STACK.md` — Versões pinadas (Next 15.5, Tailwind v4, Motion v12, Lenis 1.3.x, RHF+Zod, etc), folder structure, animation orchestration pattern, form/analytics/SEO patterns
- `.planning/research/ARCHITECTURE.md` — Folder layout completo, provider nesting, lazy strategy, image manifest, motion choreography, GSAP-future contract, build order
- `.planning/research/PITFALLS.md` — 26 pitfalls categorizados; críticos pra Phase 1: #4 (roxo overuse), #5 (WhatsApp wa.me), #6 (tracking double-fire/PII), #19 (font weights), #26 (gradient overuse)

### Brand assets disponíveis (no diretório pai)
- `../logos_likro/LIKRO LOGO.svg` — Logo SVG oficial (vetor)
- `../logos_likro/logolikro_2000x2000.png` — Logo PNG 2000x2000 (fallback)
- `../📘 BRAND BOOK — LIKRO (2).pdf` — Brand book completo (cores, tipografia, uso do roxo)
- `../LIKRO_Documento_Interno_Master.docx` — Documento interno master (já extraído pra contexto durante questionamento; reconsultar se necessário)

### Pendências operacionais (não bloqueiam Phase 1, mas STATE.md tracking)
- `.planning/STATE.md` §"Open Todos / Pendências Bloqueantes" — número WhatsApp, autorização Dolce Home, webhook target, cadência de copy review

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Nenhum código existente.** Greenfield project. Diretório atual só tem `.git/`, `.planning/`, `CLAUDE.md`.
- Logos SVG/PNG disponíveis em `../logos_likro/` (diretório pai) — copiar para `src/app/` (favicon, OG) e `public/` (logo header) durante o scaffold.

### Established Patterns
- **Nenhum padrão de código a respeitar** — Phase 1 *estabelece* os padrões. Decisões D-01..D-21 acima são os padrões que todas as fases subsequentes seguem.

### Integration Points
- **Vercel:** projeto será conectado a um repositório GitHub e deployado automaticamente. Variáveis de ambiente (`NEXT_PUBLIC_WA_NUMBER`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`, `LEAD_WEBHOOK_URL`) configuradas na dashboard Vercel.
- **WhatsApp Business:** número oficial será fornecido pelo Lenny antes da Phase 3 (não bloqueia Phase 1 — placeholder em `.env.local` está OK pra dev).
- **Analytics vendors:** Meta Pixel, GA4 e Microsoft Clarity exigem IDs reais antes de produção. Phase 1 estabelece o shell (`track()` shell + `<Script>` tags); IDs reais entram via env vars antes da Phase 6 validation pass.

</code_context>

<deferred>
## Deferred Ideas

- **ESLint custom rule pra blindar contra `bg-accent-*` indevido** — discutida, descartada pra Phase 1 (overhead sem ganho comprovado). Pode entrar em milestone futuro se drift acumular após produção.
- **Aliases segmentados** (`@components/`, `@lib/`, `@sections/`) — discutidos, descartados. Alias único `@/*` é suficiente.
- **`next-themes` ou theme provider global** — discutido, descartado. Alternation é determinística por section, não preferência de usuário.
- **Outros componentes shadcn** (Tooltip, Form module integrado a RHF, Popover, DropdownMenu, Tabs, etc) — não instalar agora; on-demand quando seção/feature pedir.
- **Variants extras do `<WhatsAppCta>`** além de `primary`/`secondary`/`floating`/`inline` — quando uma seção pedir comportamento novo, adicionar variant ao componente, não usar slot pra hackear.
- **Helper de UTM tracking** acoplado ao `buildWhatsAppUrl` — não na Phase 1; UTM params são adicionados como camada extra na Phase 5 (Conversion) quando CTAs ganham distribuição final.
- **Cookie banner LGPD compliance** — explicitamente fora de escopo v1 (Out of Scope em REQUIREMENTS.md). Entra em milestone separado com revisão jurídica.
- **CMS pra copy** — fora de escopo v1. `content/*.ts` em TypeScript estático cobre.

</deferred>

---

*Phase: 01-foundations-design-system*
*Context gathered: 2026-05-15*
