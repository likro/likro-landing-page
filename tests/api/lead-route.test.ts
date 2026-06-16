/**
 * Cobertura: CTA-10 (edge route + dual-write), CTA-11 (success path),
 * CTA-12 (dedup), threat T-05-06 (honeypot fake-success).
 * Honeypot field name = `website` (RESEARCH Pitfall 8).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock server-env BEFORE importing the route (Plan 03 createz it).
vi.mock("@/lib/server-env", () => ({
  serverEnv: {
    RESEND_API_KEY: "re_test",
    LEAD_TO_EMAIL: "test@likro.com.br",
    GOOGLE_SA_CLIENT_EMAIL: "sa@project.iam.gserviceaccount.com",
    GOOGLE_SA_PRIVATE_KEY:
      "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n",
    GOOGLE_SHEET_ID: "test-sheet-id",
  },
}));

// Mock lead-resend & lead-sheets (Plan 03 creates them) to control results
const sendLeadEmail = vi.fn();
const appendLeadRow = vi.fn();
vi.mock("@/lib/lead-resend", () => ({ sendLeadEmail: (...a: unknown[]) => sendLeadEmail(...a) }));
vi.mock("@/lib/lead-sheets", () => ({ appendLeadRow: (...a: unknown[]) => appendLeadRow(...a) }));

function mkRequest(body: unknown): Request {
  return new Request("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function callPost(req: Request) {
  const mod = await import("@/app/api/lead/route");
  return mod.POST(req as never);
}

beforeEach(async () => {
  sendLeadEmail.mockReset();
  appendLeadRow.mockReset();
  const { __resetDedupForTests } = await import("@/lib/lead-dedup");
  __resetDedupForTests();
});
afterEach(() => vi.clearAllMocks());

describe("POST /api/lead", () => {
  const validBody = { name: "Lenny", whatsapp: "11999999999" };

  it("400 on invalid JSON", async () => {
    const res = await callPost(mkRequest("not-json"));
    expect(res.status).toBe(400);
  });

  it("honeypot triggered (website filled) → 200 + fake success, no fetch", async () => {
    const res = await callPost(mkRequest({ ...validBody, website: "http://bot.example" }));
    expect(res.status).toBe(200);
    expect(sendLeadEmail).not.toHaveBeenCalled();
    expect(appendLeadRow).not.toHaveBeenCalled();
  });

  it("422 on schema validation fail (name too short)", async () => {
    const res = await callPost(mkRequest({ name: "L", whatsapp: "11999999999" }));
    expect(res.status).toBe(422);
  });

  it("200 when both integrations succeed", async () => {
    sendLeadEmail.mockResolvedValue(undefined);
    appendLeadRow.mockResolvedValue(true); // true = anexou de fato
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(200);
    expect(sendLeadEmail).toHaveBeenCalledOnce();
    expect(appendLeadRow).toHaveBeenCalledOnce();
  });

  it("200 when only Sheets succeeds (Resend fails)", async () => {
    sendLeadEmail.mockRejectedValue(new Error("resend down"));
    appendLeadRow.mockResolvedValue(true); // Sheets anexou
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(200);
  });

  it("200 when Sheets off (no-op false) but Resend succeeds", async () => {
    sendLeadEmail.mockResolvedValue(undefined);
    appendLeadRow.mockResolvedValue(false); // Sheets desabilitado — no-op
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(200);
  });

  it("502 when Sheets off (no-op false) AND Resend fails — sem mascarar perda", async () => {
    // Guard: um Sheets off (resolve false) NÃO pode contar como entrega e
    // esconder a falha do Resend. Senão o lead sumiria com um falso 200.
    sendLeadEmail.mockRejectedValue(new Error("resend down"));
    appendLeadRow.mockResolvedValue(false);
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(502);
  });

  it("502 when both fail", async () => {
    sendLeadEmail.mockRejectedValue(new Error("resend down"));
    appendLeadRow.mockRejectedValue(new Error("sheets down"));
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(502);
  });

  it("dedup: 2nd submit in window returns 200 deduped without re-calling integrations", async () => {
    sendLeadEmail.mockResolvedValue(undefined);
    appendLeadRow.mockResolvedValue(undefined);
    await callPost(mkRequest(validBody));
    const callsAfter1 = sendLeadEmail.mock.calls.length + appendLeadRow.mock.calls.length;

    // Same phone, immediate — dedup hits
    const res = await callPost(mkRequest(validBody));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; deduped?: boolean };
    expect(json.deduped).toBe(true);
    const callsAfter2 = sendLeadEmail.mock.calls.length + appendLeadRow.mock.calls.length;
    expect(callsAfter2).toBe(callsAfter1);
  });
});
