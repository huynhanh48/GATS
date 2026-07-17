"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Command, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth, useAuthModal } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout, status } = useAuth();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const sessionReady = mounted && status !== "loading";

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
      <div className="flex items-center justify-between h-14 px-6 rounded-full border border-border/40 bg-background/60 backdrop-blur-md shadow-lg shadow-black/5">
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
            href="/#pricing"
            className="hover:text-foreground transition-colors"
          >
            Chúng tôi
          </Link>
        </nav>

        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}
