// backend/src/routes/aiRoutes.js
import { Router } from "express";
import { contractController } from "../controllers/contractController.js";
import { authMiddleware } from "../middlewares/auth.js"; // Import middleware xác thực

const router = Router();

router.use(authMiddleware.verifyToken);

// POST /api/contracts/upload - Upload file hợp đồng
router.post("/upload", contractController.uploadContract);

router.post("/upload-multi", contractController.uploadMultiContracts);


// POST /api/contracts/analyze-images - Upload và phân tích ảnh hợp đồng
router.post("/analyze-images", contractController.analyzeContractImages);


// GET /api/contracts - Lấy danh sách hợp đồng của người dùng
router.get("/", contractController.listContracts);

// GET /api/contracts/:id - Lấy chi tiết hợp đồng và kết quả phân tích
router.get("/:id", contractController.getContractDetails);

// POST /api/contracts/:id/analyze - Kích hoạt phân tích hợp đồng
router.post("/:id/analyze", contractController.analyzeContract);

export default router;