import React from 'react';
import registerBg from '../assets/registerBg.png';
import logoImg from '../assets/logo.png';

export default function LandingHome() {
  return (
    <div className='min-h-screen bg-[#F5F8FB]'>
      {/* Navbar */}
      <header className='bg-white/90 backdrop-blur border-b'>
        <div className='max-w-7xl mx-auto h-16 px-4 flex items-center justify-between'>
          <a href='/' className='flex items-center gap-2 select-none'>
            <img src={logoImg} alt='LaboSupport' className='h-8 w-auto' />
          </a>
          <nav className='hidden md:flex items-center gap-8 text-sm text-gray-700'>
            <a href='#about' className='hover:text-gray-900'>Giới thiệu</a>
            <a href='/guest-chat' className='hover:text-gray-900'>Trợ lý AI</a>
            <a href='#features' className='hover:text-gray-900'>Tính năng</a>
          </nav>
          <div className='flex items-center gap-3 text-sm'>
            <a href='/login' className='px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700'>Đăng nhập</a>
            <a href='/register' className='bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5'>Đăng ký</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='max-w-7xl mx-auto px-4 pt-10 md:pt-14'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          <div>
            <div className='flex items-center gap-2 text-xs text-gray-500 mb-3'>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-white border rounded-full'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-500'></span> 50,000+ workers
              </span>
            </div>
            <h1 className='text-4xl md:text-5xl font-extrabold leading-tight text-gray-900'>
              Hỗ trợ người lao động
              <br />
              <span className='text-blue-600'>Cùng nhau phát triển</span>
            </h1>
            <p className='text-gray-600 mt-4 max-w-xl'>
              Tiếp cận hướng dẫn, thông tin về quyền lợi và các tài nguyên nghề nghiệp bạn cần để phát triển tại nơi làm việc. Tham gia cộng đồng tin cậy nơi mọi người lao động đều xứng đáng được hỗ trợ, tôn trọng và có cơ hội.
            </p>
            <div className='mt-6 flex items-center gap-3'>
              <a href='/guest-chat' className='bg-[#0B74FF] hover:bg-[#095ed1] text-white font-semibold px-4 py-2 rounded-md'>Get Support Now</a>
              <a href='#features' className='px-4 py-2 rounded-md border border-gray-300 hover:bg-white text-gray-700'>Learn More</a>
            </div>
            <div className='mt-6 grid grid-cols-3 max-w-md text-sm'>
              <div>
                <div className='text-lg font-bold text-gray-900'>50K+</div>
                <div className='text-gray-500'>Người lao động</div>
              </div>
              <div>
                <div className='text-lg font-bold text-gray-900'>98%</div>
                <div className='text-gray-500'>Tỷ lệ thành công</div>
              </div>
              <div>
                <div className='text-lg font-bold text-gray-900'>24/7</div>
                <div className='text-gray-500'>Hỗ trợ</div>
              </div>
            </div>
          </div>

          <div className='relative'>
            <div className='rounded-2xl overflow-hidden shadow-sm border bg-white p-2'>
              <img src={registerBg} alt='teamwork' className='rounded-xl w-full h-[320px] object-cover' />
            </div>
            <div className='absolute -top-3 left-6 bg-white shadow-sm border rounded-full px-3 py-1 text-xs flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-green-500'></span> Quyền lợi được bảo vệ
            </div>
            <div className='absolute -bottom-3 right-6 bg-white shadow-sm border rounded-full px-3 py-1 text-xs flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-blue-500'></span> Hỗ trợ cộng đồng
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id='features' className='max-w-7xl mx-auto px-4 mt-12'>
        <div className='rounded-2xl bg-white/70 border p-6 md:p-10'>
          <h2 className='text-center text-2xl md:text-3xl font-semibold text-gray-900'>
            Trao Quyền Cho Người Lao Động Qua <span className='text-blue-600'>Kiến thức & Cộng đồng</span>
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
            {[
              { title: 'Hiểu Rõ Quyền Lợi', desc: 'Hướng dẫn dễ hiểu giúp bạn nắm rõ quyền lợi và nghĩa vụ trong công việc.' },
              { title: 'Tiếp Cận Tài Nguyên', desc: 'Tài liệu, mẫu biểu, công cụ tính hữu ích phục vụ nhu cầu thực tế.' },
              { title: 'Kết Nối Cộng Đồng', desc: 'Nơi trao đổi kinh nghiệm, nhận hỗ trợ từ cộng đồng cùng quan tâm.' },
              { title: 'Tìm Kiếm Đào Tạo', desc: 'Khóa học, tài liệu để nâng cao kỹ năng và cơ hội nghề nghiệp.' },
            ].map((f, i) => (
              <div key={i} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow'>
                <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 text-blue-600'>
                  <svg className='w-6 h-6' viewBox='0 0 24 24' fill='currentColor'><rect x='4' y='4' width='16' height='16' rx='3'/></svg>
                </div>
                <div className='font-semibold text-gray-900'>{f.title}</div>
                <div className='text-sm text-gray-600 mt-1'>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics bar */}
      <section className='max-w-7xl mx-auto px-4 mt-10'>
        <div className='rounded-2xl p-6 md:p-8 text-white' style={{background: 'linear-gradient(90deg,#071a2c,#0b5bbf)'}}>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
            <div>
              <div className='text-2xl font-bold'>50,000+</div>
              <div className='text-sm opacity-90'>Người lao động</div>
            </div>
            <div>
              <div className='text-2xl font-bold'>1,200+</div>
              <div className='text-sm opacity-90'>Tài Nguyên Đào Tạo</div>
            </div>
            <div>
              <div className='text-2xl font-bold'>24/7</div>
              <div className='text-sm opacity-90'>Hỗ trợ 24/7</div>
            </div>
            <div>
              <div className='text-2xl font-bold'>98%</div>
              <div className='text-sm opacity-90'>Độ hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='max-w-7xl mx-auto px-4 mt-14 border-t pt-8 text-sm text-gray-600'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <img src={logoImg} alt='LaboSupport' className='h-7 w-auto' />
            </div>
            <p>Trợ lý pháp lý AI thông minh cho người lao động Việt Nam</p>
          </div>
          <div>
            <div className='font-semibold text-gray-800 mb-2'>Liên hệ</div>
            <p>Email: support@gmail.com</p>
            <p>Hotline: 1900 xxxx</p>
          </div>
          <div>
            <div className='font-semibold text-gray-800 mb-2'>Pháp lý</div>
            <p>Điều khoản sử dụng</p>
            <p>Chính sách bảo mật</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
