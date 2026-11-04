import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, FileText, Sparkles } from 'lucide-react';

/**
 * SkillDetailModal - Modal xem nhanh chi tiết Kỹ năng AI
 * Cho phép người dùng đọc hướng dẫn, sao chép prompt và tải file SKILL.md
 */
export default function SkillDetailModal({
  skill,
  isOpen,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  // Khóa scroll khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !skill) return null;

  const handleCopyInstructions = () => {
    if (!skill.instructions) return;
    navigator.clipboard.writeText(skill.instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-[12px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/80">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider">
                {skill.category}
              </span>
              {skill.version && (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                  v{skill.version}
                </span>
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                skill.isFree
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}>
                {skill.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-snug">
              {skill.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Ảnh banner 16:9 full width sắc nét */}
          <div className="w-full aspect-video max-h-56 sm:max-h-64 rounded-[8px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
            <img
              src={skill.image}
              alt={skill.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mô tả kỹ năng đầy đủ chiều ngang */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả kỹ năng
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {skill.description}
            </p>
          </div>

          {/* Hướng dẫn sử dụng (Instructions) */}
          {skill.instructions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Hướng dẫn kích hoạt và sử dụng</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyInstructions}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1a56db] hover:text-[#1545b3] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-600">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Sao chép hướng dẫn</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-[8px] text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap select-all max-h-48 overflow-y-auto">
                {skill.instructions}
              </div>
            </div>
          )}

          {/* Tệp đính kèm (Files) */}
          {skill.files && skill.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-[#1a56db]" />
                <span>Tệp đính kèm ({skill.files.length})</span>
              </h4>

              <div className="space-y-2">
                {skill.files.map((file) => (
                  <div
                    key={file.id || file.name}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[8px] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <div className="w-8 h-8 rounded-[6px] bg-blue-50 text-[#1a56db] flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#273044] truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {file.sizeFormatted} • {file.mimeType}
                        </div>
                      </div>
                    </div>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors shrink-0"
                    >
                      <Download size={13} />
                      <span>Tải file</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 sm:p-5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-[#273044] text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
