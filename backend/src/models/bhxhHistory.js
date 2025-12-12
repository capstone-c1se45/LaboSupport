// src/models/bhxhHistory.js
import { pool } from "../config/mysql.js";

export const bhxhHistoryModel = {
  // Lấy toàn bộ lịch sử BHXH
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM BHXH_Calculation_History ORDER BY created_at DESC");
    return rows;
  },

  // Lấy lịch sử theo user
  async getByUser(user_id) {
    const [rows] = await pool.query(
      "SELECT * FROM BHXH_Calculation_History WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    return rows;
  },

  // Xóa 1 bản ghi
  async deleteOne(history_id) {
    const [result] = await pool.query(
      "DELETE FROM BHXH_Calculation_History WHERE history_id = ?",
      [history_id]
    );
    return result.affectedRows > 0;
  },

  // Xóa toàn bộ lịch sử
  async deleteAll() {
    await pool.query("DELETE FROM BHXH_Calculation_History");
    return true;
  }
};
