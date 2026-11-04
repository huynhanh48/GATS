import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';

export default function Notifications() {
  const notifs = [
    { id: 1, title: 'Khai giảng lớp React 19', content: 'Lớp học React 19 Thực chiến sẽ bắt đầu vào 19h30 thứ Hai tuần tới.', time: '2 giờ trước', isRead: false },
    { id: 2, title: 'Đơn hàng đã được xác nhận', content: 'Đơn hàng ORD-8942 của bạn đã được tiếp nhận thành công.', time: '1 ngày trước', isRead: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#273044]">Thông báo</h2>
        </div>
        <button className="text-xs font-bold text-[#1a56db] flex items-center gap-1.5 hover:underline cursor-pointer">
          <CheckCheck size={14} /> <span>Đánh dấu</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-[8px] border transition-colors flex items-start gap-3.5 ${n.isRead ? 'bg-white border-slate-200/80 shadow-2xs' : 'bg-blue-50/40 border-blue-200/80 shadow-2xs'
              }`}
          >
            <div className={`p-2 rounded-[6px] shrink-0 ${n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-[#1a56db] text-white'}`}>
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-xs sm:text-sm text-[#273044]">{n.title}</h3>
                <span className="text-[11px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
