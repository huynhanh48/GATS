"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Search, X } from "lucide-react";

import { PathApi } from "@/constants/PathApi";
import apiClient from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import { theme as designTheme } from "@/lib/theme";
import type { Course } from "@/types/course";
import type { Post } from "@/types/post";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CoursesPayload = { data?: Course[] };
type PostsPayload = { data?: Post[] };

export function SearchModal({ open, onOpenChange }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    if (!debounced) {
      setCourses([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      apiClient.get(
        `${PathApi.courses.list}?status=published&limit=6&keyword=${encodeURIComponent(debounced)}`,
      ),
      apiClient.get(
        `${PathApi.posts.list}?status=published&limit=6&search=${encodeURIComponent(debounced)}`,
      ),
    ])
      .then(([coursesRes, postsRes]) => {
        if (!active) return;
        const coursePayload = coursesRes as unknown as CoursesPayload;
        const postPayload = postsRes as unknown as PostsPayload;
        setCourses(coursePayload.data ?? []);
        setPosts(postPayload.data ?? []);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setCourses([]);
        setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debounced, open]);

  useEffect(() => {
    if (open) return;
    setQuery("");
    setDebounced("");
    setCourses([]);
    setPosts([]);
    setLoading(false);
  }, [open]);

  if (!open) return null;

  const hasQuery = debounced.length > 0;
  const hasResults = courses.length > 0 || posts.length > 0;

  const close = () => onOpenChange(false);

  const submitSearch = () => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    close();
    router.push(`/courses?keyword=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className="fixed inset-0 flex items-start justify-center px-4 pt-[12vh] sm:pt-[14vh]"
      style={{ zIndex: designTheme.zIndex.modal ?? 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 supports-backdrop-filter:backdrop-blur-[2px]"
        aria-label="Đóng tìm kiếm"
        onClick={close}
      />

      <div className="relative z-10 w-full max-w-[720px]">
        <h2 id={titleId} className="sr-only">
          Tìm kiếm
        </h2>

        <form
          className="flex items-center gap-0 rounded-full border border-slate-200 bg-white pl-6 pr-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên"
            className="h-14 flex-1 bg-transparent text-[1.6rem] text-[#111827] outline-none placeholder:text-slate-400 sm:h-16 sm:text-[1.7rem]"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Xóa từ khóa"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-colors hover:bg-[#333] sm:h-12 sm:w-12"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </form>

        <div className="mt-3 max-h-[min(60vh,480px)] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)]">
          {!hasQuery ? (
            <p className="px-6 py-8 text-center text-[1.4rem] text-slate-500">
              Nhập tên khóa học hoặc bài viết để tìm kiếm
            </p>
          ) : loading ? (
            <p className="px-6 py-8 text-center text-[1.4rem] text-slate-500">
              Đang tìm…
            </p>
          ) : !hasResults ? (
            <p className="px-6 py-8 text-center text-[1.4rem] text-slate-500">
              Không tìm thấy kết quả cho “{debounced}”
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.length > 0 ? (
                <section className="p-3">
                  <p className="mb-2 px-2 text-[1.2rem] font-bold uppercase tracking-wide text-slate-400">
                    Khóa học
                  </p>
                  <ul className="space-y-1">
                    {courses.map((course) => {
                      const thumb = course.thumbnail
                        ? resolveMediaUrl(course.thumbnail)
                        : null;
                      return (
                        <li key={course.id}>
                          <Link
                            href={`/courses/${course.slug}`}
                            onClick={close}
                            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
                          >
                            <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={thumb}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[1.5rem] font-semibold text-[#111827]">
                                {course.title}
                              </p>
                              {course.category?.name ? (
                                <p className="truncate text-[1.25rem] text-slate-500">
                                  {course.category.name}
                                </p>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {posts.length > 0 ? (
                <section className="p-3">
                  <p className="mb-2 px-2 text-[1.2rem] font-bold uppercase tracking-wide text-slate-400">
                    Bài viết
                  </p>
                  <ul className="space-y-1">
                    {posts.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/posts/${post.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[1.5rem] font-semibold text-[#111827]">
                              {post.title}
                            </p>
                            {post.excerpt ? (
                              <p className="truncate text-[1.25rem] text-slate-500">
                                {post.excerpt}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={submitSearch}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-[1.4rem] font-semibold text-[#111827] transition-colors hover:bg-[#ff782d]/10 hover:text-[#ff782d]"
                >
                  <Search className="h-4 w-4" />
                  Xem tất cả kết quả cho “{debounced}”
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
