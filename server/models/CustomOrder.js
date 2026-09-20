import mongoose from "mongoose";

const { Schema } = mongoose;

export const PRODUCTION_STAGES = [
  "request_submitted",
  "design_review",
  "proposal_sent",
  "customer_approved",
  "material_preparation",
  "crafting",
  "quality_check",
  "ready_for_shipment",
  "shipped",
  "delivered",
];

// Stages a production order may move to from a given stage (linear + terminal exits).
export const STAGE_TRANSITIONS = {
  request_submitted: ["design_review", "rejected", "cancelled"],
  design_review: ["proposal_sent", "rejected", "cancelled"],
  proposal_sent: ["customer_approved", "rejected", "cancelled"],
  customer_approved: ["material_preparation", "cancelled"],
  material_preparation: ["crafting", "cancelled"],
  crafting: ["quality_check", "cancelled"],
  quality_check: ["ready_for_shipment", "crafting"],
  ready_for_shipment: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  rejected: [],
  cancelled: [],
};

const customOrderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetArtisan: { type: Schema.Types.ObjectId, ref: "Artisan", default: null },
    shoeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    footMeasurements: {
      lengthCm: { type: Number, min: 0 },
      widthCm: { type: Number, min: 0 },
    },
    preferredColor: { type: String, trim: true },
    material: { type: String, trim: true },
    sole: { type: String, trim: true },
    designDescription: { type: String, required: true, trim: true, maxlength: 3000 },
    budget: { type: Number, min: 0 },
    requiredDate: { type: Date },
    referenceImages: [{ type: String }],
    status: {
      type: String,
      enum: [...PRODUCTION_STAGES, "rejected", "cancelled"],
      default: "request_submitted",
    },
    acceptedProposal: { type: Schema.Types.ObjectId, ref: "CustomProposal", default: null },
    convertedOrder: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

customOrderSchema.index({ customer: 1, status: 1 });
customOrderSchema.index({ targetArtisan: 1, status: 1 });

export const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
