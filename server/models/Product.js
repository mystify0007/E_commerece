import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    artisan: { type: Schema.Types.ObjectId, ref: "Artisan", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    brand: { type: String, trim: true },
    material: { type: String, required: true, trim: true },
    colors: [{ type: String, trim: true }],
    sizesAvailable: [{ type: Number, min: 15, max: 55 }],
    soleType: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String, required: true }],
    condition: { type: String, enum: ["new"], default: "new" },
    isHandmade: { type: Boolean, default: true },
    isCustomizable: { type: Boolean, default: false },
    productionTimeDays: { type: Number, min: 0, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
    },
    rejectionReason: { type: String, trim: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ status: 1, category: 1, price: 1 });
productSchema.index({ artisan: 1, status: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema);
