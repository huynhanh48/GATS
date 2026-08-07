"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, X } from "lucide-react";
import { EdubostOriginalStyles } from "./EdubostOriginalStyles";
import { SearchModal } from "@/components/layout/SearchModal";
import { useAuth, useAuthModal } from "@/hooks/useAuth";
import { useCart } from "@/components/providers/CartProvider";
import { resolveMediaUrl } from "@/lib/media/url";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const img = (path: string) => `/edubost-reference/img/${path}`;

type MenuItem = {
  label: string;
  href: string;
};

const navItems: MenuItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Khóa học", href: "/courses" },
  { label: "Tri thức AI", href: "/posts" },
  { label: "Liên hệ", href: "/contact" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EdubostHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("Tiếng Việt");

  const { user, logout, status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { items } = useCart();

  const canTeach = Boolean(
    user?.roles?.includes("instructor") || user?.roles?.includes("admin"),
  );

  const teachingHref =
    user
      ? typeof window !== "undefined" &&
        window.location.hostname === "localhost"
        ? "http://localhost:9000/course"
        : "https://admin.gats.vn/course"
      : undefined;

  return (
    <>
      <EdubostOriginalStyles />
      <style>{`
        #xb-header-area {
          --color-secondary: #60060f;
          --color-violet: #60060f;
        }
        body, .body_wrap, main { overflow: visible !important; }
        #xb-header-area.header-area { background: #fff !important; border: 0 !important; box-shadow: none !important; }
        #xb-header-area .header-top_wrap { background-color: #60060f !important; }
        #xb-header-area .header-top { background-color: #60060f !important; }
        #xb-header-area .header-top, #xb-header-area .header-top a, #xb-header-area .header-top p { color: #fff !important; }
        #xb-header-area .xb-header { background: #fff !important; }
        #xb-header-area .language_dropdown { display: none !important; }
        #xb-header-area .main-menu > ul > li > a { color: #170006 !important; }
        #xb-header-area .main-menu > ul > li.active > a,
        #xb-header-area .main-menu > ul > li > a:hover { color: #60060f !important; }
        @media (min-width: 992px) {
          #xb-header-area .main-menu__wrap { display: flex !important; }
          #xb-header-area .main-menu.collapse {
            display: flex !important;
            visibility: visible !important;
          }
          #xb-header-area .header-bar-mobile { display: none !important; }
        }
        @media (max-width: 991px) {
          #xb-header-area .header-right { display: flex !important; align-items: center; gap: 12px; }
          #xb-header-area .main-menu__wrap { display: none !important; }
        }
      `}</style>
      <header
        id="xb-header-area"
        className="header-area is-sticky"
      >
        <div className="header-top_wrap">
          <div className="container">
            <div className="header-top ul_li_between">
              <div className="xb-help_desk">
                <img src={img("icon/hero_top-icon.png")} alt="" />
                <p>
                  Tư vấn: <span>+1 (415) 555-0132</span>
                </p>
              </div>
              <div className="xb-info">
                <ul className="ul_li align-items-end">
                  <li>Dành cho:</li>
                  <li>
                    <Link href="/courses">Học viên</Link>
                  </li>
                  <li>
                    <Link href="/about">Giảng viên</Link>
                  </li>
                  <li>
                    <Link href="/about">Cựu học viên</Link>
                  </li>
                  <li>
                    <Link href="/about">Doanh nghiệp</Link>
                  </li>
                  <li>
                    <Link href="/posts">Cộng đồng</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="xb-header">
          <div className="container">
            <div className="header__wrap ul_li_between">
              <div className="header-logo">
                <Link href="/">
                  <img src={img("logo/logo.svg")} alt="GATS Academy" />
                </Link>
              </div>
              <div className="main-menu__wrap ul_li navbar navbar-expand-lg">
                <nav
                  className="main-menu collapse navbar-collapse"
                  aria-label="Điều hướng chính"
                >
                  <ul>
                    {navItems.map((item) => {
                      const active = isNavActive(pathname, item.href);
                      return (
                        <li
                          key={item.label}
                          className={active ? "active" : ""}
                        >
                          <Link href={item.href}>{item.label}</Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
              <div className="header-right ul_li flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="header-search-btn cursor-pointer bg-transparent border-0 p-0 text-slate-700 hover:text-[#FF6B00] transition-colors flex items-center gap-1.5"
                  aria-label="Tìm kiếm khóa học"
                >
                  <i className="far fa-search text-base" />
                  <span className="hidden xl:inline text-sm font-medium">Tìm kiếm</span>
                </button>

                <Link
                  href="/cart"
                  className="relative flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#FF6B00] transition-colors"
                  aria-label="Giỏ hàng"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>

                <div className="language_dropdown dropdown relative hidden sm:block">
                  <button
                    className="dropdown-toggle flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                    type="button"
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    aria-label={`Ngôn ngữ: ${currentLang}`}
                  >
                    <span className="flag">
                      <img src={img("icon/flag.png")} alt="" />
                    </span>
                    <span className="name text-sm font-medium">{currentLang}</span>
                  </button>
                  {langDropdownOpen && (
                    <div className="dropdown-menu show absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          setCurrentLang("Tiếng Việt");
                          setLangDropdownOpen(false);
                        }}
                      >
                        <img src={img("icon/flag.png")} alt="" className="w-4 h-3" />
                        Tiếng Việt
                      </button>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          setCurrentLang("English");
                          setLangDropdownOpen(false);
                        }}
                      >
                        <span className="text-xs font-bold w-4 text-center">EN</span>
                        English
                      </button>
                    </div>
                  )}
                </div>

                {status === "authenticated" && user ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
                      <div className="relative w-11 h-11 rounded-full bg-[#60060f] flex items-center justify-center text-white overflow-hidden">
                        {user.avatarUrl ? (
                          <img
                            src={resolveMediaUrl(user.avatarUrl)}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 bg-white dark:bg-slate-900 z-50"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=courses">Khóa học của tôi</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Hồ sơ cá nhân</Link>
                      </DropdownMenuItem>
                      {canTeach && teachingHref && (
                        <DropdownMenuItem asChild>
                          <a
                            href={teachingHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Trang quản trị / Giảng dạy
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="text-red-600 cursor-pointer"
                      >
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    type="button"
                  onClick={() => openAuthModal("login")}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#FF6B00] hover:bg-[#e05e00] transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Đăng nhập
                  </button>
                )}

                <div className="header-bar-mobile side-menu lg:hidden flex items-center">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="xb-nav-mobile cursor-pointer bg-transparent border-0 p-2 text-slate-800 dark:text-white flex items-center justify-center"
                    aria-label="Mở danh mục"
                  >
                    <i className="fal fa-bars text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-[#0B0F17] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src={img("logo/logo.svg")}
                    alt="GATS Academy"
                    className="h-8"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Đóng menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-4 text-base font-semibold">
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <div key={item.label} className="flex flex-col gap-2">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-1.5 transition-colors ${
                          active
                            ? "text-[#FF6B00] font-bold"
                            : "text-slate-800 dark:text-slate-200 hover:text-[#FF6B00]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              {status !== "authenticated" && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full py-2.5 rounded-lg font-semibold text-center text-white bg-[#FF6B00] hover:bg-[#e05e00] transition-colors"
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
              <div className="text-xs text-slate-500 text-center">
                Hotline hỗ trợ:{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  1900 633 888
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EdubostFooter() {
  return (
    <footer
      className="footer bg_img pos-rel pt-20"
      style={{ backgroundImage: `url(${img("bg/footer-bg.jpg")})` }}
    >
      <div className="xb-footer-wrap">
        <div className="container">
          <div className="footer-cta ul_li_between mb-35">
            <div className="xb-item--holder ul_li mt-30">
              <div className="xb-item--icon-avatar ul_li">
                <span>
                  <img src={img("icon/calling-icon01.png")} alt="" />
                </span>
                <div className="xb-item--avatar">
                  <img
                    src={img("footer/footer-avatar.png")}
                    alt="Đội ngũ tư vấn GATS"
                  />
                </div>
              </div>
              <div className="xb-item--content">
                Nếu bạn có câu hỏi, hãy đặt lịch trò chuyện miễn phí
                <br />
                cùng chuyên gia tư vấn của GATS Academy.
              </div>
            </div>
            <div className="xb-item--contact mt-30">
              <span>hoặc gọi hotline hỗ trợ</span>
              <h3>(+84) 888 888 888</h3>
            </div>
          </div>
        </div>
        <div className="xb-footer-main pt-70 pb-60">
          <div className="container">
            <div className="row mt-none-30">
              <div className="col-xl-3 col-lg-4 col-md-6 mt-30">
                <div className="footer-widget mt-10">
                  <div className="xb-item--logo mb-30">
                    <Link href="/">
                      <img
                        src={img("logo/logo_white.svg")}
                        alt="GATS Academy"
                      />
                    </Link>
                  </div>
                  <span className="xb-item--details">
                    Nền tảng đào tạo AI và Enterprise Workflow
                    <br />
                    thực chiến dành cho cá nhân
                    <br />
                    và doanh nghiệp Việt Nam.
                  </span>
                </div>
              </div>
              <FooterColumn
                title="Chương trình"
                links={[
                  ["Tất cả khóa học", "/courses"],
                  ["Lộ trình AI", "/courses"],
                  ["Workshop doanh nghiệp", "/contact"],
                  ["Hỗ trợ học viên", "/contact"],
                ]}
              />
              <FooterColumn
                title="Khám phá"
                links={[
                  ["Về GATS", "/about"],
                  ["Tri thức AI", "/posts"],
                  ["Liên hệ", "/contact"],
                  ["Cộng đồng", "/posts"],
                ]}
              />
              <FooterColumn
                title="Chính sách"
                links={[
                  ["Điều khoản", "/terms"],
                  ["Quyền riêng tư", "/privacy"],
                  ["Hoàn tiền", "/refund"],
                  ["Thanh toán", "/payment-policy"],
                ]}
              />
              <div className="col-xl-2 col-lg-4 col-md-6 mt-30">
                <div className="footer-widget">
                  <ul className="xb-item--links-btn list-unstyled">
                    <li>
                      <Link className="thm-btn" href="/courses">
                        khóa học
                      </Link>
                    </li>
                    <li>
                      <Link className="thm-btn" href="/posts">
                        bài viết
                      </Link>
                    </li>
                    <li>
                      <Link className="thm-btn" href="/about">
                        về GATS
                      </Link>
                    </li>
                    <li>
                      <Link className="thm-btn" href="/contact">
                        liên hệ
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom pb-25 pt-25">
          <div className="copyright text-center">
            <p>
              Copyright © 2026 <Link href="/">GATS Academy</Link>. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <div className="col-xl-2 col-lg-4 col-md-6 mt-30">
      <div className="footer-widget">
        <h3 className="xb-item--title">{title}</h3>
        <ul className="xb-item--links list-unstyled">
          {links.map(([label, href]) => (
            <li key={label}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function EdubostBreadcrumb({
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section
      className="breadcrumb bg_img ul_li"
      style={{ backgroundImage: `url(${img("bg/breadcrumb_bg.jpg")})` }}
    >
      <div className="container">
        <div className="breadcrumb__content text-center">
          <h1 className="breadcrumb__title">{title}</h1>
          {description ? (
            <p className="breadcrumb__desc">{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
