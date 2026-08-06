"use client";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Bot, Brain } from "lucide-react";
import { useState } from "react";

const thinkingRobotFallbacks = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
];

export function AIScienceBanner() {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <section className="w-full py-20 bg-linear-to-r from-[#FF6B00] via-[#FF8800] to-[#E05E00] text-white overflow-hidden relative shadow-xl">
      {/* Background Subtle Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />

      <Container size="xl" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[1.2rem] font-bold font-mono uppercase tracking-wider backdrop-blur-md border border-white/30">
              <Sparkles className="size-4 text-amber-200" />
              <span>Khai Phá Sức Mạnh Trí Tuệ Nhân Tạo</span>
            </div>

            <h2 className="text-[3.6rem] sm:text-[4.8rem] md:text-[5.2rem] font-heading font-extrabold text-white leading-[1.1] tracking-tight">
              AI Is No Longer <br />
              <span className="text-amber-200 underline decoration-white/40 underline-offset-8">
                Science Fiction.
              </span>
            </h2>

            <p className="text-[1.6rem] sm:text-[1.8rem] text-white/95 leading-relaxed font-medium max-w-xl">
              Trí tuệ nhân tạo không còn là câu chuyện trong phim viễn tưởng. Khóa học thực chiến tại GATS sẽ giúp bạn hiểu chính xác AI vận hành ra sao và khai phá sức mạnh AI để kiến tạo sự bứt phá vượt trội trong công việc!
            </p>

            <div className="pt-2">
              <Button
                asChild
                className="bg-white hover:bg-slate-100 text-[#FF6B00] rounded-xl px-9 h-14 text-[1.6rem] font-extrabold shadow-2xl transition-all hover:scale-105 border-none cursor-pointer"
              >
                <Link href="/courses" className="flex items-center gap-2">
                  <span>Khám Phá Ngay</span>
                  <ArrowRight className="size-5 text-[#FF6B00]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Showcase: Thinking AI Robot with Multi-Tier Fallback */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div className="relative w-full max-w-[500px] aspect-4/3 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl bg-slate-950 flex items-center justify-center">
              
              {/* Fallback Graphic Layer */}
              <div className="absolute inset-0 bg-linear-to-tr from-slate-950 via-slate-900 to-amber-950/70 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                <div className="relative mb-3">
                  <Bot className="size-24 text-amber-400 animate-pulse" />
                  <Brain className="size-8 text-cyan-400 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <h4 className="text-xl font-heading font-extrabold text-white">
                  Thinking AI Neural Core
                </h4>
                <p className="text-xs text-amber-200/80 font-mono mt-1">
                  Pondering &amp; Reasoning Engine
                </p>
              </div>

              {/* Real Photographic Image Layer */}
              <img
                src={thinkingRobotFallbacks[imgIdx]}
                alt="Robot AI đang suy nghĩ - GATS AI Neural Thinking Robot"
                className="relative z-10 size-full object-cover transition-opacity duration-500"
                onError={() => {
                  setImgIdx((prev) => (prev + 1) % thinkingRobotFallbacks.length);
                }}
              />
              <div className="absolute inset-0 z-20 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
                <span className="font-mono text-[1.2rem] font-bold text-white uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20">
                  🤖 Pondering AI Robot Core
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
