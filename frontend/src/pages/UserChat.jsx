import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api-client';
import NavbarLogged from '../components/NavbarLogged';

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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const [sessionId, setSessionId] = useState(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Bảo vệ route: cần token
  useEffect(() => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { replace: true });
    } else {
      fetchHistory();
    }
  }, [navigate]);

  // Lấy lịch sử chat
  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const response = await api.get('/ai/chat/history');
      if (response.data?.data) setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([{ role: 'assistant', content: 'Xin lỗi! Có lỗi xảy ra khi tải lịch sử chat.' }]);
    } finally {
      setHistoryLoading(false);
      setMessages((prev) => (prev.length === 0 ? [{ role: 'assistant', content: 'Chào bạn! Mình có thể giúp gì về Luật Lao động Việt Nam?' }] : prev));
    }
  }

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (!listRef.current || historyLoading) return;
    try {
      setTimeout(() => {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    } catch {
      setTimeout(() => {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 50);
    }
  }, [messages, loading, historyLoading]);

  // Gửi tin nhắn
  async function handleSend(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: content, session_id: sessionId });
      const aiReply = response.data?.data?.reply || 'Xin lỗi, mình chưa có câu trả lời.';
      const newSessionId = response.data?.data?.session_id;
      if (newSessionId) setSessionId(newSessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Có lỗi xảy ra. Vui lòng thử lại.' }]);
      if (err.response?.status === 401) navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-[#F5F8FB]'>
      <NavbarLogged />

      <main className='max-w-5xl mx-auto px-4 py-6'>
        <section className='relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
          {/* Thanh công cụ trái mảnh */}
          <div className='hidden sm:flex flex-col gap-3 absolute left-0 top-0 bottom-0 w-10 items-center pt-6 border-r bg-gray-50/80'>
            <button className='w-7 h-7 rounded-md hover:bg-gray-200 text-gray-600' title='Menu'>
              <svg className='w-5 h-5 mx-auto' viewBox='0 0 20 20' fill='currentColor'><path d='M3 6h14M3 10h14M3 14h14'/></svg>
            </button>
            <button className='w-7 h-7 rounded-md hover:bg-gray-200 text-gray-600' title='Ghi chú'>
              <svg className='w-5 h-5 mx-auto' viewBox='0 0 24 24' fill='currentColor'><path d='M4 17.17V21h3.83l9.9-9.9-3.83-3.83L4 17.17zM20.71 7.04a1 1 0 000-1.41L18.37 3.29a1 1 0 00-1.41 0l-1.83 1.83 3.83 3.83 1.75-1.91z'/></svg>
            </button>
          </div>

          {/* Khu vực danh sách tin nhắn */}
          <div ref={listRef} className='sm:ml-10 p-6 min-h-[60vh] max-h-[70vh] overflow-y-auto'>
            {(!historyLoading && messages.length === 0) && (
              <div className='py-16 text-center'>
                <h2 className='text-2xl md:text-3xl font-bold text-blue-700'>LaboSupport,</h2>
                <p className='text-xl md:text-2xl text-blue-700 mt-2'>Người bạn đồng hành giúp bạn hiểu luật lao động</p>
              </div>
            )}

            <ul className='space-y-5'>
              {historyLoading && (
                <li className='text-center text-gray-500 text-sm'>Đang tải lịch sử chat...</li>
              )}
              {!historyLoading && messages.map((m, i) => (
                <li key={i} className='flex gap-3 items-start'>
                  {m.role === 'assistant' ? (
                    <span className='shrink-0 mt-1'><BotIcon className='w-6 h-6 text-blue-600' /></span>
                  ) : (
                    <span className='shrink-0 mt-1'><div className='w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs'>Bạn</div></span>
                  )}
                  <div className={m.role === 'assistant' ? 'relative bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 max-w-[80%]' : 'bg-blue-600 text-white rounded-xl px-3 py-2 text-sm ml-auto max-w-[80%]'}>
                    <pre className='whitespace-pre-wrap font-sans'>{m.content}</pre>
                    {m.role === 'assistant' && (
                      <button
                        title='Sao chép'
                        onClick={async () => { try { await navigator.clipboard.writeText(m.content); setCopiedIdx(i); setTimeout(() => setCopiedIdx(-1), 1200); } catch {} }}
                        className='absolute -top-2 -right-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded p-1 shadow-sm'
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
                <li className='flex gap-3'>
                  <span className='shrink-0 mt-1'><BotIcon className='w-6 h-6 text-blue-600' /></span>
                  <div className='bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 max-w-[80%]'>
                    <span className='inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce'></span>
                    <span className='inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce ml-1' style={{animationDelay: '100ms'}}></span>
                    <span className='inline-block w-2 h-2 rounded-full bg-gray-400 animate-bounce ml-1' style={{animationDelay: '200ms'}}></span>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Ô nhập */}
          <form className='sm:ml-10 p-4 border-t bg-white flex items-center gap-2' onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <div className='relative flex-1'>
              <input
                type='text'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Hỏi Labo'
                className='w-full rounded-full border border-gray-300 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loading}
              />
              <button type='submit' disabled={loading || !input.trim()}
                className='absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-50'>
                <SendIcon />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
