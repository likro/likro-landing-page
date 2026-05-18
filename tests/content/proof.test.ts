import { describe, expect, it } from "vitest";
import { PROOF_COPY, PROOF_COPY_VARIANTS, type ProofCopy } from "@/content/proof";

/**
 * Phase 4 / Plan 04-05 — Proof copy contracts.
 *
 * Gates EXTRA (D-27 + STATE.md 2026-05-18):
 * - Zero Dolce Home (autorização explicitamente negada — STATE.md).
 * - Zero stat numbers (regex /\+\d+|\d+%|\d{2,}\s*(clínicas|leads|...)/i — COPY-06).
 * - Zero testimonials/quotes com atribuição (regex quoted text + em-dash + name).
 * - Zero "trusted by", "em parceria", "líder de mercado", "referência (do/de)".
 * - Categorias verticais TRAVADAS: ["Estética", "Dermatologia", "Harmonização Facial", "Odontologia", "Bem-estar"] (D-26).
 */

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

const LOCKED_CATEGORIES = [
  "Estética",
  "Dermatologia",
  "Harmonização Facial",
  "Odontologia",
  "Bem-estar",
] as const;

function joinCorpus(): string {
  const variants = Object.values(PROOF_COPY_VARIANTS) as ProofCopy[];
  return variants
    .map((v) => `${v.eyebrow} ${v.headline} ${v.categories.join(" ")}`)
    .join(" \n ");
}

describe("PROOF_COPY — Phase 4 contracts", () => {
  it("Test 1 — shape: {eyebrow, headline, categories: tuple 5}", () => {
    expect(typeof PROOF_COPY.eyebrow).toBe("string");
    expect(PROOF_COPY.eyebrow.length).toBeGreaterThan(0);
    expect(typeof PROOF_COPY.headline).toBe("string");
    expect(PROOF_COPY.headline.length).toBeGreaterThan(0);
    expect(Array.isArray(PROOF_COPY.categories)).toBe(true);
    expect(PROOF_COPY.categories).toHaveLength(5);
    for (const cat of PROOF_COPY.categories) {
      expect(typeof cat).toBe("string");
      expect(cat.length).toBeGreaterThan(0);
    }
  });

  it("Test 2 — PROOF_COPY_VARIANTS has v1, v2, v3", () => {
    expect(PROOF_COPY_VARIANTS).toHaveProperty("v1");
    expect(PROOF_COPY_VARIANTS).toHaveProperty("v2");
    expect(PROOF_COPY_VARIANTS).toHaveProperty("v3");
    for (const key of ["v1", "v2", "v3"] as const) {
      const v = PROOF_COPY_VARIANTS[key];
      expect(typeof v.eyebrow).toBe("string");
      expect(typeof v.headline).toBe("string");
      expect(v.categories).toHaveLength(5);
    }
  });

  it("Test 3 — ALL THREE variants have categories EXACTLY ['Estética','Dermatologia','Harmonização Facial','Odontologia','Bem-estar'] (D-26 locked)", () => {
    for (const key of ["v1", "v2", "v3"] as const) {
      const cats = PROOF_COPY_VARIANTS[key].categories;
      expect(cats, `variant ${key} categories not locked`).toEqual(LOCKED_CATEGORIES);
    }
  });

  it("Test 4 — anti-IA banned phrases regex green em todas variantes (COPY-02)", () => {
    const corpus = joinCorpus();
    const match = corpus.match(BANNED_PHRASES);
    expect(match === null, `Banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("Test 5 — zero `dolce home` em qualquer variante (STATE.md 2026-05-18)", () => {
    const corpus = joinCorpus();
    expect(/dolce\s*home/i.test(corpus), "Dolce Home autorização negada").toBe(false);
  });

  it("Test 6 — zero stat numbers — COPY-06 / D-27", () => {
    const corpus = joinCorpus();
    const STAT_REGEX =
      /\+\d+|\d+%|\d{2,}\s*(clínicas|leads|mensagens|atendimentos|cl[ií]nicas)/i;
    const m = corpus.match(STAT_REGEX);
    expect(m === null, `Stat number found: ${m?.[0] ?? ""}`).toBe(true);
  });

  it("Test 7 — zero buzzwords anti-social-proof (D-27)", () => {
    const corpus = joinCorpus();
    const BAD =
      /trusted by|as seen in|em parceria|l[ií]der de mercado|refer[êe]ncia (do|de)|primeir[oa] no|melhor (do|de)/i;
    const m = corpus.match(BAD);
    expect(m === null, `Buzzword found: ${m?.[0] ?? ""}`).toBe(true);
  });

  it("Test 8 — zero testimonial pattern (quoted text + em-dash + attribution)", () => {
    const corpus = joinCorpus();
    const TESTIMONIAL = /[“”".]+?[—–-]\s*\S+/;
    const stricter = /[“”"][^"”“]{10,}[”“"][\s\S]{0,5}[—–-]\s*[A-ZÀ-Ú][a-zà-ú]+/;
    const m = corpus.match(stricter);
    expect(m === null, `Testimonial pattern found: ${m?.[0] ?? ""}`).toBe(true);
  });

  it("Test 9 — each variant eyebrow is uppercase format length 6-20", () => {
    for (const key of ["v1", "v2", "v3"] as const) {
      const eyebrow = PROOF_COPY_VARIANTS[key].eyebrow;
      expect(eyebrow.length, `${key} eyebrow length`).toBeGreaterThanOrEqual(6);
      expect(eyebrow.length, `${key} eyebrow length`).toBeLessThanOrEqual(20);
      expect(/^[A-ZÀ-Ú\s]+$/.test(eyebrow), `${key} eyebrow not uppercase: ${eyebrow}`).toBe(
        true,
      );
    }
  });

  it("Test 10 — each variant headline length in [40, 150]", () => {
    for (const key of ["v1", "v2", "v3"] as const) {
      const h = PROOF_COPY_VARIANTS[key].headline;
      expect(h.length, `${key} headline length: ${h.length}`).toBeGreaterThanOrEqual(40);
      expect(h.length, `${key} headline length: ${h.length}`).toBeLessThanOrEqual(150);
    }
  });

  // Reference: lista travada D-26 — força contributors a manterem o array literal
  it("reference — D-26 categorias list literal preserved exactly: Estética / Dermatologia / Harmonização Facial / Odontologia / Bem-estar", () => {
    expect(LOCKED_CATEGORIES).toEqual([
      "Estética",
      "Dermatologia",
      "Harmonização Facial",
      "Odontologia",
      "Bem-estar",
    ]);
  });
});
