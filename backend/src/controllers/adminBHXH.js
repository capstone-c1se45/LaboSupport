// src/controllers/adminBHXH.js
import { bhxhHistoryModel } from "../models/bhxhHistory.js";
import { bhxhTuNguyenHistoryModel } from "../models/bhxhTuNguyenHistory.js";

export const adminHistoryController = {
  // ===== BHXH =====
  async getBHXH(req, res) {
    try {
      const data = await bhxhHistoryModel.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Lỗi lấy lịch sử BHXH" });
    }
  },

  async deleteBHXH(req, res) {
    try {
      const { id } = req.params;
      const ok = await bhxhHistoryModel.deleteOne(id);
      if (!ok) return res.status(404).json({ message: "Không tìm thấy bản ghi." });

      res.json({ message: "Xóa bản ghi thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa bản ghi." });
    }
  },

  async deleteAllBHXH(req, res) {
    try {
      await bhxhHistoryModel.deleteAll();
      res.json({ message: "Đã xóa toàn bộ lịch sử BHXH." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa toàn bộ lịch sử." });
    }
  },

  // ===== BHXH Tự Nguyện =====
  async getTuNguyen(req, res) {
    try {
      const data = await bhxhTuNguyenHistoryModel.getAll();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Lỗi lấy lịch sử BHXH tự nguyện" });
    }
  },

  async deleteTuNguyen(req, res) {
    try {
      const { id } = req.params;
      const ok = await bhxhTuNguyenHistoryModel.deleteOne(id);
      if (!ok) return res.status(404).json({ message: "Không tìm thấy bản ghi." });

      res.json({ message: "Xóa bản ghi thành công." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa bản ghi." });
    }
  },

  async deleteAllTuNguyen(req, res) {
    try {
      await bhxhTuNguyenHistoryModel.deleteAll();
      res.json({ message: "Đã xóa toàn bộ lịch sử BHXH tự nguyện." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi xóa toàn bộ lịch sử." });
    }
  }
};
