import { pool } from "../config/mysql.js";

export const profileModel = {
  async getUserProfile(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        u.user_id, u.username, u.full_name, u.email, u.phone,
        p.dob, p.gender, p.address, p.occupation
      FROM User u
      LEFT JOIN User_Profile p ON u.user_id = p.user_id
      WHERE u.user_id = ?
      `,
      [userId]
    );
    return rows[0];
  },

  async updateUserProfile(userId, { full_name, phone, dob, gender, address, occupation }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // cập nhật bảng User
      await conn.query(
        `UPDATE User SET full_name = ?, phone = ?, email = COALESCE(?, email) WHERE user_id = ?`,
        [full_name, phone, email || null, userId]
      );

      // kiểm tra đã có profile chưa
      const [existing] = await conn.query(
        `SELECT profile_id FROM User_Profile WHERE user_id = ?`,
        [userId]
      );

      if (existing.length > 0) {
        // cập nhật nếu đã có
        await conn.query(
          `UPDATE User_Profile SET dob = ?, gender = ?, address = ?, occupation = ? WHERE user_id = ?`,
          [dob, gender, address, occupation, userId]
        );
      } else {
        // thêm mới nếu chưa có
        const [idResult] = await conn.query(`SELECT UUID() AS id`);
        const profileId = idResult[0].id;
        await conn.query(
          `INSERT INTO User_Profile (profile_id, user_id, dob, gender, address, occupation)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [profileId, userId, dob, gender, address, occupation]
        );
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      console.error("Update profile failed:", error);
      return false;
    } finally {
      conn.release();
    }
  },
};

