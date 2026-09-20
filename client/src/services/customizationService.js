import { api } from "./api.js";

export async function listOptionsRequest(productId) {
  const { data } = await api.get(`/customizations/product/${productId}`);
  return data.data;
}

export async function listOwnedOptionsRequest(productId) {
  const { data } = await api.get(`/customizations/product/${productId}/mine`);
  return data.data;
}

export async function createOptionRequest(productId, payload) {
  const { data } = await api.post(`/customizations/product/${productId}`, payload);
  return data.data;
}

export async function updateOptionRequest(id, payload) {
  const { data } = await api.patch(`/customizations/${id}`, payload);
  return data.data;
}

export async function deleteOptionRequest(id) {
  const { data } = await api.delete(`/customizations/${id}`);
  return data;
}
