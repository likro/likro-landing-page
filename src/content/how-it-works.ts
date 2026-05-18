/**
 * Phase 4 / Plan 04-04 — HowItWorks copy module.
 *
 * 3 variantes contrastantes (D-17 cadência). Lenny aprova UMA via PR comment
 * 'LGTM v?' ou edit inline; depois desta plan, HOW_COPY = HOW_COPY_VARIANTS.v?
 * fica fixado e demais variantes archived no git history.
 *
 * Estrutura D-21/D-22: 4 passos timeline vertical (sequência travada):
 *   01 — Lead chega (mockupKind: "notification")
 *   02 — Operação distribui (mockupKind: "routing")
 *   03 — Atendente conversa (mockupKind: "conversation")
 *   04 — Paciente agendado (mockupKind: "calendar-slot")
 *
 * D-23 (tom): explicativo simplificador, NÃO compete com Hero/Product.
 *   v1 — Operacional simples (constatação direta).
 *   v2 — Editorial Linear/Stripe (substantivos secos).
 *   v3 — Verbos no presente (manual operacional).
 *
 * COPY-02: zero buzzwords anti-IA.
 * COPY-03: corpus contém clínica/paciente/atendimento/agendamento/lead.
 * D-27: zero menção a Dolce Home.
 * Anti-pitch: zero "jornada do cliente" / "transforme sua" (D-23 tom calmo).
 *
 * Gates em tests/content/how-it-works.test.ts.
 */

export type HowMockupKind = "notification" | "routing" | "conversation" | "calendar-slot";

export type HowStep = {
  number: string;
  headline: string;
  description: string;
  mockupKind: HowMockupKind;
};

export type HowCopy = {
  header: { h2: string; sub: string };
  steps: readonly [HowStep, HowStep, HowStep, HowStep];
};

/**
 * Micro-strings dos mini-mockups dos steps. Mantidos fora do `HowStep` shape
 * porque são conteúdo de mockup ilustrativo (NÃO copy editorial das variantes
 * D-17) e fixos entre v1/v2/v3 — fato operacional, não voz autoral.
 * COPY-01: storage em content/, jamais hard-coded em JSX.
 */
export const HOW_MOCKUP_STRINGS = {
  notification: {
    handle: "@marina_souza",
    meta: "novo lead · há 12s",
  },
  routing: {
    from: "Marina",
    to: "Dra. Camila",
  },
  conversation: {
    patient: "Vi o video da Dra. Camila. Queria saber preco.",
    agent: "Oi Marina! Vou te passar agora.",
  },
  calendarSlot: {
    selected: "Ter 14:30",
    placeholder: "·",
  },
} as const;

export const HOW_COPY_VARIANTS = {
  // ---------------------------------------------------------------------------
  // v1 — Operacional simples: headers de constatação direta, descrição factual.
  // ---------------------------------------------------------------------------
  v1: {
    header: {
      h2: "Do primeiro 'oi' ao agendamento, sem trocas de aplicativo.",
      sub: "O caminho que cada lead percorre dentro do sistema.",
    },
    steps: [
      {
        number: "01",
        headline: "Lead entra por qualquer canal.",
        description:
          "Instagram, WhatsApp, Facebook. Tudo vai pra mesma caixa de entrada multicanal.",
        mockupKind: "notification",
      },
      {
        number: "02",
        headline: "A operação distribui automaticamente.",
        description:
          "Cada conversa vai pra atendente certa pelo canal, especialidade ou idioma.",
        mockupKind: "routing",
      },
      {
        number: "03",
        headline: "Atendente conversa em uma tela só.",
        description:
          "Com histórico do paciente e contexto do canal já carregados no atendimento.",
        mockupKind: "conversation",
      },
      {
        number: "04",
        headline: "Paciente agendado, retorno marcado.",
        description:
          "Confirmação automática via WhatsApp, follow-up de 30 dias programado.",
        mockupKind: "calendar-slot",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // v2 — Editorial Linear/Stripe: headers em substantivo seco, descrição calma.
  // ---------------------------------------------------------------------------
  v2: {
    header: {
      h2: "O lead percorre quatro pontos. Você acompanha em um.",
      sub: "Como uma conversa vira agendamento dentro da Likro.",
    },
    steps: [
      {
        number: "01",
        headline: "Captação.",
        description:
          "Instagram, WhatsApp e Facebook entram em uma fila só na operação da clínica.",
        mockupKind: "notification",
      },
      {
        number: "02",
        headline: "Distribuição.",
        description:
          "A operação atribui o lead à atendente certa em segundos, sem repasse manual.",
        mockupKind: "routing",
      },
      {
        number: "03",
        headline: "Atendimento.",
        description:
          "A conversa acontece com contexto do paciente e histórico de canal já carregados.",
        mockupKind: "conversation",
      },
      {
        number: "04",
        headline: "Agendamento.",
        description:
          "Slot confirmado, retorno marcado, follow-up programado. Tudo dentro da conversa.",
        mockupKind: "calendar-slot",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // v3 — Verbos no presente: tom manual operacional, frases curtas conjugadas.
  // ---------------------------------------------------------------------------
  v3: {
    header: {
      h2: "Como o paciente entra na clínica pela tela.",
      sub: "Quatro passos do canal ao agendamento, sem ninguém trocar de aplicativo.",
    },
    steps: [
      {
        number: "01",
        headline: "O lead aparece.",
        description:
          "DM no Instagram, mensagem no WhatsApp, contato no Facebook. Tudo cai na mesma fila.",
        mockupKind: "notification",
      },
      {
        number: "02",
        headline: "A operação distribui.",
        description:
          "A lead vai pra atendente certa pelo canal, especialidade ou disponibilidade.",
        mockupKind: "routing",
      },
      {
        number: "03",
        headline: "A equipe conversa.",
        description:
          "Com o histórico do paciente e o contexto do canal já carregados na tela do atendimento.",
        mockupKind: "conversation",
      },
      {
        number: "04",
        headline: "O paciente agenda.",
        description:
          "Slot confirmado direto na conversa, retorno marcado automático para 30 dias depois.",
        mockupKind: "calendar-slot",
      },
    ],
  },
} as const satisfies Record<"v1" | "v2" | "v3", HowCopy>;

/**
 * HOW_COPY = variante ativa. Provisional: aponta para v1 (operacional simples)
 * até Lenny aprovar UMA via PR (cadência D-17). Após aprovação, manter o
 * ponteiro fixado e arquivar variantes não escolhidas no git history.
 */
export const HOW_COPY: HowCopy = HOW_COPY_VARIANTS.v1;
