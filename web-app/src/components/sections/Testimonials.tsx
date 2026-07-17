"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const testimonials = [
  {
    quote: "Chương trình đào tạo AI của GATS Academy thực sự đã thay đổi cách chúng tôi làm việc. Năng suất của team tăng lên gấp đôi nhờ áp dụng các trợ lý ảo vào quy trình.",
    author: "Nguyễn Văn A",
    role: "Giám đốc Kỹ thuật",
    avatar: "/avatar/user-1.jpg",
    company: "TechCorp"
  },
  {
    quote: "Các khóa học vô cùng thực chiến. Không chỉ học lý thuyết, chúng tôi được tự tay thiết kế và triển khai AI để tối ưu hóa chiến dịch quảng cáo cho doanh nghiệp mình.",
    author: "Trần Thị B",
    role: "Trưởng phòng Marketing",
    avatar: "/avatar/user-2.jpg",
    company: "CreativeAgency"
  },
  {
    quote: "Việc ứng dụng AI vào phân tích dữ liệu giúp chúng tôi tiết kiệm hàng tuần làm việc mỗi tháng. Khóa học này là khoản đầu tư xứng đáng nhất của chúng tôi trong năm nay!",
    author: "Lê Văn C",
    role: "Giám đốc Vận hành",
    avatar: "/avatar/user-3.jpg",
    company: "GlobalLogistics"
  },
  {
    quote: "Nhờ có khóa học Prompt Engineering, đội ngũ content của tôi đã tăng gấp 3 tốc độ sản xuất nội dung, vượt mọi KPI đề ra mà vẫn duy trì chất lượng vượt trội.",
    author: "Phạm Thị D",
    role: "Content Manager",
    avatar: "/avatar/user-4.jpg",
    company: "MediaPlus"
  }
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
    <section className="w-full py-32 relative z-20 bg-transparent overflow-hidden flex items-center justify-center min-h-[600px]">
      {/* Lưới nền phong cách khối vuông mờ dần */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div 
          className="absolute w-[800px] h-[600px] bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 70%)"
          }}
        >
          {/* Những ô khối vuông ngẫu nhiên nổi bật nhẹ (Mô phỏng ảnh mẫu) */}
          <div className="absolute top-[80px] left-[120px] w-[40px] h-[40px] bg-white/[0.02]"></div>
          <div className="absolute top-[160px] left-[80px] w-[40px] h-[40px] bg-white/[0.03]"></div>
          <div className="absolute top-[280px] left-[40px] w-[40px] h-[40px] bg-white/[0.02]"></div>
          <div className="absolute top-[120px] right-[240px] w-[40px] h-[40px] bg-white/[0.02]"></div>
          <div className="absolute bottom-[200px] right-[120px] w-[40px] h-[40px] bg-white/[0.03]"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="h-[250px] relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="flex gap-6 items-start md:items-center">
                <div className="flex-shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden mt-2 md:mt-0 shadow-2xl border border-white/10">
                  <Image 
                    src={testimonials[currentIndex].avatar} 
                    alt={testimonials[currentIndex].author}
                    fill
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl md:text-4xl font-medium tracking-tight leading-snug md:leading-normal text-balance">
                  &quot;{testimonials[currentIndex].quote}&quot;
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chân chữ ký & Điều khiển Carousel */}
        <div className="mt-12 flex flex-col sm:flex-row sm:items-end justify-between border-t border-white/10 pt-8 gap-6">
          <div className="flex items-center gap-12">
            {/* Giả lập logo đối tác/công ty */}
            <div className="text-xl font-bold tracking-tighter text-white/90">
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
                  <div className="text-sm font-semibold text-foreground">{testimonials[currentIndex].author}</div>
                  <div className="text-xs text-muted-foreground">{testimonials[currentIndex].role}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIndex(i)}
                className={`transition-colors ${i === currentIndex ? "text-primary font-bold" : "hover:text-foreground"}`}
              >
                0{i + 1}
              </button>
            ))}
            <div className="w-16 h-[2px] bg-white/10 relative ml-2">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary"
                initial={false}
                animate={{ 
                  left: `${(currentIndex / testimonials.length) * 100}%`, 
                  width: `${100 / testimonials.length}%` 
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
