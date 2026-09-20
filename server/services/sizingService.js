import { Product } from "../models/Product.js";

export const SIZE_DISCLAIMER =
  "This is an estimate based on your measurements. Actual fit can vary by product, material, and manufacturer — check the artisan's notes when in doubt.";

// EU size ≈ 1.5 * foot length (cm) + 2 is a widely used rough approximation
// for adult EU shoe sizing. This is a real, deterministic, documented
// formula — not a fabricated "AI" black box.
function estimateEuSize(footLengthCm) {
  return footLengthCm * 1.5 + 2;
}

export async function recommendSize({ footLengthCm, footWidthCm, preferredFit, product: productId }) {
  let estimate = estimateEuSize(footLengthCm);

  if (footWidthCm) {
    const ratio = footWidthCm / footLengthCm;
    if (ratio > 0.4) estimate += 0.5; // a proportionally wide foot sizes up
  }

  if (preferredFit === "snug") estimate -= 0.5;
  if (preferredFit === "loose") estimate += 0.5;

  const roundedEstimate = Math.round(estimate * 2) / 2; // nearest half size

  let recommendedSize = Math.round(roundedEstimate);
  let availableSizes = null;

  if (productId) {
    const product = await Product.findById(productId);
    if (product && product.sizesAvailable.length > 0) {
      availableSizes = product.sizesAvailable;
      recommendedSize = availableSizes.reduce(
        (closest, size) => (Math.abs(size - roundedEstimate) < Math.abs(closest - roundedEstimate) ? size : closest),
        availableSizes[0]
      );
    }
  }

  return {
    estimatedSize: roundedEstimate,
    recommendedSize,
    availableSizes,
    disclaimer: SIZE_DISCLAIMER,
  };
}
