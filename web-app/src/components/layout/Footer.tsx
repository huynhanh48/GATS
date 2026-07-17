import React from "react";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const footerLinks = [
  {
    title: "Khóa học",
    links: ["Prompt Engineering", "Điều phối đa tác vụ", "Hệ thống bộ nhớ AI", "Bảo mật cấp doanh nghiệp"],
  },
  {
    title: "Tài nguyên",
    links: ["Tài liệu hướng dẫn", "API Reference", "Mẫu trợ lý AI (Templates)", "Blog & Cập nhật"],
  },
  {
    title: "Ứng dụng",
    links: ["Chăm sóc khách hàng", "Bán hàng & Marketing", "Tự động hóa quy trình", "Phân tích dữ liệu"],
  },
  {
    title: "Về chúng tôi",
    links: ["Giới thiệu", "Tuyển dụng", "Liên hệ hợp tác", "Chính sách bảo mật", "Điều khoản dịch vụ"],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/20 pt-20 pb-10 relative z-20">
      {/* Nền lưới nhạt cho Footer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Cột Logo & Giới thiệu */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">GATS Academy</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 pr-4">
              GATS Academy đồng hành cùng bạn và doanh nghiệp ứng dụng AI để tạo ra, triển khai và quản lý các trợ lý thông minh nhằm tối ưu hóa hiệu suất làm việc ở quy mô lớn.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
              </Link>
            </div>
          </div>

          {/* Các cột Links */}
          {footerLinks.map((column, i) => (
            <div key={i} className="lg:col-span-1">
              <h4 className="font-semibold text-foreground mb-6 text-sm">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Các Badge chứng chỉ */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <div className="w-12 h-12 rounded-full border border-border/30 bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/70 tracking-wider">
            PCI DSS
          </div>
          <div className="w-12 h-12 rounded-full border border-border/30 bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/70 tracking-wider">
            GDPR
          </div>
          <div className="w-12 h-12 rounded-full border border-border/30 bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/70 tracking-wider">
            ISO
          </div>
        </div>

        {/* Dải dưới cùng */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/20 gap-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">GATS ACADEMY</span>
            <p className="text-muted-foreground text-xs font-medium text-center md:text-left">
              © {new Date().getFullYear()} GATS Academy. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2 rounded-full border border-border/50 text-xs font-semibold hover:bg-white/5 transition-colors">
              Đăng ký khóa học
            </button>
            <button className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors flex items-center gap-1">
              Học thử ngay
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
