    import { Router } from "express";
    import { forgotPasswordController } from "../controllers/forgotPassword.js";

    const router = Router();

    router.post("/request-otp", forgotPasswordController.requestOTP);
    router.post("/verify-otp", forgotPasswordController.verifyOTP);
    router.post("/reset-password", forgotPasswordController.resetPassword);

    export default router;
