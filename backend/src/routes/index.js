import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";
import forgotPasswordRoutes from "./forgotPassword.js";
import adminUserRoutes from "./adminUser.js";
import salaryRoutes from "./salaryRoutes.js"; 

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);//route profile
router.use("/forgot-password", forgotPasswordRoutes);//route quên mật khẩu
router.use("/admin/users", adminUserRoutes);//route quản lý user bởi admin
router.use("/salary", salaryRoutes); // route công cụ tính lương Gross, Net

export default router;