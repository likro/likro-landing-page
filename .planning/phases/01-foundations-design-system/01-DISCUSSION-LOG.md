# Phase 1: Foundations & Design System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisões canônicas vivem em `01-CONTEXT.md` — este log preserva as alternativas consideradas.

**Date:** 2026-05-15
**Phase:** 01-foundations-design-system
**Areas discussed:** Base dos atoms UI, Composição do CTA WhatsApp, Enforcement do roxo, Estrutura de pastas

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Base dos atoms UI | shadcn/ui (template rápido com Tailwind variants) vs Radix Primitives (headless puro) vs from-scratch | ✓ |
| Composição do CTA WhatsApp | `<WhatsAppCta>` self-contained vs separar helper + tracking + Button | ✓ |
| Enforcement do roxo (nível de paranóia) | Só `@theme` restrito vs ESLint rule extra | ✓ |
| Estrutura de pastas e path aliases | `src/` ou top-level? Aliases. Onde vivem content/, sections/, components/motion/ | ✓ |

**Direção inicial declarada pelo usuário (antes das perguntas específicas):**
1. shadcn como base, altamente customizado (sem cara de template)
2. Componente único centralizado pra WhatsApp (UI + tracking + analytics + estados + URL)
3. Enforcement mecânico forte; restringir tecnicamente usos errados
4. Estrutura limpa, escalável, organizada desde o início — motion abstraído, sections separadas, content centralizado

---

## Area 1: Base dos atoms UI

### Q1: Quais componentes shadcn instalar já na Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo essencial | Button + Card + Input + Textarea + Label | |
| Essencial + interativos | Acima + Dialog + Sheet + Sonner (toast) | ✓ |
| Suite completa de form | Acima + Form (RHF integration) + Tooltip | |

**User's choice:** Essencial + interativos (Button, Card, Input, Textarea, Label, Dialog, Sheet, Sonner).
**Notes:** "Já preparar base para UX premium, microinterações, estados elegantes, mobile refinado, feedback visual sofisticado. Mantendo: bundle controlado, visual altamente customizado, sem aparência genérica de shadcn/template."

### Q2: Como controlar a alternation escuro→claro→escuro entre seções?

| Option | Description | Selected |
|--------|-------------|----------|
| Classes Tailwind diretas por seção | Cada `<section>` declara seu próprio fundo via tokens | ✓ |
| `data-theme` por seção + CSS vars | Inversões complexas dentro do mesmo bloco | |
| `next-themes` global | Provider de tema global | |

**User's choice:** Classes Tailwind diretas por seção.
**Notes:** "Híbrida por design: hero escuro, conteúdo claro, fechamento escuro. Controle explícito por section, simplicidade, clareza arquitetural, menos abstração desnecessária. Não precisamos toggle global ou sistema complexo de tema."

### Q3: Referência visual mais próxima do feel desejado?

| Option | Description | Selected |
|--------|-------------|----------|
| Linear | Glow sutil, border-1 + shadow leve, inputs com border-bottom em foco | |
| Vercel / Geist | Flat com ring, border + shadow muito sutil | |
| Stripe | Profundidade leve, gradient sutil + shadow refinada, floating labels | |
| Mix Linear + Stripe | Peso visual da Linear + profundidade da Stripe | ✓ |

**User's choice:** Mix Linear + Stripe.
**Notes:** "Peso visual e refinamento da Linear + profundidade e polish da Stripe. Premium, sofisticada, tecnológica, elegante, moderna. Sem developer tool genérica, startup IA clichê ou interface fria demais. Sombras sutis, profundidade leve, bordas refinadas, motion elegante, hover states sofisticados, glow extremamente controlado. Tudo caro, refinado e intencional. Cuidado MUITO grande no equilíbrio cromático: nem branco demais, nem preto demais, nem contraste agressivo demais. Direção premium editorial, high-end tech, moderna e viva. Não minimalismo frio extremo, não cyberpunk/glow exagerado, não branco clínico, não dark mode pesado demais."

### Q4: Nível de polish nos micro-estados?

| Option | Description | Selected |
|--------|-------------|----------|
| Premium completo | Transições 200-300ms, hover/focus/active/disabled bem resolvidos | ✓ |
| Premium pesado | Acima + ripple, cursor follow glow | |
| Funcional só | Estados padrão shadcn (hover muda 10% bg) | |

**User's choice:** Premium completo.
**Notes:** "Transições suaves, microinterações refinadas, hover states elegantes, active states sutis, foco/acessibilidade bem resolvidos, sensação tátil premium. SEM exagerar em efeitos 'wow'. Sem ripple effect, sem glow seguindo cursor, sem interações chamando mais atenção que o conteúdo, sem cara de demo experimental. Refinamento, sofisticação, consistência, fluidez. Equilíbrio visual: nem branco demais, nem preto demais, nem glow demais, nem minimalismo frio demais. Equilibrado, artístico e premium."

---

## Area 2: Composição do CTA WhatsApp

### Q1: Forma do componente — variants prontas vs children customizados?

| Option | Description | Selected |
|--------|-------------|----------|
| Variants prontas | `<WhatsAppCta variant='primary|secondary|floating|inline' location='...' />` | |
| Children customizáveis | `<WhatsAppCta location='...'>...children...</WhatsAppCta>` | |
| Híbrido | Variants pré-definidas + slot opcional pra customizar conteúdo | ✓ |

**User's choice:** Híbrido.
**Notes:** Sem nota adicional — escolheu a opção recomendada que combina consistência com flexibilidade.

### Q2: Estados/feedback ao clicar?

| Option | Description | Selected |
|--------|-------------|----------|
| Loading + transição suave | Click → loading 300ms → analytics → abre wa.me | ✓ |
| Imediato (sem feedback) | Click abre imediato, analytics em paralelo | |
| Loading + toast confirmação | Click → loading → abre + toast 'Abrindo WhatsApp...' | |

**User's choice:** Loading + transição suave.

### Q3: Ícone do WhatsApp no botão?

| Option | Description | Selected |
|--------|-------------|----------|
| Ícone WhatsApp oficial | SVG do logo WhatsApp | ✓ |
| Apenas seta direita (Lucide ArrowRight) | Mais sutil, não-marca | |
| Sem ícone | Texto puro com tipografia forte | |
| Configurável por variant | Primary tem logo, secondary tem seta, floating só ícone | |

**User's choice:** Ícone WhatsApp oficial.

### Q4: Quem decide a mensagem pré-preenchida?

| Option | Description | Selected |
|--------|-------------|----------|
| Por `location`, em `content/whatsapp.ts` | Um arquivo central mapeia location → mensagem | ✓ |
| Como prop do caller | Cada CTA declara sua própria mensagem | |
| Mensagem fixa global | Uma única mensagem para todos os CTAs | |

**User's choice:** Mensagem por `location`, definida em `content/whatsapp.ts`.

---

## Area 3: Enforcement mecânico do roxo

### Q1: Quais tokens declarar no `@theme`?

| Option | Description | Selected |
|--------|-------------|----------|
| Paleta enxuta + accent único | accent.primary/hover + surface + text + border + neutrals | ✓ |
| Paleta semântica completa | Acima + success/warning/error/info | |
| Paleta com escalas neutras estendidas | Acima + surface.glass + accent.glow translúcido | |

**User's choice:** Paleta enxuta + accent único.
**Notes:** "Sistema cromático extremamente disciplinado, poucos tokens, alta consistência visual, enforcement mecânico forte. Roxo apenas como: accent.primary, CTA, highlights, estados estratégicos, detalhes de atenção. Sem múltiplas escalas de roxo, sem purple-500/600/700 espalhados, sem fundo roxo gigante, sem glow excessivo, sem visual 'AI SaaS template'. Cuidado no equilíbrio: nem branco demais, nem preto demais, nem glow demais, nem minimalismo frio. Direção editorial, premium, cinematográfica, refinada. Podemos ter translúcidos controlados, shadows suaves, accent glow extremamente sutil. Mas tudo com disciplina visual."

### Q2: ESLint rule extra contra `bg-accent-50/100/...`?

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, regra customizada | ESLint rule que falha build em shade errado | |
| Apenas `@theme` restrito | Confia no @theme; classe inexistente vira no-op | ✓ |
| ESLint + comment annotation | ESLint + annotations explicando | |

**User's choice:** Apenas `@theme` restrito.
**Notes:** "Enforcement forte, mas sem overengineering. Se uma cor/shade não existir oficialmente no sistema, ela simplesmente não deve existir no projeto. Prioridade: simplicidade, consistência, disciplina visual, velocidade de desenvolvimento. Não precisamos adicionar complexidade extra com ESLint customizado agora."

### Q3: Tamanho/escopo da restrição além de fundos?

| Option | Description | Selected |
|--------|-------------|----------|
| Focada em fundo | Proibir bg-accent-* em section/main/body; permitir em botões/badges/dots/rings | ✓ |
| Restrição ampla | Acima + proibir em Cards maiores que ~200x200 | |
| Mínima (só advertir) | Confia em code review | |

**User's choice:** Restrição focada em fundo (escolheu o ponto pragmático).
**Notes:** "Restrição relativamente forte, mas sem transformar em sistema burocrático ou super complexo. Roxo continua sendo accent, destaque, guia visual, nunca protagonista. Sem grandes áreas roxas, cards enormes totalmente roxos, glow excessivo, aparência 'AI SaaS genérica'. Mas também sem regras impossíveis de manter ou medir mecanicamente. Enforcement simples, tokens restritos, revisão visual disciplinada, bom senso arquitetural."

### Q4: Onde documentar a regra?

| Option | Description | Selected |
|--------|-------------|----------|
| Comentário no globals.css + seção no CLAUDE.md | Token defs com comentário; CLAUDE.md com 'Brand book mecânico' | ✓ |
| Documento separado | docs/brand-system.md dedicado | |
| Só mensagem de erro do ESLint | Aprende ao quebrar build | |

**User's choice:** Documentação leve integrada (interpretação: comentário no globals.css + seção curta no CLAUDE.md).
**Notes:** "Documentação leve e prática, próxima do código e do design system. Sem excesso de documentação corporativa, sem wiki gigante, sem processo burocrático. Mas também não depender apenas de erro de ESLint para comunicar intenção visual. Clareza, discoverability, manutenção simples, alinhamento visual contínuo. Guidelines enxutas e estratégicas integradas ao próprio sistema/componentes."

---

## Area 4: Estrutura de pastas, path aliases e organização

### Q1: Estrutura base do projeto?

| Option | Description | Selected |
|--------|-------------|----------|
| `src/` com tudo dentro | src/app, src/components, src/sections, src/lib, src/hooks, src/content | ✓ |
| Top-level (sem `src/`) | app/, components/, sections/ na raiz | |
| Você decide | — | |

**User's choice:** `src/` com tudo dentro.
**Notes:** "Raiz limpa, organização clara, arquitetura escalável, separação forte entre app/components/sections/motion/content/hooks/lib. Clareza, manutenção, escalabilidade futura, consistência arquitetural. Base moderna e organizada desde o início."

### Q2: Estilo do path alias?

| Option | Description | Selected |
|--------|-------------|----------|
| Só `@/*` | Padrão Next.js + shadcn | ✓ |
| Aliases segmentados (@components/, @lib/, @sections/) | Mais expressivo, mais config | |
| Sem alias (relative imports) | Não recomendado | |

**User's choice:** Só `@/*`.
**Notes:** "Simplicidade, consistência, imports limpos, padrão moderno Next.js. Sem necessidade de múltiplos aliases segmentados. Clareza, manutenção simples, organização limpa, baixa complexidade mental."

### Q3: Organização interna de `sections/`?

| Option | Description | Selected |
|--------|-------------|----------|
| Pasta por seção | index.tsx + sub-componentes co-localizados | |
| Arquivo único por seção | sections/Hero.tsx flat | |
| Pasta com co-locação completa | + types.ts + hooks.ts quando necessário | ✓ |

**User's choice:** Pasta por seção com co-locação completa.
**Notes:** "Cada seção narrativa deve funcionar como unidade isolada e escalável. Manter juntos: visuals, motion, copy, hooks, types, lógica específica. Especialmente importante porque teremos seções cinematográficas, múltiplas camadas visuais, animações, storytelling, mockups, componentes internos. Organização, escalabilidade, clareza arquitetural, manutenção limpa."

### Q4: Onde a copy vive?

| Option | Description | Selected |
|--------|-------------|----------|
| `src/content/*.ts` centralizado | content/hero.ts, content/pain.ts, etc. | ✓ |
| Co-localizada dentro da seção | sections/Hero/copy.ts | |
| Híbrido (short co-localizada, long centralizada) | Mais flex, mais regra | |

**User's choice:** Centralizada em `src/content/*.ts`.
**Notes:** "Separar claramente conteúdo/copy, UI/layout, motion/lógica. Vai ajudar muito em revisão de copy, refinamento de narrativa, consistência de voz, iteração rápida, manutenção. Como a landing terá bastante storytelling e refinamento textual, prefiro manter os textos organizados e fáceis de revisar sem misturar com JSX complexo."

---

## Claude's Discretion

Capturado em CONTEXT.md §"Claude's Discretion". Resumo:
- Implementação interna do `track()` (UUID, dedupe)
- Estratégia exata da OG image (sugestão: dinâmica via `app/opengraph-image.tsx`)
- Breakpoints pixels do `useDeviceTier`
- Inter font subset (Latin only ou Latin+Latin-ext)
- Config inicial do Lenis (lerp, smoothWheel/smoothTouch — research já recomenda `smoothTouch: false`)
- Naming/estrutura dos atoms shadcn customizados (manter kebab-case)
- Configuração exata de variants do `<WhatsAppCta>` via cva

## Deferred Ideas

Capturado em CONTEXT.md §"Deferred Ideas". Resumo:
- ESLint custom para enforcement do roxo (descartado pra Phase 1)
- Aliases segmentados (descartado)
- next-themes / theme provider global (descartado)
- Outros componentes shadcn não-listados (on-demand)
- Variants extras do `<WhatsAppCta>` (quando seção pedir)
- Helper UTM acoplado ao buildWhatsAppUrl (Phase 5)
- Cookie banner LGPD (milestone futuro)
- CMS pra copy (out of scope v1)
