import { userModel } from "../models/user.js";
import { forgotPasswordModel } from "../models/forgotPassword.js";
import { mailer } from "../config/nodemailer.js"; // sửa import
import { nanoidNumbersOnly } from "../utils/nanoid.js";
import bcrypt from "bcrypt";
import { validator } from "../utils/validator.js";

export const forgotPasswordController = {
  // 📩 Gửi mã OTP
  async requestOTP(req, res) {
    try {
      const { username } = req.body;

      const user = await userModel.getUserByUsername(username);
      if (!user || !user.email) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng hoặc email." });
      }

      // Tạo mã OTP 6 số
      const otp = nanoidNumbersOnly().substring(0, 6);
      const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      await forgotPasswordModel.createOTP(username, otp, expireAt);

      // ✅ Dùng mailer thay vì nodemailerConfig
      await mailer.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Mã OTP đặt lại mật khẩu",
        text: `Mã OTP của bạn là: ${otp}. Hết hạn sau 5 phút.`,
      });

      res.json({ message: "Đã gửi mã OTP đến email của bạn." });
    } catch (err) {
      console.error("Lỗi gửi OTP:", err);
      res.status(500).json({ message: "Lỗi gửi mã OTP." });
    }
  },

  // ✅ Xác thực mã OTP
  async verifyOTP(req, res) {
    try {
      const { username, otp } = req.body;
      const record = await forgotPasswordModel.verifyOTP(username, otp);
      if (!record)
        return res
          .status(400)
          .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });

      res.json({ message: "Xác thực OTP thành công." });
    } catch (err) {
      console.error("Lỗi verify OTP:", err);
      res.status(500).json({ message: "Lỗi xác thực OTP." });
    }
  },

  // 🔑 Đặt lại mật khẩu
  async resetPassword(req, res) {
    try {
      const { username, otp, newPassword } = req.body;

      const record = await forgotPasswordModel.verifyOTP(username, otp);
      if (!record)
        return res
          .status(400)
          .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });

      const hashed = await bcrypt.hash(newPassword, 10);
    await forgotPasswordModel.updatePassword(username, hashed);
      await forgotPasswordModel.deleteOTP(username);

      res.json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
      console.error("Lỗi reset mật khẩu:", err);
      res.status(500).json({ message: "Lỗi đổi mật khẩu." });
    }
  },
};
