export class ApiError extends Error {
  constructor(statusCode, message, code = "ERROR", details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Not authenticated") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Not authorized") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static conflict(message) {
    return new ApiError(409, message, "CONFLICT");
  }

  static unprocessable(message, details) {
    return new ApiError(422, message, "UNPROCESSABLE_ENTITY", details);
  }

  static badGateway(message = "Upstream service error") {
    return new ApiError(502, message, "BAD_GATEWAY");
  }
}
