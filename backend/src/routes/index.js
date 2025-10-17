import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);

export default router;