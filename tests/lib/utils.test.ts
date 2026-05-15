import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("merges and dedupes classes", () => {
    expect(cn(["foo", null, "bar"], "baz")).toBe("foo bar baz");
  });
  it("dedupes Tailwind conflicts via tailwind-merge", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });
  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
