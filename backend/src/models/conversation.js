import { pool } from "../config/mysql.js";
import { nanoidNumbersOnly, nanoid } from "../utils/nanoid.js";


export const conversationModel = {

    // Tạo cuộc trò chuyện mới
    async create(userId, title) {
    const conversationId = nanoid(); // Tạo ID mới
    try {
      await pool.query(
        'INSERT INTO Conversation (conversation_id, user_id, title) VALUES (?, ?, ?)',
        [conversationId, userId, title]
      );
      return { conversation_id: conversationId, title: title };
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  // Lấy tất cả cuộc trò chuyện của người dùng
  async getByUserId(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT conversation_id, title, updated_at FROM Conversation WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting conversations by user:", error);
      throw error;
    }
  },

  // Cập nhật thời gian cập nhật của cuộc trò chuyện(sau khi có tin nhắn mới)
  async updateTimestamp(conversationId) {
    try {
      await pool.query(
        'UPDATE Conversation SET updated_at = NOW() WHERE conversation_id = ?',
        [conversationId]
      );
    } catch (error) {
      console.error("Error updating conversation timestamp:", error);
      throw error;
    }
  },

  // Xóa cuộc trò chuyện
  async deleteById(conversationId, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM Conversation WHERE conversation_id = ? AND user_id = ?',
        [conversationId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },
  // Lấy cuộc trò chuyện theo ID và user ID
  async getById(conversationId, userId) {
     try {
      const [rows] = await pool.query(
        'SELECT * FROM Conversation WHERE conversation_id = ? AND user_id = ?',
        [conversationId, userId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error getting conversation by id:", error);
      throw error;
    }
  }
}