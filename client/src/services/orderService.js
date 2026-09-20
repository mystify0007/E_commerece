import { api } from "./api.js";

export async function createOrderRequest(payload) {
  const { data } = await api.post("/orders", payload);
  return data.data;
}

export async function getMyOrdersRequest(params) {
  const { data } = await api.get("/orders/me", { params });
  return data.data;
}

export async function getOrderRequest(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
}

export async function getArtisanOrderItemsRequest(params) {
  const { data } = await api.get("/orders/artisan/mine", { params });
  return data.data;
}

export async function updateOrderStatusRequest(id, status) {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data.data;
}
