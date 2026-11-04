import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function PromptFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  models = [],
  selectedCategory,
  onCategoryChange,
  selectedModel,
  onModelChange,
  pricingFilter,
  onPricingChange,
  onResetFilters,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Bộ lọc Prompts</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            {/* Chuyên mục */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Chuyên mục
              </h4>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => onCategoryChange('all')}
                  className={`w-full text-left text-xs px-3 py-2 rounded-[6px] font-medium transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#1a56db] text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tất cả chuyên mục
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategoryChange(cat)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-[6px] font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#1a56db] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mô hình AI */}
            {models.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Mô hình AI tương thích
                </h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => onModelChange('all')}
                    className={`w-full text-left text-xs px-3 py-2 rounded-[6px] font-medium transition-colors cursor-pointer ${
                      selectedModel === 'all'
                        ? 'bg-[#1a56db] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả mô hình
                  </button>
                  {models.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => onModelChange(mod)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-[6px] font-medium transition-colors cursor-pointer ${
                        selectedModel === mod
                          ? 'bg-[#1a56db] text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chi phí */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Chi phí
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'free', label: 'Miễn phí' },
                  { value: 'paid', label: 'Có phí' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onPricingChange(item.value)}
                    className={`text-xs py-2 px-2 rounded-[6px] font-semibold border text-center transition-colors cursor-pointer ${
                      pricingFilter === item.value
                        ? 'bg-[#1a56db] text-white border-[#1a56db]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 rounded-[6px] text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-[#1a56db] hover:bg-[#1545b3] text-white rounded-[6px] text-xs font-bold cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

