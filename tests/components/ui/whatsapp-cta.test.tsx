import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock track — espiar chamadas do WhatsAppCta.
const trackMock = vi.fn();
vi.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

// Mock env wrapper para garantir phone válido no helper.
const mockEnv = { NEXT_PUBLIC_WA_NUMBER: "5511999999999" as string | undefined };
vi.mock("@/lib/env", () => ({
  get env() {
    return mockEnv;
  },
}));

import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

describe("<WhatsAppCta>", () => {
  beforeEach(() => {
    trackMock.mockClear();
    mockEnv.NEXT_PUBLIC_WA_NUMBER = "5511999999999";
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders default label 'Falar no WhatsApp'", () => {
    render(<WhatsAppCta location="hero" />);
    expect(screen.getByTestId("whatsapp-cta")).toHaveTextContent("Falar no WhatsApp");
  });

  it("renders custom label when provided", () => {
    render(<WhatsAppCta location="footer" label="Quero conversar" />);
    expect(screen.getByTestId("whatsapp-cta")).toHaveTextContent("Quero conversar");
  });

  it("calls track('whatsapp_click', {location}) on click", async () => {
    const user = userEvent.setup();
    render(<WhatsAppCta location="pain" />);
    await user.click(screen.getByTestId("whatsapp-cta"));
    expect(trackMock).toHaveBeenCalledWith("whatsapp_click", { location: "pain" });
  });

  it("opens wa.me URL after 250ms loading window (window.open called)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(<WhatsAppCta location="hero" />);
    await user.click(screen.getByTestId("whatsapp-cta"));
    await vi.advanceTimersByTimeAsync(300);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/wa\.me\/5511999999999\?text=/),
      "_blank",
      "noopener,noreferrer",
    );
    vi.useRealTimers();
  });

  it("disables button while loading", async () => {
    const user = userEvent.setup();
    render(<WhatsAppCta location="hero" />);
    const btn = screen.getByTestId("whatsapp-cta") as HTMLButtonElement;
    await user.click(btn);
    expect(btn.disabled).toBe(true);
  });

  it("data-location attribute matches prop", () => {
    render(<WhatsAppCta location="floating" />);
    expect(screen.getByTestId("whatsapp-cta")).toHaveAttribute("data-location", "floating");
  });
});
