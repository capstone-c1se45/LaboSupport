import axios from "axios";

// Minimal Axios client for the app
// Uses Vite env var VITE_API_BASE_URL (e.g. http://localhost:3000/api)
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

// You can extend with interceptors later if needed.
