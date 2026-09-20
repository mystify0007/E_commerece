import { ApiError } from "../utils/ApiError.js";

export function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`This action requires role: ${roles.join(" or ")}`));
    }
    next();
  };
}
