import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1a56db] transition-colors"
      >
        <ChevronLeft size={14} />
        <span>Danh sách đơn hàng</span>
      </Link>

      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#273044]">
            Chi tiết đơn hàng #{id}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Đặt ngày: 08/09/2026</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
          Đang xử lý
        </span>
      </div>

      <div className="space-y-3 text-xs sm:text-sm text-slate-600">
        <div className="flex justify-between py-2.5 border-b border-slate-100">
          <span className="text-slate-400 font-medium">Sản phẩm:</span>
          <span className="font-bold text-[#273044]">Bộ Giáo Trình GATS Pro 2026 (x1)</span>
        </div>
        <div className="flex justify-between py-2.5 border-b border-slate-100">
          <span className="text-slate-400 font-medium">Phương thức thanh toán:</span>
          <span className="font-semibold text-slate-800">Chuyển khoản QR (VietQR)</span>
        </div>
        <div className="flex justify-between py-2.5 border-b border-slate-100">
          <span className="text-slate-400 font-medium">Địa chỉ nhận hàng:</span>
          <span className="font-semibold text-slate-800">Quận 1, TP. Hồ Chí Minh</span>
        </div>
        <div className="flex justify-between py-3 font-black text-sm sm:text-base text-[#273044] bg-slate-50/80 px-4 rounded-[8px]">
          <span>Tổng thanh toán:</span>
          <span className="text-[#1a56db]">450.000đ</span>
        </div>
      </div>
    </div>
  );
}
