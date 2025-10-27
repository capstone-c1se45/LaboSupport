import axios from "axios";

// Minimal Axios client for the app
// Uses Vite env var VITE_API_BASE_URL (e.g. http://localhost:3000/api)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// Attach token from storage if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  } catch {}
  return config;
});

export function logout() {
  try {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  } catch {}
}
