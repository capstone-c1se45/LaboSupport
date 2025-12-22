import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { adminSalaryConfigController } from "../controllers/adminSalaryConfig.js";

const router = Router();

router.use(authMiddleware.verifyToken, isAdmin);

// ===== LƯƠNG TỐI THIỂU VÙNG =====
router.get("/region-wage", adminSalaryConfigController.getRegionWage);
router.put(
  "/region-wage/:region",
  adminSalaryConfigController.updateRegionWage
);

// ===== BẬC THUẾ TNCN =====
router.get("/tax-brackets", adminSalaryConfigController.getTaxBrackets);
router.put("/tax-brackets/:id", adminSalaryConfigController.updateTaxBracket);

export default router;
