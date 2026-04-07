import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);

    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      error instanceof Error && "status" in error ? (error as { status: number }).status : 500;

    return c.json({ error: { code: "INTERNAL_ERROR", message } }, status as 500);
  }
}
