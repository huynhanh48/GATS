import React from 'react';
import { Users, BookOpen, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Tổng học viên', value: '3,842', change: '+12.5%', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { title: 'Khóa học hoạt động', value: '24', change: '+2 mới', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Đơn hàng tháng này', value: '418', change: '+18.2%', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
    { title: 'Doanh thu (VND)', value: '1.240.000.000đ', change: '+24.8%', icon: DollarSign, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bảng điều khiển tổng quan</h2>
          <p className="text-xs text-slate-500">Số liệu thời gian thực của hệ thống GATS Academy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{s.title}</span>
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900">{s.value}</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Đơn hàng mới nhất</h3>
          <p className="text-xs text-slate-400">Danh sách các giao dịch phát sinh gần đây.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Hoạt động học tập gần đây</h3>
          <p className="text-xs text-slate-400">Tương tác và tiến độ bài học của học viên.</p>
        </div>
      </div>
    </div>
  );
}
