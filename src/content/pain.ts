/**
 * Phase 4 / Plan 04-01 — Pain copy module.
 *
 * 3 variantes contrastantes (D-17 cadência). Lenny aprova UMA via PR comment
 * 'LGTM v?' ou edit inline; depois desta plan, PAIN_COPY = PAIN_COPY_VARIANTS.v?
 * fica fixado e demais variantes archived no git history.
 *
 * v1 — Fragmentação direta:
 *   h2: "Sua operação está espalhada."
 *   Tom: constatação calma B2B (D-10/D-12).
 *
 * v2 — Consequência operacional ao paciente:
 *   h2: "O paciente espera. A operação demora a responder."
 *   Tom: ângulo humano dentro da postura B2B.
 *
 * v3 — Editorial contado em cifras de lugares:
 *   h2: "Quatro lugares. Nenhum em sincronia."
 *   Tom: editorial seco, Linear/Stripe.
 *
 * COPY-02: zero buzzwords anti-IA.
 * COPY-03: vertical clínica/paciente/atendimento aparece em h2 OU sub.
 * D-12: h2 NÃO termina em interrogação — afirmação.
 * D-27: zero menção a Dolce Home.
 */

export type PainCardRow = {
  type: "text" | "check" | "pending" | "strikethrough";
  content: string;
};

export type PainCardKind = "instagram" | "whatsapp" | "spreadsheet" | "notes";

export type PainCard = {
  kind: PainCardKind;
  label: string;
  title: string;
  rows: ReadonlyArray<PainCardRow>;
  meta?: string;
};

export type PainCopy = {
  h2: string;
  sub: string;
  statement: string;
  cards: readonly [PainCard, PainCard, PainCard, PainCard];
};

// Cards são fatos da operação clínica: variam estilo de copy só em h2/sub/statement,
// nunca nos cards. As 4 fontes de fragmentação são constantes da operação real.
const SHARED_CARDS: readonly [PainCard, PainCard, PainCard, PainCard] = [
  {
    kind: "instagram",
    label: "Instagram · DM",
    title: "@marina_souza",
    rows: [
      {
        type: "text",
        content:
          "“Oi, vi o vídeo da Dra. Camila. Queria saber preço de harmonização.”",
      },
    ],
    meta: "há 2h sem resposta",
  },
  {
    kind: "whatsapp",
    label: "WhatsApp · Camila",
    title: "3 conversas paradas",
    rows: [
      { type: "pending", content: "Aguardando 2ª mensagem" },
      { type: "pending", content: "Follow-up de retorno" },
    ],
  },
  {
    kind: "spreadsheet",
    label: "Planilha · Recepção",
    title: "Slot 14h não confirmado",
    rows: [{ type: "text", content: "Marina, falar amanhã" }],
    meta: "atualizado a mão",
  },
  {
    kind: "notes",
    label: "Notas · Caderno",
    title: "Retorno em 30 dias",
    rows: [
      { type: "strikethrough", content: "Maria 14/04" },
      { type: "text", content: "Carla 28/04 ?" },
    ],
  },
] as const;

export const PAIN_COPY_VARIANTS = {
  v1: {
    h2: "Sua operação está espalhada.",
    sub: "Instagram em um lugar, WhatsApp em outro, planilha da recepção, caderno da equipe. A clínica trabalha duas vezes para responder uma vez.",
    statement:
      "“Quando a operação depende de ferramentas espalhadas, o paciente sente primeiro.”",
    cards: SHARED_CARDS,
  },
  v2: {
    h2: "O paciente espera. A operação demora a responder.",
    sub: "A mensagem chega no Instagram, vira pendência no WhatsApp da recepção, espera a planilha abrir e o caderno conferir. Cada degrau custa horas. Às vezes, o agendamento.",
    statement:
      "“A clínica trabalha duas vezes para responder uma vez. O paciente percebe a demora.”",
    cards: SHARED_CARDS,
  },
  v3: {
    h2: "Quatro lugares. Nenhum em sincronia.",
    sub: "Instagram, WhatsApp, planilha da agenda, caderno de retornos. Quatro ferramentas que não se falam, e quem espera é o paciente.",
    statement:
      "“Cada conversa que esfria é um paciente que não volta.”",
    cards: SHARED_CARDS,
  },
} as const satisfies Record<"v1" | "v2" | "v3", PainCopy>;

/**
 * PAIN_COPY = variante ativa. Provisional: aponta para v1 até Lenny aprovar UMA via PR.
 * Após aprovação, manter o ponteiro fixado e arquivar variantes não escolhidas no git history.
 */
export const PAIN_COPY: PainCopy = PAIN_COPY_VARIANTS.v3;
