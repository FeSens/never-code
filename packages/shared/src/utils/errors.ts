export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Not found"): AppError {
  return new AppError(message, "NOT_FOUND", 404);
}

export function badRequest(message = "Bad request"): AppError {
  return new AppError(message, "BAD_REQUEST", 400);
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(message, "UNAUTHORIZED", 401);
}

export function conflict(message = "Conflict"): AppError {
  return new AppError(message, "CONFLICT", 409);
}
