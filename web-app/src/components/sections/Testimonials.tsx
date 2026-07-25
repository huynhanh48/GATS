"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { SpotlightCard, AnimatedContent } from "@/components/react-bits";

const testimonials = [
  {
    quote:
      "Chương trình đào tạo AI của GATS Academy thực sự đã thay đổi cách chúng tôi làm việc. Năng suất của team tăng lên gấp đôi nhờ áp dụng các trợ lý ảo vào quy trình.",
    author: "Nguyễn Minh Quân",
    role: "Giám đốc Kỹ thuật",
    avatar: "/professional/person-3.jpg",
    company: "TechCorp Vietnam",
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
    company: "MediaPlus Studio",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-20 flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-card/40 py-24 sm:py-32 border-y border-border">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="absolute h-[600px] w-[800px] bg-[linear-gradient(to_right,rgb(0_112_235_/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_112_235_/0.05)_1px,transparent_1px)] bg-size-[40px_40px]"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
          }}
        />
      </div>

      <AnimatedContent distance={30} className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-accent px-4 py-1.5 text-xs font-bold text-brand-primary">
            <Quote className="size-3.5 fill-brand-primary" aria-hidden="true" />
            <span>ĐÁNH GIÁ TỪ HỌC VIÊN & DOANH NGHIỆP</span>
          </div>
        </div>

        <SpotlightCard className="p-8 sm:p-12">
          <div className="relative min-h-[180px] sm:min-h-[160px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <h3 className="text-balance text-xl font-heading font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl md:text-3xl">
                  &quot;{testimonials[currentIndex].quote}&quot;
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-6 border-t border-border pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-brand-primary/20 bg-muted shadow-sm">
                <img
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].author}
                  className="size-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div className="text-base font-bold font-heading text-foreground">
                      {testimonials[currentIndex].author}
                    </div>
                    <div className="text-xs font-medium text-brand-primary">
                      {testimonials[currentIndex].role} ·{" "}
                      <span className="text-muted-foreground">{testimonials[currentIndex].company}</span>
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
                  className={`px-1.5 py-1 transition-all ${
                    i === currentIndex
                      ? "font-bold text-primary scale-110"
                      : "hover:text-foreground"
                  }`}
                >
                  0{i + 1}
                </button>
              ))}
              <div className="relative ml-2 h-1 w-20 overflow-hidden rounded-full bg-border">
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
        </SpotlightCard>
      </AnimatedContent>
    </section>
  );
}
