import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";
import { healthRoute } from "./routes/health.js";

export function createApp() {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors());

  app.route("/health", healthRoute);

  app.use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
      createContext,
    }),
  );

  return app;
}

export const app = createApp();
export type App = ReturnType<typeof createApp>;
