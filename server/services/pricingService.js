import { CustomizationOption } from "../models/CustomizationOption.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * The single source of truth for a line item's price. Never trust a price
 * or price breakdown sent from the client — this recomputes it from the
 * product's current price plus the current priceDelta of each selected
 * customization option, verifying every option actually belongs to this
 * product and is still active.
 */
export async function calculateLineItemPrice(product, customizationOptionIds = []) {
  if (!product.isCustomizable && customizationOptionIds.length > 0) {
    throw ApiError.badRequest(`"${product.name}" is not customizable`);
  }

  let unitPrice = product.price;
  const selections = [];

  if (customizationOptionIds.length > 0) {
    const options = await CustomizationOption.find({
      _id: { $in: customizationOptionIds },
      product: product._id,
      isActive: true,
    });

    if (options.length !== customizationOptionIds.length) {
      throw ApiError.badRequest("One or more selected customization options are invalid or unavailable");
    }

    for (const option of options) {
      unitPrice += option.priceDelta;
      selections.push({ option: option._id, type: option.type, label: option.label, priceDelta: option.priceDelta });
    }
  }

  return { unitPrice, selections };
}
