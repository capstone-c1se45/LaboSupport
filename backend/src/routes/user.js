import { Router } from "express";
import { userController } from "../controllers/user.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validateRegister, validateLogin, validateEmailForOtp } from "../middlewares/validateUser.js"; // thêm middleware validate

const router = Router();

/**
 * @openapi
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
 *         description: Thành công
 */
router.get("/", authMiddleware.verifyToken, userController.getAllUsers);

// 📨 Gửi mã xác nhận email
router.post("/send-verify-code", validateEmailForOtp, userController.sendVerifyCode);

// 📝 Đăng ký (validate đầu vào trước khi gọi controller)
router.post("/register", validateRegister, userController.register);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get("/:id", authMiddleware.verifyToken, userController.getUserById);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
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
 *                 example: "new@example.com"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.put("/:id", authMiddleware.verifyToken, userController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.deleteUser
);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập người dùng
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
// ✅ validate login trước khi gọi controller
router.post("/login", validateLogin, userController.login);

export default router;


