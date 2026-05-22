import { describe, expect, it } from "vitest";

import { runDetectorLab } from "./index.js";

describe("detector lab", () => {
  it("returns detector signals and an overall score", () => {
    const report = runDetectorLab("This is a repetitive sentence. This is a repetitive sentence.");

    expect(report.signals).toHaveLength(4);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(1);
  });
});
