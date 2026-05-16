---
phase: 01-foundations-design-system
fixed_at: 2026-05-16T15:23:10Z
review_path: .planning/phases/01-foundations-design-system/01-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-16T15:23:10Z
**Source review:** .planning/phases/01-foundations-design-system/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (WR-01 a WR-05; critical_warning scope, 0 críticos)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### WR-01: `useTheme()` chamado sem `ThemeProvider` na árvore de providers

**Files modified:** `src/components/ui/sonner.tsx`
**Commit:** c0e6946
**Applied fix:** Removida a importação de `useTheme` do `next-themes` e a chamada `useTheme()`. O prop `theme` do Sonner foi hardcodado para `"light"`, eliminando a dependência não-montada e o fallback silencioso para `"system"`. Comentário documenta a escolha (v1 sem dark-mode toggle).

---

### WR-02: `dialog.tsx` e `sheet.tsx` usando tokens shadcn CSS não declarados

**Files modified:** `src/app/globals.css`
**Commit:** 48c48cb
**Applied fix:** Adicionados 6 aliases shadcn compat no bloco `@theme` do `globals.css`, mapeando os nomes shadcn (`--color-background`, `--color-foreground`, `--color-muted-foreground`, `--color-ring`, `--color-secondary`, `--color-accent`) para os tokens Likro existentes. Dialog e Sheet renderizarão corretamente sem nenhuma alteração nos componentes.

---

### WR-03: Hex `#7c3aed` hardcodado em `icon.tsx` (violação brand-lock)

**Files modified:** `src/lib/brand-tokens.ts` (novo), `src/app/icon.tsx`, `tests/brand-lock.test.ts`
**Commit:** 335d547
**Applied fix:**
- Criado `src/lib/brand-tokens.ts` com constante `BRAND` (accentPrimary, accentDeep, surfaceDark, textOnDark) — fonte canônica para edge runtime onde CSS vars não são disponíveis.
- `icon.tsx` atualizado para importar `BRAND` e usar `BRAND.accentPrimary` no inline style.
- `tests/brand-lock.test.ts` estendido com 2 novos testes: grep de hex literals crus (`#7c3aed`/`#6d28d9`) e grep de Tailwind arbitrary values `[#7c3aed]`/`[#6d28d9]`, ambos excluindo `brand-tokens.ts` e `globals.css` (arquivos canônicos legítimos).
- Todos os 3 testes brand-lock passam (47/47 suite completa).

---

### WR-04: `buildWhatsAppUrl` pode lançar em produção — não capturado no `handleClick`

**Files modified:** `src/components/ui/whatsapp-cta.tsx`
**Commit:** 98884fe
**Applied fix:** O corpo da chamada `buildWhatsAppUrl` + `window.open` foi envolvido em `try/catch/finally`. Em caso de erro: chama `track('whatsapp_cta_error', {location, reason})`, loga no console em dev, e falha silenciosamente em produção. O `finally` garante `setLoading(false)` mesmo em caso de exceção, reabilitando o botão. Os 6 testes de `whatsapp-cta.test.tsx` continuam passando.

---

### WR-05: `robots.ts` usa apenas `VERCEL_ENV` — bloqueia SEO em builds não-Vercel

**Files modified:** `src/app/robots.ts`
**Commit:** 8483cab
**Applied fix:** A condição `isProd` foi expandida para incluir um fallback: `VERCEL_ENV === "production" || (typeof VERCEL_ENV === "undefined" && NODE_ENV === "production")`. Builds não-Vercel em produção (Docker, CI standalone) agora permitem crawlers corretamente. Deploys Vercel preview (`VERCEL_ENV === "preview"`) continuam bloqueados. Comentário documenta o raciocínio explicitamente.

---

## Skipped Issues

Nenhum — todos os 5 findings foram aplicados com sucesso.

---

_Fixed: 2026-05-16T15:23:10Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
