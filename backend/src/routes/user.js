import { Router } from "express";
import { userController } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRegister, validateLogin, validateEmailForOtp } from "../middlewares/validateUser.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API quản lý người dùng
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", authMiddleware.verifyToken, userController.getAllUsers);


/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại từ token
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 */
router.get("/me", authMiddleware.verifyToken, userController.getUserByToken);


/**
 * @swagger
 * /api/users/send-verify-code:
 *   post:
 *     summary: Gửi mã xác thực email (OTP)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@mail.com"
 *     responses:
 *       200:
 *         description: Mã OTP đã được gửi
 *       400:
 *         description: Email không hợp lệ
 */
router.post("/send-verify-code", validateEmailForOtp, userController.sendVerifyCode);


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nhat123"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               full_name:
 *                 type: string
 *                 example: "Trần Nhật"
 *               email:
 *                 type: string
 *                 example: "nhat@example.com"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 */
router.post("/register", validateRegister, userController.register);


/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get("/:id", authMiddleware.verifyToken, userController.getUserById);


/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Trần Nhật Updated"
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.put("/:id", authMiddleware.verifyToken, userController.updateUser);


/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng theo ID (chỉ admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Không có quyền admin
 */
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nhat123"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai username hoặc password
 */
router.post("/login", validateLogin, userController.login);

export default router;
