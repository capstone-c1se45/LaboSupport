import { Router } from "express";
import { profileController } from "../controllers/profile.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateProfile } from "../middlewares/validateProfile.js"; 

const router = Router();

router.get("/", authMiddleware.verifyToken, profileController.getProfile);
router.put("/", authMiddleware.verifyToken, profileController.updateProfile);

export default router;
