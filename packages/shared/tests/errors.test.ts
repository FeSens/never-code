import { describe, expect, it } from "vitest";
import { AppError, badRequest, conflict, notFound, unauthorized } from "../src/utils/errors.js";

describe("AppError", () => {
  it("creates error with code and statusCode", () => {
    const err = new AppError("test", "TEST", 418);
    expect(err.message).toBe("test");
    expect(err.code).toBe("TEST");
    expect(err.statusCode).toBe(418);
    expect(err).toBeInstanceOf(Error);
  });
});

describe("error factories", () => {
  it("notFound returns 404", () => {
    const err = notFound("User not found");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("badRequest returns 400", () => {
    const err = badRequest();
    expect(err.statusCode).toBe(400);
  });

  it("unauthorized returns 401", () => {
    const err = unauthorized();
    expect(err.statusCode).toBe(401);
  });

  it("conflict returns 409", () => {
    const err = conflict();
    expect(err.statusCode).toBe(409);
  });
});
