import React from 'react';

/**
 * SkillPagination - Phân trang danh sách Kỹ năng AI
 * Đồng bộ với phong cách CoursePagination
 */
export default function SkillPagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const getPageNumbers = () => {
    if (totalPages <= 3) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 1) {
      return [1, 2, 3];
    }
    if (currentPage >= totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12 select-none"
      aria-label="Skill pagination"
    >
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => !isFirstPage && onPageChange?.(currentPage - 1)}
        className={`px-4 h-9 rounded-[6px] bg-[#eaf2fe] text-[#1a56db] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
          isFirstPage
            ? 'opacity-40 cursor-not-allowed pointer-events-none'
            : 'hover:bg-[#dbeafe] active:bg-[#c9defe] cursor-pointer'
        }`}
        aria-label="Trang trước"
      >
        Prev
      </button>

      {pages.map((pageNum) => {
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange?.(pageNum)}
            className={`w-9 h-9 rounded-[6px] text-xs sm:text-sm font-bold transition-colors flex items-center justify-center cursor-pointer ${
              isActive
                ? 'bg-[#1a56db] text-white shadow-xs'
                : 'bg-[#eaf2fe] text-[#1a56db] hover:bg-[#dbeafe]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        disabled={isLastPage}
        onClick={() => !isLastPage && onPageChange?.(currentPage + 1)}
        className={`px-4 h-9 rounded-[6px] bg-[#eaf2fe] text-[#1a56db] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
          isLastPage
            ? 'opacity-40 cursor-not-allowed pointer-events-none'
            : 'hover:bg-[#dbeafe] active:bg-[#c9defe] cursor-pointer'
        }`}
        aria-label="Trang tiếp"
      >
        Next
      </button>
    </nav>
  );
}
