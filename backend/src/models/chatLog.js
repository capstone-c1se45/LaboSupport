// backend/src/models/chatLog.js
import { pool } from "../config/mysql.js";
import { createCustomNanoid } from "../untils/nanoid.js"; 

export const chatLogModel = {
  /**
   * Lưu log chat vào database
   * @param {string} userId 
   * @param {string} question
   * @param {string} answer 
   * @param {string} source
   * @returns {Promise<object>}
   */
  async createLog(userId, question, answer, source = 'AI_CHAT_LOGGED_IN') {
    const chatId = createCustomNanoid('1234567890abcdef', 16);
    try {
      const [result] = await pool.query(
        `INSERT INTO Chat_Log (chat_id, user_id, question, answer, source, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [chatId, userId, question, answer, source]
      );
      return { chat_id: chatId, affectedRows: result.affectedRows };
    } catch (error) {
      console.error("Error creating chat log:", error);
      throw error; 
    }
  },

  /**
   * Lấy lịch sử chat của một người dùng
   * @param {string} userId 
   * @param {number} limit 
   * @returns {Promise<Array<object>>}
   */
  async getHistoryByUserId(userId, limit = 50) {
    try {
      const [rows] = await pool.query(
        `SELECT chat_id, user_id, question, answer, source, created_at
         FROM Chat_Log
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
      return rows.reverse();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }
};