import { api } from "../lib/api-client";

export const adminService = {
  // API cho Dashboard 
  getReports: async () => {
    const response = await api.get("/admin/reports"); 
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/admin/users/search?q=${query}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  getHandbooks: async (query = "") => {
    const url = query ? `/admin/handbooks?q=${query}` : "/admin/handbooks";
    const res = await api.get(url);
    return res.data;
  },
  createHandbook: async (data) => {
    return await api.post("/admin/handbooks", data);
  },
  updateHandbook: async (id, data) => {
    return await api.put(`/admin/handbooks/${id}`, data);
  },
  deleteHandbook: async (id) => {
    return await api.delete(`/admin/handbooks/${id}`);
  }
};