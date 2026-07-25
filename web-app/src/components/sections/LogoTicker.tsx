"use client";

import React from "react";
import {
  BrainCircuit,
  Sparkles,
  Bot,
  Cpu,
  Network,
  Palette,
  Aperture,
  Zap,
} from "lucide-react";
import { AnimatedContent } from "@/components/react-bits";

const aiModels = [
  { name: "OpenAI GPT-4o", Icon: BrainCircuit },
  { name: "Google Gemini 1.5", Icon: Sparkles },
  { name: "Anthropic Claude 3.5", Icon: Bot },
  { name: "Kimi AI", Icon: Cpu },
  { name: "Meta Llama 3", Icon: Network },
  { name: "Midjourney v6", Icon: Palette },
  { name: "Stable Diffusion 3", Icon: Aperture },
  { name: "xAI Grok 2", Icon: Zap },
];

function ModelChip({
  name,
  Icon,
}: {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="group relative flex h-13 w-52 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-accent/50 hover:shadow-[0_4px_16px_rgba(0,112,235,0.08)]">
      <div className="flex items-center gap-2.5 text-xs font-semibold tracking-tight text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon className="size-4 text-brand-primary transition-transform duration-300 group-hover:scale-110" />
        <span>{name}</span>
      </div>
    </div>
  );
}

export function LogoTicker() {
  const loop = [...aiModels, ...aiModels];

  return (
    <section className="relative z-20 flex w-full flex-col items-center justify-center overflow-hidden border-t border-border/60 bg-card/30 py-12">
      <div className="relative z-10 w-full">
        <AnimatedContent distance={20} className="mb-8 flex w-full justify-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-background/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-primary shadow-xs">
            <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <span>TÍCH HỢP CÁC MÔ HÌNH AI & TÁC NHÂN HÀNG ĐẦU</span>
          </div>
        </AnimatedContent>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent" />

          <div
            className="overflow-x-auto overflow-y-hidden scroll-smooth px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex w-max gap-6 motion-safe:animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
              {loop.map((model, i) => (
                <ModelChip key={`${model.name}-${i}`} name={model.name} Icon={model.Icon} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
