"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EdubostFooter as Footer, EdubostHeader as Header } from "@/components/edubost/EdubostShell";

export type LegalSection = { id: string; title: string };

const legalNavigation = [
  ["/terms", "Điều khoản"],
  ["/privacy", "Quyền riêng tư"],
  ["/refund", "Hoàn tiền"],
  ["/payment-policy", "Thanh toán"],
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
  const pathname = usePathname();

  return (
    <main className="body_wrap bg-[#F9F8F3]">
      <Header />
      <section
        className="breadcrumb bg_img ul_li"
        style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}
      >
        <div className="container">
          <div className="breadcrumb__content text-center">
            <h1 className="breadcrumb__title">{title}</h1>
            <p className="breadcrumb__desc">
              {summary || "Tài liệu và chính sách chính thức của GATS Academy"}
            </p>
          </div>
        </div>
      </section>

      <section className="blog_details_section py-16 bg-[#F9F8F3]">
        <div className="container mx-auto px-4" style={{ maxWidth: "1280px" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main Content Article */}
            <article className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[20px] shadow-sm border border-[#E6E2DA]">
              <div className="post_meta_wrap mb-6 pb-6 border-b border-[#F0ECE1]">
                <ul className="flex flex-wrap items-center gap-6 text-[14px] text-[#60060f] font-semibold">
                  <li className="flex items-center gap-2">
                    <i className="far fa-calendar text-[#FF6B00]" /> Hiệu lực: {effectiveDate}
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="far fa-file-alt text-[#FF6B00]" /> Phiên bản: {version}
                  </li>
                </ul>
              </div>

              <h2 className="text-[28px] md:text-[34px] font-heading font-bold text-[#170006] mb-6">
                {title}
              </h2>

              <div className="details_item_content prose prose-lg prose-neutral max-w-none prose-headings:text-[#170006] prose-headings:font-heading prose-a:text-[#60060f] prose-a:font-semibold hover:prose-a:text-[#FF6B00]">
                {children}
              </div>

              <div className="mt-12 pt-8 border-t border-[#F0ECE1] text-[15px] text-[#4A3E3E]">
                <p className="flex items-center gap-2">
                  <i className="far fa-life-ring text-[#60060f] text-lg" />
                  Cần hỗ trợ hoặc gửi thắc mắc?{" "}
                  <Link
                    href="/contact"
                    className="font-bold text-[#60060f] hover:text-[#FF6B00] underline"
                  >
                    Liên hệ với bộ phận hỗ trợ GATS Academy
                  </Link>
                  .
                </p>
              </div>
            </article>

            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 space-y-8">
              {/* Table of Contents Widget */}
              {sections.length > 0 && (
                <div className="bg-white p-6 md:p-7 rounded-[20px] shadow-sm border border-[#E6E2DA] legal-sidebar-toc">
                  <style>{`
                    .legal-sidebar-toc a, .legal-sidebar-toc a:visited, .legal-sidebar-toc a:link {
                      color: #170006 !important;
                      text-decoration: none !important;
                    }
                    .legal-sidebar-toc a:hover {
                      color: #60060f !important;
                      background-color: rgba(96, 6, 15, 0.08) !important;
                    }
                  `}</style>
                  <h3 className="font-heading text-[20px] font-bold !text-[#170006] pb-4 mb-4 border-b border-[#F0ECE1] flex items-center gap-2">
                    <i className="far fa-list-ol !text-[#60060f]" /> MỤC LỤC
                  </h3>
                  <ul className="space-y-2">
                    {sections.map((section, index) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="group flex items-center justify-between py-2.5 px-3.5 rounded-xl text-[14px] font-bold !text-[#170006] hover:!text-[#60060f] hover:bg-[#60060f]/8 transition-all"
                          style={{ color: "#170006" }}
                        >
                          <span className="line-clamp-1 flex items-center">
                            <span className="!text-[#60060f] font-extrabold mr-2 shrink-0">
                              {index + 1}.
                            </span>
                            <span className="!text-[#170006] group-hover:!text-[#60060f] transition-colors">
                              {section.title}
                            </span>
                          </span>
                          <i className="far fa-arrow-right text-[12px] !text-[#60060f] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Policies Widget */}
              <div className="bg-white p-6 md:p-7 rounded-[20px] shadow-sm border border-[#E6E2DA] legal-sidebar-policies">
                <style>{`
                  .legal-sidebar-policies a:not(.active-policy),
                  .legal-sidebar-policies a:not(.active-policy):visited,
                  .legal-sidebar-policies a:not(.active-policy):link {
                    color: #170006 !important;
                    text-decoration: none !important;
                  }
                  .legal-sidebar-policies a:not(.active-policy):hover {
                    color: #60060f !important;
                    background-color: rgba(96, 6, 15, 0.08) !important;
                  }
                  .legal-sidebar-policies a.active-policy {
                    color: #ffffff !important;
                    background-color: #60060f !important;
                  }
                `}</style>
                <h3 className="font-heading text-[20px] font-bold !text-[#170006] pb-4 mb-4 border-b border-[#F0ECE1] flex items-center gap-2">
                  <i className="far fa-shield-alt !text-[#60060f]" /> CHÍNH SÁCH LIÊN QUAN
                </h3>
                <ul className="space-y-2.5">
                  {legalNavigation.map(([href, label]) => {
                    const isActive = pathname === href;
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          style={{ color: isActive ? "#ffffff" : "#170006" }}
                          className={`group flex items-center justify-between py-3 px-4 rounded-xl text-[15px] font-semibold transition-all ${
                            isActive
                              ? "active-policy !bg-[#60060f] !text-white font-bold shadow-md"
                              : "!text-[#170006] hover:!text-[#60060f] hover:!bg-[#60060f]/8"
                          }`}
                        >
                          <span className={isActive ? "!text-white" : "!text-[#170006] group-hover:!text-[#60060f]"}>
                            {label}
                          </span>
                          <i
                            className={`far fa-arrow-right text-[12px] transition-all ${
                              isActive
                                ? "!text-white opacity-100 translate-x-1"
                                : "!text-[#60060f] opacity-50 group-hover:opacity-100 group-hover:translate-x-1"
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
