/**
 * Cobertura: CTA-08 (mensagem pré-preenchida específica por location).
 */
import { describe, expect, it } from "vitest";
import { WHATSAPP_MESSAGES } from "@/content/whatsapp";
import type { WhatsAppLocation } from "@/lib/whatsapp";

const ALL_LOCATIONS: WhatsAppLocation[] = [
  "hero",
  "header",
  "pain",
  "product",
  "how",
  "proof",
  "footer",
  "floating",
];

const BANNED_PHRASES = [
  "desbloqueie",
  "potencialize",
  "transforme sua",
  "próximo nível",
  "solução inovadora",
  "do início ao fim",
];

describe("WHATSAPP_MESSAGES", () => {
  it.each(ALL_LOCATIONS)("tem entry não-vazia para location=%s", (loc) => {
    expect(WHATSAPP_MESSAGES[loc]).toBeTruthy();
    expect(WHATSAPP_MESSAGES[loc].length).toBeGreaterThan(5);
  });

  it("não contém frases banidas anti-IA", () => {
    for (const loc of ALL_LOCATIONS) {
      const lower = WHATSAPP_MESSAGES[loc].toLowerCase();
      for (const banned of BANNED_PHRASES) {
        expect(lower, `location=${loc} contains banned phrase "${banned}"`).not.toContain(banned);
      }
    }
  });

  it("não hard-codeia wa.me ou web.whatsapp.com", () => {
    for (const loc of ALL_LOCATIONS) {
      expect(WHATSAPP_MESSAGES[loc]).not.toMatch(/wa\.me/i);
      expect(WHATSAPP_MESSAGES[loc]).not.toMatch(/web\.whatsapp\.com/i);
    }
  });
});
