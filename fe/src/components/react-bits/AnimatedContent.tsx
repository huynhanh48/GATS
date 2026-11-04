"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
}

export function AnimatedContent({
  children,
  className = "",
  distance = 30,
  direction = "vertical",
  reverse = false,
  duration = 0.6,
  delay = 0,
  threshold = 0.15,
}: AnimatedContentProps) {
  const axis = direction === "vertical" ? "y" : "x";
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      initial={{
        opacity: 0,
        [axis]: offset,
      }}
      whileInView={{
        opacity: 1,
        [axis]: 0,
      }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
