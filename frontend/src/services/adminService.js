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
  }
};