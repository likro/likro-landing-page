# Stack Research

**Domain:** Premium scroll-cinematic B2B SaaS landing page (Brazilian clinics/aesthetics vertical)
**Researched:** 2026-05-15
**Confidence:** HIGH (core stack), MEDIUM (versions of fast-moving libs verified via WebSearch + official docs as of May 2026)

---

## TL;DR — Recommended Versions

```
next@^15.5         (App Router, stable, React 19 ready) — see "Next.js 15 vs 16" note below
react@^19.0
react-dom@^19.0
tailwindcss@^4.1   (v4 GA, Vite-aligned, microsecond rebuilds)
motion@^12.x       (formerly framer-motion — same package, new name; import from "motion/react")
lenis@^1.3.23      (darkroomengineering, current package, NOT @studio-freight)
@gsap/react@^2.x   (later — reserved for v1.5+, NOT installed in v1)
gsap@^3.x          (later — free incl. all plugins, NOT installed in v1)
```

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | `^15.5` | React framework with App Router, SSR/SSG, image/font optimization, metadata API, edge runtime on Vercel | Industry standard for Vercel-hosted marketing sites in 2026. App Router is mature; built-in primitives (`next/image`, `next/font`, `next/script`, Metadata API) directly solve every non-animation requirement in PROJECT.md (LCP, CLS, SEO, third-party scripts). Pin to **15.5** rather than 16 for v1 — see version compatibility section. **HIGH confidence.** |
| **React** | `^19.0` | UI runtime | Bundled with Next 15.5; required by current `motion` and stable for production. **HIGH confidence.** |
| **TypeScript** | `^5.6` | Type safety, DX | Non-negotiable for a premium codebase with multiple animation libraries, form schemas, and analytics event types. Next 15 has first-class TS support including typed routes. **HIGH confidence.** |
| **Tailwind CSS** | `^4.1` | Utility-first styling, design tokens, brand color system | v4 GA since Jan 2025, production-proven. Engine is ~5x faster on full builds, >100x faster on incremental — material for DX on a long single page with many sections. CSS-first config (`@theme` in `globals.css`) makes brand tokens (`#7C3AED`, `#6D28D9`, radii 10/12px) co-located with the stylesheet. Use `@tailwindcss/postcss` plugin (Next.js path) — Vite plugin is not relevant here. **HIGH confidence.** |
| **Motion (Framer Motion)** | `^12.x` | Declarative React animations, viewport-triggered reveals, `whileInView`, `useScroll`, `useTransform`, layout animations | The package was renamed from `framer-motion` to `motion` (still installable as `framer-motion` for backward compat). New imports: `import { motion } from "motion/react"`. Best-in-class for declarative section-level reveals and the kind of "fade up + slide" choreography that 80% of this landing needs. **HIGH confidence.** |
| **Lenis** | `^1.3.23` | Inertia-based smooth scroll, RAF-driven, exposes scroll progress for parallax | The de-facto standard smooth-scroll lib in 2026, used by Awwwards-tier agencies. Critical: use the current `lenis` package (NOT the deprecated `@studio-freight/react-lenis`). Provides `lenis/react` for the `<ReactLenis>` provider. Plays nicely with Framer Motion and (future) GSAP ScrollTrigger via a single `requestAnimationFrame` loop. **HIGH confidence.** |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **lucide-react** | `^0.460+` | Icon set | Universal — every icon need (CTA arrows, checkmarks, channel icons, kanban, etc.). 1500+ icons, ~1KB per icon with tree-shaking, pure SVG (RSC-safe). Aligns with the brand's clean/minimal aesthetic. |
| **react-hook-form** | `^7.x` | Form state for the consultative form at end of page | Single form ("prefere que a gente te procure?"). RHF gives best-in-class perf + uncontrolled inputs (matches Tailwind's preferred styling pattern). |
| **zod** | `^3.23+` | Shared client/server schema (name, phone, email, clinic size, message) | Use same schema in client (RHF resolver) and server action validation. |
| **@hookform/resolvers** | `^3.x` | Bridge RHF ↔ Zod | Required peer for RHF + Zod. |
| **clsx** | `^2.x` | Conditional className composition | Cleaner than template strings when toggling animation states. |
| **tailwind-merge** | `^2.x` | Dedupe Tailwind class conflicts when composing variants | Avoids `bg-white bg-purple-50` bugs in section variants. Pair with `clsx` via a `cn()` helper. |
| **schema-dts** | `^1.1+` | TypeScript types for JSON-LD Organization schema | Type-safe SEO structured data. Avoid hand-rolling JSON-LD as a `string`. |
| **server-only** | `^0.0.1` | Marks modules as server-only (e.g. server action handlers, webhook secrets) | Prevents env leaks from form action code. |

**Explicitly NOT installed in v1 (architecture is prepared for them):**

| Package | Reason Deferred |
|---------|-----------------|
| `gsap`, `@gsap/react` | Out of scope per PROJECT.md. Arquitetura preparada (componentes de animação isolados, `LenisProvider` no root) permite drop-in sem refactor. GSAP é 100% free since Webflow acquisition (Apr 2024), incluindo ScrollTrigger/SplitText/MorphSVG — so the historical "licença comercial" rationale in the PROJECT.md key decision is technically outdated, but the deferral still holds on "overhead/curva extra sem retorno proporcional na v1" grounds. |
| `@studio-freight/lenis`, `@studio-freight/react-lenis` | Deprecated. Studio Freight became Darkroom Engineering. Use `lenis` + `lenis/react`. |
| `react-icons` | Massive bundle, weaker tree-shaking story than Lucide. Lucide wins on bundle + RSC compat. |
| `theatre.js` | Overkill for this scope. Power-user timeline tool; we don't need keyframe-level orchestration. |
| `@react-three/fiber`, `three.js` | No 3D scenes planned. Adds 100KB+ for negligible gain. |
| `aos`, `wow.js`, `animate.css` | Legacy / non-React-idiomatic. Framer Motion `whileInView` replaces all of these. |
| `react-spring` | Excellent lib but redundant with Motion. Picking one (Motion) keeps the mental model consistent. |
| Any CMS SDK (Sanity, Contentful, Payload) | Out of scope per PROJECT.md. Copy is static. |
| State libs (Zustand, Jotai, Redux) | A single landing page has no global state worth modeling. Local `useState` + React Context for the Lenis instance is enough. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint** | Lint | Use `eslint-config-next` (ships with `create-next-app`). Add `eslint-plugin-tailwindcss` for class-order consistency. |
| **Prettier** | Format | With `prettier-plugin-tailwindcss` to auto-sort utility classes — non-negotiable for readable diff reviews on a long page. |
| **Turbopack** | Dev server (built into Next 15) | Already default for `next dev` since 15.0. Use it — webpack dev mode is slower. |
| **Vercel CLI** | Local preview, env management | `vercel env pull` for local `.env.local` parity with prod. |
| **@next/bundle-analyzer** | Pre-launch perf audit | Run before deploy to verify Lucide tree-shaking and animation bundle size. |
| **lighthouse / @lhci/cli** | Verify ≥90 desktop / ≥85 mobile gates from PROJECT.md | Run against Vercel preview URL in CI (GitHub Actions optional). |

---

## Installation

```bash
# Bootstrap (run once)
npx create-next-app@latest likro-landing --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

# Core animation + scroll
npm install motion lenis

# Forms
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install clsx tailwind-merge

# Icons
npm install lucide-react

# SEO types
npm install schema-dts

# Server-only guard
npm install server-only

# Dev tooling
npm install -D prettier prettier-plugin-tailwindcss eslint-plugin-tailwindcss @next/bundle-analyzer

# NOT INSTALLED in v1 (reserved for later phases):
# npm install gsap @gsap/react
```

---

## Animation Orchestration — The Critical Bit

This is the one non-obvious architecture decision and must be right from day one. The constraint from PROJECT.md: **"Arquitetura de animações modular: cada seção é um componente isolado, fácil de trocar/reorganizar; preparado para introduzir GSAP/ScrollTrigger em seções específicas no futuro sem refactor estrutural."**

### Recommended Pattern

**One scroll loop, three roles:**

1. **Lenis** — owns the *scroll position*. Single global instance via `<ReactLenis root>` in `app/layout.tsx` (mounted in a client `<Providers>` boundary). Drives the page-wide inertia.
2. **Framer Motion** — owns *declarative section animations* (fade-up reveals, staggered children, `whileInView` triggers, `useScroll` + `useTransform` for parallax on hero/mockups). Picks up Lenis-driven scroll naturally because Lenis updates the actual `window.scrollY` — no manual sync needed.
3. **GSAP/ScrollTrigger (future)** — owns *imperative scroll-driven timelines* (e.g. pin-and-scrub on the "como funciona" funnel section, layered feature reveals where Motion's declarative model gets clunky). When added later: register ScrollTrigger once in a client provider, sync its `update` to Lenis's RAF callback (`lenis.on('scroll', ScrollTrigger.update)`), and `gsap.ticker.lagSmoothing(0)`.

### Folder Structure

```
src/
  app/
    layout.tsx                  # Root layout, metadata, fonts, JSON-LD, Pixel
    page.tsx                    # Composes the 5-act narrative from sections/
    globals.css                 # @import "tailwindcss"; @theme tokens; reset
    robots.ts                   # robots.txt via Metadata API
    sitemap.ts                  # sitemap.xml via Metadata API
    opengraph-image.tsx         # Dynamic OG image (route convention)
    api/
      lead/route.ts             # POST endpoint for form (webhook to email/Slack)
  components/
    providers/
      LenisProvider.tsx         # "use client" — wraps <ReactLenis root>
      AnalyticsProvider.tsx     # "use client" — Pixel/GA4/Clarity init + route-change tracking
    sections/                   # Each = isolated, swappable, scroll-orchestrated
      Hero/
        index.tsx               # Server component shell
        HeroAnimation.tsx       # "use client" — Motion choreography
        HeroCopy.tsx            # Static copy (RSC)
      Pain/
      Solution/
      Product/
      HowItWorks/               # ← Likely first GSAP candidate (pin/scrub funnel)
      Proof/
      FinalCta/
      ConsultativeForm/
    ui/                         # Reusable atoms (Button, Card, Container)
    animations/
      FadeUp.tsx                # Motion primitive: <FadeUp delay={0.1}>
      StaggerChildren.tsx       # Container that staggers Motion children
      ParallaxLayer.tsx         # useScroll + useTransform wrapper
      ScrollTriggerScope.tsx    # PLACEHOLDER (no-op in v1, wires GSAP later)
  lib/
    analytics/
      pixel.ts                  # Meta Pixel event helpers
      ga4.ts                    # GA4 event helpers
      clarity.ts                # Clarity helpers
      events.ts                 # Typed event registry (single source of truth)
    seo/
      organization-jsonld.ts    # schema-dts typed Organization schema
      metadata.ts               # Reusable metadata builders
    forms/
      lead-schema.ts            # Zod schema (used client + server)
    utils/
      cn.ts                     # clsx + tailwind-merge helper
  styles/
    fonts.ts                    # next/font Inter config (exported variable)
public/
  prints/                       # ~50 product screenshots (already-optimized AVIF/WebP source)
  brand/                        # Logo SVGs
  favicon.ico, etc.
```

**Why this layout:**

- **Section isolation:** Each section is a folder with its own animation file. Swapping a section's animation library (Motion → GSAP) means editing files inside that folder only. No global refactor.
- **`animations/` primitives:** Most sections use the same 3-4 motion primitives (FadeUp, Stagger, Parallax). Centralizing them prevents copy-paste drift across 8+ sections.
- **`ScrollTriggerScope.tsx` placeholder:** A no-op component today that becomes the GSAP/ScrollTrigger boundary tomorrow. Section components import it from day one (`<ScrollTriggerScope>...</ScrollTriggerScope>`), so when GSAP arrives we modify *one file* and any wrapped section becomes ScrollTrigger-capable.
- **Providers nest in this order** (in `layout.tsx`'s client boundary): `AnalyticsProvider > LenisProvider > children`. Analytics outside Lenis so it doesn't re-render on scroll; Lenis at the top of the visual tree.

### Reduced-motion Handling

Wrap the whole tree in Motion's `<MotionConfig reducedMotion="user">` inside `LenisProvider`. This auto-disables transform/layout animations system-wide while preserving opacity. For Lenis, conditionally instantiate with `smoothWheel: false` when `prefers-reduced-motion: reduce` is set — Lenis still functions as native scroll but skips the inertia. PROJECT.md explicitly requires this gate.

---

## Form Handling Decision

**Pick: React Hook Form + Zod + Next.js Server Action**

**Rationale:**

- Single form, ~5-7 fields (nome, telefone/WhatsApp, email, tamanho da clínica, mensagem livre). Native HTML or controlled `useState` would technically work, but RHF + Zod gives us free: client validation, server validation (same schema), accessible error rendering, debounced re-renders.
- **Server Action** (not API route, not third-party form service) because:
  - Zero client JS for the submit handler itself (the network call is free).
  - Webhook delivery to email/Slack lives in `server-only` code — no key leak risk.
  - Matches PROJECT.md out-of-scope: "v1 entrega via webhook simples (email/Slack); integração nativa entra depois."
- The form is *progressive enhancement*: a plain `<form action={leadAction}>` works even without JS hydrated. Critical for the long-tail of slow Brazilian mobile networks (PROJECT.md: 80% mobile traffic from Meta Ads).
- **Pattern:** Form component is a client component (needs RHF). Server action exported from `app/actions/submit-lead.ts` with `"use server"`. Both client and server validate against the same `lead-schema.ts`.

**Rejected alternatives:**

- **Formspree / Getform / Web3Forms** — externalizes data, breaks the LGPD posture, adds an external dependency. Webhook to our own endpoint is trivially easy.
- **API route + `fetch`** — more boilerplate than Server Actions; no benefit on a single-page app.
- **`useActionState` only (no RHF)** — works, but losing RHF's UX (per-field validation, blur-triggered errors) for a premium form is a step down.

---

## Analytics Integration Pattern

Three trackers, one orchestrator. PROJECT.md is explicit: Meta Pixel + GA4 + Microsoft Clarity all mandatory v1.

### Loading Strategy

```tsx
// components/providers/AnalyticsProvider.tsx — "use client"
// In app/layout.tsx, wrap children in <AnalyticsProvider> inside the client boundary.

// 1. Meta Pixel — Script strategy="afterInteractive", inline init via dangerouslySetInnerHTML.
//    Initial PageView fires automatically on mount.
// 2. GA4 — Use the official `@next/third-parties/google` GoogleAnalytics component
//    (handles SPA navigations and `afterInteractive` correctly).
// 3. Microsoft Clarity — Script strategy="afterInteractive", inline init.
//    Optionally enable Clarity's "GA4 integration" toggle in the Clarity dashboard
//    so session recordings link back to GA4 sessions.
```

### Route-Change Tracking

On the App Router, this is a true single-page so the only "route change" is the consultative-form success state. Use `usePathname()` + `useSearchParams()` in an effect to refire `PageView` on any future internal navigation — but for v1 (one route) it's effectively a no-op. Just ensure the initial fire after hydration.

### Typed Event Registry

```ts
// lib/analytics/events.ts
export type LikroEvent =
  | { name: 'cta_whatsapp_click'; section: string }
  | { name: 'cta_form_submit'; clinic_size?: string }
  | { name: 'scroll_depth'; percent: 25 | 50 | 75 | 100 }
  | { name: 'section_view'; section: string };

export function track(event: LikroEvent) {
  pixelTrack(event);
  ga4Track(event);
  // Clarity custom tags via window.clarity('set', ...)
}
```

Single function, all three trackers fire. Saves us from forgetting one in a CTA handler buried in a section component.

### Env Variables (must be `NEXT_PUBLIC_*`)

```
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
LEAD_WEBHOOK_URL=         # server-only, no NEXT_PUBLIC_ prefix
RESEND_API_KEY=           # if using Resend for email; otherwise omit
```

---

## Image Strategy

**~50 product screenshots is the dominant asset class.** Strategy:

1. **All product prints stored in `public/prints/`** as source PNG (or pre-converted WebP). Use `next/image` for every render.
2. **next.config.ts:**
   ```ts
   images: {
     formats: ['image/avif', 'image/webp'],   // AVIF first (best compression), WebP fallback
     deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536, 1920],
     imageSizes: [16, 32, 64, 96, 128, 256, 384],
     minimumCacheTTL: 60 * 60 * 24 * 365,    // 1 year — these screenshots rarely change
   }
   ```
3. **Loading discipline:**
   - Hero mockup: `priority` + explicit `width`/`height` (LCP candidate).
   - All below-fold screenshots: default lazy + `placeholder="blur"` with `blurDataURL` (generate at build via a script, or use `plaiceholder`).
   - For very long sections with many screenshots (Product feature reveals), use `loading="lazy"` + intersection-based reveal so they don't all decode at once.
4. **Vercel image optimization cost note:** at 50 screenshots × N device sizes × 2 formats, Vercel image transformations can add up on Hobby/Pro plans. PROJECT.md targets Vercel, so this is fine — but if costs become an issue later, drop AVIF (keep WebP only) per Vercel's cost-mgmt guidance. Don't pre-optimize this away in v1.
5. **Brand SVGs (logos):** import as React components via SVGR or use plain `<Image>` with `unoptimized` (SVG bypasses the optimizer). Lucide handles icon SVGs natively.

---

## Font Strategy

```ts
// src/styles/fonts.ts
import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '600', '800'],   // 3 weights max per brand book
});
```

```tsx
// app/layout.tsx
<html lang="pt-BR" className={inter.variable}>
  <body className="font-sans">...</body>
</html>
```

```css
/* globals.css — Tailwind v4 */
@theme {
  --font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
}
```

**Why:**

- `next/font/google` self-hosts Inter at build time. Zero requests to Google's CDN at runtime. Eliminates the `connect-src fonts.googleapis.com` CSP entry and removes a network dependency that affects LCP.
- Inter is offered as a variable font but we limit to 3 weights to honor brand book + reduce bundle.
- `display: 'swap'` prevents FOIT, with `next/font`'s automatic size-adjust fallback eliminating CLS during font swap.
- `variable: '--font-inter'` lets Tailwind v4 reference the font via the `@theme` token cleanly.

---

## SEO / Metadata Plan

**Tools:** Next.js Metadata API + `schema-dts` for typed JSON-LD.

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://likro.com.br'),   // adjust on deploy
  title: { default: 'Likro — Plataforma de operação comercial para clínicas e estéticas', template: '%s | Likro' },
  description: '...',  // ≤160 chars, vertical-specific
  openGraph: { ... images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};
```

**JSON-LD Organization** rendered in `app/layout.tsx` as a `<script type="application/ld+json">` from a server component, typed via `schema-dts`:

```ts
import type { Organization, WithContext } from 'schema-dts';

const orgSchema: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Likro',
  url: 'https://likro.com.br',
  logo: 'https://likro.com.br/brand/logo.png',
  sameAs: ['https://instagram.com/...', ...],
};
```

**Plus:** `app/robots.ts`, `app/sitemap.ts`, `app/opengraph-image.tsx` (route conventions, no extra deps).

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | **Astro** | If 100% static content, near-zero interactivity, and Vercel wasn't a hard requirement. Astro has slightly better default Lighthouse scores for content sites, but the team's React/Next muscle, the future need for a CRM form integration, and the planned introduction of GSAP/ScrollTrigger (which has more mature React docs than Astro) make Next.js the right call. |
| Next.js | **SvelteKit / Nuxt** | If the team had Svelte/Vue expertise. They don't (per CLAUDE.md, all active projects are React/Next). Tool diversity here is pure cost. |
| Motion (Framer Motion) | **GSAP from day 1** | If v1 included pin-and-scrub storytelling, frame-by-frame scroll-scrubbed video, or complex SVG morphing. PROJECT.md scope (5 acts, fade/stagger/parallax reveals) is squarely Motion's sweet spot. GSAP earns its keep when you need a timeline. |
| Motion | **React Spring** | If physics-based interactions dominated (drag-and-throw, springy gestures). For declarative scroll reveals, Motion's API is more ergonomic and `whileInView` is unbeatable. |
| Lenis | **Locomotive Scroll v5** | Locomotive is now built on Lenis under the hood. Use Lenis directly. |
| Lenis | **Native CSS `scroll-behavior: smooth`** | For ultra-conservative perf budgets. Loses the inertia/easing that makes "cinematic" feel cinematic. Not aligned with the premium positioning. |
| Tailwind v4 | **Vanilla CSS / CSS Modules** | If the team preferred semantic class names and didn't mind slower iteration. Tailwind wins on velocity for a marketing site with many bespoke section layouts. |
| React Hook Form + Zod | **Conform + Zod** | Conform is excellent and progressive-enhancement-native. Worth considering if the form grew to multi-step. For a single contact form, RHF's ergonomics + RHF's market share (familiarity for any future contributor) wins. |
| Lucide | **Heroicons** | Smaller set, no obvious gap vs Lucide except aesthetic preference. Lucide has more icons and similar quality. |
| `next/image` | **Cloudinary / imgix / Cloudflare Images** | If Vercel image-optimization costs become prohibitive at high traffic. Premature for v1. |
| Server Action + email/Slack webhook | **Resend + transactional templates** | If the form needs richer email formatting. Trivial to add later — just swap the webhook handler. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@studio-freight/lenis` / `@studio-freight/react-lenis` | Deprecated namespace. Studio Freight became Darkroom Engineering. Tutorials older than late 2024 still reference these. | `lenis` (+ `lenis/react`) |
| `react-icons` | Bundles thousands of icons from 20+ sets. Tree-shaking helps but Lucide is leaner and better-maintained for the use case. | `lucide-react` |
| `aos`, `wow.js`, `animate.css`, `wow.css` | Pre-React-era. Class-toggle on-scroll libs. Don't integrate well with React lifecycles, can't share scroll loop with Lenis. | Motion's `whileInView` |
| `framer-motion` (the npm name) starting fresh | Package was renamed to `motion`. Still works if installed, but new installs should use `motion`. Tutorials older than mid-2024 use the old name. | `npm install motion` and `import { motion } from "motion/react"` |
| Tailwind v3 | v3 is now in maintenance mode. v4 has a faster engine, CSS-first config, and is what new tutorials target. Starting on v3 is a one-time migration cost down the road. | Tailwind v4 |
| Pages Router (`pages/` directory) | Deprecated for new projects. Metadata API, Server Actions, partial prerendering, and most 2026 docs assume App Router. | `app/` directory (App Router) |
| `getStaticProps` / `getServerSideProps` | Pages Router primitives. Don't exist in App Router. | Server components + `fetch` with caching directives |
| Inline `<script>` tags for analytics directly in `<head>` | Bypasses Next's loading strategy, can block hydration, harder to gate on consent later. | `next/script` with `strategy="afterInteractive"` |
| `dangerouslySetInnerHTML` for JSON-LD without `schema-dts` | Untyped, drift-prone, easy to ship broken schema. | `schema-dts` types + JSON.stringify |
| Theatre.js, react-three-fiber, three.js for v1 | Out of scope. Adds 100KB+ for capabilities the brief doesn't ask for. | Defer. Re-evaluate if a phase calls for true 3D. |
| External form services (Formspree, Getform) | Routes lead data through third parties. LGPD posture (PROJECT.md flags LGPD review for next milestone) is cleaner with first-party endpoint. | Server Action + webhook to email/Slack |
| `react-helmet` / `react-helmet-async` | Pages-Router era. Metadata API supersedes it entirely. | Next.js Metadata API |
| Animating background videos that autoplay on mobile | Crushes LCP on the 80% mobile traffic. Brand book also bans heavy gradient/visual noise. | Motion-driven CSS transforms + AVIF screenshots |

---

## Stack Patterns by Variant

**If introducing GSAP/ScrollTrigger (v1.5+):**
- `npm install gsap @gsap/react`
- In `LenisProvider`, register: `gsap.registerPlugin(ScrollTrigger)`; bridge: `lenis.on('scroll', ScrollTrigger.update)`; ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000)); gsap.ticker.lagSmoothing(0);`
- Use `useGSAP()` from `@gsap/react` inside section components for automatic cleanup.
- Why: single RAF loop, no jank between Lenis and ScrollTrigger.

**If LGPD cookie consent lands (next milestone):**
- Gate analytics initialization behind a consent state.
- Convert `AnalyticsProvider` to read consent from a `CookieConsentContext`. Pixel/GA4/Clarity scripts only mount after `accepted`.
- No deps required from a vendor banner — a simple in-house banner + `localStorage` is enough for a single-page LP.

**If a CMS becomes justified (later):**
- Sanity is the obvious pick for design-heavy marketing content + Next.js. Keep copy in a `lib/content/` module today so the migration is one-file-per-section.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.5` | `react@19`, `react-dom@19` | Bundled. Don't override React versions. |
| `next@15.5` | `tailwindcss@4.x` | Works via `@tailwindcss/postcss`. Follow Tailwind v4 install guide for Next, not the legacy v3 one. |
| `motion@12.x` | `react@18.3+`, `react@19` | No breaking changes in v12 for React users. New import path: `motion/react`. |
| `lenis@1.3.x` | Any React 18/19 | Import provider from `lenis/react`. Do NOT install `@studio-freight/*`. |
| `gsap@3.x` + `@gsap/react@2.x` | React 18/19, Next 15+ | When added later: `useGSAP()` hook requires `"use client"`. Free tier now includes ScrollTrigger, SplitText, MorphSVG, DrawSVG, etc. (Webflow acquisition, Apr 2024). |
| `react-hook-form@7.x` + `zod@3.23+` + `@hookform/resolvers@3.x` | Each other | Standard trio. Resolvers v3 supports Zod v3. |
| `@next/third-parties` | `next@15+` | Use the `GoogleAnalytics` component instead of hand-rolling GA4 script tags. |

### Next.js 15 vs 16 — Why 15.5 for v1

Next.js 16 went stable in late 2025 (bundling React 19.2, stable Turbopack for builds, Cache Components, file-system caching, React Compiler). It's an attractive upgrade, **but** for a 1-page conversion landing being built today:

- 15.5 has 6+ months of ecosystem battle-testing. Vercel-hosted, App Router, no exotic dependencies — every issue is already documented.
- 16's marquee features (Cache Components, RSC payload speedup, layout-once prefetching) target apps with many routes / heavy server data — minimal benefit on a single static-ish landing.
- React Compiler is interesting but optional, and Motion + Lenis interact with refs in ways the Compiler is still tuning around. Skipping the Compiler in v1 avoids a debugging vector.

**Recommendation:** Start on **Next 15.5**, plan to bump to 16 in a future milestone after the landing is live and stable. If the team has a strong preference for 16, it's safe — just expect a marginally rougher edge.

---

## Confidence Assessment

| Decision | Confidence | Source |
|----------|------------|--------|
| Next.js 15.5 (App Router, Vercel) | **HIGH** | Official Next.js docs (current as of May 2026), aligns with PROJECT.md mandate. |
| React 19 | **HIGH** | Bundled with Next 15.5; production-default since Q4 2024. |
| Tailwind CSS v4 | **HIGH** | GA since Jan 2025, official docs current. |
| Motion (formerly Framer Motion) v12, import `motion/react` | **HIGH** | Verified on motion.dev/changelog and motion.dev/docs/react-upgrade-guide May 2026. |
| Lenis v1.3.23, package `lenis` (not `@studio-freight/*`) | **HIGH** | npm + official Darkroom Engineering docs verified May 2026. Deprecation of `@studio-freight/*` confirmed multiple sources. |
| GSAP free including ScrollTrigger | **HIGH** | gsap.com/standard-license — Webflow acquisition Apr 2024. Note: PROJECT.md's "licença comercial" rationale for deferring GSAP is outdated; the cost argument is now zero, the complexity/curve argument still stands. |
| React Hook Form + Zod + Server Action pattern | **HIGH** | Pattern documented on nextjs.org, react-hook-form discussions, and multiple Q1-2026 articles. |
| Meta Pixel via `next/script afterInteractive` | **HIGH** | Pattern matches Next.js official scripts guide and Chrome for Developers script-component guidance. |
| `next/font/google` Inter with variable + 3 weights | **HIGH** | Official Next.js Font Optimization docs. Variable font self-hosted at build time. |
| Lucide-react over react-icons | **HIGH** | Bundle benchmarks and RSC compatibility well-documented in 2026 sources. |
| `next/image` AVIF+WebP, lazy + blur placeholders for 50 screenshots | **HIGH** | Official Vercel image optimization docs + cost mgmt guidance. |
| Animation orchestration pattern (Motion + Lenis today, GSAP-ready later) | **MEDIUM-HIGH** | Pattern composed from multiple Q1-Q2 2026 community guides (devdreaming.com, bridger.to, gsap.com forum). No single canonical "Likro pattern" exists — this is a synthesis. Validation will come at integration time. |
| `<ScrollTriggerScope>` placeholder pattern | **MEDIUM** | Architectural decision specific to this project. Sound reasoning, not a library-validated pattern. Worth revisiting at v1.5 if GSAP integration reveals friction. |

---

## Sources

- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) — App Router stability, typed routes, Turbopack compatibility — **HIGH**
- [Next.js 16 release notes](https://nextjs.org/blog/next-16) — context for why we defer to 15.5 — **HIGH**
- [Next.js Metadata API + OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) — **HIGH**
- [Next.js JSON-LD guide](https://nextjs.org/docs/app/guides/json-ld) — **HIGH**
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) — **HIGH**
- [Next.js Script component](https://nextjs.org/docs/app/api-reference/components/script) — **HIGH**
- [Next.js Forms guide (Server Actions)](https://nextjs.org/docs/app/guides/forms) — **HIGH**
- [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) — **HIGH**
- [Motion (Framer Motion) upgrade guide](https://motion.dev/docs/react-upgrade-guide) — rename + import paths — **HIGH**
- [Motion changelog](https://motion.dev/changelog) — current version verification — **HIGH**
- [Motion accessibility / useReducedMotion](https://motion.dev/docs/react-use-reduced-motion) — **HIGH**
- [Lenis GitHub (darkroomengineering)](https://github.com/darkroomengineering/lenis) — current package, deprecation of `@studio-freight/*` — **HIGH**
- [Lenis npm](https://www.npmjs.com/package/lenis) — v1.3.23 verified May 2026 — **HIGH**
- [GSAP React docs + useGSAP](https://gsap.com/resources/React/) — pattern for future GSAP introduction — **HIGH**
- [GSAP free license post-Webflow acquisition](https://gsap.com/standard-license) — **HIGH**
- [GSAP forum: synchronizing ScrollTrigger and Lenis in React/Next](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/) — orchestration pattern — **MEDIUM**
- [Lenis + GSAP Next.js guide (DevDreaming, 2026)](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — corroborates integration pattern — **MEDIUM**
- [How to implement Lenis in Next.js (Bridger Tower)](https://bridger.to/lenis-nextjs) — Lenis provider pattern — **MEDIUM**
- [Vercel Image Optimization docs](https://vercel.com/docs/image-optimization) + [cost management](https://vercel.com/docs/image-optimization/managing-image-optimization-costs) — **HIGH**
- [Lucide React guide](https://lucide.dev/guide/react) — **HIGH**
- [Lucide vs React Icons bundle benchmark, 2026](https://medium.com/codetodeploy/the-hidden-bundle-cost-of-react-icons-why-lucide-wins-in-2026-1ddb74c1a86c) — **MEDIUM**
- [React Hook Form + Zod + Next.js Server Actions (markus.oberlehner.net)](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) — **MEDIUM**
- [Microsoft Clarity in Next.js App Router (Medium, Dilhan Z.)](https://medium.com/@dilhanziriwardhana/how-to-install-microsoft-clarity-in-next-js-app-router-e9c696b6fada) — **MEDIUM**
- [Meta Pixel integration with Next.js App Router (3zerodigital)](https://www.3zerodigital.com/blog/integrating-meta-pixel-in-a-next-js-application-with-the-app-directory) — **MEDIUM**

---

*Stack research for: Premium scroll-cinematic B2B SaaS landing page (Likro — clínicas/estéticas vertical, Brazil)*
*Researched: 2026-05-15*
