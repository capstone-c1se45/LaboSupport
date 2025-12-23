import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { adminBhxhPriceIndexController } from "../controllers/adminBhxhPriceIndex.js";

const router = Router();

router.use(authMiddleware.verifyToken, isAdmin);

// Xem tất cả hệ số trượt giá
router.get("/", adminBhxhPriceIndexController.getAll);

// Sửa hệ số theo năm
router.put("/:year", adminBhxhPriceIndexController.update);

export default router;
