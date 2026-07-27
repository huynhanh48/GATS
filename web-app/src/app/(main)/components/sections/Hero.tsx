"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative w-full pt-[6.4rem] overflow-hidden bg-linear-to-r from-[#fffbf0] to-[#def5ec]">

      {/* Lớp họa tiết background (Waves) */}
      <img src="/images/landingpages/wave.svg" className="absolute bottom-0 left-0 z-0 w-[40%] max-w-[500px]" alt="" />
      <img src="/images/landingpages/wave-top.svg" className="absolute top-0 right-0 z-0 w-[40%] max-w-[500px]" alt="" />

      {/* Lớp họa tiết bay lơ lửng (Book & Pen) */}
      <img src="/images/landingpages/book.svg" className="absolute top-[15%] left-[3%] md:left-[8%] w-24 md:w-36 lg:w-48 z-20 opacity-90 animate-[bounce_5s_infinite]" alt="" />
      <img src="/images/landingpages/pen.svg" className="absolute bottom-[10%] right-0 md:-right-[2%] w-28 md:w-48 lg:w-72 z-0 opacity-90 animate-[bounce_6s_infinite]" alt="" />

      <Container size="xl" className="relative z-10 w-full">
        {/* Lớp bọc tổng cho cả content và background */}
        <div className="relative w-full flex flex-col md:flex-row items-center justify-between">

          {/* Lớp nền chữ ONLINE SCHOOL - Được lồng gọn bên trong lưới, canh giữa */}
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-60">
            <img
              src="/images/landingpages/word-bg.svg"
              alt=""
              className="w-[95%] lg:w-[85%] h-auto object-contain"
            />
          </div>

          {/* Lớp Nội dung trái */}
          <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start justify-center py-12 md:py-0 min-h-[400px]">
            <h1 className="text-[4.5rem] md:text-[5.5rem] lg:text-[7.2rem] font-extrabold text-[#111827] leading-[1.3] py-4 font-heading mb-6 tracking-tight">
              Làm Chủ Công Nghệ <br className="hidden sm:block" />
              Ứng Dụng AI
            </h1>

            <p className="text-[1.6rem] md:text-[1.8rem] text-slate-600 leading-relaxed mb-10 font-medium max-w-[90%]">
              GATS Academy tự hào là đơn vị tiên phong trong đào tạo trí tuệ nhân tạo thực chiến. Chúng tôi giúp bạn nắm bắt công cụ AI hiện đại để bứt phá hiệu suất công việc.
            </p>

            <Button
              asChild
              className="bg-[#ff782d] hover:bg-[#e66c28] text-white rounded-full px-10 h-14 text-[1.6rem] font-bold shadow-xl shadow-[#ff782d]/30 transition-transform hover:-translate-y-1 border-none"
            >
              <Link href="/courses">
                Khám phá khóa học
              </Link>
            </Button>
          </div>

          {/* Lớp Hình ảnh phải */}
          <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end items-end self-end">
            <img
              src="/images/landingpages/beautiful-student-girl-wearing-backpack-holding-notebook-isolated-white-background%201.svg"
              alt="Happy Student"
              className="w-full max-w-[500px] lg:max-w-[700px] xl:max-w-[800px] h-auto object-contain object-bottom drop-shadow-2xl scale-[1.02] origin-bottom"
            />
          </div>

        </div>
      </Container>
    </section>
  );
}
