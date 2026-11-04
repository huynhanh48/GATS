import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, ShoppingBag, BookOpen, Bell, Heart, LogOut } from 'lucide-react';
import { useAuthStore } from '@/modules/auth';
import { resolveMediaUrl } from '@/shared/utils/media';

export default function AccountLayout() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: '/account/profile', label: 'Thông tin cá nhân', icon: User },
    { to: '/account/orders', label: 'Lịch sử đơn hàng', icon: ShoppingBag },
    { to: '/account/my-courses', label: 'Khóa học của tôi', icon: BookOpen },
    { to: '/account/notifications', label: 'Thông báo', icon: Bell },
    { to: '/wishlist', label: 'Danh sách yêu thích', icon: Heart },
  ];

  const userName = user?.userName || user?.name || user?.fullName || 'Học viên GATS';
  const userEmail = user?.email || 'hocvien@gats.vn';
  const avatarUrl = resolveMediaUrl(
    user?.avatar || user?.avatarUrl || user?.image,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`
  );

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-80px)] py-6 sm:py-8 flex flex-col">
      <div className="container flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-1">
          {/* Account Sidebar (4 Cột trên Desktop, kéo dài Full Height) */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col">
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between h-full space-y-6">
              <div className="space-y-6">
                {/* User Header Profile Card */}
                <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                  <div className="overflow-hidden min-w-0">
                    <h3 className="font-extrabold text-[#273044] text-sm truncate">
                      {userName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-[#1a56db] text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#1a56db]'
                          }`
                        }
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              {/* Logout Button anchored at bottom */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[8px] text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area (8 Cột trên Desktop, kéo dài Full Height) */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0 flex flex-col">
            <div className="bg-white rounded-[10px] border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex-1 flex flex-col">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
