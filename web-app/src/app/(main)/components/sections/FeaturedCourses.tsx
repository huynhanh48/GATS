import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { PathApi } from "@/constants/PathApi";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course, CourseCategory } from "@/types/course";

function apiOrigin() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_REWRITE_ORIGIN ||
    "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
}

function formatPrice(price: number, salePrice?: number | null) {
  if (price <= 0) return "Miễn phí";
  if (salePrice != null && salePrice > 0 && salePrice < price) {
    return `${salePrice.toLocaleString("vi-VN")}đ`;
  }
  return `${price.toLocaleString("vi-VN")}đ`;
}

function hasSale(price: number, salePrice?: number | null) {
  return salePrice != null && salePrice > 0 && salePrice < price && price > 0;
}

function categoryIcon(index: number) {
  const n = (index % 10) + 1;
  return n === 1 ? "Icon-1.svg" : `icon-${n}.svg`;
}

export async function FeaturedCourses() {
  const base = apiOrigin();
  let courses: Course[] = [];
  let categories: CourseCategory[] = [];

  try {
    const [coursesRes, categoriesRes] = await Promise.all([
      fetch(`${base}${PathApi.courses.list}?take=6&skip=0&status=published`, {
        next: { revalidate: 60 },
      }),
      fetch(`${base}${PathApi.categories.list}?type=course`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (coursesRes.ok) {
      const payload = await coursesRes.json();
      courses = payload.data || [];
    }
    if (categoriesRes.ok) {
      const payload = await categoriesRes.json();
      categories = (payload.data || []).slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch courses/categories:", error);
  }

  return (
    <section className="w-full py-24 bg-[#FAF8F5] text-[#0B0F17] border-t border-amber-200/60">
      <Container size="xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[1.2rem] font-bold text-[#FF6B00] uppercase tracking-wider bg-[#FF6B00]/10 px-3.5 py-1 rounded-full border border-[#FF6B00]/20 w-fit font-mono">
              HỆ THỐNG ĐÀO TẠO THỰC CHIẾN
            </span>
            <h2 className="text-[3.6rem] font-extrabold text-[#0B0F17] font-heading">
              Chương Trình Đào Tạo &amp; Chứng Nhận GATS
            </h2>
            <p className="text-[1.6rem] text-slate-600 font-medium">
              Từ lộ trình AI Cơ bản miễn phí đến Lớp Offline &amp; Workflow Doanh nghiệp
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="rounded-xl px-8 h-[4.2rem] text-[1.5rem] font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Link href="/courses">Tất cả khóa học</Link>
          </Button>
        </div>

        {/* Meeting 4/8 Directive Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-slate-200">
          <Link
            href="/courses"
            className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white text-[1.3rem] font-extrabold shadow-sm cursor-pointer"
          >
            Tất Cả Chương Trình
          </Link>
          <Link
            href="/courses?format=offline"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 text-[1.3rem] font-bold transition-colors cursor-pointer"
          >
            Lớp Offline &amp; Workshop
          </Link>
          <Link
            href="/courses?tier=free"
            className="px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[1.3rem] font-bold transition-colors cursor-pointer"
          >
            AI Cơ Bản (Miễn Phí 100%)
          </Link>
          <Link
            href="/courses?tier=advanced"
            className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#FF6B00] border border-amber-200 text-[1.3rem] font-bold transition-colors cursor-pointer"
          >
            AI Nâng Cao &amp; Workflow
          </Link>
          <Link
            href="/courses?category=security"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 text-[1.3rem] font-bold transition-colors cursor-pointer"
          >
            Bảo Mật Dữ Liệu AI (Độc Quyền)
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="mb-16 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={`/courses?category=${encodeURIComponent(cat.slug)}`}
                className="flex flex-col items-center justify-center px-4 py-8 rounded-2xl border border-amber-200/80 bg-white transition-all duration-300 group hover:shadow-lg hover:border-[#FF6B00]/60 cursor-pointer shadow-xs"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center">
                  <img
                    src={`/images/categories/${categoryIcon(index)}`}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-[1.5rem] font-bold text-[#0B0F17] text-center mb-1 transition-colors group-hover:text-[#FF6B00] line-clamp-2">
                  {cat.name}
                </h3>
                <p className="text-[1.3rem] text-slate-500 font-medium text-center">
                  {cat.courseCount ?? 0} chương trình
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        <div>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <h3 className="text-2xl font-bold mb-2">
                Chương trình đang được cập nhật
              </h3>
              <p>Vui lòng quay lại sau để xem các chương trình mới.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course) => {
                const isFree = course.price <= 0;
                const onSale = hasSale(course.price, course.salePrice);
                const tag =
                  course.tags?.[0]?.name ??
                  course.category?.name ??
                  "Chứng Nhận GATS";
                const thumbnail = resolveMediaUrl(
                  course.thumbnail,
                  "https://placehold.co/600x400/FFF7ED/FF6B00?text=GATS+Academy",
                );

                return (
                  <article
                    key={course.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-lg shadow-amber-950/5 transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/60"
                  >
                    <Link
                      href={`/courses/${course.slug}`}
                      className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                    >
                      <img
                        src={thumbnail}
                        alt={course.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-[#0B0F17] text-white text-[1.1rem] font-bold px-3 py-1 rounded-md shadow-md">
                        {tag}
                      </div>
                      <div className="absolute top-4 right-4 bg-[#FF6B00] text-white text-[1.1rem] font-extrabold px-2.5 py-1 rounded-md shadow-md">
                        Chứng Nhận GATS
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-[1.2rem] text-slate-500 mb-3">
                        Giảng dạy bởi{" "}
                        <span className="font-bold text-slate-800">
                          Chuyên gia GATS
                        </span>
                      </div>

                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="mb-4 line-clamp-2 text-[1.8rem] font-bold leading-[1.35] text-[#0B0F17] transition-colors group-hover:text-[#FF6B00]">
                          {course.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-5 text-[1.3rem] text-slate-500 mb-6 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-[1.6rem] h-[1.6rem] text-[#0265FF]" />
                          <span>Lộ trình thực chiến</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-[1.6rem] h-[1.6rem] text-[#0265FF]" />
                          <span>
                            {course.stats?.enrollmentCount?.toLocaleString(
                              "vi-VN",
                            ) ?? "0"}{" "}
                            Học viên
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                        <div className="flex items-center gap-2">
                          {onSale ? (
                            <span className="text-[1.3rem] font-medium text-slate-400 line-through">
                              {course.price.toLocaleString("vi-VN")}đ
                            </span>
                          ) : null}
                          <span
                            className={`text-[1.6rem] font-extrabold ${isFree ? "text-emerald-600" : "text-[#FF6B00]"}`}
                          >
                            {formatPrice(course.price, course.salePrice)}
                          </span>
                        </div>

                        <Link
                          href={`/courses/${course.slug}`}
                          className="text-[1.4rem] font-bold text-[#0265FF] hover:text-[#0052cc] transition-colors"
                        >
                          Xem chi tiết →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
