import bcrypt from "bcryptjs";
import { nanoidNumbersOnly } from "../utils/nanoid.js";
import { pool } from "../config/mysql.js";
//Handbook_Section
export const handbook_SectionModel = {
    async getAllHandbook() {
    const [rows] = await pool.query(
      "SELECT * FROM User WHERE Handbook_Section = "
    );
    return rows.length ? rows[0] : null;
  },
//   async createUser(data) {
//     const id = nanoidNumbersOnly(12); // ví dụ sinh ID số dài 12 ký tự

//   const [result] = await pool.query(
//     `INSERT INTO User (user_id, username, password_hash, full_name, email, phone, role_id)
//      VALUES (?, ?, ?, ?, ?, ?, ?)`,
//     [id, data.username, data.password, data.full_name, data.email, data.phone, data.role_id] // password đã được hash sẵn ở controller
//   );

//   return { user_id: id, affectedRows: result.affectedRows };
//   },
// CREATE TABLE IF NOT EXISTS Handbook_Section (
//   section_id CHAR(36) PRIMARY KEY,       -- UUID
//   law_name VARCHAR(200) NOT NULL,        -- "Bộ luật Lao động 2019"
//   chapter VARCHAR(100),                  -- "Chương I"
//   law_reference VARCHAR(100), -- ví dụ: "Điều 14 - Bộ luật Lao động 2019"
//   article_title VARCHAR(255),            -- "Phạm vi điều chỉnh"
//   chunk_index INT DEFAULT 1,             -- Thứ tự đoạn trong điều luật
//   content TEXT NOT NULL,                 -- Nội dung cụ thể
//   category VARCHAR(100),                 -- Tùy chọn (VD: "Quan hệ lao động")
//   created_by CHAR(36),
//   created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//   updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   FOREIGN KEY (created_by) REFERENCES User(user_id)
// );


  async createHandbook(data){
     const adminId = '2'
     const[result] = await pool.query(
        `INSERT INTO Handbook_Section (section_id,law_name, chapter, law_reference, article_title, chunk_index, content,category,created_by)
        VALUES(?,?,?,?,?,?,?,?,?)`,
        [data.section_id, data.law_name, data.chapter, data.law_reference, data.article_title, data.chunk_index, data.content, data.category, adminId]
     );
      return { section_id: data.section_id, affectedRows: result.affectedRows };


  },
}
