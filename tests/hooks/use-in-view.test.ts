import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { useInView } from "@/hooks/use-in-view";

/**
 * Phase 4 — useInView hook unit tests (Plan 04-00).
 *
 * Covers the 6 behaviors documented in 04-00-PLAN.md Task 1:
 *  1. prefers-reduced-motion → returns true immediately.
 *  2. Without reduced motion, initial state is false (no IO observation yet).
 *  3. Hook file is client-only ("use client" first line).
 *  4. Signature shape.
 *  5. `once: true` (default): once in view, stays in view.
 *  6. Observer disconnected on unmount.
 */

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

class IOMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
  root: Element | Document | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];
  constructor(public cb: IntersectionObserverCallback) {}
  trigger(isIntersecting: boolean) {
    this.cb(
      [{ isIntersecting, target: document.createElement("div") } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

let ioInstances: IOMock[] = [];
let prefersReduced = false;

function setupMatchMedia(reduced: boolean) {
  prefersReduced = reduced;
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q === "(prefers-reduced-motion: reduce)" ? prefersReduced : false,
    media: q,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setupIntersectionObserver() {
  ioInstances = [];
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    vi.fn((cb: IntersectionObserverCallback) => {
      const inst = new IOMock(cb);
      ioInstances.push(inst);
      return inst as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
}

// -----------------------------------------------------------------------------
// Suite
// -----------------------------------------------------------------------------

describe("useInView() — Phase 4 motion-free IO hook", () => {
  beforeEach(() => {
    setupMatchMedia(false);
    setupIntersectionObserver();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns [ref, true] immediately when prefers-reduced-motion is active (Test 1)", () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    // After mount effect, inView should be true; IO should NOT have been instantiated.
    expect(result.current[1]).toBe(true);
    expect(ioInstances.length).toBe(0);
  });

  it("returns [ref, false] initially without reduced motion (Test 2)", () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>());
    expect(result.current[1]).toBe(false);
  });

  it("hook file declares 'use client' on line 1 (Test 3)", () => {
    const hookPath = path.resolve(__dirname, "../../src/hooks/use-in-view.ts");
    const firstLine = fs.readFileSync(hookPath, "utf-8").split(/\r?\n/)[0];
    expect(firstLine).toBe('"use client";');
  });

  it("exposes the expected signature: [ref, boolean] (Test 4)", () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>({ threshold: 0.3, rootMargin: "0px", once: true }));
    const [ref, inView] = result.current;
    expect(ref).toHaveProperty("current");
    expect(typeof inView).toBe("boolean");
  });

  it("with once:true (default), once inView becomes true it stays true (Test 5)", () => {
    // Attach a real DOM node so the effect actually observes.
    const node = document.createElement("div");
    document.body.appendChild(node);

    const { result, rerender } = renderHook(() => useInView<HTMLDivElement>());
    // Force the ref to point at the node and re-run the effect.
    (result.current[0] as { current: HTMLDivElement | null }).current = node;
    rerender();

    // Trigger intersecting on the latest IO instance, then trigger NOT intersecting.
    act(() => {
      const latest = ioInstances[ioInstances.length - 1];
      latest?.trigger(true);
    });
    expect(result.current[1]).toBe(true);

    act(() => {
      const latest = ioInstances[ioInstances.length - 1];
      // Even if we try to flip off, with once:true the observer should be disconnected
      // and the state should remain true.
      latest?.trigger(false);
    });
    expect(result.current[1]).toBe(true);

    document.body.removeChild(node);
  });

  it("disconnects observer on unmount (Test 6)", () => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    const { result, rerender, unmount } = renderHook(() => useInView<HTMLDivElement>());
    (result.current[0] as { current: HTMLDivElement | null }).current = node;
    rerender();

    const latest = ioInstances[ioInstances.length - 1];
    expect(latest).toBeDefined();

    unmount();
    expect(latest?.disconnect).toHaveBeenCalled();

    document.body.removeChild(node);
  });
});
