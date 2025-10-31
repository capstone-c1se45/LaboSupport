import React, { useState, useRef, useEffect } from "react";
import { api, getErrorMessage } from "../lib/api-client";
// import { useNavigate } from "react-router-dom"; // Đã xóa

// Dummy image URL for left artwork; replace with your own if needed:
const illustrationUrl =
  "https://static.vecteezy.com/system/resources/previews/027/112/209/original/concept-of-law-and-justice-scales-books-and-lawyers-in-flat-cartoon-style-legal-advice-illustration-vector.jpg";

const LOGO = (
  <div className="absolute top-6 right-8 flex items-center gap-2">
    <div className="bg-blue-600 text-white rounded-full px-2 py-[2px] font-bold text-xl select-none">
      <span role="img" aria-label="Justice">
        ⚖️
      </span>
    </div>
    <span className="text-xl font-semibold text-blue-700 tracking-wide">
      LaborSupport
    </span>
  </div>
);

// Social icons (use svg so no extra deps)
const SocialIcons = () => (
  <div className="grid grid-cols-3 gap-3 mt-3">
    {/* Facebook */}
    <button
      className="border border-gray-300 rounded-md h-10 flex items-center justify-center hover:bg-blue-100 transition"
      aria-label="Đăng nhập bằng Facebook"
      tabIndex={0}
    >
      <svg width="22" height="22" fill="currentColor" className="text-blue-600" viewBox="0 0 24 24"><path d="M15.12 8.43V6.62c0-.54.36-.67.61-.67h1.57V3.64L14.66 3.6c-2.7 0-3.27 2.03-3.27 3.33v1.5H9.43v2.2h1.95v5.95c0 .33.21.55.53.55h2.19c.33 0 .52-.21.52-.55v-5.98h1.64l.25-2.2h-1.88zm5.88-5.91C21 1.67 19.33 0 17.29 0H6.71C4.67 0 3 .67 3 .67S1.67 1.67.71 3.67C.08 4.91 0 6.33 0 12s.08 7.09.71 8.33C1.67 22.33 3 23.33 3 23.33s1.67.67 3.71.67h10.56c2.04 0 3.71-.67 3.71-.67s1.33-1 2.29-3.01c.63-1.26.71-2.67.71-8.32 0-5.66-.08-7.07-.71-8.31zM22 12c0 5.92-.15 6.81-.53 7.49-.46.86-1.03 1.44-2.07 1.44H6.6c-1.04 0-1.61-.58-2.06-1.44-.38-.68-.54-1.57-.54-7.49 0-5.92.16-6.8.54-7.48C5 1.67 6.6 1 6.6 1h12.79c.04 0 1.66.66 2.07 1.54.37.67.53 1.56.53 7.46z"></path></svg>
    </button>
    {/* Google */}
    <button
      className="border border-gray-300 rounded-md w-full h-10 flex items-center justify-center hover:bg-gray-100 transition"
      aria-label="Đăng nhập bằng Google"
      tabIndex={0}
    >
      <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
        <g>
          <path d="M11 8.9v3.04h4.31c-.18 1-1.1 2.95-4.31 2.95-2.6 0-4.71-2.16-4.71-4.84s2.11-4.84 4.7-4.84c1.48 0 2.47.63 3.03 1.17l2.07-2.03C14.6 3.23 12.96 2.3 11 2.3c-4.73 0-8.54 3.81-8.54 8.54s3.81 8.54 8.54 8.54c4.93 0 8.19-3.45 8.19-8.3 0-.56-.06-.98-.13-1.38z" fill="#FFC107"/>
          <path d="M2.46 6.67l2.14 1.57C5.38 7.22 6.86 5.74 9 5.74c1.11 0 2 .36 2.74 1l2.04-1.98C12.87 2.27 10.79 1.18 9 1.18c-2.5 0-4.81 2.1-6.12 5.49l-.42 1z" fill="#FF3D00"/>
          <path d="M11 18.07c2.33 0 4.01-.77 5.27-2.12l-2.52-2.1c-.66.58-1.6.99-2.76.99-2.2 0-4.08-1.51-4.75-3.32l-2.13 1.65C4.2 16.4 7.25 18.07 11 18.07z" fill="#4CAF50"/>
          <path d="M17.32 15.95c1.32-1.32 2.13-3.12 2.13-5.11 0-.51-.05-1-.14-1.45H11v3.04h4.32a4.19 4.19 0 01-1.3 2.19l2.5 2.11z" fill="#1976D2"/>
        </g>
      </svg>
    </button>
    {/* Apple */}
    <button
      className="border border-gray-300 rounded-md w-full h-10 flex items-center justify-center hover:bg-gray-200 transition"
      aria-label="Đăng nhập bằng Apple"
      tabIndex={0}
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.5,13.97 C19.5,17.24 22,18.32 22,18.32 C20.8,20.77 18.6,21.57 17.41,21.57 C16.22,21.57 15.21,21.26 14.11,20.93 C13.49,20.75 12.97,20.66 12.21,20.66 C11.45,20.66 10.93,20.75 10.32,20.93 C9.22,21.26 8.21,21.57 7.02,21.57 C5.83,21.57 3.62,20.77 2.42,18.32 C2.42,18.32 4.94,17.24 4.94,13.97 C4.94,10.88 7.51,10.13 7.51,10.13 C7.3,9.39 7.14,8.31 9.05,8.31 C9.89,8.31 10.64,8.88 11.04,9.07 C11.44,9.28 12.11,9.28 12.51,9.07 C12.91,8.88 13.66,8.31 14.5,8.31 C16.41,8.31 16.24,9.39 16.04,10.13 C16.04,10.13 18.6,10.88 18.6,13.97 Z"/>
        <path d="M12.21,3.51 C13.38,3.51 14.53,4.41 15,5.47 C13.88,6.04 12.78,6.65 11.45,6.65 C10.31,6.65 9.2,6.23 8.08,5.47 C8.7,4.41 9.7,3.51 10.86,3.51 C11.66,3.51 12.09,3.51 12.21,3.51 Z"/>
      </svg>
    </button>
  </div>
);

// Removed mockApi; using real backend APIs via api-client

const OTP_COOLDOWN = 60; // 60s resend timer

const RegisterPage = () => {
  // ----- STATES -----
  // Registration fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [agreed, setAgreed] = useState(false);
  // Registration UX states
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("register"); // or "otp"
  const [toast, setToast] = useState(null); // {type:'error'|'success', message:string}
  // OTP
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const otpTimerRef = useRef(null);

  // const navigate = useNavigate(); // Đã xóa

  // ----- EFFECTS -----
  // OTP cooldown countdown
  useEffect(() => {
    if (otpResendCooldown <= 0) {
      clearInterval(otpTimerRef.current);
      return;
    }
    otpTimerRef.current = setInterval(() => {
      setOtpResendCooldown((c) => {
        if (c <= 1) clearInterval(otpTimerRef.current);
        return Math.max(0, c - 1);
      });
    }, 1000);
    return () => clearInterval(otpTimerRef.current);
  }, [otpResendCooldown]);

  // Toast auto-close
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // HANDLERS
  // Registration form validation
      function validateForm() {
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (username.trim().length < 2) return "T�n dang nh?p ph?i c� �t nh?t 2 k� t?.";
    if (!reEmail.test(email)) return "Email kh�ng h?p l?.";
    if (!strongPw.test(password)) return "M?t kh?u ph?i t?i thi?u 8 k� t? v� g?m ch? hoa, ch? thu?ng, s? v� k� t? d?c bi?t.";
    if (password !== password2) return "M?t kh?u x�c nh?n kh�ng kh?p.";
    if (!agreed) return "B?n ph?i d?ng � v?i �i?u kho?n v� Ch�nh s�ch.";
    return null;
  }
// Handle registration (Step 1)
  async function handleSubmit(e) {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setToast({ type: "error", message: error });
      return;
    }
    setLoading(true);
    try {
      // Mock sending OTP
      const resp = await api.post("/users/send-verify-code", { email });
      if (resp?.data?.code) {
        setOtp(resp.data.code);
        setToast({ type: "success", message: `OTP (dev): ${resp.data.code}` });
      }
      setStep("otp");
      setOtp(""); // Clear any previous OTP
      setOtpResendCooldown(OTP_COOLDOWN); // start timer on OTP screen
      setToast({ type: "success", message: "Mã OTP đã được gửi đến email của bạn!" });
    } catch (err) {
      setToast({ type: "error", message: getErrorMessage(err, "G?i OTP th?t b?i. Vui l�ng th? l?i!") });
    }
    setLoading(false);
  }

  // Handle OTP verification (Step 2)
  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError(getErrorMessage(err, "�ang k� th?t b?i. Vui l�ng ki?m tra th�ng tin v� th? l?i."));
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await api.post("/users/register", { username, password, email, verify_code: otp });
      // Success: store role & navigate
      localStorage.setItem("role", "Người dùng đã đăng ký");
      setToast({ type: "success", message: "Đăng ký thành công!" });
      setTimeout(() => {
        // Đã thay thế navigate bằng window.location.href
        window.location.href = "/home";
        // navigate("/home", { state: { role: "Người dùng đã đăng ký" } });
      }, 900);
    } catch (err) {
      setOtpError(getErrorMessage(err, "�ang k� th?t b?i. Vui l�ng ki?m tra th�ng tin v� th? l?i."));
    }
    setOtpLoading(false);
  }

  // Resend OTP
  async function handleResendOtp() {
    if (otpResendCooldown > 0) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const resp = await api.post("/users/send-verify-code", { email });
      if (resp?.data?.code) {
        setOtp(resp.data.code);
        setToast({ type: "success", message: `OTP (dev): ${resp.data.code}` });
      }
      setOtpResendCooldown(OTP_COOLDOWN);
      setToast({ type: "success", message: "OTP mới đã được gửi!" });
    } catch (err) {
      setOtpError("Gửi lại OTP thất bại. Vui lòng thử lại.");
    }
    setOtpLoading(false);
  }

  // UI COMPONENTS
  const LeftPane = (
    <div className="relative hidden md:flex w-full md:w-1/2 h-screen min-h-[560px] items-center justify-center overflow-hidden">
      {/* Illustration */}
      <img
        src={illustrationUrl}
        alt="Justice & Law Illustration"
        className="max-w-[440px] w-4/5 md:w-11/12 mx-auto object-contain pointer-events-none select-none"
        style={{ marginTop: 0 }} // Đã điều chỉnh
      />
    </div>
  );

  // Registration Form
  const RegisterForm = (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-[360px] mx-auto px-2 py-10" // Đã xóa bg, shadow, rounded
      aria-label="form đăng ký"
    >
      <h1 className="font-bold text-3xl text-gray-900 text-center mb-2">ĐĂNG KÝ</h1>
      <div className="text-center text-gray-600 mb-3 text-lg font-medium">CHÀO MỪNG!</div>
      {/* Username */}
      <label className="text-xs text-gray-700 font-semibold" htmlFor="username">
        Tên đăng nhập
      </label>
      <input
        type="text"
        id="username"
        className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 mb-1"
        placeholder="Nguyễn Văn A"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Tên đăng nhập"
        autoFocus
        required
      />
      {/* Email */}
      <label className="text-xs text-gray-700 font-semibold" htmlFor="email">
        Email
      </label>
      <input
        type="email"
        id="email"
        className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 mb-1"
        placeholder="nguoidung@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email"
        required
      />
      {/* Password */}
      <label className="text-xs text-gray-700 font-semibold" htmlFor="password">
        Mật khẩu
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 pr-8 w-full"
          placeholder="Nhập mật khẩu của bạn"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Mật khẩu"
          required
        />
        <button
          type="button"
          tabIndex={0}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? (
            // Eye Off Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825a10.05 10.05 0 01-1.875.175C4.5 19 2 12 2 12a16.038 16.038 0 014.145-5.603M9.878 9.878A3 3 0 1114.12 14.12M17.657 17.657A16.032 16.032 0 0022 12s-2.5-7-10-7a9.956 9.956 0 00-4.62 1.146" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" /></svg>
          ) : (
            // Eye Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            </svg>
          )}
        </button>
      </div>
      {/* Confirm Password */}
      <label className="text-xs text-gray-700 font-semibold" htmlFor="password2">
        Xác nhận mật khẩu
      </label>
      <div className="relative">
        <input
          type={showPassword2 ? "text" : "password"}
          id="password2"
          className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 pr-8 w-full"
          placeholder="................."
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          aria-label="Xác nhận mật khẩu"
          required
        />
        <button
          type="button"
          tabIndex={0}
          aria-label={showPassword2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword2((v) => !v)}
        >
          {showPassword2 ? (
            // Eye Off Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825a10.05 10.05 0 01-1.875.175C4.5 19 2 12 2 12a16.038 16.038 0 014.145-5.603M9.878 9.878A3 3 0 1114.12 14.12M17.657 17.657A16.032 16.032 0 0022 12s-2.5-7-10-7a9.956 9.956 0 00-4.62 1.146" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22" /></svg>
          ) : (
            // Eye Icon
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            </svg>
          )}
        </button>
      </div>
      {/* Agree to terms */}
      <label className="flex items-center gap-2 mt-2 text-gray-800 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="accent-blue-600"
          aria-checked={agreed}
        />
        <span>
          Tôi đồng ý với{" "}
          <a href="/terms" target="_blank" className="text-blue-600 underline hover:opacity-80">
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="/privacy" target="_blank" className="text-blue-600 underline hover:opacity-80">
            Chính sách bảo mật
          </a>
        </span>
      </label>
      {/* Register button */}
      <button
        type="submit"
        disabled={loading}
        className="transition-all mt-1 py-2 font-semibold rounded text-white text-lg bg-blue-600 enabled:hover:bg-blue-700 shadow-sm disabled:bg-blue-300 w-full"
        aria-busy={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Đang xử lý...
          </span>
        ) : (
          "ĐĂNG KÝ"
        )}
      </button>
      {/* Login redirect */}
      <div className="text-sm text-center text-gray-500 mt-0">
        Bạn đã có tài khoản?{" "}
        <a href="/login" className="text-blue-600 font-semibold hover:underline">Đăng Nhập</a>
      </div>
      {/* Social logins */}
      <div className="flex items-center gap-2 mt-5 mb-1">
        <hr className="flex-1 border-t border-gray-200" />
        <span className="px-1 text-gray-400 text-xs tracking-wide">Đăng nhập với</span>
        <hr className="flex-1 border-t border-gray-200" />
      </div>
      <SocialIcons />
    </form>
  );

  // OTP Input
  const OtpForm = (
    <form
      onSubmit={handleOtpSubmit}
      className="flex flex-col gap-5 w-full max-w-[370px] mx-auto px-2 animate-fade-in"
      aria-label="form xác minh OTP"
    >
      <h1 className="font-bold text-2xl text-gray-900 text-center">Xác minh OTP</h1>
      <div className="text-center text-gray-600 mb-2 text-base font-medium">
        Mã xác thực đã gửi tới email:{" "}
        <span className="text-blue-700 font-semibold break-all">{email}</span>
      </div>
      {/* OTP input */}
      <input
        type="text"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        className="border border-gray-300 rounded focus:outline-blue-400 px-3 py-2 text-lg text-center tracking-widest font-mono"
        placeholder="Nhập mã OTP 6 số"
        value={otp}
        onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
        aria-label="Mã OTP"
        autoFocus
        required
      />
      {otpError && (
        <div
          className="text-red-500 text-sm text-center"
          role="alert"
        >
          {otpError}
        </div>
      )}
      <button
        type="submit"
        className="transition-all py-2 font-semibold rounded text-white text-lg bg-blue-600 enabled:hover:bg-blue-700 shadow-sm disabled:bg-blue-300"
        disabled={otpLoading}
        aria-busy={otpLoading}
      >
        {otpLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Đang xác nhận...
          </span>
        ) : (
          "Xác nhận"
        )}
      </button>
      <div className="flex flex-col gap-2 items-center">
        <button
          type="button"
          className={`text-sm font-medium px-3 py-1 text-blue-600 enabled:hover:underline disabled:text-gray-400 transition`}
          onClick={handleResendOtp}
          disabled={otpResendCooldown > 0 || otpLoading}
        >
          {otpResendCooldown > 0
            ? `Gửi lại OTP (${otpResendCooldown}s)`
            : "Gửi lại OTP"}
        </button>
        <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-700 underline"
          onClick={() => setStep("register")}
        >
          Quay lại đăng ký
        </button>
      </div>
    </form>
  );

  // Mobile image (above form)
  const MobileImage = (
    <div className="relative block md:hidden w-full min-h-[200px] items-center justify-center pt-12">
      <img
        src={illustrationUrl}
        alt="Justice & Law Illustration"
        className="w-[78%] max-w-[350px] mx-auto mt-10 mb-0 object-contain"
      />
    </div>
  );

  // TOAST
  const Toast = toast && (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed z-30 left-1/2 bottom-7 -translate-x-1/2 px-6 py-3 rounded-md shadow-lg flex items-center gap-2 text-base
        ${toast.type === "error"
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-green-100 text-green-700 border border-green-300"}
      `}
      style={{ minWidth: 240, maxWidth: 340 }}
    >
      {toast.type === "error" ? (
        <svg width="22" height="22" fill="none" stroke="currentColor" className="text-red-700" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path strokeWidth="2.5" d="M9 15.6l6.3-6.3M9 9.3l6.3 6.3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="22" height="22" fill="none" stroke="currentColor" className="text-green-700" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeWidth="2.5" d="M8 13l3 3 5-5" strokeLinecap="round" /></svg>
      )}
      <span>{toast.message}</span>
    </div>
  );

  // FINAL RENDER --------
  return (
    <div className="w-full min-h-screen bg-white flex flex-col md:flex-row">
      {/* Logo - Đặt ở ngoài cùng */}
      {LOGO}

      {/* Left artwork for desktop, mobile version above form */}
      {LeftPane}
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {MobileImage}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full mt-2 px-3">
            {step === "register" ? RegisterForm : OtpForm}
          </div>
        </div>
      </div>
      {Toast}
    </div> // Missing closing div tag was here
  );
}; // The stray '};' was here, now correctly closes the component

export default RegisterPage;

/*
 * Usage:
 * 1. Place this file as src/pages/RegisterPage.jsx.
 * 2. In App.jsx, import RegisterPage and add a route:
 * <Route path="/register" element={<RegisterPage />} />
 * 3. Make sure your main.jsx is wrapped in BrowserRouter and you have Tailwind installed.
 * 4. Ready to test! Adjust illustrationUrl as you like.
 */





