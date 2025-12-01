import { reportModel } from "../models/report.js";

export const reportController = {
  // User gửi báo cáo
  async createReport(req, res) {
    try {
      const { category, description } = req.body;
      const user_id = req.user?.user_id || null; 

      if (!category || !description) {
        return res.status(400).json({ message: "Vui lòng chọn loại và nhập nội dung." });
      }

      await reportModel.create({ user_id, category, description });
      res.status(201).json({ message: "Gửi báo cáo thành công! Cảm ơn đóng góp của bạn." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi gửi báo cáo." });
    }
  },

  // Admin lấy danh sách
  async getAllReports(req, res) {
    try {
      const reports = await reportModel.getAll();
      res.json(reports);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server." });
    }
  },

  // Admin cập nhật trạng thái
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await reportModel.updateStatus(id, status);
      res.json({ message: "Đã cập nhật trạng thái." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi cập nhật." });
    }
  },

  // Admin xóa báo cáo
  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      await reportModel.delete(id);
      res.json({ message: "Xóa thành công." });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa." });
    }
  }
};