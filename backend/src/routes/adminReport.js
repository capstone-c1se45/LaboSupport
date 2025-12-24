import { Router } from "express";
import { adminReportController } from "../controllers/adminReport.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// Chỉ Admin mới xem được báo cáo
router.get("/", authMiddleware.verifyToken, isAdmin, adminReportController.getReport);

export default router;
