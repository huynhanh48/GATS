"use client";

import { Container } from "@/components/layout/Container";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const brandBadges = ["VIỆN KINH TẾ SỐ", "HIỆP HỘI AI VN", "DX ALLIANCE", "NIC PARTNER", "GATS ENTERPRISE"];

const mentorsList = [
  {
    id: 1,
    name: "Chuyên Gia Trần Minh Đức",
    role: "Giám Đốc Giải Pháp AI Agent & Tự Động Hóa Workflow",
    org: "GATS Enterprise Advisory",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    story:
      "Hơn 10 năm kinh nghiệm dẫn dắt các dự án nghiên cứu và triển khai AI cho doanh nghiệp. Sứ mệnh của tôi tại GATS Academy là giúp đội ngũ nhân sự doanh nghiệp làm chủ công nghệ trí tuệ nhân tạo, biến các thuật toán phức tạp thành luồng công việc tự động hóa thực chiến mang lại giá trị đo lường được.",
    timeline: [
      { year: "2015", title: "Nghiên Cứu Sinh Khoa Học Dữ Liệu & AI" },
      { year: "2018", title: "Trưởng Nhóm Tự Động Hóa Workflow Doanh Nghiệp" },
      { year: "2021", title: "Cố Vấn Chuyển Đổi Số AI Cho 50+ Tập Đoàn" },
      { year: "2024", title: "Giám Đốc Đào Tạo & Cố Vấn Trưởng GATS Academy" },
    ],
  },
  {
    id: 2,
    name: "ThS. Nguyễn Hoàng Nam",
    role: "Trưởng Ban Bảo Mật Dữ Liệu AI Doanh Nghiệp",
    org: "GATS Data Privacy Shield",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    story:
      "An toàn thông tin và bảo mật dữ liệu là xương sống trong quá trình chuyển đổi số AI. Tôi tập trung xây dựng giải pháp đào tạo giúp doanh nghiệp ứng dụng mô hình LLM và công cụ AI hiệu quả nhưng vẫn đảm bảo tuyệt đối an toàn dữ liệu nội bộ.",
    timeline: [
      { year: "2014", title: "Thạc Sĩ An Toàn Thông Tin - ĐHQG" },
      { year: "2017", title: "Chuyên Gia Bảo Mật Hệ Thống Dữ Liệu Enterprise" },
      { year: "2021", title: "Tác Giả Khung Chuẩn Bảo Mật AI Doanh Nghiệp" },
      { year: "2024", title: "Trưởng Ban Bảo Mật Dữ Liệu AI tại GATS" },
    ],
  },
  {
    id: 3,
    name: "Chuyên Gia Lê Thanh Vân",
    role: "Trưởng Ban Tự Động Hóa Workflow & Prompt Engineering",
    org: "GATS Automation Lab",
    story:
      "Đồng hành truyền cảm hứng và đào tạo trực tiếp cho hơn 15,000 học viên. Tôi hướng dẫn từng bước thiết kế kịch bản Prompt chuyên sâu và kết nối chuỗi công cụ AI (Make/n8n/LLM) nhằm cắt giảm 80% thời gian xử lý công việc thủ công.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { year: "2016", title: "Kỹ Sư Tối Ưu Hóa Quy Trình Vận Hành" },
      { year: "2019", title: "Trưởng Phòng Sáng Tạo Nội Dung & AI Applied" },
      { year: "2022", title: "Chuyên Gia Đào Tạo Prompting Chuyên Sâu" },
      { year: "2024", title: "Trưởng Ban Tự Động Hóa Workflow GATS" },
    ],
  },
];

export function InstructorSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // Auto-rotate mentors every 3 seconds (3000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mentorsList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentMentor = mentorsList[activeIndex];

  const getAvatarUrl = (mentor: (typeof mentorsList)[0]) => {
    if (imgErrors[mentor.id]) {
      return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80";
    }
    return mentor.avatar;
  };

  return (
    <section className="w-full py-24 bg-[#FFFDF9] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl" className="space-y-24">
        
        {/* Part 1: Dynamic Top Profile Section (Auto-Rotates Every 3s) */}
        <div>
          {/* Top Tagline & Headline in Vietnamese */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-2 font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 inline-block">
              GIẢNG VIÊN TRƯỞNG &amp; CỐ VẤN CHUYÊN MÔN
            </span>

            <AnimatePresence mode="wait">
              <motion.h2
                key={`headline-${currentMentor.id}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className="text-[3.6rem] sm:text-[4.6rem] font-heading font-extrabold text-[#0B0F17] leading-tight mt-2"
              >
                Xin chào, Tôi là {currentMentor.name}
              </motion.h2>
            </AnimatePresence>
            <p className="text-[1.5rem] text-slate-500 font-medium mt-2">
              {currentMentor.role}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Dynamic Large Circular Avatar with Amber Glow */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative size-[300px] sm:size-[380px]">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-[#FF6B00] via-amber-400 to-transparent blur-xl opacity-40 pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`avatar-${currentMentor.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="relative size-full rounded-full border-4 border-[#FF6B00] overflow-hidden shadow-2xl bg-white p-2"
                  >
                    <img
                      src={getAvatarUrl(currentMentor)}
                      alt={currentMentor.name}
                      className="size-full object-cover rounded-full"
                      onError={() => {
                        setImgErrors((prev) => ({ ...prev, [currentMentor.id]: true }));
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Dynamic My Story & Dynamic My Experience Timeline */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-8">
              {/* Dynamic Câu Chuyện Chuyên Gia */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`story-${currentMentor.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full"
                >
                  <h3 className="text-[2.2rem] font-heading font-extrabold text-[#0B0F17] mb-3">
                    Câu Chuyện Chuyên Gia
                  </h3>
                  <p className="text-[1.6rem] text-slate-600 leading-relaxed font-normal">
                    {currentMentor.story}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Dynamic Kinh Nghiệm & Cột Mốc Sự Nghiệp */}
              <div className="w-full pt-4 border-t border-slate-200">
                <h3 className="text-[2.2rem] font-heading font-extrabold text-[#0B0F17] mb-6">
                  Kinh Nghiệm &amp; Cột Mốc Sự Nghiệp
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`timeline-${currentMentor.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="relative pl-6 space-y-6 border-l-2 border-[#FF6B00]"
                  >
                    {currentMentor.timeline.map((item, index) => (
                      <div key={index} className="relative flex items-center gap-4">
                        <div className="absolute -left-[31px] size-4 rounded-full bg-[#FF6B00] border-4 border-white shadow-md" />
                        <span className="font-mono text-[1.4rem] font-extrabold text-[#FF6B00] w-16 shrink-0">
                          {item.year}
                        </span>
                        <span className="text-[1.5rem] font-semibold text-slate-800">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Tổ Chức & Thương Hiệu Đồng Hành */}
              <div className="w-full pt-6 border-t border-slate-200">
                <h4 className="text-[1.4rem] font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Đơn Vị &amp; Thương Hiệu Đồng Hành
                </h4>
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  {brandBadges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 rounded-xl bg-white border border-amber-200/80 text-slate-700 font-mono text-[1.2rem] font-bold uppercase tracking-wider shadow-xs hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
                    >
                      🏆 {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Uniform 3-Card Mentor Grid (Full Photo Cards in Vietnamese) */}
        <div className="pt-12 border-t border-amber-200/60">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-2 font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 inline-block">
              ĐỘI NGŨ CHUYÊN GIA CỐ VẤN
            </span>
            <h2 className="text-[3.6rem] sm:text-[4.6rem] font-heading font-extrabold text-[#0B0F17] leading-tight mt-2">
              Đội Ngũ Chuyên Gia Cố Vấn Doanh Nghiệp
            </h2>

            {/* Slider Dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {mentorsList.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                    i === activeIndex ? "w-8 bg-[#FF6B00]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Select mentor ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Uniform 3-Card Full Photo Layout matching exact request */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {mentorsList.map((mentor, index) => {
              const isSelected = index === activeIndex;

              return (
                <div
                  key={mentor.id}
                  onClick={() => setActiveIndex(index)}
                  className={`cursor-pointer transition-all duration-500 flex flex-col justify-between p-4 rounded-3xl bg-white border shadow-lg ${
                    isSelected
                      ? "border-[#FF6B00] shadow-amber-950/15 scale-103"
                      : "border-amber-200/80 shadow-amber-950/5 opacity-85 hover:opacity-100 hover:border-amber-300"
                  }`}
                >
                  <div className="flex flex-col justify-between h-full">
                    {/* Uniform Portrait Image Frame */}
                    <div className="relative aspect-3/4 rounded-2xl overflow-hidden mb-4 bg-slate-900">
                      <img
                        src={getAvatarUrl(mentor)}
                        alt={mentor.name}
                        className="size-full object-cover hover:scale-105 transition-transform duration-700"
                        onError={() => {
                          setImgErrors((prev) => ({ ...prev, [mentor.id]: true }));
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      {isSelected && (
                        <span className="absolute top-4 right-4 bg-[#FF6B00] text-white font-extrabold text-[1.1rem] px-3 py-1 rounded-full shadow-md font-mono">
                          Tiêu Điểm
                        </span>
                      )}
                    </div>

                    {/* Mentor Name & Vietnamese Role */}
                    <div className="px-2 pb-2">
                      <h3 className={`text-[2rem] font-heading font-extrabold mb-1.5 transition-colors ${
                        isSelected ? "text-[#FF6B00]" : "text-[#0B0F17]"
                      }`}>
                        {mentor.name}
                      </h3>
                      <p className="text-[1.3rem] font-semibold text-slate-500 leading-snug">
                        {mentor.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </Container>
    </section>
  );
}
