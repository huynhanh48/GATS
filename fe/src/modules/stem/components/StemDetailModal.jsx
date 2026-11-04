import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Check, Copy, Atom, Wrench, Layers, BookOpen, Cpu } from 'lucide-react';

/**
 * StemDetailModal - Modal xem nhanh chi tiết mô-đun STEM
 */
export default function StemDetailModal({
  stem,
  isOpen,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !stem) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
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
                {stem.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stem.isFree
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}
              >
                {stem.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-snug">
              {stem.title}
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

        {/* Body (Scrollable) */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Cover Preview Image */}
          <div className="relative w-full aspect-video rounded-[8px] overflow-hidden bg-slate-900 border border-slate-200/60">
            <img
              src={stem.image}
              alt={stem.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-2">
              Giới thiệu mô-đun
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {stem.description}
            </p>
          </div>

          {/* Thông số kỹ thuật */}
          {stem.specifications && stem.specifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#1a56db]" />
                <span>Thông tin & Chuẩn đào tạo</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-[8px] border border-slate-100">
                {stem.specifications.map((spec, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-slate-400">{spec.label}: </span>
                    <span className="font-semibold text-[#273044]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linh kiện phần cứng */}
          {stem.hardware && stem.hardware.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench size={14} className="text-[#1a56db]" />
                <span>Linh kiện Kit phần cứng</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {stem.hardware.map((hw, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-[4px] border border-slate-200/60"
                  >
                    {hw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phần mềm & Môi trường phát triển */}
          {stem.software && stem.software.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#273044] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-600" />
                <span>Phần mềm & Môi trường lập trình</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {stem.software.map((sw, i) => (
                  <span
                    key={i}
                    className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-[4px] border border-purple-100 font-medium"
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600">Đã sao chép liên kết</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Chia sẻ</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-[6px] transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {stem.docUrl && (
              <a
                href={stem.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors shadow-2xs cursor-pointer"
              >
                <span>Xem tài liệu & Sơ đồ</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
