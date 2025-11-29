import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  tinhBHXHTuNguyenController,
  getHistoryList,
  getHistoryDetail,
  deleteHistory,
  deleteAllHistory
} from "../controllers/bhxhTuNguyen.js";

const router = Router();

// Tính BHXH tự nguyện
router.post("/tu-nguyen", auth.verifyToken, tinhBHXHTuNguyenController);

// Lấy lịch sử
router.get("/tu-nguyen/history", auth.verifyToken, getHistoryList);

// Lấy chi tiết
router.get("/tu-nguyen/history/:id", auth.verifyToken, getHistoryDetail);

// Xóa 1 lịch sử
router.delete("/tu-nguyen/history/:id", auth.verifyToken, deleteHistory);

// Xóa toàn bộ lịch sử
router.delete("/tu-nguyen/history", auth.verifyToken, deleteAllHistory);

export default router;
