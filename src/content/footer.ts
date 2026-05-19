/**
 * Microcopy do footer institucional enxuto (Phase 5).
 *
 * 1 linha desktop / 2 linhas mobile. Fundo DARK editorial (continuidade da Proof).
 */
export const FOOTER_COPY = {
  brand: "Likro",
  copyright: "© 2026 Likro. Operação para clínicas e estéticas.",
  links: [
    { label: "Política de privacidade", href: "/privacy", rel: "nofollow" },
    { label: "Conversar no WhatsApp", href: "#whatsapp" }, // href real vem do helper via <WhatsAppCta>
  ],
  whatsappCtaLabel: "Conversar no WhatsApp",
} as const;
