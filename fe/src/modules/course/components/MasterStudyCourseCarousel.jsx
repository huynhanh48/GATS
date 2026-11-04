import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MasterStudyCourseCard from './MasterStudyCourseCard';

/**
 * Component Course Carousel chuẩn phong cách MasterStudy Marketing LMS
 * Tham chiếu cấu trúc: ms_lms_courses_carousel & swiper-container
 * Hỗ trợ 4 cột trên desktop, điều hướng tròn mềm mại ở chân carousel hoặc trên header
 */
export default function MasterStudyCourseCarousel({
  title = 'KHÓA HỌC MỚI',
  subtitle = 'Khám phá các chương trình đào tạo vừa ra mắt với công nghệ AI và mô hình thực hành mới nhất.',
  courses = [],
  onSelectCourse,
  navPosition = 'bottom', // 'bottom' (chuẩn MasterStudy) hoặc 'header'
  headerAction,
  className = '',
}) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Cập nhật trạng thái kích hoạt của nút điều hướng trước/sau
  const checkScrollBounds = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    checkScrollBounds();
    track.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      track.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, courses]);

  // Cuộn theo độ rộng của thẻ card đang hiển thị
  const scroll = (direction) => {
    if (!trackRef.current) return;
    const { clientWidth } = trackRef.current;
    // Mỗi lần bấm sẽ cuộn khoảng 1 cụm thẻ hoặc 1 màn hình
    const scrollAmount = clientWidth > 900 ? clientWidth * 0.75 : clientWidth * 0.85;
    const targetLeft = direction === 'left' ? -scrollAmount : scrollAmount;

    trackRef.current.scrollBy({
      left: targetLeft,
      behavior: 'smooth',
    });
  };

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Tiêu đề Carousel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {title && (
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#273044] tracking-tight mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm md:text-base text-slate-500 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Cụm nút phụ trên header (nếu cấu hình) */}
        {(headerAction || navPosition === 'header') && (
          <div className="flex items-center gap-3 self-start md:self-end">
            {headerAction}
            {navPosition === 'header' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-[#407bff] hover:text-white hover:border-[#407bff] transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed"
                  aria-label="Khóa học trước"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-[#407bff] hover:text-white hover:border-[#407bff] transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed"
                  aria-label="Khóa học kế tiếp"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Track hiển thị danh sách khóa học dạng lướt 4 cột chuẩn MasterStudy */}
      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 pt-2 no-scrollbar px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] snap-start"
          >
            <MasterStudyCourseCard
              course={course}
              onSelectCourse={onSelectCourse}
            />
          </div>
        ))}
      </div>

      {/* Cụm nút điều hướng tròn đặt ở giữa phía dưới chuẩn xác theo ảnh chụp template MasterStudy */}
      {navPosition === 'bottom' && courses.length > 4 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-[#407bff] hover:text-white hover:border-[#407bff] transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed"
            aria-label="Khóa học trước"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-11 h-11 rounded-full border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-[#407bff] hover:text-white hover:border-[#407bff] transition-all shadow-sm disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed"
            aria-label="Khóa học kế tiếp"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
