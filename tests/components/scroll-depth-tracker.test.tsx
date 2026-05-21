/**
 * Phase 6 — Wave 0 RED spec — `<ScrollDepthTracker />` (scroll_depth tracking).
 *
 * Cobre TRACK-04: o componente único `<ScrollDepthTracker />` dispara o evento
 * `scroll_depth` nos marcos 25/50/75/100% do scroll da página, cada marco UMA
 * vez, com no-op quando a página não é rolável.
 *
 * RED esperado: `@/components/analytics/ScrollDepthTracker` ainda NÃO existe —
 * Plan 06-02 cria o módulo contra este contrato. A falha aqui é de resolução de
 * módulo (RED de Wave 0), não de sintaxe de teste.
 *
 * Contrato (06-01-PLAN <interfaces>):
 *   export function ScrollDepthTracker(): null;
 *   → listener `scroll` passivo, throttle via requestAnimationFrame,
 *     pct = scrollY / (scrollHeight - innerHeight) * 100,
 *     dispara track("scroll_depth", { depth }) ao cruzar cada marco de
 *     [25, 50, 75, 100], cada marco uma vez via Set. Marco 100 usa tolerância
 *     pct >= 99. No-op quando scrollHeight - innerHeight <= 0.
 *
 * jsdom não tem geometria de scroll (06-RESEARCH §Pitfall 2) — por isso cada
 * teste stuba scrollHeight/innerHeight/scrollY e roda o RAF de forma síncrona.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
// @ts-expect-error — módulo criado no Plan 06-02; ausência é o RED de Wave 0.
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";

// `track` mockado — o teste verifica os argumentos, não o fan-out real.
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
import { track } from "@/lib/analytics";

/** Stub da geometria de scroll do jsdom (§Pitfall 2). */
function stubGeometry({
  scrollHeight,
  innerHeight,
  scrollY = 0,
}: {
  scrollHeight: number;
  innerHeight: number;
  scrollY?: number;
}) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    configurable: true,
  });
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    writable: true,
    configurable: true,
  });
}

/** Move o scroll e dispara o evento `scroll` no window. */
function scrollTo(y: number) {
  (window as unknown as { scrollY: number }).scrollY = y;
  window.dispatchEvent(new Event("scroll"));
}

/** Quantas vezes `track` foi chamado com um `depth` específico. */
function depthCalls(depth: number): number {
  const mock = track as unknown as { mock: { calls: unknown[][] } };
  return mock.mock.calls.filter(
    (c) => (c[1] as { depth?: number } | undefined)?.depth === depth,
  ).length;
}

beforeEach(() => {
  // RAF síncrono — o throttle do componente resolve imediatamente no teste.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("<ScrollDepthTracker /> — Phase 6 scroll_depth tracking", () => {
  it("dispara scroll_depth 25 e 50 ao rolar ~60%", () => {
    // scrollable = 4000 - 1000 = 3000; scrollY=1800 → 60%.
    stubGeometry({ scrollHeight: 4000, innerHeight: 1000, scrollY: 0 });
    render(<ScrollDepthTracker />);
    scrollTo(1800);

    expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 25 });
    expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 50 });
    expect(track).not.toHaveBeenCalledWith("scroll_depth", { depth: 75 });
  });

  it("nao duplica marco ja disparado", () => {
    stubGeometry({ scrollHeight: 4000, innerHeight: 1000, scrollY: 0 });
    render(<ScrollDepthTracker />);
    scrollTo(1800);
    scrollTo(1800);

    expect(depthCalls(25)).toBe(1);
    expect(depthCalls(50)).toBe(1);
  });

  it("dispara 100 com tolerancia pct >= 99", () => {
    // scrollable = 3000; scrollY=2970 → 99%.
    stubGeometry({ scrollHeight: 4000, innerHeight: 1000, scrollY: 0 });
    render(<ScrollDepthTracker />);
    scrollTo(2970);

    expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 100 });
  });

  it("no-op quando a pagina nao e rolavel", () => {
    // scrollHeight < innerHeight → scrollable negativo.
    stubGeometry({ scrollHeight: 800, innerHeight: 1000, scrollY: 0 });
    render(<ScrollDepthTracker />);
    scrollTo(500);

    expect(track).not.toHaveBeenCalled();
  });

  it("checa estado inicial no mount sem scroll event", () => {
    // Página restaurada já no fim (scrollY=3000 → 100%) ANTES do render.
    stubGeometry({ scrollHeight: 4000, innerHeight: 1000, scrollY: 3000 });
    render(<ScrollDepthTracker />);

    expect(track).toHaveBeenCalledWith("scroll_depth", { depth: 100 });
  });
});
