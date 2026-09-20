import { api } from "./api.js";

export async function getForYouRequest() {
  const { data } = await api.get("/recommendations/for-you");
  return data.data;
}

export async function getWishlistBasedRequest() {
  const { data } = await api.get("/recommendations/wishlist-based");
  return data.data;
}

export async function getPopularRequest() {
  const { data } = await api.get("/recommendations/popular");
  return data.data;
}
