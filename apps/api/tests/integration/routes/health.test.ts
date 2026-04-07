import { describe, it, expect } from "vitest";
import { createApp } from "@/app";

describe("GET /health", () => {
  const app = createApp();

  it("returns ok status", async () => {
    const res = await app.request("/health");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });
});
