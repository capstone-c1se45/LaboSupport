// routes/salaryRoutes.js

import { Router } from "express";
import { calculateSalary } from "../controllers/salaryController.js";

const router = Router();
    
router.post("/", calculateSalary);

export default router;
