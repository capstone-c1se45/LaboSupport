// src/models/bhxhTuNguyenHistory.js
import { pool } from "../config/mysql.js";

export const bhxhTuNguyenHistoryModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM BHXH_TuNguyen_History ORDER BY created_at DESC");
    return rows;
  },

  async getByUser(user_id) {
    const [rows] = await pool.query(
      "SELECT * FROM BHXH_TuNguyen_History WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );
    return rows;
  },

  async deleteOne(history_id) {
    const [result] = await pool.query(
      "DELETE FROM BHXH_TuNguyen_History WHERE history_id = ?",
      [history_id]
    );
    return result.affectedRows > 0;
  },

  async deleteAll() {
    await pool.query("DELETE FROM BHXH_TuNguyen_History");
    return true;
  }
};
