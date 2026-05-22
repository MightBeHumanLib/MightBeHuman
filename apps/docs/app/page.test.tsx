import { describe, expect, it } from "vitest";

import Page from "./page.js";

describe("docs page", () => {
  it("exports a component", () => {
    expect(Page).toBeTypeOf("function");
  });
});
