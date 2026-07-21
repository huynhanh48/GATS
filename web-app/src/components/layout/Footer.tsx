import React from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const footerColumns: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Học tập",
    links: [
      { label: "Khóa học", href: "/courses" },
      { label: "Học tập của tôi", href: "/learning" },
      { label: "Blog", href: "/posts" },
      { label: "Giỏ hàng", href: "/cart" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Hồ sơ", href: "/profile" },
      { label: "Đơn hàng", href: "/profile?tab=orders" },
      { label: "Quên mật khẩu", href: "/forgot-password" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Chính sách hoàn tiền", href: "/refund" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/20 pt-20 pb-10 relative z-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">GATS Academy</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 pr-4">
              GATS Academy đồng hành cùng bạn ứng dụng AI để học tập, triển khai
              và vận hành các giải pháp thông minh trong công việc thực tế.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="lg:col-span-1">
              <h4 className="font-semibold text-foreground mb-6 text-sm">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/20 gap-4">
          <p className="text-muted-foreground text-xs font-medium text-center md:text-left">
            © {new Date().getFullYear()} GATS Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="px-5 py-2 rounded-full border border-border/50 text-xs font-semibold hover:bg-white/5 transition-colors"
            >
              Khám phá khóa học
            </Link>
            <Link
              href="/learning"
              className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors"
            >
              Vào học
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
