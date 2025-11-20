import { Router } from "express";
import auth from "../middlewares/auth.js";

import {
  calculateSalary,
  getSalaryHistory,
  deleteSalaryHistory,
  deleteAllSalaryHistory,
} from "../controllers/salaryController.js";

const router = Router();

// Tính lương
router.post("/", auth.verifyToken, calculateSalary);

// Lấy lịch sử user
router.get("/history", auth.verifyToken, getSalaryHistory);

// Xóa 1 lịch sử
router.delete("/history/:id", auth.verifyToken, deleteSalaryHistory);

// Xóa toàn bộ lịch sử
router.delete("/history", auth.verifyToken, deleteAllSalaryHistory);

export default router;
