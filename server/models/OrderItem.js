import mongoose from "mongoose";

const { Schema } = mongoose;

const customizationSnapshotSchema = new Schema(
  {
    selections: [
      {
        type: { type: String },
        label: { type: String },
        priceDelta: { type: Number },
      },
    ],
    personalizationText: { type: String, trim: true },
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    // Denormalized so artisan-scoped queries never need to join through Product.
    artisan: { type: Schema.Types.ObjectId, ref: "Artisan", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    size: { type: Number, required: true },
    customizationSnapshot: { type: customizationSnapshotSchema, default: null },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ artisan: 1, createdAt: -1 });

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
