import { Router } from "express";
import { adminHandbookController } from "../controllers/adminHandbook.js";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();
// Cấu hình multer để xử lý file upload trong RAM
const upload = multer({ storage: multer.memoryStorage() });
router.use(authMiddleware.verifyToken, isAdmin);

router.get("/", adminHandbookController.getAll);
router.post("/", adminHandbookController.create);
router.post("/import-docx", upload.single("file"), adminHandbookController.importDocx);
router.put("/:id", adminHandbookController.update);
router.delete("/:id", adminHandbookController.delete);

export default router;