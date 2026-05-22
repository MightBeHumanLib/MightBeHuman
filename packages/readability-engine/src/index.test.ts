import { describe, expect, it } from "vitest";

import { analyzeReadability } from "./index.js";

describe("readability-engine", () => {
  it("measures sentence and word complexity", () => {
    const metrics = analyzeReadability("A short sentence. Another short sentence.");
    expect(metrics.sentenceCount).toBe(2);
    expect(metrics.wordCount).toBeGreaterThan(0);
  });
});
