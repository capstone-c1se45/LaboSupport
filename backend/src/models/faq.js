import { pool } from "../config/mysql.js";

export const faqModel = {
  /**
   * Lấy danh sách tất cả câu hỏi thường gặp
   * @returns {Promise<Array>} Danh sách FAQ
   */
  async getAll() {
    try {
      // Lấy các trường cần thiết, sắp xếp câu mới nhất lên đầu
      const [rows] = await pool.query(
        "SELECT faq_id, question, answer FROM FAQ ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      console.error("Error fetching FAQs from DB:", error);
      throw error;
    }
  }
};