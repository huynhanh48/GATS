import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Globe } from 'lucide-react';

/**
 * McpDetailModal - Modal xem nhanh chi tiết MCP Server
 */
export default function McpDetailModal({
  mcp,
  isOpen,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
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

  if (!isOpen || !mcp) return null;

  const handleCopyInstallation = () => {
    if (!mcp.installation) return;
    navigator.clipboard.writeText(mcp.installation);
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
                {mcp.category}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mcp.isFree
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}>
                {mcp.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-snug">
              {mcp.title}
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
          {/* Ảnh banner 16:9 full width */}
          <div className="w-full aspect-video max-h-56 sm:max-h-64 rounded-[8px] overflow-hidden bg-slate-900 shrink-0 shadow-2xs">
            <img
              src={mcp.image}
              alt={mcp.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả máy chủ MCP
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {mcp.description}
            </p>
          </div>

          {/* Hướng dẫn cài đặt và cấu hình */}
          {mcp.installation && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Terminal size={14} className="text-[#1a56db]" />
                  <span>Hướng dẫn cài đặt và cấu hình</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyInstallation}
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
                      <span>Sao chép lệnh</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-[8px] leading-relaxed whitespace-pre-wrap select-all max-h-48 overflow-y-auto shadow-inner">
                {mcp.installation}
              </div>
            </div>
          )}

          {/* Đường dẫn Endpoint máy chủ MCP (Full-width với label và nút sao chép) */}
          {mcp.websiteUrl && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Đường dẫn Endpoint máy chủ MCP
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-[8px] w-full">
                <div className="pl-2 text-slate-400">
                  <Globe size={15} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={mcp.websiteUrl}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-mono outline-none truncate select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(mcp.websiteUrl);
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
                  href={mcp.websiteUrl}
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
