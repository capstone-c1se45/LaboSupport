import { Router } from "express";
import { adminAuditLogController } from "../controllers/adminAuditLog.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

router.get("/", authMiddleware.verifyToken, isAdmin, adminAuditLogController.getAll);

export default router;