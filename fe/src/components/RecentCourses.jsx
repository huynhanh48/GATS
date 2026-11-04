import React, { useState, useRef, useEffect } from 'react';
import { courseService } from '@/modules/course/services/courseService';
import { ChevronLeft, ChevronRight, Users, Eye, Star } from 'lucide-react';

export default function RecentCourses({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        const data = await courseService.getCourses();
        if (mounted) {
          setCourses(Array.isArray(data) ? data : []);
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

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
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
            <a href="#courses" className="btn-primary view-all-btn">
              Xem tất cả
            </a>

            <div className="carousel-nav-arrows">
              <button
                onClick={scrollLeft}
                className="carousel-btn prev-btn"
                aria-label="Previous courses"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollRight}
                className="carousel-btn next-btn"
                aria-label="Next courses"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Tracks */}
        <div className="carousel-track" ref={carouselRef}>
          {courses.map((course) => {
            return (
              <div
                key={course.id}
                className="recent-card"
                onClick={() => onSelectCourse && onSelectCourse(course)}
              >
                {/* Thumb */}
                <div className="recent-thumb-wrap">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="recent-thumb-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Body */}
                <div className="recent-card-body">
                  <span className="recent-category">{course.category}</span>
                  <h3 className="recent-title">{course.title}</h3>

                  <div className="recent-meta-row">
                    <div className="rating-box">
                      <Star size={14} fill="#ffb606" color="#ffb606" />
                      <span className="rating-num">{course.rating.toFixed(1)}</span>
                    </div>

                    <div className="recent-price-box">
                      {course.price}
                    </div>
                  </div>

                  <div className="recent-stats-row">
                    <div className="stat-item">
                      <Users size={13} />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <Eye size={13} />
                      <span>{course.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .recent-courses-section {
          background-color: var(--bg-soft);
          padding: 100px 0;
          overflow: hidden;
        }
        .recent-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
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
          padding: 11px 24px;
          font-size: 14px;
        }
        .carousel-nav-arrows {
          display: flex;
          gap: 8px;
        }
        .carousel-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-dark);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        .carousel-btn:hover {
          background-color: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }
        .carousel-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 16px;
          scrollbar-width: thin;
        }
        .recent-card {
          flex: 0 0 280px;
          scroll-snap-align: start;
          background: #ffffff;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .recent-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .recent-thumb-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background-color: #0f172a;
          overflow: hidden;
        }
        .recent-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .recent-card:hover .recent-thumb-img {
          transform: scale(1.06);
        }
        .recent-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .recent-category {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 6px;
        }
        .recent-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand-dark);
          line-height: 1.35;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 44px;
        }
        .recent-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 12px;
        }
        .recent-price-box {
          font-size: 14px;
          font-weight: 700;
          color: var(--brand-dark);
        }
        .recent-stats-row {
          display: flex;
          align-items: center;
          gap: 16px;
          color: var(--text-muted);
          font-size: 12px;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 768px) {
          .recent-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .recent-card {
            flex: 0 0 260px;
          }
        }
      `}</style>
    </section>
  );
}
