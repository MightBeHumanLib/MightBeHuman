import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.{test,spec}.{ts,tsx}", "apps/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
    },
  },
  resolve: {
    alias: {
      "@mightbehuman/config-system": resolve(__dirname, "packages/config-system/src/index.ts"),
      "@mightbehuman/plugin-sdk": resolve(__dirname, "packages/plugin-sdk/src/index.ts"),
      "@mightbehuman/tokenizer": resolve(__dirname, "packages/tokenizer/src/index.ts"),
      "@mightbehuman/markdown-preserver": resolve(__dirname, "packages/markdown-preserver/src/index.ts"),
      "@mightbehuman/citation-preserver": resolve(__dirname, "packages/citation-preserver/src/index.ts"),
      "@mightbehuman/semantic-preservation": resolve(__dirname, "packages/semantic-preservation/src/index.ts"),
      "@mightbehuman/rhythm-engine": resolve(__dirname, "packages/rhythm-engine/src/index.ts"),
      "@mightbehuman/stylometry-engine": resolve(__dirname, "packages/stylometry-engine/src/index.ts"),
      "@mightbehuman/entropy-engine": resolve(__dirname, "packages/entropy-engine/src/index.ts"),
      "@mightbehuman/scoring-engine": resolve(__dirname, "packages/scoring-engine/src/index.ts"),
      "@mightbehuman/mutation-pipeline": resolve(__dirname, "packages/mutation-pipeline/src/index.ts"),
      "@mightbehuman/core-engine": resolve(__dirname, "packages/core-engine/src/index.ts"),
      "@mightbehuman/detector-lab": resolve(__dirname, "packages/detector-lab/src/index.ts"),
      "@mightbehuman/benchmarking": resolve(__dirname, "packages/benchmarking/src/index.ts"),
    },
  },
});
