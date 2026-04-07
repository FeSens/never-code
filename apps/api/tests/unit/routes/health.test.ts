import { createApp } from "@/app";
import { describe, expect, it } from "vitest";

describe("health route", () => {
  const app = createApp();

  it("returns ok status with timestamp and uptime", async () => {
    const res = await app.request("/health");
    const body = (await res.json()) as { status: string; timestamp: string; uptime: number };

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeTypeOf("number");
  });

  it("returns services when detailed=true", async () => {
    const res = await app.request("/health?detailed=true");
    const body = (await res.json()) as { services: Record<string, string> };

    expect(res.status).toBe(200);
    expect(body.services).toBeDefined();
    expect(body.services.api).toBe("healthy");
  });

  it("omits services when detailed is not true", async () => {
    const res = await app.request("/health");
    const body = (await res.json()) as Record<string, unknown>;

    expect(body.services).toBeUndefined();
  });
});
