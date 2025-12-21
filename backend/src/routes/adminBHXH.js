import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { adminHistoryController } from "../controllers/adminBHXH.js";

const router = Router();

router.use(authMiddleware.verifyToken, isAdmin);

// ===== BHXH ======
router.get("/bhxh", adminHistoryController.getBHXH);
router.delete("/bhxh/:id", adminHistoryController.deleteBHXH);
router.delete("/bhxh", adminHistoryController.deleteAllBHXH);

// ===== BHXH Tự Nguyện ======
router.get("/tunguyen", adminHistoryController.getTuNguyen);
router.delete("/tunguyen/:id", adminHistoryController.deleteTuNguyen);
router.delete("/tunguyen", adminHistoryController.deleteAllTuNguyen);

export default router;
