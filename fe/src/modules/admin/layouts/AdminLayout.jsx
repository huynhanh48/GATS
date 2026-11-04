import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GraduationCap, Package, ShoppingCart,
  Mail, FileText, FolderTree, Image, Users, Ticket, Activity,
  Search, Truck, Warehouse, DollarSign, Send, BarChart2, LogOut, Menu, X
} from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuSections = [
    {
      title: 'Tổng quan và Phân tích',
      items: [
        { to: '/admin/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
        { to: '/admin/revenue', label: 'Doanh thu và Tài chính', icon: DollarSign },
        { to: '/admin/reports', label: 'Báo cáo hiệu suất', icon: BarChart2 },
      ],
    },
    {
      title: 'Đào tạo và Học viên',
      items: [
        { to: '/admin/courses', label: 'Quản lý khóa học', icon: BookOpen },
        { to: '/admin/enrollments', label: 'Đăng ký học viên', icon: GraduationCap },
        { to: '/admin/users', label: 'Người dùng và Tài khoản', icon: Users },
      ],
    },
    {
      title: 'Bán hàng và Kho vận',
      items: [
        { to: '/admin/products', label: 'Sản phẩm', icon: Package },
        { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
        { to: '/admin/vouchers', label: 'Mã giảm giá (Voucher)', icon: Ticket },
        { to: '/admin/warehouse', label: 'Quản lý kho', icon: Warehouse },
        { to: '/admin/shipping', label: 'Cấu hình giao vận', icon: Truck },
      ],
    },
    {
      title: 'Nội dung và Truyền thông',
      items: [
        { to: '/admin/posts', label: 'Bài viết Blog', icon: FileText },
        { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
        { to: '/admin/media', label: 'Thư viện Media', icon: Image },
        { to: '/admin/newsletter', label: 'Bản tin Newsletter', icon: Send },
        { to: '/admin/contacts', label: 'Liên hệ khách hàng', icon: Mail },
      ],
    },
    {
      title: 'Hệ thống và Giám sát',
      items: [
        { to: '/admin/logs', label: 'Nhật ký hệ thống (Logs)', icon: Activity },
        { to: '/admin/search-logs', label: 'Nhật ký tìm kiếm', icon: Search },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">GATS</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#407bff] text-white rounded">ADMIN</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </p>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#407bff] text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`
                      }
                    >
                      <Icon size={16} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white py-2 px-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
            Quay lại trang người dùng
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-semibold text-slate-800 text-sm md:text-base">
              Hệ thống Quản trị GATS ACADEMY
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#407bff] text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
