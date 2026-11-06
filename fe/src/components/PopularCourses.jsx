import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { CourseCard } from '@/shared/components/CourseCard';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PopularCourses({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [wishlist, setWishlist] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        const data = await courseService.getCourses();
        if (mounted) {
          // Lấy tối đa 9 khóa học mới nhất
          const rawList = Array.isArray(data) ? data : [];
          setCourses(rawList.slice(0, 9));
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách khóa học từ máy chủ:', err);
        if (mounted) {
          setCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(courses.length / itemsPerPage) || 1;

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (course) => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course?.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  return (
    <section className="section popular-courses-section bg-[#f8fafc] py-20" id="courses">
      <div className="container">
        {/* Section Header with Carousel Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">GATS AI</h2>
            <p className="text-sm md:text-base text-slate-600">
              Được xây dựng bởi đội ngũ chuyên gia công nghệ và AI thực chiến hàng đầu
            </p>
          </div>

          {/* Navigation Controls: Circular Buttons */}
          {courses.length > itemsPerPage && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                title="Khóa học trước"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                title="Khóa học tiếp theo"
                aria-label="Next Slide"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#1a56db]" />
            <p className="text-sm text-slate-500">Đang tải danh sách khóa học từ máy chủ...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white rounded-[12px] border border-slate-200 p-8">
            Hiện chưa có khóa học nào được đăng tải.
          </div>
        ) : (
          /* Carousel Viewport */
          <div className="popular-carousel-viewport overflow-hidden py-3">
            <div
              className="popular-carousel-track flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentPage * 100}%)`,
              }}
            >
              {Array.from({ length: totalPages }).map((_, pageIdx) => {
                const pageCourses = courses.slice(
                  pageIdx * itemsPerPage,
                  pageIdx * itemsPerPage + itemsPerPage
                );

                return (
                  <div
                    key={pageIdx}
                    className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    style={{
                      visibility: pageIdx === currentPage ? 'visible' : 'hidden',
                    }}
                  >
                    {pageCourses.map((course) => (
                      <div key={course.id} className="h-full">
                        <CourseCard
                          course={course}
                          onSelectCourse={handleCardClick}
                          isWishlisted={!!wishlist[course.id]}
                          onToggleWishlist={toggleWishlist}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View All Bottom CTA */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-[10px] text-sm font-bold bg-[#1a56db] text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
          >
            Khám phá toàn bộ khóa học
          </button>
        </div>
      </div>
    </section>
  );
}
