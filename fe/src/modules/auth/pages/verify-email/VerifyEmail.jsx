import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { httpClient } from '@/shared/api-client/httpClient';
import { API } from '@/shared/constants/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã token xác thực hợp lệ.');
      return;
    }

    async function verify() {
      try {
        const res = await httpClient.get(API.AUTH.VERIFY_EMAIL(token));
        setStatus('success');
        setMessage(res?.data?.message || 'Xác thực tài khoản thành công!');
      } catch (err) {
        setStatus('error');
        setMessage(err?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <Loader2 size={40} className="animate-spin text-[#407bff] mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Đang xác thực tài khoản...</h2>
            <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Xác thực email thành công!</h2>
            <p className="text-sm text-slate-500">
              Tài khoản GATS Academy của bạn đã được kích hoạt. Hãy bắt đầu học tập ngay hôm nay.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm transition-colors mt-4"
            >
              Về trang chủ
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Xác thực thất bại</h2>
            <p className="text-sm text-slate-500">{message}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors mt-4"
            >
              Về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
