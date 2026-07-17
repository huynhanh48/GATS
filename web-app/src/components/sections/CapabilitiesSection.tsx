"use client";
import { motion } from "framer-motion";
import React from "react";
import { CoverflowCarousel } from "../common/CoverflowCarousel";

export function CapabilitiesSection() {
  return (
    <section className="w-full py-24 relative z-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mb-4 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Mentor GATS
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Gặp gỡ đội ngũ chuyên gia dày dặn kinh nghiệm, những người sẽ trực tiếp đồng hành và chia sẻ kiến thức chuyên sâu về AI cho bạn.
          </p>
        </div>
        <div className="w-full">
          <CoverflowCarousel />
        </div>
      </div>
    </section>
  );
}
