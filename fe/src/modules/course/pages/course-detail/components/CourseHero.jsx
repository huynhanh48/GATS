import React, { useState } from 'react';
import { Star, Play, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CourseHero - Phần đầu trang chi tiết khóa học chuẩn template Timeless
 * - Bên trái: Chuyên mục, Huy hiệu NEW (cách ra một chút), Tiêu đề H1, Mô tả ngắn (Show more/less), Giảng viên, Học viên, Đánh giá
 * - Bên phải: Ảnh Thumbnail chuẩn 16:9 với nút Play Preview nếu có
 */
export default function CourseHero({ course, onPlayPreview }) {
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!course) return null;

  const categoryName = course.category || course.raw?.category?.name || 'Khóa học GATS';
  const instructorName = course.instructor || course.raw?.author?.userName || 'GATS Academy';
  const instructorAvatar =
    course.instructorAvatar ||
    course.raw?.author?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  const studentsCount = course.students || course.raw?.stats?.enrollmentCount || 0;
  const ratingValue = course.rating || course.raw?.stats?.averageRating || 5.0;
  const ratingCount = course.raw?.stats?.ratingCount || 0;

  const description = course.description || '';
  const isLongDesc = description.length > 220;
  const displayDesc = isLongDesc && !showFullDesc
    ? `${description.slice(0, 220)}...`
    : description;

  return (
    <div className="bg-white border-b mb-16 border-slate-200/90 py-10 lg:py-16">
      <div className="container ">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cột trái: Thông tin chính của khóa học (7 cột) */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Chuyên mục và Huy hiệu NEW cách ra một khoảng vừa phải */}
            <div className="flex items-center gap-3.5 mb-3.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 hover:text-[#1a56db] transition-colors">
                {categoryName}
              </span>
              <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#10b981] text-white tracking-wider uppercase shadow-2xs">
                NEW
              </span>
            </div>

            {/* Tiêu đề H1 */}
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#273044] leading-tight tracking-tight mb-4">
              {course.title}
            </h1>

            {/* Đoạn mô tả ngắn */}
            {description && (
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                <span>{displayDesc}</span>
                {isLongDesc && (
                  <button
                    type="button"
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1a56db] hover:text-[#1545b3] ml-1.5 cursor-pointer underline"
                  >
                    <span>{showFullDesc ? 'Thu gọn' : 'Xem thêm'}</span>
                    {showFullDesc ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            )}

            {/* Hàng thông tin Giảng viên, Học viên và Đánh giá */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 mt-auto">
              {/* Giảng viên */}
              <div className="flex items-center gap-3">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium leading-none mb-1">
                    Giảng viên
                  </span>
                  <span className="block text-xs sm:text-sm font-bold text-[#273044]">
                    {instructorName}
                  </span>
                </div>
              </div>

              {/* Số lượng học viên */}
              <div className="border-l border-slate-200 pl-6 hidden sm:block">
                <span className="block text-sm sm:text-base font-bold text-[#273044] leading-none mb-1">
                  {studentsCount.toLocaleString('vi-VN')}
                </span>
                <span className="block text-[11px] text-slate-400 font-medium">
                  Học viên đăng ký
                </span>
              </div>

              {/* Đánh giá sao */}
              <div className="border-l border-slate-200 pl-6 flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={
                        i < Math.floor(Number(ratingValue))
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }
                    />
                  ))}
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#273044] mr-1">
                    {Number(ratingValue).toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({ratingCount} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Khung ảnh đại diện / Video Preview (5 cột) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-video rounded-[10px] overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />

              {/* Nút Play Preview nếu có hoặc mở modal xem thử */}
              <button
                type="button"
                onClick={onPlayPreview}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/95 text-[#1a56db] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                aria-label="Xem video giới thiệu"
              >
                <Play size={22} className="ml-1 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
