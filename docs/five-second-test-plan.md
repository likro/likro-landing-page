# 5-second test — Hero (HERO-07)

> 3 pessoas sem contexto olham apenas a primeira viewport por 5 segundos e descrevem em 1 frase. Manual; não automatizável.

## Prompt literal (mandar via WhatsApp ou em pessoa)

> "Oi, preciso de uma ajuda rápida. Abre esse link no celular: `<VERCEL_PREVIEW_URL>` — olha só o que aparece na primeira tela por 5 segundos (pode marcar no relógio), depois fecha e me escreve em UMA frase: que produto é, pra quem é, e qual a ação principal. Sem ver de novo depois, vale a primeira impressão."

## Logística

1. Lenny escolhe 3 pessoas SEM contexto do projeto:
   - Não pode ser quem participou da discuss/research
   - Idealmente: 1 dono de clínica/estética real (público-alvo), 1 amigo/colega aleatório, 1 pessoa fora do setor SaaS
2. Mandar prompt acima via WhatsApp ou conduzir presencialmente (5s no relógio, depois fecha a página)
3. Aceitar a primeira frase enviada — sem follow-up que enviese a resposta
4. Copiar literalmente as 3 respostas (sem edição) em `03-VERIFICATION.md`

## Critérios de pass

Cada resposta é avaliada em 3 dimensões:

| Item | Pass se a frase menciona... |
|------|------------------------------|
| **Categoria do produto** | "plataforma", "sistema", "CRM", "operação", "atendimento" — não precisa dizer "Likro" |
| **Público (verticalização)** | "clínica", "estética", "consultório", "salão" — explicitamente vertical |
| **CTA primário** | "WhatsApp" como ação |

**Resultado:**
- **Pass:** ≥2 das 3 respostas acertam os 3 itens (D-19 / HERO-07)
- **Soft pass:** 2 respostas acertam 2 dos 3 itens — discutir com Lenny se itera ou aceita
- **Fail:** ≥2 respostas não mencionam "clínica" OU "WhatsApp" — reavaliar copy/composição ANTES de Phase 4

## Viés social — mitigação

Pessoas próximas tendem a "ajudar" e dar feedback inflado. Mitigação:
- Prompt explícito ("primeira impressão", "sem ver de novo")
- ≥3 pessoas, idealmente 1 fora do círculo próximo
- Se 3 respostas forem todas elogiosas mas erram itens, considerar fail (sinal de viés)

## Registro

Em `.planning/phases/03-hero-benchmarked-isolado/03-VERIFICATION.md` §"5-second test", incluir:
- Data do teste
- Quem (relação com Lenny — "irmão dono de salão", "colega Insper", etc.)
- Resposta literal (sem editar)
- Avaliação dos 3 itens (✓/✗ cada)
- Veredicto final: pass / soft pass / fail
