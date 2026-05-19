# Phase 5: Conversion (Form + Footer + Floating + CTAs distribuídos) — Research

**Researched:** 2026-05-19
**Domain:** Conversion funnel (form submit + WhatsApp deeplinks + sticky/floating UI + analytics)
**Confidence:** HIGH (stack travado pelo projeto + integrações Resend/Sheets bem documentadas)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Form destination (Caminho A):** Resend (email transacional para `LEAD_TO_EMAIL`) + Google Sheets via service account, em paralelo. Não usar SMTP genérico, Formspree, Getform, ou CRM (HubSpot/Pipedrive/RD Station).
- **Form fields:** apenas 3 visíveis — `nome`, `whatsapp`, `mensagem` opcional — + 1 honeypot escondido. Mais que isso quebra o tom premium minimalista.
- **Honeypot:** invisível via CSS off-screen + `aria-hidden="true"` + `tabIndex={-1}` + `autocomplete="off"`. NUNCA `display:none` (bots modernos detectam).
- **Validação:** Zod schema compartilhado client (RHF resolver) ↔ server (edge route). Nome ≥ 2 chars; WhatsApp dígitos+espaços+parênteses, normalizado server-side; mensagem ≤ 1000 chars.
- **Idempotência dual-write:** `Promise.allSettled([resend, sheets])`. Sucesso se **pelo menos uma** das pernas pegou. Logar falha parcial server-side.
- **Edge route preferida (`runtime = "edge"`)** quando viável; cair pra `runtime = "nodejs"` SEM CERIMÔNIA se Google Sheets exigir Node. Performance > ortodoxia.
- **Submissão UX:** sucesso inline sem redirect (bloco de confirmação substitui form); erro mostra inline + 1 retry; após 2ª falha sugere WhatsApp.
- **Double-submit:** botão `disabled` durante request + dedup server-side por número WhatsApp em janela de 60s.
- **Floating WhatsApp:** mobile only (≤ md breakpoint), aparece após scroll > 50vh, esconde quando form em viewport, posiciona em thumb zone com `env(safe-area-inset-bottom)`. SEM pulse, bounce, badge, ou crescimento.
- **CTAs distribuídos:** 6 pontos — hero (existe), header (existe), fim da Pain (novo), fim da Product (novo), fim da Proof / pré-form (novo), footer (novo) + floating mobile (novo). Mínimo absoluto: 4.
- **Header hide-on-scroll:** invisível ao scrollar down > 80px de delta; reaparece ao scrollar up > 8px ou parar. Primeira 100vh fica sempre visível. `prefers-reduced-motion` desliga o hide.
- **Footer institucional enxuto:** 1 linha desktop / 2 linhas mobile. Logo + "© 2026 Likro" + 2 links sutis (Política, Contato). Fundo DARK editorial (continuidade da Proof).
- **Tom premium silencioso anti-infoproduto:** SEM caps lock, urgência fabricada, "CLIQUE AGORA", "vagas limitadas". Convites consultivos ("vamos conversar sobre operação", "sem pressa").
- **WhatsApp centralizado:** todos os CTAs consomem `buildWhatsAppUrl(message, location)` de `src/lib/whatsapp.ts`. Zero hard-code.
- **Tracking:** infra `track()` da Phase 1 já carrega `event_id` UUID v4 — adicionar eventos novos (`form_focus`, `form_submit_attempt/success/error`) ao tipo `AnalyticsEvent`. UTM extraído de `URLSearchParams` no mount.
- **PII masking Clarity:** form wrapper recebe `data-clarity-mask="true"`.

### Claude's Discretion

- Implementação técnica do edge route (formato do JWT do service account, biblioteca de email templating, padrão de error logging server-side).
- Escolha entre `googleapis` (Node-only, gigante) vs JWT manual via `jose` (edge-friendly) vs REST direto via `fetch` — research recomenda.
- Rate limiting: solução zero-deps in-memory aceitável na v1 OU Upstash Marketplace (research recomenda).
- Pattern de hide-on-scroll header — pode usar Motion v12 `useScroll`+`useMotionValueEvent` (recomendado) ou hook custom `scroll` listener throttled via `rAF`.
- Pattern de "esconder floating quando form em viewport" — `IntersectionObserver` direto no componente vs context compartilhado entre Form e FloatingWhatsApp.
- Microcopy exato (3 variantes em PR pra Lenny aprovar, como nas seções da Phase 4).
- Decisão final RHF + Server Action vs RHF + edge route fetch (research recomenda — edge route ganha pela compatibilidade com progressive enhancement).
- Local de armazenamento do dedup window de 60s (Map in-memory por instance, ou Vercel KV).

### Deferred Ideas (OUT OF SCOPE)

- CRM integration (HubSpot, Pipedrive, RD Station).
- Cookie consent / LGPD modal (Phase 7 ou backlog).
- Conteúdo da página `/privacy` (Phase 5 só linka placeholder).
- Meta CAPI retrofit (event_id já carregado, retrofit fica pra quando conta Meta Ads ativar conversões).
- Polish visual rhythm / card repetition (Phase 999.1).
- A/B test de microcopy.
- Verificação de dashboards Pixel/GA4/Clarity (Phase 6).
- Lighthouse/A11y/SEO final (Phase 7).
- Cookie banner / LGPD compliance formal.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **CTA-03** | `<WhatsAppCta>` recebe `location` como prop obrigatória; vira evento + UTM | Já implementado em `src/components/ui/whatsapp-cta.tsx`. Phase 5 apenas **consome** em 4 novos pontos. Verified: componente já chama `track('whatsapp_click', {location})` antes do open. |
| **CTA-05** | CTAs persistentes em ≥ 4 pontos (hero, fim Pain, fim Product, footer/fim) | Pattern: importar `<WhatsAppCta>` no fim de `src/sections/Pain/index.tsx`, `src/sections/Product/index.tsx`, no novo `<Footer>`, e no novo `<Form>` (CTA secundário pré-submit). 6 pontos no total (hero + header já existem da Phase 3). |
| **CTA-06** | Floating WhatsApp mobile aparece após scroll > 50vh na thumb zone | Implementar `<FloatingWhatsApp>` cliente com `useScroll` Motion + `IntersectionObserver` para esconder quando form visível. Variant `floating` do `<WhatsAppCta>` já existe (com `[padding-bottom:env(safe-area-inset-bottom)]`). |
| **CTA-07** | Deep link testado em iOS Safari + Android Chrome reais | Manual QA matrix obrigatório. URL format já validado em Phase 3 (`wa.me/<phone>?text=`). |
| **CTA-08** | Mensagem pré-preenchida específica por `location`, aprovada por Lenny no PR | `WHATSAPP_MESSAGES` já populado em `src/content/whatsapp.ts` (Phase 1). Phase 5 pode revisar copy de cada location no PR. |
| **CTA-09** | Form 3 campos + honeypot, visual premium, alinhado brand book | Novo componente `<LeadForm>` cliente com RHF + Zod + honeypot off-screen. Tokens: off-white bg, `text-text-primary`, accent `#7C3AED` no botão. |
| **CTA-10** | Submissão vai pra edge route `/api/lead` (Next.js Route Handler) que valida com Zod + entrega ao webhook | Novo `src/app/api/lead/route.ts` com `runtime` configurável. Dual-write Resend + Sheets via `Promise.allSettled`. |
| **CTA-11** | Previne double-submit (botão disabled) + sucesso inline sem redirect | RHF `isSubmitting` controla disabled. State `'idle' \| 'submitting' \| 'success' \| 'error'` no client renderiza bloco diferente. |
| **CTA-12** | Form + edge route deduplicam por número WhatsApp em janela de 60s | Map in-memory `{ [normalizedPhone: string]: timestamp }` no module scope da route (compartilhado por warm invocations da mesma instance). Limitação aceitável v1 (research detalha tradeoff). |
| **MOBILE-02** | Floating respeita `env(safe-area-inset-bottom)` (notch/home indicator) | Variant `floating` do `<WhatsAppCta>` já tem `[padding-bottom:env(safe-area-inset-bottom)]`. Phase 5 valida em iOS real. |
| **MOBILE-06** | Header hide-on-scroll-down, show-on-scroll-up | Custom hook `useHeaderVisibility` em `src/hooks/`, OU pattern Motion v12 `useScroll` + `useMotionValueEvent` (recomendado — research detalha). Refatorar `Header.tsx` para wrapar em `motion.header animate={{ y: hidden ? -100% : 0 }}`. |
</phase_requirements>

## Summary

Phase 5 fecha o funil. A maior parte do trabalho é **integração** (Resend, Google Sheets via service account, rate limit, dedup), não nova UI — a UI são 3 componentes pequenos (`<LeadForm>`, `<FloatingWhatsApp>`, `<Footer>`) + 1 refactor (`<Header>` recebe hide-on-scroll). Cinco CTAs WhatsApp novos consomem o `<WhatsAppCta>` já travado.

A decisão técnica mais consequente é **edge vs node runtime**. A boa notícia: Resend SDK v6.x é fetch-based, edge-compatível. A complicada: `googleapis` é Node-only (171MB, depende de `gaxios`/`google-auth-library` com APIs Node). **Recomendação: edge runtime + JWT manual via `jose` (já uma dep transitiva possível, senão adicionar — 50KB, edge-compatível, oficialmente suportado por Vercel)** para mintar o access token Google e POSTAR direto via `fetch` no endpoint `https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}:append`. Isso mantém o route handler todo em edge — latência baixa, bundle pequeno, zero Node APIs.

Form: **RHF + Zod + edge route via `fetch`** (não Server Action). Razão: RHF não funciona sem JS hidratado mesmo dentro de Server Action, então a "vantagem de progressive enhancement do Server Action" desaparece quando você usa RHF. Edge route via `fetch(/api/lead)` é mais simples, idempotente, e permite que o mesmo endpoint sirva form HTML nativo no fallback (se Lenny quiser progressive enhancement real depois, troca o componente client por `<form action="/api/lead" method="POST">` que retorna `redirect()` ou HTML — endpoint não muda).

**Primary recommendation:** edge route + `jose` + `Promise.allSettled([resend, sheets])` + Motion v12 hide-on-scroll header + IntersectionObserver pra esconder floating quando form em viewport + honeypot off-screen + dedup in-memory v1 (Upstash promovido pra v2 se spam justificar).

## Standard Stack

### Core (já instalado — pinned no `package.json`)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.18` | App Router, Route Handler edge runtime, Metadata | [VERIFIED: package.json + Phase 1] |
| `react` | `^19.0.0` | UI runtime | [VERIFIED: package.json] |
| `motion` | `^12.38.0` | `useScroll`, `useMotionValueEvent`, `motion.header animate` para hide-on-scroll | [VERIFIED: package.json + motion.dev/tutorials/react-scroll-hide-header] |
| `react-hook-form` | `^7.75.0` | State do form, validação client, `isSubmitting` | [VERIFIED: package.json] |
| `zod` | `^3.23.0` | Schema compartilhado client ↔ server | [VERIFIED: package.json] |
| `@hookform/resolvers` | `^3.9.0` | Bridge RHF ↔ Zod | [VERIFIED: package.json] |
| `lucide-react` | `^0.460.0` | Ícones (Loader2, Send, ArrowRight, X) | [VERIFIED: package.json] |
| `sonner` | `^2.0.7` | Toast pra feedback de erro (alternativo ao inline) | [VERIFIED: package.json — já presente, decisão de UX se usa] |
| `tailwindcss` | `^4.3.0` | Styling | [VERIFIED: package.json] |

### Supporting (NOVAS dependências a instalar)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `resend` | `^6.12.3` | Envio de email transacional ao Lenny. SDK fetch-based, edge-compatível. | [VERIFIED via npm view: 6.12.3 latest, May 2026]. Source: github.com/resend/resend-node/blob/canary/src/resend.ts usa `fetch` nativo. Bundle: ~30KB. Edge OK. |
| `jose` | `^6.2.3` | Assinar JWT RS256 do service account Google em Web Crypto API (edge). | [VERIFIED via npm view: 6.2.3 latest, May 2026]. Oficialmente recomendado por Vercel para auth na edge. Substitui `jsonwebtoken` (Node-only). |
| `server-only` | `^0.0.1` | Marca módulos como server-only — previne leak de `RESEND_API_KEY` e `GOOGLE_SA_*` pro bundle client. | [CITED: nextjs.org/docs/app/getting-started/server-and-client-components] Obrigatório em `src/lib/server-env.ts`. |

**NÃO instalar:**
- `googleapis` — 171MB, Node-only, `import {google}` usa `process.cwd`, `fs`, `dns`. Inviável em edge. [VERIFIED: github.com/googleapis/google-api-nodejs-client]
- `google-spreadsheet` — Node-only por dependência transitiva `google-auth-library`.
- `nodemailer` — Node-only, faria sentido só se cair pro Caminho B (SMTP) — descartado pelo Lenny.
- `react-email` / `@react-email/components` — overkill pra um único template de notificação ao Lenny. String literal HTML basta. Promover pra v2 se templates crescerem.

### Alternativas Consideradas

| Em vez de | Poderia usar | Tradeoff |
|-----------|--------------|----------|
| `jose` + `fetch` direto na Sheets REST API | `googleapis` SDK | SDK é mais ergonômico mas Node-only; força `runtime = "nodejs"`. Cold start maior, bundle maior. **Não vale para um único call `values:append`.** |
| RHF + edge route via `fetch` | RHF + Server Action | Server Action força `"use server"` que IMPORTA file em bundle do componente client; risco maior de leak. Edge route isolada é mais limpa. RHF não é progressive-enhancement-friendly de qualquer forma (precisa JS hidratado pra interceptar submit). |
| Dedup in-memory `Map` | Vercel KV / Upstash Redis | KV/Upstash funciona cross-instance; Map só dedupa em warm invocation da mesma instance. **Aceitável na v1** (spam volume baixo; pior caso é um lead duplicado entrar). Promover se virar problema real. |
| Honeypot off-screen `position:absolute; left:-9999px; opacity:0` | reCAPTCHA / hCaptcha | Captcha mata UX premium, mata mobile, dependência terceira. Honeypot bem-feito + dedup + rate limit cobre 95% dos bots. Captcha vira escalada se necessário. |
| Motion `useScroll` + `useMotionValueEvent` (header hide) | Hook custom `scroll` listener + `rAF` throttle | Motion já está instalado, integra com `prefers-reduced-motion` via `<MotionConfigProvider>`, evita reinventar throttle. **Motion ganha.** |

**Installation:**

```bash
npm install resend jose server-only
```

**Version verification (executado em 2026-05-19):**

```
npm view resend version   → 6.12.3
npm view jose version     → 6.2.3
npm view googleapis ver   → 171.4.0  (referência — NÃO instalar)
```

## Architecture Patterns

### Recommended File Structure

```
src/
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts           # NEW — edge route handler (POST)
│   ├── privacy/
│   │   └── page.tsx               # NEW — placeholder mínimo (Phase 7 escreve)
│   └── page.tsx                   # EDIT — adicionar <Form /> + <FloatingWhatsApp /> + <Footer />
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # EDIT — wrapar em motion.header animate
│   │   └── Footer.tsx             # NEW
│   └── ui/
│       └── (whatsapp-cta.tsx)     # NÃO MEXER — já travado da Phase 1
├── hooks/
│   ├── use-header-visibility.ts   # NEW (opção A) ou
│   └── use-form-in-view.ts        # NEW — para floating saber quando esconder
├── lib/
│   ├── server-env.ts              # NEW — RESEND_API_KEY, GOOGLE_SA_*, LEAD_TO_EMAIL
│   ├── lead-schema.ts             # NEW — Zod schema compartilhado
│   ├── lead-dedup.ts              # NEW — Map in-memory + função check/register
│   ├── lead-resend.ts             # NEW — sendLeadEmail(payload)
│   ├── lead-sheets.ts             # NEW — appendLeadRow(payload) via jose + fetch
│   └── analytics.ts               # EDIT — adicionar 'form_focus' ao tipo (já tem os outros)
├── sections/
│   ├── Form/
│   │   ├── index.tsx              # NEW — server component wrapper + section copy
│   │   ├── LeadForm.tsx           # NEW — client component (RHF + Zod)
│   │   └── FormSuccess.tsx        # NEW — bloco de confirmação inline
│   ├── Floating/
│   │   └── FloatingWhatsApp.tsx   # NEW — client component, useScroll + IntersectionObserver
│   ├── Pain/index.tsx             # EDIT — adicionar <WhatsAppCta location="pain" /> no fim
│   ├── Product/index.tsx          # EDIT — adicionar <WhatsAppCta location="product" /> no fim
│   └── Proof/index.tsx            # EDIT — adicionar <WhatsAppCta location="proof" /> dominante
└── content/
    ├── form.ts                    # NEW — microcopy do form (3 variantes pra PR)
    └── footer.ts                  # NEW — microcopy do footer
```

### Pattern 1: Edge Route Handler (dual-write)

**What:** Single edge route `/api/lead` que valida com Zod, deduplica, dispara Resend + Sheets em paralelo, retorna sucesso se pelo menos uma das duas pegou.

**When to use:** Único endpoint de form da landing. Não generalizar — escopo travado em 1 form.

**Example:**

```typescript
// Source: synthesized from nextjs.org/docs/app/api-reference/file-conventions/route
//         + github.com/resend/resend-node README
//         + jose docs (panva.github.io/jose)
//         + sdorra.dev/posts/2023-08-03-google-auth-on-the-edge

// src/app/api/lead/route.ts
import "server-only";
import { NextRequest } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { sendLeadEmail } from "@/lib/lead-resend";
import { appendLeadRow } from "@/lib/lead-sheets";
import { checkAndRegisterDedup } from "@/lib/lead-dedup";

export const runtime = "edge";
export const dynamic = "force-dynamic"; // route handler — never cache

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot triggered → return fake success (don't tell bots they were caught)
  if (typeof body === "object" && body !== null && (body as Record<string, unknown>).company) {
    return Response.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const lead = parsed.data;

  // Dedup window — 60s
  if (checkAndRegisterDedup(lead.whatsapp)) {
    return Response.json({ ok: true, deduped: true }); // success-but-quiet
  }

  // Dual-write
  const [emailResult, sheetResult] = await Promise.allSettled([
    sendLeadEmail(lead),
    appendLeadRow(lead),
  ]);

  const emailOK = emailResult.status === "fulfilled";
  const sheetOK = sheetResult.status === "fulfilled";

  if (!emailOK) console.error("[lead] resend failed:", emailResult.reason);
  if (!sheetOK) console.error("[lead] sheets failed:", sheetResult.reason);

  // Success se PELO MENOS UMA pegou
  if (emailOK || sheetOK) {
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
}
```

### Pattern 2: Google Sheets via JWT manual (`jose` + `fetch`)

**What:** Mintar JWT RS256 com `jose` no edge runtime, trocar por access token na OAuth2 endpoint do Google, fazer POST no `values:append` da Sheets API v4.

**Why:** `googleapis` SDK é Node-only (171MB). Para um único call de "append row", JWT manual é trivial e mantém o route handler 100% edge.

**Example:**

```typescript
// Source: synthesized from sdorra.dev/posts/2023-08-03-google-auth-on-the-edge
//         + Google Sheets API v4 docs (developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append)
//         + jose docs (github.com/panva/jose)

// src/lib/lead-sheets.ts
import "server-only";
import { SignJWT, importPKCS8 } from "jose";
import { serverEnv } from "@/lib/server-env";
import type { Lead } from "@/lib/lead-schema";

const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

async function getAccessToken(): Promise<string> {
  // CRITICAL: private key env var stores \n literal → unescape to real newlines
  const privateKeyPem = serverEnv.GOOGLE_SA_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ scope: SCOPES })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serverEnv.GOOGLE_SA_CLIENT_EMAIL)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function appendLeadRow(lead: Lead): Promise<void> {
  const token = await getAccessToken();
  const sheetId = serverEnv.GOOGLE_SHEET_ID;
  const range = "Leads!A:E";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`;

  const row = [
    new Date().toISOString(),
    lead.name,
    lead.whatsapp,
    lead.message ?? "",
    lead.utm ?? "",
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`sheets append failed: ${res.status} ${text}`);
  }
}
```

### Pattern 3: Resend send (edge-compatible)

```typescript
// Source: github.com/resend/resend-node + resend.com/docs/send-with-nextjs

// src/lib/lead-resend.ts
import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/server-env";
import type { Lead } from "@/lib/lead-schema";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function sendLeadEmail(lead: Lead): Promise<void> {
  const { error } = await resend.emails.send({
    from: "Likro Leads <leads@likro.com.br>", // domínio precisa estar verificado em resend.com
    to: serverEnv.LEAD_TO_EMAIL,
    replyTo: undefined,
    subject: `Novo lead — ${lead.name}`,
    html: buildLeadHtml(lead),
  });
  if (error) throw new Error(`resend failed: ${error.message}`);
}

function buildLeadHtml(lead: Lead): string {
  // String literal simples — sem react-email overhead pra um único template
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px;">
      <h2 style="font-size: 18px;">Novo lead da landing</h2>
      <p><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(lead.whatsapp)}</p>
      ${lead.message ? `<p><strong>Mensagem:</strong><br/>${escapeHtml(lead.message)}</p>` : ""}
      ${lead.utm ? `<p style="color:#666;font-size:12px;">UTM: ${escapeHtml(lead.utm)}</p>` : ""}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c] as string);
}
```

### Pattern 4: Hide-on-scroll Header (Motion v12)

```typescript
// Source: motion.dev/tutorials/react-scroll-hide-header (verified 2026-05-19)

// src/components/layout/Header.tsx — adapted
"use client";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useReducedMotion } from "motion/react";
import { useState } from "react";

export function Header() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const delta = current - previous;
    // Hide quando scroll down > 80px de delta acumulado E já passou da 1ª viewport
    if (current > window.innerHeight && delta > 80) {
      setHidden(true);
    } else if (delta < -8) {
      setHidden(false);
    }
  });

  return (
    <motion.header
      className="fixed top-0 z-20 w-full"
      animate={{ y: reduced || !hidden ? 0 : "-100%" }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* … existing markup … */}
    </motion.header>
  );
}
```

**Nota crítica:** O `Header` atual em `src/components/layout/Header.tsx` é **server component** (sem `"use client"`). Refatorar pra client component implica perder o SSR do logo/link — aceitável dado que o conteúdo é trivial e o `<Link>` do Next continua funcionando. Confirmar com Lenny no PR.

### Pattern 5: Floating WhatsApp visibility (IntersectionObserver via Context)

```typescript
// src/sections/Floating/FloatingWhatsApp.tsx
"use client";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { useFormInView } from "@/hooks/use-form-in-view";

export function FloatingWhatsApp() {
  const { scrollY } = useScroll();
  const [pastThreshold, setPastThreshold] = useState(false);
  const formInView = useFormInView();

  useMotionValueEvent(scrollY, "change", (y) => {
    setPastThreshold(y > window.innerHeight * 0.5);
  });

  const visible = pastThreshold && !formInView;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed bottom-0 right-0 z-40 md:hidden"
    >
      <WhatsAppCta variant="floating" location="floating" />
    </motion.div>
  );
}
```

**Hook compartilhado:**

```typescript
// src/hooks/use-form-in-view.ts
"use client";
import { useEffect, useState } from "react";

export function useFormInView(targetId = "lead-form-section"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetId]);
  return inView;
}
```

### Pattern 6: Honeypot field (off-screen, NOT display:none)

```tsx
// src/sections/Form/LeadForm.tsx — excerpt
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    left: "-9999px",
    width: "1px",
    height: "1px",
    overflow: "hidden",
  }}
>
  <label htmlFor="company">
    Empresa (não preencher)
    <input
      id="company"
      type="text"
      tabIndex={-1}
      autoComplete="off"
      {...register("company")}
    />
  </label>
</div>
```

**Source:** [CITED: css-tricks.com/building-a-honeypot-field-that-works] + [CITED: formshield.dev/blog/form-honeypot-implementation-guide] — confirmam que `display:none` é detectado por bots modernos; off-screen + `aria-hidden` + `tabindex=-1` + `autocomplete="off"` é o padrão 2026.

### Anti-Patterns to Avoid

- **`display: none` no honeypot:** bots detectam computed style. Use off-screen.
- **`googleapis` SDK em edge runtime:** simplesmente não roda. Erro `process.cwd is not a function`.
- **`framer-motion`** import path: pacote renomeado para `motion`. Usar `import { motion } from "motion/react"` (já feito em todo o projeto).
- **`<input>` sem `<label>` associado:** quebra A11Y-03. Sempre `<label htmlFor={id}>` + `id` matching.
- **Throw em Server Action quando Resend falha mas Sheets pegou:** quebra a regra "success se pelo menos uma pegou". Idempotência exige `Promise.allSettled`, não `Promise.all`.
- **Hard-code de `wa.me/<numero>` em qualquer arquivo de seção:** Phase 1 trava isso. Sempre via `<WhatsAppCta>` → `buildWhatsAppUrl()`.
- **Toast `sonner` como ÚNICO feedback de sucesso/erro:** sucesso inline é o contrato. Sonner pode ser secundário (ex: aviso de "tente de novo") mas o estado primário fica no DOM do form.

## Don't Hand-Roll

| Problema | Não construir | Use Instead | Por quê |
|----------|---------------|-------------|---------|
| Assinar JWT RS256 no edge | Crypto Web API com `crypto.subtle.sign` manualmente + base64url manual | `jose` lib (`SignJWT`, `importPKCS8`) | Casos de edge (padding PKCS#8, base64url vs base64, header `typ:JWT` exato Google quer) já resolvidos. 50KB, edge-compat oficial. |
| HTTP client edge-friendly | Wrapper sobre `fetch` com retry/error parsing | Native `fetch` direto + `if (!res.ok)` | Resend SDK já é fetch. Sheets é 1 call. Não precisa abstração. |
| Form state | `useState` por campo + handlers manuais | `react-hook-form` | RHF resolve uncontrolled, validation, `isSubmitting`, `formState.errors`. 25KB. Já instalado. |
| Schema validation | `if (typeof name !== "string" || name.length < 2) ...` | `zod` schema + `safeParse` | Compartilhamento client ↔ server. `flatten()` pra UI de erros. Já instalado. |
| Phone normalization | Regex inline + replace chain | Função pura `normalizeWhatsapp(raw: string): string` em `lib/lead-schema.ts` | Normalização precisa ser idêntica client ↔ server pra dedup funcionar. Function única. |
| Toast | `useState` + portal manual | `sonner` (já instalado) | Já no projeto. Acessível por padrão. |
| Scroll-driven animation | `useEffect` + `addEventListener("scroll")` + `requestAnimationFrame` throttle manual | Motion `useScroll` + `useMotionValueEvent` | Motion já está integrado, respeita `prefers-reduced-motion` via `<MotionConfigProvider>` da Phase 1, evita reinventar throttle. |

**Key insight:** A maior parte do "trabalho difícil" da Phase 5 (JWT, fetch retry, scroll throttle, form state) já tem solução off-the-shelf. O verdadeiro trabalho é a **integração e o UX**: copywriting do form, escolha de microcopy de erro, validação real em dispositivos reais, e ajuste do floating pra não competir visualmente com o resto da página.

## Common Pitfalls

### Pitfall 1: `GOOGLE_SA_PRIVATE_KEY` newline escaping
**What goes wrong:** Vercel armazena env vars como strings; copiar a private key do JSON com `\n` literal vira `\\n` ao ler. `jose` falha com `Error: not a valid PKCS8 key`.
**Why it happens:** O JSON do service account usa `\n` como separador de linha; quando colado em env var de plain text, o backslash é escapado uma vez a mais.
**How to avoid:** No código de leitura: `const pem = process.env.GOOGLE_SA_PRIVATE_KEY!.replace(/\\n/g, "\n");`
**Warning signs:** Sheets call retorna 401 / `invalid_grant` / "Invalid JWT signature".

### Pitfall 2: Resend `from:` precisa de domínio verificado
**What goes wrong:** `resend.emails.send({ from: "qualquer@coisa.com" })` retorna 403.
**Why it happens:** Resend exige verificação DNS do domínio sender (SPF + DKIM).
**How to avoid:** Configurar `likro.com.br` (ou domínio escolhido) em resend.com/domains ANTES do PR ir pra Lenny. Enquanto domínio não verificado, usar o sandbox `onboarding@resend.dev` em dev — não em prod.
**Warning signs:** Lenny não recebe email em prod mas Sheets aparece. Logs mostram `403 - domain not verified`.

### Pitfall 3: Edge runtime + `process.env` ausente em build time
**What goes wrong:** Em edge runtime, env vars são "static" — alterações em runtime exigem redeploy. Vercel está OK, mas se rodar `next dev` sem `.env.local`, o route handler crasha com `RESEND_API_KEY undefined` no primeiro POST.
**How to avoid:** `src/lib/server-env.ts` valida presença com zod e lança erro descritivo no module load:

```typescript
import "server-only";
import { z } from "zod";

const schema = z.object({
  RESEND_API_KEY: z.string().min(1),
  LEAD_TO_EMAIL: z.string().email(),
  GOOGLE_SA_CLIENT_EMAIL: z.string().email(),
  GOOGLE_SA_PRIVATE_KEY: z.string().min(1),
  GOOGLE_SHEET_ID: z.string().min(1),
});

export const serverEnv = schema.parse(process.env);
```

**Warning signs:** Build local quebra com mensagem clara em vez de falha silenciosa em prod.

### Pitfall 4: Dedup `Map` cresce sem TTL → memory leak
**What goes wrong:** `Map<phone, timestamp>` cresce indefinidamente; em edge instance long-lived vira leak.
**How to avoid:** TTL explícito + cleanup oportunista:

```typescript
const WINDOW_MS = 60_000;
const dedup = new Map<string, number>();

export function checkAndRegisterDedup(phone: string): boolean {
  const now = Date.now();
  // Cleanup oportunista
  for (const [k, ts] of dedup) {
    if (now - ts > WINDOW_MS) dedup.delete(k);
  }
  const normalized = phone.replace(/\D/g, "");
  if (dedup.has(normalized)) return true;
  dedup.set(normalized, now);
  return false;
}
```

**Warning signs:** Vercel logs mostram crescimento de memory em runtime stats. Mitigação v1 — promover pra Upstash KV em v2 se virar problema.

### Pitfall 5: `motion.header` com `position: fixed` quebra layout do hero
**What goes wrong:** Header atual é `position: relative`. Mudar pra `fixed` faz o hero subir 56px (h-14) e cobre headline.
**How to avoid:** Adicionar `<div className="h-14 lg:h-16" aria-hidden />` como spacer ANTES do `<main>` para preservar o layout vertical.
**Warning signs:** Visual regression imediata na primeira viewport; Lenny vê na Vercel preview.

### Pitfall 6: `useScroll` SSR mismatch
**What goes wrong:** `useScroll` lê `window.scrollY` no mount; em SSR `window` é undefined; React 19 hidratação pode warning.
**How to avoid:** `"use client"` no Header (refactor obrigatório). Motion v12 lida bem com SSR mas o componente todo precisa ser client.
**Warning signs:** Hydration mismatch warning no console.

### Pitfall 7: IntersectionObserver não dispara para elementos `display: hidden`
**What goes wrong:** Se o form tiver `hidden` ou estiver em `display: none` antes de hydrate, o observer nunca pega `isIntersecting=true`.
**How to avoid:** Form sempre renderizado no DOM (SSR-friendly); só o estado interno (`success`/`error`/`idle`) muda. Usar `aria-live` para o success block.
**Warning signs:** Floating WhatsApp continua visível mesmo com form na tela.

### Pitfall 8: Honeypot pego por password managers / autofill
**What goes wrong:** 1Password/LastPass preenchem `name="company"` automaticamente em sites de B2B → falso positivo.
**How to avoid:** `autocomplete="off"` no campo + nome menos óbvio (`website` ou `_gotcha` em vez de `company`). Validar localmente com 1Password ativo.
**Warning signs:** Leads reais filtrados por honeypot. Detectável pelo log "honeypot triggered" quando o número WhatsApp é válido.

### Pitfall 9: Floating WhatsApp cobre `<select>` / teclado mobile
**What goes wrong:** Ao focar um `<input>` em mobile, o teclado virtual sobe; floating com `position: fixed; bottom` fica em cima do campo.
**How to avoid:** Esconder floating quando QUALQUER input do form está focado (não só quando section está em viewport). Adicionar `focusin/focusout` listener no document.
**Warning signs:** UX dolorosa em mobile real — confirmado em QA matrix.

## Code Examples

Verified patterns from official sources — todos compilados acima nas seções Pattern 1-6.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` | `motion` | 2024 — package renamed; new path `motion/react` | Já adotado no projeto. Nada a fazer. |
| `@studio-freight/lenis` | `lenis` | Late 2024 — Studio Freight → Darkroom Engineering | Já adotado. |
| `jsonwebtoken` (Node-only) | `jose` (edge-compat) | 2023+ | Phase 5 adopta `jose` desde dia 1. |
| `googleapis` SDK em edge | `jose` + `fetch` direto na Sheets REST API | 2023+ pra projetos edge-first | Phase 5 segue. |
| Server Action como single-source-of-truth pra forms com RHF | RHF + edge route via fetch (RHF não funciona sem JS de qualquer forma) | 2025 — RHF docs confirmam | Phase 5 escolhe edge route. |
| `display: none` honeypot | Off-screen `position: absolute; left: -9999px` + `aria-hidden + tabindex=-1 + autocomplete="off"` | 2022+ | Phase 5 segue. |

**Deprecated/outdated:**
- `react-helmet` — Metadata API substitui (Phase 1 já usa).
- `getServerSideProps` — App Router não tem (Phase 5 usa Route Handlers).
- Pages Router (`pages/`) — projeto inteiro é App Router.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Lenny tem ou pode criar conta Resend e verificar domínio `likro.com.br` ANTES da Phase 5 fechar | Pattern 3 / Pitfall 2 | Email não envia em prod; só Sheets pega. Mitigado pela idempotência dual-write — lead não é perdido. Mas o sinal de "novo lead" no inbox do Lenny não chega. |
| A2 | Lenny pode criar service account Google Cloud + planilha + compartilhar com client_email da SA | Pattern 2 | Sheets não envia em prod; só Resend pega. Idempotência cobre. Lenny perde backup visual em planilha. |
| A3 | Vercel free tier basta pra rate limit nativo (não precisa Upstash na v1) | Discretion area | Spam bot agressivo passa pelo honeypot e enche `LEAD_TO_EMAIL` + Sheets. Mitigação: promover Upstash em horas se virar problema (15-min change). |
| A4 | Dedup in-memory `Map` por instance é aceitável (lead duplicado raro em multi-instance scenarios) | Pattern 1 / Pitfall 4 | Mesmo número pode submeter 2x se hit instances diferentes em segundos. Aceitável v1 — pior caso é Lenny ver 2 emails do mesmo lead, anota mentalmente. |
| A5 | Microcopy do form pode ser rascunhada por Claude (3 variantes) e Lenny aprova no PR — mesmo gate da Phase 4 § COPY-04 | Discretion area | Se Lenny quiser controle maior, esperar input dele antes de codar copy. Não bloqueia code (placeholder safe). |
| A6 | Refatorar `<Header>` pra client component (perdendo SSR) é OK porque conteúdo é trivial | Pattern 4 / Pitfall 6 | Lenny pode preferir manter Header como server + criar um `<ClientHeaderWrapper>` que aceita children. Decisão de PR. |
| A7 | Lighthouse/A11y/Perf gates não rodam na Phase 5 (ficam pra Phase 7) | Out of scope | Phase 5 pode regressionar números do hero. Mitigação: bundle analyzer manual antes do merge confirma que `resend` + `jose` não passam de +80KB bundled (esperado: ~50KB combinados após tree-shaking — `resend` é só usado no server, sai do bundle client). |
| A8 | `useReducedMotion` do `motion/react` é a API correta no v12 (não `useReducedMotion` próprio) | Pattern 4 | API trivial de testar; sem risco real. |
| A9 | `crypto.randomUUID()` disponível em edge runtime do Vercel (já usado em `lib/analytics.ts`) | — | Verified em Phase 1 (já funciona). |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Conta Resend + API key | sendLeadEmail | ❓ (depende do Lenny) | — | Skip Resend, só Sheets — idempotência cobre |
| Domínio verificado em Resend (`likro.com.br`) | sendLeadEmail `from:` em prod | ❓ | — | `onboarding@resend.dev` em dev; bloqueia prod até verificar |
| Service Account Google Cloud + JSON | appendLeadRow | ❓ (depende do Lenny) | — | Skip Sheets, só Resend — idempotência cobre |
| Planilha Google compartilhada com SA email | appendLeadRow | ❓ | — | — |
| `node` + `npm` (build local) | Install deps | ✓ | (Phase 1 verified) | — |
| Vercel project conectado | Deploy | ✓ | (Phase 3 já está deployando) | — |
| iPhone físico (Lenny) | CTA-07 QA | ✓ (Lenny tem) | — | — |
| Android físico | CTA-07 QA | ❓ | — | BrowserStack ou emulador (degraded) |

**Missing dependencies with no fallback:**
- Resend account: PRECISA do Lenny criar e gerar API key.
- Google Cloud service account: PRECISA do Lenny criar projeto + habilitar Sheets API + criar SA + baixar JSON.

**Missing dependencies with fallback:**
- Domínio verificado Resend: usar sandbox em dev, bloquear merge pra prod até verificar.
- Android físico real: BrowserStack/Sauce Labs OU pedir pra alguém com Android testar (Charles, time Insper, etc.).

**Action items pra discuss-phase / pré-execução:**
1. Lenny cria conta Resend, gera `RESEND_API_KEY`, adiciona em Vercel env vars (Production + Preview).
2. Lenny cria/escolhe email destino (`LEAD_TO_EMAIL`, ex: `lenny@likro.com.br`).
3. Lenny cria service account no GCP, baixa JSON, extrai `client_email` + `private_key`, coloca em Vercel env vars (`GOOGLE_SA_CLIENT_EMAIL`, `GOOGLE_SA_PRIVATE_KEY` — atenção ao `\n`).
4. Lenny cria planilha Google "Likro — Leads" com headers `[timestamp, name, whatsapp, message, utm]`, compartilha com o `client_email` da SA como Editor, pega `GOOGLE_SHEET_ID` da URL.
5. Lenny inicia processo de verificação de domínio `likro.com.br` em Resend (DNS records — pode levar 24h).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest@^3.2.4` + `@testing-library/react@^16` + `jsdom@^25` |
| Config file | `vitest.config.ts` (exists — alias `@` → `./src`, setup `./tests/setup.ts`) |
| Quick run command | `npm test -- --run <pattern>` |
| Full suite command | `npm test` (alias for `vitest run`) |
| Typecheck command | `npm run typecheck` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| **CTA-03** | `<WhatsAppCta>` recebe `location` como prop obrigatória | unit (TS-level) | `npm run typecheck` | ✅ (Phase 1) |
| **CTA-05** | CTAs renderizados em ≥ 4 pontos da page | integration (RTL render `<HomePage>`) | `npm test -- tests/landing/cta-distribution.test.tsx` | ❌ Wave 0 |
| **CTA-06** | Floating aparece após scroll > 50vh + esconde quando form em viewport | unit (mock `useScroll` + `IntersectionObserver`) | `npm test -- tests/sections/floating-whatsapp.test.tsx` | ❌ Wave 0 |
| **CTA-07** | Deep link abre app WhatsApp em iOS Safari + Android Chrome | **manual / real-device QA** | (UAT checklist) | UAT-doc |
| **CTA-08** | Mensagem pré-preenchida por `location` matches `WHATSAPP_MESSAGES` | unit | `npm test -- tests/content/whatsapp-messages.test.ts` | ❌ Wave 0 |
| **CTA-09** | Form 3 campos visíveis + honeypot escondido + validação Zod | unit (RTL render `<LeadForm>`) | `npm test -- tests/sections/lead-form.test.tsx` | ❌ Wave 0 |
| **CTA-10** | Edge route `/api/lead` valida Zod + dispara dual-write | integration (mock `fetch` global) | `npm test -- tests/api/lead-route.test.ts` | ❌ Wave 0 |
| **CTA-11** | Double-submit prevenido (botão disabled) + sucesso inline sem redirect | unit (RTL fireEvent + assertion disabled) | `npm test -- tests/sections/lead-form.test.tsx` | ❌ Wave 0 (shared) |
| **CTA-12** | Dedup por número WhatsApp em janela 60s | unit | `npm test -- tests/lib/lead-dedup.test.ts` | ❌ Wave 0 |
| **MOBILE-02** | Floating CTA respeita `safe-area-inset-bottom` | unit (snapshot do className) + **manual real-device** | `npm test -- tests/sections/floating-whatsapp.test.tsx` (className) + iOS QA (visual) | ❌ Wave 0 + UAT |
| **MOBILE-06** | Header hide-on-scroll-down + show-on-scroll-up | unit (mock `useScroll` + `useMotionValueEvent`) + **manual** | `npm test -- tests/components/header.test.tsx` + scroll real | ❌ Wave 0 |

### E2E Happy Path

**Cenário:** "Visitor preenche form, recebe confirmação inline, lead chega no Lenny."

| Step | Expectativa | Verificação |
|------|-------------|-------------|
| 1. Visitor abre `/` | Page carrega, hero visible | Lighthouse mobile passa LCP < 2.5s (legado da Phase 3) |
| 2. Visitor scrolla até o fim | Floating aparece após 50vh; CTAs distribuídos visíveis em Pain, Product, Proof | DOM inspection |
| 3. Visitor clica "Quero conversar" no form section | Floating esconde (intersection observer) | Visual check |
| 4. Visitor preenche nome + WhatsApp (sem mensagem) | Botão "Quero conversar" enabled | RTL fireEvent + `expect(btn).not.toBeDisabled()` |
| 5. Visitor submete | Botão vira `disabled`; spinner aparece | RTL assertion |
| 6. Resend + Sheets retornam OK em paralelo | `200 ok:true`; form é substituído por `<FormSuccess>` | network mock + RTL `getByText('Recebido')` |
| 7. Lenny recebe email + linha aparece na planilha | Manual check em prod (smoke test pós-deploy) | UAT |

**Implementação:** Não vamos colocar Playwright na v1 (deferido — overhead). E2E happy path é cobertura por integration test (`tests/api/lead-route.test.ts` com mocks de Resend + Sheets) + manual UAT documentado em `05-HUMAN-UAT.md` no estilo da Phase 4.

### Real-Device QA Matrix (CTA-07 + MOBILE-02 + MOBILE-06)

| Device | OS | Browser | Test |
|--------|-----|---------|------|
| iPhone (Lenny) | iOS 17+ | Safari | Form submete; floating thumb-zone OK; safe-area respeitada; header hide-on-scroll suave; WhatsApp deeplink abre app (não browser) |
| iPad (Lenny ou Insper) | iPadOS | Safari | Form ainda layout desktop-ish; floating NÃO aparece (≤ md cutoff); header hide OK |
| Android mid-tier | Android 13+ | Chrome | Form submete; honeypot não dispara com Chrome autofill; deeplink abre WhatsApp app |
| Desktop | macOS | Chrome / Safari / Firefox | Header hide-on-scroll funciona em todos; reduced-motion (macOS System Settings) desliga hide |

### Sampling Rate (Nyquist)

- **Per task commit:** `npm run typecheck && npm test -- --run <changed-file-pattern>` (quick — < 10s)
- **Per wave merge:** `npm test` (full vitest suite — < 30s) + `npm run lint`
- **Phase gate:** Full suite green + manual UAT matrix completa + Vercel preview validado em iOS + Android reais

### Wave 0 Gaps (tests/fixtures que precisam ser criados ANTES das tasks de feature)

- [ ] `tests/lib/lead-schema.test.ts` — testa Zod schema (nome ≥ 2, WhatsApp normalize, mensagem ≤ 1000), cobre REQ CTA-09 + CTA-10
- [ ] `tests/lib/lead-dedup.test.ts` — Map + TTL + cleanup, cobre REQ CTA-12
- [ ] `tests/api/lead-route.test.ts` — mock fetch global (Resend + Sheets endpoints), assert `Promise.allSettled` semantics + honeypot fake-success, cobre REQ CTA-10 + CTA-11 + CTA-12
- [ ] `tests/sections/lead-form.test.tsx` — RTL render, focus, submit, disabled state, error state, success state, cobre REQ CTA-09 + CTA-11
- [ ] `tests/sections/floating-whatsapp.test.tsx` — mock `useScroll` (motion testing utils ou rewire), mock `IntersectionObserver`, cobre REQ CTA-06 + MOBILE-02
- [ ] `tests/components/header.test.tsx` — RTL + mock `useScroll`, cobre REQ MOBILE-06 + reduced-motion behavior
- [ ] `tests/landing/cta-distribution.test.tsx` — render `<HomePage>` (server component child em test env), grep `data-testid="whatsapp-cta"` ≥ 5 nodes + assert `data-location` covers `['hero','header','pain','product','proof','footer','floating']`, cobre REQ CTA-05
- [ ] `tests/content/whatsapp-messages.test.ts` — assert `WHATSAPP_MESSAGES` tem entry pra cada `WhatsAppLocation`, cobre REQ CTA-08

**Framework install:** None — vitest + RTL + jsdom já configurados em `vitest.config.ts` + `tests/setup.ts`. ✓

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| **V2 Authentication** | no | Form é unauthenticated (lead capture pública). |
| **V3 Session Management** | no | Sem sessão; submissão stateless. |
| **V4 Access Control** | no | Endpoint público intencionalmente. |
| **V5 Input Validation** | **YES** | Zod schema em `src/lib/lead-schema.ts` — server-side parse OBRIGATÓRIO (client validation é apenas UX). Honeypot. Rate limit. Dedup. |
| **V6 Cryptography** | **YES** | JWT RS256 do service account via `jose` (NUNCA hand-rolled). Private key em env var server-only com `import "server-only"`. |
| **V7 Error Handling & Logging** | **YES** | `console.error` server-side em failures parciais (Resend ou Sheets); JAMAIS retorna detalhes do erro ao client (apenas `{ ok: false, error: 'delivery_failed' }`). |
| **V8 Data Protection** | **YES (LGPD lite)** | PII (nome, WhatsApp) circula via HTTPS Vercel → Resend (TLS), Sheets API (TLS). Clarity recebe `data-clarity-mask="true"` no form wrapper. Cookie consent formal é deferido (Phase 7+). |
| **V10 Communications** | **YES** | TLS end-to-end. Fetch nativo respeita HTTPS. Vercel força HTTPS por default. |
| **V11 Business Logic** | **YES** | Dedup 60s previne spam-flood do mesmo número. Rate limit por IP (TODO Phase 7 — Phase 5 v1 aceita só dedup + honeypot). |
| **V12 Files & Resources** | no | Sem upload de arquivo. |
| **V13 API & Web Service** | **YES** | Endpoint `/api/lead` é POST-only (GET retorna 405 implícito); Content-Type validation (JSON parse erro → 400). Zod schema enforced. |
| **V14 Configuration** | **YES** | `server-only` package nos modules sensíveis; `NEXT_PUBLIC_*` JAMAIS recebe `RESEND_API_KEY` ou `GOOGLE_SA_PRIVATE_KEY`. |

### Known Threat Patterns for Likro Phase 5 Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spam bots flooding `/api/lead` | DoS / Tampering | Honeypot off-screen + dedup 60s + rate limit (v2: Upstash). Honeypot triggered → fake success (200 ok). |
| XSS via campo `message` refletido em email HTML | Tampering / Elevation | `escapeHtml()` no template Resend (pattern 3). Sheets armazena como string raw (Sheets não interpreta HTML). |
| Server-Side Request Forgery via `from:` injetável | Spoofing | `from:` é hard-coded server-side em `lead-resend.ts`; cliente JAMAIS controla. |
| Leak de `RESEND_API_KEY` ou `GOOGLE_SA_PRIVATE_KEY` no bundle client | Info Disclosure | `import "server-only"` em `src/lib/server-env.ts` + `src/lib/lead-*.ts`. Vercel marca env vars sem `NEXT_PUBLIC_` como server-only. Build falha se importar do client. |
| Replay attack / dedup bypass com normalização inconsistente | Tampering | Função única `normalizeWhatsapp()` em `lead-schema.ts`, importada client + server. Mesma chave nas duas pontas. |
| Clarity gravando PII (WhatsApp, nome) | Info Disclosure | `data-clarity-mask="true"` no `<section id="lead-form-section">` wrapper. Verificar em sessão real (Phase 6). |
| Honeypot detectado por bot avançado | Tampering | Hidden via off-screen CSS (não `display:none`); `autocomplete="off"`; nome de campo plausível mas não óbvio (ex: `website`). Combina com dedup + rate limit como defesa em camadas. |
| Resend bounce / domain unverified em prod | DoS (negação parcial) | Verificação prévia do domínio antes de PR fechar; dual-write garante Sheets pega mesmo se Resend falhar. |

## Sources

### Primary (HIGH confidence)

- [Motion v12 — Hide Header tutorial](https://motion.dev/tutorials/react-scroll-hide-header) — pattern verbatim para `useScroll` + `useMotionValueEvent` — HIGH
- [Motion v12 — useScroll docs](https://motion.dev/docs/react-use-scroll) — HIGH
- [Resend Node SDK README](https://github.com/resend/resend-node) — fetch-based, edge-compatible — HIGH (source: `src/resend.ts` canary branch)
- [Resend Next.js App Router docs](https://resend.com/docs/send-with-nextjs) — HIGH
- [Next.js Route Handlers docs](https://nextjs.org/docs/app/api-reference/file-conventions/route) — HIGH
- [Next.js Forms guide](https://nextjs.org/docs/app/guides/forms) — Server Action vs Route Handler tradeoffs — HIGH
- [Next.js Edge Runtime docs](https://nextjs.org/docs/app/api-reference/edge) — HIGH
- [Vercel Edge Runtime docs](https://vercel.com/docs/functions/runtimes/edge) — HIGH
- [Google Sheets API v4 — values.append](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append) — HIGH
- [Google OAuth2 — service account JWT](https://developers.google.com/identity/protocols/oauth2/service-account) — HIGH
- [`jose` library docs](https://github.com/panva/jose) — `SignJWT` + `importPKCS8` for RS256 — HIGH
- [npm view resend version](https://www.npmjs.com/package/resend) — verified 6.12.3 (May 2026) — HIGH
- [npm view jose version](https://www.npmjs.com/package/jose) — verified 6.2.3 (May 2026) — HIGH

### Secondary (MEDIUM confidence)

- [Google Auth on the Edge (sdorra.dev, 2023)](https://sdorra.dev/posts/2023-08-03-google-auth-on-the-edge) — JWT pattern w/ `jose` + private key `\n` escaping — MEDIUM (3 anos; verified against current jose API)
- [Building a Honeypot Field That Works (CSS-Tricks)](https://css-tricks.com/building-a-honeypot-field-that-works/) — off-screen vs `display:none` — MEDIUM
- [Form Honeypot Implementation Guide (FormShield, 2026)](https://formshield.dev/blog/form-honeypot-implementation-guide) — accessibility + autocomplete — MEDIUM
- [Using react-hook-form with React 19 + Next.js 15 App Router (Markus Oberlehner)](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) — RHF + Server Action tradeoffs — MEDIUM
- [Rate Limiting Next.js — Upstash blog](https://upstash.com/blog/edge-rate-limiting) — `@upstash/ratelimit` reference (deferido pra v2) — MEDIUM

### Tertiary (LOW confidence — flagged for validation at integration time)

- Bundle size estimate for `resend` + `jose` combined (~50KB server-side, 0KB client) — based on package weights, will verify with `@next/bundle-analyzer` pre-merge.

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — todas as deps verified em npm em 2026-05-19; Motion/RHF/Zod/Lucide já instalados.
- Architecture (edge route + dual-write + jose JWT): **HIGH** — pattern padrão em 2026; cada peça tem docs oficiais.
- Pitfalls: **HIGH** para Resend domain verification, JWT private key escaping, `googleapis` edge incompat, `Map` TTL leak (todos clássicos). **MEDIUM** para hot-reload server-env validation (depende do flow Vercel).
- Microcopy (specifics): **MEDIUM** — Claude rascunha 3 variantes, Lenny aprova (mesmo gate Phase 4).

**Research date:** 2026-05-19
**Valid until:** 2026-06-19 (estimated — Next.js + Motion + Resend são estáveis; refresh se Phase 5 não fechar até lá)

---

*Phase: 05-conversion-form-footer-floating-ctas-distribu-dos*
*Research conducted: 2026-05-19*
