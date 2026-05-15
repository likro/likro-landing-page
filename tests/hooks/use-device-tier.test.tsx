import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeviceTier } from "@/hooks/use-device-tier";

// Mock motion/react useReducedMotion
let mockReducedMotion = false;
vi.mock("motion/react", () => ({
  useReducedMotion: () => mockReducedMotion,
}));

function setMatchMedia(matchesByQuery: Record<string, boolean>) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matchesByQuery[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("useDeviceTier()", () => {
  beforeEach(() => {
    mockReducedMotion = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'reduced' when prefers-reduced-motion is active", () => {
    mockReducedMotion = true;
    setMatchMedia({});
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current).toBe("reduced");
  });

  it("returns 'mobile' for viewport <=639px", () => {
    setMatchMedia({ "(max-width: 639px)": true, "(max-width: 1023px)": true });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current).toBe("mobile");
  });

  it("returns 'tablet' for viewport >=640 and <=1023px", () => {
    setMatchMedia({ "(max-width: 639px)": false, "(max-width: 1023px)": true });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current).toBe("tablet");
  });

  it("returns 'desktop' for viewport >=1024px", () => {
    setMatchMedia({ "(max-width: 639px)": false, "(max-width: 1023px)": false });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current).toBe("desktop");
  });

  it("re-computes tier on window resize", () => {
    setMatchMedia({ "(max-width: 639px)": false, "(max-width: 1023px)": false });
    const { result } = renderHook(() => useDeviceTier());
    expect(result.current).toBe("desktop");

    act(() => {
      setMatchMedia({ "(max-width: 639px)": true, "(max-width: 1023px)": true });
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe("mobile");
  });
});
