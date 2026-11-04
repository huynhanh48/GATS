import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/modules/auth';
import { resolveMediaUrl } from '@/shared/utils/media';

export default function Profile() {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.userName || user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '0988888888',
        address: user.address || 'TP. Hồ Chí Minh, Việt Nam',
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const avatarUrl = resolveMediaUrl(
    user?.avatar || user?.avatarUrl || user?.image,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name || 'User')}`
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-black text-[#273044]">
          Thông tin cá nhân
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý và cập nhật thông tin hồ sơ tài khoản GATS Academy của bạn.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold rounded-[8px] border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Đã lưu và cập nhật thông tin cá nhân thành công!</span>
        </div>
      )}

      {/* Avatar Preview Section */}
      <div className="flex items-center gap-4 p-4 rounded-[8px] bg-slate-50/80 border border-slate-200/60">
        <img
          src={avatarUrl}
          alt={formData.name || 'Avatar'}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
        />
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-[#273044]">
            {formData.name || 'Học viên GATS'}
          </h4>
          <p className="text-xs text-slate-400">
            {formData.email || 'hocvien@gats.vn'}
          </p>
          <span className="inline-block px-2.5 py-0.5 rounded-[4px] bg-blue-50 text-[#1a56db] text-[10px] font-bold uppercase tracking-wider">
            {user?.role || 'Học viên chính thức'}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#273044] mb-1.5">
              Họ và tên
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[8px] text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all bg-white"
                placeholder="Nhập họ và tên..."
              />
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#273044] mb-1.5">
              Email tài khoản
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[8px] text-xs sm:text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                placeholder="Email đăng ký..."
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#273044] mb-1.5">
              Số điện thoại
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[8px] text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all bg-white"
                placeholder="Nhập số điện thoại..."
              />
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#273044] mb-1.5">
              Địa chỉ liên hệ
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-[8px] text-xs sm:text-sm text-[#273044] focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all bg-white"
                placeholder="Nhập địa chỉ..."
              />
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a56db] hover:bg-[#1545b3] active:bg-[#0f348e] text-white text-xs sm:text-sm font-bold rounded-[8px] transition-all shadow-2xs cursor-pointer"
          >
            <Save size={16} />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
