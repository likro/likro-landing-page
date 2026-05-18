import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-04 — HowItWorks copy contracts.
 *
 * Gates específicos:
 * - Shape D-21/D-22: header.{h2,sub} + steps[4] com {number, headline, description, mockupKind}.
 * - HOW_COPY_VARIANTS exposes v1, v2, v3 (cadência D-17).
 * - step.number values são exatamente ["01","02","03","04"] na ordem.
 * - step.mockupKind values são exatamente ["notification","routing","conversation","calendar-slot"] na ordem.
 * - Cada step.headline length entre 5 e 60 chars.
 * - Cada step.description length entre 30 e 200 chars.
 * - COPY-03: corpus contém clínica/paciente/atendimento/agendamento/lead.
 * - COPY-02: anti-IA banned phrases regex green.
 * - Zero "jornada do cliente" / "transforme sua".
 * - D-27: zero menção Dolce Home.
 *
 * Estratégia Wave 0 RED: dynamic import via variable string. Vite static
 * analysis ignora o caminho até o file landed em Task 2; describe.skipIf
 * cobre o intervalo entre o commit RED e o commit GREEN. Tipos casts via
 * `any` no Wave 0 — strictness recuperada em Task 2 quando o módulo existe.
 */

const HOW_COPY_FILE = path.resolve(__dirname, "../../src/content/how-it-works.ts");
const howCopyExists = fs.existsSync(HOW_COPY_FILE);

// Hidden behind a variable string so Vite doesn't try to resolve at parse time.
const HOW_MODULE_PATH = "@/content/how-it-works";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const importHow = (): Promise<any> => import(/* @vite-ignore */ HOW_MODULE_PATH);

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

const VERTICAL_REGEX = /cl[ií]nicas?|paciente|atendimento|agendamento|lead/i;

const FORBIDDEN_PHRASES = /(jornada do cliente|transforme sua)/i;

// Locked sequences for D-21/D-22.
const EXPECTED_NUMBERS = ["01", "02", "03", "04"] as const;
const EXPECTED_MOCKUP_KINDS = [
  "notification",
  "routing",
  "conversation",
  "calendar-slot",
] as const;

describe.skipIf(!howCopyExists)("HOW_COPY — Phase 4 / Plan 04-04 contracts", () => {
  it("HOW_COPY shape — header {h2,sub} + steps tuple [4] com {number, headline, description, mockupKind}", async () => {
    const { HOW_COPY } = await importHow();

    expect(typeof HOW_COPY.header.h2).toBe("string");
    expect(HOW_COPY.header.h2.length).toBeGreaterThan(0);
    expect(typeof HOW_COPY.header.sub).toBe("string");
    expect(HOW_COPY.header.sub.length).toBeGreaterThan(0);

    expect(Array.isArray(HOW_COPY.steps)).toBe(true);
    expect(HOW_COPY.steps).toHaveLength(4);

    for (const step of HOW_COPY.steps) {
      expect(typeof step.number).toBe("string");
      expect(typeof step.headline).toBe("string");
      expect(typeof step.description).toBe("string");
      expect(typeof step.mockupKind).toBe("string");
    }
  });

  it("HOW_COPY_VARIANTS expõe v1, v2 e v3 (cadência D-17)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    expect(Object.keys(HOW_COPY_VARIANTS).sort()).toEqual(["v1", "v2", "v3"]);
    for (const key of ["v1", "v2", "v3"] as const) {
      const v = HOW_COPY_VARIANTS[key];
      expect(typeof v.header.h2).toBe("string");
      expect(typeof v.header.sub).toBe("string");
      expect(Array.isArray(v.steps)).toBe(true);
      expect(v.steps).toHaveLength(4);
    }
  });

  it("steps[*].number são exatamente ['01','02','03','04'] em ordem (D-22 sequence locked)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    for (const [key, v] of Object.entries(HOW_COPY_VARIANTS) as Array<
      [string, { steps: Array<{ number: string }> }]
    >) {
      const numbers = v.steps.map((s) => s.number);
      expect(
        numbers,
        `T-4-12 violation: ${key}.steps numbers must be exactly ["01","02","03","04"]. Got: ${JSON.stringify(numbers)}`,
      ).toEqual([...EXPECTED_NUMBERS]);
    }
  });

  it("steps[*].mockupKind são exatamente ['notification','routing','conversation','calendar-slot'] em ordem (D-22 sequence locked)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    for (const [key, v] of Object.entries(HOW_COPY_VARIANTS) as Array<
      [string, { steps: Array<{ mockupKind: string }> }]
    >) {
      const kinds = v.steps.map((s) => s.mockupKind);
      expect(
        kinds,
        `T-4-12 violation: ${key}.steps mockupKinds must be exactly ["notification","routing","conversation","calendar-slot"]. Got: ${JSON.stringify(kinds)}`,
      ).toEqual([...EXPECTED_MOCKUP_KINDS]);
    }
  });

  it("cada step.headline.length em [5, 60] (não micro, não parágrafo)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    for (const [key, v] of Object.entries(HOW_COPY_VARIANTS) as Array<
      [string, { steps: Array<{ headline: string }> }]
    >) {
      v.steps.forEach((step, i) => {
        expect(
          step.headline.length >= 5 && step.headline.length <= 60,
          `${key}.steps[${i}].headline length ${step.headline.length} out of [5,60]. Got: "${step.headline}"`,
        ).toBe(true);
      });
    }
  });

  it("cada step.description.length em [30, 200] (não micro, não parágrafo)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    for (const [key, v] of Object.entries(HOW_COPY_VARIANTS) as Array<
      [string, { steps: Array<{ description: string }> }]
    >) {
      v.steps.forEach((step, i) => {
        expect(
          step.description.length >= 30 && step.description.length <= 200,
          `${key}.steps[${i}].description length ${step.description.length} out of [30,200]. Got: "${step.description}"`,
        ).toBe(true);
      });
    }
  });

  it("corpus contém vertical clínica/paciente/atendimento/agendamento/lead (COPY-03)", async () => {
    const { HOW_COPY } = await importHow();
    const corpus = [
      HOW_COPY.header.h2,
      HOW_COPY.header.sub,
      ...HOW_COPY.steps.flatMap(
        (s: { headline: string; description: string }) => [s.headline, s.description],
      ),
    ].join(" ");
    expect(
      VERTICAL_REGEX.test(corpus),
      `COPY-03 violation: corpus must mention clínica/paciente/atendimento/agendamento/lead.\nGot: ${corpus}`,
    ).toBe(true);
  });

  it("nenhuma string textual contém frases banidas anti-IA (COPY-02)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    const corpus = Object.values(HOW_COPY_VARIANTS)
      .flatMap((v) => {
        const variant = v as {
          header: { h2: string; sub: string };
          steps: Array<{ headline: string; description: string }>;
        };
        return [
          variant.header.h2,
          variant.header.sub,
          ...variant.steps.flatMap((s) => [s.headline, s.description]),
        ];
      })
      .join(" ");
    const match = corpus.match(BANNED_PHRASES);
    expect(match === null, `COPY-02 banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("zero menção a 'jornada do cliente' ou 'transforme sua' (HowItWorks tom calmo D-23)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    const corpus = Object.values(HOW_COPY_VARIANTS)
      .flatMap((v) => {
        const variant = v as {
          header: { h2: string; sub: string };
          steps: Array<{ headline: string; description: string }>;
        };
        return [
          variant.header.h2,
          variant.header.sub,
          ...variant.steps.flatMap((s) => [s.headline, s.description]),
        ];
      })
      .join(" ");
    const match = corpus.match(FORBIDDEN_PHRASES);
    expect(
      match === null,
      `Forbidden phrase: ${match?.[0] ?? ""} — HowItWorks tom explicativo simplificador, não copywriting de pitch.`,
    ).toBe(true);
  });

  it("zero menção a 'Dolce Home' em qualquer string do HOW_COPY (D-27)", async () => {
    const { HOW_COPY_VARIANTS } = await importHow();
    const corpus = JSON.stringify(HOW_COPY_VARIANTS);
    expect(/dolce home/i.test(corpus), "HOW_COPY mentions Dolce Home").toBe(false);
  });
});
