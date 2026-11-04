import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Globe, ShieldCheck, Copy, Check } from 'lucide-react';

/**
 * ToolDetailModal - Modal xem nhanh chi tiết Công cụ AI
 */
export default function ToolDetailModal({
  tool,
  isOpen,
  onClose,
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-[12px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200/80">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-white shrink-0">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wider">
                {tool.provider}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tool.isFree
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}>
                {tool.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-snug">
              {tool.title}
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
          <div className="w-full aspect-video max-h-56 sm:max-h-64 rounded-[8px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả công cụ
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tool.description}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-[8px] border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Nhà phát triển:</span>
              <span className="font-bold text-[#273044]">{tool.provider}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Môi trường:</span>
              <span className="font-bold text-[#273044]">Phát triển AI và Phần mềm</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Kiểm định chất lượng:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={14} /> Đã kiểm thử tại GATS
              </span>
            </div>
          </div>

          {/* Đường dẫn Website và Trang chủ Công cụ (Full-width với label và nút sao chép) */}
          {tool.websiteUrl && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Đường dẫn Trang chủ / Website Công cụ
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-[8px] w-full">
                <div className="pl-2 text-slate-400">
                  <Globe size={15} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={tool.websiteUrl}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-mono outline-none truncate select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tool.websiteUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-[#1a56db] text-xs font-bold rounded-[6px] transition-colors cursor-pointer shrink-0"
                >
                  {copiedUrl ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-[#1a56db] hover:bg-slate-100 rounded-[6px] transition-colors shrink-0"
                  title="Mở liên kết trong tab mới"
                >
                  <ExternalLink size={15} />
                </a>
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
