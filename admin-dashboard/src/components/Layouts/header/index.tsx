"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

const PAGE_TITLES: Array<[string, string]> = [
  ["/course", "Khóa học"],
  ["/post", "Bài viết"],
  ["/video", "Video"],
  ["/thumbnail", "Thumbnail"],
  ["/file", "Files"],
  ["/orders", "Đơn hàng"],
  ["/bank-accounts", "Tài khoản ngân hàng"],
  ["/leads", "Đăng ký tư vấn"],
  ["/profile", "Profile"],
  ["/pages/settings", "Cài đặt"],
];

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();
  const pageTitle =
    PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-6 2xl:px-10 dark:border-slate-800 dark:bg-[#07111f]/90">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border border-slate-200 px-1.5 py-1 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:bg-[#0f172a] dark:hover:bg-white/10"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href="/" className="2xsm:ml-4 ml-2 max-[430px]:hidden">
          <Image
            src="/Group.svg"
            width={32}
            height={32}
            alt="GATS"
            className="size-8 object-contain"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-xl font-black text-slate-950 dark:text-white">
          {pageTitle}
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          GATS Academy admin workspace
        </p>
      </div>

      <div className="2xsm:gap-4 flex flex-1 items-center justify-end gap-2">
        <div className="relative w-full max-w-75">
          <input
            type="search"
            placeholder="Tìm nhanh..."
            className="flex w-full items-center gap-3.5 rounded-full border border-slate-200 bg-slate-50 py-3 pr-5 pl-13.25 text-sm text-slate-900 transition-colors outline-none placeholder:text-slate-400 focus-visible:border-[#0070EB] dark:border-slate-700 dark:bg-[#0f172a] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600"
          />

          <SearchIcon className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 max-[1015px]:size-5 dark:text-slate-500" />
        </div>

        <ThemeToggleSwitch />

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
