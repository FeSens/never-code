import { AppError } from "@never-code/shared";
import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      return c.json(
        { error: { code: error.code, message: error.message } },
        error.statusCode as 400,
      );
    }

    console.error("Unhandled error:", error);
    return c.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, 500);
  }
}
