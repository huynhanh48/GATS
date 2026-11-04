import React from 'react';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * SkillCard - Thẻ hiển thị Kỹ năng AI
 * Thiết kế chuẩn phong cách CourseCard của GATS Academy
 * Hỗ trợ 2 chế độ hiển thị: 'grid' (lưới 3 cột) và 'list' (danh sách ngang)
 * Bo góc chuẩn rounded-[10px], không icon mũi tên rác
 */
export default function SkillCard({
  skill,
  onSelectSkill,
  viewMode = 'grid',
}) {
  if (!skill) return null;

  const handleCardClick = () => {
    onSelectSkill?.(skill);
  };

  const fileCountText = skill.fileCount > 0
    ? `${skill.fileCount} tệp đính kèm`
    : 'Tài liệu hướng dẫn';

  /* ========================================================
     1. LIST VIEW (Dạng danh sách hàng ngang)
     ======================================================== */
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row overflow-hidden hover:-translate-y-0.5">
        {/* Thumbnail bên trái */}
        <div
          className="relative w-full md:w-5/12 lg:w-4/12 shrink-0 aspect-video md:aspect-auto overflow-hidden bg-slate-900 cursor-pointer"
          onClick={handleCardClick}
        >
          <img
            src={skill.image}
            alt={skill.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge Category */}
          <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px]">
            {skill.category}
          </span>
        </div>

        {/* Nội dung bên phải */}
        <div className="p-5 md:p-6 flex flex-col justify-between w-full md:w-7/12 lg:w-8/12 min-w-0">
          <div>
            <h3
              onClick={handleCardClick}
              className="text-[18px] font-bold text-[#273044] leading-snug mb-2 cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2"
            >
              {skill.title}
            </h3>

            <p className="text-[13px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
              {skill.description}
            </p>

            {/* Meta Thông tin */}
            <div className="flex items-center gap-4 text-[12px] text-slate-500 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <FileText size={14} className="text-[#1a56db]" />
                <span>{fileCountText}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Chuẩn hóa thực chiến</span>
              </div>
            </div>
          </div>

          {/* Footer List View */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Sparkles size={14} className="text-amber-500" />
              <span>Dễ dàng tích hợp vào Claude, ChatGPT, Cursor</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCardClick}
                className="px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     2. GRID VIEW (Dạng lưới 3 cột đồng bộ CourseCard)
     ======================================================== */
  return (
    <div className="group relative h-full flex flex-col bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      {/* Thumbnail 16:9 */}
      <div
        className="relative w-full aspect-video overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={skill.image}
          alt={skill.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge Category */}
        <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px]">
          {skill.category}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3
            onClick={handleCardClick}
            className="text-[17px] font-bold text-[#273044] leading-snug mb-2 cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2 min-h-[44px]"
          >
            {skill.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
            {skill.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between bg-slate-50 rounded-[6px] px-3.5 py-2 mb-4 text-slate-600 text-[12px] font-medium border border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              <FileText size={14} className="text-[#1a56db] shrink-0" />
              <span className="truncate">{fileCountText}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span className="truncate">Thực chiến</span>
            </div>
          </div>
        </div>

        {/* Footer: Giá và Nút Xem Chi Tiết */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[16px] font-extrabold text-[#273044]">
            {skill.price}
          </div>

          <button
            type="button"
            onClick={handleCardClick}
            className="px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer select-none"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
