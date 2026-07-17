'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CourseCategory } from '@/types/course'; // We'll reuse this as Category structure is the same

interface CategoryTabsProps {
  categories: CourseCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryTabs = ({ categories, activeCategoryId, onSelectCategory }: CategoryTabsProps) => {
  return (
    <div className="w-full flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar py-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 md:px-0">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            activeCategoryId === null ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {activeCategoryId === null && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          Tất cả bài viết
        </button>

        {categories.map((category) => {
          const catValue = category.slug || category.id;
          return (
            <button
              key={catValue}
              onClick={() => onSelectCategory(catValue)}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                activeCategoryId === catValue ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {activeCategoryId === catValue && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            {category.name}
          </button>
        )})}
      </div>
    </div>
  );
};
