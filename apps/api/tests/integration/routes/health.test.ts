import { createApp } from "@/app";
import { describe, expect, it } from "vitest";

describe("GET /health", () => {
  const app = createApp();

  it("returns ok status", async () => {
    const res = await app.request("/health");
    const body = (await res.json()) as { status: string; timestamp: string };

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
  });
});
