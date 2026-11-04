import React from 'react';
import { Plus, Search } from 'lucide-react';

export default function CourseManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý khóa học</h2>
          <p className="text-xs text-slate-500">Thêm mới, sửa đổi nội dung và phân quyền khóa học.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#407bff] hover:bg-[#2d69ec] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
          <Plus size={16} /> Thêm khóa học mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-72">
            <input type="text" placeholder="Tìm khóa học..." className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs" />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>
        <div className="p-8 text-center text-slate-400 text-xs">
          Dữ liệu khóa học đang được đồng bộ từ Backend API...
        </div>
      </div>
    </div>
  );
}
