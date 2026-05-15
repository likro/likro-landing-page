import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const useReducedMotionMock = vi.fn();
vi.mock("motion/react", () => ({
  useReducedMotion: () => useReducedMotionMock(),
}));

vi.mock("lenis/react", () => ({
  ReactLenis: ({
    children,
    options,
  }: {
    children: React.ReactNode;
    options: { syncTouch?: boolean };
  }) => (
    <div data-testid="react-lenis" data-sync-touch={String(options.syncTouch)}>
      {children}
    </div>
  ),
}));

describe("<SmoothScrollProvider>", () => {
  it("returns children WITHOUT ReactLenis when reduced motion is active", () => {
    useReducedMotionMock.mockReturnValue(true);
    const { queryByTestId, getByText } = render(
      <SmoothScrollProvider>
        <span>child</span>
      </SmoothScrollProvider>,
    );
    expect(queryByTestId("react-lenis")).toBeNull();
    expect(getByText("child")).toBeInTheDocument();
  });

  it("wraps children in ReactLenis with syncTouch:false when motion enabled", () => {
    useReducedMotionMock.mockReturnValue(false);
    const { getByTestId } = render(
      <SmoothScrollProvider>
        <span>child</span>
      </SmoothScrollProvider>,
    );
    const wrapper = getByTestId("react-lenis");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.getAttribute("data-sync-touch")).toBe("false");
  });
});
