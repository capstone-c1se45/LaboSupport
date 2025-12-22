// models/SalaryConfig.js
import { pool } from "../config/mysql.js";

export const salaryConfigModel = {
  // =========================
  // USER – DÙNG CHO CALCULATOR
  // =========================
  async getRegionMinWage() {
    const [rows] = await pool.query(
      "SELECT region_code, wage FROM region_min_wage"
    );

    return Object.fromEntries(
      rows.map(r => [r.region_code, r.wage])
    );
  },

  async getTaxBrackets() {
    const [rows] = await pool.query(
      `
      SELECT min_income, max_income, rate
      FROM tax_brackets
      ORDER BY sort_order
      `
    );
    return rows;
  },

  // =========================
  // ADMIN – QUẢN LÝ CẤU HÌNH
  // =========================

  // ----- LƯƠNG TỐI THIỂU VÙNG -----
  async getAllRegionWage() {
    const [rows] = await pool.query(
      "SELECT region_code, wage FROM region_min_wage ORDER BY region_code"
    );
    return rows;
  },

  async updateRegionWage(region_code, wage) {
    const [result] = await pool.query(
      "UPDATE region_min_wage SET wage = ? WHERE region_code = ?",
      [wage, region_code]
    );
    return result.affectedRows > 0;
  },

  // ----- BẬC THUẾ TNCN -----
  async getAllTaxBrackets() {
    const [rows] = await pool.query(
      `
      SELECT id, min_income, max_income, rate, sort_order
      FROM tax_brackets
      ORDER BY sort_order
      `
    );
    return rows;
  },

  async createTaxBracket(data) {
    const { min_income, max_income, rate, sort_order } = data;

    await pool.query(
      `
      INSERT INTO tax_brackets (min_income, max_income, rate, sort_order)
      VALUES (?, ?, ?, ?)
      `,
      [min_income, max_income ?? null, rate, sort_order]
    );
  },

  async updateTaxBracket(id, data) {
    const { min_income, max_income, rate, sort_order } = data;

    const [result] = await pool.query(
      `
      UPDATE tax_brackets
      SET min_income = ?, max_income = ?, rate = ?, sort_order = ?
      WHERE id = ?
      `,
      [min_income, max_income ?? null, rate, sort_order, id]
    );

    return result.affectedRows > 0;
  },

  async deleteTaxBracket(id) {
    const [result] = await pool.query(
      "DELETE FROM tax_brackets WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};
