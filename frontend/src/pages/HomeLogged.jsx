import React from 'react';

// Small inline icons
const HomeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
);
const AiIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
);

const AiAnalysisIcon = () => (
  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4"/></svg>
);

const DocIcon = () => (
  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
);
const CalcIcon = () => (
  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M4.879 4.879A12 12 0 1119.121 19.121 12 12 0 014.879 4.879z"/></svg>
);
const BellIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>
);
const ClockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
);

export default function HomeLogged() {
  const isAuthed = Boolean(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));

  const stats = [
    { value: '1,234', label: 'Hợp đồng đã phân tích', icon: DocIcon },
    { value: '5,678', label: 'Câu hỏi đã trả lời', icon: AiIcon },
    { value: '890', label: 'Người dùng hoạt động', icon: UserIcon },
    { value: '2,340h', label: 'Thời gian tiết kiệm', icon: ClockIcon },
    { value: '99.9%', label: 'Độ chính xác AI', icon: AiAnalysisIcon },
  ];

  const activities = [
    { id: 1, title: 'Phân tích hợp đồng lao động', time: '2 giờ trước' },
    { id: 2, title: 'Hỏi về thời gian thử việc', time: 'Hôm qua' },
    { id: 3, title: 'Tính lương tháng 12/2024', time: '2 ngày trước' },
    { id: 4, title: 'Tư vấn về chế độ nghỉ phép', time: '3 ngày trước' },
  ];

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <aside className='fixed h-full w-64 bg-white border-r border-gray-200 flex flex-col'>
        <div className='h-14 px-4 border-b flex items-center gap-2'>
          <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
          <span className='font-semibold text-gray-800'>AI Pháp Lý</span>
        </div>
        <nav className='flex-1 p-3 text-sm'>
          <a href='/home' className='flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium'><HomeIcon/> Trang Chính</a>
          <a href='/user-chat' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'><AiIcon/> Trợ lý AI</a>
          <a href='/contract-analysis' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'><AiAnalysisIcon/> AI Phân Tích Hợp Đồng</a>
          <a href='#' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'><CalcIcon/> Tính lương/thuế</a>
          <a href='/profile' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'><UserIcon/> Hồ sơ cá nhân</a>
          <a href='#' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'><BellIcon/> Thông báo</a>
        </nav>
        <div className='border-t p-3'>
          <a href='/logout' className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50'>
            Đăng xuất
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className='ml-64 p-6 w-full overflow-y-auto'>
        {/* Hero gradient */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white p-7 shadow-sm'>
          <div className='text-xl md:text-2xl font-bold'>Chào mừng đến với AI Pháp Lý</div>
          <p className='opacity-90 mt-1 text-sm md:text-base'>Trợ lý AI thông minh giúp bạn phân tích hợp đồng, tư vấn pháp luật và tính toán lương thuế nhanh chóng.</p>
          <a href='/guest-chat' className='inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-4 py-2 rounded-md mt-4 w-max'>
            Bắt đầu ngay
          </a>
          {!isAuthed && (
            <div className='mt-3 text-xs text-white/80'>Bạn đang xem bản demo. <a className='underline' href='/login'>Đăng nhập</a> để lưu dữ liệu.</div>
          )}
        </div>

        {/* Quick actions */}
        <h2 className='mt-6 mb-3 font-semibold text-gray-800'>Thao tác nhanh</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition'>
            <div className='flex items-center gap-3 mb-2'>
              <span className='p-2 bg-blue-100 rounded-lg'><DocIcon/></span>
              <div>
                <div className='font-semibold text-gray-800'>Trợ lý AI</div>
                <p className='text-sm text-gray-600'>Upload hợp đồng và chat với AI để phân tích</p>
              </div>
            </div>
            <a className='text-blue-600 font-medium text-sm' href='/guest-chat'>Sử dụng ngay</a>
          </div>
          <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition'>
            <div className='flex items-center gap-3 mb-2'>
              <span className='p-2 bg-green-100 rounded-lg'><CalcIcon/></span>
              <div>
                <div className='font-semibold text-gray-800'>Tính Lương & Thuế</div>
                <p className='text-sm text-gray-600'>Tính lương thực nhận, bảo hiểm và thuế</p>
              </div>
            </div>
            <a className='text-green-600 font-medium text-sm' href='#'>Sử dụng ngay</a>
          </div>
        </div>

        {/* Stats */}
        <h2 className='mt-6 mb-3 font-semibold text-gray-800'>Thống kê hệ thống</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {stats.map((s, i) => (
            <div key={i} className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center'>
              <div className='mx-auto mb-1'><s.icon/></div>
              <div className='text-2xl font-bold text-gray-900'>{s.value}</div>
              <div className='text-xs text-gray-600 mt-1'>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent + Tips */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6'>
          <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
            <div className='font-semibold text-gray-800 mb-3'>Hoạt động gần đây</div>
            <ul className='space-y-4'>
              {activities.map((a) => (
                <li key={a.id} className='flex items-start gap-3'>
                  <span className='p-1.5 bg-gray-100 rounded-full border'><ClockIcon/></span>
                  <div>
                    <div className='text-sm font-medium text-gray-800'>{a.title}</div>
                    <div className='text-xs text-gray-500'>{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
            <div className='font-semibold text-gray-800 mb-3'>Mẹo & Cập nhật</div>
            <div className='space-y-3 text-sm'>
              <div className='p-3 rounded-md bg-blue-50 border border-blue-100'>Cập nhật mới: Bộ Luật Lao động 2019 có hiệu lực từ 01/01/2021 với nhiều điểm mới quan trọng.</div>
              <div className='p-3 rounded-md bg-green-50 border border-green-100'>Mẹo sử dụng: Upload hợp đồng định dạng PDF để có kết quả phân tích chính xác nhất.</div>
              <div className='p-3 rounded-md bg-yellow-50 border border-yellow-100'>Lưu ý: Lương tối thiểu vùng được cập nhật định kỳ theo quy định của Chính phủ.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
