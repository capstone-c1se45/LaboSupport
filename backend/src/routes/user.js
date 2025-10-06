import { Router } from "express";
import { getUsers, getUserById, createUser } from "../controllers/user.js";
const router = Router();


/**
 *  @openapi
 * tags:
 *   name: Users
 *   description: API quản lý người dùng
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 */
router.get("/", getUsers);

/**
 *  @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID người dùng
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/:id", getUserById);

/**
 *  @openapi
 * /api/users:
 *   post:
 *     summary: Tạo người dùng mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nhật"
 *               email:
 *                 type: string
 *                 example: "nhat@example.com"
 *     responses:
 *       201:
 *         $ref: '#/components/responses/201'
 *       400:
 *         $ref: '#/components/responses/400'
 */
router.post("/", createUser);

export default router;
