import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Lock,
  Headphones,
  HelpCircle,
  Clock,
  Eye,
} from 'lucide-react';

/**
 * CourseCurriculumTab - Tab 2: Giáo trình khóa học
 * - Accordion từng Chương (Section)
 * - Hiển thị số bài và thời lượng của chương
 * - Danh sách bài học với icon trực quan theo loại bài học
 * - Huy hiệu Học thử (Preview) cho bài học mở
 * - Nút Đóng / Mở tất cả các chương
 */
export default function CourseCurriculumTab({ sections = [], onSelectLesson }) {
  // Mặc định mở chương đầu tiên (index 0)
  const [openSections, setOpenSections] = useState({ 0: true });

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleExpandAll = () => {
    const allOpen = {};
    sections.forEach((_, idx) => {
      allOpen[idx] = true;
    });
    setOpenSections(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenSections({});
  };

  const isAllOpen = sections.length > 0 && Object.keys(openSections).length === sections.length;

  const totalLessons = sections.reduce(
    (acc, sec) => acc + (sec.lessons?.length || sec.lessonCount || 0),
    0
  );

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle size={17} className="text-[#1a56db]" />;
      case 'audio':
        return <Headphones size={17} className="text-purple-600" />;
      case 'quiz':
        return <HelpCircle size={17} className="text-amber-500" />;
      case 'article':
      case 'text':
      default:
        return <FileText size={17} className="text-slate-500" />;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '5 phút';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs} giờ ${remMins} phút` : `${hrs} giờ`;
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 rounded-[10px] border border-slate-200">
        <p className="text-sm font-medium text-slate-500">
          Nội dung giáo trình đang được cập nhật. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header thống kê & nút Đóng / Mở tất cả */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044] mb-1">
            Nội dung giáo trình
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Bao gồm <span className="font-bold text-[#273044]">{sections.length}</span> chương và{' '}
            <span className="font-bold text-[#273044]">{totalLessons}</span> bài học thực chiến
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isAllOpen ? handleCollapseAll : handleExpandAll}
            className="text-xs font-bold text-[#1a56db] hover:text-[#1545b3] transition-colors cursor-pointer"
          >
            {isAllOpen ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
          </button>
        </div>
      </div>

      {/* Danh sách các Chương (Accordion) */}
      <div className="space-y-3">
        {sections.map((section, secIdx) => {
          const isOpen = Boolean(openSections[secIdx]);
          const lessons = section.lessons || [];
          const sectionDuration = section.totalDurationSeconds
            ? formatDuration(section.totalDurationSeconds)
            : `${lessons.length * 10} phút`;

          return (
            <div
              key={section.id || secIdx}
              className="border border-slate-200 rounded-[10px] overflow-hidden bg-white shadow-2xs transition-all"
            >
              {/* Header của Chương */}
              <button
                type="button"
                onClick={() => toggleSection(secIdx)}
                className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-slate-400">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-[#273044] truncate">
                    {section.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-medium text-slate-500">
                  <span>{lessons.length} bài học</span>
                  <span className="hidden sm:inline-block">•</span>
                  <span className="hidden sm:inline-block">{sectionDuration}</span>
                </div>
              </button>

              {/* Danh sách bài học bên trong */}
              {isOpen && (
                <div className="divide-y divide-slate-100 bg-white">
                  {lessons.map((lesson, lIdx) => {
                    const isPreview = lesson.isPreview;
                    const durationText = formatDuration(lesson.duration);

                    return (
                      <div
                        key={lesson.id || lIdx}
                        className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                          isPreview
                            ? 'hover:bg-blue-50/50 cursor-pointer'
                            : 'hover:bg-slate-50/50'
                        }`}
                        onClick={() => {
                          if (isPreview && onSelectLesson) {
                            onSelectLesson(lesson);
                          }
                        }}
                      >
                        {/* Tên bài học kèm Icon */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="shrink-0">{getLessonIcon(lesson.type)}</span>
                          <span className="text-xs sm:text-sm font-medium text-[#273044] truncate">
                            {lesson.title}
                          </span>
                        </div>

                        {/* Thời lượng và Nút Preview / Khóa */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isPreview ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#1a56db]/10 text-[#1a56db]">
                              <Eye size={12} />
                              <span>Học thử</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400" title="Yêu cầu đăng ký khóa học">
                              <Lock size={14} />
                            </div>
                          )}

                          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Clock size={13} />
                            <span>{durationText}</span>
                          </div>
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
    </div>
  );
}
