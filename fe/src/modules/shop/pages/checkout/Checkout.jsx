import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    navigate('/checkout/success');
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại giỏ hàng
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Thanh toán đơn hàng</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 border-b pb-3">Thông tin nhận hàng</h2>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Họ và tên</label>
            <input required type="text" className="w-full px-3.5 py-2 border rounded-lg text-sm" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Số điện thoại</label>
            <input required type="tel" className="w-full px-3.5 py-2 border rounded-lg text-sm" placeholder="0988xxxxxx" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Địa chỉ nhận hàng</label>
            <input required type="text" className="w-full px-3.5 py-2 border rounded-lg text-sm" placeholder="Số nhà, đường, phường/xã, tỉnh/thành..." />
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 h-fit space-y-4">
          <h3 className="font-semibold text-slate-800">Tóm tắt đơn hàng</h3>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Tạm tính:</span>
            <span>350.000đ</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Phí vận chuyển:</span>
            <span>Miễn phí</span>
          </div>
          <div className="flex justify-between font-bold text-base text-slate-900 border-t pt-3">
            <span>Tổng cộng:</span>
            <span className="text-[#407bff]">350.000đ</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            Xác nhận đặt hàng
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" /> Thanh toán bảo mật SSL 256-bit
          </p>
        </div>
      </form>
    </div>
  );
}
