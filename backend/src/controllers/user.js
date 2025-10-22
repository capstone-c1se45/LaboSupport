import bcrypt from "bcryptjs";
import { userModel } from "../models/user.js";
import { nanoidNumbersOnly } from "../untils/nanoid.js";
import { jwtService } from "../config/jwt.js";
import { mailer } from "../config/nodemailer.js";

// Bộ nhớ tạm lưu mã xác thực
const verifyCodes = new Map();

/**
 * Controller xử lý các API liên quan đến người dùng
 */
export const userController = {
  /**
   * Lấy danh sách tất cả người dùng
   */
  async getAllUsers(req, res) {
    try {
      const users = await userModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error getAllUsers:", error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
    }
  },

  /**
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error getUserById:", error);
      res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng" });
    }
  },

  // 📨 Gửi mã xác nhận email
  async sendVerifyCode(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Thiếu email" });

      const code = Math.floor(100000 + Math.random() * 900000).toString(); // mã 6 số
      verifyCodes.set(email, { code, expires: Date.now() + 5 * 60 * 1000 }); // hết hạn 5 phút

      await mailer.sendMail({
        from: `"LaboSupport" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Mã xác nhận đăng ký tài khoản",
        text: `Mã xác nhận của bạn là: ${code} (hết hạn sau 5 phút)`,
      });

      res.status(200).json({ message: "Đã gửi mã xác nhận qua email" });
    } catch (error) {
      console.error("Error sendVerifyCode:", error);
      res.status(500).json({ message: "Lỗi khi gửi mã xác nhận" });
    }
  },



  // ✅ Đăng ký người dùng (chỉ khi mã đúng)
  async register(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id, verify_code } = req.body;

      if (!username || !password || !email || !verify_code)
        return res.status(400).json({ message: "Thiếu thông tin cần thiết" });

      const record = verifyCodes.get(email);
      if (!record || record.code !== verify_code)
        return res.status(400).json({ message: "Mã xác nhận không đúng" });

      if (record.expires < Date.now()) {
        verifyCodes.delete(email);
        return res.status(400).json({ message: "Mã xác nhận đã hết hạn" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        user_id: nanoidNumbersOnly(10),
        username,
        password: hashedPassword,
        full_name,
        email,
        phone,
        role_id: role_id || "1", // mặc định Nhân viên
      };

      const created = await userModel.createUser(newUser);

      verifyCodes.delete(email);
      res.status(201).json({ message: "Đăng ký thành công", user: created });
    } catch (error) {
      console.error("Error register:", error);
      res.status(500).json({ message: "Lỗi khi đăng ký người dùng" });
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await userModel.updateUser(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({ message: "Cập nhật thành công" });
    } catch (error) {
      console.error("Error updateUser:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật người dùng" });
    }
  },

  /**
   * Xóa người dùng
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deleted = await userModel.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.status(200).json({ message: "Xóa người dùng thành công" });
    } catch (error) {
      console.error("Error deleteUser:", error);
      res.status(500).json({ message: "Lỗi khi xóa người dùng" });
    }
  },

  /**
   * Đăng nhập người dùng
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await userModel.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Sai username hoặc password" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Sai username hoặc password" });
      }

      // Tạo token với role
      const token = jwtService.generateToken({
        user_id: user.user_id,
        username: user.username,
        role_id: user.role_id,
        role_name: user.role_name,
      });

      res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role_name || (user.role_id == 2 ? "admin" : "user"),
        },
      });
    } catch (error) {
      console.error("Error login:", error);
      res.status(500).json({ message: "Lỗi khi đăng nhập" });
    }
  },

  async getAllUsersWithProfile() {
    const [rows] = await pool.query(`
    SELECT 
      u.user_id,
      u.username,
      u.full_name,
      u.email,
      u.phone,
      r.role_name
    FROM User u
    LEFT JOIN Role r ON u.role_id = r.role_id
  `);
    return rows;
  } 


};
