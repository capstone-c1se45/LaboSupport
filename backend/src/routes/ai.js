import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/auth.js"; // Import middleware xác thực

const router = Router();

// Route cho người dùng khách (không cần xác thực)
router.post('/guest-chat', aiController.guestChat);

// // Lấy FAQ cũng nên public để khách xem được
router.get('/faq', aiController.getFaqs);

// Áp dụng middleware xác thực cho các route bên dưới
router.use(authMiddleware.verifyToken);

router.get('/chat/conversations',aiController.listConversations);

router.get('/chat/conversations/:id',aiController.getMessagesForConversation);

router.post('/chat',aiController.chatWithAI);

router.delete('/chat/conversations/:id', aiController.deleteConversation);



export default router;