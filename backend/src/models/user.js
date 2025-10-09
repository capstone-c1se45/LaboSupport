import bcrypt from "bcryptjs";
import { nanoidNumbersOnly } from "../untils/nanoid.js";
import { pool } from "../config/mysql.js";

export const userModel = {
  /**
   * 🔹 Lấy thông tin một người dùng theo ID
   * @param {string} userId - ID người dùng
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE user_id = ?",
      [userId]
    );
    return rows.length ? rows[0] : null;
  },

  /**
   * 🔹 Lấy tất cả người dùng (có join role)
   */
  async getAllUsers() {
    const [rows] = await pool.query(
      `SELECT u.*, r.role_name 
       FROM User u 
       LEFT JOIN Role r ON u.role_id = r.role_id`
    );
    return rows;
  },

  /**
   * 🔹 Tạo mới người dùng
   * @param {Object} data - thông tin người dùng
   */
  async createUser(data) {
    const id = nanoidNumbersOnly(12); // ví dụ sinh ID số dài 12 ký tự
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [result] = await pool.query(
      `INSERT INTO User (user_id, username, password_hash, full_name, email, phone, role_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, data.username, hashedPassword, data.full_name, data.email, data.phone, data.role_id]
    );

    return { user_id: id, affectedRows: result.affectedRows };
  },

  /**
   * 🔹 Cập nhật thông tin người dùng
   */
  async updateUser(userId, updates) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === "password") {
        const hashed = await bcrypt.hash(value, 10);
        fields.push("password_hash = ?");
        values.push(hashed);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE User SET ${fields.join(", ")} WHERE user_id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  /**
   * 🔹 Xóa người dùng
   */
  async deleteUser(userId) {
    const [result] = await pool.query(
      "DELETE FROM User WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  },

  async getUserByUsername(username) {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE username = ? AND is_active = TRUE",
      [username]
    );
    return rows[0] || null;
  },

  /**
   * 🔹 Kiểm tra đăng nhập
   */
  async checkLogin(username, password) {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE username = ? AND is_active = TRUE",
      [username]
    );
    if (!rows.length) return null;

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    return isMatch ? user : null;
  },
};
