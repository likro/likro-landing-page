# Likro — Brand Lock

> **Nota sobre escopo:** Esta doc OVERRIDE intencionalmente a CONTEXT.md D-17 ("sem doc separada de brand") por orchestrator directive #2 — é a terceira camada de defesa do brand-lock (token absence + grep test + regra humana legível). D-17 propunha não ter doc, mas o orchestrator concluiu que tokens ausentes + grep test ainda admitem brechas culturais (ex: hard-coded `#7c3aed` em CSS arbitrary value, gradient com cores literais) que só code review com checklist humano pega. Esta doc é mínima (~80 linhas), focada em regras enforceable, não brand book completo.

## Brand Lock

O brand book Likro é codificado mecanicamente em `src/app/globals.css` via Tailwind v4 `@theme`. Esta doc explica as regras culturais que NÃO são automaticamente forçadas — code review é a defesa final.

## Regra do roxo

Roxo `#7C3AED` (`accent-primary`) é DESTAQUE, nunca PROTAGONISTA.

**Permitido em:**

- CTAs (botões, links de destaque)
- Badges, chips, pills
- Ícones ativos
- Focus rings (`ring-accent-primary`)
- Dots/indicators
- Texto de destaque pontual (palavra ou frase curta)

**Proibido em:**

- Fundos de seção inteira (`<section className="bg-accent-primary">` é VETO)
- Cards inteiros grandes
- Gradients ocupando viewport
- Header/Footer completos
- Modal backgrounds

**Tokens disponíveis:** apenas `accent-primary`, `accent-hover`, `accent-glow`. Não existem `accent-50/100/200/.../900`.

**Defesa em 3 camadas:**

1. **Tokens não declarados** — `globals.css` declara apenas os 3 acima. Tailwind v4 não auto-gera shades para tokens isolados (Plan 01-01).
2. **Grep test em CI** — `tests/brand-lock.test.ts` falha CI se encontrar `bg-accent-NN`, `text-accent-NN`, `border-accent-NN`, `from-accent-NN`, `to-accent-NN`, `via-accent-NN`, `ring-accent-NN`, `outline-accent-NN`, `decoration-accent-NN` (Plan 01-03).
3. **Code review** — esta doc + checklist abaixo (Plan 01-04).

## 4 extremos cromáticos a EVITAR (D-05)

- **Branco demais** — sem personalidade, sensação de página vazia
- **Preto demais** — pesado, cansativo, lembra dev-tool
- **Glow demais** — vira "AI SaaS template" genérico
- **Minimalismo frio extremo** — clínico, sem emoção, sem calor

Equilíbrio editorial: alternation de seções `surface-dark` ↔ `surface-light`, com glows sutis (`accent-glow` rgba 0.18) apenas onde intencional. Translúcidos e sombras discretos, nunca chamativos.

## Code review checklist (rodar em todo PR que toque .tsx/.ts/.css)

- [ ] Nenhuma classe `bg-accent-NN`, `text-accent-NN`, etc com shade numérico (CI já enforce)
- [ ] Nenhum `<section>`, `<header>`, `<main>` com `bg-accent-primary` como fundo principal
- [ ] Nenhum gradient `from-accent-* to-accent-*` ocupando viewport
- [ ] Nenhuma cor hard-coded `#7c3aed`, `#6d28d9` em JSX/CSS — usar tokens
- [ ] Nenhuma fonte importada além da Inter (3 pesos)
- [ ] Nenhum motion direto em arquivo de seção (Phase 4+) — só primitivas em `components/motion/`
- [ ] Nenhuma chamada direta a `window.fbq`, `window.gtag`, `window.clarity` — sempre via `track()` em `lib/analytics.ts`
- [ ] Nenhuma URL WhatsApp construída fora de `lib/whatsapp.ts`
- [ ] Nenhum `web.whatsapp.com` ou `api.whatsapp.com` em qualquer lugar do src/

## Tipografia

Inter (Google Fonts, self-hosted via `next/font`). 3 pesos APENAS:

- 400 (Regular) — body
- 500 (Medium) — emphasis
- 700 (Bold) — headlines

## Border radius

- `rounded-md` = 10px (default — buttons, inputs, badges)
- `rounded-lg` = 12px (cards, modals)
- Nada acima de 12px sem aprovação.
