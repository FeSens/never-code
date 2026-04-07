import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 4000;

console.info(`API server starting on port ${port}`);

serve({ fetch: app.fetch, port });
