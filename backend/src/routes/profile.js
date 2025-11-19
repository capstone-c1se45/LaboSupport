import { Router } from "express";
import { profileController } from "../controllers/profile.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateProfile } from "../middlewares/validateProfile.js"; 

const router = Router();

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 code: { type: integer, example: 200 }
 *                 message: { type: string, example: Profile fetched successfully }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id: { type: string }
 *                     username: { type: string }
 *                     full_name: { type: string }
 *                     email: { type: string }
 *                     phone: { type: string }
 *                     dob: { type: string, format: date, nullable: true }
 *                     gender: { type: string, nullable: true, example: male }
 *                     address: { type: string, nullable: true }
 *                     occupation: { type: string, nullable: true }
 */
router.get("/", authMiddleware.verifyToken, profileController.getProfile);

/**
 * @openapi
 * /api/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               dob: { type: string, format: date }
 *               gender: { type: string, enum: [male, female, other] }
 *               address: { type: string }
 *               occupation: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 */
router.put("/", authMiddleware.verifyToken, profileController.updateProfile);
router.put("/change-password", authMiddleware.verifyToken, profileController.changePassword);
router.get("/stats", authMiddleware.verifyToken, profileController.getStats);

export default router;
