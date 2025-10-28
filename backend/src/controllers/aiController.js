// backend/src/controllers/aiController.js
import axios from 'axios';
import { chatLogModel } from '../models/chatLog.js';
import responseHandler from "../untils/response.js"; 
import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const aiController = {

    // Xử lý chat từ người dùng đã đăng nhập
  async handleUserChat(req, res) {
    const userId = req.user?.user_id; 
    const { message, session_id = `user_${userId}` } = req.body;

    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu xác thực người dùng.");
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return responseHandler.badRequest(res, "Nội dung tin nhắn không được để trống.");
    }

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
        message: message.trim(),
        session_id: session_id
      }, {
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' } // xử lý form data bên ai sẻvice
      });

      const aiReply = aiResponse.data?.ai_reply || "Xin lỗi, tôi không thể xử lý yêu cầu này.";

      // trả lời truocsws khi lưu vào db
      chatLogModel.createLog(userId, message.trim(), aiReply, 'AI_CHAT_LOGGED_IN')
        .catch(dbError => {
          console.error("Failed to save chat log:", dbError);
        });

      return responseHandler.success(res, "AI đã trả lời.", {
        reply: aiReply,
        session_id: aiResponse.data?.session_id || session_id,
      });

    } catch (error) {
      console.error("Error calling AI service or processing chat:", error?.response?.data || error.message);
      return responseHandler.internalServerError(res, "Đã có lỗi xảy ra khi xử lý yêu cầu chat.");
    }
  },

    // Lấy lịch sử chat của người dùng đã đăng nhập
  async getChatHistory(req, res) {
     const userId = req.user?.user_id;
     if (!userId) {
       return responseHandler.unauthorized(res, "Yêu cầu xác thực người dùng.");
     }

     try {
       const history = await chatLogModel.getHistoryByUserId(userId);
       const formattedHistory = history.map(log => ([
         { role: 'user', content: log.question, timestamp: log.created_at },
         { role: 'assistant', content: log.answer, timestamp: log.created_at } 
       ])).flat();

       return responseHandler.success(res, "Lấy lịch sử chat thành công.", formattedHistory);
     } catch (error) {
       console.error("Error fetching chat history:", error);
       return responseHandler.internalServerError(res, "Lỗi khi lấy lịch sử chat.");
     }
  }
};