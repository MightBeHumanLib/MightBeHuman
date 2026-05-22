import { describe, expect, it } from "vitest";

import { maskMarkdown } from "./index.js";

describe("markdown preserver", () => {
  it("masks and restores markdown spans", () => {
    const original = "Use `inline()` and [docs](https://example.com).";
    const masked = maskMarkdown(original);

    expect(masked.text).not.toContain("inline()");
    expect(masked.text).not.toContain("https://example.com");
    expect(masked.restore(masked.text)).toBe(original);
  });
});
