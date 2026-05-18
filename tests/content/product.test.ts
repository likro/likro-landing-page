import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-03 — Product copy contracts.
 *
 * Gates específicos:
 * - D-16 reinterpretation: zero "Relatórios", zero "CRM" como title de pillar
 *   (header.h2 / feature.title / secondaries[*].title). Permitido em description (verbo "centraliza CRM").
 * - D-20.1: zero cyberpunk vocabulary (inteligência artificial, neural, máquina
 *   que aprende, chatbot, agente de IA cyberpunk); iaLine no mockup é a única
 *   menção implícita de IA, deve conter "automaticamente" OU "automático" OU
 *   "IA" OU "sugestão".
 * - D-17: feature.title contém "multicanal" OU "atendimento" — feature hero
 *   é "Atendimento multicanal" / "Caixa de entrada multicanal".
 * - COPY-03: vertical clínica/paciente/atendimento aparece em h2 OU sub OU
 *   feature.description OU pelo menos 1 secundária.
 * - 3 secundárias conceituais: distribuição/roteamento / follow-up/retorno / agenda.
 */

const PRODUCT_COPY_FILE = path.resolve(__dirname, "../../src/content/product.ts");
const productCopyExists = fs.existsSync(PRODUCT_COPY_FILE);

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

const VERTICAL_REGEX = /cl[ií]nicas?|paciente|atendimento|agendamento/i;

// D-20.1 cyberpunk gate: bane vocabulary "AI marketing" hype no Product copy.
// inteligência artificial | agente de IA | chatbot | neural | máquina que aprende
const CYBERPUNK_REGEX =
  /(intelig[êe]ncia artificial|agente de ia|chatbot|neural|m[áa]quina que aprende)/i;

describe.skipIf(!productCopyExists)("PRODUCT_COPY — Phase 4 / Plan 04-03 contracts", () => {
  it("PRODUCT_COPY shape — header {h2,sub} + feature {eyebrow,title,description,mockup:{inboxRows,iaLine}} + secondaries[3]", async () => {
    const { PRODUCT_COPY } = await import("@/content/product");

    expect(typeof PRODUCT_COPY.header.h2).toBe("string");
    expect(PRODUCT_COPY.header.h2.length).toBeGreaterThan(0);
    expect(typeof PRODUCT_COPY.header.sub).toBe("string");
    expect(PRODUCT_COPY.header.sub.length).toBeGreaterThan(0);

    expect(typeof PRODUCT_COPY.feature.eyebrow).toBe("string");
    expect(typeof PRODUCT_COPY.feature.title).toBe("string");
    expect(typeof PRODUCT_COPY.feature.description).toBe("string");

    expect(Array.isArray(PRODUCT_COPY.feature.mockup.inboxRows)).toBe(true);
    expect(PRODUCT_COPY.feature.mockup.inboxRows.length).toBeGreaterThan(0);
    expect(typeof PRODUCT_COPY.feature.mockup.iaLine).toBe("string");

    expect(Array.isArray(PRODUCT_COPY.secondaries)).toBe(true);
    expect(PRODUCT_COPY.secondaries).toHaveLength(3);
    for (const s of PRODUCT_COPY.secondaries) {
      expect(typeof s.eyebrow).toBe("string");
      expect(typeof s.title).toBe("string");
      expect(typeof s.description).toBe("string");
      expect(typeof s.mockupKind).toBe("string");
    }
  });

  it("PRODUCT_COPY_VARIANTS expõe v1, v2 e v3 (cadência D-17)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    expect(Object.keys(PRODUCT_COPY_VARIANTS).sort()).toEqual(["v1", "v2", "v3"]);
    for (const key of ["v1", "v2", "v3"] as const) {
      const v = PRODUCT_COPY_VARIANTS[key];
      expect(typeof v.header.h2).toBe("string");
      expect(typeof v.header.sub).toBe("string");
      expect(typeof v.feature.title).toBe("string");
      expect(Array.isArray(v.secondaries)).toBe(true);
      expect(v.secondaries).toHaveLength(3);
    }
  });

  it(
    "h2/sub/feature.description OR pelo menos 1 secondary.description contém vertical (clínica|paciente|atendimento|agendamento) — COPY-03",
    async () => {
      const { PRODUCT_COPY } = await import("@/content/product");
      const corpus = [
        PRODUCT_COPY.header.h2,
        PRODUCT_COPY.header.sub,
        PRODUCT_COPY.feature.description,
        ...PRODUCT_COPY.secondaries.map((s) => s.description),
      ].join(" ");
      expect(
        VERTICAL_REGEX.test(corpus),
        `COPY-03 violation: h2/sub/feature.description OR pelo menos 1 secondary.description must mention clínica/paciente/atendimento/agendamento.\nGot corpus: ${corpus}`,
      ).toBe(true);
    },
  );

  it("nenhuma string textual contém frases banidas anti-IA (COPY-02)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    const corpus = Object.values(PRODUCT_COPY_VARIANTS)
      .flatMap((v) => [
        v.header.h2,
        v.header.sub,
        v.feature.eyebrow,
        v.feature.title,
        v.feature.description,
        v.feature.mockup.iaLine,
        ...v.secondaries.flatMap((s) => [s.eyebrow, s.title, s.description]),
      ])
      .join(" ");
    const match = corpus.match(BANNED_PHRASES);
    expect(match === null, `COPY-02 banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("zero menção a 'Relatórios' em qualquer string do PRODUCT_COPY (D-16 — Relatórios out v1)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    const corpus = Object.values(PRODUCT_COPY_VARIANTS)
      .flatMap((v) => [
        v.header.h2,
        v.header.sub,
        v.feature.eyebrow,
        v.feature.title,
        v.feature.description,
        v.feature.mockup.iaLine,
        ...v.secondaries.flatMap((s) => [s.eyebrow, s.title, s.description]),
      ])
      .join(" ");
    expect(
      /relat[óo]rios?/i.test(corpus),
      "D-16 violation: PRODUCT_COPY mentions 'Relatórios' — Relatórios está fora do escopo v1.",
    ).toBe(false);
  });

  it("zero 'CRM' como title de pillar (header.h2 / feature.title / secondaries[*].title) — D-16", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    const titles = Object.values(PRODUCT_COPY_VARIANTS).flatMap((v) => [
      v.header.h2,
      v.feature.title,
      ...v.secondaries.map((s) => s.title),
    ]);
    for (const t of titles) {
      expect(
        /\bCRM\b/.test(t),
        `D-16 violation: title "${t}" contém 'CRM' como pillar standalone. CRM fica implícito nas secundárias via Distribuição + Follow-up.`,
      ).toBe(false);
    }
  });

  it("zero cyberpunk vocabulary (inteligência artificial / agente de ia / chatbot / neural / máquina que aprende) — D-20.1", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    const corpus = Object.values(PRODUCT_COPY_VARIANTS)
      .flatMap((v) => [
        v.header.h2,
        v.header.sub,
        v.feature.eyebrow,
        v.feature.title,
        v.feature.description,
        v.feature.mockup.iaLine,
        ...v.secondaries.flatMap((s) => [s.eyebrow, s.title, s.description]),
      ])
      .join(" ");
    const match = corpus.match(CYBERPUNK_REGEX);
    expect(
      match === null,
      `D-20.1 cyberpunk violation: ${match?.[0] ?? ""} — Product mantém tom Linear/Stripe/Vercel/Arc/Apple, não Anthropic/OpenAI marketing.`,
    ).toBe(true);
  });

  it("feature.mockup.iaLine existe e contém 'automaticamente' OR 'automático' OR 'IA' OR 'sugestão' (D-20.1 micro-line)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    for (const [key, v] of Object.entries(PRODUCT_COPY_VARIANTS)) {
      const ia = v.feature.mockup.iaLine;
      expect(typeof ia).toBe("string");
      expect(ia.length).toBeGreaterThan(0);
      expect(
        /(automaticamente|autom[áa]tico|\bIA\b|sugest[ãa]o)/i.test(ia),
        `D-20.1 violation: ${key}.feature.mockup.iaLine deve conter 'automaticamente'/'automático'/'IA'/'sugestão'. Got: "${ia}"`,
      ).toBe(true);
    }
  });

  it("zero menção a 'Dolce Home' em qualquer string do PRODUCT_COPY (D-27)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    const corpus = JSON.stringify(PRODUCT_COPY_VARIANTS);
    expect(/dolce home/i.test(corpus), "PRODUCT_COPY mentions Dolce Home").toBe(false);
  });

  it("feature.title contém 'multicanal' OU 'atendimento' (D-17 — feature hero é Atendimento multicanal)", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    for (const [key, v] of Object.entries(PRODUCT_COPY_VARIANTS)) {
      expect(
        /multicanal|atendimento/i.test(v.feature.title),
        `D-17 violation: ${key}.feature.title deve conter 'multicanal' OR 'atendimento'. Got: "${v.feature.title}"`,
      ).toBe(true);
    }
  });

  it("secondaries[0].title menciona conceito de distribuição/roteamento/atribuição", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    for (const [key, v] of Object.entries(PRODUCT_COPY_VARIANTS)) {
      const title = v.secondaries[0].title;
      expect(
        /distribui|rote|atribu|atendente certo/i.test(title),
        `${key}.secondaries[0].title deve mencionar distribuição/roteamento/atribuição. Got: "${title}"`,
      ).toBe(true);
    }
  });

  it("secondaries[1].title menciona conceito de follow-up/retorno/voltar/lembrete", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    for (const [key, v] of Object.entries(PRODUCT_COPY_VARIANTS)) {
      const title = v.secondaries[1].title;
      expect(
        /follow|retorn|volt|relembr|esquec/i.test(title),
        `${key}.secondaries[1].title deve mencionar follow-up/retorno/voltar/esquecer. Got: "${title}"`,
      ).toBe(true);
    }
  });

  it("secondaries[2].title menciona conceito de agenda/agendamento/horário/slot", async () => {
    const { PRODUCT_COPY_VARIANTS } = await import("@/content/product");
    for (const [key, v] of Object.entries(PRODUCT_COPY_VARIANTS)) {
      const title = v.secondaries[2].title;
      expect(
        /agenda|agendamento|hor[áa]rio|slot/i.test(title),
        `${key}.secondaries[2].title deve mencionar agenda/agendamento/horário/slot. Got: "${title}"`,
      ).toBe(true);
    }
  });
});
