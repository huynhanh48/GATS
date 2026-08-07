import Link from "next/link";
import { EdubostFooter as Footer, EdubostHeader as Header } from "@/components/edubost/EdubostShell";

export type LegalSection = { id: string; title: string };

const legalNavigation = [
  ["/terms", "Điều khoản"], ["/privacy", "Quyền riêng tư"],
  ["/refund", "Hoàn tiền"], ["/payment-policy", "Thanh toán"],
  ["/cookies", "Cookie"], ["/community-guidelines", "Cộng đồng"],
  ["/acceptable-use", "Sử dụng chấp nhận được"], ["/data-request", "Yêu cầu dữ liệu"],
] as const;

export function LegalPageShell({ title, summary, effectiveDate = "23/07/2026", version = "1.0", sections = [], children }: {
  title: string; summary?: string; effectiveDate?: string; version?: string;
  sections?: readonly LegalSection[]; children: React.ReactNode;
}) {
  return (
    <main className="body_wrap">
      <Header />
      <section className="breadcrumb bg_img ul_li" style={{ backgroundImage: "url(/edubost-reference/img/bg/breadcrumb_bg.jpg)" }}>
        <div className="container"><div className="breadcrumb__content text-center"><h1 className="breadcrumb__title">{title}</h1><p className="breadcrumb__desc">{summary || "Tài liệu và chính sách của GATS Academy"}</p></div></div>
      </section>
      <section className="blog_details_section section_space" style={{ backgroundColor: "#F1F1E9" }}>
        <div className="container"><div className="row mt-none-30">
          <article className="col-lg-8 mt-30">
            <div className="post_meta_wrap mb-4"><ul className="post_meta unordered_list"><li><i className="far fa-calendar" /> Hiệu lực: {effectiveDate}</li><li><i className="far fa-file-alt" /> Phiên bản: {version}</li></ul></div>
            <h2 className="details_item_title">{title}</h2>
            <div className="details_item_content prose prose-neutral max-w-none">{children}</div>
            <div className="post_meta_wrap mt-60"><p>Cần hỗ trợ hoặc muốn gửi khiếu nại? <Link href="/contact">Liên hệ GATS Academy</Link>.</p></div>
          </article>
          <div className="col-lg-4 mt-30"><aside className="blog_sidebar">
            {sections.length ? <div className="sidebar_widget"><h3 className="sidebar_widget_title">Mục lục</h3><ul className="category_list_block unordered_list_block">{sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="ul_li_between"><span>{index + 1}. {section.title}</span><i className="far fa-arrow-right" /></a></li>)}</ul></div> : null}
            <div className="sidebar_widget"><h3 className="sidebar_widget_title">Chính sách liên quan</h3><ul className="category_list_block unordered_list_block">{legalNavigation.map(([href, label]) => <li key={href}><Link href={href} className="ul_li_between"><span>{label}</span><i className="far fa-arrow-right" /></Link></li>)}</ul></div>
          </aside></div>
        </div></div>
      </section>
      <Footer />
    </main>
  );
}
