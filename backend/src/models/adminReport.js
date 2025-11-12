// src/models/adminReport.js
import { pool } from "../config/mysql.js";

export const adminReportModel = {
  // Tổng quan người dùng
  async getUserOverview() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(is_active = 1) AS active_users,
        SUM(is_active = 0) AS inactive_users
      FROM User
    `);
    return rows[0];
  },

  // Phân bố theo vai trò
  async getUserByRole() {
    const [rows] = await pool.query(`
      SELECT 
        r.role_name,
        COUNT(u.user_id) AS total
      FROM Role r
      LEFT JOIN User u ON u.role_id = r.role_id
      GROUP BY r.role_name
    `);
    return rows;
  },

  // Số người dùng theo tháng (dựa trên created_at)
  async getUserByMonth() {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS total_users
      FROM User
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);
    return rows;
  },

  // Thống kê giới tính
  async getUserByGender() {
    const [rows] = await pool.query(`
      SELECT 
        gender,
        COUNT(*) AS total
      FROM User_Profile
      WHERE gender IS NOT NULL
      GROUP BY gender
    `);
    return rows;
  },

  // Thống kê nghề nghiệp
  async getUserByOccupation() {
    const [rows] = await pool.query(`
      SELECT 
        occupation,
        COUNT(*) AS total
      FROM User_Profile
      WHERE occupation IS NOT NULL
      GROUP BY occupation
      ORDER BY total DESC
      LIMIT 10
    `);
    return rows;
  },

  // phân bố địa lý (address)
  async getUserByAddress() {
    const [rows] = await pool.query(`
      SELECT 
        address,
        COUNT(*) AS total
      FROM User_Profile
      WHERE address IS NOT NULL
      GROUP BY address
      ORDER BY total DESC
      LIMIT 10
    `);
    return rows;
  },
};
