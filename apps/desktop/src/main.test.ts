import { describe, expect, it } from "vitest";

import { getDesktopWindowOptions, resolveStartUrl } from "./main.js";

describe("desktop shell", () => {
  it("resolves a local start url", () => {
    expect(resolveStartUrl()).toContain("127.0.0.1");
  });

  it("defines secure window defaults", () => {
    const options = getDesktopWindowOptions();

    expect(options.width).toBeGreaterThan(1000);
    expect(options.height).toBeGreaterThan(700);
  });
});
