"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, X, ArrowUp, Menu } from "lucide-react";
import { EdubostOriginalStyles } from "./EdubostOriginalStyles";
import { SearchModal } from "@/components/layout/SearchModal";
import { useAuth, useAuthModal } from "@/hooks/useAuth";
import { useCart } from "@/components/providers/CartProvider";
import { resolveMediaUrl } from "@/lib/media/url";
import drawerStyles from "./MobileDrawer.module.css";
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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  // Sticky header animation states
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 120) {
        setIsSticky(true);
        if (currentScrollY > lastScrollY && currentScrollY > 180) {
          // Scrolling DOWN -> Slide UP & Hide
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling UP -> Slide DOWN & Show
          setIsVisible(true);
        }
      } else {
        setIsSticky(false);
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        html, body { max-width: 100%; overflow-x: clip !important; }
        .body_wrap { max-width: 100%; overflow-x: clip !important; }
        #xb-header-area.header-area { background: #fff !important; border: 0 !important; box-shadow: none !important; }
        #xb-header-area .header-top_wrap { width: 100%; background-color: #60060f !important; }
        #xb-header-area .header-top { background-color: transparent !important; }
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
        @media (min-width: 1024px) {
          #xb-header-area .main-menu__wrap { display: flex !important; }
          #xb-header-area .main-menu.collapse {
            display: flex !important;
            visibility: visible !important;
          }
          #xb-header-area .header-bar-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          #xb-header-area .header-right { display: flex !important; align-items: center; gap: 10px; }
          #xb-header-area .main-menu__wrap { display: none !important; }
          #xb-header-area .header-bar-mobile { display: flex !important; align-items: center; visibility: visible !important; opacity: 1 !important; }
          #xb-header-area .xb-nav-mobile { display: flex !important; align-items: center; justify-content: center; opacity: 1 !important; }
        }
        @media (max-width: 767px) {
          #xb-header-area { width: 100%; max-width: 100%; overflow-x: clip; }
          #xb-header-area .container { width: 100%; max-width: 100%; }
          #xb-header-area .header-top { display: flex; align-items: center; min-height: 62px; }
          #xb-header-area .header__wrap { width: 100%; flex-wrap: nowrap; gap: 8px; }
          #xb-header-area .header-logo { min-width: 0; flex: 1 1 auto; }
          #xb-header-area .header-logo img { display: block; width: clamp(168px, 45vw, 230px); height: auto !important; }
          #xb-header-area .header-right { min-width: 0; flex: 0 0 auto; }
          #xb-header-area .xb-info { display: none !important; }
          #xb-header-area .header-search-btn { margin-right: 4px; padding-right: 6px !important; }
          #xb-header-area .header-search-btn span { display: none !important; }
          #xb-header-area .edubost-header-cart { width: 38px; height: 38px; }
          #xb-header-area .edubost-header-profile { margin-left: 4px; }
          #xb-header-area .edubost-header-profile > div { width: 38px !important; height: 38px !important; }
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
        {/* Main Sticky Animated Header */}
        <div
          className={`xb-header ${
            isSticky
              ? `fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0 pointer-events-none"
                }`
              : "relative bg-white"
          }`}
        >
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

                {/* Profile Dropdown / Login Button (Desktop Only: hidden lg:flex) */}
                <div className="hidden lg:flex items-center ml-2">
                  {status === "loading" ? (
                    <div className="w-11 h-11 ml-[10px] invisible" aria-hidden="true" />
                  ) : status === "authenticated" && user ? (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="edubost-header-profile flex items-center gap-2 cursor-pointer focus:outline-none">
                        <div className="relative w-11 h-11 rounded-full bg-[#60060f] flex items-center justify-center text-white overflow-hidden shadow-sm">
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
                      className="edubost-header-login inline-flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Đăng nhập
                    </button>
                  )}
                </div>

                <div className="header-bar-mobile side-menu lg:hidden flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="xb-nav-mobile cursor-pointer bg-transparent border-0 p-1.5 text-[#170006] dark:text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                    aria-label="Mở danh mục"
                  >
                    <Menu className="w-6 h-6 text-[#170006] dark:text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isSticky && <div className="h-[80px] w-full pointer-events-none" aria-hidden="true" />}
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Mobile Drawer Navigation Modal */}
      {mobileMenuOpen && (
        <div className={`fixed inset-0 z-50 flex lg:hidden ${drawerStyles.root}`}>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={`relative ml-auto bg-white dark:bg-[#0B0F17] shadow-2xl z-10 ${drawerStyles.panel}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
          >
            <div className={drawerStyles.main}>
              <div className={`flex items-center justify-between border-b border-slate-100 dark:border-slate-800 ${drawerStyles.header}`}>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img
                    src={img("logo/logo-gats.svg")}
                    alt="GATS Academy"
                    className={drawerStyles.logo}
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

              {/* Navigation Links with Explicit Non-Blue Colors */}
              <nav className={`flex flex-col font-semibold mobile-drawer-nav ${drawerStyles.nav}`}>
                <style>{`
                  .mobile-drawer-nav a, .mobile-drawer-nav a:visited, .mobile-drawer-nav a:link {
                    text-decoration: none !important;
                  }
                `}</style>
                {navItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        color: active ? "#FF6B00" : "#170006",
                        backgroundColor: active ? "rgba(255, 107, 0, 0.1)" : undefined,
                      }}
                      className={`${drawerStyles.navLink} rounded-xl transition-all flex items-center justify-between ${
                        active
                          ? "!font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className={active ? "!text-[#FF6B00]" : "!text-[#170006] dark:!text-slate-100"}>
                        {item.label}
                      </span>
                      <i className={`far fa-chevron-right text-xs ${active ? "!text-[#FF6B00]" : "text-slate-400 opacity-60"}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile Section & Auth Action inside Mobile Menu Drawer */}
            <div className={`border-t border-slate-100 dark:border-slate-800 flex flex-col ${drawerStyles.footer}`}>
              {status === "authenticated" && user ? (
                <div className={`bg-[#170006] text-white rounded-2xl flex flex-col shadow-lg ${drawerStyles.accountCard}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full bg-[#60060f] flex items-center justify-center text-white overflow-hidden shrink-0 border-2 border-white/20">
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
                    <div className="min-w-0 overflow-hidden">
                      <h4 className={`font-bold text-white truncate ${drawerStyles.userName}`}>{user.userName}</h4>
                      <p className="text-xs text-slate-300 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-2 pt-2 border-t border-white/15 font-semibold ${drawerStyles.accountLinks}`}>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <i className="far fa-user-circle text-[#FF6B00]" />
                      <span>Hồ sơ</span>
                    </Link>
                    <Link
                      href="/profile?tab=courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <i className="far fa-book-open text-[#FF6B00]" />
                      <span>Khóa học</span>
                    </Link>
                  </div>

                  {canTeach && teachingHref && (
                    <a
                      href={teachingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                    >
                      <i className="far fa-shield-check text-[#FF6B00]" />
                      <span>Trang giảng dạy</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className={`w-full mt-1 rounded-xl font-bold text-red-300 bg-red-950/50 hover:bg-red-900/70 border border-red-800/40 flex items-center justify-center gap-2 transition-all cursor-pointer ${drawerStyles.logout}`}
                  >
                    <i className="far fa-sign-out" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full py-3 rounded-xl font-bold text-center text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md transition-all cursor-pointer"
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
              <div className={`text-xs text-slate-500 text-center ${drawerStyles.hotline}`}>
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      {/* Floating Scroll-to-Top Button matching user image */}
      <button
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 z-50 size-12 rounded-[12px] bg-[#60060f] text-white flex items-center justify-center shadow-2xl border border-white/10 hover:bg-[#48040b] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Cuộn lên đầu trang"
      >
        <ArrowUp className="size-6 text-white stroke-[2.5]" />
      </button>
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
