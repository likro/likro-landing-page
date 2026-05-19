/**
 * Cobertura: CTA-09 (form validation), CTA-10 (server-side Zod validation).
 * Honeypot field name = `website` (NÃO `company` — RESEARCH Pitfall 8).
 */
import { describe, expect, it } from "vitest";
import { leadSchema, normalizeWhatsapp } from "@/lib/lead-schema";

describe("normalizeWhatsapp", () => {
  it("remove todos os non-digits", () => {
    expect(normalizeWhatsapp("+55 (11) 99999-9999")).toBe("5511999999999");
    expect(normalizeWhatsapp("11 9 9999-9999")).toBe("11999999999");
  });

  it("é idempotente", () => {
    const once = normalizeWhatsapp("5511999999999");
    const twice = normalizeWhatsapp(once);
    expect(once).toBe(twice);
  });
});

describe("leadSchema", () => {
  const validBase = {
    name: "Lenny Wajcberg",
    whatsapp: "11999999999",
  };

  it("aceita lead mínimo válido", () => {
    const r = leadSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("rejeita nome com 1 char", () => {
    const r = leadSchema.safeParse({ ...validBase, name: "L" });
    expect(r.success).toBe(false);
  });

  it("normaliza WhatsApp no parse", () => {
    const r = leadSchema.safeParse({ ...validBase, whatsapp: "+55 (11) 99999-9999" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.whatsapp).toBe("5511999999999");
  });

  it("rejeita WhatsApp com 9 dígitos", () => {
    const r = leadSchema.safeParse({ ...validBase, whatsapp: "999999999" });
    expect(r.success).toBe(false);
  });

  it("rejeita WhatsApp com 14 dígitos", () => {
    const r = leadSchema.safeParse({ ...validBase, whatsapp: "12345678901234" });
    expect(r.success).toBe(false);
  });

  it("rejeita mensagem com 1001 chars", () => {
    const r = leadSchema.safeParse({ ...validBase, message: "x".repeat(1001) });
    expect(r.success).toBe(false);
  });

  it("converte mensagem vazia para undefined", () => {
    const r = leadSchema.safeParse({ ...validBase, message: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.message).toBeUndefined();
  });

  it("aceita honeypot field 'website' preenchido (route handler valida, não schema)", () => {
    const r = leadSchema.safeParse({ ...validBase, website: "http://spam.example" });
    expect(r.success).toBe(true);
  });
});
