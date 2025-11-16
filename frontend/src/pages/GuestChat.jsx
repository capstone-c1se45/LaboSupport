import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import logoImg from '../assets/logo.png';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

export default function GuestChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI Pháp Lý. Hãy đặt câu hỏi về luật lao động Việt Nam.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  
  const [sessionId, setSessionId] = useState(() => {
    const savedSession = localStorage.getItem('guest_session_id');
    return savedSession || `guest_${Date.now()}`;
  });

  const [suggestions, setSuggestions] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('guest_session_id', sessionId);
    }
  }, [sessionId]);

  // 1. Lấy danh sách câu hỏi thường gặp (FAQ) từ Backend
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/ai/faq');
        if (res.data?.data) {
          setSuggestions(res.data.data.slice(0, 5).map(item => item.question));
        }
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
        setSuggestions([
          'Làm thêm giờ được tính lương thế nào?',
          'Thời gian thử việc tối đa là bao lâu?',
          'Khi nào được đơn phương chấm dứt hợp đồng?'
        ]);
      }
    };
    fetchFaqs();
  }, []);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (!listRef.current) return;
    setTimeout(() => {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [messages, loading]);

  // 2. Hàm xử lý gửi tin nhắn
  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/guest-chat', {
        message: content,
        session_id: sessionId 
      });

      const { reply, session_id: newSessionId } = response.data?.data || {};
      
      // Nếu backend trả về session ID mới cập nhật lại
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }

      const assistantMsg = { role: 'assistant', content: reply || 'Xin lỗi, tôi không có câu trả lời.' };
      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error("Error sending guest message:", err);
      
      let errorContent = 'Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.';
      
      // 3. Xử lý lỗi giới hạn 5 câu hỏi (403 Forbidden)
      if (err.response && err.response.status === 403 && err.response.data?.limit_reached) {
        errorContent = `**Bạn đã hết lượt hỏi miễn phí.** \n\nVui lòng [Đăng ký](/register) hoặc [Đăng nhập](/login) để tiếp tục trò chuyện không giới hạn với AI!`;
      }

      const errorMsg = { role: 'assistant', content: errorContent };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý query param `?q=`
  const { search } = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(search).get('q');
    if (q) {
        setInput(q);
        setTimeout(() => handleSend(q), 100);
    }
  }, [search]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='border-b bg-white'>
        <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
          <Link to="/" className='flex items-center gap-2 select-none'>
            <img src={logoImg} alt='LaboSupport' className='h-8 w-auto' />
          </Link>
          <nav className='hidden sm:flex items-center gap-6 text-sm text-gray-600'>
            <Link to='/' className='hover:text-gray-900'>Trang chủ</Link>
            <Link to='/guest-chat' className='text-gray-900 font-medium'>AI Chat (Khách)</Link>
            <a href='#features' className='hover:text-gray-900'>Tính năng</a>
            <a href='#about' className='hover:text-gray-900'>Giới thiệu</a>
          </nav>
          <div className='flex items-center gap-3 text-sm'>
            <Link to='/login' className='px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700'>Đăng nhập</Link>
            <Link to='/register' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5'>Đăng ký ngay</Link>
          </div>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-4 py-10'>
        <section className='text-center mb-8'>
          <h1 className='text-[34px] md:text-[40px] font-extrabold leading-tight text-gray-900'>
            Giải Đáp Mọi Thắc Mắc
            <br />
            <span className='text-blue-600'>Lao Động</span> Của Bạn
          </h1>
          <p className='text-gray-600 mt-3 max-w-2xl mx-auto'>
            Hỏi ngay mà không cần đăng ký! AI sẽ tư vấn cho bạn dựa trên luật lao động Việt Nam.
          </p>
        </section>

        <section className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in'>
          <div className='px-5 py-4 border-b flex items-center gap-3'>
            <span className='p-2 bg-blue-50 rounded-full'><BotIcon /></span>
            <div>
              <div className='font-semibold text-gray-800'>Xin chào! Tôi là trợ lý AI Pháp Lý</div>
              <div className='text-xs text-gray-500'>Hãy đặt câu hỏi, tôi sẽ trả lời ngay.</div>
            </div>
          </div>

          <div className='px-5 py-3 border-b bg-gray-50/50'>
            <div className='text-xs text-gray-500 mb-2 font-medium'>Gợi ý câu hỏi phổ biến:</div>
            <div className='flex flex-wrap gap-2'>
              {suggestions.length > 0 ? suggestions.map((s, idx) => (
                <button key={idx} className='text-xs bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors shadow-sm' onClick={() => handleSend(s)}>
                  {s}
                </button>
              )) : <span className='text-xs text-gray-400 italic'>Đang tải gợi ý...</span>}
            </div>
          </div>

          <div ref={listRef} className='px-5 py-5 h-[55vh] overflow-y-auto bg-white chat-scroll'>
            <ul className='space-y-5'>
              {messages.map((m, i) => (
                <li key={i} className={`flex gap-3 animate-fade-in group ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Icon */}
                  {m.role === 'assistant' ? (
                    <span className='shrink-0 mt-1'><BotIcon className='w-7 h-7 text-blue-600' /></span>
                  ) : (
                    <span className='shrink-0 mt-1 w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-[10px] font-bold'>YOU</span>
                  )}

                  {/* Bubble */}
                  <div className={`relative max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                      m.role === 'assistant' 
                        ? 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none' 
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}
                  >
                    {/* Content with Markdown */}
                    <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : ''}`}>
                       <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            a: ({node, ...props}) => <Link to={props.href} {...props} className="text-blue-600 hover:underline font-semibold" />
                          }}
                        >
                          {m.content}
                       </ReactMarkdown>
                    </div>

                    {/* Copy Button for Assistant */}
                    {m.role === 'assistant' && (
                      <button
                        title='Sao chép'
                        onClick={async () => {
                           try {
                             await navigator.clipboard.writeText(m.content);
                             setCopiedIdx(i);
                             setTimeout(() => setCopiedIdx(-1), 1500);
                           } catch(err) { console.error("Copy failed", err); }
                        }}
                        className='absolute bottom-2 right-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all'
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    {copiedIdx === i && (
                      <span className='absolute -bottom-6 right-0 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100'>Đã sao chép!</span>
                    )}
                  </div>
                </li>
              ))}
              
              {loading && (
                <li className='flex gap-3 animate-fade-in'>
                  <span className='shrink-0 mt-1'><BotIcon className='w-7 h-7 text-blue-600' /></span>
                  <div className='bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3'>
                    <div className='flex gap-1'>
                      <span className='typing-dot'></span>
                      <span className='typing-dot ml-1'></span>
                      <span className='typing-dot ml-1'></span>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <form className='p-4 border-t bg-white flex gap-3 items-end' onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
               }}
               placeholder='Nhập câu hỏi của bạn...'
               className='flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none max-h-32 min-h-[50px]'
               rows={1}
               disabled={loading}
            />
            <button 
              type='submit' 
              disabled={loading || !input.trim()} 
              className='shrink-0 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition-colors'
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </section>

        <section id='features' className='mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {[
            { title: 'Phân tích hợp đồng', desc: 'AI phát hiện rủi ro pháp lý và cảnh báo điều khoản bất lợi.', color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Tính lương & thuế', desc: 'Công cụ tính Gross/Net và thuế TNCN chính xác nhất.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Tính BHXH', desc: 'Tra cứu quyền lợi bảo hiểm xã hội, thai sản, ốm đau.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { title: 'Tư vấn 24/7', desc: 'Trợ lý AI giải đáp luật lao động mọi lúc mọi nơi.', color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((f, i) => (
            <div key={i} className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1'>
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 ${f.color}`}>
                <svg className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'><rect x='4' y='4' width='16' height='16' rx='3' /></svg>
              </div>
              <div className='font-bold text-gray-900 mb-2'>{f.title}</div>
              <div className='text-sm text-gray-500 leading-relaxed'>{f.desc}</div>
            </div>
          ))}
        </section>

        <section className='mt-16 mb-10'>
          <div className='rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 text-center shadow-lg shadow-blue-200'>
            <h2 className='text-2xl md:text-3xl font-bold mb-4'>Trải nghiệm toàn bộ tính năng mạnh mẽ</h2>
            <p className='opacity-90 mb-8 max-w-2xl mx-auto text-lg'>
              Đăng ký tài khoản miễn phí để lưu lịch sử chat, phân tích hợp đồng không giới hạn và nhận tư vấn chuyên sâu.
            </p>
            <Link to='/register' className='inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-md'>
              Đăng ký miễn phí ngay
            </Link>
          </div>
        </section>

        <footer className='border-t pt-8 pb-10 text-sm text-gray-500'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <div className='flex items-center gap-2 mb-3'>
                <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
                <span className='font-bold text-gray-800'>LaboSupport</span>
              </div>
              <p>Sứ mệnh bảo vệ quyền lợi người lao động Việt Nam thông qua công nghệ AI tiên tiến.</p>
            </div>
            <div>
              <div className='font-bold text-gray-900 mb-3'>Liên hệ</div>
              <p className='mb-1'>Email: support@labosupport.vn</p>
              <p>Hotline: 1900 1234</p>
            </div>
            <div>
              <div className='font-bold text-gray-900 mb-3'>Pháp lý</div>
              <ul className='space-y-1'>
                <li><a href='#' className='hover:text-blue-600'>Điều khoản sử dụng</a></li>
                <li><a href='#' className='hover:text-blue-600'>Chính sách bảo mật</a></li>
              </ul>
            </div>
          </div>
          <div className='mt-8 text-center text-xs border-t pt-4'>
            © 2024 LaboSupport. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}