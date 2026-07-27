import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function GrowUsSection() {
  return (
    <section className="w-full pt-0 pb-24 bg-white overflow-hidden">
      <Container size="xl" className="flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24">

        {/* Left Side: Illustration */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          <img
            src="/images/us/vector-bg.svg"
            alt="Students learning and reading"
            className="w-full max-w-[60rem] object-contain"
          />
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <h2 className="text-[3.2rem] md:text-[3.8rem] font-bold text-[#111827] font-heading leading-[1.3] mb-10">
            Phát triển sự nghiệp cùng <br/> <span className="text-primary">GATS Academy</span>
          </h2>

          <ul className="flex flex-col gap-5 mb-12">
            <li className="flex items-center gap-4">
              <Check className="w-[2rem] h-[2rem] text-[#10b981]" strokeWidth={3} />
              <span className="text-[1.8rem] font-medium text-slate-700">Chương trình học thực chiến</span>
            </li>
            <li className="flex items-center gap-4">
              <Check className="w-[2rem] h-[2rem] text-[#10b981]" strokeWidth={3} />
              <span className="text-[1.8rem] font-medium text-slate-700">Đội ngũ chuyên gia giàu kinh nghiệm</span>
            </li>
            <li className="flex items-center gap-4">
              <Check className="w-[2rem] h-[2rem] text-[#10b981]" strokeWidth={3} />
              <span className="text-[1.8rem] font-medium text-slate-700">Cập nhật công nghệ AI mới nhất</span>
            </li>
            <li className="flex items-center gap-4">
              <Check className="w-[2rem] h-[2rem] text-[#10b981]" strokeWidth={3} />
              <span className="text-[1.8rem] font-medium text-slate-700">Cộng đồng hỗ trợ học tập trọn đời</span>
            </li>
          </ul>

          <Button
            asChild
            className="rounded-full px-10 h-[4.8rem] text-[1.6rem] font-bold bg-[#ff782d] hover:bg-[#e66a26] text-white transition-all shadow-md hover:shadow-lg"
          >
            <Link href="/courses">
              Bắt đầu hành trình
            </Link>
          </Button>
        </div>

      </Container>
    </section>
  );
}
