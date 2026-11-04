import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    // Simulate verification
    const timer = setTimeout(() => {
      setStatus('success');
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="py-16 px-4 max-w-md mx-auto text-center">
      {status === 'processing' && (
        <div className="space-y-4">
          <Loader2 size={40} className="animate-spin text-[#407bff] mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Đang xác thực thanh toán...</h2>
          <p className="text-sm text-slate-500">Vui lòng không đóng trình duyệt trong quá trình này.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Giao dịch thành công!</h2>
          <p className="text-sm text-slate-500">Đơn hàng của bạn đã được thanh toán hoàn tất.</p>
          <Link
            to="/account/orders"
            className="inline-block px-6 py-2.5 bg-[#407bff] hover:bg-[#2d69ec] text-white text-sm font-medium rounded-lg transition-colors mt-4"
          >
            Quản lý đơn hàng
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Giao dịch không thành công</h2>
          <p className="text-sm text-slate-500">Có lỗi phát sinh trong quá trình thanh toán.</p>
          <Link
            to="/checkout"
            className="inline-block px-6 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors mt-4"
          >
            Thử lại
          </Link>
        </div>
      )}
    </div>
  );
}
