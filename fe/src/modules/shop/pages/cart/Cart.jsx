import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function Cart() {
  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Giỏ hàng của bạn</h1>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <ShoppingBag size={56} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Giỏ hàng hiện đang trống</h3>
        <p className="text-sm text-slate-500 mb-6">Hãy khám phá các sản phẩm và tài liệu học tập hữu ích từ GATS.</p>
        <Link
          to="/shop"
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm transition-colors"
        >
          Khám phá cửa hàng
        </Link>
      </div>
    </div>
  );
}
