# Phase 3: Hero (benchmarked isolado) — Research

**Researched:** 2026-05-16
**Domain:** Hero LCP engineering + WhatsApp deep linking + isolated Vercel benchmark for Next.js 15.5 / React 19 / Motion 12 / Lenis 1.3 / Tailwind v4
**Confidence:** HIGH (technical) / MEDIUM (5-second test logistics + LCP-on-Vercel-preview empirical numbers, which only the actual deploy can confirm)

---

## Summary

A Phase 3 entrega o hero verticalizado pra clínicas **deployado sozinho na Vercel** como benchmark de LCP < 2.5s mobile, com copy aprovada por Lenny via PR e WhatsApp deep link validado em iOS e Android reais. CONTEXT.md já fixou todas as decisões visuais e operacionais críticas (D-01..D-19); UI-SPEC.md já travou o contrato visual; PROJECT/REQUIREMENTS/ROADMAP/STATE estão alinhados. Esta pesquisa **não revisita decisões locked** — ela só prepara o planner pra decompor a fase em plans executáveis sem refazer trabalho.

**O risco real da Phase 3 não é "decidir o que fazer" — é não introduzir nenhuma micro-decisão que mate o LCP no momento do deploy isolado.** Os três vetores que historicamente matam um hero LCP são (1) animação aplicada ao elemento LCP, (2) imagem priority malconfigurada (sem `sizes`, ou priority em mais de uma imagem), (3) fonte web carregando após paint. As três estão neutralizadas no código existente (Phase 1) — esta fase só precisa não regredir.

**Recomendação primária:** Phase 3 deve ser dividida em ~3 plans pequenos: (A) configuração de ambiente (env vars na Vercel + asset prep + adição de `"header"` em `WhatsAppLocation`), (B) implementação do Header + Hero como Server Components com glow como única "use client" island, (C) PR de copy com 3 variantes + checklist real-device manual + Lighthouse mobile. Tudo o resto já existe. A inflação dessa fase é o maior risco operacional.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Composição visual + mockup (LCP):**

- **D-01** — Direção tonal **híbrida**: background dark editorial cinematográfico + mockup vivendo dentro de "janela" clara refinada. Sensação alvo: editorial, high-end, sofisticada, tecnológica, viva. A evitar: dark mode pesado, glow exagerado, "AI SaaS template", dashboard perdido em fundo escuro vazio, sci-fi/cyberpunk.
- **D-02** — Layout **split assimétrico** copy/mockup. Desktop: copy à esquerda (h1, sub, CTA, trust signal), mockup à direita ~55-60% horizontal. Mobile: stack vertical (copy em cima, mockup abaixo) com CTA acima da dobra (HERO-01).
- **D-03** — Mockup principal = **caixa de entrada multicanal (Atendimentos)**. Único `<Image>` com `priority` da página inteira (HERO-04). Screenshot exato escolhido pelo executor a partir de `../prints_funcionalidades/`.
- **D-04** — Frame do mockup = **sem chrome de browser**. Mockup raw dentro de "janela" clara com radius 12px (brand book), sombra refinada (grande, difusa, baixa opacidade), borda 1px `border.subtle`. A evitar: chrome de Safari/Chrome, perspective/tilt forte.
- **D-05** — **1 único micro-card sobreposto** no mockup principal. Notificação curta ("Novo lead pelo Instagram") ou chip de status — discreto, pequeno, sombra própria, integrado. **Estático no carregamento** (HERO-02/03 — não anima entrada, mesmo sendo "secundário"). Conteúdo final aprovado por Lenny no PR junto com copy.
- **D-06** — Decoração do entorno = **glow roxo extremamente sutil + grid/linhas abstratas leves + gradient neutro editorial quase imperceptível**, tudo em CSS puro (zero impacto LCP). A evitar: cyberpunk, glow exagerado, gradient saturado, poluição visual.

**Direção da copy:**

- **D-07** — **3 variantes contrastantes** de headline+sub entregues por PR: (a) afirmação de identidade vertical pura, (b) afirmação com leve influência de "categoria própria", (c) ângulo alternativo (especificidade operacional concreta tipo "DM → agendamento → retorno"). Todas tom premium, sofisticação, clareza imediata.
- **D-08** — H1 = **afirmação de identidade vertical** com influência leve de categoria-criação. Soa como marca/categoria própria. Usuário precisa sentir: *"isso foi feito exatamente para a operação da minha clínica"*. A evitar: headline agressiva de tráfego pago, "Pare de perder leads", promessas exageradas, clichês SaaS.
- **D-09** — Palavra **"clínica" aparece tanto na headline quanto na sub-headline** — repetição deliberada, não keyword stuffing. Verticalização cristalina já nos primeiros segundos.
- **D-10** — **Sub-headline** complementa H1 aterrando na operação concreta (lead do Instagram, atendimento centralizado, follow-up, agendamento). Limite: 1-2 linhas mobile sem quebrar layout.
- **D-11** — **CTA primário = "Falar no WhatsApp"**. Direto, canal explícito, zero ambiguidade. Usa `<WhatsAppCta variant="primary" location="hero">`.

**Header + trust signal + animações secundárias:**

- **D-12** — **Header estático simples**: logo Likro à esquerda + `<WhatsAppCta variant="secondary" location="header">` à direita. Minimalista, MUITO respiro. **Sem hide-on-scroll, sem mobile menu, sem mega menu** — Phase 5 (MOBILE-06). Logo usa `public/logos/likro-logo.svg` (já copiado em Phase 1).
- **D-13** — **Trust signal "sussurrado"** abaixo do CTA primário. Uma linha curta em `text.muted`. **Sem citar Dolce Home explicitamente no hero** — autorização pendente, prevista pra Phase 4.
- **D-14** — **Sem scroll cue** na Phase 3 — hero está isolado, scroll cue mente.
- **D-15** — **Glow ambiente pulsando muito devagar** é a única animação no hero. Ciclo 8-12s, escala ~1 ↔ 1.05 + opacity sutil, ease-in-out. Atrás do mockup, zero impacto em LCP. Reduced motion: pulsação some, glow estático permanece. HERO-02/HERO-03 respeitados: headline, sub, CTA, mockup, micro-card NÃO animam entrada.

**Operacionais + deploy:**

- **D-16** — **`NEXT_PUBLIC_WA_NUMBER = 5511922324329`**. Configurar em `.env.local` + Vercel env (Production + Preview + Development).
- **D-17** — **Cadência de copy review = async via PR seção-a-seção** (COPY-04). Claude abre PR com 3 variantes em `src/content/<secao>.ts`, Lenny revisa no GitHub. Phase 3 estabelece o ritmo e documenta a convenção no PR description.
- **D-18** — **Estratégia de validação = Vercel preview no PR final da Phase 3**. Sem feature flag, sem branch deployment paralelo, sem sub-projeto Vercel separado. Lighthouse mobile + PageSpeed Insights rodados manualmente contra a URL `.vercel.app` ANTES da Phase 4 começar.
- **D-19** — **LCP gate = checklist manual** registrado em `03-VERIFICATION.md`. Sem Lighthouse CI / GitHub Actions na v1.

### Claude's Discretion

- Escolha do screenshot exato do mockup principal entre os ~50 em `../prints_funcionalidades/` (50 confirmados via Glob).
- Conteúdo exato do micro-card sobreposto (texto da notificação ou tipo de chip).
- Valores exatos do glow (raio, blur, opacidade base, easing do pulse, duração do ciclo).
- Dimensões exatas da headline (font-size mobile/desktop em rem/clamp).
- Estrutura do trust signal (linha curta `text-muted` é o default; mini-pill / ícone + texto fica aberto).
- Padrão da copy nas 3 variantes (formato no arquivo).
- Altura do hero — `min-h-dvh` ou `min-h-svh` aceitável (HERO-05 só veta `vh` puro).
- Estrutura de pastas internas dentro de `src/sections/Hero/`.
- Layout da copy à esquerda (alignment, peso de cada linha, espaçamento).

### Deferred Ideas (OUT OF SCOPE)

- Floating WhatsApp mobile após scroll > 50vh — Phase 5 (CTA-06 + MOBILE-02).
- Header hide-on-scroll, mobile menu, navegação extra — Phase 5 (MOBILE-06).
- CTAs persistentes em 4+ pontos — Phase 5.
- Logo-bar, citação explícita do Dolce Home, mockup tilted/perspective, browser chrome, múltiplos micro-cards, parallax no mockup, variantes de CTA por device tier, 5+ variantes de copy, pass único de copy review, scroll cue, Lighthouse CI gate, branch separada / sub-projeto Vercel, feature flag, Vercel Speed Insights, animação no micro-card pós-LCP, OG image custom do hero, JSON-LD Organization/Product, cookie banner LGPD.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | Hero ocupa primeira tela com headline gigante PT-BR, sub-headline curta e CTA WhatsApp acima da dobra mobile + desktop | §LCP engineering + §Layout (UI-SPEC.md já trava `min-h-svh` + `grid-cols-1 lg:grid-cols-[1fr_1.3fr]`) |
| HERO-02 | Headline e mockup do hero (LCP) renderizam **estado final imediatamente** — zero fade-in/translateY/scale-up | §Risk: animations on LCP elements (a regra é literal — qualquer `opacity: 0 → 1` aplicado ao node LCP atrasa LCP marking) |
| HERO-03 | Entrance animations (se houver) afetam apenas elementos secundários | §Risk: animations on LCP elements (D-15: glow é a única animação; tudo mais é estático) |
| HERO-04 | Hero usa exatamente um `<Image>` com `priority` (mockup principal); nenhuma outra imagem com `priority` | §LCP engineering + §Image strategy (logo é SVG inline ou Image sem priority; micro-card icon é lucide-react SVG) |
| HERO-05 | Hero usa `dvh` ou `svh` para altura (não `vh`) — anti-jump iOS | §`dvh`/`svh` viewport units (HIGH suporte de browser em 2026) |
| HERO-06 | Lighthouse mobile mede LCP < 2.5s na rota raiz com apenas o hero deployado isoladamente — gate ou validação manual no fim da Phase 3 | §Isolated Vercel deploy strategy + §Lighthouse mobile config |
| HERO-07 | Hero passa no "5-second test" | §5-second test plan |
| COPY-01 | Toda copy em `content/*.ts` — sem strings hard-coded em JSX | §`content/hero.ts` content module pattern |
| COPY-04 | Lenny revisa copy seção a seção antes da seção ir pra develop | §Copy review cadence (D-17 trava async via PR; este plano só formaliza) |
| CTA-04 | `NEXT_PUBLIC_WA_NUMBER` configurado em env | §WhatsApp deep link engineering (D-16 fixa o valor; precisa entrar em Vercel + `.env.local`) |

---

## Project Constraints (from CLAUDE.md)

Global (`~/.claude/CLAUDE.md`):

- **Idioma:** respostas em **pt-BR**. Commits podem ser em inglês.
- **Git:** "commita" = commit + push sem confirmar (mas Phase 3 não pede commit pelo planner — o usuário pede).
- **Pipeline automático pré-teste:** code-review skill + Playwright MCP. Phase 3 é frontend, então Playwright se aplica.
- **Não usar emojis** em arquivos (a menos que pedido) — esta research segue.

Projeto (`./CLAUDE.md`):

- **Stack travado:** Next.js 15.5 + React 19 + TypeScript 5.6 + Tailwind v4.1 + Motion 12 + Lenis 1.3 — confirmado em `package.json` (next 15.5.18, motion 12.38.0, lenis 1.3.23, tailwindcss 4.3.0). **[VERIFIED: package.json]**
- **Brand:** roxo `#7C3AED` apenas como `accent.primary`; Inter 3 pesos (400/500/700); ilustrações abstratas tech; voz humana sem cara de IA.
- **State invariants:** roxo nunca como fundo grande; WhatsApp sempre via `wa.me/`; único `priority` no `<Image>` é o mockup do hero; copy nunca hard-coded em JSX; `motion.div` direto em arquivos de seção é proibido.
- **GSD Workflow Enforcement:** edits passam por GSD command — esta research é executada via `/gsd-research-phase` (ou pipeline integrado), está dentro do workflow.
- **`requesting-code-review` skill:** deve ser invocada antes de qualquer commit feito pelos plans. Planner deve incluir code-review como gate em cada plan.
- **Playwright MCP:** após qualquer mudança UI, validar caminho feliz no browser. Planner deve incluir Playwright MCP como passo manual/agente em pelo menos o plan final.

---

## Standard Stack

### Core (já instalado, verificado em `package.json`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.18` | App Router, RSC, `next/image`, `next/font`, `next/script` | **[VERIFIED: package.json]** Já estabelecido na Phase 1. Lock-fit pro brief. |
| `react` | `^19.0.0` | UI runtime | **[VERIFIED: package.json]** Bundled com Next 15.5. |
| `typescript` | `^5.6` | Type safety | **[VERIFIED: package.json]** |
| `tailwindcss` | `^4.3.0` | Utility-first + `@theme` tokens | **[VERIFIED: package.json]** Phase 1 já travou tokens via `@theme`. Phase 3 só consome. |
| `motion` | `^12.38.0` | React animations + `useReducedMotion` | **[VERIFIED: package.json]** Hero usa Motion **apenas pra MotionConfigProvider já wired e pra useReducedMotion no glow se necessário**. **NUNCA `motion.div` direto em `src/sections/Hero/`** (state invariant). |
| `lenis` | `^1.3.23` | Smooth scroll global | **[VERIFIED: package.json]** Já provisionado via `SmoothScrollProvider`. Phase 3 não toca. |
| `lucide-react` | `^0.460.0` | Ícone do micro-card (`Instagram`, `BellRing`, `MessageSquare`) | **[VERIFIED: package.json]** SVG inline, RSC-safe, ~1KB tree-shaken. |

### Supporting

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `@/components/ui/button` | Base do CTA primário e secundário | Reutilizado pelo `<WhatsAppCta>` (já existente). |
| `@/components/ui/headline` | H1 e H2 da landing | Hero usa `<Headline as="h1" size="hero">` — já provisionado, classes `text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight`. |
| `@/components/ui/container` | Max-width consistente | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. |
| `@/components/ui/card` | Possível base do micro-card | Opcional — micro-card pode ser `<div>` puro estilizado. |
| `@/components/ui/whatsapp-cta` | CTA primário (hero) + secundário (header) | Único caminho — proibido importar `buildWhatsAppUrl` direto em outro componente (Phase 1 D-09). |
| `@/lib/whatsapp` | `WhatsAppLocation` type + `buildWhatsAppUrl` | Phase 3 precisa adicionar `"header"` à união do tipo (lista atual: `'hero' \| 'pain' \| 'product' \| 'how' \| 'proof' \| 'footer' \| 'floating'` — visto em `src/lib/whatsapp.ts:27-34`). |
| `@/content/whatsapp` | `WHATSAPP_MESSAGES` map por location | Phase 3 reescreve entrada `hero` (junto com copy) e adiciona entrada `header`. |
| `@/content/hero` | **Novo arquivo** — toda copy do hero + micro-card + trust signal | **[ASSUMED]** A1 — não existe ainda em `src/content/`; Phase 3 cria conforme COPY-01 e D-07. |

### Alternatives Considered

| Instead of | Could Use | Why we don't |
|------------|-----------|--------------|
| `<Headline>` atom existente | Custom `<h1>` direto com Tailwind classes | Quebra Phase 1 D-21 (atoms padronizados). |
| `next/image` no logo SVG | `<img src="/logos/likro-logo.svg">` puro | SVG inline é melhor pra logos (zero requests, sem cost de optimizer); next/image add overhead pra vetor. Recomendação: inline SVG ou `<img>` simples — não `next/image`. |
| Motion `<motion.div>` pro glow pulse | CSS `@keyframes` puro | D-15: glow é CSS puro. Motion v12 só seria useful se precisássemos de useReducedMotion-aware pulse — mas `@media (prefers-reduced-motion)` no globals.css já trata. **CSS puro vence.** |
| `<WhatsAppCta>` reuse | Novo componente custom pro header | Reuso é mandatório (Phase 1). `variant="secondary"` já provisionado em `whatsapp-cta.tsx:71-72`. |

**Installation:** Nenhum pacote novo. Phase 3 não adiciona dependência. **[VERIFIED: package.json]**

**Version verification:** Já feito na Phase 1. Reconfirmação:
- `next@15.5.18` é estável em 2026-05; 16 disponível mas Phase 1 escolheu 15.5 conforme stack rationale (CLAUDE.md TL;DR). **[VERIFIED: package.json]**
- `motion@12.38.0` é current. Import path canonical é `motion/react`. **[VERIFIED: package.json + Phase 2 usage in `src/components/motion/*`]**

---

## Architecture Patterns

### Recommended Project Structure (delta from current)

```
src/
├── app/
│   ├── page.tsx                        # Substitui placeholder; renderiza <Header /> + <Hero />
│   └── layout.tsx                      # NÃO TOCAR (provider tree wired)
├── components/
│   ├── layout/
│   │   └── Header.tsx                  # NOVO — logo Likro + <WhatsAppCta secondary header>
│   └── ui/                             # NÃO TOCAR
├── sections/                           # NOVA pasta (Phase 1 D-20 prevê)
│   └── Hero/
│       ├── index.tsx                   # RSC orchestrator
│       ├── HeroCopy.tsx                # RSC: h1 + sub + CTA + trust
│       ├── HeroMockup.tsx              # RSC: next/image priority + overlay positioning
│       ├── HeroMicroCard.tsx           # RSC: chip estático sobre o mockup
│       └── HeroBackground.tsx          # CSS-only (RSC): glow + grid + gradient
├── content/
│   ├── hero.ts                         # NOVO — copy (3 variants) + microCard + trust
│   ├── whatsapp.ts                     # EDITAR — reescrever entrada `hero`, adicionar `header`
│   └── header.ts                       # Opcional — alt text logo, etc. (ou inline em Header.tsx)
├── lib/
│   └── whatsapp.ts                     # EDITAR — adicionar "header" à união WhatsAppLocation
└── public/
    ├── logos/
    │   ├── likro-logo.svg              # JÁ EXISTE (Phase 1 — verificado via Glob)
    │   └── likro-logo.png              # JÁ EXISTE
    └── mockups/
        └── atendimentos.{webp|png}     # NOVO — screenshot do print escolhido, otimizado
```

**Phase 1 D-20 confirma a convenção `src/sections/<Section>/index.tsx` + co-locação.** A pasta `src/sections/` ainda não existe — Phase 3 a cria. **[VERIFIED: Glob `src/**/*` returns no `src/sections/` entries]**

### Pattern 1: RSC by default, client island only when forced

**What:** Cada sub-componente do Hero é Server Component (`async` ou síncrono, sem `"use client"`). Apenas o que **exige hook ou DOM API** vira client:
- `<WhatsAppCta>` é client (já é — `whatsapp-cta.tsx:1`). Usa hook `useState` + `window.open`.
- `<HeroBackground>` pode permanecer RSC se o glow for **CSS keyframe puro** (sem `useReducedMotion`). O `globals.css:93-102` já zera animation-duration sob `prefers-reduced-motion`, então não precisa de hook React pra isso. **Recomendação: RSC + CSS puro.**

**When to use:** Sempre que possível. O hero é a página LCP — minimizar hidratação cliente preserva TBT/INP.

**Example:**

```tsx
// src/sections/Hero/index.tsx — Server Component (sem "use client")
import { Container } from "@/components/ui/container";
import { HeroCopy } from "./HeroCopy";
import { HeroMockup } from "./HeroMockup";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-surface-darker">
      <HeroBackground />
      <Container as="div" className="relative z-10 grid min-h-svh items-center gap-12 py-16 lg:grid-cols-[1fr_1.3fr] lg:py-24">
        <HeroCopy />
        <HeroMockup />
      </Container>
    </section>
  );
}
```

Source: padrão derivado de Phase 1 D-20 + Pitfall #10 (RSC boundary discipline) + Next.js App Router official docs. **[CITED: nextjs.org/docs/app — Server Components default]**

### Pattern 2: Single `<Image>` priority na página

**What:** Apenas o mockup principal usa `priority`. Logo é inline SVG (zero pricing optimizer + zero priority slot consumido). Micro-card icon é lucide-react SVG (idem).

**When to use:** Sempre. Regra do projeto (state invariant `STATE.md:101`) + HERO-04.

**Example:**

```tsx
// src/sections/Hero/HeroMockup.tsx
import Image from "next/image";

export function HeroMockup() {
  return (
    <div className="relative">
      {/* Aspect ratio reservado pra evitar CLS (PERF-03 preempção) */}
      <div className="relative aspect-[4/3] w-full max-w-[720px] overflow-hidden rounded-lg border border-border-on-dark-subtle shadow-2xl">
        <Image
          src="/mockups/atendimentos.webp"
          alt="Caixa de entrada multicanal Likro: atendimentos centralizados de WhatsApp e Instagram"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 60vw"
          quality={85}
          placeholder="empty"
        />
      </div>
      {/* Micro-card overlay — RSC, estático */}
      <HeroMicroCard className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6" />
    </div>
  );
}
```

**Source:** Next.js Image docs (`priority`, `fetchPriority`, `sizes`, `quality`, `fill`). **[CITED: nextjs.org/docs/app/api-reference/components/image]**

**Why no `placeholder="blur"`:** Blur placeholders gerados em build adicionam tempo de build e o blur base64 conta no HTML payload. Pra um mockup `priority` com tamanho razoável + AVIF/WebP, o paint é rápido o suficiente que blur fade-in fica visualmente competindo com a chegada da imagem real. **Recomendação: `placeholder="empty"`** (default) — confiança no AVIF/WebP servido. Se executor empiricamente medir flicker, pode adicionar blur depois.

### Pattern 3: Glow pulse via CSS keyframe (não Motion)

**What:** `HeroBackground.tsx` é RSC; declara um `<div>` com classe Tailwind + um `@keyframes` registrado em `globals.css` (ou inline via `<style>` no mesmo arquivo se preferir co-localização).

**Why CSS, não Motion:**
1. **RSC-compatible** — zero JS hydration cost.
2. **Reduced-motion já tratado globalmente** — `globals.css:93-102` aplica `animation-duration: 0.01ms !important` em todos os animations sob `prefers-reduced-motion`.
3. **`motion.div` direto em sections é proibido** (state invariant STATE.md:104).
4. **GPU-friendly** — anima `transform: scale()` + `opacity`. **[VERIFIED: globals.css linhas 67-68 expõem `--ease-premium-out`]**

**Example (inline approach):**

```tsx
// src/sections/Hero/HeroBackground.tsx — RSC
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Base gradient editorial */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-darker via-surface-dark to-surface-darker" />
      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "rgba(255,255,255,0.5)",
        }}
      />
      {/* Glow pulsante */}
      <div className="absolute right-[15%] top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-accent-glow blur-[120px] [animation:hero-glow-pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
      <style>{`
        @keyframes hero-glow-pulse {
          0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.55; }
          50% { transform: translateY(-50%) scale(1.05); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
```

**Tradeoff:** `<style>` embutido emite CSS no HTML — pequeno (~200 bytes). Alternativa: registrar `@keyframes hero-glow-pulse` em `globals.css` + classe utility custom. Executor decide; ambos são aceitáveis.

### Anti-Patterns to Avoid

- **`<motion.div>` no Hero** — proibido (state invariant). Quebra a regra "primitivas via barrel ou nada".
- **`<RevealOnView>` no h1, sub, CTA ou mockup** — HERO-02/03 vetam.
- **`priority` em mais de um `<Image>`** — quebra Next.js LCP heuristic.
- **`min-h-screen` ou `h-[100vh]`** — HERO-05 veta; usa `min-h-svh`.
- **Logo como `<Image>` com `priority`** — consumiria o slot do mockup; inline SVG vence.
- **Pre-load do AVIF via `<link rel="preload">` manual** — `next/image` com `priority` já adiciona o preload via `<link rel="preload" as="image" imagesrcset=...>` automaticamente em Next 15. Duplicar é wasteful. **[CITED: nextjs.org/docs/app/api-reference/components/image — "When `priority` is true, Next.js will automatically add a `preload` tag"]**
- **`window.open` em onClick ANTES de `track()`** — `WhatsAppCta` já implementa correto: `track()` antes do `window.open`. Não regredir.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WhatsApp URL construction | Custom string concat | `buildWhatsAppUrl()` | Já valida formato 12-13 dígitos, bloqueia `web.whatsapp.com`/`api.whatsapp.com`, encoda chars especiais (RFC 3986 manual encoding). |
| Analytics fan-out | `window.fbq` direto | `track()` from `@/lib/analytics` | Já adiciona `event_id` UUID v4 pra CAPI futuro + fan-out Pixel + GA4 + Clarity. |
| Image optimization | `<img src="...">` puro | `next/image` | AVIF/WebP automático, responsive `sizes`, lazy default, priority preload. |
| Font loading | `<link>` Google Fonts | `next/font/google` Inter | Self-host build-time, zero runtime request, `adjustFontFallback` zera CLS. Já wired (`layout.tsx:10-16`). |
| Smooth scroll | Scroll listener custom | `SmoothScrollProvider` (Lenis) | Já provisionado; Phase 3 não toca. |
| Reduced motion | `useState` + `matchMedia` boilerplate | `useReducedMotion()` from `motion/react` + `globals.css` global rule | Já tratado em dois níveis (provider + CSS). |
| Device tier detection | `window.innerWidth` listeners | `useDeviceTier()` from `@/hooks` | Já provisionado; usar APENAS se motion intensity diferir (Phase 3 não precisa). |
| H1 styles | Tailwind classes ad-hoc | `<Headline as="h1" size="hero">` | Já provisionado com classes calibradas. |
| CTA primary | Custom button | `<WhatsAppCta variant="primary" location="hero">` | Encapsula tracking + loading + open. |
| `viewport-fit=cover` + safe area | Manual `<meta>` + CSS | Next viewport export | Já em `layout.tsx:46-51`. |

**Key insight:** **Praticamente tudo já existe.** O risco da Phase 3 é construir paralelos ao invés de consumir.

---

## Runtime State Inventory

**Não aplicável.** Phase 3 não envolve rename/refactor/migração. É construção greenfield em cima de foundations existentes. Categorias:

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — Phase 3 não toca banco/store | — |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | `NEXT_PUBLIC_WA_NUMBER` — **NOVO valor a configurar** em `.env.local` + Vercel (Production + Preview + Development). Não é rename — é first-time set. | Configurar manualmente. Plan A da Phase 3. |
| Build artifacts | None — Phase 3 é build limpo | — |

---

## Common Pitfalls

### Pitfall A: Animação no LCP element (CRITICAL)

**What goes wrong:** Aplicar `opacity: 0 → 1` ou `translateY` ao node do mockup ou h1 **atrasa o momento em que o browser marca aquele elemento como Largest Contentful Paint pronto**. LCP medido sobe de ~1.8s pra 2.8-3.5s mid-range Android.

**Why it happens:** "Reveal feels premium" em dev rápido; nobody runs Lighthouse mobile com throttling até pre-launch; hero vira sacred cow.

**How to avoid:**
1. **H1, sub-headline, CTA, mockup, micro-card NÃO TÊM animação de entrada.** Renderizam estado final.
2. Glow é background-only, decorativo, posicionado atrás (`-z-10`), `aria-hidden`. Não é candidato a LCP.
3. **Browser determina o LCP automaticamente** — mas em geral será o `<Image>` priority do mockup OU o h1, dependendo de qual tem maior área renderizada. Ambos devem estar estáticos.

**Warning signs:**
- Lighthouse "Largest Contentful Paint element" no trace aponta pra node com `opacity: 0` no paint moment
- LCP > 2.5s em PageSpeed Insights mobile
- First scroll feels "delayed"

**Sources:** **[CITED: web.dev/lcp — "The browser does not consider the element rendered until it has reached its final styles, so any opacity animations delay LCP"]** + Pitfall #2 da `PITFALLS.md`. **[VERIFIED: PITFALLS.md linhas 43-67]**

**Precise boundary — what CAN animate:**
- ✅ Glow pulse atrás do mockup (camada decorativa, aria-hidden, não é candidato LCP)
- ✅ Hover/active states no CTA (não afeta LCP — interações pós-paint)
- ✅ Focus rings (idem)
- ❌ Sub-headline fade-up — mesmo que não seja o LCP element em si, atrasa TBT visual se a animação durar 600ms
- ❌ CTA "rise from bottom" — idem
- ❌ Mockup "fade-in after image loaded" — explicitamente proibido por HERO-02

**Confidence: HIGH.** [VERIFIED: web.dev LCP guidance is authoritative.]

### Pitfall B: Mais de um `<Image priority>` na página

**What goes wrong:** Next 15 emite `<link rel="preload" as="image">` pra cada imagem com `priority`. Browser não consegue priorizar duas imagens igualmente — a LCP heuristic se confunde, e o que devia ser o mockup acaba competindo com (ex) logo do header.

**How to avoid:**
- Logo do header = inline SVG ou `<img>` puro (sem next/image).
- Micro-card icon = lucide-react SVG inline.
- Apenas `HeroMockup`'s `<Image>` tem `priority` + `fetchPriority="high"`.
- **Auditável via:** grep `priority` em `src/sections/Hero/` e em todo `src/components/layout/` — deve ter exatamente 1 match.

**Warning signs:** Lighthouse aponta logo como LCP (erro); ou avisa "image was lazily loaded but should have been priority".

**Confidence: HIGH.** **[CITED: nextjs.org/docs/app/api-reference/components/image — "Should only be used when the image is visible above the fold"]**

### Pitfall C: `min-h-screen` no hero (iOS address-bar jump)

**What goes wrong:** `100vh` em iOS Safari calcula contra viewport com address bar **escondida** → hero é mais alto que área visível inicial → primeiro scroll colapsa a bar, layout reflowa, sticky/anchored elements pulam.

**How to avoid:**
- Use `min-h-svh` (small viewport height — sempre menor, sem jump).
- Alternativa: `min-h-dvh` (dynamic — atualiza conforme bar shows/hides; pode causar reflow mid-animation).
- **Recomendação: `min-h-svh`** pra hero (estável, sem jump). `dvh` é melhor pra elementos que devem se ajustar (não é o caso aqui).

**Browser support (2026-05):** Universal — Safari 15.4+, Chrome 108+, Firefox 101+. Mais de 4 anos no campo. **[VERIFIED: caniuse.com / MDN — small/large/dynamic viewport units universal as of 2024]** [CITED: developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths]

**Tailwind v4:** `min-h-svh`, `h-dvh`, `min-h-lvh` etc são utilities built-in. **[VERIFIED: Tailwind v4 docs + Phase 2 sticky-stage.tsx uses `${number}svh` template literal type]**

**Confidence: HIGH.**

### Pitfall D: Fonte Inter carregando após paint (FOIT/FOUT)

**What goes wrong:** Web font carrega 200-400ms; h1 renderiza com fallback; quando Inter chega, layout reflowa → CLS.

**How avoided:** `next/font/google` self-hospeda Inter em build time; `display: swap` + `adjustFontFallback: true` (já wired em `layout.tsx:10-16`). **[VERIFIED: layout.tsx + Pitfall research]**

**Confidence: HIGH — já resolvido em Phase 1.**

### Pitfall E: WhatsApp deep link abrindo browser em vez do app

**What goes wrong:** Devs usam `https://web.whatsapp.com/send?...` ou `https://api.whatsapp.com/send?...`. Em mobile, `web.whatsapp.com` abre WhatsApp Web em aba de browser — inútil no celular. `api.whatsapp.com` adiciona interstitial.

**How avoided:** `buildWhatsAppUrl()` força `https://wa.me/<phone>?text=<encoded>` e **bloqueia** `web.whatsapp.com`/`api.whatsapp.com` em qualquer input (lança Error em dev). **[VERIFIED: src/lib/whatsapp.ts linhas 12-13, 48-55]**

**Why `wa.me` works on app:**
- `wa.me/<phone>` é o "click-to-chat" oficial. **[CITED: faq.whatsapp.com/5913398998672934 — WhatsApp official "Using Click to Chat" guide]**
- Em iOS Safari + Android Chrome modernos: tap em `wa.me/...` → universal link / app link → abre **app WhatsApp diretamente** se instalado.
- Em iOS in-app browsers (Instagram, Meta Ads): tap em `wa.me/...` → na maioria dos casos abre WhatsApp app via universal link; **alguns IABs** (Instagram em iOS específicas versões) podem abrir embed wa.me web page com "Continue to chat" botão — daí o usuário tap mais uma vez. Não é falha, é UX subóptima do IAB. **[ASSUMED]** A2 — verificação real-device do CTA-04/HERO success criterion #4 é parte do checklist D-19.
- Em Android in-app browsers: idem; geralmente Universal Link funciona.
- Fallback: se WhatsApp não instalado, `wa.me` abre a página web `wa.me` com botão de download — comportamento aceitável (não é audience da clínica; D-13 não menciona).

**URL encoding rules para PT-BR + emoji + line breaks:**
- `encodeURIComponent("Oi! 👋")` produz `Oi!%20%F0%9F%91%8B` — correto.
- `\n` (line break) vira `%0A` — correto.
- `buildWhatsAppUrl` adicionalmente força encoding de `!*'()` (legacy RFC 2396 chars), produzindo `Oi%21%20...` (verificável em `src/lib/whatsapp.ts:19-24`).
- **WhatsApp app interpreta `%0A` como line break dentro da text box.** **[CITED: WhatsApp click-to-chat FAQ + multiple Brazilian dev blog posts]**

**`location` é query string OU tracking ping?**
- `<WhatsAppCta>` (já existente) dispara `track('whatsapp_click', {location})` **ANTES** do `window.open` (visto em `whatsapp-cta.tsx:48-50`). Isso é correto — analytics envia antes da navegação.
- `location` **NÃO** vira parte do URL `wa.me` — fica apenas no payload do analytics event.
- O `?text=...` da URL só carrega a mensagem pré-preenchida (PT-BR via `WHATSAPP_MESSAGES[location]`).
- Há um delay de 250ms entre tap e `window.open` no `<WhatsAppCta>` (visto em `whatsapp-cta.tsx:51`). Esse delay garante que o evento de analytics tenha tempo de ser enfileirado (não usa `sendBeacon`, mas `setTimeout(250)` é geralmente suficiente em practice).

**Recomendação:** **NÃO mudar** o componente. Está correto. Phase 3 apenas adiciona `"header"` à união do tipo `WhatsAppLocation`.

**Confidence: HIGH (technical) / MEDIUM-HIGH (IAB behavior across all in-app browsers — verificável só com real device).**

### Pitfall F: Hero deployado isoladamente que **não é representativo do produto final**

**What goes wrong:** Mede LCP com apenas o hero na página → número é melhor do que será em produção (sem peso das seções abaixo). Phase 4 adiciona seções, LCP regride pra > 2.5s, e ninguém percebe até Phase 7.

**How to avoid:**
- **Phase 3 mede LCP só do hero ISOLADO (gate baixo).** É um benchmark, não um proxy do número final.
- Phase 7 (PERF-01, PERF-02) mede LCP com landing completa — esse é o número de produção.
- **A medição da Phase 3 ainda é valiosa porque:** se LCP > 2.5s só com o hero, o resto do site não tem orçamento pra LCP. É um teto, não um chão. CONTEXT.md D-19 deixa isso explícito como manual checklist.

**Warning signs:** Phase 3 LCP "passou" mas Phase 7 falha. Re-medir hero isolado durante Phase 7 ajuda a isolar regressões.

**Confidence: HIGH (logical) / MEDIUM (empírico — depende de quanto seções adicionadas pesam).**

### Pitfall G: `priority` sem `sizes` correto = serve imagem maior que precisa

**What goes wrong:** `next/image` sem `sizes` declarado serve a imagem larger possível. Mobile baixa AVIF 1440px quando 360px bastaria.

**How to avoid:** `sizes="(max-width: 1024px) 100vw, 60vw"` é a regra correta pro layout split assimétrico (UI-SPEC.md). Mobile baixa imagem da largura do viewport; desktop baixa 60% da largura. **[VERIFIED: UI-SPEC.md image contract linha 228]**

**Confidence: HIGH.**

### Pitfall H: Hardcoded copy em JSX (silencioso)

**What goes wrong:** Plan executor inline-edita "Falar no WhatsApp" ou trust signal direto no JSX em vez de no `content/hero.ts`. Funciona, passa code review distraído, viola COPY-01.

**How to avoid:**
- **Auditável via grep** — Phase 3 deve adicionar uma verificação no checklist do plan final: `rg "\"[A-Z][a-zà-ú ]+clínica" src/sections/Hero/ src/components/layout/Header.tsx` deve retornar zero matches (toda string com "clínica" deve estar em content/).
- Mais geral: planner pode rodar `rg "\"[A-Z][a-zà-ú]{3,}" src/sections/Hero/` e auditar visualmente; toda string longa deveria vir de import.

**Confidence: HIGH.**

---

## Code Examples

### Common Operation 1: Hero composition (Server Component)

```tsx
// src/sections/Hero/index.tsx — RSC
import { Container } from "@/components/ui/container";
import { HeroCopy } from "./HeroCopy";
import { HeroMockup } from "./HeroMockup";
import { HeroBackground } from "./HeroBackground";

export function Hero() {
  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-surface-darker">
      <HeroBackground />
      <Container className="relative z-10 grid min-h-svh items-center gap-12 py-16 lg:grid-cols-[1fr_1.3fr] lg:py-24">
        <HeroCopy />
        <HeroMockup />
      </Container>
    </section>
  );
}
```

Source: Patterns from Phase 1 D-20 + Pitfall #10 prevention.

### Common Operation 2: Hero copy block (RSC, but contains client `<WhatsAppCta>` leaf)

```tsx
// src/sections/Hero/HeroCopy.tsx — RSC (children include a client island)
import { Headline } from "@/components/ui/headline";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

export function HeroCopy() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Headline
        as="h1"
        size="hero"
        className="text-text-on-dark-primary leading-[1.05]"
      >
        {HERO_COPY.h1}
      </Headline>
      <p className="max-w-xl text-xl text-text-on-dark-secondary sm:text-2xl">
        {HERO_COPY.sub}
      </p>
      <div className="flex flex-col gap-3">
        <WhatsAppCta variant="primary" location="hero" className="w-fit">
          {HERO_COPY.ctaLabel}
        </WhatsAppCta>
        <p className="text-sm text-text-on-dark-muted">{HERO_COPY.trust}</p>
      </div>
    </div>
  );
}
```

**Note:** `<WhatsAppCta>` already has `"use client"` directive. RSC parent can render it as a leaf — Next 15 handles the boundary.

### Common Operation 3: `content/hero.ts` module pattern

```ts
// src/content/hero.ts
/**
 * D-07: 3 variantes contrastantes — Lenny aprova UMA via PR.
 *
 * Convenção:
 *   - HERO_COPY_VARIANTS é o catálogo (não consumido em runtime)
 *   - HERO_COPY é o "ativo" — só este é importado por src/sections/Hero/*
 *   - Mudar o ativo = mudar a linha `export const HERO_COPY = HERO_COPY_VARIANTS.X`
 *   - Lenny aprova mudança no PR
 */

type HeroCopy = {
  h1: string;
  sub: string;
  ctaLabel: string;
  trust: string;
  microCard: {
    text: string;
    iconName: "Instagram" | "MessageSquare" | "BellRing";
  };
};

export const HERO_COPY_VARIANTS = {
  v1: {
    h1: "A operação da sua clínica, em um só lugar.",
    sub: "Lead do Instagram, conversa no WhatsApp, agendamento, retorno — sua clínica organizada em uma plataforma só.",
    ctaLabel: "Falar no WhatsApp",
    trust: "Operação ativa em clínicas reais hoje.",
    microCard: { text: "Novo lead pelo Instagram", iconName: "Instagram" },
  },
  v2: { /* ... */ } satisfies HeroCopy,
  v3: { /* ... */ } satisfies HeroCopy,
} as const satisfies Record<string, HeroCopy>;

// Lenny aprovará UMA — esta é a provisional ativa
export const HERO_COPY: HeroCopy = HERO_COPY_VARIANTS.v1;
```

**Why `satisfies` over explicit type:** preserva narrow string literal types pra TS autocomplete + checa shape em build. **[VERIFIED: TS 4.9+ idiom, working in TS 5.6]**

**i18n readiness:** Estrutura tipada acima funciona como base se i18n entrar em V2 — `HERO_COPY_VARIANTS` vira `HERO_COPY_VARIANTS_PT_BR`, e adiciona `HERO_COPY_VARIANTS_EN` paralelo. Por agora, **não introduzir layer de i18n** — overengineering.

### Common Operation 4: Adicionar `"header"` ao tipo `WhatsAppLocation`

```ts
// src/lib/whatsapp.ts — diff
export type WhatsAppLocation =
  | "hero"
  | "header"        // ← NOVO
  | "pain"
  | "product"
  | "how"
  | "proof"
  | "footer"
  | "floating";
```

Correspondingly em `src/content/whatsapp.ts`:

```ts
export const WHATSAPP_MESSAGES: Record<WhatsAppLocation, string> = {
  hero: "...",       // Phase 3 reescreve junto com copy
  header: "Oi! Vim do site da Likro.", // Phase 3 nova entrada — Lenny aprova
  // ... resto inalterado
};
```

**TS catches no caller** — adicionar à união força exhaustiveness check em qualquer `Record<WhatsAppLocation, ...>`. Build falha se entrada `header` ausente em `WHATSAPP_MESSAGES`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` (npm name) | `motion` (npm name), import `motion/react` | mid-2024 | Phase 1 já adopted; `package.json:21` confirma `motion@^12.38.0` |
| `100vh` no hero | `min-h-svh` / `min-h-dvh` | iOS 15.4+ (Mar 2022); universal 2024 | HERO-05 + Tailwind v4 utility classes built-in |
| `<link rel="preload" as="image">` manual | `next/image` `priority` (emite auto) | Next 13+ | Phase 3 consome — não duplicar |
| `Inter` via `<link href="fonts.googleapis.com">` | `next/font/google` self-hosted | Next 13.2+ | Já wired Phase 1 |
| Pages Router | App Router | Next 13+ | Já adopted (`src/app/`) |
| `getServerSideProps` / `getStaticProps` | Server Components + `fetch` | App Router | Não aplicável (hero é estático) |

**Deprecated/outdated:**
- `@studio-freight/lenis` / `@studio-freight/react-lenis` → use `lenis` + `lenis/react` (Phase 1 já correct).
- `framer-motion` package name → use `motion` (já correct).
- `next/image` `objectFit` prop → use Tailwind `object-cover` ou inline style (Next 13+).

---

## Isolated Vercel Deploy Strategy

**D-18 já travou a decisão:** simple flow — feature branch (ou main) com hero como única seção; PR final gera preview automático; Lighthouse mobile rodado contra `.vercel.app` antes da Phase 4 começar. **Sem feature flag, sem sub-projeto Vercel, sem branch deployment paralelo.**

Mecânica concreta:

1. Plans 3.A e 3.B mergeiam em branch ou main.
2. PR final do plano que fecha Phase 3 gera Vercel preview URL automaticamente (DEPLOY-02 já é feature padrão da Vercel — não precisa configuração).
3. Executor abre Lighthouse Chrome DevTools → Mobile preset → "Throttling: Slow 4G + 4x CPU slowdown" (ou usa lighthouse-cli) contra a preview URL. **NÃO localhost** — `next dev` é hot-reload e não reflete production bundle.
4. Roda também PageSpeed Insights (`pagespeed.web.dev`) contra a mesma URL — usa Chrome UX Report data se disponível, senão lab mode (igual ao Lighthouse).
5. Registra os scores em `03-VERIFICATION.md` conforme D-19 checklist:
   - Lighthouse Performance ≥ 85 (mobile)
   - LCP < 2.5s
   - CLS < 0.1
   - PageSpeed Insights URL + score
   - WhatsApp deep link iPhone real OK
   - WhatsApp deep link Android real OK
   - 5-second test ≥ 3 pessoas — quem, quando, descrições

**Por que NÃO usar feature flag / branch paralela / sub-projeto:**
- Feature flag adiciona complexidade de runtime + risco de "ligar uma seção em produção sem querer".
- Branch paralela duplica deploys e divide foco.
- Sub-projeto Vercel separado fragmenta env vars + analytics.
- **A landing tem 1 página** — gating não faz sentido. O hero **é** a página completa nesta fase.

**Confidence: HIGH** (decisão locked + flow standard Vercel).

---

## Lighthouse Mobile Config (manual, Phase 3)

| Setting | Value | Why |
|---------|-------|-----|
| URL | Vercel preview `.vercel.app` (NÃO localhost) | Production bundle, real network, real CDN |
| Form factor | Mobile | HERO-06 mede mobile |
| Throttling | "Simulated Slow 4G, 4x CPU slowdown" (Lighthouse default mobile) | Representa mid-tier Android |
| Throttling alternative | "Applied" (real network) — mais ruidoso, less reproduzível | Use Simulated pra comparabilidade |
| Categories | Performance + (opcional) Accessibility + Best Practices + SEO | Performance é o gate; outros são informativos |
| LCP threshold | < 2.5s ("good") | HERO-06 + PERF-02 |
| CLS threshold | < 0.1 ("good") | PERF-03 |
| INP / TBT | Informativo na Phase 3 (PERF-04 é Phase 7) | Hero tem ~zero JS interativo, TBT deve ser trivial |

**How to interpret LCP vs TBT vs CLS for this hero:**
- **LCP** mede paint do mockup ou h1 (o maior). Em ambos, target é "estado final imediato". Se LCP > 2.5s: revisar Image priority + sizes + animation no LCP node.
- **TBT** mede tempo bloqueado no main thread. Hero tem ~zero JS além de `<WhatsAppCta>` (250 bytes) + analytics scripts (carregam afterInteractive, fora do TBT crítico). TBT deve ser ~0-100ms.
- **CLS** mede shift visual. Risk: mockup sem aspect-ratio reservado → image swap causa shift. **Mitigação:** `aspect-[4/3]` wrapper já no exemplo. Hero font load CLS já tratado por `next/font` `adjustFontFallback`.

**Confidence: HIGH.**

---

## Copy Review Cadence

**D-17 já travou:** async via PR seção-a-seção. Phase 3 estabelece o ritmo. O "artifact" mencionado no goal de Phase 3 não é um arquivo PROCESS.md separado — **é o próprio padrão do PR description da Phase 3 + a estrutura de `src/content/hero.ts`**.

**Recomendação concreta para o plan final da Phase 3:**

1. **PR description template** — incluir bloco que vire convenção pras 5 seções narrativas (Phase 4):
   ```markdown
   ## Copy review — Hero

   **3 variantes em `src/content/hero.ts`:**
   - `v1` (ativa por default): {direção A}
   - `v2`: {direção B}
   - `v3`: {direção C}

   **Decisões a tomar:**
   - [ ] Aprovar uma variante (ou editar uma das três)
   - [ ] Aprovar texto do micro-card
   - [ ] Aprovar trust signal
   - [ ] Aprovar mensagem pré-preenchida `WHATSAPP_MESSAGES.hero`
   - [ ] Aprovar mensagem pré-preenchida `WHATSAPP_MESSAGES.header`

   **Como aprovar:** comentar `LGTM v2` (ou similar) ou empurrar commit ajustando a linha `export const HERO_COPY = HERO_COPY_VARIANTS.X`.
   ```
2. **Documento opcional:** `.planning/conventions/copy-review.md` (50-100 linhas) — descreve o padrão pras 5 seções narrativas. Planner decide se cria; mais leve não criar e deixar a Phase 3 PR ser o template canônico (git history serve como histórico).
3. **Anti-IA grep gate:** mesmo na Phase 3 (que só tem hero), o plan final inclui `rg "desbloque|potencia|transforme sua|próximo nível|solução inovadora|jornada do cliente|do início ao fim|feito para você" src/content/hero.ts` — deve retornar zero matches.

**Confidence: HIGH** (logística simples).

---

## `content/hero.ts` Content Module Pattern

**Já documentado em §Code Examples / Common Operation 3.** Resumo das decisões:

| Property | Recommendation | Why |
|----------|----------------|-----|
| Tipo central | `type HeroCopy = { h1, sub, ctaLabel, trust, microCard: {...} }` exportado | Permite que Header e outros consumam o type se precisarem |
| Container das variants | `HERO_COPY_VARIANTS = { v1, v2, v3 } as const satisfies Record<string, HeroCopy>` | TS strict shape check; literal types preservados |
| Ativo | `export const HERO_COPY: HeroCopy = HERO_COPY_VARIANTS.v1;` | Phase 3 inicia em `v1` (ou outra) — Lenny muda essa linha pra aprovar |
| i18n readiness | Não introduzir abstração extra agora | YAGNI; V2-I18N-01 (REQUIREMENTS.md) trata se necessário |
| Server consumption | RSC importa direto — zero runtime cost (tree-shaken) | TS module → JS const → inline no bundle do RSC |
| Non-dev edit ergonomics | Lenny edita string literais; TS valida shape em build | Build falha se Lenny deletar uma chave required |

**Confidence: HIGH.**

---

## 5-Second Test Plan

**Goal (HERO-07):** três pessoas sem contexto olham apenas a primeira viewport por 5 segundos e descrevem em 5 segundos o quê / pra quem / qual CTA.

**Pass criteria** (CONTEXT.md infere via "describem em 5 segundos que é Likro, que é para clínicas, e que o CTA é WhatsApp"):
1. **Que produto:** entrevistado menciona "plataforma", "operação", "atendimento", "CRM" ou termos equivalentes. Não precisa dizer "Likro" — precisa identificar a categoria.
2. **Pra quem:** entrevistado menciona "clínica" (ou "estética", "consultório"). Verticalização explícita.
3. **Qual CTA:** entrevistado menciona "WhatsApp" como ação principal.

**Logística sugerida** (Lenny escolhe, planner registra):

| Approach | Effort | Quality | Recomendado |
|----------|--------|---------|-------------|
| In-person (com 3 pessoas Lenny conhece — colega Insper, família, amigo dono de negócio) | Baixo | Alto — tom honesto, follow-up natural | **Yes — default** |
| Screen-share remoto (Zoom/Meet) com timer | Médio | Alto | Bom backup |
| Async (link da preview Vercel + Google Form com prompt) | Baixo | Médio — entrevistado pode "ler com calma" e não simular os 5s | Aceitável se in-person impossível |
| Service tipo Maze, UserTesting | Alto (cost + setup) | Alto | Overkill pra Phase 3 |

**Recomendação concreta:**
- Lenny manda link Vercel preview pra 3 pessoas via WhatsApp com prompt: *"olha esse site por 5 segundos (pode marcar no celular), feche, e me escreve em UMA frase: que produto é, pra quem é, e qual a ação principal."*
- Lenny copia as 3 respostas em `03-VERIFICATION.md` literalmente.
- Pass = ≥2 das 3 respostas acertam os 3 itens. Fail = 0 ou 1 acerto → re-evaluate hero copy/composition antes de Phase 4.

**Quando rodar:** após copy aprovada + Vercel preview verde. Pode rodar em paralelo com Lighthouse audit (não é gating sequencial).

**Confidence: MEDIUM** (a logística é simples; o risco é viés social — pessoa próxima ao Lenny pode "ajudar" e não dar feedback honesto. Mitigação: prompt explícito + ≥3 pessoas).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | dev + build | ✓ | (assumido — `package.json` engines não trava) | — |
| `npm` | install + scripts | ✓ | — | `pnpm` ou `yarn` (não recomendado mid-projeto) |
| Vercel CLI | optional — local `vercel env pull` | **[ASSUMED]** A3 — não verificado | — | Vercel dashboard manual |
| Chrome DevTools (Lighthouse) | Phase 3 gate D-19 | ✓ (assumindo Lenny tem Chrome) | — | `lighthouse-cli` via npm |
| Real iPhone | CTA-04 + HERO-06 + HERO-07 | **[ASSUMED]** A4 — Lenny provavelmente tem; não verificado | iOS 15.4+ esperado | BrowserStack / LambdaTest (paid) — last resort |
| Real Android | idem | **[ASSUMED]** A5 — não confirmado | Android 10+ esperado | BrowserStack — last resort |
| `tinypng` ou alternativa | Otimizar mockup PNG antes de servir | **[ASSUMED]** A6 — pode usar `next/image` automatic conversion sem tool externo se PNG não estiver grotescamente grande | — | `sharp` npm CLI (`npx sharp`) ou web tool |
| Imagens do produto | `../prints_funcionalidades/*.png` | ✓ — 50 prints verificados via Glob | — | — |
| Logo SVG | `public/logos/likro-logo.svg` | ✓ — já copiado em Phase 1 | — | `public/logos/likro-logo.png` fallback |
| Número WhatsApp | `5511922324329` | ✓ (D-16 forneceu) | — | — |
| Vercel deploy | Phase 3 gate | ✓ (assumindo projeto já conectado conforme DEPLOY-01) | — | Netlify (rejected — fora do stack) |

**Missing dependencies with no fallback:** Nenhum bloqueante. Real-device test é manual e depende de Lenny ter os devices — assumed yes baseado em CLAUDE.md mencionar "Windows 11 + provavelmente macOS/iOS pra testes" (não confirmado, mas é razoável).

**Missing dependencies with fallback:** `tinypng` (pode ser pulado se `next/image` AVIF/WebP servir blob aceitável; se o PNG original for > 1MB, executor deve otimizar antes de commitar em `public/mockups/`).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + `@testing-library/react` 16 + `@testing-library/jest-dom` 6.5 + `jsdom` 25 **[VERIFIED: package.json]** |
| Config file | `vitest.config.ts` (assumed — Phase 1 estabeleceu) |
| Quick run command | `npm test` (vitest run) |
| Watch run | `npm run test:watch` |
| Typecheck | `npm run typecheck` (tsc --noEmit) |
| Lint | `npm run lint` (next lint) |
| Phase gate command | `npm test && npm run typecheck && npm run lint && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Hero ocupa primeira tela; CTA acima da dobra | Manual (visual + viewport check) | — | ❌ Wave 0 not applicable (manual) |
| HERO-02 | H1 + mockup sem animação de entrada | Unit grep + manual | `rg "motion\." src/sections/Hero/` returns zero matches | ❌ Test ainda a ser escrito (lint-time grep) |
| HERO-03 | Apenas elementos secundários animam | Unit grep + manual visual | mesma | mesma |
| HERO-04 | Exatamente 1 `<Image priority>` na page | Unit grep | `rg "priority" src/` deve ter 1 match relevante (no HeroMockup) | ❌ |
| HERO-05 | `dvh`/`svh` (não `vh`) | Unit grep | `rg "min-h-\[100vh\]\|h-screen" src/sections/Hero/ src/components/layout/` returns zero | ❌ |
| HERO-06 | Lighthouse mobile LCP < 2.5s | Manual (D-19 checklist) | — | ❌ (manual) |
| HERO-07 | 5-second test | Manual (3 pessoas) | — | ❌ (manual) |
| COPY-01 | Toda copy em content/*.ts | Unit grep | `rg "\"[A-Z][a-zà-ú]{3,}.*clínica" src/sections/ src/components/layout/` returns zero | ❌ |
| COPY-04 | Lenny aprova copy via PR | Process (PR review trail) | — | ❌ (process gate) |
| CTA-04 | `NEXT_PUBLIC_WA_NUMBER` em env (build-time) | Unit + manual | Unit: `buildWhatsAppUrl` tests com env preset; Manual: deep link iPhone + Android | ✓ Phase 1 já tem `tests/whatsapp.test.ts` (assumed — confirmar) |
| WhatsAppLocation `"header"` added | Type union covers new value | Type-check | `tsc --noEmit` falha se `WHATSAPP_MESSAGES.header` faltar | — (TS é o test) |

### Sampling Rate

- **Per task commit:** `npm run typecheck && npm run lint` (rápido, < 30s).
- **Per wave merge:** `npm run typecheck && npm run lint && npm test && npm run build` (full pipeline; build catches Next.js-specific issues).
- **Phase gate:** Full suite green + Lighthouse mobile manual (D-19) + real-device manual (D-19) + 5-second test (D-19) + Lenny copy approval (D-17).

### Wave 0 Gaps

- [ ] `tests/sections/hero-spec.test.ts` — grep tests pra: zero `motion.` em sections/Hero, zero `vh` puro, zero strings PT-BR longas em JSX, exatamente 1 `priority` em todo `src/`. **Implementation:** node-puro fs.readdirSync + regex (mesmo padrão do Phase 1 `tests/brand-lock.test.ts` mencionado em `globals.css:18-19`).
- [ ] `tests/content/hero.test.ts` — schema/shape test pra `HERO_COPY_VARIANTS` (3 chaves; cada uma satisfies HeroCopy; "clínica" aparece em h1 E sub conforme D-09).
- [ ] `tests/lib/whatsapp.test.ts` — confirma que `"header"` é membro válido de `WhatsAppLocation` e que `WHATSAPP_MESSAGES.header` é não-vazio. **[ASSUMED]** A7 — Phase 1 já tem este teste; precisa adicionar caso para `header`.

*(If no gaps: "None — existing test infrastructure covers all phase requirements")* — gaps acima são pequenos e Phase 3-scoped. Planner deve adicionar como uma wave anterior ao plan que implementa o hero.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Hero não tem auth |
| V3 Session Management | no | Hero não tem session |
| V4 Access Control | no | Hero é página pública |
| V5 Input Validation | partial | Hero não tem inputs do usuário; mas `buildWhatsAppUrl` valida o phone format (server-time / build-time) — já implementado |
| V6 Cryptography | no | — |
| V7 Error Handling | yes | `<WhatsAppCta>` já implementa silent fail + analytics event de erro (visto em `whatsapp-cta.tsx:57-65`) |
| V14 Configuration | yes | `NEXT_PUBLIC_*` env vars são públicas por design — não vazam secret. Confirmado em `src/lib/env.ts:7-9` |

### Known Threat Patterns for {Next.js 15 + Vercel landing}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Click hijacking (iframe embed) | Tampering | Headers via `next.config.js` (`X-Frame-Options: DENY` ou `CSP frame-ancestors`) — Phase 7 (DEPLOY hardening) |
| XSS via copy hardcoded | Tampering | Copy vem de `content/*.ts` TS literals — não user-input. JSX escapa por default. Sem risco. |
| WhatsApp URL injection | Tampering | `buildWhatsAppUrl` bloqueia `web.whatsapp.com`/`api.whatsapp.com` em qualquer input + valida phone format. **[VERIFIED: src/lib/whatsapp.ts:12-78]** |
| Preview URL indexação Google | Information Disclosure | `robots.txt` retorna `Disallow: /` em preview env — Phase 7 (SEO-11). Phase 3 pode adicionar `<meta name="robots" content="noindex">` no preview se quiser (não é blocking). |
| Analytics IDs leak | Information Disclosure | `NEXT_PUBLIC_*` são públicos por design (Pixel/GA4/Clarity IDs são client-visible em qualquer site) — não é vulnerability. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `src/content/hero.ts` ainda não existe; Phase 3 cria | §Supporting libraries + §Code Examples | Baixo — se já existir, executor sobrescreve ou estende. Não bloqueia. |
| A2 | WhatsApp deep link `wa.me` funciona corretamente em iOS in-app browsers (Instagram, Meta Ads) — abre app na maioria; algumas versões podem mostrar página intermediária | §Pitfall E | **Médio** — real-device test (D-19) é a validação. Se IAB Instagram em iOS não abrir, plan precisa nota informativa (não é fixável; é comportamento do IAB). |
| A3 | Vercel CLI não obrigatório — Lenny pode configurar env vars no dashboard | §Environment Availability | Baixo |
| A4 | Lenny tem iPhone real pra testar CTA-04 | §Environment Availability | Médio — se não tem, BrowserStack ou usuário voluntário (Lenny pode falar com colega) |
| A5 | Lenny tem Android real ou acesso | §Environment Availability | Médio — idem A4 |
| A6 | `tinypng` ou similar não é obrigatório se PNG original ≤ 1MB; `next/image` cuida do resto | §Environment Availability | Baixo |
| A7 | Phase 1 já tem `tests/lib/whatsapp.test.ts` que precisa ser estendido para cobrir `"header"` | §Validation Architecture / Wave 0 Gaps | Baixo — se não existe, planner adiciona |
| A8 | `globals.css` linha 18-19 menciona `tests/brand-lock.test.ts` — assumido que existe da Phase 1; planner pode reusar padrão pra grep-tests da Phase 3 | §Validation Architecture | Baixo — se não existe, planner adiciona como precedent |

**Confirmar antes de planejar:**
- A4 e A5 (acesso real-device). Resolução: planner pode listar como "Lenny confirma na sessão de planning ou fornece alternative".

---

## Planning Implications

> Seção pré-digerida pra `gsd-planner`. Cada item abaixo é uma decisão concreta que o plano deve materializar.

### Plan decomposition recommendation

Phase 3 tem ~3 plans naturais. Mais que isso é inflação.

**Plan 3.A — Ambiente + helpers**
- Configurar `NEXT_PUBLIC_WA_NUMBER=5511922324329` em `.env.local` + 3 envs da Vercel (Production + Preview + Development)
- Atualizar `.env.example` com placeholder
- Adicionar `"header"` à união `WhatsAppLocation` em `src/lib/whatsapp.ts`
- Atualizar `WHATSAPP_MESSAGES` em `src/content/whatsapp.ts` com entrada `header` (placeholder)
- Estender `tests/lib/whatsapp.test.ts` (ou criar) cobrindo `"header"` location
- Otimizar 1 print do produto (escolha do executor em `../prints_funcionalidades/`) para `public/mockups/atendimentos.{webp|png}`
- Atualizar STATE.md removendo a pendência "Número WhatsApp pendente"

**Plan 3.B — Hero + Header components**
- Criar `src/components/layout/Header.tsx` (RSC) — logo SVG inline ou `<img>` simples, `<WhatsAppCta variant="secondary" location="header">`, altura 64/80px, container flex justify-between
- Criar pasta `src/sections/Hero/` com:
  - `index.tsx` (RSC, layout split, `min-h-svh`)
  - `HeroCopy.tsx` (RSC; importa `HERO_COPY`)
  - `HeroMockup.tsx` (RSC; `next/image` priority + sizes + fetchPriority="high")
  - `HeroMicroCard.tsx` (RSC; estático, lucide-react icon)
  - `HeroBackground.tsx` (RSC; CSS keyframe puro pro glow)
- Criar `src/content/hero.ts` com 3 variantes (Claude propõe; Lenny aprova no PR)
- Substituir `src/app/page.tsx` placeholder pelo `<Header /> + <Hero />`
- Adicionar grep tests em `tests/sections/hero-spec.test.ts` (zero `motion.`, zero `vh`, zero strings PT-BR em JSX de hero/header, exatamente 1 `priority`)
- Adicionar test de shape em `tests/content/hero.test.ts`

**Plan 3.C — Copy review + Vercel benchmark + checklist manual**
- Open PR do Plan 3.B com PR description template (§Copy Review Cadence)
- Lenny aprova/edita uma das 3 variantes via comentário ou commit; ajusta `WHATSAPP_MESSAGES.hero` e `.header`
- Após merge, rodar Lighthouse mobile contra Vercel preview URL
- Rodar PageSpeed Insights contra mesma URL
- Real-device test iPhone + Android (CTA opens app, location='hero' chega no analytics se IDs estiverem populated em Vercel env — opcional na Phase 3 já que TRACK-07 é Phase 6)
- 5-second test com 3 pessoas
- Registrar tudo em `03-VERIFICATION.md`
- Atualizar STATE.md (Phase 3 complete)

### Locked technical decisions for the planner

1. **Stack:** Já fixed. Não adicionar pacotes.
2. **Pasta nova:** `src/sections/Hero/` + `src/components/layout/` (criar ambas).
3. **RSC default:** Hero inteiro é RSC; client islands são apenas `<WhatsAppCta>` (que já é client) e `<Toaster>` (já wired). Glow é CSS puro — RSC.
4. **`min-h-svh`** pro hero (não `dvh`, não `vh`). Container interno também `min-h-svh` se split precisar centralizar.
5. **`grid-cols-1 lg:grid-cols-[1fr_1.3fr]`** pro split assimétrico (calibração final pelo executor entre 1.2 e 1.4).
6. **`next/image priority + fetchPriority="high" + sizes="(max-width: 1024px) 100vw, 60vw"`** pro mockup; nenhuma outra imagem com `priority`.
7. **Logo:** inline SVG ou `<img src="/logos/likro-logo.svg" alt="Likro">` — NÃO `next/image`.
8. **Micro-card icon:** lucide-react (`Instagram` | `MessageSquare` | `BellRing`) inline SVG.
9. **Glow:** CSS `@keyframes` no `globals.css` (preferido) ou inline `<style>` (aceitável) — animar `transform: scale()` + `opacity` only. Ciclo 8-12s, ease-in-out custom.
10. **Reduced motion:** já tratado globalmente pelo `globals.css:93-102`. Não adicionar hook React no glow.
11. **Copy:** `src/content/hero.ts` com 3 variantes `as const satisfies Record<string, HeroCopy>`. Export `HERO_COPY = HERO_COPY_VARIANTS.v1` como ativo provisional.
12. **WhatsApp location:** adicionar `"header"` à união do tipo + entrada em `WHATSAPP_MESSAGES`.
13. **Env config:** `NEXT_PUBLIC_WA_NUMBER=5511922324329` em 3 ambientes Vercel + `.env.local`.
14. **Tests:** grep tests (node-puro fs.readdirSync) + shape tests para `HERO_COPY`. Adicionar wave dedicada antes do hero component plan.
15. **Lighthouse gate:** manual, Chrome DevTools mobile preset Simulated Slow 4G + 4x CPU. Registrar em VERIFICATION.md.
16. **Real-device:** iPhone + Android; abrir app WhatsApp; mensagem pré-preenchida `WHATSAPP_MESSAGES.hero` correta.
17. **5-second test:** ≥3 pessoas; prompt explícito; ≥2 acertos dos 3 itens (produto, vertical, CTA) = pass.

### Risks the plan must mitigate

| Risk | Mitigation in plan |
|------|--------------------|
| LCP regressão por animação acidental no h1/mockup/micro-card | Grep test `rg "motion\." src/sections/Hero/` retorna 0 matches; explicit comment em cada sub-componente "Renders final state, no entrance animation" |
| Mais de 1 `<Image priority>` | Grep test em todo `src/` retorna exatamente 1 `priority` |
| `min-h-screen` ou `h-[100vh]` acidental | Grep test |
| Strings hard-coded em JSX (COPY-01 violation) | Grep test |
| `motion.div` direto em hero (state invariant violation) | Grep test (já listado) |
| WhatsApp deep link broken iPhone IAB Instagram | Real-device test D-19 + documentar fallback se IAB mostrar página intermediária |
| Copy "cara de IA" passing review | `rg "desbloque\|potencia\|transforme sua\|próximo nível\|solução inovadora\|jornada do cliente"` em `src/content/hero.ts` retorna 0 matches |
| Phase 4 inflando expectativa do hero | Esta fase termina **fechada** com VERIFICATION.md antes de Phase 4 começar; não overlap |

### Out of scope reminders

A Phase 3 NÃO entrega:
- Seções narrativas (Phase 4)
- Floating WhatsApp mobile (Phase 5)
- Header hide-on-scroll (Phase 5)
- Form consultivo (Phase 5)
- Validação sistêmica analytics nos 3 dashboards (Phase 6)
- Lighthouse CI gate / GitHub Actions (Phase 7)
- WCAG AA audit completo (Phase 7)
- OG image polish (Phase 7)
- Citação Dolce Home (Phase 4 conditional on autorização)

---

## Sources

### Primary (HIGH confidence)
- **`package.json`** (verificado via Read) — version pins: next 15.5.18, react 19, motion 12.38.0, lenis 1.3.23, tailwindcss 4.3.0, vitest 3.2.4
- **`src/lib/whatsapp.ts`** (verificado via Read) — confirma `buildWhatsAppUrl` API, type union atual, validações
- **`src/lib/analytics.ts`** (verificado via Read) — confirma `track()` API e fan-out
- **`src/components/ui/whatsapp-cta.tsx`** (verificado via Read) — confirma variants, tracking-before-open, 250ms delay
- **`src/app/layout.tsx`** (verificado via Read) — confirma provider tree + Inter via next/font
- **`src/app/globals.css`** (verificado via Read) — confirma `@theme` tokens + reduced-motion global rule
- **`.planning/phases/03-hero-benchmarked-isolado/03-CONTEXT.md`** + **`03-UI-SPEC.md`** — fonte de verdade pras decisões locked
- **`.planning/research/PITFALLS.md`** — pitfalls #1, #2, #3, #5, #7, #10 diretamente aplicáveis
- **`.planning/REQUIREMENTS.md`** — 10 requisitos da Phase 3 mapeados
- **`.planning/STATE.md`** — state invariants
- **`CLAUDE.md` (project)** — stack rationale + non-negotiables
- **`~/.claude/CLAUDE.md` (global)** — idioma + skills + Playwright MCP rule
- [nextjs.org/docs/app/api-reference/components/image](https://nextjs.org/docs/app/api-reference/components/image) — `priority`, `fetchPriority`, `sizes` semantics
- [web.dev/lcp](https://web.dev/lcp/) — LCP definition + animation interaction
- [WhatsApp official Click to Chat docs](https://faq.whatsapp.com/5913398998672934) — `wa.me/<phone>` format
- [Tailwind v4 viewport units docs](https://tailwindcss.com/docs/min-height) — `min-h-svh`/`dvh`/`lvh` utility classes

### Secondary (MEDIUM confidence)
- 5-second test methodology — generic UX research consensus
- iOS in-app browser behavior for `wa.me` — multi-source Brazilian dev community + Pitfall #5

### Tertiary (LOW confidence)
- None — Phase 3 territory está bem coberto por sources HIGH e MEDIUM.

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — verified via `package.json` + Phase 1 wiring + Phase 2 usage
- Architecture: HIGH — Phase 1 D-20 + Pitfall #10 patterns documentados e consistentes
- Pitfalls: HIGH — diretamente derivados de `.planning/research/PITFALLS.md` autorizado
- Copy module pattern: HIGH — TS idiom standard
- WhatsApp deep link (iOS IAB edge cases): MEDIUM-HIGH — real-device test é a validação final (D-19)
- 5-second test logistics: MEDIUM — depende de Lenny escolher logística
- Vercel preview Lighthouse numbers (empíricos): N/A — só o deploy real produz os números

**Research date:** 2026-05-16
**Valid until:** 2026-06-15 (~30 days — stack está estável, sem release breaking esperada em Next/Motion/Lenis nesse horizonte)
