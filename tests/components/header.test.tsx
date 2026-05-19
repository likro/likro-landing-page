/**
 * Cobertura: MOBILE-06 (hide-on-scroll-down, show-on-scroll-up) + reduced-motion path.
 *
 * Estratégia: mockamos motion/react useScroll/useMotionValueEvent/useReducedMotion
 * de forma controlável para forçar o estado interno do Header sem precisar
 * simular um scroll real em jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// Capture o callback registrado por useMotionValueEvent para invocar manualmente.
let scrollChangeCallback: ((value: number) => void) | null = null;
let getPrevious: () => number = () => 0;
let reduced = false;

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => reduced,
    useScroll: () => ({
      scrollY: {
        get: () => 0,
        getPrevious: () => getPrevious(),
        on: () => () => {},
      },
    }),
    useMotionValueEvent: (_value: unknown, _event: string, cb: (v: number) => void) => {
      scrollChangeCallback = cb;
    },
  };
});

// Import APÓS o mock estar configurado.
let Header: typeof import("@/components/layout/Header").Header;

beforeEach(async () => {
  reduced = false;
  getPrevious = () => 0;
  scrollChangeCallback = null;
  Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
  const mod = await import("@/components/layout/Header");
  Header = mod.Header;
});

afterEach(() => {
  vi.resetModules();
});

describe("<Header> hide-on-scroll", () => {
  it("estado inicial: visível", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header") as HTMLElement;
    expect(header).not.toBeNull();
    const hidden = header.getAttribute("data-hidden") === "true";
    expect(hidden).toBe(false);
  });

  it("scroll down > 800px + delta > 80px esconde", () => {
    const { container } = render(<Header />);
    // Simular: previous=900, current=1000 → delta=100 (>80), current > innerHeight=800
    getPrevious = () => 900;
    scrollChangeCallback?.(1000);
    const header = container.querySelector("header") as HTMLElement;
    expect(header.getAttribute("data-hidden")).toBe("true");
  });

  it("scroll up < -8px reaparece", () => {
    const { container } = render(<Header />);
    // primeiro esconde
    getPrevious = () => 900;
    scrollChangeCallback?.(1000);
    // depois scroll up
    getPrevious = () => 1000;
    scrollChangeCallback?.(950); // delta=-50
    const header = container.querySelector("header") as HTMLElement;
    expect(header.getAttribute("data-hidden")).toBe("false");
  });

  it("reduced-motion: NUNCA esconde mesmo com scroll down forte", () => {
    reduced = true;
    const { container } = render(<Header />);
    getPrevious = () => 900;
    scrollChangeCallback?.(1000);
    const header = container.querySelector("header") as HTMLElement;
    expect(header.getAttribute("data-hidden")).toBe("false");
  });
});
