import { auditLogModel } from "../models/auditLog.js";

export const adminAuditLogController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || "";
      const offset = (page - 1) * limit;

      const total = await auditLogModel.countAll(search);
      const items = await auditLogModel.getPaginated(limit, offset, search);

      res.json({
        data: items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server khi tải nhật ký hoạt động." });
    }
  }
};