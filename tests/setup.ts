import "@testing-library/jest-dom";
import { vi } from "vitest";

// `server-only` throws ao ser importado fora de Server Component. Em testes
// (jsdom), aliasar para um módulo no-op permite testar a lógica de rotas/libs
// que carregam o guard. Pattern padrão Next.js + vitest.
vi.mock("server-only", () => ({}));

// jsdom não implementa IntersectionObserver. Stub global no-op para que
// componentes que o usam (useFormInView, useInView) não crashem em testes
// que renderizam a árvore inteira. Testes que precisam controlar o observer
// (floating-whatsapp.test.tsx) sobrescrevem este stub no próprio beforeEach.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}
