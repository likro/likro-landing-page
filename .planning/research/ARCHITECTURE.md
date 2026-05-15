# Architecture Research

**Domain:** Premium scroll-cinematic landing page (Next.js App Router + Tailwind + Framer Motion + Lenis, GSAP-future-ready)
**Researched:** 2026-05-15
**Confidence:** HIGH (Framer Motion + Lenis + Next.js patterns are well-documented and battle-tested; mobile-adaptive choreography is MEDIUM confidence — domain convention more than codified standard)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  app/  (Next.js App Router — RSC by default)                        │
│  ┌────────────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │ layout.tsx     │  │ page.tsx             │  │ api/lead/route  │  │
│  │ fonts + meta + │  │ assembles sections   │  │ POST → webhook  │  │
│  │ analytics +    │  │ (server component)   │  │ (Slack/email)   │  │
│  │ <SmoothScroll> │  │                      │  │                 │  │
│  └───────┬────────┘  └──────────┬───────────┘  └─────────────────┘  │
│          │                      │                                    │
├──────────┴──────────────────────┴────────────────────────────────────┤
│  Client Shell  ('use client' islands)                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  <SmoothScrollProvider>  (Lenis singleton, RAF loop)        │    │
│  │  <MotionConfig reducedMotion="user">  (FM global)           │    │
│  │  <AnalyticsProvider>  (Pixel/GA4/Clarity event bus)         │    │
│  └─────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│  Sections  (sections/* — one file per narrative beat)               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Hero │ │ Pain │ │Bridge│ │Prod. │ │ How  │ │Proof │ │ CTA  │    │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘    │
│     │       │        │        │        │        │        │          │
├─────┴───────┴────────┴────────┴────────┴────────┴────────┴──────────┤
│  Animation Primitives  (components/motion/*)                         │
│  ┌────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐   │
│  │RevealOnView│ │ParallaxLayer │ │ ScrollScene  │ │StickyMockup │   │
│  └────────────┘ └──────────────┘ └──────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  Foundations                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐  │
│  │ content/ │ │  hooks/  │ │   lib/   │ │  public/   │ │ tokens/ │  │
│  │  copy +  │ │ scroll + │ │ analytics│ │ /images +  │ │ tailwind│  │
│  │manifests │ │ device   │ │ + webhook│ │  /logos    │ │ theme   │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `app/layout.tsx` | Root HTML shell, font loading, metadata, analytics scripts, smooth-scroll mount | Server Component; renders `<SmoothScrollProvider>` and `<MotionConfig>` as client children |
| `app/page.tsx` | Composes the page from section components in narrative order | Server Component; passes static content props down |
| `SmoothScrollProvider` | Owns the single Lenis instance, drives one RAF loop, exposes scroll state via context | Client Component; mounts once at root, never re-renders |
| `sections/*` | Each narrative beat (Hero, Pain, Bridge, Product, How, Proof, CTA, Footer) | Client island; receives content via props, owns its own scroll triggers |
| `components/motion/*` | Animation primitives — `RevealOnView`, `ParallaxLayer`, `ScrollScene`, `StickyStage`, `TextSplit` | Thin client components built on Framer Motion `useScroll` / `useTransform` |
| `components/ui/*` | Design-system primitives — `Button`, `Card`, `Container`, `Eyebrow`, `Headline` | Pure presentational, no animation |
| `content/*.ts` | Typed copy + image manifests per section | Plain TS objects, imported at build time, tree-shakeable |
| `hooks/*` | `useDeviceTier`, `useScrollProgress`, `useInView`, `useAnalyticsEvent` | Client hooks; no server logic |
| `lib/analytics.ts` | Single API: `track(event, payload)` fanning out to Pixel/GA4/Clarity | Client-only, dynamic imports for vendor SDKs |
| `lib/webhook.ts` | Form submission to webhook endpoint | Server (route handler) |
| `app/api/lead/route.ts` | Receives form POST, validates with Zod, forwards to webhook | Edge runtime preferred |

---

## Recommended Project Structure

```
landing_page/
├── app/
│   ├── layout.tsx                  # Root: fonts, metadata, providers, analytics
│   ├── page.tsx                    # Single landing page (RSC, composes sections)
│   ├── globals.css                 # Tailwind directives + base reset
│   ├── opengraph-image.tsx         # OG image generator
│   ├── sitemap.ts                  # Static sitemap
│   ├── robots.ts                   # Static robots
│   └── api/
│       └── lead/
│           └── route.ts            # POST → webhook (Slack/email)
│
├── sections/                       # ONE FILE = ONE NARRATIVE BEAT
│   ├── Hero/
│   │   ├── index.tsx               # Public export, choreography orchestration
│   │   ├── HeroMobile.tsx          # Mobile-specific layout/motion (if forked)
│   │   ├── HeroDesktop.tsx         # Desktop layout/motion (if forked)
│   │   └── content.ts              # Section-scoped copy (re-exported from content/)
│   ├── Pain/
│   ├── Bridge/                     # Transition Pain → Product
│   ├── Product/                    # Layered feature reveals
│   ├── HowItWorks/                 # Lead-journey storytelling
│   ├── Proof/
│   ├── CtaForm/                    # WhatsApp + consultative form
│   └── Footer/
│
├── components/
│   ├── motion/                     # Animation primitives (library, not pages)
│   │   ├── RevealOnView.tsx        # Fade/slide on enter viewport
│   │   ├── ParallaxLayer.tsx       # Y-translate driven by scroll progress
│   │   ├── ScrollScene.tsx         # Sticky container exposing 0→1 progress
│   │   ├── StickyStage.tsx         # Pin + scrub helper
│   │   ├── TextSplit.tsx           # Per-word/per-line reveal
│   │   └── MotionConfigShell.tsx   # Global MotionConfig wrapper
│   ├── ui/                         # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Container.tsx
│   │   ├── Eyebrow.tsx
│   │   ├── Headline.tsx
│   │   ├── Card.tsx
│   │   └── WhatsAppCta.tsx         # The hero conversion atom
│   ├── layout/
│   │   ├── Header.tsx              # Logo + WA CTA (sticky / hide-on-scroll)
│   │   └── ScrollProgress.tsx      # Optional top progress bar
│   ├── providers/
│   │   ├── SmoothScrollProvider.tsx
│   │   ├── AnalyticsProvider.tsx
│   │   └── MotionProvider.tsx
│   └── form/
│       ├── ConsultiveForm.tsx
│       └── fields/*
│
├── lib/
│   ├── analytics.ts                # track(event, payload) — fan out
│   ├── webhook.ts                  # Server-side webhook delivery
│   ├── validation.ts               # Zod schemas (form)
│   ├── images.ts                   # Image manifest helpers (sizes presets)
│   ├── utils.ts                    # cn() + small helpers
│   └── seo.ts                      # JSON-LD builders
│
├── hooks/
│   ├── useDeviceTier.ts            # 'mobile' | 'tablet' | 'desktop' | 'reduced'
│   ├── useScrollProgress.ts        # Wraps Framer Motion useScroll
│   ├── useInView.ts                # Wraps useInView with section defaults
│   ├── useAnalyticsEvent.ts        # Section-scoped event firing
│   └── useLenis.ts                 # Access Lenis instance from context
│
├── content/                        # ALL COPY + IMAGE MANIFESTS HERE
│   ├── hero.ts
│   ├── pain.ts
│   ├── product.ts
│   ├── how.ts
│   ├── proof.ts
│   ├── cta.ts
│   ├── meta.ts                     # SEO metadata
│   └── images.ts                   # Centralized image catalog with sizes
│
├── styles/
│   └── tokens.ts                   # Design tokens consumed by Tailwind config
│
├── public/
│   ├── images/
│   │   ├── product/                # The ~50 real screenshots
│   │   │   ├── atendimentos-01.webp
│   │   │   └── ...
│   │   ├── mockups/                # Device-framed composites
│   │   └── abstract/               # Tech illustrations (waves, glows)
│   ├── logos/
│   ├── fonts/                      # Self-hosted Inter (subset)
│   └── favicon, og-default.jpg, ...
│
├── tailwind.config.ts              # Imports tokens
├── next.config.ts                  # image domains, experimental flags
└── .planning/                      # GSD workspace (already exists)
```

### Structure Rationale

- **`sections/` is the unit of composition**, not `components/`. Each section is a black box: replaceable, swappable, reorderable. The roadmap maps 1:1 to section folders.
- **`components/motion/` is the animation library**. Sections compose primitives — they don't reinvent scroll math. This is the GSAP-swap boundary (see below).
- **`content/` is hard-typed TS, not MDX/CMS.** Decision logged in PROJECT.md: CMS is out of scope. TS gives autocomplete, refactor safety, and tree-shaking. Migration to CMS later is a one-shot rewrite of `content/*.ts` → CMS query.
- **`hooks/` are thin**. Heavy logic lives in `lib/` so hooks stay testable and re-mountable.
- **`app/` stays minimal** — one page, one API route, metadata. Resist the urge to put logic here.
- **Co-locate section variants** (`HeroMobile.tsx`, `HeroDesktop.tsx`) only when motion choreography diverges enough that conditional branches inside one file become unreadable. Default to single file with `useDeviceTier()` branches.

---

## Architectural Patterns

### Pattern 1: Single Lenis Instance, Single RAF Loop

**What:** Lenis runs once at the root via `<SmoothScrollProvider>`. It owns the only `requestAnimationFrame` loop on the page. Framer Motion's `useScroll` reads native scroll values, which Lenis updates synchronously — no second RAF, no fighting loops.

**When to use:** Always, for any project combining Lenis + Framer Motion. This is the load-bearing decision that prevents jitter.

**Trade-offs:** Slightly more boilerplate than the "drop Lenis in `useEffect`" pattern. Pays back immediately in zero scroll bugs.

**Example:**
```tsx
// components/providers/SmoothScrollProvider.tsx
'use client';
import Lenis from 'lenis';
import { createContext, useContext, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return; // honor OS setting — native scroll only
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // critical: never smooth touch on mobile
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
}
```

Framer Motion's `useScroll` works against native `window.scrollY`, which Lenis updates each frame. No `scrollerProxy`, no integration glue needed. (When GSAP/ScrollTrigger arrives later, that's when you'll wire `lenis.on('scroll', ScrollTrigger.update)` — out of scope for v1.)

### Pattern 2: ScrollScene — The GSAP-Future-Ready Choreography Boundary

**What:** A primitive that pins a section, exposes `progress: MotionValue<number>` from 0 to 1, and lets children consume it. Internally implemented with Framer Motion `useScroll({ offset: ['start start', 'end end'] })`. When/if GSAP arrives, the *interface stays identical* — only the internals change.

**When to use:** Every section that needs scroll-scrubbed animation (Bridge, Product, HowItWorks). Avoid for simple reveal-on-enter (use `RevealOnView`).

**Trade-offs:** Adds one abstraction layer; pays back as the swap boundary for future GSAP injection.

**Example:**
```tsx
// components/motion/ScrollScene.tsx
'use client';
import { motion, useScroll, MotionValue } from 'framer-motion';
import { useRef, createContext, useContext } from 'react';

const SceneContext = createContext<MotionValue<number> | null>(null);
export const useSceneProgress = () => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useSceneProgress must be inside <ScrollScene>');
  return ctx;
};

export function ScrollScene({
  children,
  heightVh = 300,           // total scroll distance — controls scrub feel
  className = '',
}: {
  children: React.ReactNode;
  heightVh?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={ref} style={{ height: `${heightVh}vh` }} className={className}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <SceneContext.Provider value={scrollYProgress}>
          {children}
        </SceneContext.Provider>
      </div>
    </section>
  );
}

// Consumer
function ProductMockup() {
  const progress = useSceneProgress();
  const scale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 1.1]);
  const opacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return <motion.img style={{ scale, opacity }} src="..." />;
}
```

**GSAP swap path:** Replace `ScrollScene` internals to drive a `MotionValue` from GSAP ScrollTrigger via `motionValue.set(progress)`. Consumer components don't change. This is the contract — *children only ever consume a `MotionValue<number>`*.

### Pattern 3: Device-Tier Adaptive Choreography

**What:** A single `useDeviceTier()` hook returns `'reduced' | 'mobile' | 'tablet' | 'desktop'`. Sections branch motion choreography on tier — not by writing separate components per breakpoint, but by selecting motion configs.

**When to use:** Any section where motion intensity must differ across devices (i.e. all of them, per PROJECT.md's mobile-first premium parity rule).

**Trade-offs:** More config objects, less duplication. Far easier to reason about than CSS-only responsive motion.

**Example:**
```tsx
// hooks/useDeviceTier.ts
'use client';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type DeviceTier = 'reduced' | 'mobile' | 'tablet' | 'desktop';

export function useDeviceTier(): DeviceTier {
  const reduced = useReducedMotion();
  const [tier, setTier] = useState<DeviceTier>('desktop');

  useEffect(() => {
    if (reduced) { setTier('reduced'); return; }
    const mql = (q: string) => window.matchMedia(q);
    const compute = () => {
      if (mql('(max-width: 639px)').matches) return 'mobile';
      if (mql('(max-width: 1023px)').matches) return 'tablet';
      return 'desktop';
    };
    setTier(compute());
    const onResize = () => setTier(compute());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [reduced]);

  return tier;
}

// Section usage — choreography config per tier
const HERO_MOTION = {
  reduced: { y: 0, duration: 0,    parallax: 0 },
  mobile:  { y: 20, duration: 0.6, parallax: 0.1 },
  tablet:  { y: 40, duration: 0.8, parallax: 0.2 },
  desktop: { y: 60, duration: 1.0, parallax: 0.35 },
} as const;

function Hero() {
  const tier = useDeviceTier();
  const cfg = HERO_MOTION[tier];
  // ...consume cfg in motion props
}
```

### Pattern 4: Lazy Section Hydration via `next/dynamic` + Intersection Observer

**What:** Hero ships in the initial bundle (LCP). Every section below the fold is `dynamic()`-imported with `ssr: true` (for SEO) but renders a lightweight skeleton; the *heavy* motion children inside hydrate when the section's `IntersectionObserver` fires.

**When to use:** Each section after Hero. Heaviest savings on Product (~10-15 screenshots) and HowItWorks.

**Trade-offs:** Slightly delayed motion on fast-scrollers, but only by a few hundred ms; LCP/INP wins dwarf the cost.

**Example:**
```tsx
// app/page.tsx
import Hero from '@/sections/Hero';            // eager — LCP
import dynamic from 'next/dynamic';

const Pain    = dynamic(() => import('@/sections/Pain'),    { ssr: true });
const Bridge  = dynamic(() => import('@/sections/Bridge'),  { ssr: true });
const Product = dynamic(() => import('@/sections/Product'), { ssr: true });
const How     = dynamic(() => import('@/sections/HowItWorks'), { ssr: true });
const Proof   = dynamic(() => import('@/sections/Proof'),   { ssr: true });
const CtaForm = dynamic(() => import('@/sections/CtaForm'), { ssr: true });
const Footer  = dynamic(() => import('@/sections/Footer'),  { ssr: true });

export default function Home() {
  return (<>
    <Hero />
    <Pain /><Bridge /><Product /><How /><Proof /><CtaForm /><Footer />
  </>);
}
```

Then inside heavy sections, gate the *motion runtime* on visibility:
```tsx
// sections/Product/index.tsx
'use client';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Product() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '20% 0px' });
  return (
    <section ref={ref}>
      {inView ? <ProductScrollScene /> : <ProductStatic />}
    </section>
  );
}
```

### Pattern 5: Image Manifest with Per-Asset `sizes` Presets

**What:** All ~50 screenshots are registered in `content/images.ts` with `sizes` strings tuned to their layout role (full-bleed, half-column, card-grid, device-frame). Sections import from the manifest, not raw paths. One source of truth for image presentation.

**When to use:** Mockup-heavy storytelling like this one. Without this, you'll set `sizes` wrong on 20% of images and tank mobile LCP.

**Example:**
```ts
// content/images.ts
export const PRODUCT_IMAGES = {
  inboxHero: {
    src: '/images/product/atendimentos-inbox.webp',
    width: 2880,
    height: 1800,
    alt: 'Caixa de entrada multicanal Likro com conversas ativas',
    sizes: '(max-width: 640px) 92vw, (max-width: 1024px) 80vw, 1100px',
    priority: false,
  },
  heroDevice: {
    src: '/images/mockups/hero-device.webp',
    width: 2400,
    height: 1600,
    alt: 'Dashboard Likro em um notebook',
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px',
    priority: true,           // LCP candidate — exactly one image gets this
  },
  // ... ~48 more
} as const;

// usage
import Image from 'next/image';
import { PRODUCT_IMAGES } from '@/content/images';

<Image {...PRODUCT_IMAGES.inboxHero} />
```

### Pattern 6: Analytics Event Bus

**What:** A single `track(event, payload)` API in `lib/analytics.ts` fans out to all three vendors. Components never touch `window.fbq` / `window.gtag` / `window.clarity` directly. Vendor SDKs load via `<Script strategy="afterInteractive">` in `layout.tsx`; the bus checks `typeof window !== 'undefined'` and silently no-ops if a vendor isn't ready yet.

**When to use:** Always — single landing or full app. Three direct integrations always rot into inconsistent payloads.

**Example:**
```ts
// lib/analytics.ts
type EventName =
  | 'cta_whatsapp_click'
  | 'cta_form_click'
  | 'form_submitted'
  | 'section_view'
  | 'scroll_depth';

export function track(event: EventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  // GA4
  window.gtag?.('event', event, payload);
  // Meta Pixel — map to standard events where applicable
  if (event === 'cta_whatsapp_click') window.fbq?.('track', 'Contact', payload);
  if (event === 'form_submitted')    window.fbq?.('track', 'Lead', payload);
  // Clarity custom events
  window.clarity?.('event', event);
}
```

```tsx
// app/layout.tsx (script mount excerpt)
<Script id="ga4" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
<Script id="ga4-init" strategy="afterInteractive">{`
  window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
  window.gtag=gtag; gtag('js',new Date()); gtag('config','${GA_ID}',{send_page_view:true});
`}</Script>
<Script id="meta-pixel" strategy="afterInteractive">{/* fbq init */}</Script>
<Script id="clarity" strategy="afterInteractive">{/* clarity init */}</Script>
```

`afterInteractive` is the right default for marketing analytics — `lazyOnload` saves INP but risks losing early-bounce events on Meta Ads traffic where users decide in <2s.

### Pattern 7: Form Webhook with Edge Route Handler

**What:** Client form posts to `/api/lead`; route handler validates with Zod and forwards to a webhook (Slack/Make/n8n/email). No DB, no ORM — the receiving system owns persistence.

**Example:**
```ts
// app/api/lead/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const Lead = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  clinic: z.string().min(2),
  size: z.enum(['1-4', '5-10', '11-20', '20+']),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const data = Lead.safeParse(await req.json());
  if (!data.success) return NextResponse.json({ ok: false, errors: data.error.flatten() }, { status: 400 });

  const r = await fetch(process.env.LEAD_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data.data, source: 'landing', ts: Date.now() }),
  });
  if (!r.ok) return NextResponse.json({ ok: false }, { status: 502 });
  return NextResponse.json({ ok: true });
}
```

---

## Data Flow

### Render / Content Flow

```
content/*.ts (typed TS)
    ↓ (import at build)
sections/*/index.tsx (server-renders structural HTML w/ copy)
    ↓ (hydrate islands)
'use client' motion children (consume MotionValues / device tier)
    ↓
DOM ← Framer Motion ← <SmoothScrollProvider> ← Lenis (one RAF)
```

### User Interaction Flow

```
user click WhatsApp CTA
    ↓
<WhatsAppCta onClick> → track('cta_whatsapp_click', { location })
    ↓ (analytics fan-out)
    ├→ GA4   (gtag event)
    ├→ Pixel (fbq Contact)
    └→ Clarity (custom event)
    ↓
window.location = wa.me/...   ← deep link last, so events fire first
```

### Form Submission Flow

```
ConsultiveForm (client)
    ↓ validate (Zod, client-side)
fetch POST /api/lead
    ↓
app/api/lead/route.ts (edge) → Zod parse → fetch(WEBHOOK_URL)
    ↓
  Slack / email / n8n
    ↓ (response)
client UI → success state + track('form_submitted')
```

### Scroll Choreography Flow

```
user scroll
    ↓
Lenis (single RAF) → window.scrollY updates
    ↓
Framer Motion useScroll → scrollYProgress (MotionValue 0→1 per <ScrollScene>)
    ↓
useTransform → derived MotionValues (scale, opacity, y, …)
    ↓
<motion.img style={{ scale, opacity }} />   (no re-renders — GPU transforms)
```

### Key Data Flows

1. **Static copy:** `content/*.ts` → section props (build-time, zero runtime cost).
2. **Image catalog:** `content/images.ts` → `<Image>` props (centralized `sizes`/`alt`/`priority`).
3. **Scroll progress:** Lenis → window scroll → Framer Motion `useScroll` → `<ScrollScene>` MotionValue → consumers.
4. **Analytics:** Component → `track()` → vendor SDKs (parallel, fire-and-forget).
5. **Lead:** Client form → `/api/lead` → external webhook.

---

## Performance Strategy

Concrete, not "optimize images." Each rule maps to a Lighthouse/CWV lever.

### Bundle / JS

- **One `'use client'` boundary per section**, not per leaf. Reduces client manifest size and avoids hydration cascades.
- **Lazy-import every section after Hero** with `next/dynamic({ ssr: true })`. Static markup ships in HTML for SEO; JS is split per section.
- **Hydrate motion runtime on `useInView`**, gated with `margin: '20% 0px'` so it's ready by the time the section is on screen.
- **Tree-shake Framer Motion**: import only `motion`, `useScroll`, `useTransform`, `useInView`, `useReducedMotion`, `MotionConfig`. Avoid the `LayoutGroup`/`AnimatePresence` import unless used.
- **Self-host Inter** via `next/font/local` with `display: swap` + preload only the 1-2 weights used above the fold; lazy-load the third.

### LCP < 2.5s

- Hero copy + Hero CTA + Hero device image all server-render in the initial HTML.
- **Exactly one image** gets `priority` — the Hero device mockup. Multiple priorities = preload spam = slower LCP.
- Above-the-fold Hero uses no `dynamic()` import.
- Avoid client-only state on initial hero copy (no skeleton flash).

### CLS < 0.1

- Every `<Image>` has explicit `width`/`height`.
- Sections that swap content based on `useInView` reserve their final height via `min-h-screen` or fixed `vh` heights — never `auto` for sticky/scrub stages.
- Web fonts: `display: swap` + matched fallback metrics (`adjustFontFallback` in `next/font`).

### Animation perf

- **GPU-friendly transforms only**: `transform` (translate/scale/rotate) + `opacity`. Never animate `width`, `height`, `top`, `left`, `background-color` on scroll. Use `filter: blur()` sparingly and only on small elements.
- `will-change: transform` only on actively-animating elements; remove when idle (Framer Motion handles this when you use `motion.*`).
- `pointer-events: none` on parallax decoration layers.
- **Suspend off-screen animation runtimes** via `useInView` gating (Pattern 4). Animations running off-screen waste main thread.
- Lenis: `smoothTouch: false` always. Smoothed touch on mobile feels sluggish and burns battery.

### Image strategy

- WebP for all screenshots (compress at 80–85 quality); AVIF auto-served by Next/Image where supported.
- **Right `sizes` per layout role** (Pattern 5). Wrong `sizes` is the #1 silent mobile-LCP killer.
- For the ~50 product screenshots, target ≤200KB each at 2x; consolidate near-duplicates (the manifest review will reveal these).
- Below-the-fold images: default `loading="lazy"` (Next/Image's default), `fetchPriority="auto"`.

### Third-party scripts

- All three analytics: `<Script strategy="afterInteractive">` (Pixel/GA4/Clarity).
- Don't use GTM as a wrapper unless required — it adds a script-loading-scripts layer that costs INP.
- Consider `@next/third-parties` package for GA4 if it lands stable on your Next version.

---

## Mobile vs Desktop Adaptive Strategy

Single source of truth: `useDeviceTier()` (Pattern 3). Branching rules:

| Concern | Mobile (≤640) | Tablet (≤1023) | Desktop (≥1024) | Reduced |
|---------|---------------|-----------------|------------------|---------|
| Scroll smoothing (Lenis) | OFF (native) | ON (lighter) | ON | OFF |
| Parallax depth | 0–10% | 15–25% | 25–40% | 0 |
| Sticky/scrub sections | Replace with sequenced reveal | Light scrub | Full scrub | Static |
| Text per-word reveal | Per-line only | Per-line | Per-word | None |
| Heavy decoration layers | Hidden | 1 layer | 2–3 layers | Hidden |
| Mockup transformations | scale only | scale + opacity | scale + opacity + rotate | Static |

**Implementation rule:** Don't fork `HeroMobile.tsx` / `HeroDesktop.tsx` unless the *layout* differs (different DOM structure). Same component, different motion configs via `useDeviceTier()`. Fork the file only when conditional spaghetti exceeds ~3 branches in one component.

---

## Analytics Integration

### Mount point

- All three scripts in `app/layout.tsx` with `<Script strategy="afterInteractive">`.
- Each gets a public env var for ID (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_CLARITY_ID`).
- Skip mounting if env var missing (preview deploys, local dev).

### Event abstraction

- `lib/analytics.ts` exports a single `track()` (Pattern 6).
- `useAnalyticsEvent()` hook for component-side convenience + dedup (e.g. only fire `section_view` once per session per section).

### Events to instrument (v1)

| Event | Trigger | Vendors | Payload |
|-------|---------|---------|---------|
| `cta_whatsapp_click` | Any WhatsApp button | GA4 + Pixel `Contact` + Clarity | `{ location: 'hero'|'sticky'|'product'|'cta' }` |
| `cta_form_focus` | Form first interaction | GA4 + Clarity | `{ field }` |
| `form_submitted` | Successful 200 from `/api/lead` | GA4 + Pixel `Lead` + Clarity | `{ clinic_size }` |
| `section_view` | `useInView` fires (once/section) | GA4 + Clarity | `{ section }` |
| `scroll_depth` | 25 / 50 / 75 / 100% | GA4 + Clarity | `{ percent }` |

### Route change considerations

Single-page landing → no SPA route changes in v1. `gtag config send_page_view:true` on initial load is sufficient. (When future routes appear, wrap in `usePathname()` effect.)

---

## Form Handling

- **Client-side validation:** Zod schema shared between `lib/validation.ts` (client) and `app/api/lead/route.ts` (server). Single schema, two consumers.
- **Submission:** `fetch('/api/lead', { method: 'POST' })` from `ConsultiveForm.tsx`. No third-party form library required (react-hook-form is optional; for ~6 fields, `useState` + Zod is enough and saves ~12KB).
- **States:** `idle` → `submitting` (button disabled, spinner) → `success` (replace form with thank-you panel + WhatsApp upsell) | `error` (inline retry, log to Clarity).
- **Honeypot field** named `website` (hidden) — auto-reject on server if filled. No reCAPTCHA in v1.
- **No PII in analytics** — `form_submitted` event sends only `clinic_size`, never name/email/phone.

---

## Suggested Build Order

This order minimizes rework and aligns with the GSD phase structure. Each step is roughly one phase.

1. **Foundations** — `app/layout.tsx`, fonts, Tailwind tokens, `<MotionConfig>`, `<SmoothScrollProvider>`, `Container`/`Button`/`Headline`/`WhatsAppCta` primitives, design tokens. No real content yet, just black screen with smooth scroll working.
2. **Motion primitives** — `RevealOnView`, `ParallaxLayer`, `ScrollScene`, `TextSplit`. Build them on a throwaway test page (`/dev`) with placeholder rectangles. Validate Lenis + Framer Motion cooperation here, not under copy pressure.
3. **Hero** — full content + image + WhatsApp CTA + analytics wired. This must hit LCP target by itself. Ship Hero alone to Vercel and benchmark before adding any below-fold sections.
4. **Pain section** — first real narrative beat, validates the "dark visual scenario of disorganized clinic" treatment.
5. **Bridge** — Pain→Product transition. First sticky/scrub `<ScrollScene>` in production. Hardest motion; expect 2–3 iterations.
6. **Product** — layered feature reveals with the real screenshots. Image manifest gets stress-tested here.
7. **HowItWorks** — lead-journey storytelling. Second `<ScrollScene>`. Reuse primitives from Bridge.
8. **Proof** — credibility section. Lightest motion of any beat.
9. **CtaForm** — WhatsApp + consultative form + `/api/lead` route + webhook integration.
10. **Footer + Header** — sticky/hide-on-scroll header behavior, footer.
11. **Analytics instrumentation pass** — every event from the table, verified in Pixel/GA4/Clarity dashboards.
12. **SEO / metadata** — Open Graph, sitemap, robots, JSON-LD Organization, favicon.
13. **Mobile choreography polish** — pass through every section with `useDeviceTier()` tuning, test on real device.
14. **Performance pass** — Lighthouse + WebPageTest, image weight audit, bundle analyzer, INP profiling.
15. **A11y pass** — keyboard nav, contrast, alt text audit, `prefers-reduced-motion` end-to-end check.

**Critical sequencing notes:**
- Build motion primitives BEFORE any section. Skipping step 2 = primitives invented inline in Hero, then re-invented in Bridge, then a refactor.
- Ship Hero to Vercel BEFORE building Pain. Hero in isolation must hit LCP < 2.5s; layering more sections only hurts. Get the budget right early.
- `<ScrollScene>` interface freezes after Bridge. Once HowItWorks reuses it, the API is locked — any later change ripples.

---

## GSAP-Future-Ready Boundary

The contract for "GSAP can replace Framer Motion in any single section without refactor" is:

1. **Sections never import Framer Motion directly.** They import primitives from `components/motion/*`. The primitives can be reimplemented atop GSAP later.
2. **`ScrollScene` exposes a `MotionValue<number>`** (0→1 progress). This is the choreography interface. A GSAP version would do `gsap.to(motionValue, { onUpdate: () => motionValue.set(scrollTrigger.progress) })` — consumers don't change.
3. **Consumers compose with `useTransform`** (a thin wrapper around MotionValue mapping). If migrating off Framer Motion entirely, swap `useTransform` with a custom equivalent reading from the same MotionValue source.
4. **No `motion.div` directly in section files** — wrap as `<RevealOnView>`, `<ParallaxLayer>`, etc. Section JSX is library-agnostic.
5. **One Lenis instance.** GSAP swap requires only adding `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(time => lenis.raf(time * 1000))` — no architectural change.

The swap is per-section: Bridge can run on GSAP while Hero continues on Framer Motion. They share the same Lenis loop and the same primitive interfaces.

---

## Scaling Considerations

This is a marketing page, not a SaaS. "Scale" here = traffic spikes from Meta Ads + organic.

| Scale | Adjustments |
|-------|-------------|
| <10k visits/mo | Vercel free tier, ISR not needed (static page), image CDN handles all assets. |
| 10k–500k visits/mo | Vercel Pro for bandwidth; verify image CDN cache hit rate; consider Vercel Analytics paid tier for honest CWV data. |
| 500k+/mo | Move webhook target off Slack (rate limits) to a queue (Upstash QStash, AWS SQS); pre-render OG images statically; audit third-party script weight aggressively. |

### Scaling Priorities

1. **First bottleneck: bandwidth on product screenshots.** Audit at every 50k/mo doubling — re-compress, drop near-duplicate frames, ensure `sizes` per layout is right.
2. **Second bottleneck: Slack webhook rate limits** if form gets >100 leads/hour during ad bursts. Queue it.
3. **Third: INP from analytics scripts** under load. Profile Clarity especially (heaviest of the three) and consider `lazyOnload` if data loss is acceptable.

---

## Anti-Patterns

### Anti-Pattern 1: Lenis in a `useEffect` inside `page.tsx`

**What people do:** Drop Lenis init inline in the page component or each section that needs smooth scroll.
**Why it's wrong:** Multiple instances, multiple RAF loops, scroll fights itself, mobile burns battery, sections that re-mount destroy the loop.
**Do instead:** Single `<SmoothScrollProvider>` at root with one RAF, exposed via context (Pattern 1).

### Anti-Pattern 2: Animating `top`/`left`/`width` on scroll

**What people do:** "I'll just transition `top: 0` to `top: 100px`."
**Why it's wrong:** Triggers layout/paint, drops below 60fps on mobile instantly, kills INP.
**Do instead:** `transform: translateY()` + opacity. Always. If you need geometry change, use `scale` + position via flex/grid, not direct dimension animation.

### Anti-Pattern 3: One `'use client'` per leaf component

**What people do:** Mark every small motion atom client, scatter `'use client'` across 40 files.
**Why it's wrong:** Hydration cost compounds; client manifest balloons.
**Do instead:** One client boundary per section. Server Components compose sections; client islands handle motion inside.

### Anti-Pattern 4: Animating during the LCP window

**What people do:** Animate the hero headline into view with a 1.2s spring on first paint.
**Why it's wrong:** Headline is the LCP candidate. Animating from opacity 0 means LCP fires at "1.2s + paint", not at first paint.
**Do instead:** Hero copy is fully visible on first paint. Motion on hero is for secondary elements (device mockup, decoration) — never the LCP text.

### Anti-Pattern 5: `smoothTouch: true` on Lenis

**What people do:** Enable smooth touch for "consistency."
**Why it's wrong:** Mobile users perceive it as broken/laggy. Native momentum scrolling is what they expect.
**Do instead:** `smoothTouch: false`. Always.

### Anti-Pattern 6: Marking multiple images `priority`

**What people do:** Add `priority` to "all important images."
**Why it's wrong:** Each adds a `<link rel=preload>`; the browser preloads them in parallel, starving the actual LCP image.
**Do instead:** Exactly one `priority` image — the hero LCP candidate. Everything else uses default lazy loading.

### Anti-Pattern 7: Touching `window.fbq` / `window.gtag` directly in components

**What people do:** Sprinkle `window.gtag('event', ...)` across button handlers.
**Why it's wrong:** No type safety, no SSR guard, drift between events fired in different vendors.
**Do instead:** Always go through `track()` in `lib/analytics.ts`.

### Anti-Pattern 8: Storing copy in JSX literals scattered across sections

**What people do:** Write copy directly inside `<h1>Sua clínica está perdendo leads</h1>`.
**Why it's wrong:** Copy revisions touch JSX (merge conflicts, regressions); no single place to review tone; CMS migration becomes a full rewrite.
**Do instead:** `content/*.ts` typed objects (Pattern: data flow). Section JSX reads `t.hero.headline`.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Meta Pixel | `<Script afterInteractive>` + `window.fbq` via `track()` | Use standard events (`Contact`, `Lead`); never custom-only — Meta Ads optimization needs standard events |
| GA4 | `<Script afterInteractive>` + `gtag` via `track()` | Consider `@next/third-parties` `<GoogleAnalytics>` for cleaner mount |
| Microsoft Clarity | `<Script afterInteractive>` + `window.clarity` | Heaviest of the three; profile INP impact; OK to `lazyOnload` if needed |
| Lead webhook (Slack/n8n/email) | `fetch` from edge route | URL in env var; never expose to client |
| Vercel | Auto-deploy on git push | Edge runtime for `/api/lead`; Vercel Analytics optional |
| Image CDN | Native `next/image` loader on Vercel | No external CDN needed in v1 |
| Google Fonts (Inter) | `next/font/local` (self-hosted) | Faster + privacy + no FOIT |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `app/page.tsx` ↔ `sections/*` | Props (static content from `content/*.ts`) | One-way; sections never reach up |
| `sections/*` ↔ `components/motion/*` | Component composition + MotionValue context | The GSAP-swap boundary |
| `components/motion/*` ↔ Lenis | None directly — both read `window.scrollY` | Decoupling is intentional; Lenis stays swappable |
| Components ↔ Analytics | `track()` function only | Never touch vendor globals |
| Client form ↔ `/api/lead` | `fetch` + Zod schema (shared) | Same schema validates both sides |
| `/api/lead` ↔ webhook | `fetch` POST, fire-and-forget with status check | No retry in v1; if it fails, user sees error and falls back to WhatsApp |

---

## Sources

- [Lenis GitHub (Darkroom Engineering)](https://github.com/darkroomengineering/lenis) — current package (`lenis`, not deprecated `@studio-freight/lenis`), React 19 support, `autoRaf: false` for external ticker integration
- [Motion `useReducedMotion`](https://motion.dev/docs/react-accessibility) — official guidance on adaptive motion + `MotionConfig reducedMotion="user"` global pattern
- [Motion `useScroll`](https://motion.dev/docs/react-scroll-animations) — `target` + `offset` API used by `ScrollScene`
- [Next.js `Script` component](https://nextjs.org/docs/app/api-reference/components/script) — `afterInteractive` vs `lazyOnload` trade-offs
- [Next.js `Image` component](https://nextjs.org/docs/app/api-reference/components/image) — `priority`, `sizes`, `fetchPriority`
- [Next.js Lazy Loading guide](https://nextjs.org/docs/app/guides/lazy-loading) — `next/dynamic` with `ssr: true` for SEO-preserving below-fold sections
- [Bridger Tower — Implementing Lenis in Next.js](https://bridger.to/lenis-nextjs) — provider pattern, RAF cleanup
- [Olivier Larose — Smooth Parallax with Framer Motion + Lenis + Next.js](https://blog.olivierlarose.com/tutorials/smooth-parallax-scroll) — reference implementation of `useScroll` reading values that Lenis updates
- [DebugBear — Next.js Image Optimization](https://www.debugbear.com/blog/nextjs-image-optimization) — `sizes` strategy and single-`priority` rule
- [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — for future swap; ticker integration with Lenis (`gsap.ticker.add(lenis.raf)`)
- [Vercel — Third-Party Scripts guidance](https://vercel.com/academy/nextjs-foundations/third-party-scripts) — analytics loading strategies
- PROJECT.md (project context — Likro landing v1 scope, constraints, key decisions)

---
*Architecture research for: Premium scroll-cinematic Next.js landing page (Likro v1)*
*Researched: 2026-05-15*
