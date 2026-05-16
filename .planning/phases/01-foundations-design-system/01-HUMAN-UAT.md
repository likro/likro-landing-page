---
status: partial
phase: 01-foundations-design-system
source: [01-VERIFICATION.md]
started: 2026-05-16T12:20:00Z
updated: 2026-05-16T12:20:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. /dev route returns 404 in production runtime
expected: `npm run build && npm start` then GET http://localhost:3000/dev returns HTTP 404. Build-time generates /dev as static chunk but Server Component calls `notFound()` before render. Verified structurally by `tests/app/dev-route.test.tsx`; runtime confirmation requires actual prod server.
result: [pending]

### 2. WhatsAppCta opens WhatsApp app on real mobile (iOS Safari + Android Chrome)
expected: Tap on `<WhatsAppCta>` on a real iPhone with WhatsApp installed opens the app directly to the chat with the pre-filled message. Same on Android Chrome. URL format `https://wa.me/<phone>?text=<encoded>` must NOT open `web.whatsapp.com` in browser. CTA-07. Not testable in any simulator/emulator with confidence.
result: [pending]

### 3. Analytics scripts initialize correctly in browser DOM with env vars set
expected: With NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_CLARITY_ID populated in `.env.local`, opening the site in a real browser shows: (a) `<script id="ms-clarity">` in `<head>`; (b) `<script id="meta-pixel">` initializes `window.fbq`; (c) GA4 script loads via `@next/third-parties`. `track('whatsapp_click')` fires all 3 vendors in DevTools network tab. Vitest validates the conditional mount logic but not the live snippet behavior.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
