import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "INTERNAL_ERROR";
  let details = err.details;

  if (err.name === "ValidationError") {
    // Mongoose schema validation error
    statusCode = 422;
    code = "VALIDATION_ERROR";
    details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([key, val]) => [key, val.message])
    );
    message = "Validation failed";
  } else if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already in use` : "Duplicate value";
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
      ...(env.nodeEnv === "development" && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
}
