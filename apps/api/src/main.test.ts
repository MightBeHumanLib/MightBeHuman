import { describe, expect, it } from "vitest";

import { createApp } from "./main.js";

describe("api app", () => {
  it("serves health and analysis endpoints", async () => {
    const app = createApp();

    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: "ok" });

    const analysis = await app.inject({
      method: "POST",
      url: "/v1/analyze",
      payload: {
        text: "This is a test sentence. This is a test sentence.",
      },
    });

    expect(analysis.statusCode).toBe(200);
    expect(analysis.json()).toHaveProperty("score");

    await app.close();
  });
});
