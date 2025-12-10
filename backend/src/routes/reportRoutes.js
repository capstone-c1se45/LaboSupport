import { Router } from "express";
import { reportController } from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// User routes (Yêu cầu đăng nhập để gửi báo cáo để tránh spam)
router.post("/", authMiddleware.verifyToken, reportController.createReport);

// Admin routes
router.get("/admin", authMiddleware.verifyToken, isAdmin, reportController.getAllReports);
router.put("/admin/:id", authMiddleware.verifyToken, isAdmin, reportController.updateStatus);
router.delete("/admin/:id", authMiddleware.verifyToken, isAdmin, reportController.deleteReport);
router.get("/my", authMiddleware.verifyToken, reportController.getAllReportsByUser);

export default router;