"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LightRaysProps {
  className?: string;
  color1?: string; // Brand Blue (#0070EB)
  color2?: string; // Brand Orange (#FF7622)
  speed?: number;
}

export function LightRays({
  className = "",
  color1 = "0, 112, 235",
  color2 = "255, 118, 34",
  speed = 1,
}: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Light ray parameters
    const rays = [
      { angle: -0.3, speed: 0.0008 * speed, size: 0.45, color: color1, opacity: 0.12 },
      { angle: 0.2, speed: -0.0006 * speed, size: 0.55, color: color2, opacity: 0.1 },
      { angle: 0.5, speed: 0.0005 * speed, size: 0.38, color: color1, opacity: 0.09 },
      { angle: -0.6, speed: -0.0007 * speed, size: 0.5, color: color2, opacity: 0.08 },
    ];

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 1;

      rays.forEach((ray, i) => {
        ctx.save();
        const currentAngle = ray.angle + Math.sin(t * ray.speed + i) * 0.15;
        const centerX = width * (0.3 + 0.4 * Math.cos(t * ray.speed * 0.5 + i));
        const centerY = height * 0.1;

        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle);

        const gradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          Math.max(width, height) * ray.size
        );
        gradient.addColorStop(0, `rgba(${ray.color}, ${ray.opacity})`);
        gradient.addColorStop(0.5, `rgba(${ray.color}, ${ray.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${ray.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(width, height) * ray.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color1, color2, speed]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-80 transition-opacity duration-1000"
      />
      {/* Gentle mesh overlay overlaying light canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(249,249,254,0.7)_70%,rgba(249,249,254,1)_100%)]" />
    </div>
  );
}
