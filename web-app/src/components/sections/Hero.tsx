import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

const outcomes = [
  "Nội dung tiếng Việt",
  "Thực hành trên bài toán thật",
  "Ứng dụng được ngay",
] as const;

const capabilities = [
  {
    title: "Khóa học thực hành",
    description: "Học các kỹ năng AI phục vụ công việc hằng ngày.",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Bài viết & tài nguyên",
    description: "Cập nhật cách dùng AI qua nội dung dễ áp dụng.",
    href: "/posts",
    icon: FileText,
  },
  {
    title: "Trao đổi nhu cầu",
    description: "Nhận hỗ trợ khi cần chọn nội dung phù hợp.",
    href: "/contact",
    icon: MessageCircle,
  },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pb-28 lg:pt-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[linear-gradient(180deg,rgba(0,112,235,0.08),transparent)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-brand-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            Nền tảng học AI cho người Việt
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Làm chủ AI, tạo giá trị thật cho công việc
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Học qua tình huống thực tế, thực hành cùng nội dung hướng dẫn và biến
            kiến thức AI thành kết quả hữu ích trong công việc.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild className="rounded-full px-7">
              <Link href="/courses">
                Khám phá khóa học
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-7 text-brand-primary">
              <Link href="/about">Tìm hiểu về GATS</Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-center gap-2">
                <CheckCircle2 className="size-5 shrink-0 text-brand-primary" aria-hidden="true" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-4xl bg-accent/70" />
          <Surface
            elevated
            className="overflow-hidden p-5 sm:p-7"
            aria-labelledby="hero-capabilities-title"
          >
            <div className="flex items-start gap-3 border-b border-divider pb-5">
              <Image
                src="/images/logo/logo-icon.svg"
                alt=""
                width={44}
                height={44}
                className="size-11 shrink-0"
              />
              <div>
                <p
                  id="hero-capabilities-title"
                  className="text-lg font-bold text-foreground"
                >
                  Bắt đầu từ nhu cầu của bạn
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Chọn nội dung phù hợp với việc bạn muốn làm.
                </p>
              </div>
            </div>
            <div className="grid gap-3 pt-5 sm:grid-cols-3">
              {capabilities.map((capability) => {
                const Icon = capability.icon;
                return (
                  <Link
                    key={capability.href}
                    href={capability.href}
                    className="group flex min-h-32 flex-col rounded-xl border border-transparent bg-background p-4 transition-colors hover:border-border hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-brand-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <ArrowRight
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="mt-4 font-semibold text-foreground">
                      {capability.title}
                    </span>
                    <span className="mt-1 text-sm leading-5 text-muted-foreground">
                      {capability.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Surface>
        </div>
      </div>
    </section>
  );
}
