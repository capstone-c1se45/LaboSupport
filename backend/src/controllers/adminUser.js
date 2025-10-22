// src/controllers/adminUser.js
import bcrypt from "bcrypt";
import { userModel } from "../models/user.js";
import { profileModel } from "../models/profile.js";

export const adminUserController = {
  // 📋 Lấy danh sách tất cả người dùng
  async getAll(req, res) {
    try {
      const users = await userModel.getAllUsersWithProfile();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error getAll:", error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng." });
    }
  },

  // ➕ Thêm người dùng mới
  async create(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id } = req.body;
      if (!username || !password || !email)
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        username,
        password: hashedPassword,
        full_name,
        email,
        phone,
        role_id: role_id || "user",
      };

      const user = await userModel.createUser(newUser);
      res.status(201).json({ message: "Tạo người dùng thành công.", user });
    } catch (error) {
      console.error("Error create user:", error);
      res.status(500).json({ message: "Lỗi khi tạo người dùng." });
    }
  },

  // ✏️ Cập nhật thông tin hoặc vai trò/mật khẩu
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        password,
        role_id,
        address,
        dob,
        gender,
        occupation,
        ...rest
      } = req.body;

      // chuẩn hoá data user
      const data = { ...rest };
      if (password) data.password = await bcrypt.hash(password, 10);
      if (role_id) data.role_id = role_id;

      // Nếu model có hàm updateUserWithProfile thì dùng luôn (transaction bên model)
      if (typeof userModel.updateUserWithProfile === "function") {
        // gộp toàn bộ payload user + profile
        const merged = {
          ...data,
          address,
          dob,
          gender,
          occupation,
        };
        const ok = await userModel.updateUserWithProfile(id, merged);
        if (!ok) return res.status(404).json({ message: "Không tìm thấy người dùng." });
      } else {
        // fallback: cập nhật bảng User trước rồi xử lý profile tách riêng
        const updatedUser = await userModel.updateUser(id, data);
        if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        if (address || dob || gender || occupation) {
          const existingProfile = await profileModel.getProfileByUserId(id);
          if (existingProfile) {
            await profileModel.updateProfileByUserId(id, { address, dob, gender, occupation });
          } else {
            const profile_id = crypto.randomUUID();
            await profileModel.createProfile({ profile_id, user_id: id, address, dob, gender, occupation });
          }
        }
      }

      return res.status(200).json({ message: "Cập nhật người dùng thành công." });
    } catch (error) {
      console.error("Error update user:", error?.stack || error);
      return res.status(500).json({ message: "Lỗi khi cập nhật người dùng." });
    }
  },

  // ❌ Xóa người dùng
  async delete(req, res) {
    try {
      const { id } = req.params;
      await userModel.deleteUser(id);
      res.json({ message: "Xóa người dùng thành công." });
    } catch (error) {
      console.error("Error delete user:", error);
      res.status(500).json({ message: "Lỗi khi xóa người dùng." });
    }
  },
};
