// routes/bhxhTuNguyen.js

import express from "express";
import { tinhBHYTTuNguyenController } from "../controllers/bhxhTuNguyen.js";

const router = express.Router();

router.post("/tu-nguyen", tinhBHYTTuNguyenController);

export default router;
