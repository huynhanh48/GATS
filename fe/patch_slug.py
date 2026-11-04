import re

with open("src/app/courses/[slug]/page.tsx", "r") as f:
    content = f.read()

# Add imports
content = content.replace('import { Header }', 'import { useEffect } from "react";\nimport { Course } from "@/types/course";\nimport { PathApi } from "@/constants/PathApi";\nimport { Header }', 1)

# Modify component
new_logic = """
export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${PathApi.courses.detailBySlug(params.slug)}`)
      .then(res => res.json())
      .then(res => {
        if(res.course) setCourseData(res.course);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  // Fallback mock data matching the new template for fields not yet in API
  const mockCourse = {
    subtitle: "Chinh Phục Python Trong 30 Ngày: Từ Cơ Bản Đến Nâng Cao (Tiếng Việt) - Lập trình Python",
    rating: 4.6,
    reviews: "1.102 xếp hạng",
    students: "10.391 học viên",
    author: "AI Coding",
    updated: "6/2026",
    language: "Tiếng Việt",
    breadcrumbs: ["CNTT & Phần mềm", "CNTT & Phần mềm khác", "Python"],
    badges: ["Bán chạy nhất", "Nhập vai"],
    whatYouWillLearn: [
      "Nền tảng Python vững chắc để học tiếp AI, Data Science hay lập trình Web",
      "Kiến thức toàn diện về Python, bắt đầu với biến, kiểu dữ liệu, chuỗi, các phép toán",
      "Khám phá cách sử dụng cấu trúc điều khiển, vòng lặp, hàm, xử lý file",
      "Quản lý môi trường lập trình với virtual environment, quản lý các gói trong Python",
      "Các khái niệm nâng cao như xử lý lỗi, biểu thức chính quy, giúp tối ưu hóa quá trình viết code.",
      "Lập trình hướng đối tượng trong Python",
      "Sử dụng các công cụ mạnh mẽ như Numpy, Matplotlib, Pandas để phục cho cho trí tuệ nhân tạo.",
      "Thực hành với cơ sở dữ liệu như SQLite3 giúp lưu trữ dữ liệu"
    ],
    relatedTopics: ["Python", "CNTT & Phần mềm khác", "CNTT & Phần mềm"],
    features: [
      { icon: Monitor, text: "24 giờ video theo yêu cầu" },
      { icon: Download, text: "20 tài nguyên có thể tải xuống" },
      { icon: FileText, text: "8 bài viết" },
      { icon: Smartphone, text: "Truy cập trên thiết bị di động và TV" },
      { icon: Trophy, text: "Giấy chứng nhận hoàn thành" },
    ],
    curriculumStats: "35 phần • 189 bài giảng • 23 giờ 51 phút tổng thời lượng",
    curriculum: [
      {
        title: "Introduction",
        lectures: 6,
        duration: "16 phút",
        lessons: [
          { title: "Introduction - Giới thiệu giảng viên", duration: "0:54", preview: true },
          { title: "Khóa học này dành cho ai", duration: "2:12", preview: true },
          { title: "Lộ trình chinh phục Python trong 30 ngày", duration: "4:12", preview: true },
          { title: "Thông tin về additional sections", duration: "2:32", preview: false },
          { title: "Cách học hiệu quả trên Udemy", duration: "5:05", preview: false },
          { title: "Vấn đề bản quyền khóa học - Quan trọng", duration: "0:55", preview: false },
        ]
      },
      {
        title: "Cài đặt môi trường lập trình Python",
        lectures: 4,
        duration: "35 phút",
        lessons: [
          { title: "Cài đặt Python trên Windows", duration: "10:20", preview: false },
          { title: "Cài đặt VS Code", duration: "12:15", preview: false },
        ]
      }
    ]
  };

  const [openChapters, setOpenChapters] = useState<number[]>([0]);
  const [showAllLearning, setShowAllLearning] = useState(false);

  const toggleChapter = (index: number) => {
    setOpenChapters(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">Đang tải...</div>;
  if (!courseData) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-bold">Không tìm thấy khóa học</div>;

  // Merge API data with mock data
  const course = {
    ...mockCourse,
    title: courseData.title,
    price: courseData.price,
    salePrice: courseData.salePrice,
    thumbnail: courseData.thumbnail,
    categoryName: courseData.category?.name || "Khóa học",
    description: courseData.description || mockCourse.subtitle,
  };
"""

content = re.sub(r'export default function CourseDetailPage.*?const toggleChapter.*?};', new_logic, content, flags=re.DOTALL)

# Now, we need to fix references in the JSX.
# - {course.subtitle} -> {course.description}
content = content.replace('{course.subtitle}', '{course.description}')

# - formatPrice(course.price) and formatPrice(course.salePrice) logic
content = content.replace('{course.price.toLocaleString(\'vi-VN\')} đ', '{course.salePrice ? course.salePrice.toLocaleString(\'vi-VN\') : course.price.toLocaleString(\'vi-VN\')} đ')
content = content.replace('{course.originalPrice.toLocaleString(\'vi-VN\')} đ', '{course.price.toLocaleString(\'vi-VN\')} đ')

# - img src
content = re.sub(r'src="https://images.unsplash.com.*?"', 'src={course.thumbnail || "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&q=80&w=600"}', content)

with open("src/app/courses/[slug]/page.tsx", "w") as f:
    f.write(content)
