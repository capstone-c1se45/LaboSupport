import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";
import forgotPasswordRoutes from "./forgotPassword.js";
import adminUserRoutes from "./adminUser.js";

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/admin/users", adminUserRoutes);

export default router;