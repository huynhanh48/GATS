import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function GrowUsSection() {
  return (
    <section className="relative w-full py-24 md:py-32 bg-[#FDF3E7] overflow-hidden">
        {/* Background Illustrations */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-between items-end pb-8">
          <img
            src="/images/us/illustration-2.svg"
            alt="Left decoration"
            className="h-[55%] md:h-[70%] w-auto max-w-[35%] md:max-w-[40%] object-contain object-left-bottom"
          />
          <img
            src="/images/us/illustration-1.svg"
            alt="Right decoration"
            className="h-[55%] md:h-[70%] w-auto max-w-[35%] md:max-w-[40%] object-contain object-right-bottom"
          />
        </div>

      
      <Container size="lg" className="relative z-10 flex flex-col items-center justify-center text-center mx-auto px-4">
        <h2 className="text-[3.2rem] md:text-[4.6rem] font-extrabold text-[#0B272C] font-heading leading-[1.2] mb-6">
          Phát triển sự nghiệp cùng <br className="hidden md:block" /> GATS Academy
        </h2>
        
        <p className="text-[1.6rem] md:text-[1.8rem] text-slate-700 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
          Chương trình học thực chiến, cập nhật xu hướng AI mới nhất cùng đội ngũ chuyên gia giàu kinh nghiệm. Đồng hành trọn đời trên con đường thăng tiến của bạn.
        </p>

        <Button
          asChild
          className="rounded-full px-12 h-[5.4rem] text-[1.6rem] font-bold bg-[#0B272C] hover:bg-[#0B272C]/90 text-white transition-all shadow-md hover:shadow-lg"
        >
          <Link href="/courses">
            Bắt đầu hành trình
          </Link>
        </Button>
      </Container>
    </section>
  );
}
