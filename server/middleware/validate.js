import { ApiError } from "../utils/ApiError.js";

export function validateBody(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        ApiError.unprocessable("Validation failed", result.error.flatten().fieldErrors)
      );
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return function validate(req, res, next) {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(
        ApiError.unprocessable("Invalid query parameters", result.error.flatten().fieldErrors)
      );
    }
    req.validatedQuery = result.data;
    next();
  };
}
