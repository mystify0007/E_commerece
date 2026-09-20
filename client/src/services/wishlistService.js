import { api } from "./api.js";

export async function getWishlistRequest() {
  const { data } = await api.get("/wishlist");
  return data.data;
}

export async function addToWishlistRequest(productId) {
  const { data } = await api.post(`/wishlist/${productId}`);
  return data.data;
}

export async function removeFromWishlistRequest(productId) {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data.data;
}
