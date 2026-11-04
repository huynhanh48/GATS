import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Headphones,
  Lock,
} from 'lucide-react';

/**
 * PlayerSidebar - Cột danh sách các Chương & Bài học bên trái
 * - Tiêu đề khóa học
 * - Accordion từng chương với tiến độ hoàn thành (Ví dụ: 0/7, 5/5)
 * - Từng bài học có icon loại bài, thời lượng, trạng thái đã học / chưa học
 * - Khóa học tuần tự (Sequential Unlock): Bài học nào học xong mới được mở khóa bài tiếp theo
 */
export default function PlayerSidebar({
  courseTitle,
  sections = [],
  currentLessonId,
  completedLessonIds = new Set(),
  onSelectLesson,
}) {
  // Chỉ mở chương chứa bài học đang học, các chương khác thu gọn về
  const [openSections, setOpenSections] = useState({});

  // Tự động mở chương đang học và thu gọn toàn bộ các chương khác
  React.useEffect(() => {
    if (!sections || sections.length === 0) return;
    const nextOpen = {};
    sections.forEach((sec, idx) => {
      const hasCurrent = (sec.lessons || []).some(
        (l) => String(l.id) === String(currentLessonId) || l.slug === currentLessonId
      );
      // Nếu là chương chứa bài đang học, hoặc nếu không tìm thấy thì mở chương đầu tiên
      if (hasCurrent || (!currentLessonId && idx === 0)) {
        nextOpen[idx] = true;
      } else {
        nextOpen[idx] = false;
      }
    });
    setOpenSections(nextOpen);
  }, [currentLessonId, sections]);

  // Flatten toàn bộ bài học để tính toán thứ tự mở khóa tuần tự
  const allLessons = [];
  sections.forEach((sec) => {
    (sec.lessons || []).forEach((l) => allLessons.push(l));
  });

  const toggleSection = (idx) => {
    setOpenSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle size={15} className="text-[#1a56db]" />;
      case 'audio':
        return <Headphones size={15} className="text-purple-600" />;
      case 'quiz':
        return <HelpCircle size={15} className="text-amber-500" />;
      case 'text':
      case 'article':
      default:
        return <FileText size={15} className="text-slate-500" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '10 phút';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  };

  // Kiểm tra bài học có được mở khóa không (Bài đầu tiên luôn mở, các bài sau yêu cầu bài trước hoàn thành)
  const isLessonUnlocked = (lessonIndex) => {
    if (lessonIndex <= 0) return true;
    // Kiểm tra tất cả bài học trước đó đã nằm trong completedLessonIds chưa
    for (let i = 0; i < lessonIndex; i++) {
      const prevId = allLessons[i]?.id;
      if (!completedLessonIds.has(String(prevId)) && !completedLessonIds.has(prevId)) {
        return false;
      }
    }
    return true;
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-slate-200 select-none overflow-hidden">
      {/* Tiêu đề sidebar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <h2 className="text-sm font-extrabold text-[#273044] truncate">
          {courseTitle || 'Nội dung khóa học'}
        </h2>
      </div>

      {/* Danh sách các chương (Cuộn mượt) */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100">
        {sections.map((section, secIdx) => {
          const isOpen = Boolean(openSections[secIdx]);
          const lessons = section.lessons || [];
          const completedCount = lessons.filter((l) =>
            completedLessonIds.has(String(l.id)) || completedLessonIds.has(l.id)
          ).length;

          return (
            <div key={section.id || secIdx} className="bg-white">
              {/* Header chương */}
              <button
                type="button"
                onClick={() => toggleSection(secIdx)}
                className="w-full px-4 py-3.5 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-[#273044] truncate flex-1">
                  {section.title}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-[4px] border border-slate-200/80">
                    {completedCount}/{lessons.length}
                  </span>
                  <span className="text-slate-400">
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </span>
                </div>
              </button>

              {/* Danh sách bài học */}
              {isOpen && (
                <div className="divide-y divide-slate-50">
                  {lessons.map((lesson, lIdx) => {
                    const isCurrent = String(lesson.id) === String(currentLessonId);
                    const isCompleted =
                      completedLessonIds.has(String(lesson.id)) ||
                      completedLessonIds.has(lesson.id);

                    // Tìm vị trí của bài học trong danh sách tổng thể
                    const globalIdx = allLessons.findIndex(
                      (l) => String(l.id) === String(lesson.id)
                    );
                    const unlocked = isLessonUnlocked(globalIdx);

                    return (
                      <div
                        key={lesson.id || lIdx}
                        onClick={() => {
                          if (unlocked) {
                            onSelectLesson(lesson);
                          }
                        }}
                        title={!unlocked ? 'Vui lòng hoàn thành các bài học trước để mở khóa' : undefined}
                        className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                          !unlocked
                            ? 'opacity-50 cursor-not-allowed bg-slate-50/50'
                            : isCurrent
                            ? 'bg-blue-50/80 border-l-4 border-l-[#1a56db] cursor-pointer'
                            : 'hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        {/* Cột trái: Tên bài & icon */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="shrink-0">
                            {!unlocked ? <Lock size={15} className="text-slate-400" /> : getLessonIcon(lesson.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-xs font-semibold leading-snug truncate ${
                                !unlocked
                                  ? 'text-slate-400'
                                  : isCurrent
                                  ? 'text-[#1a56db]'
                                  : 'text-[#273044]'
                              }`}
                            >
                              {lesson.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {formatDuration(lesson.duration)}
                            </span>
                          </div>
                        </div>

                        {/* Cột phải: Checkbox hoàn thành hoặc Khóa */}
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="text-[#10b981] fill-emerald-100" />
                          ) : !unlocked ? (
                            <Lock size={14} className="text-slate-300" />
                          ) : (
                            <Circle size={16} className="text-slate-300 hover:text-slate-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

