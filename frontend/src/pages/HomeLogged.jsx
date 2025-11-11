import React from 'react';
import NavbarLogged from '../components/NavbarLogged';
import logoImg from '../assets/logo.png';

const StatCard = ({ color = 'from-blue-500 to-indigo-600', icon, label, value }) => (
  <div className="rounded-xl p-5 text-white shadow-sm border border-blue-300/20" style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}>
    <div className={`bg-white/15 w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
    <div className="text-sm/5 opacity-95">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    <style>{`.from-blue-500{--tw-gradient-from:#3b82f6}.to-indigo-600{--tw-gradient-to:#4f46e5}.from-sky-500{--tw-gradient-from:#0ea5e9}.to-blue-600{--tw-gradient-to:#2563eb}.from-cyan-500{--tw-gradient-from:#06b6d4}.to-sky-600{--tw-gradient-to:#0284c7}.from-blue-600{--tw-gradient-from:#2563eb}.to-sky-700{--tw-gradient-to:#0369a1}.`}</style>
  </div>
);

const QuickCard = ({ title, desc, href }) => (
  <div className="bg-white rounded-2xl border border-blue-200/40 shadow-sm p-5">
    <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-3">
      <svg className="w-6 h-6 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
    </div>
    <div className="font-semibold text-gray-900">{title}</div>
    <div className="text-sm text-gray-600 mt-1 mb-4">{desc}</div>
    <a href={href} className="inline-flex items-center justify-center rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 font-medium">
      Sử dụng ngay
    </a>
  </div>
);

export default function HomeLogged() {
  const stats = [
    { label: 'Hợp đồng đã phân tích', value: '24', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 2h8a2 2 0 012 2v16l-6-3-6 3V4a2 2 0 012-2z"/></svg>, color: 'from-blue-500 to-indigo-600' },
    { label: 'Câu hỏi đã tư vấn', value: '24', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 14h-2v-2h2v2zm1.07-7.75a2.5 2.5 0 00-4.15 1.85h2a.5.5 0 01.5-.5c.28 0 .5.22.5.5 0 .5-.5.75-.86 1.02-.5.38-1.14.86-1.14 1.98V14h2v-.4c0-.5.5-.75.86-1.02.5-.38 1.14-.86 1.14-1.98 0-1.16-.71-2.18-1.85-2.35z"/></svg>, color: 'from-sky-500 to-blue-600' },
    { label: 'Lương đã tính', value: '24', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4v6c0 5-4 9-9 12C7 20 3 16 3 11V5l9-4zm0 5l-6 3v2c0 3.31 2.69 6.31 6 8.88 3.31-2.57 6-5.57 6-8.88V9l-6-3z"/></svg>, color: 'from-cyan-500 to-sky-600' },
    { label: 'Rủi ro phát hiện', value: '24', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"/></svg>, color: 'from-blue-600 to-sky-700' },
  ];

  const activities = [
    { id: 1, title: 'Đã phân tích hợp đồng: HD_KyThuatVien_2024.pdf', time: '2 giờ trước' },
    { id: 2, title: 'Đã tư vấn: Thời gian thử việc cho kỹ sư', time: '5 giờ trước' },
    { id: 3, title: 'Đã tính lương gross sang net: 18.245.000 VND', time: '1 ngày trước' },
    { id: 4, title: 'Phát hiện rủi ro trong hợp đồng: Thiếu điều khoản về OT', time: '2 ngày trước' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FB]">
      <NavbarLogged />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chào mừng đến với Hệ thống Quản lý Hợp đồng Lao động</h1>
        <p className="text-gray-600 mt-1">Nền tảng AI hỗ trợ phân tích hợp đồng, tư vấn luật lao động và tính toán lương</p>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((s, i) => (
            <div key={i} className={`${s.color}`}>
              <StatCard color={s.color} label={s.label} value={s.value} icon={s.icon} />
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-4">Thao tác nhanh</h2>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickCard
            title="Trợ lý AI"
            desc="Tải lên & phân tích hợp đồng lao động bằng AI. Phát hiện rủi ro và nêu ra khuyến nghị quan trọng."
            href="/user-chat"
          />
          <QuickCard
            title="Tính Lương & Thuế"
            desc="Chat với AI để tìm hiểu về các quy định pháp luật lao động Việt Nam."
            href="/salary"
          />
          <QuickCard
            title="Tính bảo hiểm xã hội"
            desc="Tính toán lương thực nhận, bảo hiểm và thuế."
            href="/salary?calc=bhxh"
          />
        </section>

        {/* Recent activity */}
        <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-4">Hoạt động gần đây</h2>
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <ul className="divide-y">
            {activities.map((a) => (
              <li key={a.id} className="p-4 flex items-start gap-3">
                <span className="mt-0.5 p-1.5 bg-gray-100 rounded-full border">
                  <svg className="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t pt-8 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img src={logoImg} alt="LaboSupport" className="h-7 w-auto" />
              </div>
              <p>Trợ lý pháp lý AI thông minh cho người lao động Việt Nam</p>
            </div>
            <div>
              <div className="font-semibold text-gray-800 mb-2">Liên hệ</div>
              <p>Email: support@gmail.com</p>
              <p>Hotline: 1900 xxxx</p>
            </div>
            <div>
              <div className="font-semibold text-gray-800 mb-2">Pháp lý</div>
              <p>Điều khoản sử dụng</p>
              <p>Chính sách bảo mật</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

