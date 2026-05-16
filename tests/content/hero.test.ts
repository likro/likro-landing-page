import { describe, expect, it } from "vitest";
import { HERO_COPY, HERO_COPY_VARIANTS, type HeroCopy } from "@/content/hero";

/**
 * Phase 3 Plan 02 Task 1 — Hero copy contracts.
 *
 * Gates that LOCK Phase 3 D-07/D-09/D-11/D-13 + COPY-02 anti-IA + D-17 copy
 * review unified gate (per-section, not per-file). Plan 03 PR has the
 * checkbox "Aprovar mensagem pré-preenchida WHATSAPP_MESSAGES.<location>"
 * — this test enforces that the Hero h1/sub variantes AND the WhatsApp
 * pre-filled messages for "hero" + "header" all pass the same anti-IA
 * gate in the SAME PR.
 */

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;
const CLINICA_REGEX = /cl[ií]nicas?/i;
const ICON_ALLOWLIST = ["Instagram", "MessageSquare", "BellRing"] as const;

describe("HERO_COPY_VARIANTS — Phase 3 D-07/D-09/D-11/D-13 contracts", () => {
  it("exporta exatamente 3 variantes: v1, v2, v3 (D-07)", () => {
    expect(Object.keys(HERO_COPY_VARIANTS).sort()).toEqual(["v1", "v2", "v3"]);
  });

  it("cada variante satisfaz HeroCopy shape", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      const v: HeroCopy = variant;
      expect(typeof v.h1, `${key}.h1`).toBe("string");
      expect(typeof v.sub, `${key}.sub`).toBe("string");
      expect(typeof v.ctaLabel, `${key}.ctaLabel`).toBe("string");
      expect(typeof v.trust, `${key}.trust`).toBe("string");
      expect(typeof v.microCard.text, `${key}.microCard.text`).toBe("string");
      expect(typeof v.microCard.iconName, `${key}.microCard.iconName`).toBe("string");
    }
  });

  it("'clínica' aparece em h1 E sub em todas as variantes (D-09)", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      expect(CLINICA_REGEX.test(variant.h1), `${key}.h1 missing 'clínica'`).toBe(true);
      expect(CLINICA_REGEX.test(variant.sub), `${key}.sub missing 'clínica'`).toBe(true);
    }
  });

  it("ctaLabel é exatamente 'Falar no WhatsApp' (D-11 locked)", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      expect(variant.ctaLabel, `${key}.ctaLabel`).toBe("Falar no WhatsApp");
    }
  });

  it("microCard.iconName está no allowlist (D-05)", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      expect(ICON_ALLOWLIST, `${key}.microCard.iconName`).toContain(
        variant.microCard.iconName,
      );
    }
  });

  it("trust signal NÃO menciona Dolce Home (D-13 — autorização pendente)", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      expect(/dolce home/i.test(variant.trust), `${key}.trust mentions Dolce Home`).toBe(
        false,
      );
    }
  });

  it("nenhuma string contém frases banidas anti-IA (COPY-02)", () => {
    for (const [key, variant] of Object.entries(HERO_COPY_VARIANTS)) {
      const combined = `${variant.h1} ${variant.sub} ${variant.trust} ${variant.microCard.text}`;
      const match = combined.match(BANNED_PHRASES);
      expect(
        match === null,
        `${key} contains banned phrase: ${match?.[0] ?? ""}`,
      ).toBe(true);
    }
  });

  it("HERO_COPY é igual a uma das variantes (ativo provisional)", () => {
    const variants = Object.values(HERO_COPY_VARIANTS);
    expect(variants).toContain(HERO_COPY);
  });

  // Test 9 (BLOCKER 1 fix — D-17 unified copy gate)
  // WHATSAPP_MESSAGES.hero + .header pass same anti-IA + Lenny gate as HERO_COPY.
  it("WHATSAPP_MESSAGES.hero + .header pass length, anti-IA, no Dolce Home (D-17 copy gate)", async () => {
    const { WHATSAPP_MESSAGES } = await import("@/content/whatsapp");
    for (const loc of ["hero", "header"] as const) {
      const msg = WHATSAPP_MESSAGES[loc];
      expect(typeof msg, `${loc} msg present`).toBe("string");
      expect(msg.length, `${loc} msg length > 10`).toBeGreaterThan(10);
      expect(msg.length, `${loc} msg length < 200`).toBeLessThan(200);
      expect(BANNED_PHRASES.test(msg), `${loc} contains banned phrase`).toBe(false);
      expect(/dolce home/i.test(msg), `${loc} mentions Dolce Home`).toBe(false);
    }
  });
});
