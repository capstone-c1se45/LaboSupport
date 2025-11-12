// src/controllers/adminReport.js
import { adminReportModel } from "../models/adminReport.js";

export const adminReportController = {
  async getReport(req, res) {
    try {
      const [
        overview,
        byRole,
        byMonth,
        byGender,
        byOccupation,
        byAddress,
      ] = await Promise.all([
        adminReportModel.getUserOverview(),
        adminReportModel.getUserByRole(),
        adminReportModel.getUserByMonth(),
        adminReportModel.getUserByGender(),
        adminReportModel.getUserByOccupation(),
        adminReportModel.getUserByAddress(),
      ]);

      res.status(200).json({
        overview,
        byRole,
        byMonth,
        byGender,
        byOccupation,
        byAddress,
      });
    } catch (error) {
      console.error("Error getReport:", error);
      res.status(500).json({ message: "Lỗi khi lấy báo cáo admin." });
    }
  },
};
