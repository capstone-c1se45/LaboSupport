import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";
import forgotPasswordRoutes from "./forgotPassword.js";
import adminUserRoutes from "./adminUser.js";
import salaryRoutes from "./salaryRoutes.js"; 
import aiRoutes from "./ai.js";
import contractRoutes from "./contract.js";
import adminReportRoutes from "./adminReport.js";   

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);//route profile
router.use("/forgot-password", forgotPasswordRoutes);//route quên mật khẩu
router.use("/admin/users", adminUserRoutes);//route quản lý user bởi admin
router.use("/salary", salaryRoutes); // route công cụ tính lương Gross, Net
router.use("/ai", aiRoutes); // route AI chat
router.use("/contracts", contractRoutes); // route hợp đồng
router.use("/admin/reports", adminReportRoutes); // route báo cáo admin

export default router;