import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Menu,
} from 'lucide-react';

/**
 * PlayerHeader - Header của giao diện xem bài học MasterStudy
 * - Nút quay lại khóa học (Logo / Arrow)
 * - Tên khóa học
 * - Tab Lesson / Notes
 * - Nút Take Note (Ghi chú)
 * - Nút Thảo luận (Discussions)
 * - Toggle Light / Dark mode
 * - Toggle Sidebar Chương trình học
 */
export default function PlayerHeader({
  course,
  activeTab,
  onTabChange,
  isSidebarOpen,
  onToggleSidebar,
  onOpenNotesModal,
  notesCount = 0,
  isDiscussionsOpen = false,
  onToggleDiscussions,
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-30 sticky top-0">
      {/* Cụm bên trái: Nút Back, Logo & Tên Khóa Học */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to={`/courses/${course?.slug || ''}`}
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Quay lại chi tiết khóa học"
          aria-label="Quay lại khóa học"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Logo GATS */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0" aria-label="GATS AI Home">
          <img src="/icons/logo.svg" alt="GATS AI Logo" className="w-8 h-8 object-contain" />
        </Link>

        {/* Nút Toggle Sidebar danh sách bài học */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`px-3 py-1.5 rounded-[6px] border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            isSidebarOpen
              ? 'bg-blue-50 border-blue-200 text-[#1a56db]'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Menu size={14} />
          <span className="hidden sm:inline-block">Giáo trình</span>
        </button>

        {/* Tên khóa học */}
        <div className="hidden md:flex flex-col min-w-0 border-l border-slate-200 pl-3 ml-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">
            Khóa học
          </span>
          <span className="text-xs font-bold text-[#273044] truncate max-w-[280px] lg:max-w-[420px]">
            {course?.title || 'Đang tải khóa học...'}
          </span>
        </div>
      </div>

      {/* Cụm ở giữa: Tabs Lesson & Notes */}
      <div className="hidden sm:flex items-center gap-6">
        <button
          type="button"
          onClick={() => onTabChange('lesson')}
          className={`py-2 px-1 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'lesson'
              ? 'border-[#1a56db] text-[#1a56db]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bài học
        </button>

        <button
          type="button"
          onClick={() => onTabChange('notes')}
          className={`py-2 px-1 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-[#1a56db] text-[#1a56db]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Ghi chú</span>
          {notesCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-blue-100 text-[#1a56db]">
              {notesCount}
            </span>
          )}
        </button>
      </div>

      {/* Cụm bên phải: Actions (Take note, Discussions, Theme) */}
      <div className="flex items-center gap-2.5">
        {/* Nút Tạo Ghi Chú */}
        <button
          type="button"
          onClick={onOpenNotesModal}
          className="px-3.5 py-2 rounded-[6px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer select-none"
        >
          <FileText size={13} />
          <span className="hidden xs:inline-block">Take Note</span>
        </button>

        {/* Nút Thảo luận (Discussions) */}
        <button
          type="button"
          onClick={onToggleDiscussions || (() => onTabChange('discussions'))}
          className={`p-2 sm:px-3.5 sm:py-2 rounded-[6px] border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isDiscussionsOpen
              ? 'bg-blue-50 border-blue-300 text-[#1a56db] shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
          title="Thảo luận cùng học viên và giảng viên"
        >
          <MessageSquare size={14} className="text-[#1a56db]" />
          <span className="hidden sm:inline-block">Discussions</span>
        </button>
      </div>
    </header>
  );
}
