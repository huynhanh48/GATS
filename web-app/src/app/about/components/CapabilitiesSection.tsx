"use client";

import { SectionHeader } from "@/components/ted/section-header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const experts = [
  { src: "/avatar/user-1.jpg", name: "Liam Johnson", role: "AI Research Lead", bio: "10+ năm nghiên cứu AI ứng dụng trong giáo dục và doanh nghiệp." },
  { src: "/avatar/user-2.jpg", name: "Oliver Smith", role: "Machine Learning Engineer", bio: "Chuyên gia xây dựng mô hình ML cho bài toán thực tế quy mô lớn." },
  { src: "/avatar/user-3.jpg", name: "Nguyễn Minh Quân", role: "Data Scientist", bio: "Phân tích dữ liệu và trực quan hóa để hỗ trợ quyết định kinh doanh." },
  { src: "/avatar/user-4.jpg", name: "Nguyễn Tuệ Mẫn", role: "AI Solutions Architect", bio: "Thiết kế hệ thống AI end-to-end cho các tổ chức tại Việt Nam." },
  { src: "/avatar/user-1.jpg", name: "Lê Thùy Dương", role: "NLP Specialist", bio: "Nghiên cứu xử lý ngôn ngữ tự nhiên và ứng dụng chatbot thế hệ mới." },
];

export function CapabilitiesSection() {
  return (
    <section className="w-full bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Đội ngũ chuyên gia"
          title="Mentor GATS"
          description="Những chuyên gia trực tiếp đồng hành và chia sẻ kinh nghiệm ứng dụng AI trong công việc thực tế."
        />

        <div className="mt-12">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="!pb-16"
          >
            {experts.map((expert) => (
              <SwiperSlide key={expert.name} className="h-auto">
                <div className="group h-full rounded-2xl overflow-hidden bg-white border border-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-transparent">
                  {/* Ảnh chuyên gia */}
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={expert.src}
                      alt={`Chân dung ${expert.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="p-8">
                    <h3 className="text-[2rem] font-bold text-[#111827] leading-snug transition-colors group-hover:text-primary">
                      {expert.name}
                    </h3>
                    <p className="mt-2 text-[1.4rem] font-semibold text-brand-primary">
                      {expert.role}
                    </p>
                    <p className="mt-4 text-[1.4rem] text-slate-500 leading-relaxed">
                      {expert.bio}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
