import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, Users, Eye, Play, Loader2, ChevronDown, Lock } from 'lucide-react';
import { courseService } from '@/modules/course/services/courseService';
import { useAuthStore, useAuthUiStore } from '@/modules/auth';
import GatsHlsPlayer from '@/modules/course/pages/course-player/components/GatsHlsPlayer';
import { resolveMediaUrl } from '@/shared/utils/media';

export default function CourseModal({ course, onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAuthUiStore();

  const [curriculum, setCurriculum] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [openChapters, setOpenChapters] = useState({});

  // Video preview player state
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [previewLessonTitle, setPreviewLessonTitle] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Khóa scroll body khi modal mở (khi có course được chọn)
  useEffect(() => {
    if (course) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [course]);

  useEffect(() => {
    let mounted = true;

    async function loadCurriculum() {
      if (!course?.id && !course?.slug) {
        setCurriculum([]);
        return;
      }
      setLoadingCurriculum(true);
      try {
        const sections = await courseService.getCourseCurriculum(course.id, course.slug);
        if (mounted) {
          setCurriculum(Array.isArray(sections) ? sections : []);
          // Mở chương đầu tiên mặc định
          setOpenChapters({ 0: true });
        }
      } catch (err) {
        console.warn('Failed to load course curriculum:', err);
        if (mounted) setCurriculum([]);
      } finally {
        if (mounted) setLoadingCurriculum(false);
      }
    }

    loadCurriculum();
    return () => {
      mounted = false;
    };
  }, [course]);

  if (!course) return null;

  const showPrice = course.price !== null && course.price !== undefined && course.price !== '';

  const toggleChapter = (chapterKey) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterKey]: !prev[chapterKey],
    }));
  };

  const handlePlayLessonPreview = async (lesson) => {
    if (!lesson) {
      // Play intro video
      const intro = course.raw?.introVideo || course.introVideo || 'https://vjs.zencdn.net/v/oceans.mp4';
      setPreviewLessonTitle(`Video giới thiệu: ${course.title}`);
      setPreviewVideoUrl(resolveMediaUrl(intro));
      return;
    }

    setPreviewLessonTitle(lesson.title);
    setLoadingPreview(true);
    try {
      if (course?.id && lesson?.id) {
        const playback = await courseService.getLessonPlayback(course.id, lesson.id);
        const resolved = playback?.playbackUrl || lesson.playbackUrl || lesson.videoUrl || lesson.streamUrl;
        if (resolved) {
          setPreviewVideoUrl(resolveMediaUrl(resolved));
          return;
        }
      }
      setPreviewVideoUrl('https://vjs.zencdn.net/v/oceans.mp4');
    } catch {
      setPreviewVideoUrl('https://vjs.zencdn.net/v/oceans.mp4');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEnrollClick = () => {
    onClose();
    if (course.isContact || course.price === 'Liên hệ' || course.pricingType === 'contact') {
      navigate(`/courses/${course.slug}`);
      return;
    }

    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token && !isAuthenticated && !user) {
      openAuthModal('login');
      return;
    }

    if (course.isFree) {
      navigate(`/courses/learn/${course.slug}`);
    } else {
      navigate(`/courses/${course.slug}`);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="course-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>

        <div className="course-modal-header">
          <div className="modal-thumb-box" onClick={() => handlePlayLessonPreview(null)}>
            <img src={course.image} alt={course.title} className="modal-thumb-img" />
            <div className="modal-play-overlay">
              <Play size={28} fill="#ffffff" />
            </div>
          </div>

          <div className="modal-header-info">
            <div className="modal-header-top">
              <span className="modal-badge">{course.category}</span>
              <h2 className="modal-course-title">{course.title}</h2>

              <div className="modal-meta-strip">
                <div className="rating-box">
                  <Star size={16} fill="#ffb606" color="#ffb606" />
                  <span className="rating-val">{course.rating}</span>
                </div>
                <div className="meta-sep">•</div>
                <div className="meta-stat">
                  <Users size={15} />
                  <span>{course.students ? course.students.toLocaleString('vi-VN') : '1.200'} học viên</span>
                </div>
                <div className="meta-sep">•</div>
                <div className="meta-stat">
                  <Eye size={15} />
                  <span>{course.views ? course.views : '24 bài học'}</span>
                </div>
              </div>
            </div>

            <div className="modal-price-row">
              {showPrice && (
                <span className={`modal-price-val ${course.isContact ? 'text-[#1a56db]' : course.isFree ? 'text-[#10b981]' : ''}`}>
                  {course.price}
                </span>
              )}
              <button
                className="btn-primary modal-enroll-btn"
                onClick={handleEnrollClick}
              >
                {course.isContact || course.price === 'Liên hệ'
                  ? 'Liên hệ tư vấn'
                  : course.isFree
                    ? 'Bắt đầu học miễn phí'
                    : `Đăng ký học: ${course.price}`}
              </button>
            </div>
          </div>
        </div>

        {/* Video Preview Player nếu đang mở preview */}
        {previewVideoUrl && (
          <div className="mb-6 rounded-[10px] overflow-hidden border border-slate-200 bg-slate-950 p-2">
            <div className="flex items-center justify-between pb-2 px-2 text-white text-xs font-bold border-b border-white/10 mb-2">
              <div className="flex items-center gap-2 truncate">
                <Play size={14} className="text-[#1a56db]" />
                <span className="truncate">{previewLessonTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
            <div className="aspect-video">
              {loadingPreview ? (
                <div className="h-full flex items-center justify-center text-white text-xs">
                  <Loader2 size={24} className="animate-spin text-blue-400 mr-2" />
                  <span>Đang tải video...</span>
                </div>
              ) : (
                <GatsHlsPlayer src={previewVideoUrl} poster={course.image} autoPlay />
              )}
            </div>
          </div>
        )}

        {/* Modal Curriculum outline */}
        <div className="modal-curriculum-section">
          <h3 className="section-label">Giáo trình khóa học</h3>

          {loadingCurriculum ? (
            <div className="curriculum-loading">
              <Loader2 size={24} className="curriculum-spinner" />
              <span>Đang tải giáo trình từ hệ thống...</span>
            </div>
          ) : curriculum.length > 0 ? (
            <div className="curriculum-list">
              {curriculum.map((section, sIdx) => {
                const chapterKey = section.id || sIdx;
                const isOpen = !!openChapters[chapterKey];

                return (
                  <div key={chapterKey} className="curriculum-chapter">
                    <button
                      type="button"
                      className="chapter-header"
                      onClick={() => toggleChapter(chapterKey)}
                      aria-expanded={isOpen}
                    >
                      <div className="chapter-title-wrap">
                        <span className="chapter-badge">Chương {sIdx + 1}</span>
                        <h4 className="chapter-title">{section.title}</h4>
                      </div>
                      <div className="chapter-header-right">
                        {section.lessons && (
                          <span className="chapter-meta">{section.lessons.length} bài học</span>
                        )}
                        <ChevronDown
                          size={18}
                          className={`chapter-arrow-icon ${isOpen ? 'is-open' : ''}`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="chapter-lessons">
                        {section.lessons?.map((les, lIdx) => (
                          <div
                            key={les.id || lIdx}
                            className="lesson-item bg-slate-50/70"
                          >
                            <Lock size={15} className="lesson-icon text-slate-400 shrink-0" />
                            <div className="lesson-info">
                              <strong className="text-slate-700">{les.title}</strong>
                              <span>
                                {les.type === 'video' ? 'Bài giảng Video' : 'Tài liệu học tập'}
                                {les.duration && les.duration > 0 ? ` • ${Math.round(les.duration / 60)} phút` : ''}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">Khóa học viên</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-[8px] border border-slate-200 text-xs text-slate-500">
              Nội dung giáo trình đang được cập nhật từ hệ thống.
            </div>
          )}
        </div>
      </div>
      </div>

      <style>{`
        .course-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 760px;
          max-height: 88vh;
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
          border-radius: var(--radius-lg);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          padding: 32px;
          animation: slideDown 0.2s ease-out;
        }
        .course-modal-card::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: #f1f5f9;
          border-radius: 50%;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          z-index: 10;
        }
        .modal-close-btn:hover {
          background: #e2e8f0;
          color: var(--brand-dark);
        }
        .course-modal-header {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: stretch;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 24px;
        }
        .modal-thumb-box {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #0f172a;
          width: 100%;
          height: 100%;
          min-height: 180px;
          display: flex;
        }
        .modal-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .modal-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          transition: background 0.2s;
        }
        .modal-play-overlay:hover {
          background: rgba(64, 123, 255, 0.6);
        }
        .modal-header-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 100%;
        }
        .modal-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 8px;
        }
        .modal-course-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--brand-dark);
          line-height: 1.35;
          margin-bottom: 12px;
        }
        .modal-meta-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .rating-val {
          font-weight: 700;
          color: var(--brand-dark);
          margin-left: 4px;
        }
        .meta-stat {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .modal-price-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: auto;
          padding-top: 8px;
        }
        .modal-price-val {
          font-size: 24px;
          font-weight: 800;
          color: var(--brand-dark);
        }
        .modal-enroll-btn {
          padding: 12px 24px;
          font-size: 14px;
        }
        .modal-curriculum-section {
          margin-top: 8px;
        }
        .section-label {
          font-size: 18px;
          font-weight: 800;
          color: var(--brand-dark);
          margin-top: 0;
          margin-bottom: 16px;
          display: block;
        }
        .curriculum-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 30px;
          background: #f8fafc;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 14px;
        }
        .curriculum-spinner {
          animation: spin 1s linear infinite;
          color: var(--primary);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .curriculum-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .curriculum-chapter {
          background: #f8fafc;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .chapter-header {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: #f1f5f9;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: background-color 0.15s ease;
        }
        .chapter-header:hover {
          background: #e9eef5;
        }
        .chapter-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }
        .chapter-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .chapter-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--brand-dark);
          margin: 0;
          line-height: 1.3;
        }
        .chapter-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chapter-meta {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .chapter-arrow-icon {
          color: #64748b;
          transition: transform 0.2s ease;
        }
        .chapter-arrow-icon.is-open {
          transform: rotate(180deg);
          color: var(--primary);
        }
        .chapter-lessons {
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #f8fafc;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        .chapter-lessons .lesson-item {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          border-radius: 6px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: background 0.15s ease;
        }
        .chapter-lessons .lesson-item:hover {
          background: #f1f5f9;
        }
        .lesson-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
        .lesson-icon {
          color: var(--primary);
          flex-shrink: 0;
        }
        .lesson-info {
          flex: 1;
        }
        .lesson-info strong {
          display: block;
          font-size: 14px;
          color: var(--brand-dark);
        }
        .lesson-info span {
          font-size: 12px;
          color: var(--text-muted);
        }
        .free-preview-tag {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          background: #dcfce7;
          padding: 3px 8px;
          border-radius: 4px;
        }

        @media (max-width: 680px) {
          .course-modal-header {
            grid-template-columns: 1fr;
          }
          .modal-thumb-box {
            aspect-ratio: 16 / 9;
            min-height: auto;
          }
          .modal-price-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .modal-enroll-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
