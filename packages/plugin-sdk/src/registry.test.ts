import { describe, expect, it } from "vitest";

import { PluginRegistry } from "./registry.js";

const context = {
  manifest: { name: "host", version: "1.0.0", engine: "core" },
  logger: console,
} as const;

describe("plugin registry", () => {
  it("registers and runs plugins", () => {
    const registry = new PluginRegistry();

    registry.registerMutation({
      manifest: { name: "mutate-a", version: "1.0.0", engine: "core" },
      mutate: (input) => `${input} mutated`,
    });

    registry.registerValidation({
      manifest: { name: "validate-a", version: "1.0.0", engine: "core" },
      validate: (input) => (input.length > 0 ? [] : ["empty"]),
    });

    registry.registerDetector({
      manifest: { name: "detect-a", version: "1.0.0", engine: "core" },
      detect: () => 0.25,
    });

    registry.registerScoring({
      manifest: { name: "score-a", version: "1.0.0", engine: "core" },
      score: () => 0.75,
    });

    expect(registry.snapshot().mutation).toHaveLength(1);
    expect(registry.mutate("hello", context)).toBe("hello mutated");
    expect(registry.validate("hello", context)).toEqual([]);
    expect(registry.detect("hello", context)).toBe(0.25);
    expect(registry.score("hello", context)).toBe(0.75);
  });
});
