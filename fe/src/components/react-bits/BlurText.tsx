"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  onAnimationComplete?: () => void;
}

export function BlurText({
  text,
  delay = 100,
  className = "",
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const yOffset = direction === "top" ? -24 : 24;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay / 1000,
      },
    },
  };

  const itemVariants = {
    hidden: {
      filter: "blur(12px)",
      opacity: 0,
      y: yOffset,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      onAnimationComplete={onAnimationComplete}
      className={cn("inline-flex flex-wrap gap-[0.25em]", className)}
    >
      {elements.map((el, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
        >
          {el === " " ? "\u00A0" : el}
        </motion.span>
      ))}
    </motion.div>
  );
}
