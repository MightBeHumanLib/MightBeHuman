import { describe, expect, it } from "vitest";

import { transformDiscourse } from "./index.js";

describe("discourse-transformer", () => {
  it("adds a transition to later paragraphs when needed", () => {
    const result = transformDiscourse("First paragraph.\n\nSecond paragraph.", { strength: 1 });
    expect(result.text).toContain("In practice,");
  });
});
