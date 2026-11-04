import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await httpClient.post(API.AUTH.FORGOT_PASSWORD, { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Không thể gửi yêu cầu. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Quay lại trang chủ
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quên mật khẩu?</h1>
        <p className="text-sm text-slate-500 mb-6">
          Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu cho bạn.
        </p>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-semibold text-slate-800">Kiểm tra hộp thư của bạn</h3>
            <p className="text-sm text-slate-500">
              Đường dẫn xác nhận đã được gửi đến <b>{email}</b>. Vui lòng kiểm tra cả thư mục Spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email tài khoản
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gats.vn"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#407bff] focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
