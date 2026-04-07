import { Hono } from "hono";

export const healthRoute = new Hono().get("/", async (c) => {
  const detailed = c.req.query("detailed") === "true";

  const result: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  };

  if (detailed) {
    try {
      // Try to access DB through context - but health route doesn't have tRPC context
      // Just report that the API is running
      result.services = {
        api: "healthy",
      };
    } catch {
      result.services = {
        api: "healthy",
      };
    }
  }

  return c.json(result);
});
