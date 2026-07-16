import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, FileText } from "lucide-react";
import { LandingNav } from "@/components/Landing/LandingNav";
import { LANDING_ARTICLES } from "@/lib/landing/articles";

export const metadata: Metadata = {
  title: "Bài viết | GATS Academy",
  description:
    "Bài viết hướng dẫn chọn khóa học, học AI và kỹ năng thực chiến tại GATS Academy.",
};

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="posts" tone="light" />

      <main className="px-5 py-12 md:px-8 md:py-16">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700">
              <FileText className="size-4" aria-hidden="true" />
              GATS Academy Journal
            </div>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-6xl">
              Bài viết giúp bạn chọn khóa học dễ hơn.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
              Nội dung ngắn, thực tế, tập trung vào lộ trình học, AI ứng dụng và
              cách biến khóa học thành kết quả cụ thể.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3">
          {LANDING_ARTICLES.map((article) => (
            <article
              key={article.id}
              id={article.slug}
              className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111]"
            >
              <div className="relative aspect-[16/9] bg-slate-100 dark:bg-[#222]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {article.readMinutes} phút đọc
                  </span>
                </div>
                <h2 className="mt-3 text-xl leading-snug font-bold">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {article.excerpt}
                </p>
                <Link
                  href={`/posts/${article.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-white dark:text-slate-950 dark:hover:bg-orange-500 dark:hover:text-white"
                >
                  Đọc bài
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
