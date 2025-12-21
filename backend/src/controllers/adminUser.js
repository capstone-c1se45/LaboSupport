import bcrypt from "bcrypt";
import { userModel } from "../models/user.js";
import { profileModel } from "../models/profile.js";
import { validator } from "../utils/validator.js"; // import validator

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

    // 🔍 Tìm kiếm người dùng theo tên hoặc ID
  async search(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim() === "") {
        return res.status(400).json({ message: "Vui lòng nhập từ khóa tìm kiếm." });
      }

      const users = await userModel.searchUsers(q.trim());
      if (!users.length) {
        return res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
      }

      res.status(200).json(users);
    } catch (error) {
      console.error("Error search user:", error);
      res.status(500).json({ message: "Lỗi khi tìm kiếm người dùng." });
    }
  },

  // ➕ Thêm người dùng mới
  async create(req, res) {
    try {
      const { username, password, full_name, email, phone, role_id } = req.body;

      // ✅ Validate cơ bản
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email không hợp lệ." });
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.",
        });
      }

      if (phone && !validator.isValidPhone(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
      }

      // 🚨 Kiểm tra username hoặc email đã tồn tại chưa
      const existingUser = await userModel.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username đã tồn tại." });
      }

      const existingEmail = await userModel.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email đã được sử dụng." });
      }

      // ✅ Nếu qua hết → tạo mới
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
        email,
        phone,
        full_name,
        ...rest
      } = req.body;

      // ✅ Validate
      if (email && !validator.isEmail(email)) {
        return res.status(400).json({ message: "Email không hợp lệ." });
      }

      if (phone && !validator.isValidPhone(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
      }

      if (dob && !validator.isValidDate(dob)) {
        return res
          .status(400)
          .json({ message: "Ngày sinh không hợp lệ hoặc lớn hơn hiện tại." });
      }

      if (gender && !validator.isValidGender(gender)) {
        return res.status(400).json({ message: "Giới tính không hợp lệ." });
      }

      if (full_name && !validator.isValidName(full_name)) {
        return res.status(400).json({ message: "Tên không hợp lệ." });
      }

      if (password && !validator.isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.",
        });
      }

      // 🚨 Kiểm tra email bị trùng (nếu admin đổi email)
      if (email) {
        const existingEmail = await userModel.getUserByEmail(email);
        if (existingEmail && existingEmail.user_id !== id) {
          return res.status(400).json({ message: "Email đã được sử dụng." });
        }
      }

      // ✅ Chuẩn hoá data
      const data = { ...rest };
      if (password) data.password = await bcrypt.hash(password, 10);
      if (role_id) data.role_id = role_id;
      if (email) data.email = email;
      if (phone) data.phone = phone;
      if (full_name) data.full_name = full_name;

      // ✅ Cập nhật
      if (typeof userModel.updateUserWithProfile === "function") {
        const merged = {
          ...data,
          address,
          dob,
          gender,
          occupation,
        };
        const ok = await userModel.updateUserWithProfile(id, merged);
        if (!ok)
          return res
            .status(404)
            .json({ message: "Không tìm thấy người dùng." });
      } else {
        const updatedUser = await userModel.updateUser(id, data);
        if (!updatedUser)
          return res
            .status(404)
            .json({ message: "Không tìm thấy người dùng." });

        if (address || dob || gender || occupation) {
          const existingProfile = await profileModel.getProfileByUserId(id);
          if (existingProfile) {
            await profileModel.updateProfileByUserId(id, {
              address,
              dob,
              gender,
              occupation,
            });
          } else {
            const profile_id = crypto.randomUUID();
            await profileModel.createProfile({
              profile_id,
              user_id: id,
              address,
              dob,
              gender,
              occupation,
            });
          }
        }
      }

      return res
        .status(200)
        .json({ message: "Cập nhật người dùng thành công." });
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
