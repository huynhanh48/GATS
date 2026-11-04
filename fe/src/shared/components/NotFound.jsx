import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-extrabold text-[#407bff]/20 mb-2 select-none">
        404
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-3">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-slate-500 max-w-md mb-8">
        Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi đường dẫn hoặc tạm thời không khả dụng.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#407bff] text-white hover:bg-[#2d69ec] font-medium transition-colors shadow-sm shadow-blue-500/20"
        >
          <Home size={18} />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
