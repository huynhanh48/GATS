"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Command, ChevronDown, ShoppingCart, Menu, BookOpen, PenTool, Users, ArrowRight, GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
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
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
      <div className="flex items-center justify-between h-14 px-6 rounded-full border border-border/40 bg-background/90 backdrop-blur-md shadow-lg shadow-black/5">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden p-1">
            <Image
              src="/Group.svg"
              alt="GATS logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <Command className="w-4 h-4 text-primary hidden" />
          </div>
          <span className="font-bold text-lg tracking-tight">GATS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/courses"
            className="hover:text-foreground transition-colors"
          >
            Khoá học
          </Link>

          {sessionReady && status === "authenticated" ? (
            <Link
              href="/learning"
              className="hover:text-foreground transition-colors"
            >
              Học tập
            </Link>
          ) : null}

          {sessionReady && status === "authenticated" && canTeach ? (
            <a
              href={teachingHref}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Giảng dạy
            </a>
          ) : null}

          <Link
            href="/posts"
            className="hover:text-foreground transition-colors"
          >
            Bài viết
          </Link>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            Chúng tôi
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ShoppingCart className="w-4 h-4" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {sessionReady &&
            (status === "authenticated" && user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none py-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary uppercase">
                    {user.userName.substring(0, 2)}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 bg-background/90 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl p-1"
                >
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer">
                    <Link href="/learning" className="w-full">Học tập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer">
                    <Link href="/profile" className="w-full">Hồ sơ cá nhân</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer">
                    <Link href="/profile?tab=orders" className="w-full">Lịch sử giao dịch</Link>
                  </DropdownMenuItem>
                  {canTeach ? (
                    <DropdownMenuItem asChild className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer">
                      <a href={teachingHref} className="w-full">Khu vực giảng dạy</a>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    onClick={() => {
                      void handleLogout();
                    }}
                    className="rounded-xl px-2.5 py-1.5 text-xs text-red-500 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block"
                >
                  Đăng nhập
                </button>
                <Button
                  onClick={() => openAuthModal("register")}
                  variant="secondary"
                  className="rounded-full px-5 h-9 bg-secondary text-secondary-foreground hover:bg-secondary/90 border-none shadow-none"
                >
                  Bắt đầu ngay
                </Button>
              </>
            ))}

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-[85vw] max-w-100 flex-col border-l-0 bg-background/95 p-0 shadow-2xl backdrop-blur-xl sm:w-100">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                
                {/* Header of mobile menu */}
                <div className="p-6 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl tracking-tight text-foreground mt-4">GATS Academy</h3>
                  <p className="text-sm text-muted-foreground mt-1">Nền tảng đào tạo AI hàng đầu</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                  <nav className="flex flex-col gap-2">
                    <Link href="/courses" className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">Khoá học</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                    </Link>

                    {sessionReady && status === "authenticated" ? (
                      <Link href="/learning" className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">Học tập</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                      </Link>
                    ) : null}

                    {sessionReady && status === "authenticated" && canTeach ? (
                      <a href={teachingHref} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 active:bg-primary/15 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-primary">Khu vực giảng dạy</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </a>
                    ) : null}
                    
                    <Link href="/posts" className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors group mt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PenTool className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">Bài viết</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                    </Link>

                    <Link href="/about" className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">Chúng tôi</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                    </Link>
                  </nav>
                </div>

                {/* Footer of mobile menu */}
                <div className="p-6 border-t border-border/40 bg-muted/10">
                  {!sessionReady || status === "anonymous" ? (
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={() => openAuthModal("login")}
                        variant="outline"
                        className="w-full justify-center h-12 rounded-xl border-border/60 hover:bg-muted"
                      >
                        Đăng nhập
                      </Button>
                      <Button
                        onClick={() => openAuthModal("register")}
                        className="w-full justify-center h-12 rounded-xl shadow-md"
                      >
                        Bắt đầu ngay <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Chào mừng trở lại!</p>
                        <Link href="/profile" className="text-xs text-primary hover:underline mt-0.5 inline-block">Đến trang cá nhân</Link>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
