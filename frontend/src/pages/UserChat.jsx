// frontend/src/pages/UserChat.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { api } from '../lib/api-client';

const BotIcon = ({ className = 'w-8 h-8 text-blue-600' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M12 2a1 1 0 011 1v1.05A7.002 7.002 0 0119 11v4a4 4 0 01-4 4h-1a2 2 0 11-4 0H9a4 4 0 01-4-4v-4a7.002 7.002 0 016-6.95V3a1 1 0 011-1zm-5 9a5 5 0 005 5h2a5 5 0 005-5v-.5a5.5 5.5 0 10-12 0V11z' />
  </svg>
);

const SendIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M3.4 20.4l17.8-8.4L3.4 3.6l-.9 6.3 9.8 2.1-9.8 2.1.9 6.3z' />
  </svg>
);

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M16 1H8a2 2 0 00-2 2v2h2V3h8v6h2V3a2 2 0 00-2-2z' />
    <path d='M6 7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2H6zm10 12H6V9h10v10z' />
  </svg>
);



export default function UserChat() {
  const [messages, setMessages] = useState([]); // Khởi tạo rỗng, sẽ fetch history
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true); // State cho việc tải history
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [sessionId, setSessionId] = useState(null); // Lưu session_id trả về từ AI service
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { replace: true }); // Điều hướng về trang login nếu chưa đăng nhập
    } else {
      // Nếu đã đăng nhập, fetch lịch sử chat
      fetchHistory();
    }
  }, [navigate]);

  // Hàm fetch lịch sử chat
  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const response = await api.get('/ai/chat/history');
      if (response.data?.data) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // Có thể hiển thị thông báo lỗi
       setMessages([{ role: 'assistant', content: 'Chào bạn! Có lỗi xảy ra khi tải lịch sử chat.' }]);
    } finally {
       setHistoryLoading(false);
       // Thêm tin nhắn chào mừng nếu history rỗng
       setMessages(prev => prev.length === 0 ? [{ role: 'assistant', content: 'Chào bạn! Tôi có thể giúp gì về Luật Lao động?' }] : prev);
    }
  }

// Gợi ý câu hỏi nhanh
  const suggestions = useMemo(
      () => [
        'Làm thêm giờ được tính lương thế nào?',
        'Nghỉ thai sản được hưởng chế độ gì?',
        'Người lao động có quyền từ chối làm thêm giờ không?',
        'Thời gian thử việc tối đa là bao lâu?',
        'Khi nào được đơn phương chấm dứt hợp đồng?'
      ],
      []
    );

  // Cuộn xuống cuối khi có tin nhắn mới hoặc loading
   useEffect(() => {
    if (!listRef.current || historyLoading) return; // Không cuộn khi đang tải history
    try {
      // Delay nhẹ để đảm bảo DOM đã cập nhật
      setTimeout(() => {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch {
       setTimeout(() => {
         listRef.current.scrollTop = listRef.current.scrollHeight;
       }, 50);
    }
  }, [messages, loading, historyLoading]); 

  // Hàm gửi tin nhắn
  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: content,
        session_id: sessionId 
      });

      const aiReply = response.data?.data?.reply || 'Xin lỗi, tôi chưa có câu trả lời.';
      const newSessionId = response.data?.data?.session_id;

      if (newSessionId) {
        setSessionId(newSessionId); 
      }

      const assistantMsg = { role: 'assistant', content: aiReply };
      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error("Error sending message:", err);
      const errorMsg = { role: 'assistant', content: 'Đã có lỗi xảy ra. Vui lòng thử lại.' };
      setMessages((prev) => [...prev, errorMsg]);
       // Nếu lỗi 401 (Unauthorized) thì điều hướng về login
       if (err.response?.status === 401) {
           navigate('/login', { replace: true });
       }
    } finally {
      setLoading(false);
    }
  }


  return (
   
    <div className='flex h-screen bg-gray-50'>
        <aside className='fixed h-full w-64 bg-white border-r border-gray-200 flex flex-col'>
             <nav className='flex-1 p-3 text-sm'>
                <a href='/home' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'> Trang Chính</a>
                 <a href='/user-chat' className='flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium mt-1'>🤖 Trợ lý AI</a>
                  <a href='/profile' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'>👤 Hồ sơ cá nhân</a>
            </nav>
             <div className='border-t p-3'>
               <a href='/logout' className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50'>Đăng xuất</a>
             </div>
        </aside>

        <main className='ml-64 p-6 w-full flex flex-col h-screen'> {/* flex flex-col h-screen */}
            <h1 className='text-2xl font-extrabold text-gray-900 mb-4'>Trợ lý AI Pháp Lý</h1>

            <section className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col'> {/* flex-1 flex flex-col */}

               <div className='px-5 py-3 border-b'>
                  <div className='text-xs text-gray-500 mb-2'>Gợi ý:</div>
                  <div className='flex flex-wrap gap-2'>
                    {suggestions.map((s, idx) => (
                      <button key={idx} className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full' onClick={() => handleSend(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                 <div ref={listRef} className='px-5 py-5 flex-1 overflow-y-auto bg-gray-50/60 chat-scroll'> {/* flex-1 */}
                    <ul className='space-y-4'>
                       {historyLoading && ( 
                           <li className="text-center text-gray-500 text-sm">Đang tải lịch sử chat...</li>
                       )}
                       {!historyLoading && messages.map((m, i) => (
                           <li key={i} className='flex gap-3 animate-fade-in'>
                               {m.role === 'assistant' ? (
                                   <span className='shrink-0 mt-1'><BotIcon className='w-6 h-6 text-blue-600' /></span>
                               ) : (
                                   <span className='shrink-0 mt-1'><div className='w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs'>You</div></span>
                               )}
                               <div className={m.role === 'assistant' ? 'relative bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 max-w-[80%]' : 'bg-blue-600 text-white rounded-lg px-3 py-2 text-sm ml-auto max-w-[80%]'}>
                                   <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                                   {m.role === 'assistant' && (
                                       <button
                                           title='Sao chép'
                                           onClick={async () => { /* ... code sao chép ... */ }}
                                           className='absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded p-1 shadow-sm opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity' // Hiện khi hover
                                           aria-label='Copy'
                                       >
                                           <CopyIcon />
                                       </button>
                                   )}
                                    {copiedIdx === i && (
                                       <div className='absolute -top-8 right-0 bg-black/80 text-white text-[11px] px-2 py-1 rounded'>Đã sao chép</div>
                                   )}
                               </div>
                           </li>
                       ))}
                       {loading && ( 
                           <li className='flex gap-3 animate-fade-in'>
                              <span className='shrink-0 mt-1'><BotIcon className='w-6 h-6 text-blue-600' /></span>
                              <div className='bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 max-w-[80%]'>
                                 <span className='typing-dot'></span>
                                 <span className='typing-dot ml-1'></span>
                                 <span className='typing-dot ml-1'></span>
                               </div>
                           </li>
                       )}
                    </ul>
                </div>

                {/* Form nhập liệu */}
                 <form className='px-4 py-4 border-t bg-white flex gap-2' onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <input
                       type='text'
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       placeholder='Nhập câu hỏi của bạn...'
                       className='flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-blue-500'
                       disabled={loading} 
                    />
                    <button type='submit' disabled={loading || !input.trim()} className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md'>
                       <SendIcon /> Gửi
                    </button>
                </form>
            </section>
        </main>
    </div>
  );
}