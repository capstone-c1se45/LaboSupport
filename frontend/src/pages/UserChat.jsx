import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { createSocketConnection } from '../lib/socket.js';
import NavbarLogged from '../components/NavbarLogged.jsx';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// --- Icons ---
const BotIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M15 17h.01M6.343 15.343A8 8 0 1117.657 8.343 8 8 0 016.343 15.343z" />
  </svg>
);
const UserIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const SendIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.172 15V4.602a1 1 0 00-1.144-.988l-2.002.572a.5.5 0 01-.63-.628l2.002-.572a3 3 0 013.431 2.964V15a1 1 0 00.828.995l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg>
);
const MenuIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const NewChatIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ChatIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
// --- End Icons ---

// Biến socket bên ngoài component
let socket = null;

export default function UserChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // --- 1. Khởi tạo và Lấy danh sách hội thoại ---
  useEffect(() => {
    let isMounted = true; 

    const loadData = async () => {
      // Tải danh sách hội thoại (sidebar)
      try {
        if(isMounted) setIsLoadingHistory(true);
        const convResponse = await api.get('/ai/chat/conversations');
        if (isMounted) setConversations(convResponse.data.data || []);

        // Tải tin nhắn của cuộc trò chuyện mới nhất
        const recentConversations = convResponse.data.data;
        if (recentConversations && recentConversations.length > 0) {
          const recentId = recentConversations[0].conversation_id;
          if (isMounted) {
            setCurrentConversationId(recentId);
            const msgResponse = await api.get(`/ai/chat/conversations/${recentId}`);
            if (isMounted) setMessages(msgResponse.data.data || []);
          }
        } else {
          // Nếu không có lịch sử
          if (isMounted) {
            setMessages([]);
          }
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        if (err.response?.status === 401) navigate('/login');
        if (isMounted) setError("Không thể tải lịch sử chat.");
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };

    loadData();
    
    // --- Khởi tạo Socket.IO ---
    socket = createSocketConnection();

    const handleNewMessage = (data) => {
      if (!isMounted) return;
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: data.answer, source: data.source }
      ]);

      if (data.conversation_id && !currentConversationId) {
        setCurrentConversationId(data.conversation_id);
      }
      
      // Nếu là cuộc trò chuyện mới, thêm vào sidebar
      if (data.title && !conversations.find(c => c.conversation_id === data.conversation_id)) {
        const newConv = {
          conversation_id: data.conversation_id,
          title: data.title,
          updated_at: new Date().toISOString()
        };
        setConversations(prev => [newConv, ...prev]);
      } else {
        // Cập nhật timestamp cho sidebar
        setConversations(prev => prev.map(c => 
          c.conversation_id === data.conversation_id 
            ? {...c, updated_at: new Date().toISOString()} 
            : c
        ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      }
      setIsLoading(false);
    };

    const handleError = (error) => {
      if (!isMounted) return;
      console.error("Socket error:", error.message);
      setError(error.message || "Lỗi kết nối real-time.");
      setIsLoading(false);
    };

    socket.on('chat:receive', handleNewMessage);
    socket.on('chat:error', handleError);

    return () => {
      isMounted = false;
      socket.off('chat:receive', handleNewMessage);
      socket.off('chat:error', handleError);
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // --- 2. Lấy tin nhắn khi chọn 1 hội thoại ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversationId) {
        setMessages([]); 
        return;
      }
      
      try {
        setIsLoading(true); 
        setError(null);
        const response = await api.get(`/ai/chat/conversations/${currentConversationId}`);
        setMessages(response.data.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Không thể tải tin nhắn.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentConversationId]);

  // --- 3. Cuộn xuống cuối ---
  useEffect(() => {
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  // --- 4. Xử lý gửi tin ---
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    const userMessage = { role: 'user', content: trimmedPrompt, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    socket.emit('chat:send', {
      prompt: userMessage.content,
      conversation_id: currentConversationId
    });
  };
  
  // --- 5. Xử lý chọn chat mới ---
  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setError(null);
  };
  
  // --- 6. Xử lý xóa chat ---
  const handleDeleteChat = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này?")) return;
    
    try {
        await api.delete(`/ai/chat/conversations/${convId}`);
        setConversations(prev => prev.filter(c => c.conversation_id !== convId));
        if (currentConversationId === convId) {
            handleNewChat();
        }
    } catch (err) {
        console.error("Error deleting chat:", err);
        setError("Xóa thất bại.");
    }
  };

  return (
    // Layout 2 cột, h-screen
    <div className='flex h-screen w-full flex-col bg-white'>
      <NavbarLogged />
      
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}> {/* 4rem là chiều cao Navbar */}

        {/* Sidebar Lịch sử Chat (Có thể ẩn) */}
        <nav 
          className={`
            flex h-full flex-col bg-white
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'w-64 border-r' : 'w-0 overflow-hidden'}
          `}
        >
          <div className="p-3 border-b">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cuộc trò chuyện mới
              <NewChatIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="px-3 text-xs font-semibold text-gray-500 uppercase">Gần đây</span>
            {isLoadingHistory ? (
              <p className="p-3 text-xs text-gray-500">Đang tải...</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.conversation_id}
                  onClick={() => setCurrentConversationId(conv.conversation_id)}
                  className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-lg cursor-pointer ${currentConversationId === conv.conversation_id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <ChatIcon className="flex-shrink-0" />
                    <span className="text-sm truncate">{conv.title}</span>
                  </div>
                  <button 
                      onClick={(e) => handleDeleteChat(e, conv.conversation_id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 flex-shrink-0"
                      title="Xóa"
                  >
                      <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </nav>

        {/* Khung Chat Chính */}
        <main className="flex-1 h-full flex flex-col bg-white">
          {/* Header của Chat (Nơi có nút ẩn hiện sidebar) */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              <MenuIcon />
            </button>
            <div className="font-semibold text-gray-800">
              Trợ lý AI LaboSupport
            </div>
            <div className="w-8"></div> {/* Placeholder cho cân bằng */}
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Hiển thị chào mừng nếu không có tin nhắn */}
            {messages.length === 0 && !isLoading && !isLoadingHistory && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-3xl font-bold text-gray-800">LaboSupport,</h2>
                <p className="text-xl text-gray-500 mt-2">Người bạn đồng hành giúp bạn hiểu luật lao động</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && (
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BotIcon className="w-5 h-5" />
                  </span>
                )}
                
                <div 
                  className={`prose prose-slate max-w-xl text-sm leading-relaxed p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                {msg.role === 'user' && (
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </span>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BotIcon className="w-5 h-5" />
                </span>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="typing-dot"></span>
                  <span className="typing-dot ml-1"></span>
                  <span className="typing-dot ml-1"></span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                Lỗi: {error}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Vùng nhập liệu (Giống trong ảnh) */}
          <div className="border-t p-4 bg-white">
            <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                disabled={isLoading}
                placeholder="Hỏi Labo..."
                className="w-full p-3 pr-12 text-sm border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="absolute right-3 bottom-2.5 p-2 bg-blue-600 text-white rounded-lg enabled:hover:bg-blue-700 disabled:opacity-50"
                title="Gửi"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
}