## Summary

<!-- 1-3 bullets descrevendo o que o PR muda -->

## Copy review (preencher SE o PR toca src/content/*.ts)

<!-- Convenção D-17 / docs/copy-review.md -->

**Seção:** <!-- ex: Hero, Pain, Bridge, Product, HowItWorks, Proof -->

**3 variantes em `src/content/<secao>.ts`:**
- `v1` (ativa por default): <!-- 1 linha descrevendo a direção -->
- `v2`: <!-- direção contrastante -->
- `v3`: <!-- 3a direção -->

**Decisões pendentes do reviewer:**
- [ ] Aprovar uma variante (comentário `LGTM vX`) — Claude muda a linha `<SEC>_COPY = <SEC>_COPY_VARIANTS.X`
- [ ] Aprovar texto do micro-card (se a seção tiver)
- [ ] Aprovar trust signal / sub-elementos textuais
- [ ] Aprovar mensagem pré-preenchida `WHATSAPP_MESSAGES.<location>` (se a seção tiver CTA WhatsApp)

**Gates técnicos verificados:**
- [ ] `npm run typecheck` verde
- [ ] `npx vitest run tests/content/<secao>.test.ts` verde
- [ ] `tests/sections/hero-invariants.test.ts` ainda verde (se a seção é Hero)
- [ ] Grep anti-IA em `src/content/<secao>.ts` retorna 0 matches

Detalhes da cadência: [docs/copy-review.md](../docs/copy-review.md)

## Test plan

<!-- Bullets dos testes manuais/automatizados rodados antes do merge -->

## Notes

<!-- Qualquer outro contexto relevante -->
