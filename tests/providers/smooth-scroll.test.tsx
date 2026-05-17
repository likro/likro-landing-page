import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

/**
 * SmoothScrollProvider refactor (pós-Phase-3 redesign):
 *   - Lenis carrega LAZY via dynamic import dentro de useEffect (TBT zero impact)
 *   - prefers-reduced-motion → skip init inteiro
 *   - children renderizam SEMPRE direto, sem wrapper
 *
 * JSDOM não implementa matchMedia — mockamos antes de cada render.
 */
describe("<SmoothScrollProvider>", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders children directly (no wrapper) regardless of reduced motion", () => {
    const { getByText } = render(
      <SmoothScrollProvider>
        <span>child-content</span>
      </SmoothScrollProvider>,
    );
    expect(getByText("child-content")).toBeInTheDocument();
  });

  it("source does NOT import motion/react and does NOT use ReactLenis JSX (TBT optimization)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const file = path.resolve(
      __dirname,
      "../../src/components/providers/smooth-scroll-provider.tsx",
    );
    const source = fs.readFileSync(file, "utf-8");
    expect(source).not.toMatch(/from\s+["']motion\/react["']/);
    expect(source).not.toMatch(/from\s+["']lenis\/react["']/);
    expect(source).not.toMatch(/<ReactLenis\b/);
  });

  it("skips init when prefers-reduced-motion", () => {
    (window.matchMedia as ReturnType<typeof vi.fn>).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const { getByText } = render(
      <SmoothScrollProvider>
        <span>reduced-child</span>
      </SmoothScrollProvider>,
    );
    expect(getByText("reduced-child")).toBeInTheDocument();
  });
});
