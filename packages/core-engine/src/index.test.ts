import { describe, expect, it } from "vitest";

import { analyzeText, compareTexts, humanizeText } from "./index.js";

describe("core engine", () => {
  const sample = "This is a very repetitive sentence. This is a very repetitive sentence.\n\nIt cites https://example.com and preserves [1].";

  it("analyzes text", () => {
    const result = analyzeText(sample);

    expect(result.score.score).toBeGreaterThanOrEqual(0);
    expect(result.score.score).toBeLessThanOrEqual(1);
    expect(result.preservation.markdownIntegrity).toBe(1);
  });

  it("humanizes text without breaking preservation", () => {
    const result = humanizeText(sample);

    expect(result.outputText).toContain("https://example.com");
    expect(result.outputText).toContain("[1]");
    expect(result.analysis.score.score).toBeGreaterThanOrEqual(0);
  });

  it("compares texts", () => {
    const comparison = compareTexts(sample, "A less repetitive sentence with different wording.");

    expect(comparison.sourceScore.score).toBeGreaterThanOrEqual(0);
    expect(comparison.targetScore.score).toBeGreaterThanOrEqual(0);
  });
});
