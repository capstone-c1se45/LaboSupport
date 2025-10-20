import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";
import forgotPasswordRoutes from "./forgotPassword.js";

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);
router.use("/forgot-password", forgotPasswordRoutes);

export default router;