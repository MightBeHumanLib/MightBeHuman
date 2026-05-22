import { describe, expect, it } from "vitest";

import { analyzePunctuationVariance, mutatePunctuation } from "./index.js";

describe("punctuation-variance", () => {
  it("tracks punctuation and normalizes spacing", () => {
    const metrics = analyzePunctuationVariance("Hello,world!");
    expect(metrics.punctuationCount).toBeGreaterThan(0);
    expect(mutatePunctuation("Hello,world!")).toContain("Hello, world!");
  });
});
