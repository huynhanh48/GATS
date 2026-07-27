import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { PUBLIC_API_URL } from "@/lib/apiClient";

type Category = {
  id: string;
  name: string;
  slug: string;
  courseCount: number;
};

export async function TopCategories() {
  let categories: Category[] = [];

  try {
    const res = await fetch(`${PUBLIC_API_URL}/api/categories?type=course`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      categories = (data.data || []).slice(0, 10);
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  // Fallback nếu API lỗi hoặc không có dữ liệu
  if (!categories.length) {
    categories = [
      { id: "1", name: "AI Thiết kế", slug: "art-design", courseCount: 38 },
      { id: "2", name: "AI Lập trình", slug: "development", courseCount: 38 },
      { id: "3", name: "AI Kinh doanh", slug: "communication", courseCount: 38 },
      { id: "4", name: "AI Dựng phim", slug: "videography", courseCount: 38 },
      { id: "5", name: "AI Nhiếp ảnh", slug: "photography", courseCount: 38 },
      { id: "6", name: "AI Marketing", slug: "marketing", courseCount: 38 },
      { id: "7", name: "AI Viết lách", slug: "content-writing", courseCount: 38 },
      { id: "8", name: "AI Tài chính", slug: "finance", courseCount: 38 },
      { id: "9", name: "AI Phân tích", slug: "science", courseCount: 38 },
      { id: "10", name: "AI Vận hành", slug: "network", courseCount: 38 },
    ];
  }

  return (
    <section className="w-full py-24 bg-white">
      <Container size="xl">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[3.6rem] font-bold text-[#111827] font-heading">
              Lĩnh Vực Đào Tạo
            </h2>
            <p className="text-[1.6rem] text-slate-500 font-medium">
              Khám phá các ứng dụng AI chuyên sâu
            </p>
          </div>
          
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 h-[4.2rem] text-[1.5rem] font-bold border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Link href="/categories">
              Tất cả lĩnh vực
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
          {categories.map((cat, index) => {
            const iconIndex = (index % 10) + 1;
            const iconName = iconIndex === 1 ? 'Icon-1.svg' : `icon-${iconIndex}.svg`;
            
            return (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center justify-center p-12 rounded-2xl border border-slate-200 transition-all duration-300 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-transparent"
              >
                <div className="w-16 h-16 mb-6 flex items-center justify-center">
                  <img 
                    src={`/images/categories/${iconName}`} 
                    alt={cat.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-[1.8rem] font-bold text-[#111827] text-center mb-2 transition-colors group-hover:text-[#ff782d]">
                  {cat.name}
                </h3>
                <p className="text-[1.5rem] text-slate-500 font-medium text-center">
                  {cat.courseCount} Khóa học
                </p>
              </Link>
            );
          })}
        </div>

      </Container>
    </section>
  );
}
