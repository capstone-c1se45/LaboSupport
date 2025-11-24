import { Router } from "express";
import { adminHandbookController } from "../controllers/adminHandbook.js";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

router.use(authMiddleware.verifyToken, isAdmin);

router.get("/", adminHandbookController.getAll);
router.post("/", adminHandbookController.create);
router.put("/:id", adminHandbookController.update);
router.delete("/:id", adminHandbookController.delete);

export default router;