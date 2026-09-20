import mongoose from "mongoose";

const { Schema } = mongoose;

// A regular order can move forward, or be cancelled/refunded from most states.
export const ORDER_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

const shippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "OrderItem", required: true }],
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.keys(ORDER_TRANSITIONS),
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model("Order", orderSchema);
