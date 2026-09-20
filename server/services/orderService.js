import mongoose from "mongoose";
import { Order, ORDER_TRANSITIONS } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { Cart } from "../models/Cart.js";
import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { calculateLineItemPrice } from "./pricingService.js";
import { initiatePayment } from "./paymentService/index.js";
import { createNotification } from "./notificationService.js";

const FLAT_SHIPPING_FEE = 150;

export async function createOrderFromCart(userId, { shippingAddress, paymentProvider }) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest("Your cart is empty");
  }

  const session = await mongoose.startSession();
  try {
    let order;
    let paymentRedirect = null;

    await session.withTransaction(async () => {
      let subtotal = 0;
      const itemDrafts = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product).session(session);
        if (!product || product.status !== "approved") {
          throw ApiError.badRequest("One of the items in your cart is no longer available");
        }
        if (product.stock < cartItem.quantity) {
          throw ApiError.conflict(`Not enough stock for "${product.name}" (only ${product.stock} left)`);
        }
        if (!product.sizesAvailable.includes(cartItem.size)) {
          throw ApiError.badRequest(`Size ${cartItem.size} is no longer available for "${product.name}"`);
        }
        if (product.colors.length > 0 && !product.colors.includes(cartItem.color)) {
          throw ApiError.badRequest(`Color "${cartItem.color}" is no longer available for "${product.name}"`);
        }

        const optionIds = cartItem.customizationSelections.map((s) => s.option).filter(Boolean);
        const { unitPrice, selections } = await calculateLineItemPrice(product, optionIds);
        const lineTotal = unitPrice * cartItem.quantity;
        subtotal += lineTotal;

        itemDrafts.push({ product, cartItem, unitPrice, selections, lineTotal });

        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: cartItem.quantity } },
          { $inc: { stock: -cartItem.quantity } },
          { session, new: true }
        );
        if (!updated) {
          throw ApiError.conflict(`Stock for "${product.name}" changed — please review your cart and try again`);
        }
      }

      const total = subtotal + FLAT_SHIPPING_FEE;

      const [createdOrder] = await Order.create(
        [{ customer: userId, items: [], shippingAddress, subtotal, shippingFee: FLAT_SHIPPING_FEE, total, status: "pending" }],
        { session }
      );

      const orderItemDocs = await OrderItem.create(
        itemDrafts.map(({ product, cartItem, unitPrice, selections, lineTotal }) => ({
          order: createdOrder._id,
          product: product._id,
          artisan: product.artisan,
          quantity: cartItem.quantity,
          unitPrice,
          size: cartItem.size,
          color: cartItem.color,
          customizationSnapshot:
            selections.length > 0 || cartItem.personalizationText
              ? { selections, personalizationText: cartItem.personalizationText }
              : null,
          lineTotal,
        })),
        { session }
      );

      createdOrder.items = orderItemDocs.map((i) => i._id);
      await createdOrder.save({ session });

      const paymentResult = await initiatePayment(createdOrder, paymentProvider, session);
      paymentRedirect = paymentResult.redirect;

      cart.items = [];
      await cart.save({ session });

      order = createdOrder;
    });

    const artisanIds = [...new Set((await OrderItem.find({ order: order._id })).map((i) => i.artisan.toString()))];
    await Promise.all(
      artisanIds.map(async (artisanId) => {
        const artisan = await Artisan.findById(artisanId);
        if (artisan) {
          await createNotification({
            user: artisan.user,
            type: "new_order",
            title: "New order received",
            message: `You have a new order (#${order._id.toString().slice(-6)}).`,
            relatedEntityType: "Order",
            relatedEntity: order._id,
          });
        }
      })
    );

    const result = await getOrderById(order._id, { _id: userId, role: "customer" });
    return { ...result, paymentRedirect };
  } finally {
    await session.endSession();
  }
}

export async function getMyOrders(userId, { page, limit }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const [items, total] = await Promise.all([
    Order.find({ customer: userId }).sort({ createdAt: -1 }).skip(skip).limit(pageLimit),
    Order.countDocuments({ customer: userId }),
  ]);
  return { items, total, page: p, limit: pageLimit };
}

export async function getOrderById(orderId, requester) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  const isOwner = order.customer.toString() === requester._id.toString();
  const isAdmin = requester.role === "admin";

  let items = await OrderItem.find({ order: order._id }).populate("product", "name images").populate("artisan", "shopName");

  if (!isOwner && !isAdmin) {
    if (requester.role !== "artisan") throw ApiError.forbidden("You do not have access to this order");
    const artisan = await Artisan.findOne({ user: requester._id });
    const mine = items.filter((i) => artisan && i.artisan._id.toString() === artisan._id.toString());
    if (mine.length === 0) throw ApiError.forbidden("You do not have access to this order");
    items = mine; // artisans only ever see their own line items, never another artisan's
  }

  return { ...order.toObject(), items };
}

export async function getArtisanOrderItems(userId, { page, limit }) {
  const artisan = await Artisan.findOne({ user: userId });
  if (!artisan) throw ApiError.notFound("Artisan profile not found");

  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const [items, total] = await Promise.all([
    OrderItem.find({ artisan: artisan._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .populate("product", "name images")
      .populate({ path: "order", select: "status shippingAddress createdAt total" }),
    OrderItem.countDocuments({ artisan: artisan._id }),
  ]);

  return { items, total, page: p, limit: pageLimit };
}

export async function updateOrderStatus(orderId, status, requester) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  const isOwner = order.customer.toString() === requester._id.toString();
  const isAdmin = requester.role === "admin";
  let isSellerOnOrder = false;

  if (!isOwner && !isAdmin && requester.role === "artisan") {
    const artisan = await Artisan.findOne({ user: requester._id });
    isSellerOnOrder = artisan && (await OrderItem.exists({ order: order._id, artisan: artisan._id }));
  }

  if (!isAdmin && !isOwner && !isSellerOnOrder) {
    throw ApiError.forbidden("You do not have access to this order");
  }
  if (isOwner && !isAdmin && status !== "cancelled") {
    throw ApiError.forbidden("Customers may only cancel an order");
  }

  const allowedNext = ORDER_TRANSITIONS[order.status] || [];
  if (!isAdmin && !allowedNext.includes(status)) {
    throw ApiError.badRequest(`Cannot move order from "${order.status}" to "${status}"`);
  }

  order.status = status;
  await order.save();

  await createNotification({
    user: order.customer,
    type: "order_status_change",
    title: "Order status updated",
    message: `Your order (#${order._id.toString().slice(-6)}) is now "${status}".`,
    relatedEntityType: "Order",
    relatedEntity: order._id,
  });

  return order;
}
