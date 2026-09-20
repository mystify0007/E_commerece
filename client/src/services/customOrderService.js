import { api } from "./api.js";

export async function createCustomOrderRequest(payload) {
  const { data } = await api.post("/custom-orders", payload);
  return data.data;
}

export async function uploadCustomOrderImagesRequest(files) {
  const formData = new FormData();
  for (const file of files) formData.append("images", file);
  const { data } = await api.post("/custom-orders/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.urls;
}

export async function getMyCustomOrdersRequest(params) {
  const { data } = await api.get("/custom-orders/me", { params });
  return data.data;
}

export async function getArtisanCustomOrderInboxRequest(params) {
  const { data } = await api.get("/custom-orders/artisan/inbox", { params });
  return data.data;
}

export async function getCustomOrderRequest(id) {
  const { data } = await api.get(`/custom-orders/${id}`);
  return data.data;
}

export async function createProposalRequest(customOrderId, payload) {
  const { data } = await api.post(`/custom-orders/${customOrderId}/proposals`, payload);
  return data.data;
}

export async function respondToProposalRequest(proposalId, payload) {
  const { data } = await api.patch(`/custom-orders/proposals/${proposalId}`, payload);
  return data.data;
}

export async function updateProductionStageRequest(customOrderId, stage) {
  const { data } = await api.patch(`/custom-orders/${customOrderId}/stage`, { stage });
  return data.data;
}
