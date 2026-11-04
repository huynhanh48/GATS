'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CloudProps {
  delay?: number;
  duration?: number;
  scale?: number;
  top?: string;
  opacity?: number;
}

const Cloud = ({ delay = 0, duration = 30, scale = 1, top = '10%', opacity = 0.8 }: CloudProps) => {
  return (
    <motion.div
      className="absolute left-[-20%] z-0"
      style={{ top, scale, opacity }}
      animate={{
        x: ['0vw', '120vw'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
        delay,
      }}
    >
      <svg width="150" height="80" viewBox="0 0 150 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0C58.3377 0 73.8055 12.3323 78.4357 29.2319C81.8213 25.5678 86.6669 23.3333 92 23.3333C102.125 23.3333 110.333 31.5415 110.333 41.6667C110.333 43.1979 110.145 44.6853 109.794 46.1082C111.455 45.3693 113.313 44.9524 115.286 44.9524C123.639 44.9524 130.413 51.726 130.413 60.0794C130.413 68.4328 123.639 75.2063 115.286 75.2063C114.777 75.2063 114.275 75.1812 113.782 75.1325C110.106 78.1132 105.419 80 100.333 80H40Z" fill="currentColor" className="text-white/60 dark:text-white/10" />
      </svg>
    </motion.div>
  );
};

interface ButterflyProps {
  delay?: number;
  duration?: number;
  scale?: number;
  top?: string;
  left?: string;
  color?: string;
}

const Butterfly = ({ delay = 0, duration = 15, scale = 1, top = '50%', left = '10%', color = 'text-primary' }: ButterflyProps) => {
  return (
    <motion.div
      className={cn("absolute z-10 pointer-events-none", color)}
      style={{ top, left, scale }}
      animate={{
        y: [0, -20, 10, -10, 0],
        x: [0, 30, -10, 20, 0],
      }}
      transition={{
        duration: duration * 0.8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
        delay,
      }}
    >
      <motion.div
        animate={{ scaleX: [1, 0.2, 1] }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'linear'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 11 5 12 7C13 5 12 2 12 2Z" fill="currentColor" />
          <path d="M11 8C6 6 2 9 4 13C6 17 11 15 11.5 12C11.5 12 10 14 11 16C12 18 16 19 19 16C22 13 20 8 15 8C13 8 11 8 11 8Z" fill="currentColor" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

interface BeeProps {
  delay?: number;
  top?: string;
  left?: string;
  scale?: number;
}

const Bee = ({ delay = 0, top = '20%', left = '80%', scale = 1 }: BeeProps) => {
  return (
    <motion.div
      className="absolute z-10 pointer-events-none text-amber-500"
      style={{ top, left, scale }}
      animate={{
        y: [0, -15, 5, -5, 0],
        x: [0, -20, 10, -10, 0],
        rotate: [0, -5, 5, -2, 0]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
        delay,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14v.01" />
        <path d="M4 10v.01" />
        <path d="M4 6v.01" />
        <path d="M9 16c2.5 0 4.5-2 4.5-4.5S11.5 7 9 7s-4.5 2-4.5 4.5S6.5 16 9 16z" />
        <path d="M17 13c1.5 0 2.5-1 2.5-2.5S18.5 8 17 8s-2.5 1-2.5 2.5S15.5 13 17 13z" />
        <path d="M13.5 11.5 17 14" />
        <path d="M13.5 8.5 17 6" />
        <path d="M9 7l1-3" />
        <path d="M6 7l-1-3" />
      </svg>
    </motion.div>
  );
};

export const NatureHero = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-100 to-background dark:from-slate-900 dark:to-background pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background clouds */}
      <Cloud delay={0} duration={40} scale={1.2} top="15%" opacity={0.6} />
      <Cloud delay={15} duration={50} scale={0.8} top="45%" opacity={0.4} />
      <Cloud delay={25} duration={35} scale={1.5} top="65%" opacity={0.3} />
      <Cloud delay={5} duration={45} scale={1} top="80%" opacity={0.5} />
      <Cloud delay={20} duration={60} scale={0.6} top="25%" opacity={0.4} />

      {/* Butterflies */}
      <Butterfly delay={0} duration={10} top="20%" left="15%" color="text-secondary" scale={1.2} />
      <Butterfly delay={2} duration={12} top="60%" left="85%" color="text-blue-500" scale={0.8} />
      <Butterfly delay={5} duration={15} top="75%" left="25%" color="text-emerald-500" scale={1} />
      <Butterfly delay={7} duration={9} top="35%" left="75%" color="text-secondary" scale={0.9} />

      {/* Bees */}
      <Bee delay={1} top="40%" left="10%" scale={1.2} />
      <Bee delay={4} top="80%" left="80%" scale={0.9} />
      <Bee delay={2} top="15%" left="60%" scale={1.5} />

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        {children || (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground"
          >
            Bài viết mới nhất
          </motion.h1>
        )}
      </div>
    </div>
  );
};
