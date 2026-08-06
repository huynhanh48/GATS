"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

const thinkingRobotFallbacks = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
];

export function AIScienceBanner() {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <section className="relative w-full py-14 sm:py-16 min-h-[360px] sm:min-h-[400px] flex items-center overflow-hidden text-white bg-slate-950 shadow-2xl border-y border-white/10">
      {/* Full-Bleed Background Image Layer (Robot AI Artwork in Natural Colors) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-102"
        style={{ backgroundImage: `url('${thinkingRobotFallbacks[imgIdx]}')` }}
      />

      {/* Sleek Dark Gradient Overlay (Natural Image Visibility on Right, High Readability on Left) */}
      <div className="absolute inset-0 bg-linear-to-r from-[#0B0F17]/95 via-[#0B0F17]/70 via-55% to-transparent pointer-events-none" />

      {/* Subtle Glowing Amber Accent Orb on Left Edge */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-20 size-[350px] bg-[#FF6B00]/25 rounded-full blur-3xl pointer-events-none" />

      <Container size="xl" className="relative z-10 w-full">
        <div className="max-w-3xl flex flex-col items-start space-y-6">
          {/* Top Sub-tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-[1.2rem] font-bold font-mono uppercase tracking-wider backdrop-blur-md border border-[#FF6B00]/30 shadow-lg">
            <Sparkles className="size-4 text-[#FF6B00]" />
            <span>Khai Phá Sức Mạnh Trí Tuệ Nhân Tạo</span>
          </div>

          {/* Main Title */}
          <h2 className="text-[3.8rem] sm:text-[5rem] md:text-[5.6rem] font-heading font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-lg">
            AI Is No Longer <br />
            <span className="text-[#FF6B00] underline decoration-[#FF6B00]/40 underline-offset-8">
              Science Fiction.
            </span>
          </h2>

          {/* Subtitle Paragraph */}
          <p className="text-[1.65rem] sm:text-[1.85rem] text-slate-200 leading-relaxed font-normal max-w-2xl drop-shadow-md">
            Trí tuệ nhân tạo không còn là câu chuyện trong phim viễn tưởng. Khóa học thực chiến tại GATS sẽ giúp bạn hiểu chính xác AI vận hành ra sao và khai phá sức mạnh AI để kiến tạo sự bứt phá vượt trội trong công việc!
          </p>

          {/* Action CTA Button in Vibrant Amber */}
          <div className="pt-3">
            <Button
              asChild
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl px-10 h-15 text-[1.65rem] font-extrabold shadow-2xl shadow-[#FF6B00]/30 transition-all hover:scale-105 border-none cursor-pointer"
            >
              <Link href="/courses" className="flex items-center gap-2.5">
                <span>Khám Phá Ngay</span>
                <ArrowRight className="size-5 text-white" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>

      {/* Hidden Error Listener Image for Fallback cycling */}
      <img
        src={thinkingRobotFallbacks[imgIdx]}
        alt=""
        className="hidden"
        onError={() => {
          setImgIdx((prev) => (prev + 1) % thinkingRobotFallbacks.length);
        }}
      />
    </section>
  );
}
