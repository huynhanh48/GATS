import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Star, Clock, BookOpen, Heart } from 'lucide-react';

/**
 * Reusable CourseCard component
 * Modeled on the Landing Page PopularCourses card
 * Border-radius is strictly moderate: rounded-[10px] (var(--radius-md))
 * Supports both 'grid' and 'list' view modes
 */
export default function CourseCard({
  course,
  onSelectCourse,
  isWishlisted: externalWishlisted,
  onToggleWishlist,
  enableHoverPreview = true,
  viewMode = 'grid',
}) {
  const [internalWishlisted, setInternalWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  if (!course) return null;

  const isWishlisted =
    typeof externalWishlisted === 'boolean'
      ? externalWishlisted
      : internalWishlisted;

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(course.id, e);
    } else {
      setInternalWishlisted((prev) => !prev);
    }
  };

  const handleCardClick = () => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else if (course.slug) {
      navigate(`/courses/${course.slug}`);
    }
  };

  const studentCount =
    typeof course.students === 'number'
      ? `${course.students.toLocaleString('vi-VN')} học viên`
      : course.students || '120 học viên';

  const viewOrLessonCount =
    typeof course.views === 'number'
      ? `${course.views.toLocaleString('vi-VN')} bài học`
      : course.views || '24 bài học';

  const ratingValue = Number(course.rating || 5);
  const instructorName = course.instructor || 'GATS Instructor';
  const instructorAvatar =
    course.instructorAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const thumbnailSrc =
    course.image ||
    course.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';

  /* ========================================================
     1. LIST VIEW LAYOUT (Dạng danh sách hàng ngang)
     ======================================================== */
  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white rounded-[10px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row overflow-hidden hover:-translate-y-0.5">
        {/* Thumbnail bên trái - Chiếm 50% */}
        <div className="relative w-full md:w-1/2 shrink-0 aspect-video md:aspect-auto overflow-hidden bg-slate-900 cursor-pointer" onClick={handleCardClick}>
          <img
            src={thumbnailSrc}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
            }}
          />
          {course.level && (
            <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-[4px]">
              {course.level}
            </span>
          )}
        </div>

        {/* Nội dung bên phải - Chiếm 50% */}
        <div className="p-5 md:p-6 flex flex-col justify-between w-full md:w-1/2 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[13px] font-medium text-slate-500 truncate">
                {course.category || 'Khóa học GATS'}
              </span>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-1 transition-colors cursor-pointer ${
                  isWishlisted ? 'text-[#ff5252]' : 'text-slate-400 hover:text-[#ff5252]'
                }`}
                title={isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
              >
                <Heart
                  size={17}
                  fill={isWishlisted ? '#ff5252' : 'none'}
                  color={isWishlisted ? '#ff5252' : 'currentColor'}
                />
              </button>
            </div>

            <h3
              onClick={handleCardClick}
              className="text-[18px] font-bold text-slate-900 leading-snug mb-2 cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2"
            >
              {course.title}
            </h3>

            <p className="text-[13px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
              {course.description ||
                'Khóa học thực chiến giúp bạn làm chủ công nghệ và tự động hóa quy trình hiệu quả.'}
            </p>

            {/* Meta Giảng viên và Thời lượng */}
            <div className="flex items-center gap-4 text-[12px] text-slate-500 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium text-slate-700">{instructorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={13} />
                <span>{course.lectures || viewOrLessonCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{course.duration || '6 Hours'}</span>
              </div>
            </div>
          </div>

          {/* Footer List View */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < Math.floor(ratingValue) ? '#f59e0b' : 'none'}
                      color={i < Math.floor(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </div>
                <span className="text-[13px] font-bold text-slate-900 ml-1">
                  {ratingValue.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-slate-500">
                <Users size={14} />
                <span>{studentCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                {course.isContact || course.price === 'Liên hệ' ? (
                  <span className="text-[#1a56db] font-bold text-[16px]">Liên hệ</span>
                ) : course.isFree || course.price === 'Miễn phí' ? (
                  <span className="text-[#10b981] font-bold text-[16px]">Miễn phí</span>
                ) : course.originalPrice ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 line-through">{course.originalPrice}</span>
                    <span className="text-[#1a56db] font-extrabold text-[18px]">{course.price}</span>
                  </div>
                ) : (
                  <span className="text-[18px] font-extrabold text-slate-900">{course.price}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCardClick}
                className="px-4 py-2 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors cursor-pointer"
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
     2. GRID VIEW LAYOUT (Dạng lưới 3 cột)
     ======================================================== */
  return (
    <div
      className="group relative h-full"
      onMouseEnter={() => enableHoverPreview && setIsHovered(true)}
      onMouseLeave={() => enableHoverPreview && setIsHovered(false)}
    >
      <div className="relative bg-white rounded-[10px] border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full hover:-translate-y-1">
        {/* Thumbnail (16:9) */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-[10px] bg-slate-900 shrink-0">
          <img
            src={thumbnailSrc}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category */}
          <span className="text-[13px] font-medium text-slate-500 mb-2 inline-block truncate">
            {course.category || 'Khóa học GATS'}
          </span>

          {/* Title - Giới hạn 2 dòng */}
          <h3
            onClick={handleCardClick}
            className="text-[17px] font-bold text-slate-900 leading-snug mb-3 cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2 min-h-[44px]"
          >
            {course.title}
          </h3>

          {/* Stats Row */}
          <div className="flex items-center justify-between bg-slate-100/90 rounded-[6px] px-3.5 py-2 mb-4 text-slate-500 text-[13px] font-medium">
            <div className="flex items-center gap-1.5 truncate">
              <Users size={15} className="text-slate-500 shrink-0" />
              <span className="truncate">{studentCount}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Eye size={15} className="text-slate-500 shrink-0" />
              <span className="truncate">{viewOrLessonCount}</span>
            </div>
          </div>

          {/* Footer: Rating and Price */}
          <div className="mt-auto flex items-center justify-between pt-3.5 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(ratingValue) ? '#f59e0b' : 'none'}
                    color={i < Math.floor(ratingValue) ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </div>
              <span className="text-[14px] font-bold text-slate-900 ml-1">
                {ratingValue.toFixed(1)}
              </span>
            </div>

            <div className="text-right">
              {course.isContact || course.price === 'Liên hệ' ? (
                <span className="text-[#1a56db] font-bold text-[15px]">Liên hệ</span>
              ) : course.isFree || course.price === 'Miễn phí' ? (
                <span className="text-[#10b981] font-bold text-[16px]">Miễn phí</span>
              ) : course.originalPrice ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 line-through">{course.originalPrice}</span>
                  <span className="text-[#1a56db] font-extrabold text-[16px]">{course.price}</span>
                </div>
              ) : (
                <span className="text-[17px] font-extrabold text-slate-900">{course.price}</span>
              )}
            </div>
          </div>
        </div>

        {/* In-Place Hover Quick Preview Popover
            Ôm khít đúng kích thước card (inset-0), không phình to quá đà
            Mô tả và tiêu đề giới hạn đúng 2 dòng (line-clamp-2) */}
        {isHovered && (
          <div className="hidden lg:flex absolute inset-0 bg-white rounded-[10px] shadow-[0_12px_32px_rgba(39,48,68,0.18)] border border-[#e2e8f0] p-5 z-50 flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
            <div>
              {/* Instructor */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                    Giảng viên
                  </span>
                  <span className="block text-[12px] font-bold text-[#273044]">
                    {instructorName}
                  </span>
                </div>
              </div>

              {/* Title - Khống chế 2 dòng */}
              <h4
                onClick={handleCardClick}
                className="text-[16px] font-bold text-[#273044] mb-2 leading-snug cursor-pointer hover:text-[#1a56db] transition-colors line-clamp-2"
              >
                {course.title}
              </h4>

              {/* Description - Giới hạn chặt chẽ 2 dòng để không bị to popup */}
              <p className="text-[12px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
                {course.description ||
                  'Khóa học thực chiến giúp bạn làm chủ công nghệ và tự động hóa quy trình hiệu quả.'}
              </p>

              {/* Meta badges */}
              <div className="flex items-center gap-2.5 mb-3 text-[11px] text-slate-500 flex-wrap">
                <span className="bg-[#edf3ff] text-[#1a56db] px-2 py-0.5 rounded-[4px] font-semibold">
                  {course.level || 'Beginner'}
                </span>
                <div className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>{course.lectures || viewOrLessonCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{course.duration || '6 Hours'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions trong Popover */}
            <div className="flex flex-col gap-2.5 mt-auto pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCardClick}
                className="w-full py-2 px-3 bg-[#1a56db] hover:bg-[#1545b3] text-white text-xs font-bold rounded-[6px] transition-colors text-center cursor-pointer shadow-sm"
              >
                Xem chi tiết khóa học
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`inline-flex items-center gap-1 text-[12px] font-medium transition-colors cursor-pointer ${
                    isWishlisted ? 'text-[#ff5252]' : 'text-slate-500 hover:text-[#ff5252]'
                  }`}
                >
                  <Heart
                    size={14}
                    fill={isWishlisted ? '#ff5252' : 'none'}
                    color={isWishlisted ? '#ff5252' : 'currentColor'}
                  />
                  <span>{isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}</span>
                </button>
                <span className="text-[16px] font-extrabold text-[#273044]">
                  {course.isContact || course.price === 'Liên hệ'
                    ? 'Liên hệ'
                    : course.isFree || course.price === 'Miễn phí'
                      ? 'Miễn phí'
                      : course.price}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
