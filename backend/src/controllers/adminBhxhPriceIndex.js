import { bhxhPriceIndexModel } from "../models/bhxhPriceIndex.model.js";

export const adminBhxhPriceIndexController = {
  // Xem toàn bộ hệ số
  async getAll(req, res) {
    try {
      const data = await bhxhPriceIndexModel.getAll();
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  },

  // Sửa / thêm hệ số theo năm
  async update(req, res) {
    try {
      const { year } = req.params;
      const { coefficient } = req.body;

      if (!coefficient) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu coefficient" });
      }

      await bhxhPriceIndexModel.upsert(year, coefficient);

      res.json({
        success: true,
        message: `Đã cập nhật hệ số trượt giá năm ${year}`
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
};
