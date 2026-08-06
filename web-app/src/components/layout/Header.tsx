"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, BookOpen, PenTool, Users, Search, Building2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Container } from "@/components/layout/Container";
import { SearchModal } from "@/components/layout/SearchModal";
import { theme as designTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useAuth, useAuthModal } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/components/providers/CartProvider";
import { resolveMediaUrl } from "@/lib/media/url";

const subscribeToClient = () => () => {};

function EduGatsMark() {
  return (
    <svg
      viewBox="0 0 975 1265"
      aria-hidden="true"
      className="h-8 w-6 shrink-0 text-[#FF6B00]"
      fill="currentColor"
    >
      <path d="M831.151 658.012L932.75 760.012C988.85 816.312 988.65 907.512 932.35 963.612L753.85 1141.41L652.25 1039.41L830.75 861.612C868.55 824.012 881.05 770.612 868.35 722.612C862.05 698.912 849.751 676.612 831.151 658.012Z" />
      <path d="M143.95 631.113L702.85 1192.21L651.85 1243.01C632.95 1261.81 606.25 1268.01 582.25 1261.51C570.451 1258.31 559.25 1252.11 550.05 1242.81L143.55 834.713C125.05 816.113 112.65 793.713 106.35 770.113C93.6505 722.013 106.15 668.713 143.95 631.113Z" />
      <path d="M654.25 21.2126C682.35 49.4127 682.25 95.0126 654.05 123.013L143.95 631.113C106.15 668.713 93.6503 722.113 106.35 770.113C112.65 793.813 124.95 816.113 143.55 834.713L41.9503 732.713C-14.1497 676.413 -13.9497 585.213 42.3503 529.113L552.45 21.0127C580.65 -7.08735 626.25 -6.98735 654.25 21.2126Z" />
      <path d="M754.95 581.512L831.151 658.012C849.651 676.612 862.05 699.012 868.35 722.612C881.05 770.712 868.55 824.012 830.75 861.612L652.95 683.112C643.75 673.912 637.65 662.812 634.45 651.112C627.95 627.012 634.15 600.112 653.15 581.212C681.35 553.112 726.95 553.212 754.95 581.412V581.512Z" />
    </svg>
  );
}

const navLinkBase =
  "flex items-center h-full font-semibold transition-colors border-b-2 border-transparent text-slate-700 dark:text-slate-200";
const navLinkActive = "text-[#FF6B00] border-[#FF6B00] font-bold";
const navLinkInactive = "hover:text-[#FF6B00]";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const { user, logout, status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { items } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const sessionReady = mounted && status !== "loading";
  const canTeach = Boolean(
    user?.roles?.includes("instructor") || user?.roles?.includes("admin"),
  );

  const teachingHref =
    user
      ? (typeof window !== "undefined" &&
        window.location.hostname === "localhost"
          ? "http://localhost:9000/course"
          : "https://admin.gats.vn/course")
      : undefined;

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 z-50 transition-colors" style={{ zIndex: designTheme.zIndex.sticky }}>
      {/* Meeting 4/8 Top Bar: Live Q&A Announcement (Vibrant Amber Style) */}
      <div className="bg-linear-to-r from-[#FF6B00] to-[#FF8800] text-white text-[1.2rem] py-1.5 px-4 hidden sm:block border-b border-amber-600">
        <Container size="xl" className="flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-white animate-pulse" />
            <span>Lịch Hỏi Đáp Online Trực Tiếp: <strong>20:00 Thứ 5 Hàng Tuần</strong> cùng Chuyên Gia</span>
          </div>
          <div className="flex items-center gap-4 text-white/90 text-[1.1rem]">
            <span>Hotline Hỗ Trợ: <strong className="text-white">1900 633 888</strong></span>
            <span>·</span>
            <span className="text-white font-extrabold underline">Miễn Phí Khóa AI Cơ Bản</span>
          </div>
        </Container>
      </div>

      <Container size="xl">
        <div 
          className="flex items-center justify-between"
          style={{ height: designTheme.layout.headerHeight }}
        >
          {/* Logo in Vibrant Amber */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-95 transition-opacity"
          >
            <EduGatsMark />
            <span className="font-heading font-extrabold text-[2.2rem] tracking-tight text-[#0B0F17] dark:text-white">
              GATS <span className="text-[#FF6B00] font-sans text-[1.8rem] font-bold">Academy</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center text-[1.5rem] h-full ml-8 gap-8">
            <Link
              href="/"
              className={cn(
                navLinkBase,
                isNavActive(pathname, "/") ? navLinkActive : navLinkInactive,
              )}
            >
              Trang chủ
            </Link>
            <Link
              href="/courses"
              className={cn(
                navLinkBase,
                isNavActive(pathname, "/courses") ? navLinkActive : navLinkInactive,
              )}
            >
              Khóa học
            </Link>

            <Link
              href="/posts"
              className={cn(
                navLinkBase,
                isNavActive(pathname, "/posts") ? navLinkActive : navLinkInactive,
              )}
            >
              Bài viết
            </Link>
            
            <Link
              href="/about"
              className={cn(
                navLinkBase,
                isNavActive(pathname, "/about") ? navLinkActive : navLinkInactive,
              )}
            >
              Về Chúng Tôi
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-[#FF6B00] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Search className="w-[1.8rem] h-[1.8rem]" />
            </button>

            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-[#FF6B00] dark:hover:bg-slate-800 transition-colors">
              <ShoppingCart className="w-[1.8rem] h-[1.8rem]" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Auth / Enterprise Portal Button */}
            {sessionReady &&
              (status === "authenticated" && user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none ml-2">
                    <div className="relative w-9 h-9 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center font-bold text-[1.4rem] text-[#FF6B00] uppercase overflow-hidden">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveMediaUrl(user.avatarUrl)}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        user.userName.substring(0, 2)
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-200 dark:border-slate-800">
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile?tab=courses" className="w-full">Học tập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile" className="w-full">Cổng Khách Hàng</Link>
                    </DropdownMenuItem>
                    {canTeach && (
                      <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                        <a href={teachingHref ?? undefined} className="w-full">Khu vực giảng dạy</a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => void handleLogout()}
                      className="text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer text-[1.4rem]"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => openAuthModal("login")}
                  className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-lg px-6 h-10 text-[1.4rem] font-bold transition-all shadow-md shadow-[#FF6B00]/20 border-none cursor-pointer"
                >
                  <Building2 className="size-4 mr-1.5" />
                  Cổng Khách Hàng
                </Button>
              ))}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-sm flex flex-col p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-heading font-bold text-[2rem] text-slate-900 dark:text-white">GATS <span className="text-[#FF6B00] font-sans">Academy</span></span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Link
                      href="/"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/")
                          ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium",
                      )}
                    >
                      Trang chủ
                    </Link>
                    <Link
                      href="/courses"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/courses")
                          ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium",
                      )}
                    >
                      <BookOpen className="w-5 h-5 text-slate-400" /> Khoá học
                    </Link>
                    <Link
                      href="/posts"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/posts")
                          ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium",
                      )}
                    >
                      <PenTool className="w-5 h-5 text-slate-400" /> Bài viết
                    </Link>
                    <Link
                      href="/about"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/about")
                          ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium",
                      )}
                    >
                      <Users className="w-5 h-5 text-slate-400" /> Về Chúng Tôi
                    </Link>
                  </div>
                  <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                    {(!sessionReady || status === "anonymous") && (
                      <Button onClick={() => openAuthModal("login")} className="w-full bg-[#FF6B00] hover:bg-[#e05e00] text-white text-[1.6rem] h-12 rounded-lg font-semibold border-none cursor-pointer">
                        Cổng Khách Hàng / Đăng Nhập
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
