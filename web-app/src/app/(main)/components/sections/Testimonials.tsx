"use client";

import { Star } from "lucide-react";
import { Container } from "@/components/layout/Container";

const testimonials = [
  {
    quote:
      "Tôi luôn biết AI là tương lai nhưng không biết bắt đầu từ đâu. Khóa học tại GATS đã cho tôi kỹ năng thực chiến để làm chủ các công cụ AI Agent. Hiện tại tôi đã áp dụng tự động hóa luồng công việc thành công tại công ty và tiết kiệm hàng chục giờ làm việc mỗi tuần!",
    author: "Anh Quốc Bảo",
    age: "32 tuổi",
    role: "Lập Trình Viên Phần Mềm",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    quote:
      "Tác động đến sự nghiệp của tôi thực sự kinh ngạc! Khách hàng hoàn toàn bị thuyết phục bởi các sản phẩm thiết kế ứng dụng AI sáng tạo. Tôi nhận được các dự án lớn hơn, gia tăng thu nhập rõ rệt và cảm thấy hào hứng hơn bao giờ hết.",
    author: "Anh Đức Tuấn",
    age: "35 tuổi",
    role: "Designer UI/UX & AI Creator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  },
  {
    quote:
      "Trước đây tôi bị kẹt trong việc xử lý dữ liệu thủ công. Khóa học GATS đã khai phá cách dùng AI để dự báo hành vi và tối ưu quy trình. Công việc của tôi trở nên hiệu quả, chuẩn xác và mang lại giá trị thiết thực hơn hẳn cho công ty.",
    author: "Chị Minh Anh",
    age: "28 tuổi",
    role: "Chuyên Viên Phân Tích Dữ Liệu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  },
  {
    quote:
      "Khóa học mang lại trải nghiệm tuyệt vời! Từ một người chưa biết gì về AI, giờ đây tôi đã tự tạo được kịch bản Content & Video AI hoàn chỉnh. Sếp và đồng nghiệp rất ấn tượng với tốc độ bàn giao công việc của tôi!",
    author: "Chị Phương Thảo",
    age: "27 tuổi",
    role: "Chuyên Viên Marketing B2B",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
];

export function Testimonials() {
  return (
    <section className="relative z-20 w-full overflow-hidden bg-[#FAF8F5] text-[#0B0F17] py-24 border-t border-amber-200/60">
      <Container size="xl">
        {/* Section Headline in Vietnamese */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider mb-2 font-mono bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 inline-block">
            CẢM NHẬN HỌC VIÊN THỰC TẾ
          </span>
          <h2 className="text-[3.6rem] sm:text-[4.8rem] font-heading font-extrabold text-[#0B0F17] leading-tight mt-2">
            Lắng Nghe Câu Chuyện &amp; Kết Quả Thực Tế
          </h2>
        </div>

        {/* 2x2 Grid Layout in Vietnamese */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-amber-200/80 shadow-xl shadow-amber-950/5 flex flex-col justify-between hover:border-[#FF6B00]/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Circular Student Avatar */}
                <div className="size-20 sm:size-24 rounded-full overflow-hidden shrink-0 border-2 border-[#FF6B00] shadow-md">
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                <div className="flex-1">
                  {/* 5 Golden Stars */}
                  <div className="flex items-center gap-1 text-[#FF6B00] mb-4">
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                  </div>

                  {/* Quote Paragraph */}
                  <p className="text-[1.4rem] sm:text-[1.5rem] text-slate-700 font-normal leading-relaxed mb-6">
                    &quot;{item.quote}&quot;
                  </p>

                  {/* Student Name, Age & Role */}
                  <div className="text-[1.4rem] font-bold text-[#0B0F17]">
                    {item.author}, {item.age}, <span className="text-slate-500 font-normal">{item.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
