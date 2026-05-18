import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-01 — PAIN_COPY contracts.
 *
 * Mirrors tests/content/hero.test.ts adapted for the Pain copy module.
 * Tests skip gracefully if src/content/pain.ts hasn't been created yet (Task 2
 * lands the copy module). Skip-if pattern matches Phase 3 invariant style.
 *
 * Contracts asserted:
 *   - Shape: h2, sub, statement, cards (length 4) with {kind, label, title, rows, meta?}.
 *   - Verticalization (COPY-03): h2 OR sub contains 'clínica'/'paciente'/'atendimento'/'agendamento'.
 *   - D-12: h2 does NOT end in '?'.
 *   - COPY-02 anti-IA banned phrases regex matches nothing across joined copy.
 *   - D-27: zero mention of 'Dolce Home' (carried over from Phase 3).
 *   - PAIN_COPY_VARIANTS exports v1, v2, v3 (all three with same shape).
 */

const PAIN_COPY_FILE = path.resolve(__dirname, "../../src/content/pain.ts");
const painCopyExists = fs.existsSync(PAIN_COPY_FILE);

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;
const VERTICAL_REGEX = /cl[ií]nicas?|paciente|atendimento|agendamento/i;

describe.skipIf(!painCopyExists)("PAIN_COPY — Phase 4 / Plan 04-01 contracts", () => {
  it("PAIN_COPY shape — h2, sub, statement, cards[4]", async () => {
    const { PAIN_COPY } = await import("@/content/pain");
    expect(typeof PAIN_COPY.h2).toBe("string");
    expect(PAIN_COPY.h2.length).toBeGreaterThan(0);
    expect(typeof PAIN_COPY.sub).toBe("string");
    expect(PAIN_COPY.sub.length).toBeGreaterThan(0);
    expect(typeof PAIN_COPY.statement).toBe("string");
    expect(PAIN_COPY.statement.length).toBeGreaterThan(0);
    expect(Array.isArray(PAIN_COPY.cards)).toBe(true);
    for (const card of PAIN_COPY.cards) {
      expect(typeof card.kind).toBe("string");
      expect(typeof card.label).toBe("string");
      expect(typeof card.title).toBe("string");
      expect(Array.isArray(card.rows)).toBe(true);
    }
  });

  it(
    "h2 OR sub contains vertical term (clínica|paciente|atendimento|agendamento) — COPY-03",
    async () => {
      const { PAIN_COPY } = await import("@/content/pain");
      const combined = `${PAIN_COPY.h2} ${PAIN_COPY.sub}`;
      expect(
        VERTICAL_REGEX.test(combined),
        `COPY-03 violation: h2 OR sub must mention clínica/paciente/atendimento/agendamento.\nGot: ${combined}`,
      ).toBe(true);
    },
  );

  it("h2 does NOT end in '?' (D-12 — afirmação não pergunta)", async () => {
    const { PAIN_COPY } = await import("@/content/pain");
    expect(
      /\?\s*$/.test(PAIN_COPY.h2),
      `D-12 violation: PAIN_COPY.h2 ends in '?'. Pain headline must be an affirmation, not a question.\nGot: ${PAIN_COPY.h2}`,
    ).toBe(false);
  });

  it("nenhuma string textual contém frases banidas anti-IA (COPY-02)", async () => {
    const { PAIN_COPY } = await import("@/content/pain");
    const cardText = PAIN_COPY.cards
      .flatMap((c) => [c.label, c.title, c.meta ?? "", ...c.rows.map((r) => r.content)])
      .join(" ");
    const combined = `${PAIN_COPY.h2} ${PAIN_COPY.sub} ${PAIN_COPY.statement} ${cardText}`;
    const match = combined.match(BANNED_PHRASES);
    expect(match === null, `Banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("zero menção a 'Dolce Home' em qualquer string da PAIN_COPY (D-27)", async () => {
    const { PAIN_COPY } = await import("@/content/pain");
    const cardText = PAIN_COPY.cards
      .flatMap((c) => [c.label, c.title, c.meta ?? "", ...c.rows.map((r) => r.content)])
      .join(" ");
    const combined = `${PAIN_COPY.h2} ${PAIN_COPY.sub} ${PAIN_COPY.statement} ${cardText}`;
    expect(/dolce home/i.test(combined), "PAIN_COPY mentions Dolce Home").toBe(false);
  });

  it("PAIN_COPY.cards tem exatamente 4 entradas", async () => {
    const { PAIN_COPY } = await import("@/content/pain");
    expect(PAIN_COPY.cards).toHaveLength(4);
  });

  it(
    "PAIN_COPY_VARIANTS expõe v1, v2 e v3 (cadência D-17)",
    async () => {
      const { PAIN_COPY_VARIANTS } = await import("@/content/pain");
      expect(Object.keys(PAIN_COPY_VARIANTS).sort()).toEqual(["v1", "v2", "v3"]);
      for (const key of ["v1", "v2", "v3"] as const) {
        const v = PAIN_COPY_VARIANTS[key];
        expect(typeof v.h2).toBe("string");
        expect(typeof v.sub).toBe("string");
        expect(typeof v.statement).toBe("string");
        expect(v.cards).toHaveLength(4);
      }
    },
  );
});
