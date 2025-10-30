import React, { useEffect, useState } from 'react';
import { api } from '../lib/api-client';

const Label = ({ children }) => <div className='text-xs text-gray-500 mb-1'>{children}</div>;
const Field = ({ value }) => <div className='text-sm text-gray-800'>{value || '—'}</div>;

export default function Profile() {
  const [mode, setMode] = useState('view'); // view | edit
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: 'Nguyễn Văn A',
    email: 'nguyen.vana@gmail.com',
    phone: '0901234567',
    address: 'Hà Nội, Việt Nam',
    position: 'Nhân viên pháp chế',
    company: 'ABC Technology Co., LT',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAuthed = Boolean(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthed) return;
      try {
        const res = await api.get('/profile');
        const data = res?.data?.data || {};
        setProfile((p) => ({ ...p, ...data }));
      } catch {}
    }
    fetchProfile();
  }, [isAuthed]);

  async function saveProfile() {
    setLoading(true);
    try {
      // Client-side validation
      const name = (profile.full_name || '').trim();
      const phone = (profile.phone || '').trim();
      const phoneRegex = /^0\d{9,10}$/; // 10-11 digits starting with 0
      if (name.length < 2) {
        throw new Error('Họ và tên phải có ít nhất 2 ký tự');
      }
      if (!phoneRegex.test(phone)) {
        throw new Error('Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)');
      }

      if (isAuthed) {
        await api.put('/profile', {
          full_name: name,
          phone,
          address: profile.address,
        });
      } else {
        localStorage.setItem('mock_profile', JSON.stringify(profile));
      }
      setError('');
      setMessage('Đã lưu thay đổi');
      setMode('view');
      setTimeout(() => setMessage(''), 1200);
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e.message || 'Lưu thất bại';
      setError(serverMsg);
      setTimeout(() => setError(''), 2500);
    }
    setLoading(false);
  }

  const statItems = [
    { label: 'Hợp đồng đã tích phân', value: 45 },
    { label: 'Câu hỏi AI', value: 128 },
    { label: 'Tính toán lương', value: 23 },
    { label: 'Ngày sử dụng', value: 67 },
  ];
  const docs = [
    { id: 1, title: 'Hợp đồng lao động - Nguyễn Văn B', date: '15/12/2024', status: 'Đã phân tích' },
    { id: 2, title: 'Hợp đồng thực tập - Trần Thị C', date: '12/12/2024', status: 'Đang xử lý' },
    { id: 3, title: 'Phụ lục hợp đồng - Lê Văn D', date: '10/12/2024', status: 'Đã phân tích' },
  ];

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar (reuse from HomeLogged visually) */}
      <aside className='fixed h-full w-64 bg-white border-r border-gray-200 flex flex-col'>
        <div className='h-14 px-4 border-b flex items-center gap-2'>
          <div className='bg-blue-600 text-white rounded px-2 py-[2px] text-sm font-bold'>LRS</div>
          <span className='font-semibold text-gray-800'>AI Pháp Lý</span>
        </div>
        <nav className='flex-1 p-3 text-sm'>
          <a href='/home' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100'><span className='w-2 h-2 rounded-full bg-gray-400'></span> Trang Chính</a>
          <a href='/user-chat' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'>🤖 Trợ lý AI</a>
           <a href='/contract-analysis' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'> AI Phân Tích Hợp Đồng</a>
          <a href='#' className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 mt-1'>🧮 Tính lương/thuế</a>
          <a href='/profile' className='flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 mt-1'>👤 Hồ sơ cá nhân</a>
        </nav>
        <div className='border-t p-3'>
          <a href='/logout' className='w-full inline-flex items-center justify-center gap-2 px-3 py-2 border rounded-md text-gray-700 hover:bg-gray-50'>Đăng xuất</a>
        </div>
      </aside>

      <main className='ml-64 p-6 w-full overflow-y-auto'>
        <h1 className='text-2xl font-extrabold text-gray-900'>Hồ sơ cá nhân</h1>
        <p className='text-sm text-gray-600 mb-4'>Quản lý thông tin và cài đặt tài khoản của bạn</p>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          {/* Info card */}
          <div className='lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm'>
            <div className='px-5 py-4 border-b flex items-center justify-between'>
              <div className='font-semibold text-gray-800'>Thông tin cá nhân</div>
              {mode === 'view' ? (
                <button className='text-sm px-3 py-1.5 rounded-md border' onClick={() => setMode('edit')}>Chỉnh sửa</button>
              ) : (
                <button disabled={loading} className='text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white disabled:opacity-60' onClick={saveProfile}>Lưu</button>
              )}
            </div>
            <div className='p-5'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'>
                  {profile.full_name?.split(' ').map(w => w[0]).slice(-3).join('').toUpperCase() || 'N/A'}
                </div>
                <div>
                  <div className='font-semibold text-gray-900'>{profile.full_name}</div>
                  <div className='text-sm text-gray-600'>{profile.position}</div>
                  <div className='text-xs text-gray-500'>{profile.company}</div>
                </div>
              </div>

              {error && (
                <div className='mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2'>{error}</div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div>
                  <Label>Họ và tên</Label>
                  {mode === 'view' ? (
                    <Field value={profile.full_name} />
                  ) : (
                    <input className='w-full border border-gray-300 rounded px-3 py-2' value={profile.full_name} onChange={(e)=>setProfile({...profile, full_name: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  {mode === 'view' ? (
                    <Field value={profile.email} />
                  ) : (
                    <input className='w-full border border-gray-300 rounded px-3 py-2' value={profile.email} onChange={(e)=>setProfile({...profile, email: e.target.value})} />
                  )}
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  {mode === 'view' ? (
                    <Field value={profile.phone} />
                  ) : (
                    <input className='w-full border border-gray-300 rounded px-3 py-2' value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} placeholder='Ví dụ: 0912345678' />
                  )}
                </div>
                <div>
                  <Label>Địa chỉ</Label>
                  {mode === 'view' ? (
                    <Field value={profile.address} />
                  ) : (
                    <input className='w-full border border-gray-300 rounded px-3 py-2' value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})} />
                  )}
                </div>
              </div>

              {message && <div className='mt-4 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 w-max'>{message}</div>}
            </div>
          </div>

          {/* Stats + Recent */}
          <div className='space-y-5'>
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-5'>
              <div className='font-semibold text-gray-800 mb-3'>Thống kê sử dụng</div>
              <ul className='space-y-2 text-sm'>
                {statItems.map((s, i) => (
                  <li key={i} className='flex items-center justify-between'>
                    <span>{s.label}</span>
                    <span className='text-gray-700 font-semibold'>{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-5'>
              <div className='font-semibold text-gray-800 mb-3'>Tài liệu gần đây</div>
              <ul className='space-y-3 text-sm'>
                {docs.map((d) => (
                  <li key={d.id} className='p-3 rounded-lg border flex items-center justify-between'>
                    <div>
                      <div className='font-medium text-gray-800'>{d.title}</div>
                      <div className='text-xs text-gray-500'>{d.date}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${d.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-700'}`}>{d.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5'>
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-5'>
            <div className='font-semibold text-gray-800 mb-3'>Cài đặt</div>
            <div className='space-y-5 text-sm'>
              <div>
                <div className='font-medium text-gray-700 mb-2'>Thông báo</div>
                {['Thông báo qua email','Thông báo đẩy','Thông báo phân tích hợp đồng','Cập nhật pháp luật'].map((label, i)=> (
                  <div key={i} className='flex items-center justify-between py-2 border-b last:border-b-0'>
                    <span>{label}</span>
                    <label className='inline-flex items-center cursor-pointer'>
                      <input type='checkbox' className='sr-only peer' defaultChecked={i<3} />
                      <div className='w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative after:content-[" "] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-5 transition'></div>
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <div className='font-medium text-gray-700 mb-2'>Bảo mật</div>
                <div className='flex gap-3'>
                  <button className='px-3 py-1.5 border rounded'>Đổi mật khẩu</button>
                  <button className='px-3 py-1.5 border rounded'>Xác thực 2 bước</button>
                </div>
              </div>
              <div>
                <div className='font-medium text-gray-700 mb-2'>Dữ liệu</div>
                <div className='flex gap-3'>
                  <button className='px-3 py-1.5 border rounded'>Xuất dữ liệu</button>
                  <button className='px-3 py-1.5 rounded bg-red-600 text-white'>Xóa tài khoản</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
