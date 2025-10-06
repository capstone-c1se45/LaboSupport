import { Router } from "express";
import user from "./user.js";

const router = Router();

router.use("/v1/users", user);


export default router;