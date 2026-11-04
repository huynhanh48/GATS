import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccess() {
  return (
    <div className="py-16 px-4 max-w-xl mx-auto text-center">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Đặt hàng thành công!</h1>
      <p className="text-sm text-slate-500 mb-6">
        Cảm ơn bạn đã tin tưởng GATS. Chúng tôi sẽ liên hệ sớm nhất để xác nhận và bàn giao đơn hàng.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/account/orders"
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white text-sm font-medium transition-colors inline-flex items-center"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
