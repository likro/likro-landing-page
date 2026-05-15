# Pitfalls Research — Likro Landing Page

**Domain:** Premium scroll-cinematic Next.js landing page for B2B SaaS (clinicas/estéticas) — Meta Ads-driven funnel, WhatsApp-primary conversion
**Researched:** 2026-05-15
**Confidence:** HIGH on technical pitfalls (Framer Motion + Lenis + Next.js App Router are well-documented domains); MEDIUM-HIGH on design/copy pitfalls (industry consensus on premium B2B + AI-voice detection is consistent across credible sources)

> **Reading priority:** this file is dense by design. Roadmap should pull the **Critical** section into phase success criteria, and the **"Looks Done But Isn't" Checklist** into pre-launch QA. Everything else informs guardrails during build.

---

## Critical Pitfalls

These are mistakes that, if shipped, materially damage the "essa empresa é absurda" goal or break the funnel.

### Pitfall 1: Lenis hijacking scroll while a section uses `position: sticky`

**What goes wrong:**
Lenis virtualizes scroll using `transform` on the page wrapper. Native `position: sticky` resolves relative to the **scrollport**, but when an ancestor has a `transform` applied, the sticky element's containing block changes and sticky pinning either breaks entirely or behaves erratically (jumps, releases early, sticks to the wrong parent). The Likro plan explicitly uses sticky sections in the Produto/Como Funciona acts — this is where it bites.

**Why it happens:**
Devs wrap `<body>` or the root layout in a Lenis container without realizing `transform` creates a new containing block for `position: fixed` and changes sticky resolution. They test in dev where the bug looks like "sticky is just laggy" and ship it.

**How to avoid:**
- Use Lenis in **"normal" mode** (no fake scroll / no wrapper transform) — modern Lenis defaults to native scroll with smoothing applied via rAF, not transform-virtualization. Verify the config: `new Lenis({ smoothWheel: true, syncTouch: false })` and **do not** enable `wrapper`/`content` transform mode.
- For any sticky section, render the sticky parent **outside** any Lenis transform context. If unsure, audit with DevTools → Layers panel and check the sticky element's containing block via computed style.
- Prefer Framer Motion's `useScroll({ target, offset })` with sticky containers for scroll-progress effects, rather than fighting Lenis for scroll values.
- On mobile, **disable** Lenis smoothing entirely (`syncTouch: false`, or skip Lenis init on `pointer: coarse`). iOS Safari's momentum scroll plus Lenis = jank and broken scroll restoration on back-nav.

**Warning signs:**
- Sticky element "releases" 50-200px before its parent's bottom
- Sticky element shifts horizontally during scroll
- Pinned section jumps on the first scroll event after page load
- Scroll-to-anchor (`#section`) lands at wrong position
- iOS users report "scroll feels weird" / overscroll bounce missing

**Phase to address:**
Animation architecture phase (early) — set the Lenis config and sticky pattern before any section is built. Trying to retrofit later means rewriting every cinematic section.

**Severity:** CRITICAL

---

### Pitfall 2: Hero animation kills LCP and Lighthouse mobile score drops to 70s

**What goes wrong:**
The hero is the LCP element (large headline + mockup). Devs animate the hero element's `opacity` from 0 → 1 or apply a `translateY` reveal. Lighthouse measures LCP as the moment the element reaches its final rendered state with visible paint. An opacity-0 → 1 animation **delays LCP by the duration of the animation** (often 600-1200ms), pushing LCP from 1.8s to 2.8-3.5s on mid-range Android.

**Why it happens:**
The reveal feels "premium" in dev on a fast machine; nobody runs Lighthouse on Moto G4 throttling until pre-launch, and by then the hero is a sacred cow.

**How to avoid:**
- The LCP element (hero headline + hero image/mockup) renders at **final opacity and final position immediately**. No entrance animation on the LCP element itself.
- "Premium" effect on hero comes from *micro-motion after paint*: subtle glow pulse on CTA, micro-parallax on background, headline letter-spacing easing — never from fade-in of the headline itself.
- If a reveal feel is required, animate **secondary elements** (subline, CTA, badge), keeping the LCP candidate static.
- Use `next/image` with `priority` on the hero mockup, `sizes` set correctly, and `placeholder="blur"` with a tiny base64 blur — NOT a JS-driven blur.
- Run Lighthouse mobile (Moto G4, 4G throttle) as a CI gate, not a launch-week check.

**Warning signs:**
- LCP > 2.5s on PageSpeed Insights mobile
- "Largest Contentful Paint element" in Lighthouse trace points to a node with `opacity: 0` at paint
- First scroll after load feels "delayed" — animations are still resolving
- Lighthouse Performance < 85 on mobile

**Phase to address:**
Hero implementation phase + dedicated performance audit phase before launch. Add a Lighthouse CI check on every PR touching the hero.

**Severity:** CRITICAL

---

### Pitfall 3: Copy that screams AI ("desbloqueie todo o potencial", "transforme sua operação")

**What goes wrong:**
Claude/GPT drafts read fluent but generic — heavy on abstractions ("potencial", "jornada", "transformação"), light on specifics (which lead, which canal, which valor). Clinic owners read three lines and the "premium" frame collapses into "ah, mais um SaaS qualquer com copy genérica". This is the single largest risk to the "essa empresa é absurda" sensation, and it's the easiest to ship by accident.

**Why it happens:**
- LLMs default to high-register marketing tropes when asked for landing copy in PT-BR
- Direct translation from English ("unlock", "leverage", "seamless") produces awkward PT-BR ("desbloqueie", "alavancar", "sem fricção")
- Reviewers read for grammar, not for AI-tells
- The brief says "premium and sophisticated" → LLM interprets as "more abstract", which is the opposite of premium

**How to avoid:**
- **Concrete over abstract:** "lead do Instagram que respondeu 'oi' às 22h" > "captura inteligente de oportunidades". Every promise paired with a tangible artifact (canal, horário, valor, papel na clínica).
- **Verbs of operation, not transformation:** "responde", "etiqueta", "transfere para a recepção", "vê o histórico" — not "transforma", "revoluciona", "potencializa".
- **Banned phrases** (PT-BR AI tells, document as project constants):
  - "desbloqueie", "potencialize", "transforme sua [X]"
  - "no próximo nível", "experiência única"
  - "soluções inovadoras", "soluções inteligentes"
  - "jornada do cliente" (use "caminho do lead até a marcação")
  - "fricção" como substantivo abstrato
  - qualquer frase com "centralize tudo em um só lugar" sem dizer **o quê** está centralizando
  - "do início ao fim", "de ponta a ponta"
  - "feito para você" / "pensado para você"
- **English-influenced PT-BR to flag:**
  - "Maximize seus resultados" (gerundivo de "to maximize" — em PT-BR soa robótico)
  - "Empoderar sua equipe" (calco de "empower")
  - "Insights acionáveis"
  - "Otimize sua performance" (em PT-BR formal, "performance" como anglicismo escorrega)
- **Tom test:** read every section out loud. If it sounds like an investor pitch deck and not like someone explaining the product to a dono de clínica no café, rewrite.
- **Specificity heuristic:** if you can replace "Likro" with "Salesforce" or "RD Station" and the sentence still works, it's too generic. Rewrite until the sentence only makes sense for a clínica using Likro.
- Run final copy past Lenny — he is the brand filter (decisão registrada no PROJECT.md).

**Warning signs:**
- Three adjacent sentences in the same section start with verb-imperativo ("Centralize... Automatize... Organize...")
- Section header is an abstract noun ("Eficiência", "Performance", "Inteligência")
- A clinic owner reading the section can't visualize what they'd see on screen
- Word count per section is high but information density is low
- Any sentence works equally for a barbearia, advocacia, or e-commerce

**Phase to address:**
Copy QA phase before launch + ongoing during each section build. **Copy is not "the last 10%"** — it's the 80% of the premium signal. Treat as a milestone gate, not a polish task.

**Severity:** CRITICAL

---

### Pitfall 4: Roxo `#7C3AED` creeping into large surfaces

**What goes wrong:**
Brand book says roxo is destaque only. But during build, the developer or a stakeholder requests "more brand color" — a section background fades to roxo, a CTA band uses roxo full-bleed, a sticky header gets a roxo gradient. Each addition feels minor in isolation; cumulatively the page looks like a generic SaaS template (Stripe-knockoff or Linear-knockoff) instead of premium-Likro.

**Why it happens:**
- Default Tailwind purple palettes invite use
- Stakeholders equate "more brand color = more brand"
- Sections feel "empty" without color, so devs reach for roxo instead of typography/spacing
- Dark mode sections especially tempt "let's make this purple-tinted dark"

**How to avoid:**
- Tailwind config: define roxo as `accent.primary` only. **Do not** create `bg-accent-50/100/200` shades. If only the 600/700 exist, surface usage is mechanically restricted.
- Hard rule (document in component library): roxo is permitted on **CTA buttons, link hover states, active icons, focus rings, and ≤ 48px decorative elements (badges, dots, underlines, glows ≤ 24px blur radius)**. Anything larger is review-required.
- Dark sections use near-black (`#0A0A0B`) or deep neutral (`#0F1115`) — NOT roxo-tinted. Roxo enters as ≤ 10% pixel coverage glow only.
- Visual review checklist: take a desaturated screenshot of every section. If a roxo blob still reads as a major shape after desaturation, it's too big.

**Warning signs:**
- Roxo covers more than ~5% of any viewport at any scroll position
- Background gradients include roxo at > 20% opacity
- Section dividers, footers, or large cards use roxo backgrounds
- The page reminds you of another product (Linear, Vercel, Stripe) instead of feeling original

**Phase to address:**
Design system / Tailwind config phase (Phase 1-2) — restrict palette mechanically. Re-audit at each section completion.

**Severity:** CRITICAL (direct brand book violation — user called this out explicitly)

---

### Pitfall 5: WhatsApp CTA doesn't open WhatsApp on mobile

**What goes wrong:**
Devs use `https://web.whatsapp.com/send?phone=...` or `https://api.whatsapp.com/send?phone=...`. On mobile (where 80%+ of traffic lives), `web.whatsapp.com` opens WhatsApp Web in a browser tab — useless on a phone. `api.whatsapp.com` works but adds an interstitial. The proper deep link `https://wa.me/55119...` opens the WhatsApp app natively on iOS and Android. Devs sometimes mix these across the site, and the hero CTA works while the floating button or footer link is broken — invisible to anyone testing on desktop only.

**Why it happens:**
- Tested on desktop where all variants "work"
- Copy-pasted from a different project that targeted desktop
- Number includes `+`, spaces, dashes, or wrong country code prefix
- Pre-filled message has unencoded characters and silently fails

**How to avoid:**
- **Single canonical link helper:** one utility `buildWhatsAppUrl(message)` used everywhere. Format: `https://wa.me/55<DDD><number>?text=<encodeURIComponent(message)>`. No `+`, no spaces, no dashes in the number.
- Test on real iOS and Android — not just Chrome DevTools mobile emulation. iOS Safari handles `wa.me` differently than Chrome Android.
- **Verify deep link behavior** when WhatsApp is not installed (rare on Brazilian clinic owner devices but possible) — `wa.me` falls back to web, which is acceptable.
- Each CTA fires the same tracking event with a `location` param (`hero`, `floating`, `section-produto`, `final`, `footer`) so you can see which CTAs convert in GA4/Meta.

**Warning signs:**
- QA on desktop only
- Different WhatsApp URLs across components (search the codebase for `whatsapp` and `wa.me` — should resolve to one helper)
- Mobile users report "clicou e abriu o navegador" in Clarity recordings
- Encoded message has `+` signs instead of `%20` for spaces (means the encoding step was skipped)

**Phase to address:**
CTA implementation phase — define the helper before any CTA is placed. Mobile QA on real device before launch is mandatory.

**Severity:** CRITICAL (funnel breaks)

---

### Pitfall 6: Tracking fires before deduplication / sensitive data captured by Clarity

**What goes wrong:**
Two separate failures, often shipped together:
1. **Double-counted conversions:** Meta Pixel and GA4 both fire on every CTA click. Without `event_id` deduplication (Meta CAPI side) and without a single source of truth event layer, the same click is counted in Meta Ads dashboards and GA4 with no way to reconcile. ROAS reports become wrong.
2. **Microsoft Clarity records the form input fields** containing telefone/email by default. Even though Clarity claims to mask sensitive fields, custom inputs frequently aren't auto-masked, so recordings contain phone numbers and emails — LGPD risk and trust risk if anyone reviews recordings.

**Why it happens:**
- Pixel and GA4 installed in parallel by following two different docs, no event-layer abstraction
- Clarity installed with default config; nobody tests what's actually recorded
- "We'll add CAPI later" — deduplication never gets retrofitted
- Form fields don't have the `data-clarity-mask` or correct input attributes

**How to avoid:**
- **One event layer.** Define an internal `track(event, params)` function that fans out to Pixel, GA4, and (optionally) CAPI server-side. All CTA clicks call this function — never call `fbq` or `gtag` directly from components.
- Each event has a stable `event_id` (UUID v4) that's passed to both Pixel (client) and CAPI (server) when CAPI is added. Even if CAPI is deferred, the `event_id` is already present and dedupe works the day you add it.
- **GA4 for SPA / Next.js App Router specifically:** App Router uses client-side navigation; you must fire `page_view` on `pathname` change via `usePathname` + `useEffect`. Default GA4 install will miss route changes. (For a one-page site this is less critical, but anchor-scroll-as-route is still a thing to handle.)
- **Clarity mask the form properly:**
  - Add `data-clarity-mask="true"` on the form wrapper
  - Use `<input type="tel">`, `<input type="email">` — Clarity auto-masks these in newer versions but verify by reviewing a session recording with test data
  - Never log the form payload to console (Clarity records console output by default)
- **Consent layer placeholder:** even though LGPD cookie banner is out-of-scope for v1, structure the tracking layer to accept a `consent` flag. When the banner ships later, it's a 1-line change, not a refactor.

**Warning signs:**
- Conversion counts in Meta and GA4 differ by > 10% with no obvious explanation
- Clarity recording shows visible phone numbers / emails / valores
- `page_view` events in GA4 don't increment when scrolling through the SPA's anchor sections (if that's the intended UX)
- Network tab shows Pixel firing twice for the same click

**Phase to address:**
Instrumentation phase — set up the event layer before any tracking call is wired. Verify on staging with test events before launch.

**Severity:** CRITICAL (LGPD + ad spend optimization both depend on this)

---

### Pitfall 7: `100vh` on mobile causes hero to scroll-jump on iOS

**What goes wrong:**
Hero is `min-h-screen` or `h-[100vh]`. On iOS Safari, `100vh` is calculated against the viewport with the address bar **hidden**, so the hero is taller than the visible area on initial load (address bar visible). The user scrolls a tiny amount, the address bar collapses, layout reflows, and the hero suddenly fits — but anchored elements jump, sticky CTAs jump, and the cinematic feel breaks in the first 200ms of the user's first scroll.

**Why it happens:**
Tailwind's `h-screen` maps to `100vh`. Devs test on desktop or Chrome mobile emulator (which doesn't simulate iOS Safari's address bar behavior). Bug only shows on real iOS.

**How to avoid:**
- Use the new dynamic viewport units: `min-h-[100dvh]` (dynamic viewport height) instead of `min-h-screen`. Supported in iOS Safari 15.4+ and Chrome 108+.
- Tailwind v3.4+ supports `min-h-dvh`, `h-dvh`, etc. — use these.
- For the hero specifically, prefer `min-h-[100svh]` (small viewport height — always the viewport with browser UI showing) to guarantee no jump.
- Test on real iPhone (not just emulator). Clarity heatmaps will show the jump as an unnatural scroll burst at y=0.

**Warning signs:**
- Hero content appears slightly cropped at the bottom on iOS initial load
- First scroll feels like a "jump" not a glide
- Sticky header jumps position at scroll start
- Clarity recordings show an instant scroll of ~100px at session start

**Phase to address:**
Hero implementation + mobile QA phase. Document `dvh`/`svh` usage in a styling guideline.

**Severity:** HIGH

---

### Pitfall 8: Scroll-jacking that frustrates instead of delights

**What goes wrong:**
The "cinematic" goal seduces devs into intercepting scroll: pin a section, scrub 1:1 to scroll progress, force the user through a 6-step reveal before releasing. Apple does this beautifully because they have a 60-second story and a captive audience. A B2B clinic owner on Instagram has 8 seconds of patience. Pin-and-scrub used wrong = user feels stuck, hits back, conversion drops.

**Why it happens:**
- Inspiration sites (Apple, Linear, Stripe) use this pattern; devs replicate the *form* without the *constraints*
- Pin durations chosen by feel in dev (where dev knows what's coming) — feel torturous to first-time visitor
- No baseline test of "can user reach bottom of page in < 30 seconds of continuous scroll"

**How to avoid:**
- **Budget pin durations.** Total pinned scroll across all sections ≤ 50% of page scroll height. A clinic owner who scrolls fast must reach the CTA in < 25 seconds of fast-scrolling.
- Pin-and-scrub is permitted **only** when the scrub directly maps to revealing real product content (e.g., scrolling reveals dashboard screenshots one at a time). Never pin for purely decorative effect.
- **Pin-release must be obvious.** User scrolls past pinned section → page resumes normal scroll within one continuous motion. No "scroll a bit, then jump, then scroll again."
- Honor `prefers-reduced-motion`: under this preference, all pins become normal flow, all scrubs become instant reveals on enter-viewport.
- Test with Clarity scroll-depth: if dropout rate spikes at a pinned section, it's too long.

**Warning signs:**
- Internal test users say "I had to scroll a lot to get past that part"
- Clarity recordings show users scroll-flicking aggressively through a section (they're trying to escape, not engage)
- Bounce rate or scroll-50% drop-off concentrated at a single section
- Total page "scroll to bottom" time > 30 seconds on fast continuous scroll

**Phase to address:**
Animation architecture phase + UX QA phase. Treat pin duration as a budget, allocated section by section.

**Severity:** HIGH

---

### Pitfall 9: ~50 product screenshots tank performance if not handled deliberately

**What goes wrong:**
The plan calls for "prints reais do app" — the user has ~50 screenshots in `/prints_funcionalidades/`. Naive implementation: import all, render as `<img>` or `next/image`, page weights 30+ MB, Lighthouse Performance crashes to 40s, mobile data users abandon mid-scroll.

**Why it happens:**
- Raw PNG screenshots from the app at native resolution (often 2880×1800 from Retina) = ~3-5 MB each
- All loaded eagerly because they're "needed for the cinematic reveals"
- No art direction per breakpoint — mobile gets desktop-sized images

**How to avoid:**
- **Triage screenshots first.** Of ~50, the landing actually needs ~12-18. Be ruthless: every screenshot must illustrate a specific narrative beat. If two screenshots show the same surface, pick one.
- **Convert to AVIF + WebP** via `next/image` automatic format negotiation. Source assets stored as high-quality PNG; build output is AVIF/WebP.
- **Responsive `sizes`.** Every `<Image>` declares `sizes` accurately (e.g., `sizes="(max-width: 768px) 90vw, 600px"`). Without `sizes`, Next ships the largest variant to mobile.
- **Lazy load everything below the fold.** Hero mockup is `priority`; everything else is default lazy.
- **Quality tuning.** `next/image` default quality is 75; for UI screenshots with sharp edges, 80-85 is the sweet spot. Test visually — at 70 quality, text in screenshots looks fuzzy.
- **Mockup frames as SVG, content as image.** Browser chrome / device frames as inline SVG; only the actual app screen content is a raster image. Saves bytes and crisps the frame.
- Target: full page transfer size on mobile ≤ 1.5 MB (excluding any video).

**Warning signs:**
- Network tab shows individual images > 200KB
- Lighthouse "Properly size images" warning
- Lighthouse "Serve images in next-gen formats" warning
- Total page weight > 2.5 MB on mobile
- Mid-scroll stutter as off-screen images load

**Phase to address:**
Asset pipeline phase before any product section is built. Set the standard once.

**Severity:** HIGH

---

### Pitfall 10: Framer Motion in Next.js App Router — Server Component / "use client" boundary errors

**What goes wrong:**
Framer Motion components (`motion.div`, `AnimatePresence`, `useScroll`, etc.) are client-only — they use hooks and DOM APIs. In Next.js App Router, components default to Server Components. Forgetting `"use client"` on an animation file produces cryptic errors at build time or worse, runtime errors only visible in production. Worse: developers slap `"use client"` on the root layout to "fix it everywhere", and now the entire page is client-rendered, killing SEO and FCP.

**Why it happens:**
- App Router is still a recent mental model shift
- Framer Motion docs don't always show the `"use client"` directive
- Lazy fix: bubble `"use client"` up rather than create animation client islands

**How to avoid:**
- **Animation components are leaf-level client islands.** Pattern: `<AnimatedReveal>{children}</AnimatedReveal>` where `AnimatedReveal` is a client component, but it can receive Server Component children. The wrapping section stays a Server Component.
- File-level convention: any file under `/components/animations/*` has `"use client"` at the top. Section files (`/components/sections/*`) are Server Components by default.
- Use `motion/react` (the new package name as of Framer Motion v11+, formerly `framer-motion`) — check current version. The import paths shifted recently and old tutorials still reference the old name.
- **Verify hydration is clean.** No `useEffect` for setting initial animation state that differs from SSR output (causes hydration mismatch warnings).
- For sections with scroll-driven animations, prefer Framer Motion's `useScroll` over `useEffect` + scroll listeners — handles SSR cleanly.

**Warning signs:**
- Build error: "You're importing a component that needs `useState`. It only works in a Client Component"
- Console warning: "Hydration failed because the initial UI does not match"
- `"use client"` appears in `layout.tsx` or `page.tsx` (root pages)
- Animations flash visible content before hiding (FOUC) — means SSR rendered the final state, then JS hid it

**Phase to address:**
Component architecture phase (early). Document the client-island pattern as a project convention.

**Severity:** HIGH

---

## High-Severity Pitfalls

### Pitfall 11: Easing curves that read "childish" instead of "premium"

**What goes wrong:**
Devs use Framer Motion's default `tween` with `ease: "easeInOut"` or worse, bouncy springs (`type: "spring", stiffness: 100, damping: 8`). The result: animations *boing* into place. Boinginess reads as playful/childish — perfect for consumer apps, wrong for premium B2B targeting business owners.

**Why it happens:**
Spring physics feels "fancy" to engineers; defaults are too bouncy for the premium register.

**How to avoid:**
- Standard easing for premium feel: `cubic-bezier(0.16, 1, 0.3, 1)` (often called "ease-out-expo") for entrances, `cubic-bezier(0.7, 0, 0.84, 0)` for exits.
- Durations: entrances **400-700ms** (premium = slower than you think). Micro-interactions on hover/tap: 150-250ms. Avoid anything < 100ms (feels jittery) or > 1000ms (feels slow without intention).
- Springs are permitted **only** with `damping ≥ 25` and `stiffness ≤ 200` — barely-perceptible spring, no visible bounce. Or disable spring and use tween.
- Stagger reveals at 60-100ms intervals, not 200ms+ (which feels theatrical).
- **No bounce on enter.** Bounce reads as "Toy Story title card" — exactly the opposite of premium.

**Warning signs:**
- Elements visibly overshoot their final position
- Animations are "fun" to watch — premium animations are barely noticed
- Stakeholders describe the site as "playful" or "lively" when you wanted "sophisticated"

**Phase to address:**
Design tokens / animation system phase. Define a `motion` config object once and reuse.

**Severity:** HIGH

---

### Pitfall 12: `prefers-reduced-motion` ignored — accessibility fail and bad UX for vestibular sensitive users

**What goes wrong:**
~35% of users have `prefers-reduced-motion: reduce` set (vestibular disorders, post-concussion, anxiety, plus many users default to it on macOS Sonoma+). If animations don't respect it, those users see a flickering mess and bounce. Also a WCAG 2.1 AAA fail (Likro plan commits to WCAG AA which doesn't require it, but the *principle* matters for premium).

**Why it happens:**
Easy to forget; doesn't show up in standard testing; QA doesn't toggle it.

**How to avoid:**
- Single hook `useReducedMotion()` (Framer Motion ships this). Every animated component reads it.
- Reduced motion behavior is **not "disable all animation"** — it's "replace with instant or 100ms fade". Content still reveals; just without traversal.
- Lenis: detect `prefers-reduced-motion`, skip Lenis init entirely. Native scroll for those users.
- Test by toggling in macOS System Settings → Accessibility → Display → Reduce motion. Reload site. Every animation should resolve to a static or barely-animated state.

**Warning signs:**
- Site looks identical with reduced motion toggled on (means the toggle isn't wired)
- Lighthouse Accessibility audit doesn't flag it (it doesn't check this — manual verification needed)

**Phase to address:**
Animation architecture phase + accessibility audit phase.

**Severity:** HIGH

---

### Pitfall 13: Form too long / friction kills the secondary conversion

**What goes wrong:**
The "formulário consultivo discreto" is intended as a low-friction alternative for users not ready to chat. Devs default to "comprehensive lead form": nome, email, telefone, nome da clínica, número de funcionários, faturamento mensal, principal dor, como nos conheceu. Result: form abandonment > 80%. Worse, it telegraphs "we're a sales machine" — wrong premium signal.

**Why it happens:**
Sales/marketing instinct to capture maximum lead data; misalignment between "discrete" and what the team thinks a lead form needs.

**How to avoid:**
- Form has **3 fields max** in v1: nome, telefone (or email), uma linha "qual o desafio da sua clínica hoje?". That's it.
- Phone field is the priority — it's how the team will reply via WhatsApp anyway.
- Inline validation, optimistic submit, success state that doesn't reload the page.
- Submit button copy reflects voice: "Quero conversar" or "Recebam meu contato" — not "Enviar" or "Solicitar demonstração".
- Honeypot field for spam, not reCAPTCHA (which destroys premium feel and slows form).

**Warning signs:**
- Form has > 4 visible fields
- Form asks for things the salesperson could ask in the WhatsApp conversation
- "Required" indicators on more than nome + contato

**Phase to address:**
Conversion section build phase.

**Severity:** HIGH

---

### Pitfall 14: SEO / JSON-LD typos, missing OG cards, robots blocking the site

**What goes wrong:**
- JSON-LD Organization schema has a typo in `@type` or `@context` → Google ignores it
- OG image not set or set to a placeholder → Meta Ads, WhatsApp link previews, and LinkedIn shares look unprofessional
- `robots.txt` accidentally `Disallow: /` (carried over from a staging config)
- `<title>` and `<meta description>` not unique per anchor section (irrelevant for single-page, but devs sometimes add multiple `<title>` in error)
- Sitemap missing or pointing to wrong domain post-DNS

**Why it happens:**
- Copy-pasted from an example; not validated
- robots staging-vs-prod swap forgotten
- OG image dimensions wrong → social previews crop wrong

**How to avoid:**
- Validate JSON-LD with Google's Rich Results Test before launch
- OG image: 1200×630, < 1MB, JPG/PNG, includes Likro logo + tagline visible at thumbnail size
- Twitter card: `summary_large_image`, same OG image works
- `robots.txt` checked in production after deploy: `User-agent: *\nAllow: /` plus sitemap pointer
- Sitemap auto-generated from Next config (`next-sitemap` or built-in)
- `<meta name="theme-color">` set to brand-aligned color (NOT roxo full — use the dark neutral)

**Warning signs:**
- Pasted the WhatsApp link into a chat and the preview looks broken or generic
- Google Search Console → URL Inspection shows the page as "not indexable"
- Rich Results Test reports schema errors

**Phase to address:**
SEO / pre-launch checklist phase.

**Severity:** HIGH

---

### Pitfall 15: Mobile parallax + heavy transforms = jank on mid-range Android

**What goes wrong:**
Parallax effects rely on `transform: translate3d(...)` driven by scroll position. On mid-range Android (Moto G series, Samsung A series — exactly the devices a clinic recepcionista or owner-operator uses), the GPU pipeline gets saturated and scroll FPS drops to 20-30. Site that looks gorgeous on iPhone 14 Pro feels broken on a Moto G31.

**Why it happens:**
- QA on iPhone or high-end Android only
- Multiple parallax layers per section
- `box-shadow` and `filter: blur()` animated alongside transforms = GPU pile-up

**How to avoid:**
- **Mobile gets simplified animations, not the same animations slowed down.** Define a `isMobile` or `isLowEnd` (use `navigator.hardwareConcurrency < 6`) check, and:
  - Disable parallax (set parallax factor to 0)
  - Disable scroll-tied blurs
  - Keep fade + translate reveals only
- Animate `transform` and `opacity` only. Never animate `width`, `height`, `top`, `left`, `box-shadow`, `filter` continuously.
- Use `will-change: transform` sparingly — only on elements that genuinely animate. Overuse creates GPU layers for everything and *hurts* performance.
- Test on a real mid-range Android (or use Chrome DevTools → Performance → CPU 4x slowdown + Network 4G) before launch.

**Warning signs:**
- Chrome DevTools Performance recording shows frames > 16.67ms during scroll
- "Long task" warnings in Lighthouse
- Real-device test shows visible stutter

**Phase to address:**
Animation architecture phase + mobile performance audit before launch.

**Severity:** HIGH

---

### Pitfall 16: Trust signals absent or fake-feeling

**What goes wrong:**
The plan correctly bans fabricated metrics and testimonials. But the *absence* of any trust signal is also a problem — premium B2B buyers expect *something*. The mistake is either (a) shipping with no proof at all, or (b) caving and adding placeholders ("4.9 estrelas no Google" with no source, "+200 clínicas" invented).

**Why it happens:**
- Real social proof not yet available (legitimate constraint in early stage)
- Pressure to fill the proof section pushes toward fabrication
- Or: section gets cut entirely, removing all credibility scaffolding

**How to avoid:**
- **Proof through product, not through claims.** The product screenshots, the operation mention (Dolce Home elegantly referenced), and the visual refinement of the page itself are proof. The "Prova" section in the 5-act narrative should:
  - Mention Dolce Home with one specific concrete detail (não inventado): "operação ativa atendendo via Likro hoje" — frase específica e verificável.
  - Show one or two especially polished product moments (not generic screenshots — *the* moment that demonstrates depth).
  - Show team/origin signal: who built this, briefly, with credibility (Lenny + Gabriel context if appropriate — but check brand voice).
- **Stack/integration logos as soft proof:** if Likro integrates with platforms (Meta, WhatsApp Business API, etc.), showing those integration logos signals legitimacy without fabricating data.
- No star ratings, no "+X clientes", no "trusted by" with logos you don't have permission for.

**Warning signs:**
- Proof section has any number you can't cite a source for
- "Quote" from a customer who hasn't agreed to public attribution
- Logo wall with platforms Likro doesn't actually integrate with

**Phase to address:**
Proof section build + final copy/legal review.

**Severity:** HIGH

---

### Pitfall 17: Above-the-fold value prop unclear — clinic owner doesn't know what Likro *is* in 5 seconds

**What goes wrong:**
Premium-aspiring sites often default to abstract hero copy ("Operação inteligente para sua clínica" + cinematic visual + CTA). A clinic owner from Meta Ads has 5 seconds and 80% mobile attention. If the hero doesn't say **what the product is** (CRM + atendimento + IA) and **what it changes** (leads do Instagram viram agendamentos) in the first viewport, they bounce.

**Why it happens:**
- "Cinematic" misread as "mysterious" — withholding info for storytelling
- Hero copy optimized for sound, not for clarity
- Designer/dev defaults to "the visual will do the work"

**How to avoid:**
- Hero formula (adapt to voice): **concrete pain + concrete outcome + product noun**, all visible above the fold.
  - Example structure (not final copy — copywriter will refine): *headline* names the pain in clinic-speak; *subline* states what the product does in 1 sentence; *CTA* is verb + WhatsApp.
- Mobile hero: text must be fully readable without scroll. Mockup can peek from below the fold — that's fine; text cannot.
- 5-second test: ask 3 people outside the project to look at the hero for 5 seconds, then describe what Likro does. If they can't, rewrite.

**Warning signs:**
- Hero copy is metaphorical ("acelere", "transforme", "construa")
- Hero copy could apply to any SaaS
- Internal testers ask "but what is it?"

**Phase to address:**
Hero copy phase + user testing before launch.

**Severity:** HIGH

---

### Pitfall 18: Header CTA conflicts with hero CTA on mobile

**What goes wrong:**
Header has a "Falar no WhatsApp" CTA. Hero has the same CTA, large. On mobile, the header CTA is visible above the hero CTA simultaneously in the first viewport. User sees two CTAs ~80px apart, doesn't know which to click, friction increases. Or: header becomes sticky and obscures hero content as user scrolls down.

**Why it happens:**
- Header designed independently from hero
- Mobile layout not composed holistically

**How to avoid:**
- On mobile, **hide the header CTA in the hero viewport.** Header CTA appears only after the user scrolls past the hero (e.g., header transitions in at scroll Y > viewport height).
- Or: header has only logo on mobile; CTA appears in the sticky floating WhatsApp button after hero scroll.
- The floating WhatsApp button is the persistent mobile CTA — minimal, lower-right, ~56px circle, appears after hero, hides if user is at the form section.

**Warning signs:**
- Mobile hero screenshot shows two CTAs visible at once
- Sticky header overlaps hero text on small screens

**Phase to address:**
Header + hero layout phase. Test mobile composition early.

**Severity:** HIGH

---

## Medium-Severity Pitfalls

### Pitfall 19: More than 3 font weights creep in

**What goes wrong:**
Brand book restricts to 3 weights of Inter. Devs add `font-medium` (500) for "balance" between regular (400) and semibold (600). Suddenly the page uses 400, 500, 600, 700 — and the typographic discipline that signals premium dilutes.

**How to avoid:**
- Tailwind config restricts `fontWeight` keys to exactly 3 (e.g., `regular: 400, semibold: 600, bold: 700`). Other weights produce class errors.
- Document the 3 chosen weights and their use cases (body / emphasis / display).

**Phase to address:** Design system phase. **Severity:** MEDIUM

---

### Pitfall 20: Generic stock illustrations creeping in

**What goes wrong:**
Section needs "a visual" and there's no time/budget for custom illustration. Dev grabs from unDraw, Storyset, or Tailwind UI illustrations. Result: instant generic-SaaS feel. The brand book explicitly calls for abstract tech shapes / lines / waves with subtle roxo — not character illustrations.

**How to avoid:**
- Allowed visual types: real product screenshots, abstract SVG (shapes, lines, gradients in approved palette, dotted grids), photography of real environment (clinic-context if available and licensed).
- Banned: cartoon characters, isometric people, unDraw-style flat illustrations, generic "team collaboration" stock photos.
- When in doubt, more whitespace + larger typography > illustration.

**Phase to address:** Visual asset pipeline phase. **Severity:** MEDIUM

---

### Pitfall 21: Hover effects on mobile (where hover doesn't exist)

**What goes wrong:**
CTAs and cards have hover states that scale, glow, or reveal info. On mobile (no hover), some browsers fire hover on first tap and the user then has to tap again to actually trigger the click. Or hover effects never show, and the visual story has gaps on mobile.

**How to avoid:**
- Use `@media (hover: hover)` for hover styles — applied only on devices that actually hover.
- Mobile equivalents: tap feedback (brief opacity dip or subtle scale), tap-to-reveal where info-on-hover existed.
- Tap targets ≥ 44×44px (Apple HIG), preferably 48×48px (Material).

**Phase to address:** Component build phase + mobile QA. **Severity:** MEDIUM

---

### Pitfall 22: Scroll-depth tracking measures wrong thing

**What goes wrong:**
GA4 default scroll-depth fires at 25/50/75/90% of *page height*. On a long cinematic page, 50% might be deep in the produto section. The team interprets "50% scroll" as a meaningful engagement metric, but it doesn't map to narrative acts.

**How to avoid:**
- Fire custom events tied to **section** visibility, not percent. Events: `section_view_hero`, `section_view_dor`, `section_view_solucao`, etc. Use IntersectionObserver with `threshold: 0.5`.
- Keep percent scroll events too, but treat them as secondary.
- This maps Clarity heatmaps to narrative directly.

**Phase to address:** Tracking instrumentation phase. **Severity:** MEDIUM

---

### Pitfall 23: Vercel preview URLs indexed by Google

**What goes wrong:**
Every PR creates a `.vercel.app` preview URL. Google indexes some of them. Duplicate content; preview URLs appear in search results before launch; SEO authority dilutes.

**How to avoid:**
- `robots.txt` on preview deployments blocks all crawlers. Use a Vercel env check: `if (process.env.VERCEL_ENV !== 'production') return Disallow: /`.
- `<meta name="robots" content="noindex">` on non-production builds.
- Verify on a preview URL before merging anything sensitive.

**Phase to address:** Deploy / SEO phase. **Severity:** MEDIUM

---

### Pitfall 24: Animation library bundle bloat

**What goes wrong:**
Framer Motion's full bundle is ~50KB gzipped. Importing carelessly (e.g., `import * from 'framer-motion'`) ships the whole thing. Combined with Lenis (~10KB), the JS-only payload starts at 60KB before any app code.

**How to avoid:**
- Use Framer Motion's `LazyMotion` + `m` component pattern for sections that need fewer features — reduces to ~5KB initial + lazy features.
- Tree-shake imports: `import { motion } from 'framer-motion'` (not `*`).
- Audit bundle with `@next/bundle-analyzer`. Set a budget: total JS < 150KB gzipped on first load.

**Phase to address:** Performance audit phase. **Severity:** MEDIUM

---

### Pitfall 25: Form submit endpoint not idempotent / duplicate submits

**What goes wrong:**
User taps submit; loading state doesn't lock; user taps again; two webhook deliveries; sales team gets duplicate leads and the "premium" impression dies on first contact.

**How to avoid:**
- Disable submit button on first click (`disabled={isSubmitting}`).
- Server-side dedupe key (timestamp + phone) on the webhook handler.
- Optimistic success state shown immediately.

**Phase to address:** Form build phase. **Severity:** MEDIUM

---

### Pitfall 26: Gradient overuse (especially diagonal gradients on cards)

**What goes wrong:**
Tailwind's `bg-gradient-to-br from-purple-600 to-blue-600` is one keystroke away. Used on cards, it screams "2020 SaaS template". Subtle, controlled gradients can be premium; default Tailwind gradients are not.

**How to avoid:**
- Gradients only on hero backgrounds (very subtle, neutral-to-darker-neutral) and on glow effects (small, roxo at low opacity).
- Cards have flat backgrounds. Period.
- No color-to-color gradients across the page (no purple-to-blue, no orange-to-pink).

**Phase to address:** Design system phase. **Severity:** MEDIUM

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Copy hardcoded in components (no CMS) | Fastest to ship; matches PROJECT.md decision | Every copy edit is a code change + deploy; non-tech team blocked | Acceptable in v1 (explicit decision). Reassess if copy iteration > 1×/week. |
| `"use client"` at high-level layout to "fix" hydration errors | Errors stop instantly | Whole tree becomes client-rendered; SEO and FCP suffer; recovery requires diff-by-diff refactor | Never |
| Skipping `event_id` in tracking events because CAPI isn't live yet | One less field to manage | When CAPI lands, every event needs retrofitting; dedupe stays broken until then | Never — cheap to add now, expensive to retrofit |
| Inline Tailwind classes everywhere (no `@apply`, no component primitives) | Fast prototyping | Section refactors mean editing dozens of long class strings; brand updates require global find/replace | Acceptable in v1 for one-off layout; for repeated patterns (cards, CTAs), extract a component |
| Skipping `prefers-reduced-motion` "for now" | Ship sooner | A11y debt; users with the preference experience the worst version of the site | Never |
| Using `web.whatsapp.com` link "because wa.me sometimes has issues" | Works on desktop | Mobile (80% of traffic) breaks | Never |
| Animation timings tuned in dev only (no real-device testing) | Faster iteration | Mid-range Android jank discovered post-launch; emergency patch | Acceptable during early build; not acceptable past Phase 2 |
| One giant `page.tsx` instead of section components | Less file structure to manage early | Hot reload slows; merge conflicts; can't isolate animation client islands | Never past hero+dor sections |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Meta Pixel | Firing `Lead` event with no `event_id`, no `currency`, no `value` | Always include `event_id` (matches CAPI later), `currency: 'BRL'`, and `value` (estimated lead value, or 0 if unknown). Use standard event names (`Lead`, `Contact`, `InitiateCheckout`) — not custom unless necessary. |
| GA4 (Next App Router) | Auto page_view doesn't fire on client navigation between anchors | Manually fire `page_view` on `usePathname` change. For anchor-only single page, treat anchor changes as section views instead. |
| Microsoft Clarity | Form fields recorded with PII visible | Add `data-clarity-mask="true"` on form wrapper; verify by reviewing test recording before launch. Use proper input `type` attributes. |
| WhatsApp deep link | Using `web.whatsapp.com` or `api.whatsapp.com` | Use `wa.me/55<DDD><number>?text=<encoded>`. Single helper function. |
| Vercel deploy | Preview deployments indexed by Google | `robots.txt` returns `Disallow: /` when `VERCEL_ENV !== 'production'`. Verify via preview URL inspection. |
| Webhook receiver (form submits) | No retry / no dedupe / lost on transient failure | Server endpoint dedupes by (phone + 60-second window). Failed delivery to Slack/email queued or retried. Don't lose leads. |
| `next/image` with remote screenshots | Forgetting `images.remotePatterns` in `next.config.js` | Configure remote patterns explicitly; OR store screenshots in `/public` and reference locally (preferred for v1). |
| Inter font loading | `<link>` to Google Fonts → render-blocking | Use `next/font/google` — self-hosted, preloaded, zero layout shift, subsetting included. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero animation delays LCP | LCP > 2.5s on mobile; Lighthouse Performance < 85 | LCP element renders at final state; entrance animations on secondary elements only | Always on mobile if not prevented |
| Lenis + sticky breaking | Sticky releases early; iOS scroll feels off | Lenis in normal mode; disable on mobile; sticky outside any transform context | First mobile QA pass |
| Unoptimized screenshots | Page weight > 3MB; mobile data users abandon | next/image + AVIF/WebP + responsive sizes + lazy below fold | When asset count > 10 |
| GPU layer thrash from parallax | Scroll FPS drops below 30 on mid-range Android | Limit parallax to desktop or high-end devices; transform/opacity only | On mid-range Android always |
| Framer Motion bundle bloat | First-load JS > 200KB; FCP suffers | LazyMotion + m component; tree-shake imports | Adding 5+ animation files |
| `useEffect` scroll listeners (instead of `useScroll`) | Jank during scroll; missed scroll events | Use Framer Motion's `useScroll`; or passive event listeners with rAF throttling | Always — write it right the first time |
| Mounting all sections immediately | Initial render slow; long task warnings | Code-split lower sections via dynamic import where appropriate (but balance against scroll-into-view animation timing) | Page > 8 sections of complex animation |
| Inter font flash (FOUT/FOIT) | Layout shift on font load; CLS warnings | `next/font/google` with `display: 'swap'` and `adjustFontFallback: true` | Always if Google Fonts loaded directly |

---

## Security & Privacy Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Form submits without spam protection | Sales team flooded with junk leads; webhook quota exhausted | Honeypot field + server-side rate limit (1 submit/IP/minute) — not reCAPTCHA |
| Clarity recording PII (phone/email) | LGPD exposure if recordings reviewed by third parties; trust violation | `data-clarity-mask` on form wrapper; verify via test recording |
| Pixel firing without consent layer | LGPD risk once enforcement tightens; out-of-scope for v1 but architecture must allow retrofit | Event layer accepts `consent` flag from day 1; pass `true` for now, swap when banner ships |
| Form webhook endpoint exposed without auth | Anyone can spam directly to webhook | Webhook URL stored in env vars, not committed; consider HMAC signing if endpoint is public; or proxy through a Next API route with rate limiting |
| Logo + brand assets in public repo | Brand asset leak (minor) | Keep brand assets in `/public` (intended public) but not raw brand book PDFs or internal docs |
| Environment variables for tracking IDs committed to repo | Pixel/GA4 IDs aren't secret but commit hygiene matters | Use `.env.local` for dev; Vercel env vars for prod. `NEXT_PUBLIC_*` for client-side. |
| WhatsApp number in code without validation | Wrong number breaks the entire funnel silently | Number in env var; helper function tests format at startup; staging uses test number |
| User input rendered without escaping | XSS — though unlikely on a static page, form success message could echo unescaped name | React's default JSX escaping handles this; avoid `dangerouslySetInnerHTML` entirely |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Cinematic withholds info — user can't tell what product is in 5s | Bounce before reaching CTA | Hero states product noun + clinic pain + outcome above fold |
| Floating WhatsApp button covers form submit | Last-section conversion blocked | Hide floating button when form section enters viewport |
| Pin-and-scrub sections > 5 seconds of pinned scroll | User feels trapped; bounce mid-scroll | Pin budget per section ≤ 3 seconds of natural scroll motion |
| Hover effects on mobile create double-tap | User taps, sees hover state, has to tap again | `@media (hover: hover)` for hover; tap feedback for touch |
| Form errors only shown on submit, not inline | Frustrating retry loop | Inline validation on blur; clear error copy |
| Success state reloads page or jumps to top | Disorients user; loses scroll position | Inline success: form replaced with confirmation message in-place |
| Tap targets < 44px on mobile | Mis-taps; rage taps | All interactive targets ≥ 44×44px, preferably 48×48px |
| Loading state invisible (no skeleton, no spinner) | User clicks twice / thinks site is broken | Subtle but visible loading state on form submit |
| Anchor navigation jumps without smooth scroll | Jarring; breaks cinematic flow | Lenis or `scroll-behavior: smooth` for anchors |
| Mobile hero image cropped wrong | Mockup illegible | Art-direct hero per breakpoint (mobile mockup may be portrait crop, desktop landscape) |
| Section transitions abrupt | Loses cinematic continuity | Color/lighting bridges between sections (dark → claro shouldn't be a hard cut; ~80px gradient blend or visual element bridging) |
| User can't tell which section they're in | Disorientation on long scroll | Subtle section markers (very small text, dot indicator, or scroll progress bar on desktop) |

---

## "Looks Done But Isn't" Checklist

Run this before declaring a section complete or before launch.

### Per-section
- [ ] **Hero / Section copy:** Read out loud — does it sound like a human explaining to a clinic owner, or like a marketing deck? Has it been Lenny-reviewed?
- [ ] **Hero LCP:** Lighthouse mobile shows LCP element fully painted at final state (not animating in). LCP < 2.5s.
- [ ] **Animations:** `prefers-reduced-motion` honored — toggle in OS, reload, verify static or minimal motion state.
- [ ] **Animations:** Tested on real iOS Safari AND real mid-range Android (not just emulator).
- [ ] **Images:** All `<Image>` have explicit `sizes`, AVIF/WebP served, lazy below fold.
- [ ] **Sticky sections:** Sticky behaves correctly past parent end + on mobile + with browser zoom 125%.
- [ ] **Mobile composition:** First viewport on iPhone SE shows headline + CTA without scroll.

### Conversion
- [ ] **Every CTA on every section:** Click on real mobile device. WhatsApp app actually opens. Pre-filled message correct.
- [ ] **Floating WhatsApp:** Appears after hero, doesn't overlap form, has tracking event with location param.
- [ ] **Form:** Submit on mobile. Webhook delivers. Slack/email arrives. Success state shows in place.
- [ ] **Form:** Double-submit prevented. Disabled button + server dedupe both verified.
- [ ] **Form fields:** Clarity recording reviewed — phone/email not visible in playback.

### Tracking
- [ ] **Meta Pixel:** `Lead` event fires on form submit with `event_id`, `currency: 'BRL'`. Verified in Meta Events Manager Test Events.
- [ ] **Meta Pixel:** `Contact` event (or appropriate custom event) fires on WhatsApp CTA click with `location` param.
- [ ] **GA4:** `page_view` fires on initial load. Section view events fire as expected (IntersectionObserver verified in console).
- [ ] **GA4:** Conversion event configured in GA4 dashboard.
- [ ] **Clarity:** Session recorded; PII masked; heatmap visible after 24h of test traffic.
- [ ] **No event firing twice:** Network tab inspected on every CTA — single fire per click.

### SEO / Meta
- [ ] **Title + description:** Unique, < 60 / < 160 chars respectively, includes "clínica" + "Likro".
- [ ] **OG image:** Verified by pasting URL into WhatsApp, LinkedIn, X. Preview looks polished.
- [ ] **JSON-LD Organization:** Validates in Google Rich Results Test.
- [ ] **Sitemap:** Accessible at `/sitemap.xml`, points to production domain.
- [ ] **robots.txt:** Production allows; preview blocks.
- [ ] **Favicon + apple-touch-icon:** Both present, correct dimensions.
- [ ] **Theme color:** Matches brand neutral (not bright roxo).

### Performance / Lighthouse
- [ ] **Lighthouse Mobile:** Performance ≥ 85, Accessibility ≥ 90, Best Practices ≥ 95, SEO ≥ 95.
- [ ] **Lighthouse Desktop:** All categories ≥ 90.
- [ ] **LCP:** < 2.5s mobile, < 2s desktop.
- [ ] **CLS:** < 0.1 (verify by scrolling slowly — no layout shifts).
- [ ] **INP / FID:** < 200ms.
- [ ] **Total page weight (mobile):** < 1.5 MB.
- [ ] **First-load JS:** < 150KB gzipped.

### Brand & Voice
- [ ] **Roxo audit:** Take desaturated screenshots of every viewport position. No roxo blob reads as a major shape.
- [ ] **Font weights:** Inspect computed styles across the page. Only 3 weights present.
- [ ] **No banned phrases:** Search codebase for `desbloque`, `potencia`, `transforme sua`, `próximo nível`, `solução inovadora`, `feito para você`. Zero matches.
- [ ] **No fabricated proof:** Every number, every quote, every logo has a source you can cite.
- [ ] **No generic illustrations:** Every visual is either a real product screenshot, abstract SVG in palette, or licensed photography.

### Accessibility
- [ ] **Keyboard navigation:** Tab through entire page. Every interactive element reachable. Focus visible at all times.
- [ ] **Color contrast:** WCAG AA verified — body text ≥ 4.5:1, large text ≥ 3:1.
- [ ] **Alt text:** Every `<Image>` has descriptive `alt` (decorative images: `alt=""`).
- [ ] **Semantic HTML:** Sections use `<section>`, headings hierarchical (one `<h1>`, then `<h2>` per section, etc.).
- [ ] **Form labels:** Every input has a `<label>` (visible or `sr-only`).
- [ ] **Reduced motion:** Verified end-to-end as above.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| LCP > 2.5s after launch | LOW | Remove hero entrance animation; ensure hero image is `priority`; re-test |
| WhatsApp link broken on iOS | LOW | Replace all URLs with `wa.me`; deploy hotfix; verify on real iPhone |
| Lenis + sticky broken | MEDIUM | Audit Lenis config; switch to native scroll mode; if needed, replace Lenis with native `scroll-behavior: smooth` + selective FM `useScroll` |
| Pixel double-firing | LOW | Centralize all `fbq` calls through `track()`; remove direct calls; verify in Events Manager |
| Clarity recording PII | LOW | Add masking attributes; verify in next session recording; consider deleting historical recordings if exposure was real |
| Copy reads as AI | MEDIUM | Lenny full-page review; rewrite section by section against banned-phrase list; user-test with 3 outside readers |
| Roxo over-applied | MEDIUM | Tailwind config audit; restrict palette to single accent; section-by-section visual replacement |
| Mobile animation jank | MEDIUM-HIGH | Mobile-specific animation variants disabling parallax/blur; deploy and re-test on real device |
| Form abandonment > 60% | MEDIUM | Reduce fields to 3; remove required indicators; simplify submit copy; A/B if possible |
| Hero unclear (5-sec test fails) | HIGH | Rewrite hero copy; user-test 5 more readers; iterate; this is "rebuild the funnel entrance" — non-trivial |
| Lighthouse < 85 mobile | MEDIUM | Image audit; bundle analysis; remove non-essential animations on mobile; defer non-critical JS |

---

## Pitfall-to-Phase Mapping

For roadmap construction. Each pitfall maps to the phase that should mechanically prevent it.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| #1 Lenis + sticky | Animation architecture (Phase 1-2) | Sticky test page on mobile + desktop before any section uses sticky |
| #2 Hero LCP killed by animation | Hero implementation + Performance phase | Lighthouse CI check on every PR touching hero |
| #3 AI-voice copy | Copy phase (continuous) + final QA | Banned-phrase grep; Lenny review; 5-sec test with 3 outsiders |
| #4 Roxo overuse | Design system phase (Phase 1) | Tailwind palette restriction; desaturation screenshot audit |
| #5 WhatsApp link broken | CTA helper phase (early) | Real iOS + Android test of every CTA pre-launch |
| #6 Tracking dedupe / Clarity PII | Instrumentation phase | Meta Test Events; Clarity recording review |
| #7 `100vh` iOS jump | Hero + styling guideline | Real iPhone test of hero |
| #8 Scroll-jacking | Animation architecture + UX QA | Pin budget per section; clarity scroll-depth review |
| #9 Screenshot performance | Asset pipeline phase (early) | Lighthouse "properly size images" + total weight check |
| #10 FM client/server boundary | Component architecture phase | `"use client"` only in `/animations/*`; root layout Server Component |
| #11 Childish easing | Design tokens / motion system phase | `motion` config object; stakeholder review |
| #12 Reduced motion ignored | A11y + animation phase | Manual OS toggle test |
| #13 Form too long | Conversion section phase | Form has 3 fields max |
| #14 SEO/JSON-LD typos | Pre-launch SEO checklist | Rich Results Test; OG preview test in WhatsApp/LinkedIn |
| #15 Mobile parallax jank | Animation architecture + mobile perf audit | Real mid-range Android test |
| #16 Trust signals fake | Proof section phase + legal/copy review | Every claim cited; no invented numbers |
| #17 Hero unclear | Hero copy phase + user test | 5-second test with 3 outsiders |
| #18 Header/hero CTA conflict | Header + hero layout phase | Mobile screenshot of first viewport |
| #19 Font weight creep | Design system phase | Tailwind config; computed-style audit |
| #20 Generic illustrations | Visual asset pipeline | Asset review against banned-types list |
| #21 Hover on mobile | Component build + mobile QA | Real device tap test |
| #22 Scroll-depth measures wrong thing | Tracking phase | Section view events configured |
| #23 Preview URLs indexed | Deploy phase | Preview URL inspected for `noindex` |
| #24 Bundle bloat | Performance audit phase | Bundle analyzer report < 150KB first load |
| #25 Form double-submit | Form build phase | Disabled state + server dedupe |
| #26 Gradient overuse | Design system phase | Visual review per section |

---

## Sources & Confidence

**HIGH confidence (verifiable in official docs / well-established community knowledge):**
- Framer Motion + Next.js App Router patterns (`"use client"` boundaries, LazyMotion): Framer Motion v11 official docs
- Lenis + sticky positioning interaction: Studio Freight documented limitation; community-reported across many GitHub issues
- `100vh` iOS Safari address bar bug: documented WebKit behavior; `dvh`/`svh` units in CSS spec (Interop 2023+)
- LCP and animation interaction: Google Web.dev LCP guidance
- `wa.me` deep link format: WhatsApp official documentation
- `next/image` optimization: Next.js official docs
- WCAG AA requirements: W3C WCAG 2.1 specification

**MEDIUM-HIGH confidence (industry consensus, multiple credible sources):**
- AI-voice detection in PT-BR copy: pattern recognition from native PT-BR copywriters' published critiques + observed Claude/GPT failure modes
- Premium B2B SaaS design conventions (easing, durations, gradient discipline): consistent across Refactoring UI, Linear/Vercel/Stripe public design talks, Brad Frost articles
- Form length vs conversion (3 fields baseline): Unbounce, ConvertKit, MarketingSherpa published studies
- Mobile-vs-desktop scroll animation performance: Chrome DevRel articles on scroll performance; Smashing Magazine performance pieces

**LOW confidence (project-specific extrapolation):**
- Specific Clarity masking behavior across all input types: behavior shifts between Clarity versions; **verify by reviewing a test recording before launch** rather than trusting documentation
- Exact pin-duration thresholds (3-5 second budgets): heuristic from cinematic site post-mortems, but specific numbers are judgment-based; validate with real user tests

**Personal/observed:**
- WhatsApp link mobile-vs-desktop failure mode is a recurring issue in Brazilian SaaS landing pages — observed across multiple projects

---

*Pitfalls research for: Likro Landing Page (Next.js + Framer Motion + Lenis, clinics vertical, Meta Ads funnel, WhatsApp-primary)*
*Researched: 2026-05-15*
