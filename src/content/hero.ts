/**
 * Phase 3 — Hero copy module.
 *
 * D-07: 3 variantes contrastantes de headline+sub.
 * Lenny aprova UMA via PR (mudando a linha export const HERO_COPY = ...).
 *
 * Convenção (D-17 estabelece pra todas as seções da Phase 4):
 *   - HERO_COPY_VARIANTS é o catálogo (não consumido em runtime do Hero diretamente)
 *   - HERO_COPY é o ativo — APENAS este é importado por src/sections/Hero/*
 *   - Mudar o ativo = mudar a linha `export const HERO_COPY = HERO_COPY_VARIANTS.X`
 *   - Lenny aprova via comentário no PR ("LGTM v2") OU empurra commit alterando essa linha
 *
 * D-09: palavra "clínica" aparece em h1 E sub — repetição deliberada, verticalização cristalina.
 * D-11: ctaLabel é exatamente "Falar no WhatsApp" — sem variação por device.
 * D-13: trust signal é uma linha sussurrada; SEM citar Dolce Home (autorização pendente).
 * D-05: microCard é estático (HeroMicroCard.tsx não anima entrada); iconName limitado.
 *
 * T-3-01 mitigation: arquivo é módulo TS estático compilado em build. Zero runtime
 * injection. JSX escapa por default — consumidores NÃO usam dangerouslySetInnerHTML.
 */

export type HeroCopy = {
  h1: string;
  sub: string;
  ctaLabel: string;
  trust: string;
  microCard: {
    text: string;
    iconName: "Instagram" | "MessageSquare" | "BellRing";
  };
};

export const HERO_COPY_VARIANTS = {
  // VARIANTE A — afirmação de identidade vertical pura (D-08 principal)
  v1: {
    h1: "A operação da sua clínica, em um só lugar.",
    sub: "Lead que chegou pelo Instagram, conversa no WhatsApp, agendamento, retorno — a sua clínica organizada numa plataforma só.",
    ctaLabel: "Falar no WhatsApp",
    trust: "Operação ativa em clínicas reais hoje.",
    microCard: { text: "Novo lead pelo Instagram", iconName: "Instagram" },
  },
  // VARIANTE B — afirmação + influência leve de categoria-criação (D-07.b)
  v2: {
    h1: "A plataforma da clínica moderna brasileira.",
    sub: "Não é um CRM pesado, não é um chatbot solto. É a operação da sua clínica — atendimento, agendamento e equipe — em um lugar só.",
    ctaLabel: "Falar no WhatsApp",
    trust: "Em uso por clínicas brasileiras agora.",
    microCard: { text: "Atendendo agora · 2 atendentes online", iconName: "MessageSquare" },
  },
  // VARIANTE C — ângulo de especificidade operacional concreta (D-07.c)
  v3: {
    h1: "Do DM no Instagram ao agendamento da sua clínica, sem perder a conversa no caminho.",
    sub: "Atendimento centralizado, retorno automático, equipe da sua clínica vendo tudo do mesmo lugar.",
    ctaLabel: "Falar no WhatsApp",
    trust: "Resposta humana em minutos no horário comercial.",
    microCard: { text: "Lead respondido · 2 min", iconName: "BellRing" },
  },
} as const satisfies Record<string, HeroCopy>;

// Ativo provisional — Lenny aprova mudança no Plan 03 PR
export const HERO_COPY: HeroCopy = HERO_COPY_VARIANTS.v1;
