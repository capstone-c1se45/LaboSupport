import React, { useEffect, useRef, useState } from 'react';
import { api, getErrorMessage } from '../lib/api-client';
import registerBg from '../assets/registerBg.png';
import logoImg from '../assets/logo.png';

const OTP_COOLDOWN = 60;

// Stable, top-level helper components to avoid remount on each render
const EyeIcon = ({ open }) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const Input = React.forwardRef(function Input({ error, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${className}`}
      aria-invalid={Boolean(error) || undefined}
    />
  );
});

export default function RegisterPage() {
  // Form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // {type, message}
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [fieldErrors, setFieldErrors] = useState({});

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
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

  function validateForm() {
    const errs = {};
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/;
    const u = username.trim();
    if (u.length < 2 || u.length > 30) errs.username = 'Tên đăng nhập không vượt quá 30 ký tự.';
    if (!reEmail.test(email)) errs.email = 'Email không hợp lệ.';
    if (!strongPw.test(password)) errs.password = 'Mật khẩu phải có ít nhất 8 ký tự và tối đa 30 ký tự.';
    if (password !== password2) errs.password2 = 'Không khớp mật khẩu hiện tại';
    if (!agreed) errs.agreed = 'Bạn phải đồng ý với Điều khoản và Chính sách.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateForm();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const emailNorm = email.trim().toLowerCase();
      const resp = await api.post('/users/send-verify-code', { email: emailNorm });
      // Dev convenience: hiển thị OTP nếu backend trả về code
      if (resp?.data?.code) {
        setToast({ type: 'success', message: `OTP (dev): ${resp.data.code}` });
      }
      setStep('otp');
      setOtp('');
      setOtpResendCooldown(OTP_COOLDOWN);
      setToast({ type: 'success', message: 'OTP mới đã được gửi!' });
    } catch (err) {
      setToast({ type: 'error', message: getErrorMessage(err, 'Gửi OTP thất bại.') });
    }
    setLoading(false);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    const code = (otp || '').trim();
    if (!/^\d{6}$/.test(code)) {
      setOtpError('OTP phải là 6 chữ số.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const emailNorm = email.trim().toLowerCase();
      await api.post('/users/register', {
        username,
        password,
        email: emailNorm,
        verify_code: code,
      });
      localStorage.setItem('role', 'Người dùng đã đăng ký');
      setToast({ type: 'success', message: 'Đăng ký thành công!' });
      setTimeout(() => { window.location.href = '/home'; }, 800);
    } catch (err) {
      setOtpError(getErrorMessage(err, 'Xác minh OTP thất bại.'));
    }
    setOtpLoading(false);
  }

  async function handleResendOtp() {
    if (otpResendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const emailNorm = email.trim().toLowerCase();
      const resp = await api.post('/users/send-verify-code', { email: emailNorm });
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
      <img src={registerBg} alt="Register Background" className="absolute inset-0 w-full h-full object-cover" />
      <img src={logoImg} alt="LaboSupport" className="absolute top-6 left-8 h-10 w-auto select-none" draggable={false} />
    </div>
  );

  const usernameRef = useRef(null);
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const RegisterForm = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-[460px] mx-auto px-2">
      <h1 className="text-[40px] leading-none font-extrabold text-blue-600 text-center">ĐĂNG KÝ</h1>
      <p className="text-center text-gray-800 font-semibold tracking-wide">CHÀO MỪNG</p>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Tên đăng nhập</label>
        <Input
          type="text"
          placeholder="Nhập tên đăng nhập"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors.username}
          ref={usernameRef}
        />
        {fieldErrors.username && <div className="text-red-500 text-xs mt-1">{fieldErrors.username}</div>}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Email</label>
        <Input
          type="email"
          placeholder="Nhập email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />
        {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Mật khẩu</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="………………"
            className="pr-9"
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          <button type="button" aria-label="Hiện/Ẩn mật khẩu" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword((v) => !v)}>
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {fieldErrors.password && <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">Xác nhận mật khẩu</label>
        <div className="relative">
          <Input
            type={showPassword2 ? 'text' : 'password'}
            placeholder="………………"
            className="pr-9"
            name="new-password-confirm"
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            error={fieldErrors.password2}
          />
          <button type="button" aria-label="Hiện/Ẩn mật khẩu" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword2((v) => !v)}>
            <EyeIcon open={showPassword2} />
          </button>
        </div>
        {fieldErrors.password2 && <div className="text-red-500 text-xs mt-1">{fieldErrors.password2}</div>}
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
        <span>
          Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng</a> và <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
        </span>
      </label>
      {fieldErrors.agreed && <div className="text-red-500 text-xs -mt-2">{fieldErrors.agreed}</div>}

      <button type="submit" disabled={loading} className="mt-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md px-4 py-2 font-semibold">
        {loading ? 'Đang gửi OTP…' : 'Đăng ký'}
      </button>

      <div className="text-sm text-center text-gray-500 mt-0">
        Bạn đã có tài khoản? <a href="/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập</a>
      </div>

      <div className="flex items-center gap-2 mt-5 mb-2">
        <hr className="flex-1 border-t border-gray-200" />
        <span className="px-1 text-gray-400 text-xs tracking-wide">Hoặc tiếp tục với</span>
        <hr className="flex-1 border-t border-gray-200" />
      </div>
      <div className="flex items-center justify-center gap-4 text-2xl select-none">
        <span title="Google" className="inline-flex items-center justify-center w-11 h-11 rounded-md shadow-sm bg-white border"><span className="text-[#DB4437]">G</span></span>
        <span title="Facebook" className="inline-flex items-center justify-center w-11 h-11 rounded-md shadow-sm bg-white border"><span className="text-[#1877F2]">f</span></span>
        <span title="Instagram" className="inline-flex items-center justify-center w-11 h-11 rounded-md shadow-sm bg-white border"><span className="text-[#E4405F]">◎</span></span>
        <span title="Twitter" className="inline-flex items-center justify-center w-11 h-11 rounded-md shadow-sm bg-white border"><span className="text-[#1DA1F2]">t</span></span>
      </div>
    </form>
  );

  const OtpForm = (
    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5 w-full max-w-[370px] mx-auto px-2 animate-fade-in" aria-label="form xác minh OTP">
      <h1 className="font-bold text-2xl text-gray-900 text-center">Xác minh OTP</h1>
      <div className="text-center text-gray-600 mb-2 text-base font-medium">
        Mã xác thực đã gửi tới email: <span className="text-blue-700 font-semibold break-all">{email}</span>
      </div>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 text-lg text-center tracking-widest font-mono placeholder:text-gray-400"
        placeholder="Nhập mã OTP 6 số"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        aria-label="Mã OTP"
        autoFocus
        required
      />
      {otpError && (<div className="text-red-500 text-sm text-center" role="alert">{otpError}</div>)}

      <button type="submit" className="transition-all py-2 font-semibold rounded text-white text-lg bg-blue-600 enabled:hover:bg-blue-700 shadow-sm disabled:bg-blue-300" disabled={otpLoading} aria-busy={otpLoading}>
        {otpLoading ? 'Đang xác nhận…' : 'Xác nhận'}
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
      <img src={registerBg} alt="Register Background" className="w-full h-40 object-cover" />
    </div>
  );

  const Toast = toast && (
    <div role="alert" aria-live="polite" className={`${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'} fixed z-30 left-1/2 bottom-7 -translate-x-1/2 px-6 py-3 rounded-md shadow-lg flex items-center gap-2 text-base`} style={{ minWidth: 240, maxWidth: 340 }}>
      <span>{toast.message}</span>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left image */}
      {LeftPane}
      {/* Right form */}
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
