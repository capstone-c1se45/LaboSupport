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
    const sql = `INSERT INTO Handbook_Section (section_id, law_name, chapter, law_reference, category, article_title, chunk_index, content) VALUES ?`;
    const values = items.map(i => [i.section_id, i.law_name, i.chapter, i.law_reference, i.category, i.article_title, i.chunk_index, i.content]);
    await pool.query(sql, [values]);
  },

  // Thêm mới 1 bản ghi
  async create(item) {
    const sql = `INSERT INTO Handbook_Section SET ?`;
    await pool.query(sql, item);
    return item;
  },

  // Cập nhật
  async update(id, data) {
    const sql = `UPDATE Handbook_Section SET ? WHERE section_id = ?`;
    await pool.query(sql, [data, id]);
  },

  // Xóa
  async delete(id) {
    const sql = `DELETE FROM Handbook_Section WHERE section_id = ?`;
    await pool.query(sql, [id]);
  },

  // Đếm tổng (có hỗ trợ tìm kiếm)
  async countAll(search = "") {
    let sql = "SELECT COUNT(*) as total FROM Handbook_Section";
    let params = [];
    if (search) {
      sql += " WHERE article_title LIKE ? OR content LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }
    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  },

  // Lấy danh sách (có hỗ trợ tìm kiếm + phân trang)
  async getPaginated(limit, offset, search = "") {
    let sql = "SELECT * FROM Handbook_Section";
    let params = [];
    
    if (search) {
      sql += " WHERE article_title LIKE ? OR content LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += " ORDER BY chunk_index ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }
};