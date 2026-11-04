import React from 'react';

/**
 * Thanh phân loại / sắp xếp dạng Pills ngang chuẩn MasterStudy LMS
 * Tham chiếu: ms_lms_courses_archive__sorting style_1
 */
const SORT_OPTIONS = [
  { id: 'date_high', label: 'Newest' },
  { id: 'date_low', label: 'Oldest' },
  { id: 'price_high', label: 'Price high' },
  { id: 'price_low', label: 'Price low' },
  { id: 'popular', label: 'Most Viewed' },
  { id: 'rating', label: 'Overall Rating' },
  { id: 'coming_soon', label: 'Coming Soon' },
];

export default function CourseSortingPills({ activeSort = 'date_high', onSortChange }) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {SORT_OPTIONS.map((option) => {
        const isActive = activeSort === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSortChange?.(option.id)}
            className={`px-5 py-2 rounded-full text-xs md:text-[13px] font-semibold transition-all duration-200 select-none cursor-pointer ${
              isActive
                ? 'bg-[#1a56db] text-white shadow-md shadow-blue-600/20'
                : 'bg-[#f1f5f9] text-[#4a5568] hover:bg-[#e2e8f0] hover:text-[#1a202c] border border-slate-200/80'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
