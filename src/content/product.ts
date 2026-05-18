/**
 * Phase 4 / Plan 04-03 — Product copy module.
 *
 * 3 variantes contrastantes (D-17 cadência). Lenny aprova UMA via PR comment
 * 'LGTM v?' ou edit inline; depois desta plan, PRODUCT_COPY = PRODUCT_COPY_VARIANTS.v?
 * fica fixado e demais variantes archived no git history.
 *
 * Estrutura D-16: 1 hero feature "Atendimento multicanal" full-width +
 * 3 secundárias em row (Distribuição automática / Follow-up e retorno / Agenda operacional).
 * NARR-08 (D-20.1): camada IA implícita via micro-line dentro do mockup hero —
 * "atribuído automaticamente · sugestão de resposta aceita" (tom Linear/Stripe,
 * NÃO Anthropic/OpenAI marketing).
 *
 * v1 — Operacional concreto:
 *   header.h2: "A operação do atendimento, em uma única camada."
 *   Tom: constatação operacional B2B (D-10/D-12).
 *
 * v2 — Identidade categórica:
 *   header.h2: "A camada operacional da clínica de estética."
 *   Tom: categorial — define o que a Likro É.
 *
 * v3 — Editorial seco:
 *   header.h2: "Um lugar pro atendimento da clínica viver."
 *   Tom: editorial Linear/Stripe (mais direto, menos institucional).
 *
 * COPY-02 + D-20.1: zero buzzwords anti-IA, zero cyberpunk vocabulary
 *   (gates em tests/content/product.test.ts).
 * D-16: zero pillar de "report" / zero CRM standalone como title (gates em tests/content/product.test.ts).
 * D-17: feature.title contém "multicanal" OU "atendimento".
 * COPY-03: vertical clínica/paciente/atendimento aparece em h2/sub/feature.description ou em secundárias.
 * D-27: zero menção a Dolce Home.
 */

export type ProductInboxRow = {
  channel: "instagram" | "whatsapp" | "facebook";
  from: string;
  preview: string;
  meta?: string;
  status?: "new" | "assigned" | "responded";
};

export type ProductSecondaryMockupKind = "routing-pill" | "timeline-3pts" | "calendar-grid";

export type ProductSecondary = {
  eyebrow: string;
  title: string;
  description: string;
  mockupKind: ProductSecondaryMockupKind;
};

export type ProductCopy = {
  header: { h2: string; sub: string };
  feature: {
    eyebrow: string;
    title: string;
    description: string;
    mockup: {
      cardTitle: string;
      cardLabel: string;
      newCountBadge: string;
      inboxRows: ReadonlyArray<ProductInboxRow>;
      iaLine: string;
      overlayRouting: { from: string; to: string };
      overlayConfirm: { name: string; slot: string };
    };
  };
  secondaries: readonly [ProductSecondary, ProductSecondary, ProductSecondary];
};

// Inbox rows + overlays consistentes entre variantes — fatos da operação,
// não voz editorial. Varia o ângulo do header/title/description, não os fatos.
const SHARED_INBOX_ROWS: ReadonlyArray<ProductInboxRow> = [
  {
    channel: "instagram",
    from: "@marina_souza",
    preview: "Vi o vídeo da Dra. Camila — queria saber preço.",
    meta: "há 12s",
    status: "new",
  },
  {
    channel: "whatsapp",
    from: "Carla Mendes",
    preview: "Posso remarcar pra terça?",
    meta: "há 1min",
    status: "assigned",
  },
  {
    channel: "facebook",
    from: "Lucas Pereira",
    preview: "Obrigado! Confirmado pra amanhã 14h.",
    meta: "há 3min",
    status: "responded",
  },
] as const;

const SHARED_OVERLAY_ROUTING = { from: "Marina", to: "Dra. Camila" } as const;
const SHARED_OVERLAY_CONFIRM = { name: "Carla Mendes", slot: "Ter · 14:30" } as const;
const SHARED_CARD_TITLE = "Atendimentos";
const SHARED_CARD_LABEL = "Caixa de entrada multicanal";
const SHARED_NEW_BADGE = "3 novos";

// Secundárias mantêm eyebrows estáveis; descrição varia o tom por variante.
const SHARED_SECONDARY_EYEBROWS = ["DISTRIBUIÇÃO", "FOLLOW-UP", "AGENDA"] as const;

export const PRODUCT_COPY_VARIANTS = {
  v1: {
    header: {
      h2: "A operação do atendimento, em uma única camada.",
      sub: "Lead do Instagram, conversa no WhatsApp, agenda da recepção — tudo na mesma tela.",
    },
    feature: {
      eyebrow: "OPERAÇÃO MULTICANAL",
      title: "Atendimento multicanal.",
      description:
        "A equipe responde tudo de um lugar só. WhatsApp, Instagram e Facebook em uma caixa de entrada compartilhada — com contexto do paciente já carregado.",
      mockup: {
        cardTitle: SHARED_CARD_TITLE,
        cardLabel: SHARED_CARD_LABEL,
        newCountBadge: SHARED_NEW_BADGE,
        inboxRows: SHARED_INBOX_ROWS,
        iaLine: "Atribuído automaticamente · sugestão de resposta aceita",
        overlayRouting: SHARED_OVERLAY_ROUTING,
        overlayConfirm: SHARED_OVERLAY_CONFIRM,
      },
    },
    secondaries: [
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[0],
        title: "Cada lead com o atendente certo.",
        description:
          "Roteamento automático por canal, idioma, especialidade — sem fila travada.",
        mockupKind: "routing-pill",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[1],
        title: "Ninguém esquece de voltar a falar.",
        description:
          "Conversas que ficaram em aberto viram lembrete; retornos do paciente viram agendamento.",
        mockupKind: "timeline-3pts",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[2],
        title: "A agenda na mesma tela do atendimento.",
        description:
          "Slots disponíveis na hora, agendamento direto da conversa, confirmação automática via WhatsApp.",
        mockupKind: "calendar-grid",
      },
    ],
  },
  v2: {
    header: {
      h2: "A camada operacional da clínica de estética.",
      sub: "O canal, o atendimento e a agenda em sincronia — sem o atendente trocar de aplicativo.",
    },
    feature: {
      eyebrow: "CAIXA DE ENTRADA",
      title: "Caixa de entrada multicanal.",
      description:
        "Cada lead entra por um canal diferente — Instagram, WhatsApp, Facebook. Aqui ele entra em uma fila só, com histórico do paciente sempre por perto.",
      mockup: {
        cardTitle: SHARED_CARD_TITLE,
        cardLabel: SHARED_CARD_LABEL,
        newCountBadge: SHARED_NEW_BADGE,
        inboxRows: SHARED_INBOX_ROWS,
        iaLine: "Roteamento automático · contexto do paciente carregado",
        overlayRouting: SHARED_OVERLAY_ROUTING,
        overlayConfirm: SHARED_OVERLAY_CONFIRM,
      },
    },
    secondaries: [
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[0],
        title: "Distribuição automática entre atendentes.",
        description:
          "O lead vai pro atendente certo na hora certa — sem fila parada, sem disputa interna.",
        mockupKind: "routing-pill",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[1],
        title: "Follow-up sem ninguém precisar lembrar.",
        description:
          "Conversa parada vira tarefa, retorno do paciente vira agendamento — a operação não esquece.",
        mockupKind: "timeline-3pts",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[2],
        title: "Agendamento direto da conversa.",
        description:
          "Slot livre aparece na própria thread, confirmação automática, recepção sem retrabalho.",
        mockupKind: "calendar-grid",
      },
    ],
  },
  v3: {
    header: {
      h2: "Um lugar pro atendimento da clínica viver.",
      sub: "Multicanal, integrado à agenda, com a equipe na mesma página.",
    },
    feature: {
      eyebrow: "MULTICANAL",
      title: "Atendimento multicanal.",
      description:
        "Instagram, WhatsApp, Facebook — uma caixa de entrada. Distribuição automática pra equipe certa, histórico do paciente sempre por perto.",
      mockup: {
        cardTitle: SHARED_CARD_TITLE,
        cardLabel: SHARED_CARD_LABEL,
        newCountBadge: SHARED_NEW_BADGE,
        inboxRows: SHARED_INBOX_ROWS,
        iaLine: "Distribuído pela IA · pronto pra resposta",
        overlayRouting: SHARED_OVERLAY_ROUTING,
        overlayConfirm: SHARED_OVERLAY_CONFIRM,
      },
    },
    secondaries: [
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[0],
        title: "Roteamento por canal e especialidade.",
        description: "O lead chega ao atendente certo, sem espera, sem repasse manual.",
        mockupKind: "routing-pill",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[1],
        title: "Retornos que voltam sozinhos pra agenda.",
        description:
          "O follow-up não depende da memória da equipe — depende da operação.",
        mockupKind: "timeline-3pts",
      },
      {
        eyebrow: SHARED_SECONDARY_EYEBROWS[2],
        title: "Agenda viva ao lado da conversa.",
        description:
          "Horários disponíveis aparecem em tempo real, agendamento confirma direto.",
        mockupKind: "calendar-grid",
      },
    ],
  },
} as const satisfies Record<"v1" | "v2" | "v3", ProductCopy>;

/**
 * PRODUCT_COPY = variante ativa. Provisional: aponta para v1 (operacional concreto)
 * até Lenny aprovar UMA via PR. Após aprovação, manter o ponteiro fixado e arquivar
 * variantes não escolhidas no git history (mesma cadência D-17 Phase 3 + Plans 04-01/02).
 */
export const PRODUCT_COPY: ProductCopy = PRODUCT_COPY_VARIANTS.v1;
