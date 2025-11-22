import React, { useEffect, useState } from 'react';
import NavbarLogged from '../components/NavbarLogged';
import { api, getErrorMessage } from '../lib/api-client';
import { Link, useNavigate } from 'react-router-dom';

const Label = ({ children }) => <div className="text-xs text-gray-500 mb-1">{children}</div>;
const Field = ({ value }) => <div className="text-sm text-gray-800">{value || '—'}</div>;

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

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview'); 
  const [mode, setMode] = useState('view'); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Profile Info State
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    department: '',
    industry: '',
    address: '',
    joined_at: '',
  });

  const [dashboardData, setDashboardData] = useState({
    contractCount: 0,
    questionCount: 0,
    recentContracts: [], 
    recentConvos: []  
  });

  const isAuthed = Boolean(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));

  // Fetch Profile
  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthed) return;
      try {
        const res = await api.get('/profile');
        const data = res?.data?.data || {};
        setProfile((p) => ({ ...p, ...data }));
      } catch { /* ignore */ }
    }
    fetchProfile();
  }, [isAuthed]);

  // Fetch Stats
  useEffect(() => {
    async function fetchStats() {
      if (!isAuthed) return;
      try {
        const res = await api.get('/profile/stats');
        const data = res?.data?.data || {};
        setDashboardData({
          contractCount: data.contractCount || 0,
          questionCount: data.questionCount || 0,
          recentContracts: data.recentContracts || [],
          recentConvos: data.recentConvos || []
        });
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    }
    fetchStats();
  }, [isAuthed]);

  async function saveProfile() {
    setLoading(true);
    try {
      const name = (profile.full_name || '').trim();
      const phone = (profile.phone || '').trim();
      const email = (profile.email || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^0\d{9,10}$/; 
      if (name.length < 2) throw new Error('Họ và tên phải có ít nhất 2 ký tự');
      if (phone && !phoneRegex.test(phone)) throw new Error('Số điện thoại không hợp lệ');
      if (email && !emailRegex.test(email)) throw new Error('Email không hợp lệ');

      await api.put('/profile', {
        full_name: name,
        phone,
        address: profile.address,
        email,
        department: profile.department,
        industry: profile.industry,
        position: profile.position, // Lưu ý: Backend cần hỗ trợ field này nếu muốn lưu
        occupation: profile.position // Mapping position -> occupation ở backend nếu cần
      });
      
      setErr('');
      setMsg('Đã lưu thay đổi');
      setMode('view');
      setTimeout(() => setMsg(''), 1400);
    } catch (e) {
      setErr(getErrorMessage(e));
      setTimeout(() => setErr(''), 2400);
    }
    setLoading(false);
  }


  // 1. Stats Items
  const statItems = [
    { label: 'Hợp đồng đã phân tích', value: `${dashboardData.contractCount}/50`, pct: Math.min((dashboardData.contractCount/50)*100, 100) },
    { label: 'Câu hỏi AI', value: `${dashboardData.questionCount}/500`, pct: Math.min((dashboardData.questionCount/500)*100, 100) },
    // Giả lập dung lượng vì DB chưa có trường size
    { label: 'Dung lượng lưu trữ', value: `${(dashboardData.contractCount * 0.5).toFixed(1)} MB / 1000 MB`, pct: Math.min(((dashboardData.contractCount * 0.5)/1000)*100, 100) },
  ];

  // 2. Recent Activities (Merge Contracts & Conversations)
  const activities = [
    ...dashboardData.recentContracts.map(c => ({
      type: 'contract',
      t: 'Phân tích hợp đồng',
      sub: c.original_name,
      date: c.uploaded_at,
      rawDate: new Date(c.uploaded_at)
    })),
    ...dashboardData.recentConvos.map(c => ({
      type: 'chat',
      t: 'Hỏi đáp AI',
      sub: c.title || 'Cuộc trò chuyện mới',
      date: c.updated_at,
      rawDate: new Date(c.updated_at)
    }))
  ].sort((a, b) => b.rawDate - a.rawDate).slice(0, 6); // Lấy 6 hoạt động mới nhất

  // 3. Saved Docs (From Contracts)
  const docs = dashboardData.recentContracts.slice(0, 5).map(c => ({
    id: c.contract_id,
    title: c.original_name,
    date: new Date(c.uploaded_at).toLocaleDateString('vi-VN'),
    size: '—' // DB chưa có size
  }));

  return (
    <div className="min-h-screen bg-[#F5F8FB]">
      <NavbarLogged />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {profile.full_name?.trim().split(/\s+/).map(w=>w[0]).slice(-2).join('').toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold text-gray-900">{profile.full_name || 'Người dùng'}</div>
            <div className="text-sm text-gray-600">{profile.occupation || profile.position || 'Chưa cập nhật chức vụ'}</div>
            <div className="text-sm text-gray-500">{profile.company || 'Chưa cập nhật công ty'}</div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button className={`px-3 py-1.5 rounded-full border ${tab==='overview'?'border-blue-300 text-blue-700 bg-blue-50':'border-gray-300 text-gray-700'}`} onClick={()=>setTab('overview')}>Tổng quan</button>
              <button className={`px-3 py-1.5 rounded-full border ${tab==='info'?'border-blue-300 text-blue-700 bg-blue-50':'border-gray-300 text-gray-700'}`} onClick={()=>setTab('info')}>Thông tin</button>
              <button className={`px-3 py-1.5 rounded-full border ${tab==='settings'?'border-blue-300 text-blue-700 bg-blue-50':'border-gray-300 text-gray-700'}`} onClick={()=>setTab('settings')}>Cài đặt</button>
            </div>
          </div>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Statistics */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-4">Thống kê sử dụng tháng</div>
                <div className="space-y-4">
                  {statItems.map((s,i)=> (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                        <span>{s.label}</span>
                        <span className="text-blue-600 font-medium">{s.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-blue-500" style={{width: `${s.pct}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</div>
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
                          <h3 className="font-medium text-gray-900">{item.t}</h3>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{timeAgo(item.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="text-lg font-bold text-gray-900 mb-4">Tài liệu đã lưu</div>
                {docs.length === 0 ? (
                   <div className="text-sm text-gray-500 text-center py-4">Chưa có tài liệu nào</div>
                ) : (
                  <ul className="space-y-3">
                    {docs.map(d => (
                      <li key={d.id} className="p-3 rounded-lg border flex items-center justify-between">
                        <div className="overflow-hidden">
                          <div className="font-medium text-gray-800 truncate">{d.title}</div>
                          <div className="text-xs text-gray-500">{d.size} • {d.date}</div>
                        </div>
                        <button 
                  onClick={() => navigate(`/contract-analysis?id=${d.id}`)}
                  className="text-sm px-3 py-1 rounded border hover:bg-gray-50 shrink-0 ml-2 text-blue-600 font-medium transition-colors"
                >
                  Xem
                </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
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

            
          </div>

            </div>
          </>
        )}

        {tab === 'info' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-gray-800">Thông tin cá nhân</div>
              {mode === 'view' ? (
                <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50" onClick={()=>setMode('edit')}>Chỉnh sửa</button>
              ) : (
                <div className="flex gap-2">
                   <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50" onClick={()=>setMode('view')}>Hủy</button>
                   <button className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" disabled={loading} onClick={saveProfile}>Lưu thay đổi</button>
                </div>
              )}
            </div>
            <div className="p-5">
              {err && (<div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>)}
              {msg && (<div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{msg}</div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Họ và tên</Label>
                  {mode==='view'? <Field value={profile.full_name}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={profile.full_name} onChange={(e)=>setProfile({...profile, full_name: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  {mode==='view'? <Field value={profile.email}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  {mode==='view'? <Field value={profile.phone}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} placeholder="VD: 0912345678" />
                  )}
                </div>
                <div>
                  <Label>Chức vụ (Occupation)</Label>
                  {mode==='view'? <Field value={profile.occupation || profile.position}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={profile.position} onChange={(e)=>setProfile({...profile, position: e.target.value})} />
                  )}
                </div>
              </div>

              <hr className="my-5" />
              <div className="font-semibold text-gray-800 mb-3">Thông tin bổ sung</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {/* Các trường này đang giả lập ở frontend, nếu DB có trường Company/Dept thì map vào tương tự */}
                <div>
                  <Label>Địa chỉ</Label>
                  {mode==='view'? <Field value={profile.address}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})} />
                  )}
                </div>
                 <div className="md:col-span-2">
                  <Label>Tham gia từ</Label>
                  {/* user.created_at thường không có trong /profile response hiện tại, nếu cần thì thêm vào query backend */}
                  <Field value="—" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="font-semibold text-gray-800 mb-3">Cài đặt thông báo</div>
              {['Cập nhật qua email','Phân tích hợp đồng hoàn tất','Thay đổi pháp luật'].map((label, i)=> (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0 text-sm">
                  <span>{label}</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}