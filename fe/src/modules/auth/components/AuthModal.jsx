import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuthStore, useAuthUiStore } from '../stores/auth.store';
import { authService } from '../services/authService';

/**
 * AuthModal - Modal Đăng nhập, Đăng ký và Quên mật khẩu
 * - 100% Tiếng Việt chuẩn văn phong chuyên nghiệp
 * - Xóa bỏ Facebook, chỉ giữ lại nút Google kèm Logo màu chính thức
 * - Quản lý context phiên đăng nhập bằng Zustand (useAuthStore)
 * - Xử lý thông báo lỗi và trạng thái loading trực quan
 */
export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setAuthModalTab } = useAuthUiStore();
  const { login, register, loginWithGoogle, loading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const googleBtnRef = React.useRef(null);
  const clientId =
    import.meta.env.PUBLIC_GOOGLE_CLIENT_ID ||
    '501395717848-vo6vfqup0im33mr0qovsdjffaeh40mcc.apps.googleusercontent.com';

  const handleClose = React.useCallback(() => {
    clearError();
    setLocalError('');
    setSuccessMessage('');
    setForgotSubmitted(false);
    closeAuthModal();
  }, [clearError, closeAuthModal]);

  const handleGoogleCredential = React.useCallback(
    async (response) => {
      if (response?.credential) {
        try {
          await loginWithGoogle(response.credential);
          setSuccessMessage('Đăng nhập Google thành công!');
          setTimeout(() => {
            handleClose();
          }, 1200);
        } catch (err) {
          setLocalError(err?.message || 'Đăng nhập Google không thành công.');
        }
      }
    },
    [loginWithGoogle, handleClose]
  );

  // Khóa scroll trang khi mở modal
  React.useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);

  // Khởi tạo Google Identity Services Button khi modal mở
  React.useEffect(() => {
    if (!isAuthModalOpen || authModalTab === 'forgot') return;

    let timer;
    let attempts = 0;

    const renderGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: authModalTab === 'login' ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: googleBtnRef.current.offsetWidth || 360,
            locale: 'vi',
          });
        } catch (e) {
          console.warn('Lỗi render Google Sign-In button:', e);
        }
      } else if (attempts < 20) {
        attempts += 1;
        timer = setTimeout(renderGoogle, 200);
      }
    };

    timer = setTimeout(renderGoogle, 50);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthModalOpen, authModalTab, clientId, handleGoogleCredential]);

  if (!isAuthModalOpen) return null;

  const handleTabChange = (tab) => {
    clearError();
    setLocalError('');
    setSuccessMessage('');
    setForgotSubmitted(false);
    setAuthModalTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (authModalTab === 'login') {
      try {
        await login({ identifier: email, password });
        setSuccessMessage('Đăng nhập thành công!');
        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err) {
        setLocalError(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } else if (authModalTab === 'register') {
      if (userName.length < 3) {
        setLocalError('Họ và tên hoặc tên người dùng phải có ít nhất 3 ký tự.');
        return;
      }
      try {
        await register({ user_name: userName, email, password });
        setSuccessMessage('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          setAuthModalTab('login');
          setSuccessMessage('');
        }, 1500);
      } catch (err) {
        setLocalError(err?.message || 'Đăng ký không thành công. Email hoặc tên tài khoản có thể đã tồn tại.');
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setForgotLoading(true);
    setLocalError('');

    try {
      await authService.forgotPassword(email);
      setForgotSubmitted(true);
    } catch (err) {
      setLocalError(err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setForgotLoading(false);
    }
  };



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[440px] bg-white rounded-[10px] p-6 sm:p-8 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Modal */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <X size={20} />
        </button>

        {/* Tab Header (Đăng nhập / Đăng ký) */}
        {authModalTab !== 'forgot' ? (
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors cursor-pointer select-none ${
                authModalTab === 'login'
                  ? 'border-[#1a56db] text-[#1a56db]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => handleTabChange('login')}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors cursor-pointer select-none ${
                authModalTab === 'register'
                  ? 'border-[#1a56db] text-[#1a56db]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => handleTabChange('register')}
            >
              Đăng ký
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </button>
          </div>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-[8px] flex items-center gap-2.5 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Thông báo lỗi */}
        {(localError || error) && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-[8px] text-rose-600 text-xs font-medium leading-relaxed">
            {localError || error}
          </div>
        )}

        {/* ========================================================
            1. FORM QUÊN MẬT KHẨU
            ======================================================== */}
        {authModalTab === 'forgot' ? (
          <div>
            <h2 className="text-xl font-extrabold text-[#273044] mb-2">
              Khôi phục mật khẩu
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Nhập địa chỉ email tài khoản của bạn để nhận liên kết hướng dẫn đặt lại mật khẩu mới.
            </p>

            {forgotSubmitted ? (
              <div className="text-center py-6 space-y-3 bg-blue-50/50 rounded-[10px] border border-blue-100 p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-bold text-[#273044]">Đã gửi thư xác nhận</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Liên kết khôi phục đã được gửi đến hộp thư <b>{email}</b>. Vui lòng kiểm tra email của bạn.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="mt-4 px-5 py-2 rounded-[6px] bg-[#1a56db] text-white text-xs font-bold hover:bg-[#1545b3] transition-colors cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#273044] mb-1.5">
                    Địa chỉ Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={16} className="absolute left-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {forgotLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================
              2. FORM ĐĂNG NHẬP / ĐĂNG KÝ
              ======================================================== */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên người dùng (Chỉ hiện khi Đăng ký) */}
            {authModalTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#273044] mb-1.5">
                  Họ và tên
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email / Tên đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-[#273044] mb-1.5">
                {authModalTab === 'login' ? 'Email hoặc Tên tài khoản' : 'Địa chỉ Email'}
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type={authModalTab === 'login' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] transition-colors"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#273044]">
                  Mật khẩu
                </label>
                {authModalTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-[11px] font-semibold text-[#1a56db] hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-[8px] border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label="Ẩn hiện mật khẩu"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nút bấm Đăng nhập / Đăng ký */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>
                {loading
                  ? 'Đang xử lý...'
                  : authModalTab === 'login'
                  ? 'Đăng nhập'
                  : 'Tạo tài khoản'}
              </span>
            </button>

            {/* Đường phân cách */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
                Hoặc tiếp tục với
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* NÚT GOOGLE CHUẨN GOOGLE IDENTITY SERVICES */}
            <div className="w-full flex flex-col items-center justify-center">
              <div
                ref={googleBtnRef}
                className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full min-h-[44px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (window.google?.accounts?.id) {
                      window.google.accounts.id.prompt();
                    } else {
                      setLocalError('Đang tải dịch vụ Google, vui lòng thử lại sau vài giây.');
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-[8px] border border-slate-200 bg-white hover:bg-slate-50 text-[#273044] text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{authModalTab === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
