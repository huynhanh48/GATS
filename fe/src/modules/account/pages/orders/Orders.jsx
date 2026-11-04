import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function Orders() {
  const orders = [
    { id: 'ORD-8942', date: '08/09/2026', total: '450.000đ', status: 'Đang xử lý', items: 'Bộ Giáo Trình GATS Pro 2026' },
    { id: 'ORD-7721', date: '25/08/2026', total: '1.200.000đ', status: 'Hoàn thành', items: 'Khóa học React 19 Thực chiến' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#273044]">
            Lịch sử đơn hàng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi trạng thái các đơn hàng giáo trình và khóa học của bạn.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[8px] border border-slate-200/80">
        <table className="w-full text-left text-xs sm:text-sm text-slate-600">
          <thead className="bg-slate-50 text-[#273044] font-bold border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-4">Mã đơn</th>
              <th className="py-3.5 px-4">Ngày đặt</th>
              <th className="py-3.5 px-4">Sản phẩm</th>
              <th className="py-3.5 px-4">Tổng tiền</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-[#273044]">{order.id}</td>
                <td className="py-3.5 px-4">{order.date}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{order.items}</td>
                <td className="py-3.5 px-4 font-bold text-[#1a56db]">{order.total}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    order.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-[#1a56db] font-bold transition-colors"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
