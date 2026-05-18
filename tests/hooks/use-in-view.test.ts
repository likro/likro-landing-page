import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, render, act } from "@testing-library/react";
import { createElement } from "react";
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
      [{ isIntersecting, target: document.createElement("div") } as unknown as IntersectionObserverEntry],
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
    // Mount a real component so the ref actually attaches to a DOM node
    // and the effect observes it via IntersectionObserver.
    let captured: boolean[] = [];
    function Probe() {
      const [ref, inView] = useInView<HTMLDivElement>();
      captured.push(inView);
      return createElement("div", { ref });
    }
    render(createElement(Probe));

    // Trigger intersecting on the latest IO instance.
    act(() => {
      const latest = ioInstances[ioInstances.length - 1];
      latest?.trigger(true);
    });
    expect(captured[captured.length - 1]).toBe(true);

    // With once:true, observer is disconnected — flipping to not intersecting
    // is a no-op (observer.cb is detached). State must remain true.
    act(() => {
      const latest = ioInstances[ioInstances.length - 1];
      latest?.trigger(false);
    });
    expect(captured[captured.length - 1]).toBe(true);
  });

  it("disconnects observer on unmount (Test 6)", () => {
    function Probe() {
      const [ref] = useInView<HTMLDivElement>();
      return createElement("div", { ref });
    }
    const { unmount } = render(createElement(Probe));

    const latest = ioInstances[ioInstances.length - 1];
    expect(latest).toBeDefined();
    expect(latest?.observe).toHaveBeenCalled();

    unmount();
    expect(latest?.disconnect).toHaveBeenCalled();
  });
});
