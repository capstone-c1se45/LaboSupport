import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import logoImg from '../assets/logo.png'; 

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
// -------------------------------------------------------------------

export default function GuestChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI Pháp Lý. Hãy đặt câu hỏi về luật lao động Việt Nam.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [sessionId, setSessionId] = useState(`guest_${Date.now()}`); // Tạo session ID tạm cho khách
  const listRef = useRef(null);

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

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (!listRef.current) return;
    try {
        // Delay nhẹ để DOM cập nhật
       setTimeout(() => {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
       }, 50);
    } catch {
       setTimeout(() => {
         listRef.current.scrollTop = listRef.current.scrollHeight;
       }, 50);
    }
  }, [messages, loading]);

  // Hàm xử lý gửi tin nhắn
  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput(''); // Xóa input sau khi gửi
    setLoading(true);

    try {
      // *** THAY ĐỔI CHÍNH: Gọi API backend /api/ai/guest-chat ***
      const response = await api.post('/ai/guest-chat', { // Đảm bảo endpoint này tồn tại và không cần xác thực
        message: content,
        session_id: sessionId // Gửi session ID hiện tại
      });
      // -------------------------------------------------------

      // Lấy câu trả lời từ response của backend
      const aiReply = response.data?.data?.reply || 'Xin lỗi, tôi chưa có câu trả lời.';
      const newSessionId = response.data?.data?.session_id; 

      if (newSessionId) {
        setSessionId(newSessionId); 
      }

      const assistantMsg = { role: 'assistant', content: aiReply };
      setMessages((prev) => [...prev, assistantMsg]);

    } catch (err) {
      console.error("Error sending guest message:", err);
      // Hiển thị lỗi cho người dùng
      const errorMsg = { role: 'assistant', content: 'Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý query param `?q=` (giữ nguyên)
  const { search } = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(search).get('q');
    if (q) {
        // Đặt câu hỏi vào input và tự động gửi sau một khoảng trễ ngắn
        setInput(q);
        setTimeout(() => handleSend(q), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Chỉ chạy khi search param thay đổi

  // --- Phần Render JSX giữ nguyên cấu trúc ---
  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='border-b bg-white'>
        <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-2 select-none'>
            <img src={logoImg} alt='LaboSupport' className='h-8 w-auto' />
          </div>
          <nav className='hidden sm:flex items-center gap-6 text-sm text-gray-600'>
            <a href='/' className='hover:text-gray-900'>Trang chủ</a>
            <a href='/guest-chat' className='text-gray-900 font-medium'>AI Chat (Khách)</a>
            <a href='#features' className='hover:text-gray-900'>Tính năng</a>
            <a href='#about' className='hover:text-gray-900'>Giới thiệu</a>
          </nav>
          <div className='flex items-center gap-3 text-sm'>
            <a href='/login' className='px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700'>Đăng nhập</a>
            <a href='/register' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5'>Đăng ký ngay</a>
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

          <div className='px-5 py-3 border-b'>
            <div className='text-xs text-gray-500 mb-2'>Gợi ý câu hỏi phổ biến:</div>
            <div className='flex flex-wrap gap-2'>
              {suggestions.map((s, idx) => (
                <button key={idx} className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full' onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div ref={listRef} className='px-5 py-5 h-[48vh] overflow-y-auto bg-gray-50/60 chat-scroll'>
            <ul className='space-y-4'>
              {messages.map((m, i) => (
                <li key={i} className='flex gap-3 animate-fade-in group'> {/* Thêm group để hover copy button */}
                  {m.role === 'assistant' ? (
                    <span className='shrink-0 mt-1'><BotIcon className='w-6 h-6 text-blue-600' /></span>
                  ) : (
                    <span className='shrink-0 mt-1'><div className='w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs'>You</div></span>
                  )}
                  <div className={m.role === 'assistant' ? 'relative bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 max-w-[80%]' : 'bg-blue-600 text-white rounded-lg px-3 py-2 text-sm ml-auto max-w-[80%]'}>
                     {/* Sử dụng pre để giữ định dạng xuống dòng từ AI */}
                    <pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
                    {m.role === 'assistant' && (
                      <button
                        title='Sao chép'
                        onClick={async () => {
                           try {
                             // Sử dụng clipboard API nếu có, fallback về execCommand
                             if (navigator.clipboard && window.isSecureContext) {
                               await navigator.clipboard.writeText(m.content);
                             } else {
                               const textArea = document.createElement("textarea");
                               textArea.value = m.content;
                               textArea.style.position = "fixed"; // Prevent scrolling to bottom
                               document.body.appendChild(textArea);
                               textArea.focus();
                               textArea.select();
                               document.execCommand('copy');
                               document.body.removeChild(textArea);
                             }
                             setCopiedIdx(i);
                             setTimeout(() => setCopiedIdx(-1), 1200);
                           } catch(err) {
                             console.error("Failed to copy text:", err);
                             // Có thể hiển thị thông báo lỗi copy
                           }
                        }}
                        className='absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity' // Hiện khi hover group li
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

          <form className='px-4 py-4 border-t bg-white flex gap-2' onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input
               type='text'
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder='Nhập câu hỏi của bạn...'
               className='flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-blue-500'
               disabled={loading} // Disable input khi đang chờ AI
            />
            <button type='submit' disabled={loading || !input.trim()} className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md'>
              <SendIcon /> Gửi
            </button>
          </form>
        </section>

        <section id='features' className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {[
            { title: 'Phân tích hợp đồng', desc: 'AI phân tích hợp đồng lao động, phát hiện rủi ro và cảnh báo điều khoản bất lợi.', color: 'text-blue-600' },
            { title: 'Tính lương & thuế', desc: 'Tính toán lương Gross/Net, thuế TNCN và các khoản bảo hiểm chính xác.', color: 'text-indigo-600' },
            { title: 'Tính BHXH', desc: 'Tính quyền lợi bảo hiểm xã hội: lương hưu, thai sản, ốm đau...', color: 'text-emerald-600' },
            { title: 'Tư vấn AI 24/7', desc: 'Chat với AI để được tư vấn mọi vấn đề pháp lý lao động bất cứ lúc nào.', color: 'text-purple-600' },
          ].map((f, i) => (
            <div key={i} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
              <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 ${f.color}`}>
                <svg className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'><rect x='4' y='4' width='16' height='16' rx='3' /></svg>
              </div>
              <div className='font-semibold text-gray-800'>{f.title}</div>
              <div className='text-sm text-gray-600 mt-1'>{f.desc}</div>
            </div>
          ))}
        </section>

        <section className='mt-12'>
          <div className='rounded-2xl bg-blue-600 text-white p-8 text-center'>
            <div className='text-lg font-semibold'>Sẵn sàng trải nghiệm đầy đủ tính năng?</div>
            <p className='opacity-90 mt-2'>
              Đăng ký ngay để phân tích hợp đồng, tính lương/thuế, tính BHXH và tư vấn chi tiết từ AI
            </p>
            <a href='/register' className='inline-block mt-6 bg-white text-blue-700 font-semibold px-6 py-2 rounded-md hover:bg-gray-100'>
              Đăng ký miễn phí
            </a>
          </div>
        </section>

        <footer className='mt-14 border-t pt-8 text-sm text-gray-600'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
                <span className='font-semibold text-gray-800'>LaboSupport</span>
              </div>
              <p>Trợ lý pháp lý AI thông minh cho người lao động Việt Nam</p>
            </div>
            <div>
              <div className='font-semibold text-gray-800 mb-2'>Liên hệ</div>
              <p>Email: support@gmail.com</p>
              <p>Hotline: 1900 xxxx</p>
            </div>
            <div>
              <div className='font-semibold text-gray-800 mb-2'>Pháp Lý</div>
              <p>Điều khoản sử dụng</p>
              <p>Chính sách bảo mật</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}




