import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { value: "25K+", label: "Học viên tham gia" },
  { value: "899+", label: "Chương trình đào tạo" },
  { value: "158", label: "Chuyên gia AI" },
  { value: "100%", label: "Tỉ lệ hài lòng" },
];

export function PromoSection() {
  return (
    <section className="w-full py-16 bg-white">
      <Container size="xl" className="flex flex-col gap-24">
        
        {/* Banner Section */}
        <div className="relative w-full rounded-[2rem] overflow-hidden bg-linear-to-r from-[#d1fae5] via-[#f3e8ff] to-[#fee2e2] px-12 py-16 md:p-24 flex flex-col md:flex-row items-center justify-between">
          
          {/* Left Content */}
          <div className="relative z-10 max-w-[48rem] flex flex-col items-start gap-4">
            <p className="text-[1.4rem] font-bold text-slate-600 uppercase tracking-wide">
              Sẵn sàng làm chủ
            </p>
            <h2 className="text-[3.6rem] font-bold text-[#111827] font-heading leading-tight">
              Công Nghệ Trí Tuệ Nhân Tạo
            </h2>
            <p className="text-[1.6rem] text-slate-600 leading-relaxed mb-4">
              Nâng tầm kỹ năng và kiến tạo lợi thế cạnh tranh với chương trình đào tạo chuyên sâu từ GATS Academy.
            </p>
            <Button
              asChild
              className="rounded-full px-10 h-[4.8rem] text-[1.6rem] font-bold bg-[#ff782d] hover:bg-[#e66a26] text-white shadow-lg transition-all hover:scale-105"
            >
              <Link href="/courses">
                Khám phá ngay
              </Link>
            </Button>
          </div>

          {/* Right Floating Icons (Hidden on mobile for better view, visible on md and up) */}
          <div className="relative w-[50%] h-full hidden md:block z-0 min-h-[300px]">
             <img src="/images/ads-on/icon-1.svg" className="absolute top-[10%] left-[5%] w-[6rem] animate-[bounce_6s_infinite]" alt="" />
             <img src="/images/ads-on/icon-2.svg" className="absolute top-[5%] left-[30%] w-[7rem] animate-[bounce_5s_infinite]" alt="" />
             <img src="/images/ads-on/icon-3.svg" className="absolute top-[20%] right-[25%] w-[6rem] animate-[bounce_7s_infinite]" alt="" />
             <img src="/images/ads-on/icon-4.svg" className="absolute top-[5%] right-[5%] w-[5rem] animate-[bounce_6s_infinite]" alt="" />
             
             <img src="/images/ads-on/icon-5.svg" className="absolute bottom-[15%] left-[15%] w-[6rem] animate-[bounce_5s_infinite]" alt="" />
             <img src="/images/ads-on/icon-6.svg" className="absolute bottom-[5%] left-[40%] w-[7rem] animate-[bounce_8s_infinite]" alt="" />
             <img src="/images/ads-on/icon-7.svg" className="absolute bottom-[20%] right-[35%] w-[6rem] animate-[bounce_4s_infinite]" alt="" />
             <img src="/images/ads-on/icon-8.svg" className="absolute bottom-[10%] right-[5%] w-[8rem] animate-[bounce_7s_infinite]" alt="" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="flex flex-col items-center justify-center p-12 bg-[#f8f9fa] rounded-[2rem] transition-transform duration-300 hover:-translate-y-2"
            >
              <h3 className="text-[4.2rem] font-black text-[#ff782d] font-heading mb-4 leading-none">
                {stat.value}
              </h3>
              <p className="text-[1.6rem] font-bold text-[#111827]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}
