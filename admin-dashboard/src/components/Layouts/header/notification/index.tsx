"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";

const notificationList = [
  {
    image: "/images/user/user-15.png",
    title: "Khóa học mới được tạo",
    subTitle: "Kiểm tra nội dung trước khi xuất bản",
  },
  {
    image: "/images/user/user-03.png",
    title: "Có bài học cần duyệt",
    subTitle: "Video vừa xử lý xong",
  },
  {
    image: "/images/user/user-26.png",
    title: "Đơn thanh toán mới",
    subTitle: "Doanh thu đã được cập nhật",
  },
  {
    image: "/images/user/user-28.png",
    title: "Quiz có phản hồi mới",
    subTitle: "Xem kết quả học viên",
  },
  {
    image: "/images/user/user-27.png",
    title: "Tài nguyên đã tải lên",
    subTitle: "Sẵn sàng gắn vào bài học",
  },
];

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDotVisible, setIsDotVisible] = useState(true);
  const isMobile = useIsMobile();

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);

        if (setIsDotVisible) setIsDotVisible(false);
      }}
    >
      <DropdownTrigger
        className="grid size-12 cursor-pointer place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 outline-none transition hover:border-[#0070EB]/40 hover:text-[#0070EB] focus-visible:border-[#0070EB] focus-visible:text-[#0070EB] dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-white/10"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {isDotVisible && (
            <span
              className={cn(
                "absolute top-0 right-0 z-1 size-2 rounded-full bg-[#FF7622] ring-2 ring-white dark:ring-[#0f172a]",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-[#FF7622] opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-slate-200 bg-white px-3.5 py-3 shadow-md min-[350px]:min-w-[20rem] dark:border-slate-800 dark:bg-[#0b1220]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-bold text-slate-950 dark:text-white">
            Thông báo
          </span>
          <span className="rounded-md bg-[#0070EB] px-2.25 py-0.5 text-xs font-bold text-white">
            5 mới
          </span>
        </div>

        <ul className="mb-3 max-h-92 space-y-1.5 overflow-y-auto">
          {notificationList.map((item, index) => (
            <li key={index} role="menuitem">
              <Link
                href="#"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-slate-100 focus-visible:bg-slate-100 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800"
              >
                <Image
                  src={item.image}
                  className="size-14 rounded-full object-cover"
                  width={200}
                  height={200}
                  alt="User"
                />

                <div>
                  <strong className="block text-sm font-bold text-slate-950 dark:text-white">
                    {item.title}
                  </strong>

                  <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                    {item.subTitle}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-[#0070EB]/30 p-2 text-center text-sm font-bold tracking-wide text-[#0070EB] transition-colors outline-none hover:bg-[#eaf2ff] focus:bg-[#eaf2ff] focus-visible:border-[#0070EB] dark:border-[#0f2742] dark:text-[#7ab8ff] dark:hover:bg-[#0f2742]"
        >
          Xem tất cả
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
