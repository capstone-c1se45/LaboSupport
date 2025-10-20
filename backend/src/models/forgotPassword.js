import {pool} from "../config/mysql.js";
import { createCustomNanoid } from "../untils/nanoid.js";

export const forgotPasswordModel = {
  async createOTP(username, otpCode, expireAt) {
    await pool.query(
      `INSERT INTO ForgotPassword (username, otp_code, expire_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expire_at = VALUES(expire_at)`,
      [username, otpCode, expireAt]
    );
  },

  async verifyOTP(username, otpCode) {
    const [rows] = await pool.query(
      `SELECT * FROM ForgotPassword 
       WHERE username = ? AND otp_code = ? AND expire_at > NOW()`,
      [username, otpCode]
    );
    return rows[0];
  },

  async deleteOTP(username) {
    await pool.query(`DELETE FROM ForgotPassword WHERE username = ?`, [username]);
  },


  async updatePassword(username, hashedPassword) {
    const [result] = await pool.query(
      `UPDATE User SET password_hash = ? WHERE username = ?`,
      [hashedPassword, username]
    );
    return result;
  },
};
