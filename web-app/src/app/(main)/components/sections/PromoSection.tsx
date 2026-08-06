import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Building, Award, Users, BookOpen } from "lucide-react";

export function PromoSection() {
  return (
    <section className="w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl" className="flex flex-col gap-16">
        
        {/* European Enterprise Banner (Warm Light Amber Style) */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-linear-to-r from-[#FF6B00] via-[#FF8800] to-[#E05E00] text-white p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-white">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 size-[450px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content */}
          <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
            <span className="text-[1.2rem] font-bold text-amber-200 uppercase tracking-wider bg-white/20 px-3.5 py-1 rounded-md backdrop-blur-md border border-white/30 font-mono">
              GIẢI PHÁP ĐÀO TẠO &amp; CHUYỂN ĐỔI SỐ B2B
            </span>
            <h2 className="text-[3.2rem] sm:text-[4.2rem] font-heading font-extrabold text-white leading-tight">
              Sẵn Sàng Kiến Tạo Lợi Thế Cạnh Tranh Với AI?
            </h2>
            <p className="text-[1.6rem] text-white/95 leading-relaxed font-normal mb-4">
              GATS Academy đồng hành cùng doanh nghiệp từ việc khảo sát năng lực, thiết kế lộ trình đào tạo riêng biệt đến kiểm thử đo lường chỉ số ROI rõ ràng.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="rounded-xl px-8 h-13 text-[1.5rem] font-extrabold bg-white hover:bg-slate-100 text-[#FF6B00] shadow-2xl transition-all border-none cursor-pointer"
              >
                <Link href="/courses" className="flex items-center gap-2.5">
                  <span>Đăng ký tư vấn Enterprise</span>
                  <ArrowRight className="size-4 text-[#FF6B00]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Highlight Badge Card */}
          <div className="relative z-10 w-full md:w-auto bg-white/15 backdrop-blur-xl rounded-2xl p-6 border border-white/30 max-w-sm shrink-0">
            <div className="text-[1.2rem] font-bold text-amber-200 mb-2 uppercase tracking-wide">
              Bảo Chứng Chất Lượng GATS
            </div>
            <p className="text-[1.4rem] text-white leading-normal mb-4 font-normal italic">
              &quot;Giúp doanh nghiệp đo lường chỉ số ROI chuyển đổi số rõ ràng ngay trong quý đầu tiên triển khai.&quot;
            </p>
            <div className="text-[1.2rem] font-bold text-white/80">
              — Đội ngũ Cố vấn Châu Âu &amp; GATS Academy
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
