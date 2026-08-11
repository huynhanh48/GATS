"use client";

import React, { useState, useEffect } from "react";

const slides = [
  {
    image: "/edubost-reference/img/feature/feature-img01.png",
    title: "Đào Tạo Thực Chiến Tạo Nên\nKết Quả Khác Biệt",
    number: "15+",
    text: "Năm Kinh Nghiệm Cố Vấn",
    content:
      "Chương trình được xây dựng từ bài toán vận hành thực tế của cá nhân và doanh nghiệp, giúp học viên ứng dụng AI vào công việc thay vì chỉ dừng ở lý thuyết.",
  },
  {
    image: "/edubost-reference/img/feature/feature-img03.png",
    title: "Đào Tạo Thực Chiến Tạo Nên\nKết Quả Khác Biệt",
    number: "10+",
    text: "Thư Viện Tri Thức AI & Workflow",
    content:
      "Hệ thống kho tài liệu, template prompt và quy trình tự động hóa làm việc được cập nhật liên tục cho học viên.",
  },
  {
    image: "/edubost-reference/img/feature/feature-img01.png",
    title: "Đào Tạo Thực Chiến Tạo Nên\nKết Quả Khác Biệt",
    number: "50+",
    text: "Doanh Nghiệp Đã Đồng Hành",
    content:
      "Đồng hành huấn luyện và ứng dụng trí tuệ nhân tạo thực chiến cho các tập đoàn và doanh nghiệp hàng đầu.",
  },
];

export function FanfactSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = slides[activeIndex];

  return (
    <section className="fanfact pos-rel py-12">
      <div className="container mx-auto px-4" style={{ maxWidth: "1444px", width: "100%" }}>
        <div className="fanfact-wrapper">
          <div className="fanfact-slider swiper-container relative rounded-[32px] overflow-hidden shadow-2xl">
            {/* Background Image Container */}
            <div className="xb-fanfact__wrapper relative min-h-[600px] lg:min-h-[660px] xl:min-h-[700px] w-full bg-[#170006]">
              {/* Image */}
              <img
                src={currentSlide.image}
                alt="Đào tạo EDUGATS"
                key={currentSlide.image + activeIndex}
                className="w-full h-full min-h-[600px] lg:min-h-[660px] xl:min-h-[700px] object-cover block transition-opacity duration-700 ease-in-out"
              />

              {/* Dark Gradient Overlay Matching Edubost Template */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, #170006 0%, rgba(23, 0, 6, 0.9) 55%, rgba(23, 0, 6, 0.25) 85%, rgba(23, 0, 6, 0) 100%)",
                }}
              />

              {/* Slide Title - Slightly larger font size */}
              <div className="absolute top-10 left-8 sm:top-14 sm:left-14 lg:top-16 lg:left-16 max-w-[900px] z-10">
                <h2
                  className="font-heading font-extrabold text-white text-[38px] sm:text-[58px] lg:text-[76px] xl:text-[84px] leading-[1.08] tracking-tight drop-shadow-lg"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {currentSlide.title}
                </h2>
              </div>

              {/* Slide Stats Holder - Slightly larger font size */}
              <div className="absolute bottom-14 left-8 sm:left-14 lg:left-16 max-w-[580px] z-10 text-white">
                <h3 className="text-[56px] sm:text-[72px] lg:text-[80px] font-extrabold leading-none text-white font-mono drop-shadow-md">
                  {currentSlide.number}
                </h3>
                <h4 className="text-[26px] sm:text-[32px] lg:text-[36px] font-bold mt-2 text-white leading-snug">
                  {currentSlide.text}
                </h4>
                <p className="text-[17px] sm:text-[20px] text-slate-200 mt-3 leading-relaxed opacity-95">
                  {currentSlide.content}
                </p>
              </div>

              {/* Pagination Dots */}
              <div
                className="absolute bottom-7 left-0 right-0 z-20 flex justify-center items-center gap-3"
              >
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      index === activeIndex
                        ? "w-4 h-4 bg-white opacity-100 scale-125 shadow-lg"
                        : "w-3 h-3 bg-white/40 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
