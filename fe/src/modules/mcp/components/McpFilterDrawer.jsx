import React, { useEffect } from 'react';
import { X, RotateCcw, Check, Search } from 'lucide-react';

/**
 * McpFilterDrawer - Drawer bộ lọc MCP Server
 */
export default function McpFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  pricingFilter = 'all',
  onSelectPricing,
  searchQuery = '',
  onSearchChange,
  onResetFilters,
  totalResults = 0,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#273044]">
              Bộ Lọc MCP Server
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              ({totalResults} kết quả)
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng bộ lọc"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Ô tìm kiếm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tìm kiếm từ khóa
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Nhập tên MCP, lệnh cài đặt..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#1a56db] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Nhóm Nền tảng / Danh Mục */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Nền tảng MCP
            </label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold text-left transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-50 text-[#1a56db]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả nền tảng</span>
                {selectedCategory === 'all' && <Check size={14} className="text-[#1a56db]" />}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold text-left transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-50 text-[#1a56db]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check size={14} className="text-[#1a56db]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Nhóm Mức Giá */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Mức Giá
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'free', label: 'Miễn phí' },
                { id: 'paid', label: 'Có phí' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPricing(item.id)}
                  className={`py-2 px-2 text-center text-xs font-bold rounded-[6px] border transition-all cursor-pointer ${
                    pricingFilter === item.id
                      ? 'bg-[#1a56db] text-white border-[#1a56db] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white flex items-center gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[8px] border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
