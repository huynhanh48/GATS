import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { CourseCard } from '@/shared/components/CourseCard';
import { Loader2 } from 'lucide-react';

export default function PopularCourses({ onSelectCourse }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        const data = await courseService.getCourses();
        if (mounted) {
          setCourses(Array.isArray(data) ? data : []);
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

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (course) => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  return (
    <section className="section popular-courses-section" id="courses">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">GATS AI</h2>
          <p className="section-subtitle">Được xây dựng bởi đội ngũ chuyên gia công nghệ và AI thực chiến hàng đầu</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={36} className="animate-spin text-[#407bff]" />
            <p className="text-sm text-slate-500">Đang tải danh sách khóa học từ máy chủ...</p>
          </div>
        ) : (
          /* 3-Column Courses Grid */
          <div className="courses-grid">
            {courses.map((course) => (
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
        )}

        {/* View All Bottom CTA */}
        <div className="courses-bottom-cta">
          <a href="#recent-courses" className="btn-secondary">
            Khám phá toàn bộ khóa học
          </a>
        </div>
      </div>

      <style>{`
        .popular-courses-section {
          background-color: var(--bg-soft);
          padding-top: 90px;
          padding-bottom: 90px;
        }
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .course-card-wrapper {
          position: relative;
        }
        .course-card-wrapper:hover {
          z-index: 50;
        }
        .course-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          overflow: visible;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .course-card-wrapper:hover .course-card {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .card-thumb-holder {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-top-left-radius: var(--radius-md);
          border-top-right-radius: var(--radius-md);
          background-color: #0f172a;
        }
        .card-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .course-card-wrapper:hover .card-thumb {
          transform: scale(1.05);
        }
        .card-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-category {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 8px;
          display: inline-block;
        }
        .card-title {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
          margin-bottom: 16px;
          cursor: pointer;
          transition: color 0.2s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 48px;
        }
        .card-title:hover {
          color: var(--primary);
        }
        .card-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #f1f5f9;
          border-radius: 6px;
          padding: 8px 16px;
          margin-bottom: 16px;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
        }
        .stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stat-pill svg {
          color: #64748b;
        }
        .card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
        }
        .rating-box {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rating-stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .rating-num {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-left: 4px;
        }
        .price-tag {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        /* In-Place Elevated Hover Quick Preview Popover matching design */
        .course-hover-popover {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          min-height: calc(100% + 20px);
          background: #ffffff;
          border-radius: var(--radius-md);
          box-shadow: 0 20px 45px rgba(39, 48, 68, 0.22);
          border: 1px solid var(--border-light);
          padding: 24px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          animation: popoverFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .popover-instructor {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .instructor-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
        }
        .instructor-label {
          display: block;
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .instructor-name {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-dark);
        }
        .popover-title {
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--brand-dark);
          line-height: 1.4;
          cursor: pointer;
        }
        .popover-title:hover {
          color: var(--primary);
        }
        .popover-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .popover-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .meta-badge {
          background: #edf3ff;
          padding: 3px 10px;
          border-radius: 4px;
          font-weight: 600;
          color: var(--primary);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .popover-bottom-wrapper {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .popover-actions {
          width: 100%;
        }
        .popover-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border-light);
        }
        .popover-wishlist-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .popover-wishlist-btn:hover, .popover-wishlist-btn.active {
          color: #ff5252;
        }
        .popover-price-tag {
          font-size: 18px;
          font-weight: 800;
          color: var(--brand-dark);
        }
        .courses-bottom-cta {
          text-align: center;
          margin-top: 48px;
        }

        @media (max-width: 1024px) {
          .courses-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .courses-grid {
            grid-template-columns: 1fr;
          }
          .course-hover-popover {
            top: 0;
            left: 0;
            right: 0;
            min-height: 100%;
          }
        }
      `}</style>
    </section>
  );
}
