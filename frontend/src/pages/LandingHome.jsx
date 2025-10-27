import React, { useMemo, useState } from 'react';

const BotIcon = ({ className = 'w-8 h-8 text-blue-600' }) => (
  <svg className={className} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
    <path d='M12 2a1 1 0 011 1v1.05A7.002 7.002 0 0119 11v4a4 4 0 01-4 4h-1a2 2 0 11-4 0H9a4 4 0 01-4-4v-4a7.002 7.002 0 016-6.95V3a1 1 0 011-1zm-5 9a5 5 0 005 5h2a5 5 0 005-5v-.5a5.5 5.5 0 10-12 0V11z' />
  </svg>
);

export default function LandingHome() {
  const [q, setQ] = useState('');
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

  function goAsk(text) {
    const query = encodeURIComponent((text ?? q).trim());
    if (!query) return;
    window.location.href = `/guest-chat?q=${query}`;
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top bar */}
      <header className='border-b bg-white'>
        <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
          <div className='flex items-center gap-2 select-none'>
            <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
            <span className='font-semibold text-gray-800'>LaboSupport</span>
          </div>
          <nav className='hidden sm:flex items-center gap-6 text-sm text-gray-600'>
            <a href='/' className='hover:text-gray-900'>Trang chủ</a>
            <a href='/guest-chat' className='hover:text-gray-900'>AI Chat (Khách)</a>
            <a href='#features' className='hover:text-gray-900'>Tính năng</a>
            <a href='#about' className='hover:text-gray-900'>Giới thiệu</a>
          </nav>
          <div className='flex items-center gap-3 text-sm'>
            <a href='/login' className='px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700'>Đăng nhập</a>
            <a href='/register' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5'>Đăng ký ngay</a>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-4 py-10'>
        {/* Hero */}
        <section className='text-center mb-8'>
          <h1 className='text-[34px] md:text-[40px] font-extrabold leading-tight text-gray-900'>
            Giải Đáp Mọi Thắc Mắc
            <br />
            <span className='text-blue-600'>Lao Động</span> Của Bạn
          </h1>
          <p className='text-gray-600 mt-3 max-w-2xl mx-auto'>
            Hỏi ngay mà không cần đăng ký! AI sẽ tư vấn cho bạn dựa trên luật lao động Việt Nam
          </p>
        </section>

        {/* AI intro card */}
        <section className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-3xl mx-auto'>
          <div className='px-6 py-5 border-b flex items-center gap-3'>
            <span className='p-2 bg-blue-50 rounded-full'><BotIcon /></span>
            <div>
              <div className='font-semibold text-gray-800'>Xin chào! Tôi là trợ lý AI Pháp Lý</div>
              <div className='text-xs text-gray-500'>Hãy đặt câu hỏi, tôi sẽ trả lời ngay.</div>
            </div>
          </div>
          <div className='px-6 py-4 border-b'>
            <div className='text-xs text-gray-500 mb-2'>Gợi ý câu hỏi phổ biến:</div>
            <div className='flex flex-wrap gap-2'>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => goAsk(s)} className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full'>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <form
            className='px-6 py-4 flex gap-2'
            onSubmit={(e) => {
              e.preventDefault();
              goAsk();
            }}
          >
            <input
              type='text'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Nhập câu hỏi của bạn...'
              className='flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-blue-500'
            />
            <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2'>Hỏi ngay</button>
          </form>
        </section>

        {/* Feature cards */}
        <section id='features' className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {[
            {
              title: 'Phân tích hợp đồng',
              desc: 'AI phân tích hợp đồng lao động, phát hiện rủi ro và cảnh báo điều khoản bất lợi.'
            },
            {
              title: 'Tính lương & thuế',
              desc: 'Tính toán lương Gross/Net, thuế TNCN và các khoản bảo hiểm chính xác.'
            },
            {
              title: 'Tính BHXH',
              desc: 'Tính quyền lợi bảo hiểm xã hội: lương hưu, thai sản, ốm đau...'
            },
            {
              title: 'Tư vấn AI 24/7',
              desc: 'Chat với AI để được tư vấn mọi vấn đề pháp lý lao động bất cứ lúc nào.'
            }
          ].map((f, i) => (
            <div key={i} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
              <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3 text-blue-600'>
                <svg className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'><rect x='4' y='4' width='16' height='16' rx='3'/></svg>
              </div>
              <div className='font-semibold text-gray-800'>{f.title}</div>
              <div className='text-sm text-gray-600 mt-1'>{f.desc}</div>
            </div>
          ))}
        </section>

        {/* CTA banner */}
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

        {/* Footer */}
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
