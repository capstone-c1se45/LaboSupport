import { pool } from "../config/mysql.js";

export const handbookModel = {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM Handbook_Section ORDER BY created_at DESC LIMIT 100");
    return rows;
  },

  async search(keyword) {
    const sql = `
      SELECT * FROM Handbook_Section 
      WHERE law_name LIKE ? OR article_title LIKE ? OR content LIKE ?
      LIMIT 50
    `;
    const searchStr = `%${keyword}%`;
    const [rows] = await pool.query(sql, [searchStr, searchStr, searchStr]);
    return rows;
  },

  async create(data) {
    const sql = `
      INSERT INTO Handbook_Section 
      (section_id, law_name, chapter, law_reference, category, article_title, chunk_index, content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.section_id, 
      data.law_name, 
      data.chapter, 
      data.law_reference, 
      data.category, 
      data.article_title, 
      data.chunk_index || 0, 
      data.content
    ];
    await pool.query(sql, values);
    return data;
  },

  async update(id, data) {
    const sql = `
      UPDATE Handbook_Section 
      SET law_name=?, chapter=?, law_reference=?, category=?, article_title=?, content=?
      WHERE section_id=?
    `;
    await pool.query(sql, [data.law_name, data.chapter, data.law_reference, data.category, data.article_title, data.content, id]);
    return true;
  },

  async delete(id) {
    await pool.query("DELETE FROM Handbook_Section WHERE section_id=?", [id]);
    return true;
  },
  async createMany(items) {
    // Insert nhiều dòng một lúc để tối ưu
    const sql = `INSERT INTO Handbook_Section (section_id, law_name, chapter, law_reference, category, article_title, chunk_index, content) VALUES ?`;
    const values = items.map(i => [i.section_id, i.law_name, i.chapter, i.law_reference, i.category, i.article_title, i.chunk_index, i.content]);
    await pool.query(sql, [values]);
  },

  async countAll() {
    const [rows] = await pool.query("SELECT COUNT(*) as total FROM Handbook_Section");
    return rows[0].total;
  },
// Phân trang
  async getPaginated(limit, offset) {
    const [rows] = await pool.query("SELECT * FROM Handbook_Section ORDER BY chunk_index ASC LIMIT ? OFFSET ?", [limit, offset]);
    return rows;
  }
};