import React, { useEffect } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

/**
 * StemFilterDrawer - Drawer bộ lọc mô-đun STEM
 */
export default function StemFilterDrawer({
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
              Bộ Lọc Mô-đun STEM
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
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 no-scrollbar">
          {/* Lọc theo Danh mục */}
          <div>
            <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-3">
              Lĩnh vực STEM
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => onSelectCategory?.('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-medium transition-colors text-left cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#1a56db]/10 text-[#1a56db] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Tất cả lĩnh vực</span>
                {selectedCategory === 'all' && <Check size={14} />}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory?.(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-medium transition-colors text-left cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1a56db]/10 text-[#1a56db] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {selectedCategory === cat && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc theo Chi phí */}
          <div>
            <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-3">
              Chi phí học liệu
            </h3>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'free', label: 'Miễn phí' },
                { id: 'paid', label: 'Có phí (Kèm Kit)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPricing?.(p.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-medium transition-colors text-left cursor-pointer ${
                    pricingFilter === p.id
                      ? 'bg-[#1a56db]/10 text-[#1a56db] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{p.label}</span>
                  {pricingFilter === p.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Thiết lập lại</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer shadow-xs"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}
