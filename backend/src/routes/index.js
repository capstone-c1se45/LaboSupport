import { Router } from "express";
import user from "./user.js";

const router = Router();

router.use("/users", user);


export default router;