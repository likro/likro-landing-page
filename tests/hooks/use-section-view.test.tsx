/**
 * Phase 6 — Wave 0 RED spec — `useSectionView` (section_view tracking).
 *
 * Cobre TRACK-04: o hook dedicado `useSectionView(section)` dispara o evento
 * `section_view` UMA vez quando a seção entra no viewport, sem re-disparar em
 * re-interseção, e desconecta o observer após o primeiro disparo.
 *
 * RED esperado: `@/hooks/use-section-view` ainda NÃO existe — Plan 06-02 cria o
 * módulo contra este contrato. A falha aqui é de resolução de módulo (RED de
 * Wave 0), não de sintaxe de teste.
 *
 * Contrato (06-01-PLAN <interfaces>):
 *   export function useSectionView<T extends Element = HTMLElement>(
 *     section: string,
 *     opts?: { threshold?: number },
 *   ): React.RefObject<T | null>;
 *   → no primeiro `isIntersecting`, chama track("section_view", { section })
 *     UMA vez e desconecta o observer. NÃO consulta prefers-reduced-motion.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { useSectionView } from "@/hooks/use-section-view";

// `track` mockado — o teste verifica os argumentos do fan-out, não o fan-out real.
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
import { track } from "@/lib/analytics";

// Handle controlável do IntersectionObserver: capturamos o callback e os spies
// de observe/disconnect/unobserve para dirigir a interseção manualmente.
let ioCallback: IntersectionObserverCallback | null = null;
let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;
let unobserveSpy: ReturnType<typeof vi.fn>;
let observerStub: IntersectionObserver;

beforeEach(() => {
  ioCallback = null;
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  unobserveSpy = vi.fn();

  class IOMock {
    observe = observeSpy;
    disconnect = disconnectSpy;
    unobserve = unobserveSpy;
    takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
    root: Element | Document | null = null;
    rootMargin = "";
    thresholds: ReadonlyArray<number> = [];
    constructor(cb: IntersectionObserverCallback) {
      ioCallback = cb;
      observerStub = this as unknown as IntersectionObserver;
    }
  }
  vi.stubGlobal("IntersectionObserver", IOMock as unknown as typeof IntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

/**
 * Componente de teste wrapper — renderiza uma <section> real cujo ref vem do
 * hook. O jsdom anexa o nó e o useEffect do hook captura `ref.current`.
 * Padrão recomendado pelo 06-RESEARCH (§Code Examples) sobre manipulação manual
 * de ref via renderHook.
 */
function Probe({ section }: { section: string }) {
  const ref = useSectionView<HTMLElement>(section);
  return <section ref={ref} />;
}

function intersect(isIntersecting: boolean) {
  if (!ioCallback) throw new Error("IntersectionObserver não foi instanciado pelo hook");
  ioCallback(
    [{ isIntersecting } as IntersectionObserverEntry],
    observerStub,
  );
}

describe("useSectionView() — Phase 6 section_view tracking", () => {
  it("dispara section_view uma vez ao entrar no viewport", () => {
    render(<Probe section="pain" />);
    intersect(true);
    expect(track).toHaveBeenCalledWith("section_view", { section: "pain" });
  });

  it("nao re-dispara em re-intersecao", () => {
    render(<Probe section="pain" />);
    intersect(true);
    intersect(true);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it("nao dispara enquanto a secao nao intersecta", () => {
    render(<Probe section="pain" />);
    intersect(false);
    expect(track).not.toHaveBeenCalled();
  });

  it("usa o section name passado no payload", () => {
    render(<Probe section="bridge" />);
    intersect(true);
    expect(track).toHaveBeenCalledWith("section_view", { section: "bridge" });
  });

  it("desconecta o observer apos o primeiro disparo", () => {
    render(<Probe section="proof" />);
    intersect(true);
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
