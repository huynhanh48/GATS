"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, X } from "lucide-react";
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

  useEffect(() => {
    if (status !== "anonymous" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "login") return;
    params.delete("auth");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    openAuthModal("login");
  }, [status, openAuthModal]);

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
        #xb-header-area .xb-help_desk { display: flex; align-items: center; flex-wrap: nowrap; gap: 6px; white-space: nowrap; }
        #xb-header-area .xb-help_desk img { display: block; flex: 0 0 auto; }
        #xb-header-area .xb-help_desk p { display: block; margin: 0; line-height: 30px; }
        #xb-header-area .xb-header { background: #fff !important; }
        #xb-header-area .language_dropdown { display: none !important; }
        #xb-header-area .header-right { display: flex; align-items: center; flex-wrap: nowrap; gap: 0 !important; }
        #xb-header-area .header-search-btn {
          min-height: 42px;
          margin-right: 16px;
          padding: 0 18px 0 0 !important;
          position: relative;
          color: #170006 !important;
          font-size: 16px;
          white-space: nowrap;
        }
        #xb-header-area .header-search-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 0;
          width: 1px;
          height: 32px;
          background: #d0c4c4;
          transform: translateY(-50%);
        }
        #xb-header-area .header-search-btn span { font-size: 16px !important; font-weight: 400 !important; }
        #xb-header-area .edubost-header-cart {
          width: 42px;
          height: 42px;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0 !important;
          color: #170006 !important;
        }
        #xb-header-area .edubost-header-cart:hover { color: #60060f !important; }
        #xb-header-area .edubost-header-cart > i { font-size: 22px; line-height: 1; }
        #xb-header-area .edubost-cart-count {
          display: flex !important;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          background: #60060f !important;
          font-size: 10px;
          line-height: 17px;
        }
        #xb-header-area .edubost-header-profile { margin-left: 10px; }
        #xb-header-area .edubost-header-profile > div {
          width: 44px !important;
          height: 44px !important;
          border: 0 !important;
        }
        #xb-header-area .edubost-header-login {
          min-width: 112px;
          height: 44px;
          margin-left: 10px;
          padding: 0 20px;
          border-radius: 4px !important;
          background: #60060f !important;
          color: #fff !important;
          font-size: 15px;
        }
        #xb-header-area .edubost-header-login:hover { background: #4b040c !important; }
        .edubost-profile-menu {
          width: 246px !important;
          padding: 8px !important;
          border: 1px solid #eee !important;
          border-radius: 8px !important;
          background: #fff !important;
          box-shadow: 0 12px 32px rgba(23,6,15,.14) !important;
        }
        .edubost-profile-menu [role="menuitem"] {
          min-height: 46px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 11px 12px !important;
          border-radius: 6px !important;
          color: #170006 !important;
          font-size: 15px;
          font-weight: 600;
        }
        .edubost-profile-menu [role="menuitem"]:hover,
        .edubost-profile-menu [role="menuitem"]:focus { background: rgba(96,6,15,.07) !important; color: #60060f !important; }
        .edubost-profile-menu [role="menuitem"] i { width: 18px; color: #60060f; text-align: center; font-size: 17px; }
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
        @media (max-width: 767px) {
          #xb-header-area .header-top { display: flex; align-items: center; min-height: 62px; }
          #xb-header-area .xb-info { display: none !important; }
          #xb-header-area .header-search-btn { margin-right: 8px; padding-right: 10px !important; }
          #xb-header-area .header-search-btn span { display: none !important; }
          #xb-header-area .edubost-header-cart { width: 38px; height: 38px; }
          #xb-header-area .edubost-header-profile { margin-left: 6px; }
          #xb-header-area .edubost-header-profile > div { width: 40px !important; height: 40px !important; }
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
                  <img src={img("logo/logo-gats.svg")} alt="EDUGATS" />
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
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M10.5 3.75H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.5 6H12.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.75 8.625C15.75 12.5625 12.5625 15.75 8.625 15.75C4.6875 15.75 1.5 12.5625 1.5 8.625C1.5 4.6875 4.6875 1.5 8.625 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.5 16.5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden xl:inline text-sm font-medium">Tìm kiếm</span>
                </button>

                <Link
                  href="/cart"
                  className="edubost-header-cart relative flex items-center justify-center p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#FF6B00] transition-colors"
                  aria-label="Giỏ hàng"
                >
                  <i className="far fa-shopping-cart" aria-hidden="true" />
                  {items.length > 0 && (
                    <span className="edubost-cart-count absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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

                {status === "loading" ? (
                  <div className="w-11 h-11 ml-[10px] invisible" aria-hidden="true" />
                ) : status === "authenticated" && user ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="edubost-header-profile flex items-center gap-2 cursor-pointer focus:outline-none">
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
                      className="edubost-profile-menu z-50"
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/profile"><i className="far fa-user-circle" /><span>Hồ sơ cá nhân</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile?tab=courses"><i className="far fa-book-open" /><span>Khóa học của tôi</span></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/cart"><i className="far fa-shopping-cart" /><span>Giỏ hàng</span></Link>
                      </DropdownMenuItem>
                      {canTeach && teachingHref && (
                        <DropdownMenuItem asChild>
                          <a
                            href={teachingHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="far fa-shield-check" /><span>Trang quản trị / Giảng dạy</span>
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => logout()}
                        className="text-red-600 cursor-pointer"
                      >
                        <i className="far fa-sign-out" /><span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    type="button"
                  onClick={() => openAuthModal("login")}
                    className="edubost-header-login hidden sm:inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
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
                    src={img("logo/logo-gats.svg")}
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
                        src={img("logo/logo-gats-white.svg")}
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
