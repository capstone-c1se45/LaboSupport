import { pool } from "../config/mysql.js";

export const profileModel = {
  async getUserProfile(userId) {
    const [rows] = await pool.query(
      `SELECT user_id, username, full_name, email, phone FROM User WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  },

  async updateUserProfile(userId, { full_name, phone }) {
    const [result] = await pool.query(
      `UPDATE User SET full_name = ?, phone = ? WHERE user_id = ?`,
      [full_name, phone, userId]
    );
    return result.affectedRows > 0;
  },
};
