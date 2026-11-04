"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shineColor?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent transition-all duration-300",
        disabled
          ? ""
          : "animate-shiny-text bg-[linear-gradient(120deg,rgba(0,112,235,1)_0%,rgba(255,118,34,1)_35%,rgba(255,255,255,1)_50%,rgba(0,112,235,1)_65%,rgba(255,118,34,1)_100%)] bg-[length:200%_100%]",
        className
      )}
      style={{
        animationDuration,
      }}
    >
      {text}
    </span>
  );
}
