import { api } from "./api.js";

export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data.data;
}

export async function loginRequest(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data.data;
}

export async function logoutRequest() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function getMeRequest() {
  const { data } = await api.get("/auth/me");
  return data.data;
}

export async function forgotPasswordRequest(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPasswordRequest(token, password) {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
}

export async function changePasswordRequest(payload) {
  const { data } = await api.patch("/auth/change-password", payload);
  return data;
}
