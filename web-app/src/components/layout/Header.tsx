"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Command, ChevronDown, ShoppingCart, Menu, BookOpen, Wrench, PenTool, Users, ArrowRight, LayoutGrid, Cpu, MessageSquare, GraduationCap } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout, status } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { items } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const sessionReady = mounted && status !== "loading";

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
      <div className="flex items-center justify-between h-14 px-6 rounded-full border border-border/40 bg-background/90 backdrop-blur-md shadow-lg shadow-black/5">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden p-1">
            <img
              src="/Group.svg"
              alt="GATS logo"
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

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer flex items-center gap-1 focus:outline-none py-1">
              Công cụ <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-40 bg-background/90 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl p-1"
            >
              <DropdownMenuItem
                asChild
                className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <Link href="/promptcowboy" className="w-full">
                  Prompt Cowboy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <Link href="/tools/ai-code-gen" className="w-full">
                  Improve Skills
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer"
              >
                <Link href="/tools/ai-assistant" className="w-full">
                  Prompt Follow
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <SheetContent side="right" className="w-[85vw] max-w-[400px] sm:w-[400px] border-l-0 shadow-2xl p-0 flex flex-col bg-background/95 backdrop-blur-xl">
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
                    
                    <div className="flex flex-col mt-2 mb-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground">Công cụ AI</span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 pl-[3.25rem] mt-1 relative before:absolute before:left-8 before:top-0 before:bottom-4 before:w-[2px] before:bg-border/50 rounded-bl-xl">
                        <Link href="/promptcowboy" className="relative p-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors group flex items-center gap-2">
                          <span className="absolute left-[-1.3rem] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-border/50 group-hover:bg-primary/50 transition-colors"></span>
                          <Cpu className="w-4 h-4" /> Prompt Cowboy
                        </Link>
                        <Link href="/tools/ai-code-gen" className="relative p-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors group flex items-center gap-2">
                          <span className="absolute left-[-1.3rem] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-border/50 group-hover:bg-primary/50 transition-colors"></span>
                          <Wrench className="w-4 h-4" /> Improve Skills
                        </Link>
                        <Link href="/tools/ai-assistant" className="relative p-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors group flex items-center gap-2">
                          <span className="absolute left-[-1.3rem] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-border/50 group-hover:bg-primary/50 transition-colors"></span>
                          <MessageSquare className="w-4 h-4" /> Prompt Follow
                        </Link>
                      </div>
                    </div>

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
