import { api } from "./api.js";

export async function getCartRequest() {
  const { data } = await api.get("/cart");
  return data.data;
}

export async function addCartItemRequest(payload) {
  const { data } = await api.post("/cart/items", payload);
  return data.data;
}

export async function updateCartItemRequest(itemId, quantity) {
  const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
  return data.data;
}

export async function removeCartItemRequest(itemId) {
  const { data } = await api.delete(`/cart/items/${itemId}`);
  return data.data;
}
