import type { WhatsAppLocation } from "@/lib/whatsapp";

/**
 * D-12: Mensagens pré-preenchidas por location.
 * Claude rascunha, Lenny aprova no PR antes da seção entrar em dev.
 *
 * Phase 1 entrega placeholders. Phase 3+ revisa e aprova section-by-section.
 */
export const WHATSAPP_MESSAGES: Record<WhatsAppLocation, string> = {
  hero: "Oi! Vi a Likro no Instagram e quero entender como funciona pra minha clínica.",
  pain: "Oi! Tô com dificuldade pra organizar o atendimento da clínica — pode me explicar como a Likro ajuda?",
  product:
    "Oi! Vi os recursos da Likro e quero conversar sobre como aplicar na minha clínica.",
  how: "Oi! Quero entender como ficaria o fluxo de lead do Instagram até a marcação na minha clínica.",
  proof: "Oi! Quero conversar sobre a Likro pra minha clínica.",
  footer: "Oi! Quero saber mais sobre a Likro.",
  floating: "Oi! Quero conversar sobre a Likro.",
};
