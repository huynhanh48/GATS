import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
} from "lucide-react";
import { LandingNav } from "@/components/Landing/LandingNav";
import {
  findLandingArticle,
  LANDING_ARTICLES,
} from "@/lib/landing/articles";
import { ArticleComments } from "./_components/article-comments";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateStaticParams() {
  return LANDING_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findLandingArticle(slug);

  if (!article) {
    return {
      title: "Không tìm thấy bài viết | GATS Academy",
    };
  }

  return {
    title: `${article.title} | GATS Academy`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = findLandingArticle(slug);

  if (!article) notFound();

  const relatedArticles = LANDING_ARTICLES.filter(
    (item) => item.slug !== article.slug,
  ).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-black dark:text-white">
      <LandingNav active="posts" tone="light" />

      <main>
        <section className="px-5 pt-8 pb-10 md:px-8 md:pt-14 md:pb-14">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/posts"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-950 dark:border-slate-800 dark:bg-[#111] dark:text-slate-200 dark:hover:border-white"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Quay lại bài viết
            </Link>

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-orange-50 px-3 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                  <BookOpen className="size-4" aria-hidden="true" />
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {article.readMinutes} phút đọc
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {formatArticleDate(article.publishedAt)}
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl">
                {article.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                {article.summary}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span>Tác giả: {article.author}</span>
                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <a
                  href="#comments"
                  className="inline-flex items-center gap-1.5 font-semibold text-orange-600"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Xem bình luận
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-12 md:px-8 md:pb-16">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111]">
            <div className="relative aspect-[16/7] bg-slate-100 dark:bg-[#222]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 960px"
                priority
                unoptimized
              />
            </div>

            <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[0.75fr_1.25fr]">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-[#181818]">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Ý chính
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {article.takeaways.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6">
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span className="text-slate-700 dark:text-slate-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              <article className="space-y-9">
                {article.sections.map((section) => (
                  <section key={section.title} className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {section.title}
                    </h2>
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-8 text-slate-700 dark:text-slate-300"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </section>
                ))}
              </article>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-8 md:pb-20">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.8fr]">
            <ArticleComments />

            <aside className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111] md:p-6">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                Bài viết liên quan
              </h2>
              <div className="mt-5 space-y-4">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.id}
                    href={`/posts/${item.slug}`}
                    className="group block rounded-[8px] border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-300 dark:border-slate-800 dark:bg-[#181818]"
                  >
                    <p className="text-xs font-bold tracking-wide text-orange-600 uppercase">
                      {item.category}
                    </p>
                    <h3 className="mt-2 font-bold leading-snug text-slate-950 group-hover:text-orange-600 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {item.excerpt}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                      Đọc tiếp
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
