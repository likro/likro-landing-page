import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@/lib/analytics";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("track()", () => {
  beforeEach(() => {
    window.fbq = vi.fn();
    window.gtag = vi.fn();
    window.clarity = vi.fn();
  });

  afterEach(() => {
    delete (window as any).fbq;
    delete (window as any).gtag;
    delete (window as any).clarity;
  });

  it("attaches event_id (UUID v4) to GA4 payload", () => {
    track("whatsapp_click", { location: "hero" });
    const call = (window.gtag as any).mock.calls[0];
    expect(call[0]).toBe("event");
    expect(call[1]).toBe("whatsapp_click");
    expect(call[2].event_id).toMatch(UUID_V4_REGEX);
    expect(call[2].location).toBe("hero");
  });

  it("passes eventID to Meta Pixel as 4th arg with 'Contact' standard event", () => {
    track("whatsapp_click", { location: "hero" });
    const call = (window.fbq as any).mock.calls[0];
    expect(call[0]).toBe("track");
    expect(call[1]).toBe("Contact");
    expect(call[3].eventID).toMatch(UUID_V4_REGEX);
  });

  it("uses 'trackCustom' for non-mapped events (e.g. section_view)", () => {
    track("section_view", { section: "hero" });
    const call = (window.fbq as any).mock.calls[0];
    expect(call[0]).toBe("trackCustom");
    expect(call[1]).toBe("section_view");
    expect(call[3].eventID).toMatch(UUID_V4_REGEX);
  });

  it("uses SAME event_id across GA4, Pixel and Clarity (dedup-ready)", () => {
    track("form_submit_success", {});
    const gaId = (window.gtag as any).mock.calls[0][2].event_id;
    const fbId = (window.fbq as any).mock.calls[0][3].eventID;
    expect(gaId).toBe(fbId);

    // Clarity should also receive the same id
    const claritySetCall = (window.clarity as any).mock.calls.find(
      (c: any[]) => c[0] === "set" && c[1] === "last_event_id",
    );
    expect(claritySetCall).toBeDefined();
    expect(claritySetCall[2]).toBe(gaId);
  });

  it("maps form_submit_success to Meta 'Lead' standard event", () => {
    track("form_submit_success", {});
    const call = (window.fbq as any).mock.calls[0];
    expect(call[1]).toBe("Lead");
  });

  it("calls clarity('event', eventName) for every track call", () => {
    track("cta_click", { location: "hero", label: "Falar no WhatsApp" });
    const eventCall = (window.clarity as any).mock.calls.find(
      (c: any[]) => c[0] === "event",
    );
    expect(eventCall).toBeDefined();
    expect(eventCall[1]).toBe("cta_click");
  });

  it("no-ops in SSR (window undefined)", () => {
    const original = global.window;
    // @ts-expect-error simulate SSR
    delete global.window;
    expect(() => track("whatsapp_click", {})).not.toThrow();
    global.window = original;
  });

  it("does not throw if window.fbq missing (graceful degradation)", () => {
    delete (window as any).fbq;
    expect(() => track("whatsapp_click", { location: "hero" })).not.toThrow();
  });
});
