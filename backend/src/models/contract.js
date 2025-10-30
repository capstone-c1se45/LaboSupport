import { pool } from "../config/mysql.js";
import { createCustomNanoid } from "../utils/nanoid.js"; 

export const contractModel = {
  /**
   * Tạo bản ghi hợp đồng mới trong DB
   */
  async createContract(userId, filePath, originalName) {
    const contractId = createCustomNanoid('1234567890abcdef', 20); // Tạo ID duy nhất
    try {
      const [result] = await pool.query(
        `INSERT INTO Contract (contract_id, user_id, file_path, original_name, uploaded_at, status)
         VALUES (?, ?, ?, ?, NOW(), 'PENDING')`,
        [contractId, userId, filePath, originalName]
      );
      return { contract_id: contractId, affectedRows: result.affectedRows };
    } catch (error) {
      console.error("Error creating contract record:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hợp đồng của người dùng
   */
  async getContractsByUserId(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT contract_id, user_id, original_name, uploaded_at, status
         FROM Contract
         WHERE user_id = ?
         ORDER BY uploaded_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error fetching user contracts:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết một hợp đồng
   */
  async getContractById(contractId, userId) {
    try {
      const [rows] = await pool.query(
        `SELECT contract_id, user_id, file_path, original_name, uploaded_at, status
         FROM Contract
         WHERE contract_id = ? AND user_id = ?`,
        [contractId, userId]
      );
      return rows[0]; // Trả về null nếu không tìm thấy hoặc không đúng user
    } catch (error) {
      console.error("Error fetching contract details:", error);
      throw error;
    }
  },

   /**
   * Cập nhật trạng thái hợp đồng
   */
  async updateContractStatus(contractId, status) {
     try {
       const [result] = await pool.query(
         `UPDATE Contract SET status = ?, updated_at = NOW() WHERE contract_id = ?`,
         [status, contractId]
       );
       return result.affectedRows > 0;
     } catch (error) {
       console.error("Error updating contract status:", error);
       throw error;
     }
  }
};
