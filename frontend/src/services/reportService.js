import { api } from "../lib/api-client";

export const reportService = {
  createReport: (data) => api.post("/reports", data).then(res => res.data),
};