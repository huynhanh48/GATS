"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronDown, ShoppingCart, Menu, BookOpen, PenTool, Users, ArrowRight, GraduationCap, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Container } from "@/components/layout/Container";
import { theme as designTheme } from "@/lib/theme";
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

const subscribeToClient = () => () => {};

export function Header() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const { user, logout, status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { items } = useCart();

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
            <Image
              src="/logo.svg"
              alt="GATS logo"
              width={28}
              height={28}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="font-extrabold text-[2.2rem] tracking-tight text-[#111827] font-heading">
              Edu<span className="text-[#ff782d]">Gats</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center text-[1.5rem] font-bold text-[#111827] h-full ml-10">
            <Link
              href="/"
              className="flex items-center h-full px-8 text-[#ff782d] bg-[#f8f9fa] transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/courses"
              className="flex items-center h-full px-6 hover:text-[#ff782d] transition-colors"
            >
              Khóa học
            </Link>

            {sessionReady && status === "authenticated" ? (
              <Link
                href="/learning"
                className="flex items-center h-full px-6 hover:text-[#ff782d] transition-colors"
              >
                Học tập
              </Link>
            ) : null}

            {sessionReady && status === "authenticated" && canTeach ? (
              <a
                href={teachingHref}
                className="flex items-center h-full px-6 hover:text-[#ff782d] transition-colors"
              >
                Giảng dạy
              </a>
            ) : null}

            <Link
              href="/posts"
              className="flex items-center h-full px-6 hover:text-[#ff782d] transition-colors"
            >
              Bài viết
            </Link>
            
            <Link
              href="/about"
              className="flex items-center h-full px-6 hover:text-[#ff782d] transition-colors"
            >
              Chúng tôi
              <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
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

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {theme === "dark" ? (
                    <Sun className="w-[1.6rem] h-[1.6rem]" />
                  ) : (
                    <Moon className="w-[1.6rem] h-[1.6rem]" />
                  )}
                </button>
              )}
            </div>

            {/* Auth */}
            {sessionReady &&
              (status === "authenticated" && user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
                    <div className="w-9 h-9 rounded-full bg-[#ff782d]/10 border border-[#ff782d]/20 flex items-center justify-center font-bold text-[1.4rem] text-[#ff782d] uppercase">
                      {user.userName.substring(0, 2)}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-xl rounded-xl border border-slate-100">
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/learning" className="w-full">Học tập</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile" className="w-full">Hồ sơ cá nhân</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer text-[1.4rem]">
                      <Link href="/profile?tab=orders" className="w-full">Lịch sử giao dịch</Link>
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

            {/* Search Button (From Template) */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full border border-[#ff782d] text-[#ff782d] hover:bg-[#ff782d] hover:text-white transition-colors">
              <Search className="w-[1.6rem] h-[1.6rem]" />
            </button>

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
                    <Link href="/" className="flex items-center gap-3 p-4 rounded-lg bg-[#f8f9fa] text-[#ff782d] font-bold text-[1.6rem]">
                      Trang chủ
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 font-semibold text-[1.6rem]">
                      <BookOpen className="w-5 h-5 text-slate-400" /> Khoá học
                    </Link>
                    <Link href="/posts" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 font-semibold text-[1.6rem]">
                      <PenTool className="w-5 h-5 text-slate-400" /> Bài viết
                    </Link>
                    <Link href="/about" className="flex items-center gap-3 p-4 rounded-lg hover:bg-slate-50 font-semibold text-[1.6rem]">
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
