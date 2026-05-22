import { describe, expect, it } from "vitest";

import { analyzeGrammarVariance } from "./index.js";

describe("grammar-variance", () => {
  it("reports opener and clause metrics", () => {
    const metrics = analyzeGrammarVariance("Then we move forward. However, we pause.");
    expect(metrics.sentenceCount).toBe(2);
    expect(metrics.openerDiversity).toBeGreaterThan(0);
  });
});
