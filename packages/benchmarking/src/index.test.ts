import { describe, expect, it } from "vitest";

import { runBenchmark } from "./index.js";

describe("benchmarking", () => {
  it("produces benchmark summaries", () => {
    const summary = runBenchmark([
      { id: "sample-1", text: "This is a repetitive sentence. This is a repetitive sentence." },
    ]);

    expect(summary.records).toHaveLength(1);
    expect(summary.averageImprovement).toBeGreaterThanOrEqual(-1);
  });
});
