import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Terminal, Sparkles } from 'lucide-react';

/**
 * PromptCard - Thẻ hiển thị Mẫu Prompt AI
 * Chuẩn phong cách GATS Academy: bo góc rounded-[10px], hiệu ứng hover mượt mà
 */
export default function PromptCard({
  prompt,
  onSelectPrompt,
  viewMode = 'grid',
}) {
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCardClick = () => {
    onSelectPrompt?.(prompt);
  };

  const handleQuickCopy = (e) => {
    e.stopPropagation();
    if (!prompt.template) return;
    navigator.clipboard.writeText(prompt.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            src={prompt.image}
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Badge Category */}
          <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px]">
            {prompt.category}
          </span>
          {/* Badge Model */}
          <span className="absolute bottom-3 left-3 bg-[#1a56db]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
            {prompt.model}
          </span>
        </div>

        {/* Nội dung bên phải */}
        <div className="p-5 md:p-6 flex flex-col justify-between w-full md:w-7/12 lg:w-8/12 min-w-0">
          <div>
            <h3
              onClick={handleCardClick}
              className="text-[18px] font-bold text-[#273044] leading-snug mb-2 cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2"
            >
              {prompt.title}
            </h3>

            <p className="text-[13px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
              {prompt.description}
            </p>

            {/* Template Preview */}
            {prompt.template && (
              <div className="bg-slate-50 border border-slate-200 rounded-[6px] p-2.5 mb-3 font-mono text-[11px] text-slate-700 line-clamp-2">
                {prompt.template}
              </div>
            )}
          </div>

          {/* Footer List View */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
            <div className="text-[16px] font-extrabold text-[#273044]">
              {prompt.price}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép prompt'}</span>
              </button>
              <button
                type="button"
                onClick={handleCardClick}
                className="px-4 py-1.5 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
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
     2. GRID VIEW (Dạng lưới 3 cột)
     ======================================================== */
  return (
    <div className="group relative h-full flex flex-col bg-white rounded-[10px] border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      {/* Thumbnail 16:9 */}
      <div
        className="relative w-full aspect-video overflow-hidden bg-slate-900 shrink-0 cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={prompt.image}
          alt={prompt.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badge Category */}
        <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px]">
          {prompt.category}
        </span>
        {/* Model Badge */}
        <span className="absolute bottom-3 left-3 bg-[#1a56db]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
          {prompt.model}
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
            {prompt.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
            {prompt.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between bg-slate-50 rounded-[6px] px-3.5 py-2 mb-4 text-slate-600 text-[12px] font-medium border border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              <Terminal size={14} className="text-[#1a56db] shrink-0" />
              <span className="truncate">{prompt.variables?.length ? `${prompt.variables.length} biến số` : 'Sẵn sàng dùng'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles size={14} className="text-amber-500 shrink-0" />
              <span className="truncate">{prompt.model}</span>
            </div>
          </div>
        </div>

        {/* Footer: Giá và Nút Xem Chi Tiết */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-[16px] font-extrabold text-[#273044]">
            {prompt.price}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickCopy}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[6px] transition-colors cursor-pointer"
              title="Sao chép câu lệnh prompt"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3.5 py-2 bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer select-none"
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

