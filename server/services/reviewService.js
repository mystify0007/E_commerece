import { Review } from "../models/Review.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { Artisan } from "../models/Artisan.js";
import { ApiError } from "../utils/ApiError.js";
import { parsePagination } from "../utils/paginate.js";
import { createNotification } from "./notificationService.js";

async function assertEligible(userId, targetType, targetId, orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.customer.toString() !== userId.toString()) {
    throw ApiError.forbidden("You can only review orders you placed");
  }
  if (order.status !== "delivered") {
    throw ApiError.badRequest("You can only review a product or artisan after the order is delivered");
  }

  const items = await OrderItem.find({ order: order._id });
  const matches =
    targetType === "Product"
      ? items.some((i) => i.product.toString() === targetId)
      : items.some((i) => i.artisan.toString() === targetId);

  if (!matches) {
    throw ApiError.badRequest("This order does not include that product/artisan");
  }
}

async function recalculateRating(targetType, targetId) {
  const [agg] = await Review.aggregate([
    { $match: { targetType, target: targetId, status: "visible" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const ratingAvg = agg ? Math.round(agg.avg * 10) / 10 : 0;
  const ratingCount = agg ? agg.count : 0;

  const Model = targetType === "Product" ? Product : Artisan;
  await Model.findByIdAndUpdate(targetId, { ratingAvg, ratingCount });
}

export async function createReview(userId, payload) {
  const { targetType, target, order, rating, comment } = payload;
  await assertEligible(userId, targetType, target, order);

  const existing = await Review.findOne({ author: userId, target, order });
  if (existing) {
    throw ApiError.conflict("You have already reviewed this for this order");
  }

  const review = await Review.create({
    author: userId,
    targetType,
    target,
    order,
    rating,
    comment,
    isVerifiedPurchase: true,
  });

  await recalculateRating(targetType, target);

  if (targetType === "Product") {
    const product = await Product.findById(target).populate("artisan", "user");
    if (product) {
      await createNotification({
        user: product.artisan.user,
        type: "review",
        title: "New product review",
        message: `Your product "${product.name}" received a ${rating}-star review.`,
        relatedEntityType: "Product",
        relatedEntity: product._id,
      });
    }
  } else {
    const artisan = await Artisan.findById(target);
    if (artisan) {
      await createNotification({
        user: artisan.user,
        type: "review",
        title: "New shop review",
        message: `Your shop received a ${rating}-star review.`,
        relatedEntityType: "Artisan",
        relatedEntity: artisan._id,
      });
    }
  }

  return review;
}

export async function listReviewsForTarget(targetType, targetId, { page, limit }) {
  const { skip, limit: pageLimit, page: p } = parsePagination({ page, limit });
  const query = { targetType, target: targetId, status: "visible" };

  const [items, total] = await Promise.all([
    Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageLimit).populate("author", "name avatarUrl"),
    Review.countDocuments(query),
  ]);

  return { items, total, page: p, limit: pageLimit };
}

export async function moderateReview(reviewId, status) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  review.status = status;
  await review.save();
  await recalculateRating(review.targetType, review.target);
  return review;
}
