import bcrypt from "bcryptjs";
import { userModel } from "../models/user.js";
import { nanoidNumbersOnly } from "../untils/nanoid.js";

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

  /**
   * Tạo người dùng mới
   */
  async createUser(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Thiếu username hoặc password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        user_id: nanoidNumbersOnly(10),
        username,
        password_hash: hashedPassword,
        full_name,
        email,
        phone,
        role_id,
      };

      const created = await userModel.createUser(newUser);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error createUser:", error);
      res.status(500).json({ message: "Lỗi khi tạo người dùng mới" });
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

      res.status(200).json({
        message: "Đăng nhập thành công",
        user: {
          id: user.user_id,
          username: user.username,
          role: user.role_id,
        },
      });
    } catch (error) {
      console.error("Error login:", error);
      res.status(500).json({ message: "Lỗi khi đăng nhập" });
    }
  },
};
