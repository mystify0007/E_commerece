import { api } from "./api.js";

export async function listArtisansRequest(params) {
  const { data } = await api.get("/artisans", { params });
  return data.data;
}

export async function getArtisanRequest(id) {
  const { data } = await api.get(`/artisans/${id}`);
  return data.data;
}

export async function getMyArtisanProfileRequest() {
  const { data } = await api.get("/artisans/me");
  return data.data;
}

export async function updateMyArtisanProfileRequest(payload) {
  const { data } = await api.patch("/artisans/me", payload);
  return data.data;
}
