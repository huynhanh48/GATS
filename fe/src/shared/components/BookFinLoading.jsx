import React from 'react';

export default function BookFinLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
        <div className="w-16 h-16 rounded-full border-4 border-t-[#407bff] border-r-transparent border-b-[#407bff] border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 bg-[#407bff] rounded-full"></span>
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500 tracking-wide animate-pulse">
        Đang tải trang...
      </p>
    </div>
  );
}
