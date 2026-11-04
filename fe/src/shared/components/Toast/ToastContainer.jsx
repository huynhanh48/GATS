import React from 'react';
import { useToastStore } from '@/shared/utils/toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (!toasts || toasts.length === 0) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={18} className="text-[#10b981] shrink-0" />,
          border: 'border-[#10b981]/30 bg-white',
          accent: 'bg-[#10b981]',
        };
      case 'error':
        return {
          icon: <AlertCircle size={18} className="text-rose-500 shrink-0" />,
          border: 'border-rose-500/30 bg-white',
          accent: 'bg-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
          border: 'border-amber-500/30 bg-white',
          accent: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          icon: <Info size={18} className="text-[#1a56db] shrink-0" />,
          border: 'border-[#1a56db]/30 bg-white',
          accent: 'bg-[#1a56db]',
        };
    }
  };

  return (
    <div
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const styles = getToastStyles(t.type);
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-[10px] border shadow-xl transition-all animate-in slide-in-from-top-3 duration-200 ${styles.border}`}
          >
            <div className="pt-0.5">{styles.icon}</div>
            <div className="flex-1 min-w-0">
              {t.title && (
                <h5 className="text-xs font-bold text-[#273044] leading-tight mb-0.5 truncate">
                  {t.title}
                </h5>
              )}
              <p className="text-xs text-slate-600 leading-snug font-medium break-words">
                {t.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer shrink-0"
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
