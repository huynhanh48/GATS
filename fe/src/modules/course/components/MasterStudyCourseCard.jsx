import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Star, BookOpen, Clock, Heart } from 'lucide-react';

/**
 * Thẻ hiển thị khóa học chuẩn template MasterStudy Marketing LMS
 * Tham chiếu cấu trúc: ms_lms_courses_card_item & ms_lms_courses_card_item_popup
 */
export default function MasterStudyCourseCard({
  course,
  onSelectCourse,
  showHoverPopup = true,
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  if (!course) return null;

  const handleCardClick = (e) => {
    e?.stopPropagation();
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  // Badge mapping tương ứng với bảng màu chuẩn MasterStudy
  const getBadgeStyle = (type, badgeText) => {
    const lowerType = (type || badgeText || '').toLowerCase();
    if (lowerType.includes('hot')) {
      return 'bg-[#ff5252] text-white';
    }
    if (lowerType.includes('special')) {
      return 'bg-[#f09b23] text-white';
    }
    if (lowerType.includes('new')) {
      return 'bg-[#1db874] text-white';
    }
    if (lowerType.includes('members') || lowerType.includes('hội viên')) {
      return 'bg-[#407bff] text-white';
    }
    return 'bg-slate-700 text-white';
  };

  const badgeText = course.badge || (course.isHot ? 'Hot' : course.isNew ? 'New' : course.isSpecial ? 'Special' : null);
  const badgeType = course.badgeType || (badgeText ? badgeText.toLowerCase() : null);

  const ratingValue = Number(course.rating || 5);
  const studentsCount = typeof course.students === 'number'
    ? course.students.toLocaleString('vi-VN')
    : course.students || '1,200';
  const viewsCount = typeof course.views === 'number'
    ? course.views.toLocaleString('vi-VN')
    : course.views || '4,500';

  const isContact = Boolean(course.isContact || course.price === 'Liên hệ' || course.pricingType === 'contact');
  const isFree = !isContact && Boolean(course.isFree || course.price === 'Miễn phí' || course.price === 'Free');
  const isMembersOnly = course.isMembersOnly || course.price === 'Hội viên' || course.price === 'Members Only';

  return (
    <div
      className={`relative group h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Khung Card chính */}
      <div className="relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 overflow-hidden">
        {/* Thumbnail & Status Badge */}
        <div
          className="relative w-full aspect-video overflow-hidden bg-slate-900 cursor-pointer"
          onClick={handleCardClick}
        >
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {badgeText && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded shadow-sm ${getBadgeStyle(badgeType, badgeText)}`}>
                {badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Chuyên mục (Category) */}
          <span className="text-[13px] font-medium text-slate-400 hover:text-[#407bff] transition-colors mb-2 block truncate">
            {course.category || 'Khóa học GATS'}
          </span>

          {/* Tiêu đề khóa học */}
          <h3
            className="text-[17px] font-bold text-[#273044] hover:text-[#407bff] transition-colors leading-[1.35] line-clamp-2 min-h-[46px] mb-3 cursor-pointer"
            onClick={handleCardClick}
          >
            {course.title}
          </h3>

          {/* Thanh thông số học viên và lượt xem */}
          <div className="bg-[#f1f5f9] rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-600 font-semibold mb-3.5 border border-slate-200/50">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              <span>{studentsCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-slate-400" />
              <span>{viewsCount}</span>
            </div>
          </div>

          {/* Đường phân cách mảnh */}
          <div className="border-t border-slate-100 mb-3.5 mt-auto" />

          {/* Hàng chân thẻ: Sao đánh giá & Giá bán HOẶC Coming Soon Countdown */}
          {course.isComingSoon || course.comingSoonDate || course.availability === 'coming_soon' ? (
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium leading-none mb-1">Coming soon:</span>
                <span className="text-[12px] font-bold text-[#273044] leading-tight">
                  {course.comingSoonDate || 'September 10, 2026'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-6 flex items-center justify-center bg-[#e9eef5] text-[#273044] text-[11px] font-bold rounded" title="Days">01</span>
                <span className="w-6 h-6 flex items-center justify-center bg-[#e9eef5] text-[#273044] text-[11px] font-bold rounded" title="Hours">08</span>
                <span className="w-6 h-6 flex items-center justify-center bg-[#e9eef5] text-[#273044] text-[11px] font-bold rounded" title="Minutes">45</span>
                <span className="w-6 h-6 flex items-center justify-center bg-[#e9eef5] text-[#273044] text-[11px] font-bold rounded" title="Seconds">00</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              {/* Sao đánh giá */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className={i < Math.floor(ratingValue) ? 'text-[#ffb606] fill-[#ffb606]' : 'text-slate-200 fill-slate-200'}
                    />
                  ))}
                </div>
                <span className="text-[14px] font-bold text-[#273044] ml-1">
                  {ratingValue.toFixed(1)}
                </span>
              </div>

              {/* Giá bán */}
              <div className="text-right">
                {isContact ? (
                  <span className="text-[#1a56db] font-bold text-[15px]">Liên hệ</span>
                ) : isFree ? (
                  <span className="text-[#10b981] font-bold text-[16px]">Miễn phí</span>
                ) : isMembersOnly ? (
                  <span className="text-[#407bff] font-bold text-sm">Hội viên</span>
                ) : course.originalPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 line-through">{course.originalPrice}</span>
                    <span className="text-[#ff5252] font-extrabold text-[16px]">{course.price}</span>
                  </div>
                ) : course.price ? (
                  <span className="text-[#273044] font-extrabold text-[16px]">{course.price}</span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Preview Popover chuẩn MasterStudy khi Hover (hiển thị trên màn hình lớn) */}
      {showHoverPopup && isHovered && (
        <div
          className="hidden lg:flex absolute -top-2.5 -left-2.5 -right-2.5 min-h-[calc(100%+20px)] bg-white rounded-xl shadow-[0_20px_45px_rgba(39,48,68,0.22)] border border-[#e9eef5] p-5 z-50 flex-col justify-between transition-all duration-200 animate-in fade-in zoom-in-95"
          onClick={handleCardClick}
        >
          <div>
            {/* Giảng viên */}
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={course.instructorAvatar || 'https://masterstudy.stylemixthemes.com/marketing/wp-content/themes/ms-lms-starter-theme-child/assets/images/avatars/demo-instructor.jpg'}
                alt={course.instructor || 'Giảng viên'}
                className="w-8 h-8 rounded-full object-cover border border-slate-100"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                }}
              />
              <div>
                <span className="text-[11px] text-slate-400 block leading-tight">Giảng viên</span>
                <span className="text-[13px] font-semibold text-slate-800 leading-tight">
                  {course.instructor || 'GATS Academy'}
                </span>
              </div>
            </div>

            {/* Tiêu đề */}
            <h4 className="text-[16px] font-bold text-[#273044] hover:text-[#407bff] leading-snug line-clamp-2 mb-2 transition-colors">
              {course.title}
            </h4>

            {/* Đoạn trích tóm tắt */}
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3">
              {course.description || 'Chương trình đào tạo chuyên sâu với kiến thức thực chiến và quy trình triển khai chuẩn quốc tế.'}
            </p>

            {/* Cụm thông số: Cấp độ, Số bài học, Thời lượng */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pb-4 border-b border-slate-100">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {course.level || 'Cơ bản'}
              </span>
              <div className="flex items-center gap-1">
                <BookOpen size={12} className="text-slate-400" />
                <span>{course.lectures || '22 bài học'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                <span>{course.duration || '10 giờ'}</span>
              </div>
            </div>
          </div>

          {/* Nút thao tác và footer popover */}
          <div className="pt-3">
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] active:bg-[#1e53d0] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/20 text-center mb-3"
              onClick={handleCardClick}
            >
              Xem chi tiết khóa học
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleWishlist}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isWishlisted ? 'text-[#ff5252]' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Heart
                  size={14}
                  className={isWishlisted ? 'text-[#ff5252] fill-[#ff5252]' : 'text-slate-400'}
                />
                <span>{isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}</span>
              </button>

              <div>
                {isContact ? (
                  <span className="text-[#1a56db] font-bold text-sm">Liên hệ</span>
                ) : isFree ? (
                  <span className="text-[#10b981] font-bold text-sm">Miễn phí</span>
                ) : isMembersOnly ? (
                  <span className="text-[#407bff] font-bold text-xs">Hội viên</span>
                ) : (
                  <span className="text-[#273044] font-extrabold text-sm">{course.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
