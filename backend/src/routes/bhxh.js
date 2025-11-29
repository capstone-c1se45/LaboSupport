import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  tinhBHXHController,
  getHistoryList,
  getHistoryDetail,
  deleteHistory,
  deleteAllHistory
} from "../controllers/bhxh.js";

const router = Router();

// Tính BHXH một lần
router.post("/mot-lan", auth.verifyToken, tinhBHXHController);

// Lấy lịch sử user
router.get("/history", auth.verifyToken, getHistoryList);

// Xem chi tiết 1 lịch sử
router.get("/history/:id", auth.verifyToken, getHistoryDetail);

// Xóa 1 lịch sử
router.delete("/history/:id", auth.verifyToken, deleteHistory);

// Xóa toàn bộ lịch sử
router.delete("/history", auth.verifyToken, deleteAllHistory);

export default router;
