import { pool } from "../config/mysql.js";

export const bhxhPriceIndexModel = {
  async getAll() {
    const [rows] = await pool.query(
      "SELECT year, coefficient FROM bhxh_price_index"
    );
    return Object.fromEntries(
      rows.map(r => [r.year, Number(r.coefficient)])
    );
  },

  async getByYear(year) {
    const [rows] = await pool.query(
      "SELECT year, coefficient FROM bhxh_price_index WHERE year = ?",
      [year]
    );
    return rows[0];
  },

  async upsert(year, coefficient) {
    await pool.query(
      `INSERT INTO bhxh_price_index (year, coefficient)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE coefficient = VALUES(coefficient)`,
      [year, coefficient]
    );
  }
};
