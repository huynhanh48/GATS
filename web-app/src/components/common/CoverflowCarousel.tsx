"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const experts = [
  { id: 1, src: "/professional/person-1.jpg", name: "Chuyên gia GATS 1", role: "AI Research Lead" },
  { id: 2, src: "/professional/person-2.jpg", name: "Chuyên gia GATS 2", role: "Machine Learning Engineer" },
  { id: 3, src: "/professional/person-3.jpg", name: "Chuyên gia GATS 3", role: "Data Scientist" },
  { id: 4, src: "/professional/person-4.jpg", name: "Chuyên gia GATS 4", role: "AI Solutions Architect" },
  { id: 5, src: "/professional/person-5.jpg", name: "Chuyên gia GATS 5", role: "NLP Specialist" },
];

const CARD_WIDTH = 300;
const VISIBLE = 2; // cards shown on each side

export function CoverflowCarousel() {
  const [active, setActive] = useState(2);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const n = experts.length;

  const goNext = useCallback(() => {
    setActive((p) => (p + 1) % n);
  }, [n]);

  const goPrev = useCallback(() => {
    setActive((p) => (p - 1 + n) % n);
  }, [n]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(goNext, 3000);
    return () => clearInterval(timer);
  }, [autoPlay, goNext]);

  const getCardProps = (index: number) => {
    let distance = index - active;
    if (distance > Math.floor(n / 2)) distance -= n;
    if (distance < -Math.floor(n / 2)) distance += n;

    const sign = distance === 0 ? 0 : Math.sign(distance);
    const abs = Math.abs(distance);
    const visible = abs <= VISIBLE;

    // Cinematic values
    // Cinematic values - adapted for mobile responsive scale
    const cardWidth = isMobile ? 220 : CARD_WIDTH;
    const x = sign * (abs === 0 ? 0 : (isMobile ? 120 : 240) + (abs - 1) * (isMobile ? 60 : 140));
    const rotateY = sign * (abs === 0 ? 0 : -52);
    const scale = abs === 0 ? 1 : Math.max(0.6, (isMobile ? 0.7 : 0.75) - (abs - 1) * 0.08);
    const brightness = abs === 0 ? 1 : Math.max(0.3, 0.55 - (abs - 1) * 0.1);
    const zIndex = abs === 0 ? 50 : 50 - abs * 10;
    const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0.5;

    return { distance, abs, sign, visible, x, rotateY, scale, brightness, zIndex, opacity, cardWidth };
  };

  return (
    <section
      className="w-full py-20 flex flex-col items-center relative overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Cinematic Spotlight Backdrop */}
      <div
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/15 rounded-full blur-[130px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(0, 112, 235, 0.2) 0%, transparent 80%)"
        }}
      />

      {/* Stage */}
      <div
        className="relative w-full h-[380px] md:h-[480px] flex items-center justify-center z-10"
        style={{ perspective: "1400px" }}
      >
        {experts.map((expert, index) => {
          const { visible, x, rotateY, scale, brightness, zIndex, opacity, abs, cardWidth } = getCardProps(index);
          const isCenter = abs === 0;

          if (!visible) return null;

          return (
            <motion.div
              key={expert.id}
              className="absolute cursor-pointer"
              style={{ width: cardWidth, transformStyle: "preserve-3d" }}
              animate={{
                x,
                rotateY,
                scale,
                opacity,
                zIndex,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={() => {
                setActive(index);
                setAutoPlay(false);
              }}
            >
              {/* Card */}
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  height: cardWidth * 1.35,
                  boxShadow: isCenter
                    ? "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px rgba(0, 112, 235, 0.3)"
                    : "0 10px 30px rgba(0,0,0,0.5)",
                  filter: `brightness(${brightness})`,
                  transition: "box-shadow 0.4s ease, filter 0.4s ease",
                }}
              >
                <img
                  src={expert.src}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                  loading={isCenter ? "eager" : "lazy"}
                />

                {/* Cinematic top vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

                {/* Sheen on center card */}
                {isCenter && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
                    }}
                  />
                )}

                {/* Name badge */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1"
                  style={{ opacity: isCenter ? 1 : 0, transition: "opacity 0.4s ease" }}
                >
                  <h3 className="text-white font-bold text-2xl leading-tight drop-shadow-md">
                    {expert.name}
                  </h3>
                  <span className="text-blue-400 font-medium text-sm tracking-wide">
                    {expert.role}
                  </span>
                </div>
              </div>



              {/* Floor line */}
              {isCenter && (
                <div
                  className="absolute w-full"
                  style={{
                    top: cardWidth * 1.35 + 2,
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2 mt-4 z-50">
        {experts.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-6 z-50">
        <button
          onClick={() => { goPrev(); setAutoPlay(false); }}
          className="w-12 h-12 rounded-full border border-border bg-background/80 text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 backdrop-blur-sm shadow-xl"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => { goNext(); setAutoPlay(false); }}
          className="w-12 h-12 rounded-full border border-border bg-background/80 text-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 backdrop-blur-sm shadow-xl"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
