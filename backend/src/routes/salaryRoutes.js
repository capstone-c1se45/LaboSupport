// routes/salaryRoutes.js
import { Router } from "express";
import { calculateSalary, getHistory, deleteHistory } from "../controllers/salaryController.js";

const router = Router();

router.post("/", calculateSalary);
router.get("/history", getHistory);
router.delete("/history/:id", deleteHistory);
export default router;
