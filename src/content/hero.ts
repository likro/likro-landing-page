/**
 * Phase 3 — Hero copy module (redesign B aprovado pelo Lenny).
 *
 * Estrutura nova vs. v0:
 *   - h1 + sub (decisão B "sistema operacional" + sub captação→retorno)
 *   - ctaPrimary (WhatsApp) + ctaSecondary (anchor scroll)
 *   - trust signal vertical-específico
 *   - cards: 3 elementos do "momento de valor" desenhados em código (HeroCardStack)
 *
 * D-09: palavra "clínica" aparece em h1 E sub — verticalização cristalina.
 * D-11: ctaPrimary.label é exatamente "Falar no WhatsApp".
 * D-13: trust signal sussurrado; SEM citar Dolce Home (autorização pendente).
 * COPY-01: NADA inline em JSX — todo string vem daqui.
 * COPY-02: zero buzzwords "cara de IA".
 *
 * Histórico das 3 variantes v1/v2/v3 (cadência D-17) está no git — Lenny aprovou
 * direção B implementada acima. Variantes archived ficam pra referência:
 *   git show HEAD~N:src/content/hero.ts
 */

export type HeroCard = {
  kind: "lead" | "routing" | "scheduled";
  label: string;
  title: string;
  rows: ReadonlyArray<{
    type: "text" | "check" | "pending" | "live";
    content: string;
  }>;
  meta?: string;
};

export type HeroCopy = {
  h1: string;
  /** H1 partido para a ênfase itálica do Hero travessia (v2.0). h1Lead + h1Emphasis === h1. */
  h1Lead: string;
  h1Emphasis: string;
  sub: string;
  /**
   * Beat de RESOLUÇÃO da travessia (v2.0) — UMA linha que DÁ NOME ao que foi
   * sentido (caos→ordem), não explica. Registro premium, não slogan. Aparece no
   * auge da chegada com o CTA. resolveLead + resolveEmphasis === a conclusão.
   */
  resolveLead: string;
  resolveEmphasis: string;
  ctaPrimary: { label: string };
  ctaSecondary: { label: string; href: string };
  trust: string;
  cards: readonly [HeroCard, HeroCard, HeroCard];
};

export const HERO_COPY: HeroCopy = {
  h1: "O sistema operacional da sua clínica.",
  h1Lead: "O sistema operacional da ",
  h1Emphasis: "sua clínica.",
  sub: "WhatsApp, Instagram e a agenda da clínica num lugar só, da primeira mensagem ao paciente que volta.",
  resolveLead: "Nenhuma conversa fica ",
  resolveEmphasis: "para trás.",
  ctaPrimary: { label: "Falar no WhatsApp" },
  ctaSecondary: { label: "Ver como funciona", href: "#produto" },
  trust: "Em uso em clínicas de estética, dermatologia e harmonização facial.",
  cards: [
    {
      kind: "lead",
      label: "Instagram DM",
      title: "@marina_souza",
      rows: [
        { type: "text", content: "“Vi o vídeo da Dra. Camila sobre harmonização. Queria saber preço.”" },
      ],
      meta: "há 14s",
    },
    {
      kind: "routing",
      label: "Distribuição automática",
      title: "Marina → Dra. Camila",
      rows: [
        { type: "check", content: "Atribuído em 23s" },
        { type: "check", content: "1ª resposta enviada" },
        { type: "pending", content: "Aguardando retorno" },
      ],
    },
    {
      kind: "scheduled",
      label: "Agendamento confirmado",
      title: "Marina Souza",
      rows: [
        { type: "text", content: "Harmonização facial · 1ª sessão" },
        { type: "text", content: "Terça, 21/05 · 14:30" },
      ],
      meta: "Confirmação enviada via WhatsApp",
    },
  ],
};
