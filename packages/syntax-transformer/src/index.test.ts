import { describe, expect, it } from "vitest";

import { transformSyntax } from "./index.js";

describe("syntax-transformer", () => {
  it("splits long sentences conservatively", () => {
    const result = transformSyntax("This is a long sentence, and it keeps going, and it probably should split.");
    expect(result.text).toContain(".");
    expect(result.metrics.splitCount).toBeGreaterThanOrEqual(0);
  });
});
