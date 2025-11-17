import axios from 'axios';
import { conversationModel } from '../models/conversation.js';
import { messageModel } from '../models/message.js';
import { faqModel } from '../models/faq.js';
import { contractModel } from '../models/contract.js';
import { contractOcrModel } from '../models/contractOcr.js';
import responseHandler from "../utils/response.js"; 
import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const guestUsage = new Map();


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

  async contractChat(req, res) {
    const userId = req.user?.user_id;
    const { prompt, contract_id, chat_history } = req.body; 

    if (!userId) {
      return responseHandler.unauthorized(res, "Yêu cầu đăng nhập.");
    }
    if (!prompt || !contract_id) {
      return responseHandler.badRequest(res, "Thiếu câu hỏi (prompt) hoặc ID hợp đồng (contract_id).");
    }

    try {
      const contract = await contractModel.getContractById(contract_id, userId);
      if (!contract) {
        return responseHandler.notFound(res, "Không tìm thấy hợp đồng hoặc bạn không có quyền truy cập.");
      }

      const analysis = await contractOcrModel.getOcrResultByContractId(contract_id);
      if (!analysis) {
        return responseHandler.notFound(res, "Hợp đồng này chưa được phân tích.");
      }

      const context = `
        NỘI DUNG HỢP ĐỒNG GỐC (TRÍCH XUẤT):
        ${analysis.extracted_text || "Không có"}
        TÓM TẮT HỢP ĐỒNG:
        ${analysis.tomtat || "Không có"}
        ĐÁNH GIÁ QUYỀN LỢI/NGHĨA VỤ:
        ${analysis.danhgia || "Không có"}
        PHÂN TÍCH CẢNH BÁO/RỦI RO:
        ${analysis.phantich || "Không có"}
        ĐỀ XUẤT CHỈNH SỬA:
        ${analysis.dexuat || "Không có"}
      `;

      const aiPayload = {
        prompt: prompt,
        context: context.trim(),
        chat_history: chat_history || [] 
      };
      
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat_with_context`, aiPayload);

      const aiAnswer = aiResponse.data?.answer;
      if (!aiAnswer) {
        return responseHandler.internalServerError(res, "AI không đưa ra câu trả lời.");
      }

      const userMessage = { role: 'user', content: prompt };
      const aiMessage = { role: 'ai', content: aiAnswer };
      const oldHistory = Array.isArray(chat_history) ? chat_history : [];
      const newHistory = [...oldHistory, userMessage, aiMessage];
      
      await contractOcrModel.updateContractChatHistory(contract_id, newHistory);

      return responseHandler.success(res, "AI đã trả lời dựa trên ngữ cảnh.", {
        answer: aiAnswer
      });

    } catch (error) {
      console.error("Error in contractChat:", error?.response?.data || error.message);
      return responseHandler.internalServerError(res, "Lỗi máy chủ khi chat về hợp đồng.");
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
  },
  // xử lý chat cho khách (không cần đăng nhập)
  async guestChat(req, res) {
    try {
      const { message, session_id } = req.body;

      if (!message || !session_id) {
        return responseHandler.badRequest(res, "Thiếu thông tin message hoặc session_id");
      }

      // 1. Kiểm tra giới hạn (Rate Limit)
      const currentCount = guestUsage.get(session_id) || 0;
      if (currentCount >= 5) {
        return res.status(403).json({
          status: 'error',
          code: 403,
          message: "Bạn đã hết lượt hỏi miễn phí (5 câu). Vui lòng đăng ký tài khoản để tiếp tục!",
          limit_reached: true
        });
      }

      const formData = new URLSearchParams();
      formData.append('message', message);
      formData.append('session_id', session_id);

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const aiData = aiResponse.data;

      guestUsage.set(session_id, currentCount + 1);

      return responseHandler.success(res, "AI trả lời thành công", {
        reply: aiData.ai_reply,
        session_id: aiData.session_id,
        remaining_turns: 5 - (currentCount + 1)
      });

    } catch (error) {
      console.error("Guest chat error:", error?.response?.data || error.message);
      return responseHandler.internalServerError(res, "Lỗi khi xử lý chat khách.");
    }
  }
};