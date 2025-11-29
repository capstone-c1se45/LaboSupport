// src/models/bhxhHistory.model.js
import { pool } from "../config/mysql.js";
import { v4 as uuidv4 } from "uuid";

const BhxhHistoryModel = {
  // ➤ Lưu lịch sử tính BHXH
  async createHistory(userId, inputData, resultData) {
    const historyId = uuidv4();

    // Chỉ stringify khi chưa phải string
    const inputJson = typeof inputData === "string" ? inputData : JSON.stringify(inputData);
    const resultJson = typeof resultData === "string" ? resultData : JSON.stringify(resultData);

    await pool.execute(
      `INSERT INTO BHXH_Calculation_History
        (history_id, user_id, input_data, result_data)
       VALUES (?, ?, ?, ?)`,
      [historyId, userId, inputJson, resultJson]
    );

    return historyId;
  },

  // ➤ Lấy danh sách lịch sử (có kèm dữ liệu JSON)
  async getHistoryList(userId) {
    const [rows] = await pool.execute(
      `SELECT history_id, input_data, result_data, created_at
       FROM BHXH_Calculation_History
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Parse JSON luôn để frontend dùng trực tiếp
    return rows.map(row => ({
      history_id: row.history_id,
      inputData: typeof row.input_data === "string" ? JSON.parse(row.input_data) : row.input_data,
      resultData: typeof row.result_data === "string" ? JSON.parse(row.result_data) : row.result_data,
      created_at: row.created_at
    }));
  },

  // ➤ Lấy chi tiết 1 lịch sử
  async getHistoryDetail(historyId, userId) {
    const [rows] = await pool.execute(
      `SELECT *
       FROM BHXH_Calculation_History
       WHERE history_id = ? AND user_id = ?`,
      [historyId, userId]
    );

    if (!rows.length) return null;

    const row = rows[0];
    return {
      history_id: row.history_id,
      inputData: typeof row.input_data === "string" ? JSON.parse(row.input_data) : row.input_data,
      resultData: typeof row.result_data === "string" ? JSON.parse(row.result_data) : row.result_data,
      created_at: row.created_at
    };
  },

  // ➤ Xoá 1 lịch sử
  async deleteHistory(historyId, userId) {
    await pool.execute(
      `DELETE FROM BHXH_Calculation_History
       WHERE history_id = ? AND user_id = ?`,
      [historyId, userId]
    );
  },

  // ➤ Xoá toàn bộ lịch sử
  async deleteAllHistory(userId) {
    await pool.execute(
      `DELETE FROM BHXH_Calculation_History
       WHERE user_id = ?`,
      [userId]
    );
  }
};

export default BhxhHistoryModel;
