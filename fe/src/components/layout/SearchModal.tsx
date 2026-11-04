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
import "./search-modal.css";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CoursesPayload = { data?: Course[]; courses?: Course[] };
type PostsPayload = { data?: Post[]; posts?: Post[] };

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
        setCourses(coursePayload.data ?? coursePayload.courses ?? []);
        setPosts(postPayload.data ?? postPayload.posts ?? []);
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
      className="edubost-search-modal fixed inset-0 flex items-start justify-center"
      style={{ zIndex: designTheme.zIndex.modal ?? 100 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="edubost-search-backdrop absolute inset-0 bg-black/55"
        aria-label="Đóng tìm kiếm"
        onClick={close}
      />

      <div className="edubost-search-panel relative z-10 w-full">
        <button type="button" className="edubost-search-close" aria-label="Đóng tìm kiếm" onClick={close}>
          <X aria-hidden="true" />
        </button>
        <h2 id={titleId} className="sr-only">
          Tìm kiếm
        </h2>

        <form
          className="edubost-search-form flex items-center gap-0"
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
            placeholder="Tìm kiếm ..."
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
              className="edubost-search-clear mr-1 flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label="Xóa từ khóa"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
          <button
            type="submit"
            className="edubost-search-submit flex h-12 w-12 shrink-0 items-center justify-center text-slate-400 transition-colors hover:text-[#60060f]"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </form>

        <div className="edubost-search-results mt-3 max-h-[min(48vh,420px)] overflow-y-auto bg-white">
          {!hasQuery ? (
            null
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
