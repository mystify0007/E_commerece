import { api } from "./api.js";

export async function getDashboardStatsRequest() {
  const { data } = await api.get("/admin/dashboard");
  return data.data;
}

export async function listUsersRequest(params) {
  const { data } = await api.get("/admin/users", { params });
  return data.data;
}

export async function updateUserStatusRequest(id, status) {
  const { data } = await api.patch(`/admin/users/${id}/status`, { status });
  return data.data;
}

export async function listArtisansAdminRequest(params) {
  const { data } = await api.get("/admin/artisans", { params });
  return data.data;
}

export async function listProductsAdminRequest(params) {
  const { data } = await api.get("/admin/products", { params });
  return data.data;
}

export async function verifyArtisanRequest(id, payload) {
  const { data } = await api.patch(`/artisans/${id}/verify`, payload);
  return data.data;
}

export async function moderateProductRequest(id, payload) {
  const { data } = await api.patch(`/products/${id}/moderate`, payload);
  return data.data;
}

export async function createCategoryRequest(payload) {
  const { data } = await api.post("/categories", payload);
  return data.data;
}

export async function updateCategoryRequest(id, payload) {
  const { data } = await api.patch(`/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategoryRequest(id) {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
}
