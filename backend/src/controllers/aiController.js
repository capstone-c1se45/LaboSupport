import axios from 'axios';
import { conversationModel } from '../models/conversation.js';
import { messageModel } from '../models/message.js';
import { faqModel } from '../models/faq.js';
import responseHandler from "../utils/response.js"; 
import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const generateTitle = (prompt) => {
  return prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
};

const formatHistory = (messages) => {
    return messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));
};

export const aiController = {

  async chatWithAI(req, res) {
    const userId = req.user?.user_id;
    const { prompt, conversation_id } = req.body; // Frontend sẽ gửi conversation_id (có thể null)
    
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    if (!prompt) {
      return responseHandler.badRequest(res, "Vui lòng nhập câu hỏi.");
    }

    let convId = conversation_id;
    let newTitle = null;

    try {
      // 1. Tìm hoặc Tạo cuộc trò chuyện
      if (!convId) {
        const title = generateTitle(prompt);
        const newConv = await conversationModel.create(userId, title);
        convId = newConv.conversation_id;
        newTitle = title;
      }

      // 2. Lấy lịch sử chat
      const historyMessages = await messageModel.getByConversationId(convId);
      const formattedHistory = formatHistory(historyMessages);

      // 3. Lưu tin nhắn của người dùng
      await messageModel.create(convId, 'user', prompt);

      // 4. Gọi AI Service (Python)
      let aiResponse;
      try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
          prompt: prompt,
          history: formattedHistory // Gửi lịch sử chat
        });
      } catch (aiError) {
        console.error("Error calling AI service:", aiError?.response?.data || aiError.message);
        return responseHandler.internalServerError(res, "Lỗi từ dịch vụ AI.");
      }

      const aiResult = aiResponse.data;
      if (!aiResult.answer) {
         return responseHandler.internalServerError(res, "Dịch vụ AI không trả về câu trả lời.");
      }
      
      // 5. Lưu tin nhắn của AI
      await messageModel.create(convId, 'ai', aiResult.answer);

      // 6. Cập nhật timestamp (để đưa lên đầu sidebar)
      await conversationModel.updateTimestamp(convId);

      // 7. Trả lời frontend
      return responseHandler.success(res, "AI đã trả lời.", {
        answer: aiResult.answer,
        source: aiResult.source || null,
        conversation_id: convId, 
        title: newTitle 
      });

    } catch (error) {
      console.error("Error in chatWithAI:", error);
      return responseHandler.internalServerError(res, "Lỗi máy chủ khi xử lý chat.");
    }
  },
  // sidebar: Lấy danh sách hội thoại của người dùng
  async listConversations(req, res) {
    const userId = req.user?.user_id;
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    try {
      const conversations = await conversationModel.getByUserId(userId);
      return responseHandler.success(res, "Lấy danh sách hội thoại thành công.", conversations);
    } catch (error) {
      return responseHandler.internalServerError(res, "Lỗi khi lấy danh sách hội thoại.");
    }
  },
 
  async getMessagesForConversation(req, res) {
    const userId = req.user?.user_id;
    const { id: conversationId } = req.params;
    
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    
    try {
      // Kiểm tra xem user có sở hữu conversation này không
      const conversation = await conversationModel.getById(conversationId, userId);
      if (!conversation) {
        return responseHandler.notFound(res, "Không tìm thấy cuộc trò chuyện.");
      }
      
      const messages = await messageModel.getByConversationId(conversationId);
      return responseHandler.success(res, "Lấy tin nhắn thành công.", messages);
      
    } catch (error) {
       return responseHandler.internalServerError(res, "Lỗi khi lấy tin nhắn.");
    }
  },
  async deleteConversation(req, res) {
    const userId = req.user?.user_id;
    const { id: conversationId } = req.params;
    
    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    
    try {
      const deleted = await conversationModel.deleteById(conversationId, userId);
      if (!deleted) {
         return responseHandler.notFound(res, "Không tìm thấy cuộc trò chuyện để xóa.");
      }
      return responseHandler.success(res, "Xóa cuộc trò chuyện thành công.");
    } catch (error) {
      return responseHandler.internalServerError(res, "Lỗi khi xóa cuộc trò chuyện.");
    }
  },
  async getFaqs(req, res) {
    try {
      const faqs = await faqModel.getAll();
      return responseHandler.success(res, "Lấy danh sách FAQ thành công.", faqs);
    } catch (error) {
      return responseHandler.internalServerError(res, "Lỗi khi lấy danh sách câu hỏi thường gặp.");
    }
  }
};