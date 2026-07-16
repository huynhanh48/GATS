import { courseThumbAt } from "./courses";

export type LandingArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  image: string;
};

export const LANDING_ARTICLES: LandingArticle[] = [
  {
    id: "article-1",
    title: "Lộ trình học AI cho người đi làm trong 30 ngày",
    slug: "lo-trinh-hoc-ai-cho-nguoi-di-lam",
    excerpt:
      "Cách chia nhỏ mục tiêu, chọn bài tập thực hành và biến AI thành thói quen làm việc hằng ngày.",
    category: "AI thực chiến",
    readMinutes: 6,
    image: courseThumbAt(0),
  },
  {
    id: "article-2",
    title: "Nên học khóa miễn phí hay trả phí trước?",
    slug: "nen-hoc-khoa-mien-phi-hay-tra-phi",
    excerpt:
      "Một khung ra quyết định đơn giản giúp bạn chọn đúng khóa theo thời gian, ngân sách và mục tiêu.",
    category: "Hướng dẫn chọn khóa",
    readMinutes: 4,
    image: courseThumbAt(1),
  },
  {
    id: "article-3",
    title: "5 lỗi thường gặp khi tự học Prompt Engineering",
    slug: "loi-thuong-gap-khi-tu-hoc-prompt-engineering",
    excerpt:
      "Những lỗi khiến prompt thiếu ổn định và cách sửa bằng vai trò, ngữ cảnh, ràng buộc, ví dụ đầu ra.",
    category: "Prompt Engineering",
    readMinutes: 7,
    image: courseThumbAt(2),
  },
];
