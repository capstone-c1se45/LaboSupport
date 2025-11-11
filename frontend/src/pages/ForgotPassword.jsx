import React, { useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../lib/api-client';
import registerBg from '../assets/registerBg.png';
import logoImg from '../assets/logo.png';

const OTP_COOLDOWN = 60;

export default function ForgotPassword() {
  const [step, setStep] = useState('request'); // request | verify
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type,message}
  const [error, setError] = useState('');
  const emailRef = useRef(null);

  // verify step
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => { emailRef.current?.focus(); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { if (otpCooldown <= 0) return; const i = setInterval(() => setOtpCooldown(s => s - 1), 1000); return () => clearInterval(i); }, [otpCooldown]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    const emailNorm = (email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(emailNorm)) { setError('Email không hợp lệ.'); return; }
    setLoading(true);
    try {
      // Reuse existing endpoint used in register flow
      await api.post('/users/send-verify-code', { email: emailNorm });
      setToast({ type: 'success', message: 'OTP đã được gửi đến email của bạn.' });
      setOtp('');
      setStep('verify');
      setOtpCooldown(OTP_COOLDOWN);
    } catch (err) {
      setError(getErrorMessage(err, 'Không gửi được OTP.'));
    }
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    const code = (otp || '').trim();
    if (!/^\d{6}$/.test(code)) { setError('OTP phải là 6 chữ số.'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,30}$/.test(newPw)) { setError('Mật khẩu mới phải 8–30 ký tự, gồm hoa, thường, số, ký tự đặc biệt.'); return; }
    if (newPw !== newPw2) { setError('Xác nhận mật khẩu không khớp.'); return; }
    setLoading(true);
    setError('');
    try {
      const emailNorm = (email || '').trim().toLowerCase();
      await api.post('/users/reset-password', { email: emailNorm, verify_code: code, new_password: newPw });
      setToast({ type: 'success', message: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.' });
      setTimeout(() => { window.location.href = '/login'; }, 900);
    } catch (err) {
      setError(getErrorMessage(err, 'Đổi mật khẩu thất bại.'));
    }
    setLoading(false);
  }

  async function handleResend() {
    if (otpCooldown > 0) return;
    try {
      const emailNorm = (email || '').trim().toLowerCase();
      await api.post('/users/send-verify-code', { email: emailNorm });
      setToast({ type: 'success', message: 'OTP mới đã được gửi.' });
      setOtpCooldown(OTP_COOLDOWN);
    } catch (err) {
      setError(getErrorMessage(err, 'Không gửi lại được OTP.'));
    }
  }

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-2">
      {/* Left background */}
      <div className="relative hidden md:block w-full h-screen min-h-[560px] overflow-hidden border-r border-blue-200">
        <img src={registerBg} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <img src={logoImg} alt="LaboSupport" className="absolute top-6 left-8 h-10 w-auto select-none" draggable={false} />
      </div>

      {/* Right form */}
      <div className="relative flex items-center justify-center py-10 px-6">
        {toast && (
          <div className={`${toast.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'} border rounded px-3 py-2 text-sm absolute top-4 left-1/2 -translate-x-1/2`}>{toast.message}</div>
        )}

        {step === 'request' && (
          <form onSubmit={handleSendOtp} className="w-full max-w-[380px]">
            <h1 className="font-extrabold text-4xl text-blue-600 text-center mb-1">QUÊN MẬT KHẨU</h1>
            <p className="text-center text-gray-600 mb-4 text-base font-semibold uppercase tracking-wide">NHẬP EMAIL ĐỂ NHẬN OTP</p>

            {error && (<div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>)}

            <label className="text-xs text-gray-700 font-semibold" htmlFor="fp_email">Email</label>
            <input
              ref={emailRef}
              id="fp_email"
              type="email"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-blue-500 placeholder:text-gray-400 border-gray-300"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <button disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-semibold disabled:opacity-60" type="submit">
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </button>

            <div className="text-center text-sm text-gray-600 mt-4">
              Nhớ mật khẩu rồi? <a className="text-blue-600 hover:text-blue-800" href="/login">Đăng nhập</a>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleReset} className="w-full max-w-[380px]">
            <h1 className="font-extrabold text-4xl text-blue-600 text-center mb-1">QUÊN MẬT KHẨU</h1>
            <p className="text-center text-gray-600 mb-3 text-sm">Mã OTP đã gửi tới: <span className="font-medium text-blue-700">{email}</span></p>
            {error && (<div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>)}

            <label className="text-xs text-gray-700 font-semibold" htmlFor="fp_otp">OTP (6 số)</label>
            <input
              id="fp_otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-blue-500 placeholder:text-gray-400 border-gray-300"
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />

            <div className="grid grid-cols-1 gap-3 mt-3">
              <div className="relative">
                <label className="text-xs text-gray-700 font-semibold" htmlFor="fp_new">Mật khẩu mới</label>
                <input
                  id="fp_new"
                  type={showPw ? 'text' : 'password'}
                  className="mt-1 w-full border rounded px-3 py-2 pr-10 focus:outline-blue-500 placeholder:text-gray-400 border-gray-300"
                  placeholder="Nhập mật khẩu mới"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2 top-8 text-gray-500" aria-label="Hiện/Ẩn mật khẩu">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>

              <div className="relative">
                <label className="text-xs text-gray-700 font-semibold" htmlFor="fp_new2">Xác nhận mật khẩu</label>
                <input
                  id="fp_new2"
                  type={showPw2 ? 'text' : 'password'}
                  className="mt-1 w-full border rounded px-3 py-2 pr-10 focus:outline-blue-500 placeholder:text-gray-400 border-gray-300"
                  placeholder="Nhập lại mật khẩu"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPw2(s => !s)} className="absolute right-2 top-8 text-gray-500" aria-label="Hiện/Ẩn mật khẩu">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm my-3">
              <button type="button" className="text-blue-600 hover:text-blue-800" onClick={handleResend} disabled={otpCooldown > 0}>
                {otpCooldown > 0 ? `Gửi lại OTP (${otpCooldown}s)` : 'Gửi lại OTP'}
              </button>
              <a className="text-gray-600 hover:text-gray-800" href="/login">Về đăng nhập</a>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-semibold disabled:opacity-60" type="submit">
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

