import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarLogged from '../components/NavbarLogged';
import { api } from '../lib/api-client';

// Helper format thời gian
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / 1000; // seconds

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export default function HomeLogged() {
  const [user, setUser] = useState({ full_name: 'Người dùng' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    contractCount: 0,
    questionCount: 0,
    recentContracts: [],
    recentConvos: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Lấy thông tin user cơ bản
        const profileRes = await api.get('/profile');
        if (profileRes?.data?.data) {
          setUser(profileRes.data.data);
        }

        // 2. Lấy số liệu thống kê
        const statsRes = await api.get('/profile/stats');
        if (statsRes?.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch home data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Gộp hợp đồng và chat thành danh sách hoạt động chung
  const activities = [
    ...stats.recentContracts.map(c => ({
      type: 'contract',
      title: 'Phân tích hợp đồng',
      subtitle: c.original_name,
      date: c.uploaded_at,
      link: '/contracts' // Có thể dẫn tới trang chi tiết nếu có
    })),
    ...stats.recentConvos.map(c => ({
      type: 'chat',
      title: 'Hỏi đáp AI',
      subtitle: c.title || 'Cuộc trò chuyện mới',
      date: c.updated_at,
      link: '/chat'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F5F8FB]">
      <NavbarLogged />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user.full_name || 'bạn'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Đây là tổng quan tình hình hỗ trợ pháp lý của bạn hôm nay.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Hợp đồng */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.contractCount}</div>
              <div className="text-sm text-gray-500">Hợp đồng đã phân tích</div>
            </div>
          </div>

          {/* Card 2: Câu hỏi */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.questionCount}</div>
              <div className="text-sm text-gray-500">Câu hỏi đã trao đổi</div>
            </div>
          </div>

          {/* Card 3: Quick Action (Upload) */}
          <Link to="/contracts" className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center justify-between group">
            <div className="text-white">
              <div className="font-semibold text-lg">Tải lên hợp đồng mới</div>
              <div className="text-blue-100 text-sm">Nhận phân tích ngay lập tức</div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition">
              +
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
                <Link to="/profile" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse"></div>)}
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có hoạt động nào. Hãy bắt đầu bằng cách tải lên hợp đồng hoặc chat với AI.
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                        item.type === 'contract' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type === 'contract' ? '📝' : '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{timeAgo(item.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Actions / Education */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6">
              <h3 className="font-semibold text-indigo-900 mb-2">💡 Bạn có biết?</h3>
              <p className="text-sm text-indigo-800 mb-4">
                Luật Lao động 2019 quy định về thời gian thử việc tối đa là 180 ngày đối với công việc của người quản lý doanh nghiệp.
              </p>
              <Link to="/user-chat" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                Hỏi thêm  &rarr;
              </Link>
            </div>
          </div>

          {/* Right Column: Tools & Shortcuts */}
          <div className="space-y-6">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Công cụ hỗ trợ</h2>
                <div className="space-y-3">
                  <Link to="/user-chat" className="block w-full p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition text-left group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition">💬</span>
                      <div>
                        <div className="font-medium text-gray-900">Chatbot AI</div>
                        <div className="text-xs text-gray-500">Tư vấn pháp luật 24/7</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/contract-analysis" className="block w-full p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition text-left group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition">⚖️</span>
                      <div>
                        <div className="font-medium text-gray-900">Rà soát hợp đồng</div>
                        <div className="text-xs text-gray-500">Phát hiện rủi ro pháp lý</div>
                      </div>
                    </div>
                  </Link>

                  <Link to="/salary" className="block w-full p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition text-left group">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl group-hover:scale-110 transition">💰</span>
                      <div>
                        <div className="font-medium text-gray-900">Tính lương Gross/Net</div>
                        <div className="text-xs text-gray-500">Chuyển đổi chính xác</div>
                      </div>
                    </div>
                  </Link>
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Hồ sơ của bạn</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                     {user.full_name?.split(' ').pop()?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <Link to="/profile" className="block w-full py-2 text-center text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  Quản lý hồ sơ
                </Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}