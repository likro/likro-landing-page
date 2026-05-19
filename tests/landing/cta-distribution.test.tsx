/**
 * Cobertura: CTA-05 (CTAs persistentes em ≥ 4 pontos da página).
 *
 * Mock motion/react COMPLETO: HomePage inclui o Header (refatorado pelo Plan 05
 * para client component que usa useScroll/useMotionValueEvent). Sem esses mocks,
 * jsdom estoura "useScroll is not a function" ou retorna undefined ao acessar
 * scrollY. Match com o padrão usado em tests/components/header.test.tsx.
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import HomePage from "@/app/page";

// Mock motion/react para HomePage inteira (inclui Header client + animações)
vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => true, // simplifica reveals em test env
    useScroll: () => ({
      scrollY: {
        get: () => 0,
        getPrevious: () => 0,
        on: () => () => {},
      },
    }),
    useMotionValueEvent: () => {},
  };
});

describe("CTA distribution on HomePage", () => {
  const REQUIRED_LOCATIONS = ["hero", "header", "pain", "product", "proof", "footer", "floating"] as const;

  it("renderiza pelo menos 4 CTAs WhatsApp", () => {
    const { container } = render(<HomePage />);
    const ctas = container.querySelectorAll('[data-testid="whatsapp-cta"]');
    expect(ctas.length).toBeGreaterThanOrEqual(4);
  });

  it("cobre todas as 7 locations esperadas (hero, header, pain, product, proof, footer, floating)", () => {
    const { container } = render(<HomePage />);
    const ctas = Array.from(container.querySelectorAll('[data-testid="whatsapp-cta"]'));
    const locations = new Set(ctas.map((el) => el.getAttribute("data-location")));
    for (const loc of REQUIRED_LOCATIONS) {
      expect(locations.has(loc)).toBe(true);
    }
  });
});
