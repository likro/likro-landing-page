import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Phase 9 / Plan 09-01 — Funil copy contracts (FUNIL-COPY).
 *
 * Gates específicos:
 * - Shape: eyebrow/headline/seal non-empty; protagonist string; steps[4] com
 *   {head, channel, moment}; closing com {lead, accent, tail}.
 * - Valores TRAVADOS (UI-SPEC §Copywriting Contract): eyebrow, headline, seal,
 *   os 4 step heads em ordem, os 4 step moments verbatim, closing.accent, e a
 *   reconstrução closing.lead+accent+tail.
 * - NO "Messenger"/"Facebook" em qualquer valor de FUNNEL_COPY (09-CONTEXT D-6).
 * - COPY-02: anti-IA banned phrases regex green.
 * - COPY-03: corpus contém termos verticais (paciente/consulta/horário/atend).
 *
 * funnel.ts é authored no Task 3 (mesma plan), então este teste é GREEN no
 * primeiro run. skipIf cobre o intervalo se o módulo ainda não existir.
 */

const FUNNEL_FILE = path.resolve(__dirname, "../../src/content/funnel.ts");
const funnelExists = fs.existsSync(FUNNEL_FILE);

// Hidden behind a variable string so Vite doesn't try to resolve at parse time.
const MODULE_PATH = "@/content/funnel";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const importFn = (): Promise<any> => import(/* @vite-ignore */ MODULE_PATH);

const BANNED_PHRASES =
  /(desbloqueie|desbloque|potencialize|potencia|transforme sua|próximo nível|proximo nivel|solução inovadora|solucao inovadora|jornada do cliente|do início ao fim|do inicio ao fim|feito para você|feito para voce|leve seu? .+ a outro patamar|revolucione|empodere)/i;

const VERTICAL_REGEX = /paciente|consulta|hor[áa]rio|atend/i;

const EXPECTED_HEADS = [
  "Chegou agora",
  "Em atendimento",
  "Escolhendo horário",
  "Consulta marcada",
] as const;

const EXPECTED_MOMENTS = [
  '"Oi, queria saber sobre os horários de vocês 🙂"',
  "Júlia respondeu e já está cuidando da Marina.",
  "Marina escolheu quinta às 14h entre os horários livres.",
  "Lembrete enviado. Marina confirmou a presença.",
] as const;

describe.skipIf(!funnelExists)("FUNNEL_COPY — Phase 9 / Plan 09-01 contracts", () => {
  it("FUNNEL_COPY shape — eyebrow/headline/seal/protagonist + steps[4] + closing", async () => {
    const { FUNNEL_COPY } = await importFn();

    expect(typeof FUNNEL_COPY.eyebrow).toBe("string");
    expect(FUNNEL_COPY.eyebrow.length).toBeGreaterThan(0);
    expect(typeof FUNNEL_COPY.headline).toBe("string");
    expect(FUNNEL_COPY.headline.length).toBeGreaterThan(0);
    expect(typeof FUNNEL_COPY.seal).toBe("string");
    expect(FUNNEL_COPY.seal.length).toBeGreaterThan(0);
    expect(typeof FUNNEL_COPY.protagonist).toBe("string");
    expect(FUNNEL_COPY.protagonist.length).toBeGreaterThan(0);

    expect(Array.isArray(FUNNEL_COPY.steps)).toBe(true);
    expect(FUNNEL_COPY.steps).toHaveLength(4);
    for (const step of FUNNEL_COPY.steps) {
      expect(typeof step.head).toBe("string");
      expect(typeof step.channel).toBe("string");
      expect(typeof step.moment).toBe("string");
    }

    expect(typeof FUNNEL_COPY.closing.lead).toBe("string");
    expect(typeof FUNNEL_COPY.closing.accent).toBe("string");
    expect(typeof FUNNEL_COPY.closing.tail).toBe("string");
  });

  it("valores travados — eyebrow / headline / seal", async () => {
    const { FUNNEL_COPY } = await importFn();
    expect(FUNNEL_COPY.eyebrow).toBe("O caminho do paciente");
    expect(FUNNEL_COPY.headline).toBe("Você vê cada paciente, do primeiro oi até a consulta.");
    expect(FUNNEL_COPY.seal).toBe("Consulta confirmada · quinta, 14h");
  });

  it("step heads em ordem travada (Chegou agora → … → Consulta marcada)", async () => {
    const { FUNNEL_COPY } = await importFn();
    const heads = FUNNEL_COPY.steps.map((s: { head: string }) => s.head);
    expect(heads).toEqual([...EXPECTED_HEADS]);
  });

  it("step moments verbatim em ordem (UI-SPEC §Copywriting Contract LOCKED)", async () => {
    const { FUNNEL_COPY } = await importFn();
    const moments = FUNNEL_COPY.steps.map((s: { moment: string }) => s.moment);
    expect(moments).toEqual([...EXPECTED_MOMENTS]);
  });

  it("closing.accent travado + reconstrução lead+accent+tail", async () => {
    const { FUNNEL_COPY } = await importFn();
    expect(FUNNEL_COPY.closing.accent).toBe("WhatsApp, Instagram, agenda, funil e IA");
    expect(FUNNEL_COPY.closing.lead + FUNNEL_COPY.closing.accent + FUNNEL_COPY.closing.tail).toBe(
      "WhatsApp, Instagram, agenda, funil e IA trabalhando juntos pra transformar conversa em consulta.",
    );
  });

  it("zero menção a Messenger/Facebook em qualquer valor (09-CONTEXT D-6)", async () => {
    const { FUNNEL_COPY } = await importFn();
    expect(/messenger|facebook/i.test(JSON.stringify(FUNNEL_COPY))).toBe(false);
  });

  it("nenhuma string contém frases banidas anti-IA (COPY-02)", async () => {
    const { FUNNEL_COPY } = await importFn();
    const corpus = [
      FUNNEL_COPY.eyebrow,
      FUNNEL_COPY.headline,
      FUNNEL_COPY.seal,
      FUNNEL_COPY.protagonist,
      ...FUNNEL_COPY.steps.flatMap((s: { head: string; channel: string; moment: string }) => [
        s.head,
        s.channel,
        s.moment,
      ]),
      FUNNEL_COPY.closing.lead,
      FUNNEL_COPY.closing.accent,
      FUNNEL_COPY.closing.tail,
    ].join(" ");
    const match = corpus.match(BANNED_PHRASES);
    expect(match === null, `COPY-02 banned phrase: ${match?.[0] ?? ""}`).toBe(true);
  });

  it("corpus contém vertical paciente/consulta/horário/atend (COPY-03)", async () => {
    const { FUNNEL_COPY } = await importFn();
    const corpus = [
      FUNNEL_COPY.eyebrow,
      FUNNEL_COPY.headline,
      FUNNEL_COPY.seal,
      ...FUNNEL_COPY.steps.flatMap((s: { head: string; channel: string; moment: string }) => [
        s.head,
        s.channel,
        s.moment,
      ]),
      FUNNEL_COPY.closing.accent,
      FUNNEL_COPY.closing.tail,
    ].join(" ");
    expect(
      VERTICAL_REGEX.test(corpus),
      `COPY-03 violation: corpus must mention paciente/consulta/horário/atend.\nGot: ${corpus}`,
    ).toBe(true);
  });
});
