import React from 'react';
// Đã xóa: import { Link } from 'react-router-dom';

// --- Placeholder SVG Icons ---
// 
const HomeIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>;
// 
const AiIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;
// 
const TaxIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-.567-.267zM11.567 7.15c.221.07.412.164.567.267C11.72 7.001 11 6.456 11 5.655V4a1 1 0 00-2 0v1.655c0 .801-.72 1.346-1.567.925C7.418 6.433 7.15 6.221 7 6V4a1 1 0 00-2 0v2c0 .221.07.412.267.567C5.346 6.72 5.655 7 6 7h1v1H6c-.345 0-.654.28-.925.433-.103.155-.196.346-.267.567H4a1 1 0 000 2h.808c.071.221.164.412.267.567.271.153.58.433.925.433H7v1H6c-.345 0-.654.28-.925.433-.103.155-.196.346-.267.567H4a1 1 0 000 2h.808c.071.221.164.412.267.567.271.153.58.433.925.433H7v1.345A3.501 3.501 0 0010 17.5a3.5 3.5 0 003-1.655V14h.075c.345 0 .654-.28.925-.433.103-.155.196.346.267-.567H15a1 1 0 100-2h-.808c-.071-.221-.164-.412-.267-.567-.271-.153-.58-.433-.925-.433H13v-1h.075c.345 0 .654-.28.925-.433.103-.155.196.346.267-.567H15a1 1 0 100-2h-.808c-.071-.221-.164-.412-.267-.567-.271-.153-.58-.433-.925-.433H13V7h.075c.345 0 .654-.28.925-.433.103-.155.196.346.267-.567H15a1 1 0 100-2h-.808c-.071-.221-.164-.412-.267-.567C13.654 4.28 13.345 4 13 4h-1V2.655A3.501 3.501 0 0010 1a3.5 3.5 0 00-3 1.655V4h-.075c-.345 0-.654.28-.925.433C5.897 4.588 5.804 4.779 5.733 5H5a1 1 0 100 2h.808c.071.221.164.412.267.567.271.153.58.433.925.433H7v1h1.433zM10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8.567 9.433c.155.103.346.196.567.267v1.698c-.221.071-.412.164-.567.267C8.72 11.72 9 12.03 9 12.345V14H8c-.801 0-1.346-.72-1.655-1.567C6.418 12.418 6.15 12.206 6 12v-2c0-.206.15-.418.445-.567C6.654 9.28 7.199 9 8 9h.567zM11.433 11.72c.155-.103.346-.196.567-.267v-1.698c-.221-.071-.412-.164-.567-.267C11.28 9.28 11 8.97 11 8.655V7h1c.801 0 1.346.72 1.655 1.567C13.582 8.582 13.85 8.794 14 9v2c0 .206-.15.418-.445.567C13.346 11.72 12.801 12 12 12h-.567zM10 14.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"></path></svg>;
// 
const BellIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>;
// 
const UserIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>;
// 
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
// 
const UserCircleIcon = () => <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd"></path></svg>;
// 
const DocumentIcon = () => <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
// 
const CalculatorIcon = () => <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M4.879 4.879A12 12 0 1119.121 19.121 12 12 0 014.879 4.879z"></path></svg>;
// 
const ClockIcon = () => <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>;
// --- End Icons ---

export default function Home() {

  // --- Mock Data ---
  const stats = [
    { value: "1,234", label: "Hợp đồng đã phân tích", icon: DocumentIcon },
    { value: "5,678", label: "Câu hỏi đã trả lời", icon: AiIcon },
    { value: "890", label: "Người dùng", icon: UserIcon },
    { value: "2,340h", label: "Thời gian được tiết kiệm", icon: ClockIcon },
  ];

  const recentActivities = [
    { id: 1, title: "Phân tích hợp đồng lao động", time: "2 giờ trước" },
    { id: 2, title: "Hỏi về thời gian thử việc", time: "Hôm qua" },
    { id: 3, title: "Tính lương tháng 12/2024", time: "2 ngày trước" },
    { id: 4, title: "Tư vấn về chế độ nghỉ phép", time: "3 ngày trước" },
  ];

  const initialTips = [
      { type: "Mẹo hay", text: "Luôn đọc kỹ và yêu cầu giải thích rõ các điều khoản trước khi ký hợp đồng lao động." },
      { type: "Tin tức", text: "Bộ Luật Lao động 2019 có hiệu lực từ 01/01/2021 với nhiều điểm mới quan trọng." },
      { type: "Lưu ý", text: "Lương tối thiểu vùng được cập nhật định kỳ theo quy định của Chính phủ." },
  ];
  // --- End Mock Data ---


  return (
    <div className="flex h-screen bg-gray-100 font-sans">

      {/* Sidebar */}
      <aside className="fixed h-full w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-md p-2 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3-1m6 0l3 1m0 0l-3 9a5.002 5.002 0 01-6.001 0M18 7l3-1m-3 1l-3 9M3 15h18M6 11l-1 4h2l1-4m8 0l-1 4h2l1-4M9 11v4M15 11v4" />
             </svg>
          </div>
          <span className="text-xl font-semibold text-gray-800 tracking-tight">LaborSupport</span>
        </div>

        {/* Navigation Menu - Use <a> tags instead of <Link> */}
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {/* Active Link Example (Home) */}
          <a
            href="/" // Use href for standard link
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg group"
          >
            <HomeIcon />
            <span className="ml-3">Trang Chính</span>
          </a>
          {/* Inactive Link Examples */}
          <a
             href="/ai-tool" // Use href
             className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
          >
            <AiIcon />
            <span className="ml-3">Trợ lý AI</span>
          </a>
          <a
            href="/tax-tool" // Use href
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
          >
            <TaxIcon />
            <span className="ml-3">Tính Lương/Thuế</span>
          </a>
          <a
            href="/notifications" // Use href
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
          >
            <BellIcon />
            <span className="ml-3">Thông báo</span>
          </a>
           <a
             href="/profile" // Use href
             className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 group"
            >
            <UserIcon />
            <span className="ml-3">Hồ sơ cá nhân</span>
          </a>
        </nav>

        {/* User Info / Logout Section */}
        <div className="p-4 border-t mt-auto">
           <div className="flex items-center mb-4">
             <UserCircleIcon />
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-800">Người dùng</p>
               {/* Use <a> tag for profile link */}
               <a href="/profile" className="text-xs text-gray-500 hover:underline cursor-pointer">Xem hồ sơ</a>
             </div>
           </div>
           {/* Logout button (can remain a button or be an <a> tag styled as a button) */}
           <button className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-800 group transition-colors duration-150">
            <LogoutIcon />
            <span className="ml-3">Đăng xuất</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto bg-gray-50">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6 rounded-xl shadow-lg mb-8">
          <h1 className="text-2xl font-semibold mb-2">Chào mừng đến với AI Pháp Lý</h1>
          <p className="text-blue-100 mb-4 text-sm">
            Trợ lý AI thông minh giúp bạn phân tích hợp đồng, tư vấn pháp luật và tính toán lương/thuế một cách chính xác và nhanh chóng.
          </p>
          {/* This button likely triggers an action within the page or navigates, keep as button for now */}
          <button className="bg-white text-blue-700 font-semibold py-2 px-5 rounded-md hover:bg-blue-50 transition shadow text-sm">
            Bắt đầu ngay <span aria-hidden="true" className="ml-1">→</span>
          </button>
        </div>

        {/* Quick Actions Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI Assistant Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <span className="p-2 bg-blue-100 rounded-lg mr-4">
                 <DocumentIcon />
              </span>
              <h3 className="text-lg font-semibold text-gray-800">Trợ lý AI</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5">Upload hợp đồng và chat với AI để tư vấn pháp luật.</p>
             {/* Use <a> tag styled as a button if it navigates, or keep as button if it triggers an action */}
            <a href="/ai-tool" className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">Sử dụng ngay</a>
          </div>
          {/* Tax Calculator Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
             <div className="flex items-center mb-4">
               <span className="p-2 bg-green-100 rounded-lg mr-4">
                 <CalculatorIcon />
               </span>
               <h3 className="text-lg font-semibold text-gray-800">Công cụ Tính Lương & Thuế</h3>
             </div>
             <p className="text-gray-600 text-sm mb-5">Tính lương NET/GROSS, các loại bảo hiểm, thuế TNCN.</p>
              {/* Use <a> tag styled as a button if it navigates */}
             <a href="/tax-tool" className="text-green-600 font-semibold text-sm hover:text-green-800 transition-colors">Sử dụng ngay</a>
          </div>
        </div>

        {/* System Stats Section */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Thống kê hệ thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => (
             <div key={index} className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col items-center text-center">
               <div className="text-blue-600 mb-2"><stat.icon className="w-6 h-6" /></div>
               <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
               <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
             </div>
          ))}
        </div>

        {/* Recent Activities & Tips Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">Hoạt động gần đây</h3>
            <ul className="space-y-5">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center">
                  <span className="p-1.5 bg-gray-100 rounded-full mr-3 border border-gray-200">
                     <ClockIcon />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips & Updates Card (Static Content Only) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold text-gray-800">Mẹo & Cập nhật</h3>
                 {/* AI refresh button removed */}
             </div>
             {/* Static tip examples */}
             <div className="space-y-3">
               {initialTips.map((tip, index) => (
                  <div key={index} className="flex items-start">
                     <span
                       className={`text-xs font-semibold px-2 py-0.5 rounded mr-2 mt-0.5 whitespace-nowrap ${
                         tip.type === "Mẹo hay" ? "bg-blue-100 text-blue-700" :
                         tip.type === "Tin tức" ? "bg-green-100 text-green-700" :
                         "bg-yellow-100 text-yellow-800" // Lưu ý
                       }`}
                     >
                       {tip.type}
                     </span>
                     <p className="text-xs text-gray-600">{tip.text}</p>
                   </div>
               ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

