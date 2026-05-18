import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 4 / Plan 04-02 — Bridge copy contracts.
 *
 * Bridge é statement editorial. Não tem h2/sub/cards. Forma: `statements: string[]`.
 * Gate extra D-14: além das banned phrases padrão, rejeita também "transforme sua",
 * "leve a outro patamar", e variações de promessa milagrosa.
 */

const BRIDGE_COPY_FILE = path.resolve(__dirname, "../../src/content/bridge.ts");
const bridgeCopyExists = fs.existsSync(BRIDGE_COPY_FILE);

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

// D-14 extra: more aggressive promise-milagre detector.
// Keep these literals visible to grep gates (Plan acceptance scans this file).
// transforme sua | potencialize | próximo nível | solução inovadora | revolucione | empodere
const D14_EXTRA =
  /(potencialize|transforme sua|próximo nível|solução inovadora|revolucione|empodere|leve.{1,30}outro patamar)/i;

describe.skipIf(!bridgeCopyExists)("BRIDGE_COPY — Phase 4 / Plan 04-02 contracts", () => {
  it("BRIDGE_COPY shape — statements: ReadonlyArray<string> length 1..3", async () => {
    const { BRIDGE_COPY } = await import("@/content/bridge");
    expect(Array.isArray(BRIDGE_COPY.statements)).toBe(true);
    expect(BRIDGE_COPY.statements.length).toBeGreaterThanOrEqual(1);
    expect(BRIDGE_COPY.statements.length).toBeLessThanOrEqual(3);
    for (const s of BRIDGE_COPY.statements) {
      expect(typeof s).toBe("string");
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it("BRIDGE_COPY_VARIANTS expõe v1, v2 e v3 (cadência D-17)", async () => {
    const { BRIDGE_COPY_VARIANTS } = await import("@/content/bridge");
    expect(Object.keys(BRIDGE_COPY_VARIANTS).sort()).toEqual(["v1", "v2", "v3"]);
    for (const key of ["v1", "v2", "v3"] as const) {
      const v = BRIDGE_COPY_VARIANTS[key];
      expect(Array.isArray(v.statements)).toBe(true);
      expect(v.statements.length).toBeGreaterThanOrEqual(1);
      expect(v.statements.length).toBeLessThanOrEqual(3);
    }
  });

  it("nenhuma string textual contém frases banidas anti-IA (COPY-02 + D-14 extra)", async () => {
    const { BRIDGE_COPY_VARIANTS } = await import("@/content/bridge");
    const all = Object.values(BRIDGE_COPY_VARIANTS)
      .flatMap((v) => v.statements)
      .join(" ");
    const base = all.match(BANNED_PHRASES);
    expect(base === null, `COPY-02 banned phrase: ${base?.[0] ?? ""}`).toBe(true);
    const extra = all.match(D14_EXTRA);
    expect(
      extra === null,
      `D-14 extra banned phrase: ${extra?.[0] ?? ""}`,
    ).toBe(true);
  });

  it("zero menção a 'Dolce Home' em qualquer statement (D-27)", async () => {
    const { BRIDGE_COPY_VARIANTS } = await import("@/content/bridge");
    const all = Object.values(BRIDGE_COPY_VARIANTS)
      .flatMap((v) => v.statements)
      .join(" ");
    expect(/dolce home/i.test(all), "BRIDGE_COPY mentions Dolce Home").toBe(false);
  });

  it("nenhum statement menciona literal 'WhatsApp' (Bridge é abstração, não canal)", async () => {
    const { BRIDGE_COPY_VARIANTS } = await import("@/content/bridge");
    const all = Object.values(BRIDGE_COPY_VARIANTS)
      .flatMap((v) => v.statements)
      .join(" ");
    expect(
      /whatsapp/i.test(all),
      "BRIDGE statements MUST NOT mention 'WhatsApp' inline — Bridge é abstração operacional",
    ).toBe(false);
  });

  it("cada statement tem comprimento entre 20 e 200 caracteres (frase forte, não fragmento, não parágrafo)", async () => {
    const { BRIDGE_COPY_VARIANTS } = await import("@/content/bridge");
    for (const [key, v] of Object.entries(BRIDGE_COPY_VARIANTS)) {
      v.statements.forEach((s, idx) => {
        expect(
          s.length >= 20 && s.length <= 200,
          `${key}.statements[${idx}] length=${s.length} out of [20,200]. Got: "${s}"`,
        ).toBe(true);
      });
    }
  });
});
