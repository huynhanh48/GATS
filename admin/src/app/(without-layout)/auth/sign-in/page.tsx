import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-wrap items-center">
      <div className="w-full xl:w-1/2">
        <div className="mx-auto w-[570px] p-4 sm:p-12.5 xl:p-15">
          <Signin />
        </div>
      </div>

      <div className="hidden w-full p-6 xl:block xl:w-1/2">
        <div className="bg-gradient-to-br from-[#eef] to-[#fff8fc] dark:from-[#1a222c] dark:to-[#1a222c] overflow-hidden rounded-2xl px-15 pt-12.5 border border-transparent dark:border-slate-800">
          <Link className="mb-10 inline-flex items-center gap-2.5" href="/">
            <Image
              src="/Group.svg"
              alt="GATS"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              GATS Academy
            </span>
          </Link>
          <p className="mb-3 text-xl font-medium text-slate-800 dark:text-white">
            Khu vực vận hành & giảng dạy
          </p>

          <h1 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white sm:text-heading-3">
            Chào mừng trở lại GATS!
          </h1>

          <p className="w-full max-w-[375px] font-medium text-slate-600 dark:text-slate-400">
            Quản lý nội dung khóa học, học viên và trao đổi cùng lớp học của bạn.
          </p>

          <div className="mt-31">
            <Image
              src={"/images/grids/grid-02.svg"}
              alt="Logo"
              width={405}
              height={325}
              className="mx-auto dark:opacity-30"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
