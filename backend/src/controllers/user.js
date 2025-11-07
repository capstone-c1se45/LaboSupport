import bcrypt from "bcryptjs";
import { userModel } from "../models/user.js";
import { nanoidNumbersOnly } from "../utils/nanoid.js";
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
    const normEmail = (email || "").trim().toLowerCase();
    if (!normEmail) return res.status(400).json({ message: "Thiếu email" });

    // Tạo mã OTP 6 chữ số
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verifyCodes.set(normEmail, { code, expires: Date.now() + 5 * 60 * 1000 }); // hết hạn 5 phút

    // HTML email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; padding: 20px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: #0056b3; color: #fff; padding: 15px 20px; font-size: 20px; font-weight: bold;">
            🔒 LaboSupport - Xác nhận Email
          </div>
          <div style="padding: 25px;">
            <p>Xin chào <b>${email}</b>,</p>
            <p>Bạn vừa yêu cầu xác nhận địa chỉ email của mình trên <b>LaboSupport</b>.</p>
            <p style="margin: 20px 0; text-align: center;">
              <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #e8f0fe; color: #1a73e8; padding: 10px 20px; border-radius: 8px;">
                ${code}
              </span>
            </p>
            <p>Mã này sẽ <b>hết hạn sau 5 phút</b>. Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email này.</p>
            <p style="margin-top: 25px; font-size: 13px; color: #888;">Trân trọng,<br>Đội ngũ hỗ trợ LaboSupport 💙</p>
          </div>
        </div>
      </div>
    `;

    try {
      await mailer.sendMail({
        from: `"LaboSupport" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Mã xác nhận đăng ký tài khoản - LaboSupport",
        text: `Mã xác nhận của bạn là: ${code} (hết hạn sau 5 phút)`,
        html: htmlContent,
      });
    } catch (mailErr) {
      console.warn("sendVerifyCode mailer error:", mailErr?.message || mailErr);
    }

    // Echo OTP trong môi trường dev
    const shouldEcho = process.env.NODE_ENV !== "production" || process.env.DEV_ECHO_OTP === "1";
    const payload = { message: "Đã gửi mã xác nhận qua email" };
    if (shouldEcho) payload.code = code;

    res.status(200).json(payload);
  } catch (error) {
    console.error("Error sendVerifyCode:", error);
    res.status(500).json({ message: "Lỗi khi gửi mã xác nhận" });
  }
},



  // ✅ Đăng ký người dùng (chỉ khi mã đúng)
async register(req, res) {
  try {
    const { username, password, full_name, email, phone, role_id, verify_code } = req.body;

    const normEmail = (email || "").trim().toLowerCase();

    // ✅ Kiểm tra xem có mã xác nhận hợp lệ không
    const record = verifyCodes.get(normEmail);
    if (!record || record.code !== verify_code || Date.now() > record.expires) {
      return res.status(400).json({ message: "Mã xác nhận không đúng hoặc đã hết hạn" });
    }

    // 🚨 Kiểm tra username/email đã tồn tại chưa
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username đã tồn tại, vui lòng chọn tên khác" });
    }

    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng, vui lòng chọn email khác" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Tạo user mới
    const newUser = {
      user_id: nanoidNumbersOnly(10),
      username,
      password: hashedPassword,
      full_name,
      email,
      phone,
      role_id: role_id || "1", // mặc định role user
    };

    const created = await userModel.createUser(newUser);

    // Xóa mã xác nhận sau khi đăng ký thành công
    verifyCodes.delete(normEmail);

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

