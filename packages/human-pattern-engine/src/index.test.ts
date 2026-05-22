import { describe, expect, it } from "vitest";

import { applyHumanPatterns } from "./index.js";

describe("human-pattern-engine", () => {
  it("applies combined local transforms", () => {
    const result = applyHumanPatterns("This is a long sentence, and it keeps going, and it needs variation.", { strength: 0.8 });
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.metrics.transformations.length).toBeGreaterThan(0);
  });
});
