import { jwtService } from "../config/jwt.js";

export const authMiddleware = {
  // Kiểm tra token hợp lệ
  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token hoặc token không hợp lệ" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwtService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = decoded; // gán thông tin user vào req
    next();
  },

  // Kiểm tra quyền admin
  isAdmin(req, res, next) {
    if (req.user.role_id !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  },
};
