import { pool } from "../config/mysql.js";
import { nanoidNumbersOnly } from "../utils/nanoid.js";

export const lawModel = {
  // Tìm luật theo số hiệu (Code)
  async findByCode(code) {
    const [rows] = await pool.execute("SELECT * FROM laws WHERE code = ?", [code]);
    return rows[0] || null;
  },

  // Tạo luật mới
  async create({ code, summary, effective_date, created_by }) {
    const law_id = nanoidNumbersOnly(10);
    const sql = `INSERT INTO laws (law_id, code, summary, effective_date, created_by) VALUES (?, ?, ?, ?, ?)`;
    await pool.execute (sql, [law_id, code, summary, effective_date]);
    return { law_id, code, summary, effective_date, created_by };
  },
  
  // Lấy tất cả luật 
  async getAll() {
    const [rows] = await pool.execute("SELECT * FROM laws ORDER BY created_at DESC");
    return rows;
  }
};