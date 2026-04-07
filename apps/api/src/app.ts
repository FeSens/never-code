import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoute } from "./routes/health.js";
import { createContext } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";

export function createApp() {
  const app = new Hono();

  app.use("*", logger());
  app.use("*", cors());

  app.route("/health", healthRoute);

  app.use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
      createContext: (_opts, _c) => createContext(),
    }),
  );

  return app;
}

export const app = createApp();
export type App = ReturnType<typeof createApp>;
