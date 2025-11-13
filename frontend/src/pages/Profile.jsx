import React, { useEffect, useState } from 'react';
import NavbarLogged from '../components/NavbarLogged';
import { api, getErrorMessage } from '../lib/api-client';

const Label = ({ children }) => <div className="text-xs text-gray-500 mb-1">{children}</div>;
const Field = ({ value }) => <div className="text-sm text-gray-800">{value || '—'}</div>;

export default function Profile() {
  const [tab, setTab] = useState('overview'); // overview | info | settings
  const [mode, setMode] = useState('view'); // view | edit
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [profile, setProfile] = useState({
    full_name: 'Nguyễn Văn An',
    email: 'anguyen@gmail.com',
    phone: '0912345678',
    position: 'Trưởng phòng Nhân sự',
    company: 'Công ty TNHH Công Nghệ ABC',
    department: 'Phòng Hành chính – Nhân sự',
    industry: 'Công nghệ thông tin',
    address: 'Hà Nội, Việt Nam',
    joined_at: '2025-09-15',
  });

  const isAuthed = Boolean(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));

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

  async function saveProfile() {
    setLoading(true);
    try {
      const name = (profile.full_name || '').trim();
      const phone = (profile.phone || '').trim();
      const email = (profile.email || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^0\d{9,10}$/; // 10–11 digits
      if (name.length < 2) throw new Error('Họ và tên phải có ít nhất 2 ký tự');
      if (!phoneRegex.test(phone)) throw new Error('Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0)');
      if (email && !emailRegex.test(email)) throw new Error('Email không hợp lệ');

      if (isAuthed) {
        await api.put('/profile', {
          full_name: name,
          phone,
          address: profile.address,
          email,
          department: profile.department,
          industry: profile.industry,
          position: profile.position,
        });
      } else {
        localStorage.setItem('mock_profile', JSON.stringify(profile));
      }
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

  const statItems = [
    { label: 'Hợp đồng đã phân tích', value: '12/50', pct: 24 },
    { label: 'Câu hỏi AI', value: '82/500', pct: 16 },
    { label: 'Câu hỏi AI', value: '8', pct: 40 },
    { label: 'Dung lượng lưu trữ', value: '245 MB / 1000 MB', pct: 24 },
  ];
  const recent = [
    { t: 'Phân tích hợp đồng', sub: 'HĐ Lao động - Nguyễn Văn An.pdf', when: '2 giờ trước' },
    { t: 'Hỏi đáp AI', sub: 'Quy định về nghỉ phép năm 2024', when: '5 giờ trước' },
    { t: 'Tính lương', sub: 'Lương tháng 10/2024', when: 'Hôm qua' },
  ];
  const docs = [
    { id: 1, title: 'Hợp đồng lao động - Nguyễn Văn An', date: '29/10/2024', size: '2.3 MB' },
    { id: 2, title: 'Phụ lục hợp đồng - Trần Thị Bình', date: '25/10/2024', size: '1.8 MB' },
    { id: 3, title: 'HĐLD thử việc - Lê Hoàng Cường', date: '20/10/2024', size: '1.5 MB' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8FB]">
      <NavbarLogged />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {profile.full_name?.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold text-gray-900">{profile.full_name}</div>
            <div className="text-sm text-gray-600">{profile.position}</div>
            <div className="text-sm text-gray-500">{profile.company}</div>
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
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-3">Hoạt động gần đây</div>
                <ul className="space-y-2 text-sm">
                  {recent.map((r,idx)=> (
                    <li key={idx} className="px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium text-gray-800">{r.t}</div>
                      <div className="text-xs text-gray-500">{r.sub}</div>
                      <div className="text-xs text-gray-400">{r.when}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-3">Tài liệu đã lưu</div>
                <ul className="space-y-3">
                  {docs.map(d => (
                    <li key={d.id} className="p-3 rounded-lg border flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{d.title}</div>
                        <div className="text-xs text-gray-500">{d.size} • {d.date}</div>
                      </div>
                      <button className="text-sm px-3 py-1 rounded border hover:bg-gray-50">Xem</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-3">Thao tác nhanh</div>
                <div className="space-y-2 text-sm">
                  {['Hợp đồng gần đây','Hoạt động gần đây','Hồ sơ gần đây'].map((x,i)=>(
                    <button key={i} className="w-full px-3 py-2 rounded-lg border hover:bg-gray-50 text-left">{x}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* INFO */}
        {tab === 'info' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-6">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-gray-800">Thông tin cá nhân</div>
              {mode === 'view' ? (
                <button className="text-sm px-3 py-1.5 rounded-md border" onClick={()=>setMode('edit')}>Chỉnh sửa</button>
              ) : (
                <button className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white disabled:opacity-60" disabled={loading} onClick={saveProfile}>Lưu thay đổi</button>
              )}
            </div>
            <div className="p-5">
              {err && (<div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>)}
              {msg && (<div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{msg}</div>)}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Họ và tên</Label>
                  {mode==='view'? <Field value={profile.full_name}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.full_name} onChange={(e)=>setProfile({...profile, full_name: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  {mode==='view'? <Field value={profile.email}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  {mode==='view'? <Field value={profile.phone}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} placeholder="VD: 0912345678" />
                  )}
                </div>
                <div>
                  <Label>Chức vụ</Label>
                  {mode==='view'? <Field value={profile.position}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.position} onChange={(e)=>setProfile({...profile, position: e.target.value})} />
                  )}
                </div>
              </div>

              <hr className="my-5" />
              <div className="font-semibold text-gray-800 mb-3">Thông tin công ty</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Tên công ty</Label>
                  {mode==='view'? <Field value={profile.company}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.company} onChange={(e)=>setProfile({...profile, company: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Phòng ban</Label>
                  {mode==='view'? <Field value={profile.department}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.department} onChange={(e)=>setProfile({...profile, department: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Ngành nghề</Label>
                  {mode==='view'? <Field value={profile.industry}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.industry} onChange={(e)=>setProfile({...profile, industry: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Địa chỉ</Label>
                  {mode==='view'? <Field value={profile.address}/> : (
                    <input className="w-full border border-gray-300 rounded px-3 py-2" value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})} />
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Tham gia từ</Label>
                  <Field value={profile.joined_at && new Date(profile.joined_at).toLocaleDateString('vi-VN')} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="font-semibold text-gray-800 mb-3">Tài liệu đã lưu</div>
              {['Cập nhật qua email','Phân tích hợp đồng hoàn tất','Thay đổi pháp luật','Báo cáo tuần','Gợi ý từ AI','Cảnh báo bảo mật'].map((label, i)=> (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0 text-sm">
                  <span>{label}</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i<3} />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-3">Tùy chọn AI</div>
                <div className="text-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Mức độ chi tiết phân tích</span>
                    <select className="border rounded px-2 py-1 text-sm">
                      <option>Chi tiết (khuyến nghị)</option>
                      <option>Cân bằng</option>
                      <option>Nhanh</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tự động phân tích</span>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lưu lịch sử chat</span>
                    <input type="checkbox" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="font-semibold text-gray-800 mb-3">Bảo mật & Quyền riêng tư</div>
                <div className="text-sm space-y-2">
                  {['Hoạt động gần đây','Hoạt động gần đây','Hoạt động gần đây','Hoạt động gần đây'].map((x,i)=> (
                    <button key={i} className={`w-full px-3 py-2 rounded-lg border text-left ${i===3?'bg-red-600 text-white border-red-600':'hover:bg-gray-50'}`}>{x}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

