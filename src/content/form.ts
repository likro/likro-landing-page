/**
 * Microcopy do lead form (Phase 5).
 *
 * v1 = variante "premium silencioso" aprovada por Lenny no PR.
 * Tom: convite consultivo, anti-infoproduto, sem caps lock, sem urgência fabricada.
 * Plan 04 propõe 3 variantes em PR; após aprovação, esta constante reflete a final.
 *
 * Honeypot: name="website" (NÃO "company" — RESEARCH Pitfall 8).
 */
export const FORM_COPY = {
  sectionId: "lead-form-section",
  eyebrow: "Outra forma de falar",
  heading: "Prefere que a gente te procure?",
  subheading:
    "Deixa seu nome e WhatsApp que a gente te chama. Sem e-mail automático, sem insistência.",
  fields: {
    name: { label: "Nome", placeholder: "Seu nome" },
    whatsapp: { label: "WhatsApp", placeholder: "WhatsApp com DDD" },
    message: {
      label: "Mensagem (opcional)",
      placeholder: "Algo específico que você quer entender?",
    },
    honeypot: { label: "Seu site (não preencher)", name: "website" as const },
  },
  submit: {
    idle: "Quero conversar",
    submitting: "Enviando…",
  },
  success: {
    heading: "Recebido.",
    body: "Vou te chamar no WhatsApp pessoalmente em até 1 dia útil.",
    secondaryCtaLabel: "Ou fale agora no WhatsApp",
  },
  error: {
    heading: "Não consegui enviar.",
    body: "Tenta de novo ou fala agora no WhatsApp.",
    retryLabel: "Tentar de novo",
  },
  privacyNote:
    "Seus dados ficam só com a Likro. Sem terceiros, sem listas, sem spam.",
} as const;
