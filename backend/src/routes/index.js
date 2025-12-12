import { Router } from "express";
import user from "./user.js";
import profileRoutes from "./profile.js";
import forgotPasswordRoutes from "./forgotPassword.js";
import adminUserRoutes from "./adminUser.js";
import salaryRoutes from "./salaryRoutes.js"; 
import aiRoutes from "./ai.js";
import contractRoutes from "./contract.js";
import adminReportRoutes from "./adminReport.js";   
import adminHandbookRoutes from "./adminHandbook.js";
import bhxhRoutes from "./bhxh.js"; 
import bhxhTuNguyenRoutes from "./bhxhTuNguyen.js";
import reportRouter from "./reportRoutes.js";
import adminHistoryRoutes from "./adminBHXH.js";

const router = Router();

router.use("/users", user);
router.use("/profile", profileRoutes);//route profile
router.use("/forgot-password", forgotPasswordRoutes);//route quên mật khẩu
router.use("/admin/users", adminUserRoutes);//route quản lý user bởi admin
router.use("/salary", salaryRoutes); // route công cụ tính lương Gross, Net
router.use("/ai", aiRoutes); // route AI chat
router.use("/contracts", contractRoutes); // route hợp đồng
router.use("/admin/reports", adminReportRoutes); // route báo cáo admin
router.use("/admin/handbooks", adminHandbookRoutes); // route quản lý cẩm nang pháp luật bởi admin
router.use("/bhxh", bhxhRoutes); // route công cụ tính BHXH một lần
router.use("/bhxh", bhxhTuNguyenRoutes); // route công cụ tính BHXH tự nguyện
router.use("/reports", reportRouter); // route báo cáo
router.use("/admin/history", adminHistoryRoutes);// Route Lịch sử BHXH bởi Admin

export default router;