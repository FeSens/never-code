import { errorHandler } from "@/middleware/error-handler";
import { AppError } from "@never-code/shared";
import type { Context, Next } from "hono";
import { describe, expect, it, vi } from "vitest";

function mockContext() {
  const json = vi.fn().mockReturnValue(new Response());
  return { json } as unknown as Context;
}

describe("errorHandler", () => {
  it("catches AppError and returns structured JSON with status code", async () => {
    const c = mockContext();
    const next: Next = vi.fn().mockRejectedValue(new AppError("Not found", "NOT_FOUND", 404));

    await errorHandler(c, next);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Not found" } },
      404,
    );
  });

  it("catches unknown errors and returns 500", async () => {
    const c = mockContext();
    const next: Next = vi.fn().mockRejectedValue(new Error("unexpected"));

    await errorHandler(c, next);

    expect(c.json).toHaveBeenCalledWith(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      500,
    );
  });

  it("calls next and passes through on success", async () => {
    const c = mockContext();
    const next: Next = vi.fn().mockResolvedValue(undefined);

    await errorHandler(c, next);

    expect(next).toHaveBeenCalled();
    expect(c.json).not.toHaveBeenCalled();
  });
});
