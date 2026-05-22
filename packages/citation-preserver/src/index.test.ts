import { describe, expect, it } from "vitest";

import { maskCitations } from "./index.js";

describe("citation preserver", () => {
  it("masks and restores citation-like spans", () => {
    const original = "Findings are consistent with DOI 10.1000/182 and [1].";
    const masked = maskCitations(original);

    expect(masked.text).not.toContain("10.1000/182");
    expect(masked.text).not.toContain("[1]");
    expect(masked.restore(masked.text)).toBe(original);
  });
});
