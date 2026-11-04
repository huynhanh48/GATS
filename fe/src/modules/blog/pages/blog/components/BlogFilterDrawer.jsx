import React, { useState } from 'react';
import { X, RotateCcw, Minus, Plus, Search } from 'lucide-react';

/**
 * BlogFilterDrawer - Drawer lọc bài viết trượt từ bên phải
 * - Đồng bộ với layout và phong cách của CourseFilterSidebar
 * - Kết nối các tiêu chí lọc: Danh mục (Categories), Thẻ (Tags), Tác giả (Authors), Thời gian xuất bản
 */
export default function BlogFilterDrawer({
  isOpen,
  onClose,
  categories = [],
  tags = [],
  authors = [],
  selectedCategories = [],
  selectedTags = [],
  selectedAuthors = [],
  selectedDateRange = 'all',
  onCategoryChange,
  onTagChange,
  onAuthorChange,
  onDateRangeChange,
  onResetFilters,
  searchQuery = '',
  onSearchChange,
}) {
  const [openSections, setOpenSections] = useState({
    search: true,
    category: true,
    tag: true,
    author: true,
    dateRange: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxToggle = (list, item, onChange) => {
    if (!onChange) return;
    if (list.includes(item)) {
      onChange(list.filter((x) => x !== item));
    } else {
      onChange([...list, item]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="font-extrabold text-base sm:text-lg text-[#273044]">
              Bộ lọc bài viết
            </h3>
            {(selectedCategories.length > 0 ||
              selectedTags.length > 0 ||
              selectedAuthors.length > 0 ||
              selectedDateRange !== 'all' ||
              searchQuery) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs text-[#1a56db] hover:text-[#1545b3] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Đóng bộ lọc"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-sm">
          {/* 1. Tìm kiếm từ khóa */}
          <div className="border-b border-slate-100 pb-5">
            <button
              type="button"
              onClick={() => toggleSection('search')}
              className="w-full flex items-center justify-between font-bold text-[#273044] mb-3 select-none"
            >
              <span>Tìm kiếm từ khóa</span>
              {openSections.search ? <Minus size={15} /> : <Plus size={15} />}
            </button>
            {openSections.search && (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Nhập tiêu đề hoặc nội dung..."
                  className="w-full pl-9 pr-3 py-2 rounded-[8px] border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#1a56db]"
                />
              </div>
            )}
          </div>

          {/* 2. Danh mục bài viết (Categories) */}
          <div className="border-b border-slate-100 pb-5">
            <button
              type="button"
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between font-bold text-[#273044] mb-3 select-none"
            >
              <div className="flex items-center gap-2">
                <span>Danh mục bài viết</span>
                {selectedCategories.length > 0 && (
                  <span className="text-xs bg-blue-50 text-[#1a56db] font-bold px-2 py-0.5 rounded-full">
                    {selectedCategories.length}
                  </span>
                )}
              </div>
              {openSections.category ? <Minus size={15} /> : <Plus size={15} />}
            </button>
            {openSections.category && (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400">Không có danh mục nào</p>
                ) : (
                  categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex items-center justify-between text-xs sm:text-sm text-slate-600 hover:text-[#273044] cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleCheckboxToggle(
                                selectedCategories,
                                cat,
                                onCategoryChange
                              )
                            }
                            className="w-4 h-4 rounded text-[#1a56db] focus:ring-[#1a56db] border-slate-300 cursor-pointer"
                          />
                          <span className={isChecked ? 'font-bold text-[#1a56db]' : ''}>
                            {cat}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 3. Thẻ từ khóa (Tags) */}
          <div className="border-b border-slate-100 pb-5">
            <button
              type="button"
              onClick={() => toggleSection('tag')}
              className="w-full flex items-center justify-between font-bold text-[#273044] mb-3 select-none"
            >
              <div className="flex items-center gap-2">
                <span>Thẻ từ khóa (Tags)</span>
                {selectedTags.length > 0 && (
                  <span className="text-xs bg-blue-50 text-[#1a56db] font-bold px-2 py-0.5 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
              </div>
              {openSections.tag ? <Minus size={15} /> : <Plus size={15} />}
            </button>
            {openSections.tag && (
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-xs text-slate-400">Không có thẻ nào</p>
                ) : (
                  tags.map((t) => {
                    const isChecked = selectedTags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          handleCheckboxToggle(selectedTags, t, onTagChange)
                        }
                        className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer select-none ${
                          isChecked
                            ? 'bg-[#1a56db] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 4. Tác giả (Authors) */}
          {authors.length > 0 && (
            <div className="border-b border-slate-100 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('author')}
                className="w-full flex items-center justify-between font-bold text-[#273044] mb-3 select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Tác giả</span>
                  {selectedAuthors.length > 0 && (
                    <span className="text-xs bg-blue-50 text-[#1a56db] font-bold px-2 py-0.5 rounded-full">
                      {selectedAuthors.length}
                    </span>
                  )}
                </div>
                {openSections.author ? <Minus size={15} /> : <Plus size={15} />}
              </button>
              {openSections.author && (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {authors.map((auth) => {
                    const isChecked = selectedAuthors.includes(auth);
                    return (
                      <label
                        key={auth}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 hover:text-[#273044] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            handleCheckboxToggle(
                              selectedAuthors,
                              auth,
                              onAuthorChange
                            )
                          }
                          className="w-4 h-4 rounded text-[#1a56db] focus:ring-[#1a56db] border-slate-300 cursor-pointer"
                        />
                        <span className={isChecked ? 'font-bold text-[#1a56db]' : ''}>
                          {auth}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Khoảng thời gian */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('dateRange')}
              className="w-full flex items-center justify-between font-bold text-[#273044] mb-3 select-none"
            >
              <span>Thời gian đăng bài</span>
              {openSections.dateRange ? <Minus size={15} /> : <Plus size={15} />}
            </button>
            {openSections.dateRange && (
              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                {[
                  { id: 'all', label: 'Tất cả thời gian' },
                  { id: 'week', label: '7 ngày gần nhất' },
                  { id: 'month', label: '30 ngày gần nhất' },
                  { id: 'year', label: 'Trong năm nay' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="radio"
                      name="dateRange"
                      value={item.id}
                      checked={selectedDateRange === item.id}
                      onChange={() => onDateRangeChange?.(item.id)}
                      className="w-4 h-4 text-[#1a56db] focus:ring-[#1a56db] border-slate-300 cursor-pointer"
                    />
                    <span
                      className={
                        selectedDateRange === item.id
                          ? 'font-bold text-[#1a56db]'
                          : ''
                      }
                    >
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetFilters}
            className="w-1/2 py-2.5 rounded-[8px] border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Xóa bộ lọc
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
