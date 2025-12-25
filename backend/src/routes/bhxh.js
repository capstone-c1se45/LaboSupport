import { Router } from "express";
import auth from "../middlewares/auth.js";
import {
  tinhBHXHController,
  getHistoryList,
  getHistoryDetail,
  deleteHistory,
  deleteAllHistory,
  createHistory
} from "../controllers/bhxh.js";

const router = Router();

// Tính BHXH một lần
router.post("/mot-lan", auth.verifyToken, tinhBHXHController);

// Lưu lịch sử tính BHXH một lần
router.post("/mot-lan/history", auth.verifyToken, createHistory);

// Lấy lịch sử user
router.get("/mot-lan/history", auth.verifyToken, getHistoryList);

// Xem chi tiết 1 lịch sử
router.get("/mot-lan/history/:id", auth.verifyToken, getHistoryDetail);

// Xóa 1 lịch sử
router.delete("/mot-lan/history/:id", auth.verifyToken, deleteHistory);

// Xóa toàn bộ lịch sử
router.delete("/mot-lan/history", auth.verifyToken, deleteAllHistory);

export default router;
