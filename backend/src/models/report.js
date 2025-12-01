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
 async getAll({ limit, offset, status }) {
    let sql = `
      SELECT r.*, u.username, u.full_name, u.email
      FROM Report r
      LEFT JOIN User u ON r.user_id = u.user_id
    `;
    
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` WHERE r.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  },

  async countAll({ status }) {
    let sql = `SELECT COUNT(*) as total FROM Report`;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ` WHERE status = ?`;
      params.push(status);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },

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