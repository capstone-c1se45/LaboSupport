import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET=skibididopdop";
const JWT_EXPIRES = "1h"; // token có hiệu lực 1 tiếng

export const jwtService = {
  generateToken(user) {
    return jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role_id: user.role_id,
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
