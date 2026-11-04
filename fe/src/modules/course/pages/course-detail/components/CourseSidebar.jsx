import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  Video,
  BarChart,
  Heart,
  Share2,
  Check,
  Globe,
  Award,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

/**
 * CourseSidebar - Sticky Sidebar cột phải chuẩn template MasterStudy Timeless
 * - Giá khóa học và Nút CTA chính "ENROLL COURSE" / "ĐĂNG KÝ HỌC NGAY"
 * - Nút Yêu thích (Wishlist) và Chia sẻ (Share)
 * - Khung Course details: Duration, Lectures, Video, Assignments, Quizzes, Level, Language, Certificate
 */
export default function CourseSidebar({
  course,
  onEnroll,
  isEnrolled = false,
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isContact = Boolean(course.isContact || course.price === 'Liên hệ' || course.pricingType === 'contact');
  const isFree = !isContact && Boolean(course.isFree);
  const effectiveEnrolled = !isContact && isEnrolled;

  const displayPrice = course.price || (isContact ? 'Liên hệ' : isFree ? 'Miễn phí' : '0đ');
  const originalPrice = course.originalPrice || null;

  // Metadata thống kê
  const duration = course.duration || '6 giờ';
  const lectures = course.views || `${course.raw?.stats?.lessonCount || 24} bài học`;
  const level = course.level || 'Beginner';

  return (
    <div className="space-y-6 sticky top-24">
      {/* Khung CTA Đăng ký & Giá */}
      <div className="bg-white border border-slate-200/90 rounded-[10px] p-6 shadow-xs space-y-5">
        {/* Hiển thị Giá */}
        <div className="flex items-baseline gap-3">
          <span
            className={`text-2xl sm:text-3xl font-extrabold ${
              isContact ? 'text-[#1a56db]' : isFree ? 'text-[#10b981]' : 'text-[#1a56db]'
            }`}
          >
            {displayPrice}
          </span>
          {originalPrice && (
            <span className="text-sm font-semibold text-slate-400 line-through">
              {originalPrice}
            </span>
          )}
        </div>

        {/* Nút CTA Chính (LIÊN HỆ / VÀO HỌC / ĐĂNG KÝ) */}
        <button
          type="button"
          onClick={onEnroll}
          className={`w-full py-3.5 px-6 rounded-[8px] font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-md text-center cursor-pointer select-none text-white ${
            isContact
              ? 'bg-[#1a56db] hover:bg-[#1545b3] shadow-blue-500/15'
              : effectiveEnrolled
                ? 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-500/15'
                : isFree
                  ? 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-500/15'
                  : 'bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] shadow-blue-500/15'
          }`}
        >
          {isContact
            ? 'Liên hệ tư vấn'
            : effectiveEnrolled
              ? 'Vào học ngay'
              : isFree
                ? 'Bắt đầu học miễn phí'
                : 'Đăng ký khóa học'}
        </button>

        {/* Nút Phụ: Wishlist và Share */}
        <div className="grid grid-cols-2 gap-3 pt-1  border-slate-100">
          <button
            type="button"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`py-2 px-3 rounded-[6px] border text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <Heart
              size={14}
              className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''}
            />
            <span>{isWishlisted ? 'Đã thích' : 'Yêu thích'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="py-2 px-3 rounded-[6px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-[#10b981]" /> : <Share2 size={14} />}
            <span>{copied ? 'Đã copy link' : 'Chia sẻ'}</span>
          </button>
        </div>
      </div>

      {/* Khung Course details (Thông số chi tiết) */}
      <div className="bg-white border border-slate-200/90 rounded-[10px] p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-[#273044] mb-4 pb-3 border-b border-slate-100">
          Thông tin khóa học
        </h3>

        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Clock size={16} className="text-[#1a56db]" />
              <span>Thời lượng</span>
            </div>
            <span className="font-bold text-[#273044]">{duration}</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <BookOpen size={16} className="text-[#1a56db]" />
              <span>Bài giảng</span>
            </div>
            <span className="font-bold text-[#273044]">{lectures}</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Video size={16} className="text-[#1a56db]" />
              <span>Video thực hành</span>
            </div>
            <span className="font-bold text-[#273044]">Full HD 1080p</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <FileCheck size={16} className="text-[#1a56db]" />
              <span>Bài tập ứng dụng</span>
            </div>
            <span className="font-bold text-[#273044]">3 Mini Projects</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <HelpCircle size={16} className="text-[#1a56db]" />
              <span>Trắc nghiệm kiểm tra</span>
            </div>
            <span className="font-bold text-[#273044]">Có</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <BarChart size={16} className="text-[#1a56db]" />
              <span>Cấp độ</span>
            </div>
            <span className="font-bold text-[#273044] capitalize">{level}</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Globe size={16} className="text-[#1a56db]" />
              <span>Ngôn ngữ</span>
            </div>
            <span className="font-bold text-[#273044]">Tiếng Việt</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <Award size={16} className="text-[#1a56db]" />
              <span>Chứng chỉ hoàn thành</span>
            </div>
            <span className="font-bold text-[#10b981]">Có</span>
          </div>
        </div>
      </div>
    </div>
  );
}
