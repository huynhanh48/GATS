import React from 'react';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * CourseGradeTab - Tab 6: Đánh giá & Cấp chứng chỉ
 */
export default function CourseGradeTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
          <Award size={18} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044]">
          Tiêu chuẩn đánh giá và Chứng chỉ hoàn thành
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Điều kiện hoàn thành */}
        <div className="p-6 bg-white border border-slate-200 rounded-[10px] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#1a56db] font-bold text-base">
            <CheckCircle2 size={20} />
            <h3>Điều kiện nhận chứng chỉ</h3>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Hoàn thành tối thiểu 80% thời lượng các bài giảng video.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Đạt điểm số từ 70% trở lên tại bài kiểm tra trắc nghiệm cuối khóa.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Nộp bài tập thực hành ứng dụng (Final Mini Project).</span>
            </li>
          </ul>
        </div>

        {/* Quyền lợi chứng chỉ */}
        <div className="p-6 bg-white border border-slate-200 rounded-[10px] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-[#10b981] font-bold text-base">
            <ShieldCheck size={20} />
            <h3>Quyền lợi và Giá trị chứng nhận</h3>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Chứng chỉ điện tử có mã định danh QR Code xác thực tính minh bạch.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Dễ dàng đính kèm vào hồ sơ LinkedIn, CV tuyển dụng chuyên nghiệp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] mt-2 shrink-0" />
              <span>Được ghi nhận năng lực trong mạng lưới học viên GATS Academy.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
