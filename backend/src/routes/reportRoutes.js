import { Router } from "express";
import { reportController } from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// User routes (Yêu cầu đăng nhập để gửi báo cáo để tránh spam)
router.post("/", verifyToken, reportController.createReport);

// Admin routes
router.get("/admin", verifyToken, isAdmin, reportController.getAllReports);
router.put("/admin/:id", verifyToken, isAdmin, reportController.updateStatus);
router.delete("/admin/:id", verifyToken, isAdmin, reportController.deleteReport);

export default router;