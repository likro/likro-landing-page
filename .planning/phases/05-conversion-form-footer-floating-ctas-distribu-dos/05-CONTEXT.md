# Phase 5: Conversion (Form + Footer + Floating + CTAs distribuídos) — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning
**Source:** Express path — decisões consolidadas em conversa com Lenny após preview da Phase 4 (2026-05-18)

<domain>
## Phase Boundary

Esta phase fecha o funil de conversão da landing. Inclui:

1. **Form consultivo** discreto no fim da página (substituto secundário ao WhatsApp) — captura nome, WhatsApp, mensagem opcional.
2. **Edge route `/api/lead`** que valida com Zod e dispara duas integrações **em paralelo, idempotentes**: Resend (email) + Google Sheets (planilha via service account).
3. **Floating WhatsApp** mobile — botão flutuante extremamente discreto que aparece após scroll > 50vh, respeitando `env(safe-area-inset-bottom)`, escondendo quando o form está em viewport.
4. **CTAs WhatsApp distribuídos** em pelo menos 4 pontos da página: hero (já existe da Phase 3), fim da Pain, fim da Product, fim da Proof / pré-form / footer. Cada um com `location` prop e mensagem pré-preenchida correspondente em `src/content/whatsapp.ts` (já populado pela Phase 1).
5. **Header** com comportamento "hide-on-scroll-down, show-on-scroll-up" liberando viewport mobile.
6. **Footer** institucional enxuto — logo + 1 ou 2 links (política/contato), zero ruído.
7. **UTM/location tracking** em todos os CTAs e no form (cada evento carrega `location` + `event_id` UUID v4 — infraestrutura já existe em `src/lib/analytics.ts`).

Fora de escopo desta phase:
- Verificação sistêmica dos dashboards Pixel/GA4/Clarity (vai pra Phase 6).
- Lighthouse/A11y/SEO final (vai pra Phase 7).
- Deploy de produção definitivo (Phase 7; o preview Vercel atual `likro-landing-page-*.vercel.app` continua sendo a URL de validação).
- Cookie banner / consent (Phase 7 ou backlog).

</domain>

<decisions>
## Implementation Decisions

### Form de leads — destino (LOCKED — escolhido por Lenny 2026-05-19)
- **Caminho A: Resend + Google Sheets.** Não usar SMTP genérico, não usar Formspree/Getform, não usar CRM (HubSpot/Pipedrive/RD Station) — fica pra milestone futuro se volume justificar.
- **Resend** entrega email transacional ao Lenny (`LEAD_TO_EMAIL`).
- **Google Sheets** via service account (escrita em uma planilha dedicada) — backup imediato visual.
- **Idempotência:** se Resend falhar mas Sheets gravou (ou vice-versa), retornar success ao cliente e logar o falho server-side. Lead jamais é perdido só porque uma das duas pernas caiu.
- **Edge route** (`/api/lead`) com `runtime = "edge"` quando viável; se a lib de Google Sheets exigir Node, cair pra `runtime = "nodejs"` sem cerimônia — performance > ortodoxia.
- **Anti-spam:** honeypot field invisível + rate limit por IP via Vercel Edge Config / KV de Marketplace (se trivial; senão, dedup server-side por número em janela de 60s).

### Form — campos e UX
- Apenas 3 campos visíveis: **nome**, **WhatsApp**, **mensagem opcional**. Mais que isso quebra o "minimalista, sensação high-end" do tom.
- Honeypot adicional invisível (4º campo escondido com `aria-hidden + tabindex=-1 + position:absolute;left:-9999px` via CSS — NÃO `display:none` porque bots modernos detectam computed style; nome do campo NÃO usar `company`/`email`/`name` pra evitar autofill de 1Password/LastPass em contexto B2B — usar `website`).
- Validação: Zod schema compartilhado client (RHF resolver) ↔ server (edge route). Nome ≥ 2 chars; WhatsApp dígitos+espaços+parênteses, normalizado server-side; mensagem opcional ≤ 1000 chars.
- Submissão: **sucesso inline sem redirect** (mostrar bloco de confirmação substituindo o form, com CTA secundário "ou fale agora no WhatsApp").
- Erro: mensagem inline curta + botão "tentar de novo" (uma única retry no client; se falhar de novo, sugere ir pro WhatsApp).
- Double-submit prevenido (botão `disabled` durante request + dedup server-side por número em janela de 60s).
- Acessibilidade: `<label>` associado a cada input, `aria-invalid` em erro, foco visível em todos os campos.
- Clarity: form wrapper tem `data-clarity-mask="true"` — PII (nome, WhatsApp) NÃO aparece em gravações (mitiga risco crítico #6).

### Tom da copy e dos CTAs (LOCKED — direção Lenny)
- **Premium silencioso. Anti-infoproduto.** Convites consultivos.
- Sim: "vamos conversar sobre operação", "começa por aqui sem pressa", "podemos te mostrar como ficaria".
- Não: caps lock, urgência fabricada, "CLIQUE AGORA", "GARANTA SUA VAGA", exclamações, "última chance", "vagas limitadas".
- Floating WhatsApp: **extremamente discreto** — sem pulse, sem bounce, sem badge "1 nova mensagem", sem crescer. Apenas presente. Tipo um botão ghost com leve sombra, opacidade contida.
- Microcopy do form pré-submit: convite curto ("se preferir, a gente te procura"). Post-submit: "recebido. Em breve falo com você." (curto, primeira pessoa, sem "obrigado!" exagerado).
- Toda copy passa no filtro anti-IA já definido (`src/content/glossary.ts` se houver lista de frases banidas; senão grep em PLAN de copy review).

### WhatsApp — centralização (LOCKED — política de projeto)
- Todos os CTAs consomem `buildWhatsAppUrl(message, location)` de `src/lib/whatsapp.ts`. **Zero hard-code** de `wa.me/...` ou número literal em arquivos de seção. Trocar número = mudar `NEXT_PUBLIC_WA_NUMBER` na Vercel + redeploy.
- Mensagens por `location` já em `src/content/whatsapp.ts` (Phase 1). CTAs novos da Phase 5 reutilizam as keys existentes; se precisar de nova key (ex: `form-fallback`), adicionar ao tipo `WhatsAppLocation` no helper.
- Real-device test (iOS Safari + Android Chrome) obrigatório antes da Phase 5 fechar — deeplink TEM que abrir o app, não browser.

### CTAs distribuídos — pontos
1. **Hero** — já existe (Phase 3), `location='hero'`.
2. **Header** — já existe (Phase 3, no header slim), `location='header'`.
3. **Fim da Pain** — novo, após `PainStatement`, `location='pain'`.
4. **Fim da Product** — novo, após `ProductSecondaryGrid`, `location='product'`.
5. **Fim da Proof / pré-form** — novo, transição da Proof pro form, `location='proof'` (CTA dominante) + `location='footer'` no footer.
6. **Floating mobile** — novo, `location='floating'`.

Mínimo absoluto: 4 pontos persistentes. Recomendado: 6 (lista acima). Se um deles ficar visualmente quebrando o ritmo da seção, registrar como backlog em vez de forçar.

### Floating WhatsApp — comportamento
- **Mobile only** (≤ md breakpoint). Desktop não tem floating; CTAs distribuídos cobrem.
- Aparece após scroll > 50vh, com fade-in suave (200ms, easing canônico do projeto).
- Some quando o `<form>` está em viewport (intersection observer), pra não competir.
- Posicionamento na **thumb zone** do polegar: `bottom: max(env(safe-area-inset-bottom), 16px) + 12px`, `right: 16px`.
- Tap target ≥ 44x44px (WCAG / Phase 7 cross-check).
- Ícone WhatsApp oficial (Lucide ou SVG inline minimal), label `aria-label="Conversar no WhatsApp"`.
- Tracking: `whatsapp_click` event com `location='floating'`.

### Header — hide-on-scroll-down
- Comportamento: invisível ao scrollar pra baixo > 80px de delta; reaparece ao scrollar pra cima > 8px ou parar.
- Implementação via custom hook `useHeaderVisibility` em `src/components/layout/`.
- Animação: `transform: translateY(-100%)` ↔ `0`, 220ms, easing canônico.
- Reduced-motion: header fixo, sem hide.
- Não competir com CTA hero na primeira viewport — primeira 100vh o header fica sempre visível.

### Footer — institucional enxuto
- 1 linha (desktop) / 2 linhas (mobile). Logo Likro + texto pequeno "© 2026 Likro" + 1-2 links sutis ("Política de privacidade", "Contato").
- Política de privacidade: link pode apontar pra placeholder `/privacy` em rota separada (Phase 7 escreve o conteúdo); na Phase 5 só o link com `rel="nofollow"` enquanto isso.
- Cor de fundo combinando com a Proof (DARK editorial) pra transição contínua.
- Zero "made with love", zero menu sitemap completo, zero redes sociais agressivas.

### Tracking — eventos a disparar na Phase 5
- `cta_click` com `{ location, label }` em todos os CTAs WhatsApp (Pain, Product, Proof, Footer, Floating).
- `whatsapp_click` com `{ location, message_key }` no clique efetivo do helper.
- `form_focus` no primeiro campo focado.
- `form_submit_attempt`, `form_submit_success`, `form_submit_error` com `{ event_id, fields_filled }`.
- `section_view` no form (intersection observer).
- Cada evento já carrega `event_id` UUID v4 (infra Phase 1) — preparado pra Meta CAPI futuramente sem reescrever instrumentação.
- UTM: extrair de `URLSearchParams` no client mount e propagar como meta no `cta_click` / `form_submit_*`.

### Performance
- Form é client component (RHF precisa). Server Action OU edge route — preferência por **edge route** porque permite progressive enhancement com `<form action="/api/lead" method="POST">` mesmo sem JS hidratado (importante: 80% mobile, Meta Ads).
- Floating WhatsApp é client component com `useEffect` pra scroll listener — throttle 60fps via `requestAnimationFrame`.
- Imports do Resend e Google Sheets ficam **server-only** (`server-only` package) — zero bytes no bundle client.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Helpers e infra (Phase 1)
- `src/lib/whatsapp.ts` — `buildWhatsAppUrl`, tipo `WhatsAppLocation`, guards CTA-02. **Único ponto** de construção de URL.
- `src/lib/analytics.ts` — `track(event, payload)` com `event_id` UUID v4 já incluído. Eventos disponíveis listados no tipo `AnalyticsEvent`.
- `src/lib/env.ts` — schema de `NEXT_PUBLIC_*` vars. Server secrets (Resend key, Google service account) **NÃO** entram aqui — vivem em arquivo `src/lib/server-env.ts` a ser criado, marcado com `import "server-only"`.
- `src/content/whatsapp.ts` — `WHATSAPP_MESSAGES` por location. Adicionar novas keys se preciso.

### UI primitives (Phase 1)
- `src/components/ui/whatsapp-cta.tsx` — componente `WhatsAppCta` (já existe, variants `primary`/`secondary` etc.). Phase 5 consome em todos os 6 pontos.
- `src/components/ui/container.tsx` — wrapper de largura padrão.

### Sections existentes (Phase 4) — onde encaixar CTAs novos
- `src/sections/Pain/index.tsx` — adicionar CTA no fim, fora do `PainStatement`.
- `src/sections/Product/index.tsx` — adicionar CTA após `ProductSecondaryGrid`.
- `src/sections/Proof/index.tsx` — adicionar CTA dominante na transição pro form.

### Motion primitives (Phase 2) — para o form e floating
- `src/components/motion/` — `RevealOnView` pro form aparecer com fade-up; `MotionConfig` global respeita `prefers-reduced-motion`.

### Layout
- `src/components/layout/Header.tsx` — refatorar pra adicionar comportamento hide-on-scroll (custom hook `useHeaderVisibility` novo).
- `src/components/layout/` — adicionar `Footer.tsx` novo.
- `src/app/page.tsx` — wirar novo `<Form />` e `<FloatingWhatsApp />` no final.

### Roadmap e State
- `.planning/ROADMAP.md` — Phase 5 section (linhas ~89-100, requirements CTA-03,05,06,07,08,09,10,11,12 + MOBILE-02,06).
- `.planning/REQUIREMENTS.md` — IDs específicos com a descrição completa de cada requisito.
- `.planning/STATE.md` — status atual, decisões cross-phase.

### Memória da sessão (preferências persistentes)
- `feedback-conversion-tone` — tom premium silencioso.
- `project-form-target` — Caminho A (Resend + Sheets) confirmado.
- `feedback-whatsapp-centralized` — número via .env, nunca hard-coded.
- `project-deferred-polish` — refactor de cadência visual fica pro 999.1.

</canonical_refs>

<specifics>
## Specific Ideas

- **Microcopy do form (rascunho — sujeito a aprovação Lenny no PR de copy):**
  - Header do form: "Prefere que a gente te procure?"
  - Subhead: "Manda seu nome e WhatsApp. Sem cadência de email marketing, sem corrente."
  - Placeholder nome: "Seu nome"
  - Placeholder WhatsApp: "WhatsApp com DDD"
  - Placeholder mensagem: "Algo específico que você quer entender? (opcional)"
  - CTA submit: "Quero conversar"
  - Pós-submit (success): "Recebido. Vou te chamar no WhatsApp pessoalmente em até 1 dia útil."
  - Erro: "Não consegui enviar. Tenta de novo ou fala agora no WhatsApp."

- **Microcopy do floating:** aria-label "Conversar no WhatsApp". Sem label visível.

- **Cor dominante do form:** off-white (mesma família da Product), texto principal `text-text-primary`, accent (botão) `bg-accent-primary` (#7C3AED). Sem gradiente, sem glow.

- **Anti-spam stack mínimo:**
  - Honeypot field `<input name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" />` (escondido com `position:absolute;left:-9999px`, NUNCA `display:none` — bots modernos detectam via computed style; nome `website` evita autofill de 1Password/LastPass que dispara em `company`/`email`/`name`).
  - Server-side dedup por número de WhatsApp normalizado em janela de 60s (in-memory ou Vercel KV se Marketplace já provisionado).
  - Rate limit por IP: 5 requests / minuto (Vercel Edge Middleware se viável; senão, registrar como TODO Phase 7).

- **Idempotência dual-write:**
  ```
  const [emailRes, sheetRes] = await Promise.allSettled([
    sendResendEmail(payload),
    appendToSheet(payload),
  ]);
  // Success se PELO MENOS UMA pegou. Logar a falha pro Sentry/console.
  ```

</specifics>

<deferred>
## Deferred Ideas

- **CRM integration** (HubSpot, Pipedrive, RD Station) — backlog, volume não justifica na v1.
- **Cookie consent banner / LGPD modal** — Phase 7 ou backlog (preview já tem noindex via robots.txt; em produção real precisa decisão LGPD antes do go-live oficial — marcado em PROJECT.md).
- **Conteúdo da página `/privacy`** — Phase 5 só linka como placeholder; Phase 7 escreve.
- **CAPI Meta retrofit** — `event_id` já carregado, retrofit fica pra quando a conta Meta Ads do Lenny ativar conversões.
- **Polish "visual rhythm / card repetition"** — Phase 999.1 (backlog), não atacar agora.
- **A/B test de microcopy** — Phase 5 entrega 1 variante aprovada por Lenny; A/B é otimização futura.

</deferred>

---

*Phase: 05-conversion-form-footer-floating-ctas-distribu-dos*
*Context gathered: 2026-05-19 via Express path*
