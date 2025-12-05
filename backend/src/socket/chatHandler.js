import { conversationModel } from '../models/conversation.js';
import { messageModel } from '../models/message.js';
import { jwtService } from '../config/jwt.js';
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
      const user = jwtService.verifyToken(token);
      socket.user = user; // Gắn thông tin user vào socket
      next();
    } catch (err) {
      return next(new Error('Xác thực thất bại: Token không hợp lệ.'));
    }
  });

  // Khi client kết nối
  io.on('connection', (socket) => {
    console.log('Socket in4:', socket.user);
    console.log(`Client đã kết nối: ${socket.id} (User: ${socket.user.username}) (Role: ${socket.user.role})`);

    if (socket.user.role_id == 2 || socket.user.role === 'admin') {
        console.log('Đây là kết nối của admin, tham gia admin-room');
        socket.join('admin-room');
        console.log(`Admin [${socket.user.username}] đã tham gia admin-room`);
    }

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
          console.log(`Tạo cuộc trò chuyện mới: ${convId}`);
        }

        // 2. Lưu tin nhắn user vào DB
        await messageModel.create(convId, 'user', prompt);
        
        
        const formData = new URLSearchParams();
        formData.append('message', prompt);
        formData.append('session_id', convId);

        let aiResponse;
        try {
          console.log(`Đang gọi AI Service: ${AI_SERVICE_URL}/chat với session_id: ${convId}`);
          aiResponse = await axios.post(`${AI_SERVICE_URL}/chat`, formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
        } catch (aiError) {
          console.error("Lỗi khi gọi AI service:", aiError?.response?.data || aiError.message);
          const detail = aiError?.response?.data?.detail || aiError.message;
          return socket.emit('chat:error', { message: `Lỗi từ dịch vụ AI: ${detail}` });
        }


        const aiResult = aiResponse.data;
        if (!aiResult.ai_reply) {
          throw new Error("Dịch vụ AI không trả về câu trả lời (ai_reply).");
        }
        
        // 4. Lưu tin nhắn của AI vào DB
        await messageModel.create(convId, 'ai', aiResult.ai_reply);

        // 5. Cập nhật timestamp
        await conversationModel.updateTimestamp(convId);

        // 6. Gửi trả kết quả về  client này
        socket.emit('chat:receive', {
          answer: aiResult.ai_reply,
          source: aiResult.source || null, 
          conversation_id: convId,
          title: newTitle 
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