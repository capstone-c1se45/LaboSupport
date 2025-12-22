import { salaryConfigModel } from "../models/SalaryConfig.js";
import { clearSalaryConfigCache } from "../services/configService.js";

export const adminSalaryConfigController = {
  // =========================
  // LƯƠNG TỐI THIỂU VÙNG
  // =========================
  async getRegionWage(req, res) {
    try {
      const data = await salaryConfigModel.getAllRegionWage();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Lỗi lấy lương tối thiểu vùng" });
    }
  },

  async updateRegionWage(req, res) {
    try {
      const { region } = req.params;
      const { wage } = req.body;

      if (!wage) {
        return res.status(400).json({ message: "Thiếu wage" });
      }

      const ok = await salaryConfigModel.updateRegionWage(region, wage);
      if (!ok) {
        return res.status(404).json({ message: "Không tìm thấy vùng" });
      }

      clearSalaryConfigCache();
      res.json({ message: "Cập nhật lương vùng thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi cập nhật lương vùng" });
    }
  },

  // =========================
  // BẬC THUẾ TNCN
  // =========================
  async getTaxBrackets(req, res) {
    try {
      const data = await salaryConfigModel.getAllTaxBrackets();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Lỗi lấy bậc thuế TNCN" });
    }
  },

  async createTaxBracket(req, res) {
    try {
      await salaryConfigModel.createTaxBracket(req.body);
      clearSalaryConfigCache();
      res.json({ message: "Thêm bậc thuế thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi thêm bậc thuế" });
    }
  },

  async updateTaxBracket(req, res) {
    try {
      const { id } = req.params;

      const ok = await salaryConfigModel.updateTaxBracket(id, req.body);
      if (!ok) {
        return res.status(404).json({ message: "Không tìm thấy bậc thuế" });
      }

      clearSalaryConfigCache();
      res.json({ message: "Cập nhật bậc thuế thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi cập nhật bậc thuế" });
    }
  },

  async deleteTaxBracket(req, res) {
    try {
      const { id } = req.params;

      const ok = await salaryConfigModel.deleteTaxBracket(id);
      if (!ok) {
        return res.status(404).json({ message: "Không tìm thấy bậc thuế" });
      }

      clearSalaryConfigCache();
      res.json({ message: "Xóa bậc thuế thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi xóa bậc thuế" });
    }
  },
};
