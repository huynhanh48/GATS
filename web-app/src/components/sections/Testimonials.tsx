"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const testimonials = [
  {
    quote:
      "Chương trình đào tạo AI của GATS Academy thực sự đã thay đổi cách chúng tôi làm việc. Năng suất của team tăng lên gấp đôi nhờ áp dụng các trợ lý ảo vào quy trình.",
    author: "Nguyễn Minh Quân",
    role: "Giám đốc Kỹ thuật",
    avatar: "/professional/person-3.jpg",
    company: "TechCorp",
  },
  {
    quote:
      "Các khóa học vô cùng thực chiến. Không chỉ học lý thuyết, chúng tôi được tự tay thiết kế và triển khai AI để tối ưu hóa chiến dịch quảng cáo cho doanh nghiệp mình.",
    author: "Lê Thùy Dương",
    role: "Trưởng phòng Marketing",
    avatar: "/professional/person-5.jpg",
    company: "CreativeAgency",
  },
  {
    quote:
      "Việc ứng dụng AI vào phân tích dữ liệu giúp chúng tôi tiết kiệm hàng tuần làm việc mỗi tháng. Khóa học này là khoản đầu tư xứng đáng nhất của chúng tôi trong năm nay!",
    author: "Liam Johnson",
    role: "Giám đốc Vận hành",
    avatar: "/professional/person-1.jpg",
    company: "GlobalLogistics",
  },
  {
    quote:
      "Nhờ có khóa học Prompt Engineering, đội ngũ content của tôi đã tăng gấp 3 tốc độ sản xuất nội dung, vượt mọi KPI đề ra mà vẫn duy trì chất lượng vượt trội.",
    author: "Nguyễn Tuệ Mẫn",
    role: "Content Manager",
    avatar: "/professional/person-4.jpg",
    company: "MediaPlus",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-20 flex min-h-[600px] w-full items-center justify-center overflow-hidden bg-card/40 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="absolute h-[600px] w-[800px] bg-[linear-gradient(to_right,rgb(0_112_235_/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_112_235_/0.06)_1px,transparent_1px)] bg-size-[40px_40px]"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
          }}
        >
          <div className="absolute top-[80px] left-[120px] size-10 bg-brand-primary/5" />
          <div className="absolute top-[160px] left-[80px] size-10 bg-brand-primary/[0.07]" />
          <div className="absolute top-[280px] left-[40px] size-10 bg-brand-primary/5" />
          <div className="absolute top-[120px] right-[240px] size-10 bg-primary/5" />
          <div className="absolute right-[120px] bottom-[200px] size-10 bg-primary/[0.07]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="relative h-[250px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="flex items-start gap-6 md:items-center">
                <div className="relative mt-2 size-16 shrink-0 overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)] md:mt-0 md:h-28 md:w-24">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].author}
                    className="size-full object-cover object-top"
                  />
                </div>
                <h3 className="text-balance text-2xl leading-snug font-medium tracking-tight text-foreground md:text-4xl md:leading-normal">
                  &quot;{testimonials[currentIndex].quote}&quot;
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-6 border-t border-divider pt-8 sm:flex-row sm:items-end">
          <div className="flex items-center gap-12">
            <div className="text-xl font-bold tracking-tighter text-brand-primary">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {testimonials[currentIndex].company}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex flex-col">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="text-sm font-semibold text-foreground">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`transition-colors ${
                  i === currentIndex
                    ? "font-bold text-primary"
                    : "hover:text-foreground"
                }`}
              >
                0{i + 1}
              </button>
            ))}
            <div className="relative ml-2 h-0.5 w-16 bg-border">
              <motion.div
                className="absolute top-0 left-0 h-full bg-primary"
                initial={false}
                animate={{
                  left: `${(currentIndex / testimonials.length) * 100}%`,
                  width: `${100 / testimonials.length}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
