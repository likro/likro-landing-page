/**
 * Cobertura: CTA-12 (dedup por número WhatsApp em janela de 60s).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkAndRegisterDedup,
  __resetDedupForTests,
  __getDedupSizeForTests,
} from "@/lib/lead-dedup";

describe("checkAndRegisterDedup", () => {
  beforeEach(() => {
    __resetDedupForTests();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("primeira chamada retorna false e registra", () => {
    expect(checkAndRegisterDedup("5511999999999")).toBe(false);
    expect(__getDedupSizeForTests()).toBe(1);
  });

  it("segunda chamada dentro de 60s retorna true", () => {
    checkAndRegisterDedup("5511999999999");
    vi.advanceTimersByTime(30_000);
    expect(checkAndRegisterDedup("5511999999999")).toBe(true);
  });

  it("número diferente sempre retorna false", () => {
    checkAndRegisterDedup("5511999999999");
    expect(checkAndRegisterDedup("5511888888888")).toBe(false);
  });

  it("após 60s, número é considerado novo de novo", () => {
    checkAndRegisterDedup("5511999999999");
    vi.advanceTimersByTime(61_000);
    expect(checkAndRegisterDedup("5511999999999")).toBe(false);
  });

  it("cleanup oportunista remove entradas expiradas", () => {
    checkAndRegisterDedup("5511111111111");
    checkAndRegisterDedup("5511222222222");
    expect(__getDedupSizeForTests()).toBe(2);
    vi.advanceTimersByTime(61_000);
    checkAndRegisterDedup("5511333333333"); // dispara cleanup
    expect(__getDedupSizeForTests()).toBe(1);
  });
});
