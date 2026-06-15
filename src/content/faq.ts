/**
 * FAQ copy — objeções clássicas de clínica respondidas antes do CTA final.
 *
 * Respostas fornecidas pelo Lenny (fatos reais, 2026-06-15). Tom humano, sem
 * jargão, sem travessão (regra Lenny). COPY-01: toda copy vive aqui, zero inline.
 */
export type FaqItem = { q: string; a: string };
export type FaqCopy = {
  eyebrow: string;
  heading: string;
  items: readonly FaqItem[];
};

export const FAQ_COPY = {
  eyebrow: "DÚVIDAS",
  heading: "As perguntas que toda clínica faz.",
  items: [
    {
      q: "Funciona com o WhatsApp que eu já uso?",
      a: "Sim. A Likro conecta pelo número que a clínica já usa, via API oficial da Meta.",
    },
    {
      q: "Integra com a minha agenda?",
      a: "Sim. A Likro integra com a agenda que sua clínica já usa.",
    },
    {
      q: "É difícil de começar? Quanto tempo leva?",
      a: "A configuração inicial é rápida e a gente faz junto com você. Em poucos dias sua equipe já está atendendo pela Likro e o sistema vai ficando mais afiado conforme a clínica usa.",
    },
    {
      q: "Minha equipe vai conseguir usar?",
      a: "Foi feito pra recepção, não pra TI. Quem usa WhatsApp no dia a dia aprende a usar a Likro em minutos.",
    },
    {
      q: "Tem contrato com fidelidade?",
      a: "Não. Os planos são mensais e você pode cancelar quando quiser.",
    },
    {
      q: "Segurança dos dados do paciente (LGPD)?",
      a: "Sim. Os dados dos seus pacientes ficam armazenados com segurança e não são compartilhados com terceiros. A Likro opera sobre infraestrutura brasileira e em conformidade com a LGPD.",
    },
  ],
} as const satisfies FaqCopy;
