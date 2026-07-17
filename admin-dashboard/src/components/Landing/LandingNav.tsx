"use client";

import { hasAdminAccess } from "@/lib/auth/access";
import { cn } from "@/lib/utils";
import { logout, useSession } from "@/services/auth.client";
import { cartClient } from "@/services/cart.client";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggleSwitch } from "@/components/Layouts/header/theme-toggle";

type LandingNavProps = {
  active?:
    | "home"
    | "course"
    | "posts"
    | "cart"
    | "my-courses"
    | "product"
    | "solution"
    | "resource"
    | "pricing"
    | "about";
  tone?: "dark" | "light";
};

export function LandingNav({ active = "home", tone = "dark" }: LandingNavProps) {
  const session = useSession();
  const router = useRouter();
  const user = session.data?.user;
  const isAdmin = user ? hasAdminAccess(user.roles) : false;
  const isLight = tone === "light";
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      cartClient.get().then((res) => {
        if (res.data?.cart) {
          setCartCount(res.data.cart.items.length);
        }
      });
    }
  }, [user]);

  const linkClass = cn(
    "cursor-pointer transition-colors",
    isLight
      ? "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
      : "text-gray-400 hover:text-white",
  );
  const activeClass = cn(
    "px-3 py-1",
    isLight
      ? "border border-slate-950 text-slate-950 dark:border-white dark:text-white"
      : "border border-white text-white",
  );

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      className={cn(
        "relative z-10 flex items-center justify-center px-8 py-6 text-sm md:justify-between",
        isLight ? "text-slate-600 dark:text-slate-300" : "text-gray-400",
      )}
    >
      <div className="hidden md:flex gap-6 items-center">
        <Link
          href="/"
          className={cn(linkClass, active === "home" && activeClass)}
        >
          Home
        </Link>
        <Link
          href="/course"
          className={cn(linkClass, active === "course" && activeClass)}
        >
          Course
        </Link>
        <Link
          href="/posts"
          className={cn(linkClass, active === "posts" && activeClass)}
        >
          Posts
        </Link>
      </div>

      <Link
        href="/"
        className={cn(
          "font-bold tracking-widest uppercase",
          isLight ? "text-slate-950 dark:text-white" : "text-white",
        )}
      >
        GATS ACADEMY
      </Link>

      <div className="absolute right-6 md:hidden">
        <ThemeToggleSwitch />
      </div>

      <div className="hidden md:flex gap-6 items-center">
        {user ? (
          <>
            <Link
              href="/my-courses"
              className={cn(linkClass, active === "my-courses" && activeClass)}
            >
              My courses
            </Link>
            <Link
              href="/wishlist"
              className={cn(linkClass, active === "cart" ? "" : "")}
              title="Yêu thích"
            >
              <Heart className="size-5" />
            </Link>
            <Link
              href="/cart"
              className={cn(linkClass, "relative")}
              title="Giỏ hàng"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            {isAdmin ? (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className={cn(
                "cursor-pointer transition-colors",
                isLight
                  ? "text-slate-600 hover:text-slate-950"
                  + " dark:text-slate-300 dark:hover:text-white"
                  : "text-gray-400 hover:text-white",
              )}
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/sign-in" className={linkClass}>
              Đăng nhập
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(
                "rounded-full border px-3 py-1 transition",
                isLight
                  ? "border-slate-300 text-slate-950 hover:bg-slate-950 hover:text-white"
                  + " dark:border-slate-700 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
                  : "border-gray-600 text-white hover:bg-white hover:text-black",
              )}
            >
              Đăng ký
            </Link>
          </>
        )}
        <ThemeToggleSwitch />
      </div>
    </nav>
  );
}
