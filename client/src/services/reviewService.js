import { api } from "./api.js";

export async function createReviewRequest(payload) {
  const { data } = await api.post("/reviews", payload);
  return data.data;
}

export async function listProductReviewsRequest(productId, params) {
  const { data } = await api.get(`/reviews/product/${productId}`, { params });
  return data.data;
}

export async function listArtisanReviewsRequest(artisanId, params) {
  const { data } = await api.get(`/reviews/artisan/${artisanId}`, { params });
  return data.data;
}
