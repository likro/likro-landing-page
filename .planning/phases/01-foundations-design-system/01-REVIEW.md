---
phase: 01-foundations-design-system
reviewed: 2026-05-16T00:00:00Z
depth: standard
files_reviewed: 52
files_reviewed_list:
  - .env.local.example
  - .gitignore
  - .prettierrc
  - README.md
  - components.json
  - docs/BRAND.md
  - eslint.config.mjs
  - next.config.ts
  - package.json
  - postcss.config.mjs
  - src/app/dev/page.tsx
  - src/app/globals.css
  - src/app/icon.tsx
  - src/app/layout.tsx
  - src/app/opengraph-image.tsx
  - src/app/page.tsx
  - src/app/robots.ts
  - src/app/sitemap.ts
  - src/components/providers/analytics-provider.tsx
  - src/components/providers/motion-config-provider.tsx
  - src/components/providers/smooth-scroll-provider.tsx
  - src/components/ui/button.tsx
  - src/components/ui/card.tsx
  - src/components/ui/container.tsx
  - src/components/ui/dialog.tsx
  - src/components/ui/headline.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/ui/sheet.tsx
  - src/components/ui/sonner.tsx
  - src/components/ui/textarea.tsx
  - src/components/ui/whatsapp-cta.tsx
  - src/components/ui/whatsapp-icon.tsx
  - src/content/whatsapp.ts
  - src/hooks/use-device-tier.ts
  - src/lib/analytics.ts
  - src/lib/env.ts
  - src/lib/utils.ts
  - src/lib/whatsapp.ts
  - tests/app/dev-route.test.tsx
  - tests/app/layout-providers.test.tsx
  - tests/brand-lock.test.ts
  - tests/components/ui/whatsapp-cta.test.tsx
  - tests/hooks/use-device-tier.test.tsx
  - tests/lib/analytics.test.ts
  - tests/lib/utils.test.ts
  - tests/lib/whatsapp.test.ts
  - tests/providers/analytics.test.tsx
  - tests/providers/smooth-scroll.test.tsx
  - tests/setup.ts
  - tsconfig.json
  - vitest.config.ts
findings:
  critical: 0
  warning: 5
  info: 5
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-16T00:00:00Z
**Depth:** standard
**Files Reviewed:** 52
**Status:** issues_found

## Summary

Phase 1 foundations are solid. The three critical invariants — WhatsApp URL centralization, brand-lock defense, and provider tree order — are correctly implemented and tested. TypeScript is strict with `noUncheckedIndexedAccess`, no `any` escapes were found in production paths, and all providers are properly gated behind `"use client"` without bleeding into the Server Component root layout.

Five warnings were found, none of which cause crashes today but each carries a realistic failure path in Phase 3+. The most important are: (1) `sonner.tsx` calling `useTheme()` when there is no `ThemeProvider` in the provider tree — this will silently degrade to "system" for now but becomes a runtime inconsistency when dark-mode sections arrive; (2) `dialog.tsx` and `sheet.tsx` referencing undeclared shadcn CSS tokens (`bg-background`, `ring-ring`, `text-muted-foreground`, `bg-secondary`, `text-foreground`) that have no backing `@theme` declaration, so the visual output will be blank/transparent rather than styled; and (3) a hardcoded `#7c3aed` hex in `icon.tsx`, which is a minor but documented brand-lock violation.

Five info items cover style and maintainability concerns that won't cause bugs but should be addressed before Phase 3 introduces real UI sections.

---

## Warnings

### WR-01: `useTheme()` called with no `ThemeProvider` in provider tree

**File:** `src/components/ui/sonner.tsx:14`
**Issue:** `sonner.tsx` imports `useTheme` from `next-themes` and reads `theme` to pass to `<Sonner theme={theme}>`. However, `src/app/layout.tsx` does not mount a `ThemeProvider` from `next-themes` anywhere in the provider tree. `useTheme()` without a `ThemeProvider` ancestor returns `{ theme: undefined }`, causing the code to silently fall back to the default value `"system"` via the `const { theme = "system" } = useTheme()` destructuring. This is harmless today (Phase 1 has a single light surface) but will become a silent inconsistency when dark-mode section alternation is introduced in Phase 3: Sonner toasts will not reflect the section's visual context. Additionally, `next-themes` adds an unnecessary dependency that is never wired up.
**Fix:** Either remove `next-themes` entirely and hardcode `theme="light"` (since CLAUDE.md specifies no dark-mode toggle in v1), or add `ThemeProvider` to the layout provider tree. The minimal fix for Phase 1:
```tsx
// src/components/ui/sonner.tsx
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      // ... rest unchanged
    />
  );
};
```

---

### WR-02: `dialog.tsx` and `sheet.tsx` use undeclared shadcn CSS tokens

**File:** `src/components/ui/dialog.tsx:64,73,141` and `src/components/ui/sheet.tsx:63,78,115,128`
**Issue:** These components reference Tailwind utilities backed by CSS custom properties that shadcn's default theme declares but Likro's `globals.css` does not: `bg-background`, `ring-ring`, `ring-offset-background`, `text-muted-foreground`, `bg-accent`, `text-foreground`, `bg-secondary`. Since Tailwind v4 emits no CSS for undeclared tokens, these classes are silent no-ops. The dialog content will have a transparent/white background, the close button's ring will be invisible, and all "muted foreground" text will inherit its parent color unintentionally. This compounds with `bg-accent` in `dialog.tsx:73` which, if `accent-primary` is what resolves, would make the close button background purple on open — but since `bg-accent` is not the same as `bg-accent-primary`, it will also be a no-op.

Currently `Dialog` and `Sheet` are imported only on the `/dev` showcase route, so this is invisible in production, but any Phase 3+ modal usage will render broken.

**Fix:** Either add the missing token aliases to `globals.css` pointing at Likro brand tokens, or rewrite the classes directly with Likro tokens. Recommended approach (add to `globals.css` `@theme` block):
```css
/* shadcn compat aliases (used by dialog.tsx / sheet.tsx) */
--color-background: var(--color-surface-lighter);
--color-foreground: var(--color-text-primary);
--color-muted-foreground: var(--color-text-muted);
--color-ring: var(--color-accent-primary);
--color-secondary: var(--color-neutral-100);
--color-accent: var(--color-accent-primary);
```
Or rewrite dialog/sheet close-button classes using `ring-accent-primary`, `text-text-muted`, `bg-surface-lighter` directly, eliminating the shadcn dependency.

---

### WR-03: Hardcoded `#7c3aed` hex in `icon.tsx` (brand-lock violation)

**File:** `src/app/icon.tsx:17`
**Issue:** The inline style `background: "#7c3aed"` uses the raw hex instead of a CSS token. `next/og` inline styles in `ImageResponse` cannot use CSS variables (they run in an edge renderer that does not process CSS), so a token is genuinely not applicable here. The issue is that the brand-lock grep test in `tests/brand-lock.test.ts` only scans for Tailwind utility class patterns (`bg-accent-NN`), not raw hex strings in inline styles. Therefore, if this hex drifts from the canonical value, nothing will catch it.

The violation is documented as an exception in the comment (`Phase 7 polish final pode trocar por logo`), but the drift risk remains.
**Fix:** Add a shared constant for brand colors that `next/og` files import:
```ts
// src/lib/brand-tokens.ts (new file)
/** Canonical Likro brand colors for use in next/og ImageResponse inline styles,
 *  where CSS variables are not available. Keep in sync with globals.css @theme. */
export const BRAND = {
  accentPrimary: "#7c3aed",
  surfaceDark: "#0a0a0b",
} as const;
```
Then in `icon.tsx` and `opengraph-image.tsx`:
```tsx
import { BRAND } from "@/lib/brand-tokens";
// ...
background: BRAND.accentPrimary,
```
Extend `tests/brand-lock.test.ts` to scan for raw hex literals `#7c3aed` and `#6d28d9` outside of `lib/brand-tokens.ts`.

---

### WR-04: `buildWhatsAppUrl` throws in production if `NEXT_PUBLIC_WA_NUMBER` is missing — uncaught by WhatsAppCta

**File:** `src/components/ui/whatsapp-cta.tsx:51` / `src/lib/whatsapp.ts:66`
**Issue:** `buildWhatsAppUrl` throws an `Error` in production when `NEXT_PUBLIC_WA_NUMBER` is unset. In `WhatsAppCta.handleClick`, the call to `buildWhatsAppUrl` at line 51 is inside a plain `async` function with no try/catch. An uncaught error inside an async onClick handler in React 19 will propagate to the nearest Error Boundary (none exists in the current tree), causing the entire app to unmount in production if the env var is ever missing or accidentally deleted from Vercel's environment.

The 250ms `await new Promise(...)` at line 50 already runs before the throw at line 51, meaning `loading` state is `true` and `track()` has already fired before the crash — the button becomes permanently disabled from the user's perspective until reload.
**Fix:** Wrap the URL construction in a try/catch inside `handleClick`:
```tsx
const handleClick = async () => {
  setLoading(true);
  track("whatsapp_click", { location });
  await new Promise((r) => setTimeout(r, 250));
  try {
    const url = buildWhatsAppUrl(WHATSAPP_MESSAGES[location], location);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[WhatsAppCta]", err);
    }
    // Silently fail in production — user sees the button re-enable.
  } finally {
    setLoading(false);
  }
};
```

---

### WR-05: `robots.ts` uses `VERCEL_ENV` instead of `NODE_ENV` — inconsistent with `/dev` guard pattern and risks wrong disallow in Vercel preview

**File:** `src/app/robots.ts:4`
**Issue:** `robots()` checks `process.env.VERCEL_ENV === "production"` to decide whether to allow crawlers. `VERCEL_ENV` is a Vercel-injected variable; it is `undefined` in local dev (`npm run build && npm start`) and also absent in non-Vercel CI. When `VERCEL_ENV` is not set, `isProd` is `false`, so the robots output will disallow all crawlers — correct for local dev, but this means a standard non-Vercel production build (e.g., Docker) will also return `Disallow: /`, silently blocking SEO. 

More importantly, Vercel Preview deployments have `VERCEL_ENV === "preview"`, which is also correctly blocked — that part is intentional and correct. The issue is the undocumented assumption that production always means Vercel.

Additionally, the sitemap generator (`sitemap.ts`) always emits the canonical URL unconditionally regardless of environment, so disallow+sitemap can appear together in preview deploys if the sitemap URL is ever exposed.
**Fix:** Document the Vercel-only assumption explicitly, or add a fallback:
```ts
// robots.ts
const isProd =
  process.env.VERCEL_ENV === "production" ||
  // Fallback: non-Vercel production builds set NODE_ENV=production
  (typeof process.env.VERCEL_ENV === "undefined" &&
    process.env.NODE_ENV === "production");
```

---

## Info

### IN-01: `next.config.ts` is empty — no security headers configured

**File:** `next.config.ts:3-5`
**Issue:** The Next.js config is a no-op object. For a landing page with Meta Pixel and GA4 scripts loaded via `next/script`, at minimum a `Content-Security-Policy` header and `X-Frame-Options: DENY` should be configured before Phase 6 deploys analytics to production. This is not a bug today but will require a config change at deploy time that could be forgotten.
**Fix:** Add to `nextConfig` before Phase 6:
```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
```
CSP can be added at deploy time when pixel/GA4 IDs are confirmed.

---

### IN-02: `sitemap.ts` uses `new Date()` — produces a different `lastModified` on every build

**File:** `src/app/sitemap.ts:7`
**Issue:** `lastModified: new Date()` resolves at build time, which is correct for SSG. However, since `sitemap.ts` is not explicitly marked `export const dynamic = "force-static"`, Next.js 15 App Router may treat it as dynamic (rendering per request on the edge), causing the sitemap's `lastModified` to change on every request. This results in search crawlers seeing a constantly modified page, which can inflate crawl budget consumption.
**Fix:** Either pin the date to the actual last content change date, or add:
```ts
export const dynamic = "force-static";
```

---

### IN-03: `analytics-provider.tsx` inlines Meta Pixel init script via `dangerouslySetInnerHTML` — XSS risk surface acknowledged but ID injection is unescaped

**File:** `src/components/providers/analytics-provider.tsx:44`
**Issue:** The pixel ID is injected into the inline script via template literal interpolation: `fbq('init', '${env.NEXT_PUBLIC_META_PIXEL_ID}');`. The `NEXT_PUBLIC_META_PIXEL_ID` value is sourced from environment variables and is expected to be a purely numeric string (e.g., `"1234567890123456"`). However, there is no runtime assertion or sanitization enforcing this. If a misconfigured `.env.local` contains a value like `'); alert(1); //`, the injected script becomes exploitable. The same pattern applies to `NEXT_PUBLIC_CLARITY_ID` (line 62). Both env vars are NEXT_PUBLIC and visible in the build output regardless.

This is low-risk (env vars are operator-controlled, not user-input), but the inline script path means a misconfiguration at deploy time results in a stored XSS that fires for all visitors.
**Fix:** Add numeric/alphanumeric validation in `lib/env.ts` or at the injection site:
```ts
// Before injecting into dangerouslySetInnerHTML:
const safePixelId = /^\d+$/.test(env.NEXT_PUBLIC_META_PIXEL_ID ?? "") 
  ? env.NEXT_PUBLIC_META_PIXEL_ID 
  : null;
const safeClarityId = /^[a-z0-9]+$/i.test(env.NEXT_PUBLIC_CLARITY_ID ?? "") 
  ? env.NEXT_PUBLIC_CLARITY_ID 
  : null;
// Then use safePixelId / safeClarityId in the conditional guards
```

---

### IN-04: `useDeviceTier` SSR initial state is `"desktop"` — causes hydration mismatch on real mobile devices

**File:** `src/hooks/use-device-tier.ts:20`
**Issue:** The hook initializes to `useState<DeviceTier>("desktop")` for SSR safety, then corrects via `useEffect`. This is the standard pattern and avoids a hydration crash, but it means mobile users will receive a brief flash where the server-rendered HTML reflects "desktop" tier assumptions, and the client corrects after hydration. In Phase 3+ when this hook drives animation choreography (different animation on mobile vs desktop), mobile users may see a frame of the desktop animation before the correct mobile animation takes over. This is a known trade-off, but worth flagging so Phase 2 animation primitive authors can account for it with a "mounted" guard.
**Fix:** No immediate code change needed. Document the SSR initial state assumption and ensure Phase 2 animation primitives use `opacity-0` or equivalent for the initial unmounted frame to prevent visual flash:
```tsx
// Pattern for motion primitives consuming useDeviceTier:
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null; // or return SSR-safe static fallback
```

---

### IN-05: `brand-lock.test.ts` grep does not catch hardcoded hex literals — gap in layer (b) defense

**File:** `tests/brand-lock.test.ts:35-36`
**Issue:** The `FORBIDDEN_REGEX` in the brand-lock test only matches Tailwind utility shade patterns (`bg-accent-50`, etc.). It does not catch hard-coded hex values (`#7c3aed`, `#6d28d9`) used in JSX inline styles, CSS arbitrary values (`bg-[#7c3aed]`), or raw CSS strings. As found in `icon.tsx:17`, a hex literal already exists. Arbitrary value usage (`bg-[#7c3aed]`) is a documented escape hatch in Tailwind v4 that completely bypasses the token system and this test.
**Fix:** Add two additional patterns to the brand-lock test:
```ts
// Forbid raw hex literals (outside of /lib/brand-tokens.ts if that file is created)
const FORBIDDEN_HEX_REGEX = /#7c3aed|#7C3AED|#6d28d9|#6D28D9/gi;
// Forbid Tailwind arbitrary values with brand colors
const FORBIDDEN_ARBITRARY_REGEX = /\[#7c3aed\]|\[#6d28d9\]|\[#7C3AED\]|\[#6D28D9\]/gi;
```
Exclude `lib/brand-tokens.ts` (canonical source) from these checks if WR-03 fix is applied.

---

_Reviewed: 2026-05-16T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
