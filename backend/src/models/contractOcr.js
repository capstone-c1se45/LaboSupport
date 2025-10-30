import { pool } from "../config/mysql.js";
import { createCustomNanoid } from "../utils/nanoid.js";

export const contractOcrModel = {
  /**
   * Lưu kết quả OCR và phân tích vào DB
   */
  async saveOcrResult(contractId, extractedText, summary) {
    const ocrId = createCustomNanoid('1234567890abcdef', 20); // Tạo ID duy nhất
    try {
      const [result] = await pool.query(
        `INSERT INTO Contract_OCR (ocr_id, contract_id, extracted_text, summary, processed_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE extracted_text = VALUES(extracted_text), summary = VALUES(summary), processed_at = NOW()`,
        [ocrId, contractId, extractedText, summary]
      );
      return { ocr_id: ocrId, affectedRows: result.affectedRows };
    } catch (error) {
      console.error("Error saving OCR result:", error);
      throw error;
    }
  },

  /**
   * Lấy kết quả OCR theo contractId
   */
  async getOcrResultByContractId(contractId) {
    try {
      const [rows] = await pool.query(
        `SELECT ocr_id, contract_id, extracted_text, summary, processed_at
         FROM Contract_OCR
         WHERE contract_id = ?`,
        [contractId]
      );
      return rows[0]; // Trả về null nếu chưa có kết quả
    } catch (error) {
      console.error("Error fetching OCR result:", error);
      throw error;
    }
  },
};
