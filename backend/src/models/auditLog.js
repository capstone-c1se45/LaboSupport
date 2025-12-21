import { pool } from "../config/mysql.js";
import { nanoidNumbersOnly } from "../utils/nanoid.js";

export const auditLogModel = {
  // 1. Hàm ghi log (Dùng chung cho toàn hệ thống)
  async create({ user_id, action, details }) {
    try {
      const log_id = nanoidNumbersOnly(10);
      const sql = `INSERT INTO Audit_Log (log_id, user_id, action, details) VALUES (?, ?, ?, ?)`;
      await pool.execute(sql, [log_id, user_id, action, details]);
      return true;
    } catch (error) {
      console.error("Lỗi ghi Audit Log:", error);
      // Không throw error để tránh làm crash luồng chính của user
      return false;
    }
  },

  // 2. Hàm đếm tổng log (Phục vụ phân trang Admin)
  async countAll(search = "") {
    let sql = `
      SELECT COUNT(*) as total 
      FROM Audit_Log a
      LEFT JOIN User u ON a.user_id = u.user_id
    `;
    let params = [];
    
    if (search) {
      sql += ` WHERE u.username LIKE ? OR a.action LIKE ? OR a.details LIKE ?`;
      const s = `%${search}%`;
      params = [s, s, s];
    }
    
    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },

  // 3. Hàm lấy danh sách log (Có phân trang & Search)
  async getPaginated(limit, offset, search = "") {
    let sql = `
      SELECT a.*, u.username, u.full_name, u.role_id
      FROM Audit_Log a
      LEFT JOIN User u ON a.user_id = u.user_id
    `;
    let params = [];

    if (search) {
      sql += ` WHERE u.username LIKE ? OR a.action LIKE ? OR a.details LIKE ?`;
      const s = `%${search}%`;
      params = [s, s, s];
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, parseInt(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  }
};