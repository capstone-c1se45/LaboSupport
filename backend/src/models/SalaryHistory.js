// models/SalaryHistory.js
import { pool } from "../config/mysql.js"; // Sử dụng pool từ config/mysql.js như ví dụ

export const salaryHistoryModel = {
  /**
   * Lưu lịch sử tính lương
   * @param {string} type - Loại tính toán ('grossToNet' hoặc 'netToGross')
   * @param {number} salary - Lương đầu vào
   * @param {number} dependents - Số người phụ thuộc
   * @param {string} region - Vùng
   * @param {object} result - Kết quả tính toán
   * @returns {Promise<number>} ID của bản ghi mới
   */
  async save(type, salary, dependents, region, result) {
    try {
      const [rows] = await pool.execute(
        'INSERT INTO salary_history (type, salary, dependents, region, result) VALUES (?, ?, ?, ?, ?)',
        [type, salary, dependents, region, JSON.stringify(result)]
      );
      return rows.insertId; // Trả về ID của bản ghi mới
    } catch (error) {
      console.error("Error saving salary history to DB:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả lịch sử tính lương (tùy chọn, nếu cần)
   * @returns {Promise<Array>} Danh sách lịch sử
   */
  async getAll() {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM salary_history ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      console.error("Error fetching salary history from DB:", error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử theo ID (tùy chọn, nếu cần)
   * @param {number} id - ID của bản ghi
   * @returns {Promise<object|null>} Bản ghi lịch sử hoặc null
   */
  async getById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM salary_history WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching salary history by ID from DB:", error);
      throw error;
    }
  }
};