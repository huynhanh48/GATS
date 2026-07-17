import React from "react";
import { BrainCircuit, Sparkles, Bot, Cpu, Network, Palette, Aperture, Zap } from "lucide-react";

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

export function LogoTicker() {
  return (
    <section className="w-full py-12 z-20 relative flex flex-col items-center justify-center bg-transparent border-t border-border/50 overflow-hidden">
      <div className="w-full relative z-10">
        <div className="absolute top-0 bottom-0 left-0 w-[20%] z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-[20%] z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        
        <div className="w-full px-8 flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Tích hợp các mô hình AI hàng đầu
          </div>
        </div>

        <div className="flex overflow-hidden z-20 p-4 [--gap:2rem] gap-[var(--gap)]">
          <div className="flex gap-[var(--gap)] animate-[marquee_40s_linear_infinite]">
            {[...aiModels, ...aiModels, ...aiModels].map((model, i) => {
              const Icon = model.Icon;
              return (
                <div key={i} className="flex items-center justify-center">
                  <div className="relative group w-48 h-14 bg-background/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(0,112,235,0.1)] transition-all duration-300">
                    <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                      {model.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
