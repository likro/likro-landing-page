import { describe, expect, it } from "vitest";
import { HERO_COPY } from "@/content/hero";

/**
 * Phase 3 redesign B — Hero copy contracts.
 *
 * Anteriormente esta suíte testava o catálogo de 3 variantes (HERO_COPY_VARIANTS).
 * Após o redesign B aprovado pelo Lenny, restou uma direção única ativa em HERO_COPY.
 * Variantes ficam no git history. Os gates anti-IA + 'clínica' em h1+sub + D-11 ctaLabel
 * + D-13 sem Dolce Home + D-17 unified gate continuam ativos sobre a nova shape.
 */

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;
const CLINICA_REGEX = /cl[ií]nicas?/i;

describe("HERO_COPY — Phase 3 redesign B contracts", () => {
  it("h1, sub, ctaPrimary.label, ctaSecondary.{label,href}, trust são strings não vazias", () => {
    expect(typeof HERO_COPY.h1).toBe("string");
    expect(HERO_COPY.h1.length).toBeGreaterThan(0);
    expect(typeof HERO_COPY.sub).toBe("string");
    expect(HERO_COPY.sub.length).toBeGreaterThan(0);
    expect(typeof HERO_COPY.ctaPrimary.label).toBe("string");
    expect(typeof HERO_COPY.ctaSecondary.label).toBe("string");
    expect(typeof HERO_COPY.ctaSecondary.href).toBe("string");
    expect(HERO_COPY.ctaSecondary.href.length).toBeGreaterThan(0);
    expect(typeof HERO_COPY.trust).toBe("string");
  });

  it("'clínica' aparece em h1 E sub (D-09 verticalização cristalina)", () => {
    expect(CLINICA_REGEX.test(HERO_COPY.h1), "h1 missing 'clínica'").toBe(true);
    expect(CLINICA_REGEX.test(HERO_COPY.sub), "sub missing 'clínica'").toBe(true);
  });

  it("ctaPrimary.label é exatamente 'Falar no WhatsApp' (D-11 locked)", () => {
    expect(HERO_COPY.ctaPrimary.label).toBe("Falar no WhatsApp");
  });

  it("ctaSecondary.href é âncora válida (começa com # ou URL absoluta)", () => {
    const h = HERO_COPY.ctaSecondary.href;
    expect(h.startsWith("#") || /^https?:\/\//.test(h)).toBe(true);
  });

  it("trust signal NÃO menciona Dolce Home (D-13 — autorização pendente)", () => {
    expect(/dolce home/i.test(HERO_COPY.trust)).toBe(false);
  });

  it("nenhuma string textual contém frases banidas anti-IA (COPY-02)", () => {
    const cardText = HERO_COPY.cards
      .flatMap((c) => [c.label, c.title, c.meta ?? "", ...c.rows.map((r) => r.content)])
      .join(" ");
    const combined = `${HERO_COPY.h1} ${HERO_COPY.sub} ${HERO_COPY.trust} ${HERO_COPY.ctaPrimary.label} ${HERO_COPY.ctaSecondary.label} ${cardText}`;
    const match = combined.match(BANNED_PHRASES);
    expect(match === null, `Banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("cards é array de 3 elementos com kinds 'lead' → 'routing' → 'active'", () => {
    expect(HERO_COPY.cards).toHaveLength(3);
    expect(HERO_COPY.cards[0].kind).toBe("lead");
    expect(HERO_COPY.cards[1].kind).toBe("routing");
    expect(HERO_COPY.cards[2].kind).toBe("active");
  });

  it("nenhum card menciona Dolce Home (D-13)", () => {
    for (const card of HERO_COPY.cards) {
      const combined = `${card.label} ${card.title} ${card.meta ?? ""} ${card.rows.map((r) => r.content).join(" ")}`;
      expect(/dolce home/i.test(combined), `card '${card.kind}' mentions Dolce Home`).toBe(
        false,
      );
    }
  });

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
