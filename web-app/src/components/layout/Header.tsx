"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShoppingCart, Menu, BookOpen, PenTool, Users, Search } from "lucide-react";
import { useTheme } from "next-themes";
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
      className="h-9 w-7 shrink-0 text-[#ff782d]"
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
  "flex items-center h-full transition-colors";
const navLinkActive = "text-[#ff782d] bg-[#f8f9fa]";
const navLinkInactive = "hover:text-[#ff782d]";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    (mounted &&
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
      ? "http://localhost:9000/course"
      : "https://admin.gats.vn/course");

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-border/10 z-50 shadow-sm" style={{ zIndex: designTheme.zIndex.sticky }}>
      <Container size="xl">
        <div 
          className="flex items-center justify-between"
          style={{ height: designTheme.layout.headerHeight }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity pl-2"
          >
            <EduGatsMark />
            <span className="font-extrabold text-[2.2rem] tracking-tight text-[#111827] font-heading">
              Edu<span className="text-[#ff782d]">Gats</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center text-[1.5rem] font-bold text-[#111827] h-full ml-10">
            <Link
              href="/"
              className={cn(
                navLinkBase,
                "px-8",
                isNavActive(pathname, "/") ? navLinkActive : navLinkInactive,
              )}
            >
              Trang chủ
            </Link>
            <Link
              href="/courses"
              className={cn(
                navLinkBase,
                "px-6",
                isNavActive(pathname, "/courses") ? navLinkActive : navLinkInactive,
              )}
            >
              Khóa học
            </Link>

            <Link
              href="/posts"
              className={cn(
                navLinkBase,
                "px-6",
                isNavActive(pathname, "/posts") ? navLinkActive : navLinkInactive,
              )}
            >
              Bài viết
            </Link>
            
            <Link
              href="/about"
              className={cn(
                navLinkBase,
                "px-6",
                isNavActive(pathname, "/about") ? navLinkActive : navLinkInactive,
              )}
            >
              Chúng tôi
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-6 pr-2">
            {/* Theme Toggle & Cart */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
                <ShoppingCart className="w-[1.6rem] h-[1.6rem]" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff782d] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* Dark mode toggle — hidden for now */}
            </div>

            {/* Auth */}
            {sessionReady &&
              (status === "authenticated" && user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
                    <div className="relative w-9 h-9 rounded-full bg-[#ff782d]/10 border border-[#ff782d]/20 flex items-center justify-center font-bold text-[1.4rem] text-[#ff782d] uppercase overflow-hidden">
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
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl rounded-xl border border-slate-100">
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile?tab=courses" className="w-full">Học tập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile" className="w-full">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    {canTeach && (
                      <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                        <a href={teachingHref} className="w-full">Khu vực giảng dạy</a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => void handleLogout()}
                      className="text-red-500 focus:bg-red-50 cursor-pointer text-[1.4rem]"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden md:block text-[1.5rem] font-bold text-[#111827] hover:text-[#ff782d] transition-colors"
                >
                  Login / Register
                </button>
              ))}

            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#ff782d] text-[#ff782d] hover:bg-[#ff782d] hover:text-white transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="w-[1.6rem] h-[1.6rem]" />
            </button>

            <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center justify-center w-10 h-10 text-slate-800 hover:bg-slate-100 rounded-full">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] max-w-sm flex flex-col p-0">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <div className="p-6 border-b border-border">
                    <h3 className="font-bold text-[2rem] text-foreground">Edu<span className="text-[#ff782d]">Gats</span></h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <Link
                      href="/"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/")
                          ? "bg-[#f8f9fa] text-[#ff782d] font-bold"
                          : "hover:bg-slate-50 font-semibold",
                      )}
                    >
                      Trang chủ
                    </Link>
                    <Link
                      href="/courses"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/courses")
                          ? "bg-[#f8f9fa] text-[#ff782d] font-bold"
                          : "hover:bg-slate-50 font-semibold",
                      )}
                    >
                      <BookOpen className="w-5 h-5 text-slate-400" /> Khoá học
                    </Link>
                    <Link
                      href="/posts"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/posts")
                          ? "bg-[#f8f9fa] text-[#ff782d] font-bold"
                          : "hover:bg-slate-50 font-semibold",
                      )}
                    >
                      <PenTool className="w-5 h-5 text-slate-400" /> Bài viết
                    </Link>
                    <Link
                      href="/about"
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg text-[1.6rem]",
                        isNavActive(pathname, "/about")
                          ? "bg-[#f8f9fa] text-[#ff782d] font-bold"
                          : "hover:bg-slate-50 font-semibold",
                      )}
                    >
                      <Users className="w-5 h-5 text-slate-400" /> Chúng tôi
                    </Link>
                  </div>
                  <div className="p-6 border-t border-border">
                    {(!sessionReady || status === "anonymous") && (
                      <Button onClick={() => openAuthModal("login")} className="w-full bg-[#ff782d] hover:bg-[#e0661a] text-white text-[1.6rem] h-12">
                        Login / Register
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
