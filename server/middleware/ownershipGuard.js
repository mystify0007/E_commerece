import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Loads a document by req.params[idParam] and verifies req.user owns it via
 * ownerField (e.g. "artisan" or "customer"). Admins bypass the ownership
 * check but not the existence check. Attaches the loaded doc to req[attachAs].
 */
export function loadAndAuthorizeOwner(Model, { idParam = "id", ownerField = "user", attachAs = "resource" } = {}) {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params[idParam]);
    if (!doc) {
      throw ApiError.notFound(`${Model.modelName} not found`);
    }

    if (req.user.role !== "admin") {
      const ownerId = doc[ownerField]?.toString?.() ?? doc[ownerField];
      if (ownerId !== req.user._id.toString()) {
        throw ApiError.forbidden("You do not have access to this resource");
      }
    }

    req[attachAs] = doc;
    next();
  });
}
