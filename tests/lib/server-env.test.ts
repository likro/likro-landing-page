/**
 * Cobertura: SHEETS-OPT-01..04 — Google Sheets como entrega OPCIONAL.
 *
 * Três estados do gate Google + obrigatórias do Resend:
 *  - OFF      (0/3 vars Google) → getGoogleEnv() === null
 *  - ON       (3/3 vars Google) → getGoogleEnv() === objeto
 *  - PARCIAL  (1-2/3 vars)      → getGoogleEnv() lança erro claro
 *  - getServerEnv() valida só Resend e independe das vars Google.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// server-only já é mockado em tests/setup.ts; reforço local para deixar
// a dependência explícita neste arquivo de teste.
vi.mock("server-only", () => ({}));

import {
  getServerEnv,
  getGoogleEnv,
  __resetServerEnvForTests,
} from "@/lib/server-env";

const OG = { ...process.env };

beforeEach(() => {
  __resetServerEnvForTests();
  // limpa todas as 5 vars relevantes para isolamento total
  delete process.env.RESEND_API_KEY;
  delete process.env.LEAD_TO_EMAIL;
  delete process.env.GOOGLE_SA_CLIENT_EMAIL;
  delete process.env.GOOGLE_SA_PRIVATE_KEY;
  delete process.env.GOOGLE_SHEET_ID;
});

afterEach(() => {
  process.env = { ...OG };
});

describe("getServerEnv (vars obrigatórias — Resend)", () => {
  it("resolve sem throw quando RESEND_API_KEY + LEAD_TO_EMAIL presentes (Google off)", () => {
    process.env.RESEND_API_KEY = "re_fake_key_123";
    process.env.LEAD_TO_EMAIL = "ops@likro.com.br";

    expect(() => getServerEnv()).not.toThrow();
    expect(getServerEnv().RESEND_API_KEY).toBe("re_fake_key_123");
    expect(getServerEnv().LEAD_TO_EMAIL).toBe("ops@likro.com.br");
  });

  it("NÃO depende de var Google — resolve com Google 100% ausente", () => {
    process.env.RESEND_API_KEY = "re_fake_key_123";
    process.env.LEAD_TO_EMAIL = "ops@likro.com.br";
    // nenhuma var Google setada

    expect(() => getServerEnv()).not.toThrow();
    expect(getGoogleEnv()).toBeNull();
  });

  it("lança quando RESEND_API_KEY falta", () => {
    process.env.LEAD_TO_EMAIL = "ops@likro.com.br";

    expect(() => getServerEnv()).toThrow(/RESEND_API_KEY/);
  });

  it("lança quando LEAD_TO_EMAIL falta", () => {
    process.env.RESEND_API_KEY = "re_fake_key_123";

    expect(() => getServerEnv()).toThrow(/LEAD_TO_EMAIL/);
  });
});

describe("getGoogleEnv (vars opcionais — Sheets)", () => {
  it("estado OFF: 0/3 vars → retorna null", () => {
    process.env.RESEND_API_KEY = "re_fake_key_123";
    process.env.LEAD_TO_EMAIL = "ops@likro.com.br";

    expect(getGoogleEnv()).toBeNull();
  });

  it("estado ON: 3/3 vars → retorna objeto com clientEmail/privateKey/sheetId", () => {
    process.env.GOOGLE_SA_CLIENT_EMAIL = "sa@proj.iam.gserviceaccount.com";
    process.env.GOOGLE_SA_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----\\n";
    process.env.GOOGLE_SHEET_ID = "1AbCdEfGhIjKlMnOpQrStUv";

    expect(getGoogleEnv()).toEqual({
      clientEmail: "sa@proj.iam.gserviceaccount.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\\nFAKEKEY\\n-----END PRIVATE KEY-----\\n",
      sheetId: "1AbCdEfGhIjKlMnOpQrStUv",
    });
  });

  it("estado PARCIAL: só GOOGLE_SHEET_ID → lança citando as 2 faltantes", () => {
    process.env.GOOGLE_SHEET_ID = "1AbCdEfGhIjKlMnOpQrStUv";

    expect(() => getGoogleEnv()).toThrow(/GOOGLE_SA_CLIENT_EMAIL/);
    expect(() => getGoogleEnv()).toThrow(/GOOGLE_SA_PRIVATE_KEY/);
  });

  it("estado PARCIAL: 2/3 (falta sheetId) → lança citando a faltante", () => {
    process.env.GOOGLE_SA_CLIENT_EMAIL = "sa@proj.iam.gserviceaccount.com";
    process.env.GOOGLE_SA_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nX\\n";

    expect(() => getGoogleEnv()).toThrow(/GOOGLE_SHEET_ID/);
  });

  it("caso parcial NÃO cacheia — corrigir env passa a resolver", () => {
    process.env.GOOGLE_SHEET_ID = "1AbCdEfGhIjKlMnOpQrStUv";
    expect(() => getGoogleEnv()).toThrow();

    // operador completa a config sem reset de cache
    process.env.GOOGLE_SA_CLIENT_EMAIL = "sa@proj.iam.gserviceaccount.com";
    process.env.GOOGLE_SA_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nX\\n";

    expect(getGoogleEnv()).toEqual({
      clientEmail: "sa@proj.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\\nX\\n",
      sheetId: "1AbCdEfGhIjKlMnOpQrStUv",
    });
  });

  it("vars só com espaços em branco contam como ausentes (trim)", () => {
    process.env.GOOGLE_SA_CLIENT_EMAIL = "   ";
    process.env.GOOGLE_SA_PRIVATE_KEY = "  ";
    process.env.GOOGLE_SHEET_ID = "\t";

    expect(getGoogleEnv()).toBeNull();
  });
});
