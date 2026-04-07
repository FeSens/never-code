import { createApp } from "@/app";
import { describe, expect, it } from "vitest";

describe("Auth tRPC routes (via HTTP)", () => {
  const app = createApp();

  describe("auth.register", () => {
    it("is reachable via tRPC endpoint", async () => {
      // tRPC batch endpoint - just verify the route exists and validates
      const res = await app.request("/trpc/auth.register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { email: "test@test.com", name: "Test", password: "password123" },
        }),
      });
      // Will get a DB error since no DB, but should NOT be 404 (route exists)
      expect(res.status).not.toBe(404);
    });
  });

  describe("auth.login", () => {
    it("is reachable via tRPC endpoint", async () => {
      const res = await app.request("/trpc/auth.login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { email: "test@test.com", password: "password123" },
        }),
      });
      expect(res.status).not.toBe(404);
    });
  });

  describe("auth.me", () => {
    it("is reachable via tRPC endpoint", async () => {
      const res = await app.request("/trpc/auth.me", {
        method: "GET",
      });
      expect(res.status).not.toBe(404);
    });
  });

  describe("auth.logout", () => {
    it("is reachable via tRPC endpoint", async () => {
      const res = await app.request("/trpc/auth.logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: {} }),
      });
      expect(res.status).not.toBe(404);
    });
  });
});
