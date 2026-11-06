import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/modules/course/services/courseService';
import { useAuthStore, useAuthUiStore } from '@/modules/auth';
import { useEnrollmentStore } from '@/modules/course/stores/enrollment.store';
import { toast } from '@/shared/utils/toast';
import {
  PlayerHeader,
  PlayerSidebar,
  PlayerLessonContent,
  PlayerNotesTab,
  PlayerDiscussionsSidebar,
} from './components';
import { Loader2, BookOpen } from 'lucide-react';

/**
 * CoursePlayerPage - Giao diện Lớp học Trực tuyến sau khi mua khóa học
 * Chuẩn 100% template MasterStudy Learning Classroom:
 * - Bảo mật truy cập: Yêu cầu đăng nhập & kiểm tra quyền sở hữu khóa học trước khi vào học
 * - Header: Back button, MS Logo, Course Title, Lesson/Notes tabs, Take Note & Discussions
 * - Cột trái: Accordion từng chương với tiến độ hoàn thành (0/7, 5/5), danh sách bài học
 * - Cột giữa: Trình phát Video.js (Hỗ trợ HLS ffmpeg .m3u8, MP4, WebM), thanh tiến độ Video/Câu hỏi, Mô tả & Nút Complete & Next
 * - Cột phải: Sidebar Thảo luận (Discussions Drawer) trượt ra vào linh hoạt với empty state chuẩn MasterStudy
 * - Đồng bộ trực tiếp với Backend API (/api/courses/slug/:slug, /api/courses/:id/curriculum, /api/courses/:id/progress)
 */
export default function CoursePlayerPage() {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, initAuth } = useAuthStore();
  const { openAuthModal } = useAuthUiStore();
  const { isEnrolled: checkEnrolled, fetchEnrollments } = useEnrollmentStore();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'notes'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDiscussionsOpen, setIsDiscussionsOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  // Khởi tạo Auth
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Tải ghi chú của khóa học
  useEffect(() => {
    if (!slug) return;
    try {
      const savedNotes = localStorage.getItem(`gats_notes_${slug}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }
  }, [slug]);

  // Kiểm tra đăng nhập bắt buộc
  useEffect(() => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token && !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tham gia học khóa học này.');
      openAuthModal('login');
      navigate(`/courses/${slug}`, { replace: true });
    }
  }, [isAuthenticated, slug, navigate, openAuthModal]);

  // Flatten toàn bộ bài học để tính bài trước / bài sau
  const allLessons = useMemo(() => {
    const list = [];
    sections.forEach((sec) => {
      if (Array.isArray(sec.lessons)) {
        sec.lessons.forEach((l) => list.push(l));
      }
    });
    return list;
  }, [sections]);

  // Tải dữ liệu khóa học, giáo trình và tiến độ học
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // 1. Tải chi tiết khóa học
        const courseData = await courseService.getCourseBySlug(slug);

        if (mounted) {
          if (courseData) {
            // 1. Kiểm tra khóa LIÊN HỆ: Tuyệt đối không cho phép vào học
            const isContactCourse = Boolean(
              courseData.isContact ||
              courseData.price === 'Liên hệ' ||
              courseData.pricingType === 'contact'
            );

            if (isContactCourse) {
              toast.error('Khóa học này yêu cầu liên hệ trực tiếp với GATS Academy để được mở quyền học.');
              navigate(`/courses/${slug}`, { replace: true });
              return;
            }

            // 2. Kiểm tra phân quyền: Nếu là khóa có phí mà học viên chưa thanh toán thì chuyển về trang khóa học
            if (!courseData.isFree) {
              const hasPurchased = checkEnrolled(courseData.id) || checkEnrolled(courseData.slug);
              if (!hasPurchased) {
                const refreshedIds = await fetchEnrollments();
                const rechecked =
                  (Array.isArray(refreshedIds) &&
                    (refreshedIds.includes(String(courseData.id)) ||
                      refreshedIds.includes(String(courseData.slug)))) ||
                  checkEnrolled(courseData.id) ||
                  checkEnrolled(courseData.slug);

                if (!rechecked) {
                  toast.error('Bạn chưa thanh toán khóa học này. Vui lòng thanh toán để mở khóa bài học.');
                  navigate(`/courses/${slug}`, { replace: true });
                  return;
                }
              }
            }

            setCourse(courseData);

            // Lấy sections từ raw hoặc gọi API curriculum
            let loadedSections = [];
            if (Array.isArray(courseData.raw?.sections) && courseData.raw.sections.length > 0) {
              loadedSections = courseData.raw.sections;
            } else {
              loadedSections = await courseService.getCourseCurriculum(courseData.id, slug);
            }

            setSections(loadedSections || []);

            // 2. Tải tiến độ học tập từ Backend kết hợp cache LocalStorage
            let cachedIds = [];
            try {
              const localSaved = localStorage.getItem(`gats_progress_${courseData.id || slug}`);
              if (localSaved) {
                cachedIds = JSON.parse(localSaved);
              }
            } catch {
              cachedIds = [];
            }

            const progressData = await courseService.getCourseProgress(courseData.id);
            const serverIds = Array.isArray(progressData?.completedLessonIds)
              ? progressData.completedLessonIds.map(String)
              : [];

            // Hợp nhất cả server IDs và local cache IDs
            const mergedCompleted = Array.from(new Set([...cachedIds.map(String), ...serverIds]));
            const initialCompletedSet = new Set(mergedCompleted);

            if (mounted) {
              setCompletedLessonIds(initialCompletedSet);
            }

            // 3. Xác định bài học hiện tại (Theo param URL hoặc bài đầu tiên được mở khóa)
            const flat = [];
            (loadedSections || []).forEach((s) => {
              if (Array.isArray(s.lessons)) s.lessons.forEach((l) => flat.push(l));
            });

            if (flat.length > 0) {
              let selectedLesson = flat[0];
              if (lessonId) {
                const matchedIdx = flat.findIndex(
                  (l) => String(l.id) === String(lessonId) || l.slug === lessonId
                );
                if (matchedIdx !== -1) {
                  // Kiểm tra xem bài học này có mở khóa chưa
                  let isUnlocked = true;
                  for (let i = 0; i < matchedIdx; i++) {
                    const pid = String(flat[i]?.id);
                    if (!initialCompletedSet.has(pid)) {
                      isUnlocked = false;
                      break;
                    }
                  }
                  if (isUnlocked) {
                    selectedLesson = flat[matchedIdx];
                  }
                }
              }

              setCurrentLesson(selectedLesson);

              // Tải thông tin chi tiết bài học đầu tiên (Playback video HLS / Content bài viết)
              if (courseData.id && selectedLesson?.id) {
                try {
                  const [playback, detail] = await Promise.all([
                    courseService.getLessonPlayback(courseData.id, selectedLesson.id).catch(() => null),
                    courseService.getLessonDetail(slug, selectedLesson.slug || selectedLesson.id).catch(() => null),
                  ]);
                  if (mounted && (playback?.playbackUrl || detail)) {
                    setCurrentLesson((prev) => ({
                      ...prev,
                      ...detail,
                      playbackUrl: playback?.playbackUrl || prev?.playbackUrl || '',
                      audioFlacUrl: playback?.audioFlacUrl || null,
                      videoId: playback?.videoId || null,
                    }));
                  }
                } catch {
                  // Fallback to initial
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu lớp học:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (slug) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [slug, lessonId, fetchEnrollments, navigate, checkEnrolled]);

  const currentIndex = allLessons.findIndex((l) => String(l.id) === String(currentLesson?.id));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;

  // Chọn bài học và tự động nạp video playback cùng nội dung bài viết
  const handleSelectLesson = async (lesson) => {
    if (!lesson) return;

    // Kiểm tra tính tuần tự: chỉ cho phép chọn nếu bài học đã được mở khóa
    const lessonIdx = allLessons.findIndex((l) => String(l.id) === String(lesson.id));
    if (lessonIdx > 0) {
      for (let i = 0; i < lessonIdx; i++) {
        const prevId = String(allLessons[i]?.id);
        if (!completedLessonIds.has(prevId)) {
          return; // Bài học chưa mở khóa
        }
      }
    }

    setCurrentLesson(lesson);
    setActiveTab('lesson');

    // Tải đồng thời Video HLS Playback và Nội dung chi tiết bài viết từ Backend
    if (course?.id && lesson?.id) {
      try {
        const [playback, detail] = await Promise.all([
          courseService.getLessonPlayback(course.id, lesson.id).catch(() => null),
          courseService.getLessonDetail(slug, lesson.slug || lesson.id).catch(() => null),
        ]);

        setCurrentLesson((prev) => ({
          ...prev,
          ...detail,
          playbackUrl: playback?.playbackUrl || prev?.playbackUrl || '',
          audioFlacUrl: playback?.audioFlacUrl || null,
          videoId: playback?.videoId || null,
        }));
      } catch {
        // Fallback giữ nguyên thông tin lesson hiện tại
      }
    }
  };

  const handlePrevLesson = () => {
    if (hasPrev) {
      const prevLesson = allLessons[currentIndex - 1];
      if (prevLesson) {
        handleSelectLesson(prevLesson);
      }
    }
  };

  /**
   * Học viên vừa ĐẠT bài tập trắc nghiệm. BE đã tự đánh dấu bài học hoàn thành,
   * FE chỉ cần đồng bộ lại tiến độ để mở khoá bài tiếp theo.
   */
  const handleQuizPassed = async () => {
    if (!course?.id || !currentLesson?.id) return;
    const currentIdStr = String(currentLesson.id);

    setCompletedLessonIds((prev) => {
      const updated = new Set(prev);
      updated.add(currentIdStr);
      try {
        localStorage.setItem(
          `gats_progress_${course.id || slug}`,
          JSON.stringify(Array.from(updated))
        );
      } catch {
        // Ignore
      }
      return updated;
    });

    try {
      const [refreshedProgress, refreshedSections] = await Promise.all([
        courseService.getCourseProgress(course.id),
        courseService.getCourseCurriculum(course.id, slug),
      ]);

      if (refreshedProgress?.completedLessonIds) {
        const merged = Array.from(
          new Set([...refreshedProgress.completedLessonIds.map(String), currentIdStr])
        );
        setCompletedLessonIds(new Set(merged));
        try {
          localStorage.setItem(`gats_progress_${course.id || slug}`, JSON.stringify(merged));
        } catch {
          // Ignore
        }
      }

      // Nạp lại giáo trình để cờ `locked` (chặn khoá học ở BE) + nội dung
      // của bài vừa mở khoá được cập nhật.
      if (Array.isArray(refreshedSections) && refreshedSections.length > 0) {
        setSections(refreshedSections);
      }
    } catch {
      // Ignore
    }
  };

  const handleCompleteAndNext = async () => {
    if (!currentLesson || !course?.id) return;

    const currentIdStr = String(currentLesson.id);

    // Bài tập trắc nghiệm: chỉ hoàn thành khi học viên ĐẠT (BE chấm điểm).
    // Không cho bấm "Hoàn thành" để vượt qua chặn khoá học.
    if (currentLesson.type === 'quiz' && !completedLessonIds.has(currentIdStr)) {
      toast.error('Bạn cần hoàn thành bài tập trắc nghiệm và đạt điểm yêu cầu để mở khoá bài tiếp theo.');
      return;
    }

    // 1. Cập nhật ngay UI state để mở khóa bài tiếp theo tức thì
    setCompletedLessonIds((prev) => {
      const updated = new Set(prev);
      updated.add(currentIdStr);

      // Lưu ngay vào localStorage cache để đảm bảo không mất khi reload
      try {
        localStorage.setItem(
          `gats_progress_${course.id || slug}`,
          JSON.stringify(Array.from(updated))
        );
      } catch {
        // Ignore
      }

      return updated;
    });

    // 2. Gửi tiến độ lên Backend để lưu vào Database
    try {
      await courseService.updateLessonProgress(course.id, currentLesson.id, {
        watched_seconds: 999999,
        duration_seconds: currentLesson.duration || 600,
        video_id: currentLesson.videoId || undefined,
      });

      // Tải lại tiến độ từ Backend để đồng bộ state hoàn chỉnh
      const refreshedProgress = await courseService.getCourseProgress(course.id);
      if (refreshedProgress?.completedLessonIds) {
        const merged = Array.from(
          new Set([...refreshedProgress.completedLessonIds.map(String), currentIdStr])
        );
        setCompletedLessonIds(new Set(merged));
        try {
          localStorage.setItem(`gats_progress_${course.id || slug}`, JSON.stringify(merged));
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.warn('Lỗi cập nhật tiến độ lên server:', err);
    }

    // 3. Tự động chuyển sang bài tiếp theo nếu có
    if (hasNext) {
      const nextLesson = allLessons[currentIndex + 1];
      if (nextLesson) {
        handleSelectLesson(nextLesson);
      }
    }
  };

  const handleAddNote = (newNote) => {
    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(`gats_notes_${slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    try {
      localStorage.setItem(`gats_notes_${slug}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 size={36} className="animate-spin text-[#1a56db]" />
        <p className="text-sm font-medium text-slate-500">Đang chuẩn bị phòng học trực tuyến...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center mb-4">
          <BookOpen size={28} />
        </div>
        <h2 className="text-xl font-bold text-[#273044] mb-2">
          Không tìm thấy lớp học
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Khóa học không tồn tại hoặc bạn chưa đăng ký khóa học này.
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* 1. Header lớp học MasterStudy */}
      <PlayerHeader
        course={course}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenNotesModal={() => setActiveTab('notes')}
        notesCount={notes.length}
        isDiscussionsOpen={isDiscussionsOpen}
        onToggleDiscussions={() => setIsDiscussionsOpen(!isDiscussionsOpen)}
      />

      {/* 2. Khung nội dung chính (Sidebar Trái + Nội dung bài học Giữa + Sidebar Thảo luận Phải) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar danh sách bài học bên trái */}
        {isSidebarOpen && (
          <div className="w-full sm:w-80 lg:w-96 shrink-0 h-full border-r border-slate-200 z-20 transition-all">
            <PlayerSidebar
              courseTitle={course.title}
              sections={sections}
              currentLessonId={currentLesson?.id}
              completedLessonIds={completedLessonIds}
              onSelectLesson={handleSelectLesson}
            />
          </div>
        )}

        {/* Nội dung bài học hoặc Ghi chú ở giữa */}
        {activeTab === 'lesson' && (
          <PlayerLessonContent
            lesson={currentLesson}
            course={course}
            isCompleted={completedLessonIds.has(currentLesson?.id)}
            onCompleteAndNext={handleCompleteAndNext}
            onQuizPassed={handleQuizPassed}
            onPrevLesson={handlePrevLesson}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        )}

        {activeTab === 'notes' && (
          <PlayerNotesTab
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {/* Sidebar Thảo luận & Hỏi đáp bên phải (Discussions Drawer) */}
        <PlayerDiscussionsSidebar
          isOpen={isDiscussionsOpen}
          onClose={() => setIsDiscussionsOpen(false)}
          currentLessonTitle={currentLesson?.title}
          courseId={course?.id}
          lessonId={currentLesson?.id}
        />
      </div>
    </div>
  );
}

