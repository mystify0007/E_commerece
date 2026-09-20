import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateLineItemPrice } from "./pricingService.js";

export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

async function assertPurchasable(product, size) {
  if (!product || product.status !== "approved") {
    throw ApiError.notFound("Product not found");
  }
  if (!product.sizesAvailable.includes(size)) {
    throw ApiError.badRequest(`Size ${size} is not available for this product`);
  }
}

export async function addItemToCart(userId, { product: productId, quantity, size, customizationOptions, personalizationText }) {
  const product = await Product.findById(productId);
  await assertPurchasable(product, size);

  // Validates the selection now so the customer sees an error immediately,
  // even though checkout re-validates authoritatively again.
  await calculateLineItemPrice(product, customizationOptions || []);

  const cart = await getOrCreateCart(userId);
  cart.items.push({
    product: productId,
    quantity,
    size,
    customizationSelections: (customizationOptions || []).map((id) => ({ option: id })),
    personalizationText,
  });
  await cart.save();
  return getCartWithPricing(userId);
}

export async function updateCartItemQuantity(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Cart item not found");
  item.quantity = quantity;
  await cart.save();
  return getCartWithPricing(userId);
}

export async function removeCartItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();
  return getCartWithPricing(userId);
}

export async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
}

// Cart totals here are for DISPLAY only. Checkout recomputes everything
// server-side at order-creation time and never trusts this response.
export async function getCartWithPricing(userId) {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: "items.product",
    select: "name images price stock status isCustomizable sizesAvailable artisan",
    populate: { path: "artisan", select: "shopName" },
  });

  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    if (!item.product || item.product.status !== "approved") {
      items.push({ _id: item._id, unavailable: true, product: item.product });
      continue;
    }
    const optionIds = item.customizationSelections.map((s) => s.option).filter(Boolean);
    const { unitPrice, selections } = await calculateLineItemPrice(item.product, optionIds);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    items.push({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      size: item.size,
      personalizationText: item.personalizationText,
      unitPrice,
      lineTotal,
      selections,
      inStock: item.product.stock >= item.quantity,
    });
  }

  return { _id: cart._id, items, subtotal, itemCount: cart.items.length };
}
