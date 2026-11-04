import React from 'react';
import { Building2, MapPin, PhoneCall } from 'lucide-react';

export default function RealEstate() {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-semibold tracking-wider text-[#407bff] bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
          Hệ sinh thái Bất động sản GATS
        </span>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bất động sản và Mặt bằng học viện</h1>
        <p className="text-slate-500 text-sm">
          Thông tin cơ sở vật chất, hệ thống phòng học thông minh, co-working space và văn phòng đào tạo trực thuộc GATS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-64 bg-slate-100 flex items-center justify-center text-slate-400">
            <Building2 size={64} />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Trụ sở Đào tạo Trung tâm: GATS Landmark</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
              <MapPin size={16} className="text-red-500" /> Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Tổ hợp 5 tầng hiện đại gồm phòng lab thực hành, hội trường 300 chỗ và khu trải nghiệm công nghệ.
            </p>
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
              <PhoneCall size={14} /> Đăng ký tham quan cơ sở
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-64 bg-slate-100 flex items-center justify-center text-slate-400">
            <Building2 size={64} />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Khu Phức hợp Công nghệ: GATS Tech Park</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
              <MapPin size={16} className="text-red-500" /> Khu Công nghệ cao, TP. Thủ Đức
            </p>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Môi trường làm việc thực chiến kết nối các doanh nghiệp công nghệ và học viên xuất sắc.
            </p>
            <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
              <PhoneCall size={14} /> Đăng ký tham quan cơ sở
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
