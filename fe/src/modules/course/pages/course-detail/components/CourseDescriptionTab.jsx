import React from 'react';
import { Check, Target, BookOpen } from 'lucide-react';

/**
 * CourseDescriptionTab - Tab 1: Mô tả chi tiết khóa học
 * - Tiêu đề phụ giới thiệu tổng quan
 * - Khung "Bạn sẽ học được gì" (What you'll learn) đồng bộ từ learningOutcomes của Backend
 * - "Đối tượng khóa học" (What is the target audience)
 * - Đoạn văn chi tiết
 */
export default function CourseDescriptionTab({ course }) {
  if (!course) return null;

  const outcomes = course.raw?.learningOutcomes || [];
  const description = course.description || '';

  // Fallback learning outcomes nếu khóa học chưa cấu hình riêng
  const displayOutcomes = outcomes.length > 0
    ? outcomes.map((o) => o.content)
    : [
        'Nắm vững tư duy và quy trình làm việc tự động hóa với AI hiện đại',
        'Làm chủ kỹ năng Prompt Engineering chuyên sâu giải quyết bài toán phức tạp',
        'Ứng dụng AI Agent tối ưu hóa hiệu suất công việc thực tế từ 3 đến 5 lần',
        'Tự xây dựng hệ thống quản lý tri thức và quy trình tự động hóa cá nhân',
        'Biết cách đánh giá, kiểm chứng và chuẩn hóa dữ liệu đầu ra của các mô hình AI',
        'Đóng gói kinh nghiệm và workflow thành công cụ có thể tái sử dụng lâu dài',
      ];

  return (
    <div className="space-y-8 text-[#273044]">
      {/* Tiêu đề phần tổng quan */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044] mb-4">
          Tổng quan khóa học và Lộ trình đào tạo
        </h2>
        <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
          {description}
        </div>
      </div>

      {/* Khung What you'll learn (Bạn sẽ học được gì) */}
      <div className="bg-[#f8fafc] border border-slate-200/90 rounded-[10px] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1a56db] flex items-center justify-center">
            <BookOpen size={18} />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#273044]">
            Bạn sẽ học được gì
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayOutcomes.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#10b981]/15 text-[#059669] flex items-center justify-center">
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="text-xs sm:text-sm text-slate-700 leading-normal font-medium">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Đối tượng khóa học (Target Audience) */}
      <div className="border-t border-slate-100 pt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Target size={18} />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#273044]">
            Đối tượng phù hợp với khóa học
          </h3>
        </div>

        <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] mt-2 shrink-0" />
            <span>Chuyên viên, quản lý và người đi làm muốn ứng dụng AI để giải phóng thời gian làm việc hàng ngày.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] mt-2 shrink-0" />
            <span>Chủ doanh nghiệp vừa và nhỏ, người làm việc tự do (Freelancer) tìm kiếm giải pháp tối ưu chi phí vận hành.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] mt-2 shrink-0" />
            <span>Bất kỳ ai muốn nâng cao năng lực cạnh tranh trong kỷ nguyên trí tuệ nhân tạo phát triển vượt bậc.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
