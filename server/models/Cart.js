import mongoose from "mongoose";

const { Schema } = mongoose;

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    size: { type: Number, required: true },
    customizationSelections: [
      {
        option: { type: Schema.Types.ObjectId, ref: "CustomizationOption" },
        type: { type: String },
        label: { type: String },
        priceDelta: { type: Number },
      },
    ],
    personalizationText: { type: String, trim: true, maxlength: 60 },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
