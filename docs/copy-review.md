# Copy review — cadência async via PR (D-17)

> Estabelecida na Phase 3 (Hero). Padrão pras 5 seções narrativas da Phase 4 (Pain, Bridge, Product, HowItWorks, Proof) e qualquer copy futura em `src/content/*.ts`.

## Princípio

Copy review é **gate, não polish de fim** (COPY-04). Uma seção só fecha quando a copy dela tem merge aprovado pelo Lenny via PR.

O git history é o registro canônico das decisões de tom — cada merge de PR de copy é uma decisão tomada. Não duplicar em outro doc.

## Workflow

1. **Claude rascunha 3 variantes contrastantes** em `src/content/<secao>.ts` seguindo o pattern estabelecido na Phase 3:
   - `export const <SEC>_COPY_VARIANTS = { v1, v2, v3 } as const satisfies Record<string, <Sec>Copy>`
   - `export const <SEC>_COPY: <Sec>Copy = <SEC>_COPY_VARIANTS.v1` (ativa provisional)
   - 3 direções DISTINTAS (não micro-ajustes de frase) — vide §"Como rascunhar"
2. **Claude abre PR** com PR description usando o bloco "Copy review" (vide PR template em `.github/PULL_REQUEST_TEMPLATE.md`)
3. **Lenny revisa no GitHub** — escolhe via 1 de 4 caminhos:
   - **(a) Aprovar v1 como está:** comenta `LGTM v1` — Claude não muda nada, merge
   - **(b) Trocar a ativa:** comenta `LGTM v2` (ou `v3`) — Claude muda 1 linha (`<SEC>_COPY = <SEC>_COPY_VARIANTS.v2`) e re-pushea
   - **(c) Editar inline:** Lenny aperta "Edit file" no GitHub na variante escolhida, ajusta texto, commita direto no branch
   - **(d) Pedir nova rodada:** comenta direcionamento livre ("v2 tá perto mas troca 'plataforma' por 'sistema'") — Claude itera as variantes
4. **Merge** acontece somente após aprovação explícita

## Como rascunhar 3 variantes contrastantes (não Frankenstein de frase)

As 3 variantes devem ser direções **distintas**, não micro-ajustes:

- **Variante A — identidade vertical pura** (D-08 default): afirmação clara da categoria + vertical, sofisticada, tom premium ("A operação da sua clínica, em um só lugar.")
- **Variante B — identidade + categoria-criação**: leve sinal de "não é só X" (sem usar literalmente "não é só"), posiciona como categoria própria ("A plataforma da clínica moderna brasileira.")
- **Variante C — especificidade operacional**: ângulo concreto da operação ("DM → agendamento → retorno") em vez de afirmação abstrata ("Do DM no Instagram ao agendamento da sua clínica, sem perder a conversa no caminho.")

### Constraints em TODAS as 3 variantes

- Passa no grep anti-IA: nada de "desbloqueie", "potencialize", "transforme sua X", "jornada do cliente", "próximo nível", "solução inovadora", "feito para você", "do início ao fim", "fricção" abstrato (COPY-02)
- Falha no teste de especificidade: trocar "clínica" por "empresa" deve quebrar o significado (COPY-03)
- Não contém números fabricados ou depoimentos placeholder (COPY-06)
- **Phase 4 específico:** não cita Dolce Home sem autorização explícita do Lenny (vide pendência em STATE.md)

## Exemplo (Phase 3 Hero — referência canônica)

Ver `src/content/hero.ts`: 3 variantes seguem o pattern `HERO_COPY_VARIANTS` com v1 (vertical pura), v2 (categoria-criação), v3 (especificidade operacional). PR original que estabeleceu a cadência: PR do Plan 02 / Phase 3.

```ts
// Pattern canônico — replicar em pain.ts, product.ts, etc.
export const HERO_COPY_VARIANTS = {
  v1: { /* direção A */ },
  v2: { /* direção B */ },
  v3: { /* direção C */ },
} as const satisfies Record<string, HeroCopy>;

export const HERO_COPY: HeroCopy = HERO_COPY_VARIANTS.v1;
```

## Anti-padrões (não fazer)

- **5+ variantes**: vira overload de revisão + risco de Frankenstein (D-07).
- **Variantes que são micro-ajustes de frase**: gasta o tempo do Lenny sem dar escolha real.
- **Pass de copy review único no fim de tudo**: viola D-17. Cada seção tem o próprio gate antes de a próxima começar.
- **Lenny escrever copy do zero**: contraria a cadência — Claude rascunha, Lenny edita/aprova. Cadência funciona pela velocidade de geração + curadoria.

## Gate técnico antes do PR estar pronto pra review

- `npm run typecheck` verde
- `npx vitest run tests/content/<secao>.test.ts` verde (shape test + "clínica" em h1+sub + anti-IA grep)
- `tests/sections/hero-invariants.test.ts` (Phase 3 Wave 0) ainda verde se a seção é o Hero
- Grep anti-IA em `src/content/<secao>.ts` retorna 0 matches

## Histórico de decisões

Git serve como histórico canônico — cada merge de PR de copy é a decisão registrada. Não duplicar em outro doc. Para reconstruir o histórico:

```bash
git log --oneline -- src/content/
```
