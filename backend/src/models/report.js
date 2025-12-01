import { pool } from "../config/mysql.js";
import { nanoidNumbersOnly } from "../utils/nanoid.js";

export const reportModel = {
  // Tạo báo cáo mới
  async create(data) {
    const report_id = nanoidNumbersOnly(10);
    const sql = `
      INSERT INTO Report (report_id, user_id, category, description, status)
      VALUES (?, ?, ?, ?, 'NEW')
    `;
    await pool.query(sql, [
      report_id, 
      data.user_id || null, 
      data.category, 
      data.description
    ]);
    return { report_id, ...data };
  },

  // Lấy danh sách báo cáo cho Admin dashboard
  async getAll() {
    const sql = `
      SELECT r.*, u.username, u.full_name, u.email
      FROM Report r
      LEFT JOIN User u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Cập nhật trạng thái báo cáo (NEW -> RESOLVED / IGNORED)
  async updateStatus(report_id, status) {
    const sql = `UPDATE Report SET status = ? WHERE report_id = ?`;
    await pool.query(sql, [status, report_id]);
    return true;
  },

  // Xóa báo cáo
  async delete(report_id) {
    await pool.query("DELETE FROM Report WHERE report_id = ?", [report_id]);
    return true;
  }
};