import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Headphones,
  BookOpen,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

/**
 * CourseConsultationModal - Modal đăng ký nhận tư vấn và báo giá khóa học
 * Kết nối trực tiếp tới API Backend Leads (/api/leads)
 */
export default function CourseConsultationModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    note: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cập nhật form data khi user đăng nhập hoặc modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (event) => {
        if (event.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    const cleanedPhone = formData.phone.trim().replace(/\s+/g, '');
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMessage('Địa chỉ email không đúng định dạng.');
        return;
      }
    }

    // 2. Gửi dữ liệu lên Backend
    setSubmitting(true);
    setErrorMessage('');

    try {
      await leadService.submitLead({
        fullName: formData.fullName.trim(),
        phone: cleanedPhone,
        email: formData.email.trim() || undefined,
        courseId: course?.id || undefined,
        courseTitle: course?.title || 'Khóa học GATS Academy',
        note: formData.note.trim() || `Yêu cầu tư vấn khóa học: ${course?.title || ''}`,
        source: 'course_detail_modal',
      });

      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu tư vấn:', err);
      setErrorMessage(
        err?.response?.data?.message ||
          'Không thể gửi thông tin lúc này. Quý khách vui lòng thử lại hoặc liên hệ Hotline.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 sm:max-h-[calc(100vh-3rem)]"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-consultation-title"
      >
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
          aria-label="Đóng biểu mẫu tư vấn"
        >
          <X size={18} />
        </button>

        {isSubmitted ? (
          /* Trạng thái gửi thành công */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#10b981] flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#273044]">
                Gửi yêu cầu thành công
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Cảm ơn bạn đã quan tâm đến khóa học tại GATS Academy. Đội ngũ chuyên viên tư vấn sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
            </div>

            {course?.title && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-[8px] flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-[6px] bg-blue-100 text-[#1a56db] flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider block">
                    Khóa học đăng ký
                  </span>
                  <p className="text-xs font-bold text-[#273044] truncate">
                    {course.title}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Đã hiểu và Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Biểu mẫu điền thông tin */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Modal */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1a56db] text-xs font-bold">
                <Headphones size={14} />
                <span>Tư vấn lộ trình học tập</span>
              </div>
              <h3
                id="course-consultation-title"
                className="text-xl sm:text-2xl font-extrabold text-[#273044]"
              >
                Đăng ký nhận tư vấn khóa học
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Để lại thông tin để nhận chương trình đào tạo chi tiết và chính sách học phí ưu đãi từ GATS Academy.
              </p>
            </div>

            {/* Khung tóm tắt khóa học */}
            {course?.title && (
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-[8px] flex items-center gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-blue-100 text-[#1a56db] flex items-center justify-center shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Khóa học quan tâm
                  </span>
                  <p className="text-xs font-bold text-[#273044] truncate">
                    {course.title}
                  </p>
                </div>
              </div>
            )}

            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-[8px] flex items-start gap-2.5 text-xs text-rose-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="lead-fullname"
                  className="block text-xs font-bold text-[#273044] mb-1.5"
                >
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="lead-fullname"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-[8px] text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="lead-phone"
                    className="block text-xs font-bold text-[#273044] mb-1.5"
                  >
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      id="lead-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-[8px] text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lead-email"
                    className="block text-xs font-bold text-[#273044] mb-1.5"
                  >
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      id="lead-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hocvien@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-[8px] text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="lead-note"
                  className="block text-xs font-bold text-[#273044] mb-1.5"
                >
                  Nhu cầu học tập hoặc Lời nhắn
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <MessageSquare size={16} />
                  </div>
                  <textarea
                    id="lead-note"
                    name="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Chia sẻ mục tiêu học tập, thời gian biểu mong muốn hoặc thắc mắc của bạn..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-[8px] text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-[8px] bg-[#1a56db] hover:bg-[#1545b3] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-blue-500/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Gửi thông tin tư vấn</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                GATS Academy cam kết bảo mật thông tin cá nhân của học viên.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
