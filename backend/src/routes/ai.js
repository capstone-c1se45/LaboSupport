import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/auth.js"; // Import middleware xác thực

const router = Router();

router.use(authMiddleware.verifyToken);

router.get('/chat/conversations',aiController.listConversations);

router.get('/chat/conversations/:id',aiController.getMessagesForConversation);

router.post('/chat',aiController.chatWithAI);

router.delete('/chat/conversations/:id', aiController.deleteConversation);

router.get('/faq', aiController.getFaqs);


export default router;