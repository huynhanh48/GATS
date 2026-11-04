import React from 'react';
import { Bell, Info } from 'lucide-react';

/**
 * CourseNoticeTab - Tab 4: Bảng thông báo từ giảng viên
 */
export default function CourseNoticeTab() {
  const notices = [
    {
      id: 1,
      date: '10 Tháng 9, 2026',
      title: 'Cập nhật tài liệu thực hành và bộ prompt mẫu phiên bản mới',
      content:
        'Chào các bạn học viên, toàn bộ tài liệu hướng dẫn và kho prompt nâng cao đã được cập nhật phiên bản mới nhất tại mục đính kèm của Chương 2. Các bạn hãy tải về để thực hành theo nhé!',
    },
    {
      id: 2,
      date: '01 Tháng 9, 2026',
      title: 'Lịch giải đáp trực tiếp và chia sẻ case study cùng chuyên gia',
      content:
        'Buổi chia sẻ trực tiếp (Live Q&A) tiếp theo sẽ diễn ra vào tối thứ 6 hàng tuần. Link tham gia Zoom sẽ được gửi qua email học viên và thông báo trên cộng đồng GATS.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
          <Bell size={18} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#273044]">
          Bảng thông báo từ giảng viên
        </h2>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="p-5 sm:p-6 bg-white border border-slate-200 rounded-[10px] shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[11px] font-bold text-[#1a56db] bg-blue-50 px-2.5 py-0.5 rounded-[4px]">
                {notice.date}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#273044] mb-2">
              {notice.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {notice.content}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-[10px] flex items-start gap-3 text-xs text-slate-600">
        <Info size={16} className="text-[#1a56db] shrink-0 mt-0.5" />
        <span>
          Mọi thắc mắc hoặc yêu cầu hỗ trợ đặc biệt, học viên có thể gửi tin nhắn trực tiếp cho ban quản trị học viện qua hòm thư hỗ trợ.
        </span>
      </div>
    </div>
  );
}
