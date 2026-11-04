import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, QrCode, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CoursePaymentInstruction() {
  return (
    <div className="py-12 px-4 max-w-3xl mx-auto">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Quay lại danh sách khóa học
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Hướng dẫn thanh toán khóa học</h1>
        <p className="text-slate-500 text-sm mb-6">
          Chuyển khoản theo thông tin bên dưới hoặc quét mã QR để tự động kích hoạt tài khoản.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <QrCode size={96} className="text-slate-800 mb-2" />
            <span className="text-xs text-slate-400">Quét mã VietQR</span>
          </div>
          <div className="flex-1 space-y-3 text-sm">
            <div>
              <span className="text-slate-400 text-xs uppercase block">Ngân hàng:</span>
              <span className="font-semibold text-slate-800">MB Bank (Ngân hàng Quân Đội)</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase block">Số tài khoản:</span>
              <span className="font-mono font-bold text-lg text-[#407bff]">0988889999</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase block">Chủ tài khoản:</span>
              <span className="font-semibold text-slate-800">CONG TY CP GATS ACADEMY</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase block">Cú pháp chuyển khoản:</span>
              <span className="font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded text-xs font-semibold">
                GATS [Số điện thoại] [Mã khóa học]
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-sm mb-6">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <span>Hệ thống tự động kích hoạt khóa học trong vòng 3 đến 5 phút sau khi nhận được thanh toán.</span>
        </div>

        <Link
          to="/account/my-courses"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#407bff] hover:bg-[#2d69ec] text-white font-medium text-sm transition-colors cursor-pointer"
        >
          <CheckCircle size={16} /> Kiểm tra khóa học đã kích hoạt
        </Link>
      </div>
    </div>
  );
}
