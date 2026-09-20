import mongoose from "mongoose";

const { Schema } = mongoose;

const customizationOptionSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["style", "color", "material", "sole", "personalization"],
      required: true,
    },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    priceDelta: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customizationOptionSchema.index({ product: 1, type: 1, isActive: 1 });

export const CustomizationOption = mongoose.model("CustomizationOption", customizationOptionSchema);
