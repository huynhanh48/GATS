"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function VideoPlayerModal({ isOpen, onClose, url, title }: VideoPlayerModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl bg-card border border-border/40 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
            <h3 className="text-lg font-bold text-foreground truncate pr-4">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            {url ? (
              <HlsVideoPlayer url={url} autoPlay={isOpen} />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                <p>Video không khả dụng hoặc đang được xử lý.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
