// src/controllers/adminHandbook.js
import { handbookModel } from "../models/handbook.js";
import { nanoid } from "nanoid"; // Hoặc dùng crypto.randomUUID()

export const adminHandbookController = {
  async getAll(req, res) {
    try {
      const { q } = req.query;
      let data;
      if (q) {
        data = await handbookModel.search(q);
      } else {
        data = await handbookModel.getAll();
      }
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  async create(req, res) {
    try {
      const section_id = nanoid(10); // Tạo ID ngắn gọn
      const newItem = { ...req.body, section_id };
      await handbookModel.create(newItem);
      res.status(201).json({ message: "Thêm thành công", data: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm" });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      await handbookModel.update(id, req.body);
      res.json({ message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật" });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await handbookModel.delete(id);
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa" });
    }
  }
};