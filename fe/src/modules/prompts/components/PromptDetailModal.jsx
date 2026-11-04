import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, Sparkles, User, Tag } from 'lucide-react';

/**
 * PromptDetailModal - Modal xem chi tiết và tùy biến biến số của Prompt
 */
export default function PromptDetailModal({
  prompt,
  isOpen,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const [variablesValues, setVariablesValues] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Khởi tạo giá trị mặc định cho biến số
      if (prompt?.variables && Array.isArray(prompt.variables)) {
        const initial = {};
        prompt.variables.forEach((v) => {
          initial[v.name] = v.defaultValue || '';
        });
        setVariablesValues(initial);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, prompt]);

  if (!isOpen || !prompt) return null;

  // Render câu prompt đã điền giá trị biến
  const generatedPrompt = () => {
    if (!prompt.template) return '';
    let result = prompt.template;
    Object.keys(variablesValues).forEach((key) => {
      const val = variablesValues[key] || `[${key}]`;
      result = result.replaceAll(`[${key}]`, val);
    });
    return result;
  };

  const handleCopyPrompt = () => {
    const text = generatedPrompt();
    if (!text) return;
    navigator.clipboard.writeText(text);
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
                {prompt.category}
              </span>
              <span className="bg-[#1a56db]/10 text-[#1a56db] text-[10px] font-bold px-2 py-0.5 rounded-[4px]">
                {prompt.model}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {prompt.price}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#273044] leading-tight">
              {prompt.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-[6px] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Mô tả */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mô tả chi tiết
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-[8px] border border-slate-100">
              {prompt.description}
            </p>
          </div>

          {/* Các biến số tùy chỉnh */}
          {prompt.variables && prompt.variables.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Terminal size={14} className="text-[#1a56db]" />
                <span>Điền tham số tùy biến</span>
              </h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-[8px] border border-slate-200/80">
                {prompt.variables.map((v) => (
                  <div key={v.name} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>{v.label || v.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{v.name}]</span>
                    </label>
                    <input
                      type="text"
                      value={variablesValues[v.name] || ''}
                      onChange={(e) =>
                        setVariablesValues((prev) => ({
                          ...prev,
                          [v.name]: e.target.value,
                        }))
                      }
                      placeholder={v.placeholder || `Nhập ${v.label}`}
                      className="w-full text-xs bg-white border border-slate-200 rounded-[6px] px-3 py-2 text-slate-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt hoàn chỉnh */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Nội dung câu lệnh (Prompt)</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a56db] hover:underline cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
              </button>
            </div>
            <div className="relative bg-slate-900 rounded-[8px] p-4 text-xs font-mono text-slate-100 leading-relaxed border border-slate-800 whitespace-pre-wrap select-all">
              {generatedPrompt() || prompt.template}
            </div>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <Tag size={13} className="text-slate-400 shrink-0" />
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-[4px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Tác giả: <span className="font-semibold text-slate-700">{prompt.authorName}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Đã sao chép prompt' : 'Sao chép câu lệnh'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

