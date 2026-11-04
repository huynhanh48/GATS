import React, { useState } from 'react';
import { Star, RotateCcw, Minus, Plus, X } from 'lucide-react';

/**
 * Danh sách Categories chuẩn từ Backend (/api/categories?type=course)
 */
const DEFAULT_BACKEND_CATEGORIES = [
  'Coworking',
  'Mastery',
  'Automation',
  'AI Studio',
  'Vibe Coding',
  'AI Agents',
];

/**
 * Danh sách Tags chuẩn từ Backend (/api/tags?type=course)
 */
const DEFAULT_BACKEND_TAGS = [
  'Claude',
  'Gemini',
  'GitHub',
  'Prompt Engineering',
  'Workflow',
  'n8n',
  'NotebookLM',
  'Python',
  'JavaScript',
  'No-code automation',
  'Google Antigravity',
];

const STATUS_OPTIONS = [
  { id: 'hot', label: 'Hot' },
  { id: 'new', label: 'New' },
  { id: 'special', label: 'Special' },
];

/**
 * Cấp độ chuẩn theo enum BE: beginner | intermediate | advanced
 */
const LEVEL_OPTIONS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 and up', stars: 4.5 },
  { value: '4.0', label: '4.0 and up', stars: 4.0 },
  { value: '3.5', label: '3.5 and up', stars: 3.5 },
  { value: '3.0', label: '3.0 and up', stars: 3.0 },
];

const PRICE_OPTIONS = [
  { id: 'free', label: 'Miễn phí' },
  { id: 'paid', label: 'Có phí' },
  { id: 'contact', label: 'Liên hệ tư vấn' },
];

const AVAILABILITY_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'available_now', label: 'Available Now' },
  { id: 'coming_soon', label: 'Upcoming' },
];

export default function CourseFilterSidebar({
  categories = DEFAULT_BACKEND_CATEGORIES,
  tags = DEFAULT_BACKEND_TAGS,
  selectedCategories = [],
  selectedTags = [],
  selectedStatus = [],
  selectedLevels = [],
  selectedRating = '',
  selectedPrices = [],
  selectedAvailability = 'all',
  onCategoryChange,
  onTagChange,
  onStatusChange,
  onLevelChange,
  onRatingChange,
  onPriceChange,
  onAvailabilityChange,
  onApplyFilters,
  onResetFilters,
  onCloseMobile,
  isDrawer = false,
  className = '',
}) {
  // Trạng thái thu gọn/mở rộng từng accordion (mặc định mở)
  const [openSections, setOpenSections] = useState({
    category: true,
    tag: true,
    status: true,
    level: true,
    rating: true,
    price: true,
    availability: true,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters?.();
    onCloseMobile?.();
  };

  const categoryList = categories && categories.length > 0 ? categories : DEFAULT_BACKEND_CATEGORIES;
  const rawTagList = tags && tags.length > 0 ? tags : DEFAULT_BACKEND_TAGS;
  const tagList = rawTagList.filter((tag) => {
    const tagName = typeof tag === 'string' ? tag : tag.name || tag.slug || '';
    return !/^(chatgpt|chat gpt)$/i.test(tagName.trim());
  });

  return (
    <div className={`w-full bg-white ${isDrawer ? '' : 'rounded-[10px] border border-slate-200/90 p-5 shadow-sm'} ${className}`}>
      {/* Mobile Header (chỉ hiện khi có onCloseMobile và không ở trong Drawer) */}
      {!isDrawer && onCloseMobile && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 lg:hidden">
          <span className="text-base font-bold text-[#273044]">Bộ lọc tìm kiếm</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
            aria-label="Đóng bộ lọc"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================
            1. CATEGORY ACCORDION (Hidden scrollbar while scrollable)
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('category')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Category
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle category"
            >
              {openSections.category ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.category && (
            <div className="mt-3.5 space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
              {categoryList.map((category) => {
                const categoryName = typeof category === 'string' ? category : category.name || category.slug;
                const isChecked = selectedCategories.includes(categoryName);
                return (
                  <label
                    key={categoryName}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(selectedCategories, categoryName, onCategoryChange)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current stroke-2" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="truncate">{categoryName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            2. TAG ACCORDION (Hidden scrollbar while scrollable)
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('tag')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Tag
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle tag"
            >
              {openSections.tag ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.tag && (
            <div className="mt-3.5 space-y-2.5 max-h-56 overflow-y-auto no-scrollbar">
              {tagList.map((tag) => {
                const tagName = typeof tag === 'string' ? tag : tag.name || tag.slug;
                const isChecked = selectedTags.includes(tagName);
                return (
                  <label
                    key={tagName}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(selectedTags, tagName, onTagChange)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current stroke-2" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="truncate">{tagName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            3. LEVEL ACCORDION (Beginner, Intermediate, Advanced)
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('level')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Level
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle level"
            >
              {openSections.level ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.level && (
            <div className="mt-3.5 space-y-2.5">
              {LEVEL_OPTIONS.map((level) => {
                const isChecked = selectedLevels.includes(level.id);
                return (
                  <label
                    key={level.id}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(selectedLevels, level.id, onLevelChange)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current stroke-2" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span>{level.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            4. STATUS ACCORDION
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('status')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Status
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle status"
            >
              {openSections.status ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.status && (
            <div className="mt-3.5 space-y-2.5">
              {STATUS_OPTIONS.map((status) => {
                const isChecked = selectedStatus.includes(status.id);
                return (
                  <label
                    key={status.id}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(selectedStatus, status.id, onStatusChange)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current stroke-2" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span>{status.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            5. RATING ACCORDION
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('rating')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Rating
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle rating"
            >
              {openSections.rating ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.rating && (
            <div className="mt-3.5 space-y-2.5">
              {RATING_OPTIONS.map((item) => {
                const isChecked = selectedRating === item.value;
                return (
                  <label
                    key={item.value}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="course-rating"
                        value={item.value}
                        checked={isChecked}
                        onChange={() => onRatingChange?.(isChecked ? '' : item.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'border-[#1a56db]'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-[#1a56db]" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.floor(item.stars)
                                ? 'text-[#ffb606] fill-[#ffb606]'
                                : i === Math.floor(item.stars) && item.stars % 1 !== 0
                                  ? 'text-[#ffb606] fill-[#ffb606]/60'
                                  : 'text-slate-200 fill-slate-200'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[12px] text-slate-600 font-semibold">{item.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            6. PRICE ACCORDION
            ======================================================== */}
        <div className="border-b border-slate-100 pb-5">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('price')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Price
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle price"
            >
              {openSections.price ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.price && (
            <div className="mt-3.5 space-y-2.5">
              {PRICE_OPTIONS.map((price) => {
                const isChecked = selectedPrices.includes(price.id);
                return (
                  <label
                    key={price.id}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle(selectedPrices, price.id, onPriceChange)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current stroke-2" viewBox="0 0 12 10">
                            <polyline points="1.5 6 4.5 9 10.5 1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span>{price.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            7. AVAILABILITY ACCORDION
            ======================================================== */}
        <div className="pb-2">
          <div
            className="flex items-center justify-between cursor-pointer select-none group py-1"
            onClick={() => toggleSection('availability')}
          >
            <h3 className="text-[15px] font-bold text-[#273044] group-hover:text-[#1a56db] transition-colors">
              Availability
            </h3>
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center text-slate-400 group-hover:text-[#1a56db] transition-colors cursor-pointer"
              aria-label="Toggle availability"
            >
              {openSections.availability ? <Minus size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {openSections.availability && (
            <div className="mt-3.5 space-y-2.5">
              {AVAILABILITY_OPTIONS.map((item) => {
                const isChecked = selectedAvailability === item.id;
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 text-[13px] text-slate-600 font-medium cursor-pointer hover:text-[#1a56db] transition-colors py-0.5 select-none group"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="course-availability"
                        value={item.id}
                        checked={isChecked}
                        onChange={() => onAvailabilityChange?.(item.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                          isChecked
                            ? 'border-[#1a56db]'
                            : 'border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-[#1a56db]" />}
                      </div>
                    </div>
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            FILTER ACTIONS: SHOW RESULTS AND RESET ALL
            ======================================================== */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm text-center cursor-pointer"
          >
            Show Results
          </button>

          <button
            type="button"
            onClick={onResetFilters}
            className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1a56db] transition-colors py-1 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
        </div>
      </form>
    </div>
  );
}
