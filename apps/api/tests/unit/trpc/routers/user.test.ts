import { createApp } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("user tRPC router", () => {
  let originalUrl: string | undefined;

  beforeAll(() => {
    originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  });

  afterAll(() => {
    if (originalUrl !== undefined) {
      process.env.DATABASE_URL = originalUrl;
    } else {
      process.env.DATABASE_URL = undefined;
    }
  });

  const app = createApp();

  describe("user.list", () => {
    it("is reachable and returns a tRPC response", async () => {
      const res = await app.request("/trpc/user.list", { method: "GET" });
      // Will error on DB connect, but route exists (not 404)
      expect(res.status).not.toBe(404);
    });
  });

  describe("user.getById", () => {
    it("validates input — rejects invalid UUID", async () => {
      const res = await app.request(
        "/trpc/user.getById?input=%7B%22json%22%3A%7B%22id%22%3A%22not-a-uuid%22%7D%7D",
        { method: "GET" },
      );
      expect(res.status).toBe(400);
    });
  });
});
