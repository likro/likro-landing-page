import { describe, expect, it } from "vitest";
import { FAQ_COPY } from "@/content/faq";

/**
 * FAQ copy contracts — shape + gates de tom (sem travessão, anti-IA).
 */
const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

function corpus(): string {
  return `${FAQ_COPY.eyebrow} ${FAQ_COPY.heading} ${FAQ_COPY.items
    .map((i) => `${i.q} ${i.a}`)
    .join(" ")}`;
}

describe("FAQ_COPY", () => {
  it("shape: eyebrow, heading e items[{q,a}] não vazios (≥4 itens)", () => {
    expect(typeof FAQ_COPY.eyebrow).toBe("string");
    expect(FAQ_COPY.eyebrow.length).toBeGreaterThan(0);
    expect(FAQ_COPY.heading.length).toBeGreaterThan(0);
    expect(FAQ_COPY.items.length).toBeGreaterThanOrEqual(4);
    for (const item of FAQ_COPY.items) {
      expect(item.q.length, `pergunta vazia`).toBeGreaterThan(0);
      expect(item.a.length, `resposta vazia`).toBeGreaterThan(0);
    }
  });

  it("zero travessão (—) na copy (regra Lenny)", () => {
    expect(corpus().includes("—"), "FAQ contém travessão").toBe(false);
  });

  it("zero frases banidas anti-IA (COPY-02)", () => {
    const m = corpus().match(BANNED_PHRASES);
    expect(m === null, `Frase banida: ${m?.[0] ?? ""}`).toBe(true);
  });
});
