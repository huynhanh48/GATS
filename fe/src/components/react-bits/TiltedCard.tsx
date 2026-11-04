"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotateX?: number;
  maxRotateY?: number;
  scaleOnHover?: number;
  glareOpacity?: number;
}

export function TiltedCard({
  children,
  className = "",
  maxRotateX = 8,
  maxRotateY = 8,
  scaleOnHover = 1.02,
  glareOpacity = 0.15,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxRotateX, -maxRotateX]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxRotateY, maxRotateY]);

  // Glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ duration: 0.2 }}
      className={cn("relative transition-all duration-200", className)}
    >
      {children}

      {/* Glare sheen */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}), transparent 60%)`,
        }}
      />
    </motion.div>
  );
}
