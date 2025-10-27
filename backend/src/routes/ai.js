// backend/src/routes/aiRoutes.js
import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/auth.js"; // Import middleware xác thực

const router = Router();

router.post("/chat", authMiddleware.verifyToken, aiController.handleUserChat);
router.get("/chat/history", authMiddleware.verifyToken, aiController.getChatHistory);

// không cần xác thực
// router.post("/guest-chat", aiController.handleGuestChat);

export default router;