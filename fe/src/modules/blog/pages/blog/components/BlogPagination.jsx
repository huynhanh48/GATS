import React from 'react';

/**
 * BlogPagination - Phân trang danh sách bài viết
 * - Luôn hiển thị tối đa đúng 3 số trang (sliding window: [trước, hiện tại, sau])
 * - Không hiển thị icon ba chấm
 * - Nút active: xanh dương #1a56db, chữ trắng, bo góc rounded-md
 * - Nút inactive: xanh nhạt #eaf2fe, chữ xanh #1a56db, bo góc rounded-md
 * - Nút Prev/Next luôn hiển thị đầy đủ
 */
export default function BlogPagination({
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

    // Khi tổng số trang > 3: luôn hiển thị đúng 3 số trang
    if (currentPage <= 1) {
      return [1, 2, 3];
    }
    if (currentPage >= totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    // Ở giữa: trang trước (currentPage - 1), hiện tại (currentPage), trang sau (currentPage + 1)
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-10 select-none"
      aria-label="Blog pagination"
    >
      {/* Prev Button */}
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => !isFirstPage && onPageChange?.(currentPage - 1)}
        className={`px-4 h-9 rounded-md bg-[#eaf2fe] text-[#1a56db] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
          isFirstPage
            ? 'opacity-40 cursor-not-allowed pointer-events-none'
            : 'hover:bg-[#dbeafe] active:bg-[#c9defe] cursor-pointer'
        }`}
        aria-label="Trang trước"
      >
        Prev
      </button>

      {/* 3 Page Numbers */}
      {pages.map((pageNum) => {
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => !isActive && onPageChange?.(pageNum)}
            className={`w-9 h-9 rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-[#1a56db] text-white shadow-sm cursor-default'
                : 'bg-[#eaf2fe] hover:bg-[#dbeafe] active:bg-[#c9defe] text-[#1a56db] cursor-pointer'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        disabled={isLastPage}
        onClick={() => !isLastPage && onPageChange?.(currentPage + 1)}
        className={`px-4 h-9 rounded-md bg-[#eaf2fe] text-[#1a56db] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
          isLastPage
            ? 'opacity-40 cursor-not-allowed pointer-events-none'
            : 'hover:bg-[#dbeafe] active:bg-[#c9defe] cursor-pointer'
        }`}
        aria-label="Trang sau"
      >
        Next
      </button>
    </nav>
  );
}
