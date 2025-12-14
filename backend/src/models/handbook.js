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
      (section_id, law_name, chapter, law_reference, category,law_id ,article_title, chunk_index, content)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.section_id, 
      data.law_name, 
      data.chapter, 
      data.law_reference, 
      data.category, 
      data.law_id,
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
    if (!items || items.length === 0) return;
    const sql = `
      INSERT INTO Handbook_Section 
      (section_id, article_title, chapter, content, law_id, chunk_index, law_name, law_reference, category) 
      VALUES ?
    `;
    const values = items.map(i => [
      i.section_id, 
      i.article_title, 
      i.chapter, 
      i.content, 
      i.law_id,      
      i.chunk_index,
      i.law_name,
      i.law_reference,
      i.category
    ]);
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
 async countAll(search) {
    const searchQuery = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total 
      FROM Handbook_Section  h
      LEFT JOIN laws l ON h.law_id = l.law_id
      WHERE h.article_title LIKE ? OR h.content LIKE ? OR l.code LIKE ?
    `;
    const [rows] = await pool.query(sql, [searchQuery, searchQuery, searchQuery]);
    return rows[0].total;
  },

  // Lấy danh sách (có hỗ trợ tìm kiếm + phân trang)
  async getPaginated(limit, offset, search) {
    const searchQuery = `%${search}%`;
    const sql = `
      SELECT h.*, l.code as law_code, l.summary as law_summary, l.effective_date
      FROM Handbook_Section h
      LEFT JOIN laws l ON h.law_id = l.law_id
      WHERE h.article_title LIKE ? OR h.content LIKE ? OR l.code LIKE ?
      ORDER BY l.code DESC, h.chunk_index ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [searchQuery, searchQuery, searchQuery, limit, parseInt(offset)]);
    return rows;
  },

  async deleteAll() {
    await pool.query("DELETE FROM Handbook_Section"); 
    return true;
  }
};