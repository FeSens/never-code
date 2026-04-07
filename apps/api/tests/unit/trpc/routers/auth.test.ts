import { createApp } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("auth tRPC router", () => {
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

  describe("auth.register", () => {
    it("validates input — rejects invalid email", async () => {
      const res = await app.request("/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: "bad", name: "Test", password: "password123" } }),
      });
      expect(res.status).toBe(400);
    });

    it("validates input — rejects short password", async () => {
      const res = await app.request("/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: "a@b.com", name: "Test", password: "short" } }),
      });
      expect(res.status).toBe(400);
    });

    it("validates input — rejects empty name", async () => {
      const res = await app.request("/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: "a@b.com", name: "", password: "password123" } }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("auth.login", () => {
    it("validates input — rejects invalid email", async () => {
      const res = await app.request("/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: "bad", password: "password123" } }),
      });
      expect(res.status).toBe(400);
    });

    it("validates input — rejects empty password", async () => {
      const res = await app.request("/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { email: "a@b.com", password: "" } }),
      });
      expect(res.status).toBe(400);
    });
  });
});
