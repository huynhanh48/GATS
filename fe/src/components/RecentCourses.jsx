import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { ChevronLeft, ChevronRight, Users, Eye, Star } from 'lucide-react';

export default function RecentCourses({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        const data = await courseService.getCourses();
        if (mounted) {
          // Chỉ lấy 9 khóa học mới nhất
          const rawList = Array.isArray(data) ? data : [];
          setCourses(rawList.slice(0, 9));
        }
      } catch (err) {
        console.warn('Lỗi tải khóa học mới từ API Backend:', err);
        if (mounted) setCourses([]);
      }
    }
    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  // Tổng số trang (mỗi lần slide 3 khóa học, tối đa 9 khóa => 3 trang)
  const itemsPerPage = 3;
  const totalPages = Math.ceil(courses.length / itemsPerPage) || 1;

  const nextSlide = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleCardClick = (course) => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course?.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <section className="section recent-courses-section" id="recent-courses">
      <div className="container">
        {/* Section Header with Actions and Carousel Arrows */}
        <div className="recent-header">
          <div className="recent-header-text">
            <h2 className="section-title">KHOÁ HỌC MỚI</h2>
            <p className="section-subtitle">
              Khám phá các chương trình đào tạo vừa ra mắt với công nghệ AI và mô hình thực hành mới nhất.
            </p>
          </div>

          <div className="recent-header-actions">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="btn-primary view-all-btn cursor-pointer"
            >
              Xem tất cả
            </button>

            {/* Carousel Navigation Arrows */}
            <div className="carousel-nav-arrows">
              <button
                type="button"
                onClick={prevSlide}
                className="carousel-btn prev-btn cursor-pointer"
                aria-label="Previous courses"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="carousel-btn next-btn cursor-pointer"
                aria-label="Next courses"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div className="carousel-viewport overflow-hidden py-3">
          <div
            className="carousel-slider-track flex transition-transform duration-500 ease-out"
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
                    <div
                      key={course.id}
                      className="recent-card bg-white rounded-[12px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                      onClick={() => handleCardClick(course)}
                    >
                      {/* Thumbnail */}
                      <div className="recent-thumb-wrap relative w-full aspect-[16/9] bg-slate-900 overflow-hidden shrink-0">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>

                      {/* Card Body */}
                      <div className="recent-card-body p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider block mb-1.5 truncate">
                            {course.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-snug mb-3 line-clamp-2 h-[44px]">
                            {course.title}
                          </h3>
                        </div>

                        <div>
                          {/* Rating & Price Row */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Star size={14} fill="#f59e0b" color="#f59e0b" />
                              <span className="text-xs font-extrabold text-slate-800">
                                {Number(course.rating || 5).toFixed(1)}
                              </span>
                            </div>

                            <div className="text-sm font-extrabold text-[#1a56db]">
                              {course.price}
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-slate-500 text-xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <Users size={13} className="shrink-0" />
                              <span className="truncate">
                                {typeof course.students === 'number'
                                  ? `${course.students.toLocaleString()} học viên`
                                  : course.students || '0 học viên'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Eye size={13} className="shrink-0" />
                              <span className="truncate">{course.views || '24 bài học'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentPage === idx ? 'w-6 bg-[#1a56db]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .recent-courses-section {
          background-color: var(--bg-soft);
          padding: 80px 0;
          overflow: hidden;
        }
        .recent-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 20px;
        }
        .recent-header-text .section-title {
          text-align: left;
          margin-bottom: 8px;
        }
        .recent-header-text .section-subtitle {
          text-align: left;
        }
        .recent-header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .view-all-btn {
          padding: 10px 22px;
          font-size: 14px;
          border-radius: 8px;
        }
        .carousel-nav-arrows {
          display: flex;
          gap: 8px;
        }
        .carousel-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e293b;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
        }
        .carousel-btn:hover {
          background-color: #1a56db;
          color: #ffffff;
          border-color: #1a56db;
        }

        @media (max-width: 768px) {
          .recent-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
