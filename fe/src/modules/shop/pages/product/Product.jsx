import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShoppingCart, Check, Shield } from 'lucide-react';

export default function Product() {
  const { identifier } = useParams();

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại cửa hàng
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
        <div className="h-80 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
          <ShoppingBag size={80} />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#407bff] bg-blue-50 px-2.5 py-1 rounded">
              Sản phẩm chính hãng
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-3 mb-2 capitalize">
              {identifier?.replace(/-/g, ' ')}
            </h1>
            <p className="text-2xl font-extrabold text-[#407bff] mb-4">350.000đ</p>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Tài liệu và ấn phẩm học tập thực chiến từ các giảng viên hàng đầu tại GATS Academy.
              Hỗ trợ giao hàng toàn quốc và kèm theo mã kích hoạt tài nguyên số.
            </p>

            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Cam kết chất lượng 100%</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Tặng kèm file mềm và bài tập thực hành</li>
              <li className="flex items-center gap-2"><Shield size={16} className="text-emerald-500" /> Bảo hành đổi trả trong 7 ngày</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              to="/cart"
              className="flex-1 py-3 px-6 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm text-center transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
            >
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
