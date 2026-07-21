import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background relative">
      <Header />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          GATS Academy
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
          {title}
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
          {children}
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          Cần hỗ trợ?{" "}
          <Link href="/contact" className="text-primary font-semibold hover:underline">
            Liên hệ chúng tôi
          </Link>
          .
        </p>
      </article>
      <Footer />
    </main>
  );
}
