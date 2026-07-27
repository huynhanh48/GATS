import Link from "next/link";
import { Clock, GraduationCap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { PathApi } from "@/constants/PathApi";
import { PUBLIC_API_URL } from "@/lib/apiClient";
import { resolveMediaUrl } from "@/lib/media/url";
import type { Course } from "@/types/course";

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

export async function FeaturedCourses() {
  let courses: Course[] = [];

  try {
    const res = await fetch(`${PUBLIC_API_URL}${PathApi.courses.list}?take=6&skip=0&status=published`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const payload = await res.json();
      courses = payload.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch featured courses:", error);
  }

  return (
    <section className="w-full py-24 bg-white">
      <Container size="xl">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[3.6rem] font-bold text-[#111827] font-heading">
              Khóa Học Nổi Bật
            </h2>
            <p className="text-[1.6rem] text-slate-500 font-medium">
              Những chương trình AI được học viên yêu thích nhất
            </p>
          </div>
          
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 h-[4.2rem] text-[1.5rem] font-bold border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Link href="/courses">
              Tất cả khóa học
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <h3 className="text-2xl font-bold mb-2">Khóa học đang được cập nhật</h3>
              <p>Vui lòng quay lại sau để xem các chương trình mới.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course, index) => {
                const isFree = course.price <= 0;
                const onSale = hasSale(course.price, course.salePrice);
                const tag = course.tags?.[0]?.name ?? course.category?.name ?? "Photography";
                const thumbnail = resolveMediaUrl(
                  course.thumbnail,
                  "https://placehold.co/600x400/EAF3FE/0070EB?text=GATS+Academy",
                );

                return (
                  <article 
                    key={course.id}
                    className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-transparent"
                  >
                    {/* Image Section */}
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
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-black text-white text-[1.1rem] font-bold px-3 py-1 rounded-md">
                        {tag}
                      </div>
                    </Link>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-[1.2rem] text-slate-500 mb-3">
                        bởi <span className="font-medium text-slate-700">Giảng viên GATS</span>
                      </div>

                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="mb-4 line-clamp-2 text-[1.8rem] font-bold leading-[1.35] text-[#111827] transition-colors group-hover:text-[#ff782d]">
                          {course.title}
                        </h3>
                      </Link>

                      {/* Meta Info */}
                      <div className="flex items-center gap-5 text-[1.3rem] text-slate-500 mb-6 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-[1.6rem] h-[1.6rem] text-[#ff782d]" />
                          <span>2 Tuần</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-[1.6rem] h-[1.6rem] text-[#ff782d]" />
                          <span>156 Học viên</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-2">
                          {onSale ? (
                            <span className="text-[1.3rem] font-medium text-slate-400 line-through">
                              {course.price.toLocaleString("vi-VN")}đ
                            </span>
                          ) : null}
                          <span className={`text-[1.6rem] font-bold ${isFree ? 'text-[#10b981]' : 'text-[#ff782d]'}`}>
                            {formatPrice(course.price, course.salePrice)}
                          </span>
                        </div>
                        
                        <Link 
                          href={`/courses/${course.slug}`}
                          className="text-[1.4rem] font-bold text-[#111827] hover:text-[#ff782d] transition-colors"
                        >
                          Xem chi tiết
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
