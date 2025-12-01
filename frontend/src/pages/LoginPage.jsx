import React, { useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../lib/api-client';
import registerBg from '../assets/registerBg.png';
import logoImg from '../assets/logo.png';
const illustrationUrl = registerBg;

const LOGO = (
  <img
    src={logoImg}
    alt="LaboSupport"
    className="absolute top-6 left-8 h-10 w-auto select-none"
    draggable={false}
  />
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // {type, message}
  const [fieldErrors, setFieldErrors] = useState({}); // {username, password}

  const usernameRef = useRef(null);

  useEffect(() => {
    usernameRef.current?.focus();
    const savedUser = localStorage.getItem('ls_last_username');
    if (savedUser) setUsername(savedUser);
  }, []);

  function storeToken(token) {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');

  if (remember) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('ls_last_username', username);
  } else {
    sessionStorage.setItem('auth_token', token);
  }
}

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errs = {};
    if (!username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const resp = await api.post('/users/login', { username, password });
      const token = resp?.data?.token;
      if (!token) throw new Error('NO_TOKEN');
      storeToken(token);
      setToast({ type: 'success', message: 'Đăng nhập thành công!' });

      const userRole = resp.data?.user?.role;
      setTimeout(() => {
        if (userRole === 'admin') {
          window.location.href = '/admin'; // Chuyển hướng đến Dashboard nếu là admin
        } else {
          window.location.href = '/home';  // Mặc định chuyển hướng về Home
        }
      }, 500);
    } catch (err) {
      const msg = getErrorMessage(err, 'Tên đăng nhập hoặc mật khẩu không đúng');
      setError(msg);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* Left background */}
      <div className="relative hidden md:block w-full h-screen min-h-[560px] overflow-hidden border-r border-blue-200">
        <img src={illustrationUrl} alt="Login Background" className="absolute inset-0 w-full h-full object-cover" />
        {LOGO}
      </div>

      {/* Right form */}
      <div className="relative flex items-center justify-center py-10 px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <h1 className="font-extrabold text-4xl text-blue-600 text-center mb-1">ĐĂNG NHẬP</h1>
          <p className="text-center text-gray-600 mb-4 text-base font-semibold uppercase tracking-wide">CHÀO MỪNG TRỞ LẠI</p>

          {error && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
          )}
          {toast && toast.type === 'success' && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{toast.message}</div>
          )}

          <label className="text-xs text-gray-700 font-semibold" htmlFor="username">Tên đăng nhập hoặc email</label>
          <input
            ref={usernameRef}
            id="username"
            type="text"
            className={`mt-1 w-full border rounded px-3 py-2 focus:outline-blue-500 placeholder:text-gray-400 ${fieldErrors.username ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Nhập tên đăng nhập hoặc email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            aria-invalid={!!fieldErrors.username}
            required
          />
          {fieldErrors.username && (
            <div className="text-red-500 text-xs mt-1 mb-2">Vui lòng nhập tên đăng nhập hoặc email</div>
          )}

          <label className="text-xs text-gray-700 font-semibold" htmlFor="password">Mật khẩu</label>
          <div className="mt-1 mb-1 relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full border rounded px-3 py-2 pr-10 focus:outline-blue-500 placeholder:text-gray-400 ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Hiện/ẩn mật khẩu"
            >
              {showPassword ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l22 22"/><path d="M17.94 17.94A10.94 10.94 0 0112 20c-5 0-9.27-3-11-8a11.72 11.72 0 013.06-4.36"/><path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3 11 8a11.72 11.72 0 01-2.16 3.19"/></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <div className="text-red-500 text-xs mt-1 mb-2">Vui lòng nhập mật khẩu</div>
          )}

          <div className="flex items-center justify-between text-sm mb-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Lưu mật khẩu</span>
            </label>
            <a className="text-blue-600 hover:text-blue-800" href="/forgot-password">Quên mật khẩu?</a>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-semibold disabled:opacity-60"
            type="submit"
          >
            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Bạn chưa có tài khoản? <a className="text-blue-600 hover:text-blue-800" href="/register">Đăng ký ngay</a>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">Hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

         
        </form>
      </div>
    </div>
  );
}

