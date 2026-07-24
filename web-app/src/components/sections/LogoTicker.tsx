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

const aiModels = [
  { name: "OpenAI", Icon: BrainCircuit },
  { name: "Gemini", Icon: Sparkles },
  { name: "Claude", Icon: Bot },
  { name: "Kimi", Icon: Cpu },
  { name: "Llama", Icon: Network },
  { name: "Midjourney", Icon: Palette },
  { name: "Stable Diffusion", Icon: Aperture },
  { name: "Grok", Icon: Zap },
];

function ModelChip({
  name,
  Icon,
}: {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative group h-14 w-48 shrink-0 rounded-xl border border-border bg-background/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(0,112,235,0.1)]">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        {name}
      </div>
    </div>
  );
}

export function LogoTicker() {
  const loop = [...aiModels, ...aiModels];

  return (
    <section className="relative z-20 flex w-full flex-col items-center justify-center overflow-hidden border-t border-border/50 bg-transparent py-12">
      <div className="relative z-10 w-full">
        <div className="mb-10 flex w-full justify-center px-8">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/15 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm sm:text-sm">
            Tích hợp các mô hình AI hàng đầu
          </div>
        </div>

        {/* Manual scroll on touch / overflow; CSS marquee for continuous motion */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[12%] bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[12%] bg-linear-to-l from-background to-transparent" />

          <div
            className="overflow-x-auto overflow-y-hidden scroll-smooth px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex w-max gap-8 motion-safe:animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
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
