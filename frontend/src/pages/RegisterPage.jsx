import React, { useState, useEffect } from "react";
import { api, getErrorMessage } from "../lib/api-client";
import registerBg from "../assets/registerBg.png";
import logoImg from "../assets/logo.png";

const illustrationUrl = registerBg;

const LOGO = (
  <img src={logoImg} alt="LaboSupport" className="absolute top-6 left-8 h-10 w-auto select-none" draggable={false} />
);

const SocialIcons = () => (
  <div className="grid grid-cols-3 gap-3 mt-3">
    <button className="border border-gray-300 rounded-md h-10 hover:bg-gray-50">G</button>
    <button className="border border-gray-300 rounded-md h-10 hover:bg-blue-50">FB</button>
    <button className="border border-gray-300 rounded-md h-10 hover:bg-gray-100">tw</button>
  </div>
);

const OTP_COOLDOWN = 60;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("register"); // or 'otp'
  const [toast, setToast] = useState(null); // {type, message}
  const [fieldErrors, setFieldErrors] = useState({});

  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (otpResendCooldown <= 0) return;
    const i = setInterval(() => setOtpResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(i);
  }, [otpResendCooldown]);

  function validateFormInline() {
    const errs = {};
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (username.trim().length < 2) errs.username = 'Tên đăng nhập phải có ít nhất 2 ký tự.';
    if (!reEmail.test(email)) errs.email = 'Email không hợp lệ.';
    if (!strongPw.test(password)) errs.password = 'Mật khẩu phải ≥ 8 ký tự, gồm hoa, thường, số và ký tự đặc biệt.';
    if (password !== password2) errs.password2 = 'Mật khẩu xác nhận không khớp.';
    if (!agreed) errs.agreed = 'Bạn phải đồng ý với Điều khoản và Chính sách.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateFormInline();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const resp = await api.post('/users/send-verify-code', { email });
      if (resp?.data?.code) {
        setOtp(resp.data.code);
        setToast({ type: 'success', message: `OTP (dev): ${resp.data.code}` });
      }
      setStep('otp');
      setOtp("");
      setOtpResendCooldown(OTP_COOLDOWN);
      setToast({ type: 'success', message: 'OTP mới đã được gửi!' });
    } catch (err) {
      setToast({ type: 'error', message: getErrorMessage(err) });
    }
    setLoading(false);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('OTP phải là 6 chữ số');
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await api.post('/users/register', { username, password, email, verify_code: otp });
      localStorage.setItem('role', 'Nguoi dung da dang ky');
      setToast({ type: 'success', message: 'Đăng ký thành công!' });
      setTimeout(() => { window.location.href = '/home'; }, 800);
    } catch (err) {
      setOtpError(getErrorMessage(err));
    }
    setOtpLoading(false);
  }

  async function handleResendOtp() {
    if (otpResendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const resp = await api.post('/users/send-verify-code', { email });
      if (resp?.data?.code) setOtp(resp.data.code);
      setOtpResendCooldown(OTP_COOLDOWN);
      setToast({ type: 'success', message: 'OTP mới đã được gửi!' });
    } catch (err) {
      setOtpError('Gửi lại OTP thất bại. Vui lòng thử lại.');
    }
    setOtpLoading(false);
  }

  const LeftPane = (
    <div className="relative hidden md:block w-full md:w-1/2 h-screen min-h-[560px] overflow-hidden border-r border-blue-200">
      <img src={illustrationUrl} alt="Register Background" className="absolute inset-0 w-full h-full object-cover" />
      {LOGO}
    </div>
  );

  const RegisterForm = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[360px] mx-auto px-2 py-10" aria-label="form đăng ký">
      <h1 className="font-extrabold text-4xl text-blue-600 text-center mb-1">ĐĂNG KÝ</h1>
      <div className="text-center text-gray-600 mb-4 text-base font-semibold uppercase tracking-wide">CHÀO MỪNG!</div>

      <label className="text-xs text-gray-700 font-semibold" htmlFor="username">Tên đăng nhập</label>
      <input
        id="username"
        type="text"
        className={`border rounded focus:outline-blue-400 px-3 py-2 mb-1 placeholder:text-gray-400 ${fieldErrors.username ? 'border-red-400' : 'border-gray-300'}`}
        placeholder="Nguyễn Văn A"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoFocus
        required
      />
      {fieldErrors.username && (<div className="text-red-500 text-xs mt-1">{fieldErrors.username}</div>)}

      <label className="text-xs text-gray-700 font-semibold" htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        className={`border rounded focus:outline-blue-400 px-3 py-2 mb-1 placeholder:text-gray-400 ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
        placeholder="nguoidung@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {fieldErrors.email && (<div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>)}

      <label className="text-xs text-gray-700 font-semibold" htmlFor="password">Mật khẩu</label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          className={`border rounded focus:outline-blue-400 px-3 py-2 pr-8 w-full placeholder:text-gray-400 ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="Nhập mật khẩu của bạn"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(v=>!v)} aria-label="Hiện/ẩn mật khẩu">
          {showPassword ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825a10.05 10.05 0 01-1.875.175C4.5 19 2 12 2 12a16.038 16.038 0 014.145-5.603M9.878 9.878A3 3 0 1114.12 14.12M17.657 17.657A16.032 16.032 0 0022 12s-2.5-7-10-7a9.956 9.956 0 00-4.62 1.146" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /></svg>
          )}
        </button>
      </div>
      {fieldErrors.password && (<div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>)}

      <label className="text-xs text-gray-700 font-semibold" htmlFor="password2">Xác nhận mật khẩu</label>
      <div className="relative">
        <input
          id="password2"
          type={showPassword2 ? 'text' : 'password'}
          className={`border rounded focus:outline-blue-400 px-3 py-2 pr-8 w-full placeholder:text-gray-400 ${fieldErrors.password2 ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="................."
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword2(v=>!v)} aria-label="Hiện/ẩn mật khẩu">
          {showPassword2 ? (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825a10.05 10.05 0 01-1.875.175C4.5 19 2 12 2 12a16.038 16.038 0 014.145-5.603M9.878 9.878A3 3 0 1114.12 14.12M17.657 17.657A16.032 16.032 0 0022 12s-2.5-7-10-7a9.956 9.956 0 00-4.62 1.146" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /></svg>
          )}
        </button>
      </div>
      {fieldErrors.password2 && (<div className="text-red-500 text-xs mt-1">{fieldErrors.password2}</div>)}

      <label className="flex items-center gap-2 mt-2 text-gray-800 text-sm cursor-pointer select-none">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-blue-600" />
        <span>
          Tôi đồng ý với{' '}
          <a href="/terms" target="_blank" className="text-blue-600 underline hover:opacity-80">Điều khoản sử dụng</a>{' '}và{' '}
          <a href="/privacy" target="_blank" className="text-blue-600 underline hover:opacity-80">Chính sách bảo mật</a>
        </span>
      </label>
      {fieldErrors.agreed && (<div className="text-red-500 text-xs mt-1">{fieldErrors.agreed}</div>)}

      <button type="submit" disabled={loading} className="transition-all mt-1 py-2 font-semibold rounded text-white text-lg bg-blue-600 enabled:hover:bg-blue-700 shadow-sm disabled:bg-blue-300 w-full" aria-busy={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Đang xử lý...
          </span>
        ) : (
          'ĐĂNG KÝ'
        )}
      </button>

      <div className="text-sm text-center text-gray-500 mt-0">
        Bạn đã có tài khoản?{' '}
        <a href="/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập</a>
      </div>

      <div className="flex items-center gap-2 mt-5 mb-1">
        <hr className="flex-1 border-t border-gray-200" />
        <span className="px-1 text-gray-400 text-xs tracking-wide">Hoặc tiếp tục với</span>
        <hr className="flex-1 border-t border-gray-200" />
      </div>
      <SocialIcons />
    </form>
  );

  const OtpForm = (
    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5 w-full max-w-[370px] mx-auto px-2 animate-fade-in" aria-label="form xác minh OTP">
      <h1 className="font-bold text-2xl text-gray-900 text-center">Xác minh OTP</h1>
      <div className="text-center text-gray-600 mb-2 text-base font-medium">
        Mã xác thực đã gửi tới email:{' '}<span className="text-blue-700 font-semibold break-all">{email}</span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="\\d{6}"
        maxLength={6}
        className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 text-lg text-center tracking-widest font-mono placeholder:text-gray-400"
        placeholder="Nhập mã OTP 6 số"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        aria-label="Mã OTP"
        autoFocus
        required
      />
      {otpError && (<div className="text-red-500 text-sm text-center" role="alert">{otpError}</div>)}

      <button type="submit" className="transition-all py-2 font-semibold rounded text-white text-lg bg-blue-600 enabled:hover:bg-blue-700 shadow-sm disabled:bg-blue-300" disabled={otpLoading} aria-busy={otpLoading}>
        {otpLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Đang xác nhận...
          </span>
        ) : 'Xác nhận'}
      </button>

      <div className="flex flex-col gap-2 items-center">
        <button type="button" className="text-sm font-medium px-3 py-1 text-blue-600 enabled:hover:underline disabled:text-gray-400 transition" onClick={handleResendOtp} disabled={otpResendCooldown > 0 || otpLoading}>
          {otpResendCooldown > 0 ? `Gửi lại OTP (${otpResendCooldown}s)` : 'Gửi lại OTP'}
        </button>
        <button type="button" className="text-xs text-gray-400 hover:text-gray-700 underline" onClick={() => setStep('register')}>
          Quay lại đăng ký
        </button>
      </div>
    </form>
  );

  const MobileImage = (
    <div className="relative block md:hidden w-full min-h-[160px]">
      <img src={illustrationUrl} alt="Register Background" className="w-full h-40 object-cover" />
    </div>
  );

  const Toast = toast && (
    <div role="alert" aria-live="polite" className={`${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'} fixed z-30 left-1/2 bottom-7 -translate-x-1/2 px-6 py-3 rounded-md shadow-lg flex items-center gap-2 text-base`} style={{ minWidth: 240, maxWidth: 340 }}>
      <span>{toast.message}</span>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row">
      {LOGO}
      {LeftPane}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {MobileImage}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full mt-2 px-3">
            {step === 'register' ? RegisterForm : OtpForm}
          </div>
        </div>
      </div>
      {Toast}
    </div>
  );
}