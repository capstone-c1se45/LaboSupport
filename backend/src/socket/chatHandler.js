import { conversationModel } from '../models/conversation.js';
import { messageModel } from '../models/message.js';
import { verifyToken } from '../config/jwt.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const generateTitle = (prompt) => {
  return prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
};
const formatHistory = (messages) => {
    return messages.map(msg => ({ role: msg.role, content: msg.content }));
};

export const initializeSocket = (io) => {
    // Middleware xác thực người dùng khi kết nối Socket.IO
    io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Xác thực thất bại: Không có token.'));
    }
    try {
      const user = verifyToken(token);
      socket.user = user; // Gắn thông tin user vào socket
      next();
    } catch (err) {
      return next(new Error('Xác thực thất bại: Token không hợp lệ.'));
    }
  });

  // Khi client kết nối
  io.on('connection', (socket) => {
    console.log(`Client đã kết nối: ${socket.id} (User: ${socket.user.username})`);

    // Lắng nghe sự kiện "chat:send" từ client
    socket.on('chat:send', async (data) => {
      const { prompt, conversation_id } = data;
      const userId = socket.user.user_id;

      if (!prompt) {
        return socket.emit('chat:error', { message: "Vui lòng nhập câu hỏi." });
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

        // 2. Lấy lịch sử và lưu tin nhắn user
        const historyMessages = await messageModel.getByConversationId(convId);
        const formattedHistory = formatHistory(historyMessages);
        await messageModel.create(convId, 'user', prompt);

        // 3. Gọi AI Service (đây là lúc chờ lâu)
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, {
          prompt: prompt,
          history: formattedHistory
        });

        const aiResult = aiResponse.data;
        if (!aiResult.answer) {
          throw new Error("Dịch vụ AI không trả về câu trả lời.");
        }

        // 4. Lưu tin nhắn của AI
        await messageModel.create(convId, 'ai', aiResult.answer);

        // 5. Cập nhật timestamp
        await conversationModel.updateTimestamp(convId);

        // 6. Gửi trả kết quả về *chỉ* client này
        socket.emit('chat:receive', {
          answer: aiResult.answer,
          source: aiResult.source || null,
          conversation_id: convId,
          title: newTitle // Gửi title nếu là chat mới
        });

      } catch (error) {
        console.error("Socket chat error:", error.message);
        socket.emit('chat:error', { message: error.message || "Lỗi máy chủ khi xử lý chat." });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client đã ngắt kết nối: ${socket.id}`);
    });
  });
}