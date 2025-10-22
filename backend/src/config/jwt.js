import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "skibididopdop";
const JWT_EXPIRES = "1h";

export const jwtService = {
  generateToken(user) {
    return jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        // ✅ Dùng == để nhận cả "2" hoặc 2
        role: user.role_name || (user.role_id == 2 ? "admin" : "user"),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  },
};
