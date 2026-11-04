"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { HlsVideoPlayer } from "./HlsVideoPlayer";
import { resolveMediaUrl } from "@/lib/media/url";

export type LessonLinkedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
};

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  /** HTML from lesson "Nội dung chi tiết" */
  content?: string | null;
  linkedPost?: LessonLinkedPost | null;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  url,
  title,
  content,
  linkedPost,
}: VideoPlayerModalProps) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasContent = Boolean(content?.trim());
  const hasLinkedPost = Boolean(linkedPost);
  const hasArticle = hasContent || hasLinkedPost;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-card border border-border/40 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30 shrink-0">
            <h3 className="text-lg font-bold text-foreground truncate pr-4">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {url ? (
                <HlsVideoPlayer url={url} autoPlay={isOpen} />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2 p-6 text-center">
                  <p>
                    {hasArticle
                      ? "Bài học chưa có video — xem nội dung bên dưới."
                      : "Video không khả dụng hoặc đang được xử lý."}
                  </p>
                </div>
              )}
            </div>

            {hasArticle ? (
              <div className="p-5 sm:p-6 space-y-5 border-t border-border/40">
                {hasContent ? (
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                      Nội dung bài học
                    </h4>
                    <div
                      className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary"
                      dangerouslySetInnerHTML={{ __html: content!.trim() }}
                    />
                  </div>
                ) : null}

                {linkedPost ? (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                      Bài viết liên quan
                    </p>
                    <div className="flex gap-4">
                      {linkedPost.thumbnail ? (
                        <img
                          src={resolveMediaUrl(linkedPost.thumbnail, "")}
                          alt=""
                          className="h-20 w-28 shrink-0 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-foreground line-clamp-2">
                          {linkedPost.title}
                        </h5>
                        {linkedPost.excerpt ? (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {linkedPost.excerpt}
                          </p>
                        ) : null}
                        <Link
                          href={`/posts/${linkedPost.slug}`}
                          className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
                          onClick={onClose}
                        >
                          Đọc bài viết →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
