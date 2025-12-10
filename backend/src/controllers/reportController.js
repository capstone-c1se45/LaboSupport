import { reportModel } from "../models/report.js";
import { userModel } from "../models/user.js";
export const reportController = {
  // User gửi báo cáo
  async createReport(req, res) {
    try {
      const { category, description } = req.body;
      const user =  await userModel.getUserById(req.user.user_id);
      const user_id = req.user?.user_id || null; 

      console.log('Creating report from user:', user);

      if (!category || !description) {
        return res.status(400).json({ message: "Vui lòng chọn loại và nhập nội dung." });
      }

      reportModel.create({ user_id, category, description });

      const socketPayload = {
        username: user?.username || null,
        full_name: user?.full_name || null,
        email: user?.email || null,
        created_at: new Date().toISOString(),
        category: category,
        description: description,
        status: 'NEW'
      };

      if (req.io) {
        req.io.to('admin-room').emit('report:new', socketPayload);
      }

      res.status(201).json({ message: "Gửi báo cáo thành công! Cảm ơn đóng góp của bạn." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi gửi báo cáo." });
    }
  },

  // Admin lấy danh sách
  async getAllReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || 'ALL';
      const offset = (page - 1) * limit;

      const [reports, total] = await Promise.all([
        reportModel.getAll({ limit, offset, status }),
        reportModel.countAll({ status })
      ]);

      res.json({
        data: reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
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
  async getAllReportsByUser(req, res) {
    try {
      const user_id = req.user?.user_id;
      if (!user_id) {
        return res.status(401).json({ message: "Unauthorized" });
      } 
      const reports = await reportModel.getReportsByUserId(user_id);
      res.json({ data: reports });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi lấy báo cáo của bạn." });
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