import React, { useState } from 'react';
import GatsHlsPlayer from './GatsHlsPlayer';
import { resolveMediaUrl } from '@/shared/utils/media';
import {
  FileText,
  Download,
  CheckCircle,
} from 'lucide-react';

/**
 * PlayerLessonContent - Khu vực hiển thị nội dung bài học chính
 * - Breadcrumb loại bài (Video lesson, Article lesson, Quiz...)
 * - Tiêu đề bài học lớn H1
 * - GatsHlsPlayer cao cấp hỗ trợ điều chỉnh chất lượng (Quality: 1080p, 720p, 360p, Auto), tốc độ (Speed: 0.5x - 2x), tua thời gian & Fullscreen
 * - Thanh tiến độ bài học động theo thời gian thực (Lesson video progress / questions)
 * - Mô tả bài giảng chi tiết & Bài viết HTML
 * - Nút Complete & Next (Hoàn thành và Chuyển bài)
 */
export default function PlayerLessonContent({
  lesson,
  course,
  isCompleted,
  onCompleteAndNext,
  onPrevLesson,
  hasPrev,
  hasNext,
}) {
  const [videoProgress, setVideoProgress] = useState(0);

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <p className="text-sm font-medium text-slate-500">
          Vui lòng chọn bài học từ danh sách giáo trình bên trái để bắt đầu học.
        </p>
      </div>
    );
  }

  const lessonTypeLabel =
    lesson.type === 'video'
      ? 'Bài giảng Video'
      : lesson.type === 'quiz'
        ? 'Bài tập Trắc nghiệm'
        : lesson.type === 'audio'
          ? 'Bài giảng Audio'
          : 'Bài viết Hướng dẫn';

  // Lấy video URL từ Backend data (playbackUrl / videoUrl / hlsUrl / streamUrl / fileUrl)
  const rawVideoSrc =
    lesson.playbackUrl ||
    lesson.videoUrl ||
    lesson.hlsUrl ||
    lesson.streamUrl ||
    lesson.fileUrl ||
    lesson.contentUrl ||
    '';

  const videoSrc = rawVideoSrc
    ? resolveMediaUrl(rawVideoSrc)
    : 'https://vjs.zencdn.net/v/oceans.mp4'; // Demo fallback stream

  const posterUrl = resolveMediaUrl(
    lesson.thumbnail || course?.image,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80'
  );

  const handleTimeUpdate = (data) => {
    if (data?.percentage) {
      setVideoProgress(Math.round(data.percentage));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f8fafc] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header bài học */}
        <div>
          <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider block mb-1.5">
            {lessonTypeLabel}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#273044] leading-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Khung Trình Chiếu GatsHlsPlayer Hỗ trợ HLS đa chất lượng (1080p, 720p, 360p) & Tốc độ phát */}
        <div className="rounded-[10px] overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md">
          {lesson.type === 'video' || videoSrc ? (
            <GatsHlsPlayer
              src={videoSrc}
              poster={posterUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                setVideoProgress(100);
                if (onCompleteAndNext) onCompleteAndNext();
              }}
            />
          ) : (
            <div className="aspect-video flex items-center justify-center bg-slate-900 text-white p-6 text-center">
              <div>
                <FileText size={40} className="mx-auto mb-2 text-blue-400" />
                <h3 className="text-lg font-bold">{lesson.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Bài học dạng văn bản và tài liệu thực hành.</p>
              </div>
            </div>
          )}
        </div>

        {/* Thanh Tiến Độ Bài Học (Lesson Video Progress) */}
        <div className="space-y-4 bg-white p-5 rounded-[10px] border border-slate-200/90 shadow-2xs">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#273044] mb-2">
              <span>Tiến độ xem video bài học:</span>
              <span className="text-[#1a56db]">
                {isCompleted ? '100%' : `${videoProgress}%`}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${isCompleted ? 100 : videoProgress}%` }}
                className={`h-full transition-all duration-300 ${isCompleted || videoProgress === 100 ? 'bg-[#10b981]' : 'bg-[#1a56db]'
                  }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#273044] mb-2">
              <span>Tiến độ câu hỏi và bài tập:</span>
              <span className="text-slate-500">0/3 hoàn thành</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-0 h-full bg-amber-400" />
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết bài giảng / Bài viết hướng dẫn Tiptap */}
        <div className="bg-white p-6 sm:p-8 rounded-[10px] border border-slate-200/90 shadow-2xs space-y-6">
          {/* Render Rich Content (HTML hoặc Văn bản bài viết từ Backend Tiptap) */}
          {(() => {
            const rawContent =
              lesson.content ||
              lesson.htmlContent ||
              lesson.html_content ||
              lesson.contentHtml ||
              lesson.content_html ||
              lesson.html ||
              lesson.body ||
              lesson.article ||
              (lesson.description && lesson.description.includes('<') ? lesson.description : '');

            if (rawContent) {
              return (
                <div
                  className="tiptap-rendered-content text-slate-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: rawContent,
                  }}
                />
              );
            }

            return (
              <div className="text-sm text-slate-600 leading-relaxed space-y-3">
                <p>
                  {lesson.description ||
                    'Bài học này cung cấp các kiến thức cốt lõi và các bước thực hành từng bước giúp bạn nắm vững kiến thức và kỹ năng thực tế nhanh nhất.'}
                </p>
                <p>
                  Học viên nên thực hành theo tài liệu đính kèm và ghi chú lại các điểm quan trọng trong quá trình xem bài giảng để đạt hiệu quả cao nhất.
                </p>
              </div>
            );
          })()}

          {/* Tài liệu đính kèm nếu có */}
          {Array.isArray(lesson.attachments) && lesson.attachments.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-6">
              <h4 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-3">
                Tài liệu đính kèm ({lesson.attachments.length})
              </h4>
              <div className="space-y-2">
                {lesson.attachments.map((att, idx) => (
                  <a
                    key={att.id || idx}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-[8px] border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText size={16} className="text-[#1a56db] shrink-0" />
                      <span className="truncate">{att.fileName || att.title}</span>
                    </div>
                    <Download size={14} className="text-slate-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Nút Hoàn Thành & Chuyển Bài (Complete & Next) */}
        <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-4">
          {hasPrev ? (
            <button
              type="button"
              onClick={onPrevLesson}
              className="px-5 py-2.5 rounded-[8px] border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Bài trước
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onCompleteAndNext}
            className="px-6 py-3 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer select-none flex items-center gap-2 ml-auto"
          >
            <CheckCircle size={16} />
            <span>{hasNext ? 'Hoàn thành và Học bài tiếp' : 'Hoàn thành khóa học'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
