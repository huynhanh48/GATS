import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { CourseCard } from '@/shared/components/CourseCard';
import {
  CourseHero,
  CourseTabs,
  CourseDescriptionTab,
  CourseCurriculumTab,
  CourseFaqTab,
  CourseNoticeTab,
  CourseReviewsTab,
  CourseGradeTab,
  CourseSidebar,
} from './components';
import { useAuthStore, useAuthUiStore } from '@/modules/auth';
import { useEnrollmentStore } from '@/modules/course/stores/enrollment.store';
import CoursePaymentModal from '@/modules/course/components/CoursePaymentModal';
import CourseConsultationModal from '@/modules/course/components/CourseConsultationModal';
import { Loader2, BookOpen, X, Play } from 'lucide-react';
import GatsHlsPlayer from '@/modules/course/pages/course-player/components/GatsHlsPlayer';
import { resolveMediaUrl } from '@/shared/utils/media';

/**
 * CourseDetailPage - Trang chi tiết khóa học chuẩn template MasterStudy Marketing Timeless
 * - Hero section: Chuyên mục, Huy hiệu NEW cách ra, Tiêu đề H1, Mô tả ngắn, Giảng viên, Học viên, Đánh giá, Thumbnail 16:9
 * - Bố cục 2 cột: Cột trái 6 Tabs nội dung (Description, Curriculum, FAQ, Notice, Reviews, Grade) + Cột phải Sticky Sidebar CTA
 * - Khóa học liên quan: Hiển thị dạng Hàng Ngang (Row 3-4 cột) ở dưới cùng chuẩn 100% template MasterStudy
 * - Đồng bộ hoàn toàn với Backend API: Category, Author, Learning Outcomes, Sections, Lessons, Stats
 */
export default function CourseDetailPage() {
  const { slug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  // Video Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentPreviewLesson, setCurrentPreviewLesson] = useState(null);
  const [previewVideoSrc, setPreviewVideoSrc] = useState('');
  const [loadingPreviewVideo, setLoadingPreviewVideo] = useState(false);

  // Khóa cuộn trang khi mở Video Preview Modal
  useEffect(() => {
    if (previewModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewModalOpen]);

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadCourseData() {
      setLoading(true);
      try {
        // 1. Tải chi tiết khóa học theo Slug từ BE
        const courseData = await courseService.getCourseBySlug(slug);

        if (mounted) {
          if (courseData) {
            setCourse(courseData);
            // Lấy sections từ raw course data nếu có
            if (Array.isArray(courseData.raw?.sections) && courseData.raw.sections.length > 0) {
              setSections(courseData.raw.sections);
            } else {
              // Hoặc gọi API curriculum
              const curr = await courseService.getCourseCurriculum(courseData.id, slug);
              if (mounted && Array.isArray(curr) && curr.length > 0) {
                setSections(curr);
              }
            }
          } else {
            setCourse(null);
          }

          // 2. Tải các khóa học liên quan
          const allCourses = await courseService.getCourses();
          if (mounted && Array.isArray(allCourses)) {
            const related = allCourses.filter((c) => c.slug !== slug);
            setRelatedCourses(related);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu chi tiết khóa học:', err);
        if (mounted) {
          setCourse(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      loadCourseData();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const { openAuthModal } = useAuthUiStore();
  const { isEnrolled: checkEnrolled, fetchEnrollments, enrollFreeCourse } = useEnrollmentStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  // Tải danh sách khóa học đã ghi danh khi đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token || isAuthenticated) {
      fetchEnrollments();
    }
  }, [isAuthenticated, fetchEnrollments]);

  // Kiểm tra học viên đã sở hữu / ghi danh khóa học này chưa (Không áp dụng cho khóa Liên hệ)
  const isContactCourse = Boolean(course?.isContact || course?.price === 'Liên hệ' || course?.pricingType === 'contact');
  const isEnrolled = Boolean(
    !isContactCourse &&
    course && (checkEnrolled(course.id) || checkEnrolled(course.slug))
  );

  const handleEnroll = async () => {
    // 1. Nếu là khóa học LIÊN HỆ TƯ VẤN: Mở modal biểu mẫu đăng ký tư vấn
    if (isContactCourse) {
      setConsultationModalOpen(true);
      return;
    }

    // 2. Nếu chưa đăng nhập: Mở ngay AuthModal trực tiếp, không chuyển trang gây reload/redirect
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token && !isAuthenticated && !user) {
      openAuthModal('login');
      return;
    }

    // 3. Nếu đã mua / đã ghi danh: Vào học ngay
    if (isEnrolled) {
      navigate(`/courses/learn/${slug}`);
      return;
    }

    // 4. Nếu là khóa học MIỄN PHÍ: Tự động ghi danh và vào học ngay
    if (course?.isFree) {
      await enrollFreeCourse(course.id, course.slug);
      navigate(`/courses/learn/${slug}`);
      return;
    }

    // 5. Khóa học CÓ PHÍ và chưa thanh toán: Mở modal quét mã VietQR tự động
    setPaymentModalOpen(true);
  };

  const handleSelectCourse = (item) => {
    if (item?.slug) {
      navigate(`/courses/${item.slug}`);
    }
  };

  const handlePlayPreview = async (lesson) => {
    setCurrentPreviewLesson(lesson || null);
    setPreviewModalOpen(true);
    setLoadingPreviewVideo(true);
    setPreviewVideoSrc('');

    try {
      if (lesson?.id && course?.id) {
        const playback = await courseService.getLessonPlayback(course.id, lesson.id);
        const resolved = playback?.playbackUrl || lesson.playbackUrl || lesson.videoUrl || lesson.streamUrl || lesson.fileUrl;
        if (resolved) {
          setPreviewVideoSrc(resolveMediaUrl(resolved));
          return;
        }
      }
      
      // Fallback: Course intro video hoặc sample video
      const intro = course?.raw?.introVideo || course?.introVideo || 'https://vjs.zencdn.net/v/oceans.mp4';
      setPreviewVideoSrc(resolveMediaUrl(intro));
    } catch (err) {
      console.warn('Lỗi tải video xem trước:', err);
      setPreviewVideoSrc('https://vjs.zencdn.net/v/oceans.mp4');
    } finally {
      setLoadingPreviewVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 size={36} className="animate-spin text-[#1a56db]" />
        <p className="text-sm font-medium text-slate-500">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center mb-4">
          <BookOpen size={28} />
        </div>
        <h2 className="text-xl font-bold text-[#273044] mb-2">
          Không tìm thấy khóa học
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Khóa học bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
        </p>
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="px-6 py-2.5 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Quay lại danh sách khóa học
        </button>
      </div>
    );
  }

  const totalLessons = sections.reduce(
    (acc, sec) => acc + (sec.lessons?.length || sec.lessonCount || 0),
    0
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      {/* ========================================================
          1. HERO HEADER SECTION (Chuẩn Timeless Style)
          ======================================================== */}
      <CourseHero
        course={course}
        onPlayPreview={() => handlePlayPreview()}
      />

      {/* Thông báo nếu đang chọn bài học cụ thể từ route URL */}
      {lessonSlug && (
        <div className="container mt-6">
          <div className="p-4 bg-blue-50/80 rounded-[10px] border border-blue-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1a56db] text-white flex items-center justify-center shrink-0">
                <Play size={16} className="ml-0.5 fill-current" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider block">
                  Đang phát bài học xem thử
                </span>
                <span className="text-sm font-bold text-[#273044] capitalize">
                  {lessonSlug.replace(/-/g, ' ')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnroll}
              className="px-4 py-2 rounded-[6px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Mở khóa toàn bộ
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          2. MAIN CONTENT AREA (Bố cục 2 Cột: Main 8/12 + Sidebar 4/12)
          ======================================================== */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI (8/12): HỆ THỐNG 6 TABS */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-[10px] p-6 sm:p-8 shadow-xs">
            {/* Tabs Bar */}
            <CourseTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabsCount={{
                lessons: totalLessons,
                reviews: course.raw?.stats?.ratingCount || 12,
              }}
            />

            {/* Nội dung Tab tương ứng */}
            <div className="min-h-[400px]">
              {activeTab === 'description' && (
                <CourseDescriptionTab course={course} />
              )}

              {activeTab === 'curriculum' && (
                <CourseCurriculumTab
                  sections={sections}
                  onSelectLesson={handlePlayPreview}
                />
              )}

              {activeTab === 'faq' && <CourseFaqTab />}

              {activeTab === 'notice' && <CourseNoticeTab />}

              {activeTab === 'reviews' && (
                <CourseReviewsTab course={course} />
              )}

              {activeTab === 'grade' && <CourseGradeTab />}
            </div>
          </div>

          {/* CỘT PHẢI (4/12): STICKY SIDEBAR */}
          <div className="lg:col-span-4">
            <CourseSidebar
              course={course}
              onEnroll={handleEnroll}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>

        {/* ========================================================
            3. RELATED COURSES (HÀNG NGANG DƯỚI CÙNG CHUẨN TEMPLATE)
            ======================================================== */}
        {relatedCourses.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-200/80">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044]">
                Khóa học liên quan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.slice(0, 3).map((item) => (
                <div key={item.id} className="h-full">
                  <CourseCard
                    course={item}
                    onSelectCourse={handleSelectCourse}
                    viewMode="grid"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          4. MODAL XEM THỬ VIDEO / BÀI GIẢNG (Preview Modal)
          ======================================================== */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-[10px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-[#1a56db]" />
                <h3 className="text-sm sm:text-base font-bold text-[#273044]">
                  {currentPreviewLesson ? currentPreviewLesson.title : `Video giới thiệu: ${course.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                aria-label="Đóng video"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden">
              {loadingPreviewVideo ? (
                <div className="flex flex-col items-center justify-center gap-2 text-white">
                  <Loader2 size={32} className="animate-spin text-[#1a56db]" />
                  <span className="text-xs text-slate-400">Đang chuẩn bị luồng video bài học...</span>
                </div>
              ) : previewVideoSrc ? (
                <GatsHlsPlayer
                  src={previewVideoSrc}
                  poster={course?.image}
                  autoPlay={true}
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#1a56db]/30 text-[#407bff] flex items-center justify-center mx-auto mb-2">
                    <Play size={28} className="ml-1 fill-current" />
                  </div>
                  <h4 className="text-base font-bold">Nội dung học thử chất lượng cao</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Video bài giảng thực chiến được biên soạn bởi chuyên gia GATS Academy với độ phân giải Full HD 1080p và tài liệu thực hành đi kèm.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Đăng ký khóa học để xem trọn bộ {totalLessons} bài học.
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleEnroll();
                }}
                className="px-5 py-2 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Đăng ký học ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quét Mã QR Thanh Toán Khóa Học */}
      <CoursePaymentModal
        course={course}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={() => {
          setPaymentModalOpen(false);
        }}
      />

      {/* Modal Đăng Ký Tư Vấn Khóa Học */}
      <CourseConsultationModal
        course={course}
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
      />
    </div>
  );
}
