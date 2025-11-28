import { pool } from "../config/mysql.js"; 
import { v4 as uuidv4 } from "uuid";

export const salaryHistoryModel = {
  save: async (userId, type, salary, insuranceSalary, dependents, region, result) => {
    const historyId = uuidv4();

    const sql = `
      INSERT INTO SalaryHistory
      (history_id, user_id, type, input_salary, insurance_salary, dependents, region, result_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [
      historyId,
      userId,
      type,
      salary,
      insuranceSalary,
      dependents,
      region,
      JSON.stringify(result)
    ]);

    return historyId;
  },

  getByUser: async (userId) => {
    const [rows] = await pool.execute(
      "SELECT * FROM SalaryHistory WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  deleteOne: async (userId, historyId) => {
    const sql = `
      DELETE FROM SalaryHistory 
      WHERE history_id = ? AND user_id = ?
    `;
    const [result] = await pool.execute(sql, [historyId, userId]);
    return result.affectedRows > 0;
  },

  deleteAll: async (userId) => {
    const [res] = await pool.execute(
      "DELETE FROM SalaryHistory WHERE user_id = ?",
      [userId]
    );
    return res.affectedRows;
  }
};
