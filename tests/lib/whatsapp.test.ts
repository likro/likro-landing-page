import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_WA_NUMBER;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WA_NUMBER = "5511999999999";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_WA_NUMBER = ORIGINAL_ENV;
  });

  it("builds canonical wa.me URL with encoded message", () => {
    const url = buildWhatsAppUrl("Oi! Vi a Likro", "hero");
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999999999\?text=/);
    expect(url).toContain("Oi%21%20Vi%20a%20Likro");
  });

  it("URL-encodes spaces and special chars", () => {
    const url = buildWhatsAppUrl("a b & c", "footer");
    expect(url).toContain("a%20b%20%26%20c");
  });

  it("throws on web.whatsapp.com in message (CTA-02 guard)", () => {
    expect(() => buildWhatsAppUrl("vai pra web.whatsapp.com", "hero")).toThrow(
      /Forbidden host "web\.whatsapp\.com"/,
    );
  });

  it("throws on api.whatsapp.com in message (CTA-02 guard)", () => {
    expect(() => buildWhatsAppUrl("api.whatsapp.com/send", "footer")).toThrow(
      /Forbidden host "api\.whatsapp\.com"/,
    );
  });

  it("throws on invalid phone format (+ or spaces)", () => {
    process.env.NEXT_PUBLIC_WA_NUMBER = "+55 11 99999-9999";
    expect(() => buildWhatsAppUrl("oi", "hero")).toThrow(/Invalid phone format/);
  });

  it("throws on phone too short (< 12 digits)", () => {
    process.env.NEXT_PUBLIC_WA_NUMBER = "55119999";
    expect(() => buildWhatsAppUrl("oi", "hero")).toThrow(/Invalid phone format/);
  });

  it("accepts 12-digit phone (DDD without 9 prefix)", () => {
    process.env.NEXT_PUBLIC_WA_NUMBER = "551299999999";
    const url = buildWhatsAppUrl("oi", "hero");
    expect(url).toMatch(/^https:\/\/wa\.me\/551299999999/);
  });

  it("uses placeholder when NEXT_PUBLIC_WA_NUMBER missing in dev", () => {
    delete process.env.NEXT_PUBLIC_WA_NUMBER;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const url = buildWhatsAppUrl("oi", "hero");
    expect(url).toMatch(/^https:\/\/wa\.me\/0000000000\?text=/);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
