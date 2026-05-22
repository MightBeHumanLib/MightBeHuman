import { describe, expect, it } from "vitest";

import Page from "./page.js";

describe("web page", () => {
  it("exports a component", () => {
    expect(Page).toBeTypeOf("function");
  });
});
