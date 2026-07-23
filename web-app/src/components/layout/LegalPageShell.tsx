import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export type LegalSection = {
  id: string;
  title: string;
};

const legalNavigation = [
  { href: "/terms", label: "Điều khoản" },
  { href: "/privacy", label: "Quyền riêng tư" },
  { href: "/refund", label: "Hoàn tiền" },
  { href: "/payment-policy", label: "Thanh toán" },
  { href: "/cookies", label: "Cookie" },
  { href: "/community-guidelines", label: "Cộng đồng" },
  { href: "/acceptable-use", label: "Sử dụng chấp nhận được" },
  { href: "/data-request", label: "Yêu cầu dữ liệu" },
] as const;

export function LegalPageShell({
  title,
  summary,
  effectiveDate = "23/07/2026",
  version = "1.0",
  sections = [],
  children,
}: {
  title: string;
  summary?: string;
  effectiveDate?: string;
  version?: string;
  sections?: readonly LegalSection[];
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) md:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-primary">
            GATS Academy · Tài liệu pháp lý
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          {summary ? (
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
              {summary}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>Hiệu lực: {effectiveDate}</span>
            <span>Phiên bản: {version}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {sections.length > 0 ? (
              <nav
                aria-label="Mục lục"
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="mb-3 text-sm font-bold text-foreground">Mục lục</p>
                <ol className="space-y-2 text-sm">
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            <nav
              aria-label="Các chính sách khác"
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="mb-3 text-sm font-bold text-foreground">
                Chính sách liên quan
              </p>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {legalNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-brand-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          <article className="min-w-0 rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card) md:p-8">
            <div className="mb-8 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-sm leading-relaxed text-foreground">
              Tài liệu này là bản dự thảo vận hành, cần được rà soát pháp lý và
              xác nhận thông tin pháp nhân trước khi công bố chính thức.
            </div>
            <div className="prose prose-neutral max-w-none space-y-4 leading-relaxed text-muted-foreground dark:prose-invert">
              {children}
            </div>
            <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
              Cần hỗ trợ hoặc muốn gửi khiếu nại?{" "}
              <Link
                href="/contact"
                className="font-semibold text-brand-primary hover:underline"
              >
                Liên hệ GATS Academy
              </Link>
              .
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
