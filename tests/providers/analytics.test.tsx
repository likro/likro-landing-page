import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// Mock @next/third-parties before importing provider
vi.mock("@next/third-parties/google", () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga4" data-ga-id={gaId} />
  ),
}));

vi.mock("next/script", () => ({
  default: ({
    id,
    strategy,
    dangerouslySetInnerHTML,
  }: {
    id: string;
    strategy?: string;
    dangerouslySetInnerHTML?: { __html: string };
  }) => (
    <div
      data-testid={`script-${id}`}
      data-strategy={strategy}
      data-html={dangerouslySetInnerHTML?.__html ?? ""}
    />
  ),
}));

describe("<AnalyticsProvider>", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GA4_ID = "G-TEST123";
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "1234567890";
    process.env.NEXT_PUBLIC_CLARITY_ID = "abcd1234";
    vi.resetModules();
  });

  it("mounts GA4, Pixel and Clarity scripts when env vars present", async () => {
    const { AnalyticsProvider } = await import(
      "@/components/providers/analytics-provider"
    );
    const { getByTestId } = render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );
    expect(getByTestId("ga4")).toBeInTheDocument();
    expect(getByTestId("script-meta-pixel")).toBeInTheDocument();
    expect(getByTestId("script-meta-pixel").getAttribute("data-strategy")).toBe(
      "afterInteractive",
    );
    expect(getByTestId("script-ms-clarity")).toBeInTheDocument();
    expect(getByTestId("script-ms-clarity").getAttribute("data-strategy")).toBe(
      "afterInteractive",
    );
  });

  it("uses id='ms-clarity' (NOT 'clarity') to avoid window.clarity conflict (Pitfall E)", async () => {
    const { AnalyticsProvider } = await import(
      "@/components/providers/analytics-provider"
    );
    const { getByTestId, queryByTestId } = render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );
    expect(getByTestId("script-ms-clarity")).toBeInTheDocument();
    expect(queryByTestId("script-clarity")).toBeNull();
  });

  it("does not mount any vendor script when env vars missing (graceful degradation)", async () => {
    delete process.env.NEXT_PUBLIC_GA4_ID;
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
    delete process.env.NEXT_PUBLIC_CLARITY_ID;
    vi.resetModules();
    const { AnalyticsProvider } = await import(
      "@/components/providers/analytics-provider"
    );
    const { queryByTestId } = render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );
    expect(queryByTestId("ga4")).toBeNull();
    expect(queryByTestId("script-meta-pixel")).toBeNull();
    expect(queryByTestId("script-ms-clarity")).toBeNull();
  });
});
