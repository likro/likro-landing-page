/**
 * Phase 9 / Plan 09-01 — Funil (Caminho do Paciente) copy module.
 *
 * Capítulo ESCURO do milestone v2.1 (Capítulos Visuais). UM paciente, "Marina",
 * atravessa o board Kanban da 1ª à 4ª coluna conforme o scroll; a coluna ativa
 * acende e o clímax (coluna 4) ignita o roxo. O board é palco, ela é a história.
 *
 * Copy 100% TRAVADA por Lenny (09-CONTEXT D-5/D-6 + protótipo aprovado). Sem
 * variantes v1/v2/v3 — todas as strings já aprovadas. Por isso um único
 * `FUNNEL_COPY` const (sem variant map, ao contrário de how-it-works.ts).
 *
 * Decisões travadas refletidas aqui:
 * - D-3: PROIBIDO número/KPI/%/gráfico/taxa/contador/dashboard na seção. Os
 *   únicos dígitos são horários de consulta humanos ("14h"), nunca métrica.
 * - D-5: headline + eyebrow travados.
 * - D-6: fechamento travado; os canais Meta de chat/rede social ficam FORA do
 *   fechamento (a rede social só aparece no capítulo Produto).
 * - D-7: SEM legenda sob o board (rejeitada duas vezes) — não existe campo de
 *   caption neste módulo de propósito.
 *
 * COPY-01: NADA inline em JSX — todo string vem daqui (FUNIL-COPY).
 * COPY-02: zero buzzwords anti-IA.
 * COPY-03: corpus contém termos verticais de clínica (paciente/consulta/horário/atend).
 *
 * Gates em tests/content/funnel.test.ts.
 */

export type FunnelBeat = { head: string; channel: string; moment: string };

export type FunnelCopy = {
  eyebrow: string;
  headline: string;
  /** Protagonista nomeada — vem do content, jamais hard-coded no JSX do MarinaCard (COPY-01). */
  protagonist: string;
  steps: readonly [FunnelBeat, FunnelBeat, FunnelBeat, FunnelBeat];
  seal: string;
  /**
   * Fechamento: o JSX renderiza `lead + accent + tail`. `lead` é vazio porque o
   * accent span abre a frase. `lead + accent + tail` reconstrói a frase travada.
   */
  closing: { lead: string; accent: string; tail: string };
};

export const FUNNEL_COPY = {
  eyebrow: "O caminho do paciente",
  headline: "Você vê cada paciente, do primeiro oi até a consulta.",
  protagonist: "Marina",
  steps: [
    {
      head: "Chegou agora",
      channel: "via WhatsApp",
      moment: '"Oi, queria saber sobre os horários de vocês 🙂"',
    },
    {
      head: "Em atendimento",
      channel: "Atendente assumiu",
      moment: "Júlia respondeu e já está cuidando da Marina.",
    },
    {
      head: "Escolhendo horário",
      channel: "Agenda aberta",
      moment: "Marina escolheu quinta às 14h entre os horários livres.",
    },
    {
      head: "Consulta marcada",
      channel: "Confirmado",
      moment: "Lembrete enviado. Marina confirmou a presença.",
    },
  ],
  seal: "Consulta confirmada · quinta, 14h",
  closing: {
    lead: "",
    accent: "WhatsApp, Instagram, agenda, funil e IA",
    tail: " trabalhando juntos pra transformar conversa em consulta.",
  },
} as const satisfies FunnelCopy;
