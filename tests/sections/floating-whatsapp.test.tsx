/**
 * Cobertura: CTA-06 (floating mobile + scroll threshold + hide when form), MOBILE-02 (safe-area).
 *
 * SETUP: cria <section id="lead-form-section"> no document.body antes de cada render,
 * porque useFormInView só registra observer se o target id existir no DOM.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { FloatingWhatsApp } from "@/sections/Floating/FloatingWhatsApp";

// Mock IntersectionObserver — controllable via callback handle
let observerCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;
let formSectionEl: HTMLElement | null = null;

beforeEach(() => {
  observerCallback = null;
  class MockIO {
    constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
      observerCallback = cb;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIO as never);
  Object.defineProperty(window, "innerHeight", { writable: true, value: 800 });
  Object.defineProperty(window, "scrollY", { writable: true, value: 0 });

  // CRÍTICO: useFormInView (Plan 04) busca document.getElementById("lead-form-section").
  // Sem este elemento, o observer nunca é registrado e formInView fica preso em false.
  formSectionEl = document.createElement("section");
  formSectionEl.id = "lead-form-section";
  document.body.appendChild(formSectionEl);
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (formSectionEl && formSectionEl.parentNode) {
    formSectionEl.parentNode.removeChild(formSectionEl);
  }
  formSectionEl = null;
});

function fireScroll(y: number) {
  Object.defineProperty(window, "scrollY", { writable: true, value: y });
  window.dispatchEvent(new Event("scroll"));
}

describe("<FloatingWhatsApp>", () => {
  it("container tem md:hidden (mobile only)", () => {
    const { container } = render(<FloatingWhatsApp />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/md:hidden/);
  });

  it("renderiza WhatsAppCta com location=floating", () => {
    render(<FloatingWhatsApp />);
    const cta = document.querySelector('[data-location="floating"]');
    expect(cta).not.toBeNull();
  });

  it("antes de scroll, NÃO visível (opacity 0 ou pointer-events none)", () => {
    const { container } = render(<FloatingWhatsApp />);
    const root = container.firstElementChild as HTMLElement;
    // Aceita qualquer um dos sinais de "escondido"
    const styleOpacity = root.style.opacity;
    const hidden =
      styleOpacity === "0" ||
      root.style.pointerEvents === "none" ||
      root.getAttribute("aria-hidden") === "true";
    expect(hidden).toBe(true);
  });

  it("após scroll > 50vh, fica visível", async () => {
    const { container } = render(<FloatingWhatsApp />);
    await act(async () => {
      fireScroll(500);
    });
    const root = container.firstElementChild as HTMLElement;
    // pointerEvents=auto OU opacity=1 OU aria-hidden=false
    const visible =
      root.style.opacity === "1" ||
      root.style.pointerEvents === "auto" ||
      root.getAttribute("aria-hidden") !== "true";
    expect(visible).toBe(true);
  });

  it("quando form em viewport, esconde de novo", async () => {
    // O lead-form-section foi criado em beforeEach, então useFormInView
    // consegue registrar o observer e capturar nosso callback mockado.
    const { container } = render(<FloatingWhatsApp />);
    await act(async () => {
      fireScroll(500);
    });
    await act(async () => {
      if (observerCallback) observerCallback([{ isIntersecting: true }]);
    });
    const root = container.firstElementChild as HTMLElement;
    const hidden = root.style.opacity === "0" || root.style.pointerEvents === "none";
    expect(hidden).toBe(true);
  });
});
