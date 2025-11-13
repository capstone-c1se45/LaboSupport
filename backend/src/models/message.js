import { pool } from '../config/mysql.js';
import { nanoid } from '../utils/nanoid.js';

export const messageModel = {
   
    // Tạo tin nhắn mới trong cuộc trò chuyện
    async create(conversationId, role, content) {
    const messageId = nanoid();
    try {
      await pool.query(
        'INSERT INTO Message (message_id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
        [messageId, conversationId, role, content]
      );
      return { message_id: messageId, role, content };
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  },
 
  // Lấy tất cả tin nhắn trong một cuộc trò chuyện
  async getByConversationId(conversationId) {
    try {
      const [rows] = await pool.query(
        'SELECT role, content, created_at FROM Message WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId]
      );
      return rows;
    } catch (error) {
      console.error("Error getting messages by conversation:", error);
      throw error;
    }
  }

}