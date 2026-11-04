import { courseThumbAt } from "./courses";

export type LandingArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  image: string;
  author: string;
  publishedAt: string;
  summary: string;
  takeaways: string[];
  sections: Array<{
    title: string;
    body: string[];
  }>;
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
    author: "GATS Academy",
    publishedAt: "2026-07-10",
    summary:
      "Một lộ trình 30 ngày nên đủ gọn để bắt đầu, nhưng vẫn có nhịp thực hành để bạn thấy AI thật sự giúp được việc.",
    takeaways: [
      "Bắt đầu bằng việc bạn đang làm hằng ngày, không bắt đầu bằng công cụ.",
      "Chia mục tiêu thành các bài tập 20-30 phút để dễ duy trì.",
      "Mỗi tuần nên có một sản phẩm nhỏ: checklist, prompt, automation hoặc báo cáo.",
    ],
    sections: [
      {
        title: "Tuần 1: Làm quen với cách đặt vấn đề",
        body: [
          "Đừng học AI bằng cách gom thật nhiều prompt mẫu. Cách nhanh hơn là lấy một công việc quen thuộc, mô tả đầu vào, đầu ra mong muốn và tiêu chí đánh giá.",
          "Ví dụ: thay vì hỏi AI viết email, hãy đưa rõ người nhận, mục tiêu, ngữ cảnh, giọng văn và điều cần tránh. Bạn sẽ thấy chất lượng đầu ra ổn định hơn nhiều.",
        ],
      },
      {
        title: "Tuần 2: Tạo bộ prompt cá nhân",
        body: [
          "Khi đã có vài tác vụ lặp lại, hãy biến chúng thành bộ prompt riêng. Mỗi prompt nên có phần vai trò, dữ liệu đầu vào, yêu cầu xử lý và định dạng kết quả.",
          "Bộ prompt tốt không cần dài, nhưng phải giúp bạn giảm thời gian suy nghĩ lại từ đầu mỗi khi làm việc.",
        ],
      },
      {
        title: "Tuần 3-4: Biến kiến thức thành quy trình",
        body: [
          "Sau khi quen prompt, hãy ghép nhiều bước thành một quy trình: nghiên cứu, tóm tắt, lập dàn ý, kiểm tra lỗi và xuất bản.",
          "Mục tiêu cuối tháng không phải là biết thật nhiều công cụ, mà là có một quy trình làm việc nhanh hơn, rõ hơn và có thể lặp lại.",
        ],
      },
    ],
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
    author: "GATS Academy",
    publishedAt: "2026-07-08",
    summary:
      "Khóa miễn phí phù hợp để kiểm tra nền tảng và phong cách học; khóa trả phí phù hợp khi bạn cần lộ trình, bài tập và cam kết tiến độ.",
    takeaways: [
      "Học miễn phí trước nếu bạn chưa chắc mục tiêu.",
      "Chọn khóa trả phí khi cần lộ trình rõ và bài tập có cấu trúc.",
      "Đừng mua khóa chỉ vì giảm giá, hãy nhìn vào kết quả sau khóa.",
    ],
    sections: [
      {
        title: "Khi nào nên học khóa miễn phí?",
        body: [
          "Khóa miễn phí rất tốt cho giai đoạn thăm dò. Bạn có thể kiểm tra xem chủ đề đó có đúng nhu cầu không, giảng viên có dễ hiểu không và mình có đủ thời gian theo học không.",
          "Nếu sau vài bài đầu bạn vẫn chưa biết sẽ dùng kiến thức vào việc gì, hãy dừng lại để xác định mục tiêu trước khi mua thêm khóa.",
        ],
      },
      {
        title: "Khi nào nên chọn khóa trả phí?",
        body: [
          "Khóa trả phí đáng tiền khi nó giúp bạn đi nhanh hơn: có lộ trình, bài tập, ví dụ thực tế và tiêu chí hoàn thành rõ ràng.",
          "Bạn nên ưu tiên khóa cho thấy đầu ra cụ thể, ví dụ tạo portfolio, xây automation, hoàn thành dự án nhỏ hoặc cải thiện một kỹ năng đang dùng trong công việc.",
        ],
      },
      {
        title: "Một câu hỏi trước khi bấm mua",
        body: [
          "Hãy tự hỏi: sau khóa này mình sẽ làm được việc gì mà hiện tại chưa làm được? Nếu câu trả lời rõ, quyết định mua sẽ nhẹ hơn rất nhiều.",
        ],
      },
    ],
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
    author: "GATS Academy",
    publishedAt: "2026-07-05",
    summary:
      "Prompt tốt không phải prompt dài nhất, mà là prompt cho AI đủ ngữ cảnh, đủ ràng buộc và đủ tiêu chí để tự kiểm tra đầu ra.",
    takeaways: [
      "Thiếu ngữ cảnh là lỗi phổ biến nhất khi viết prompt.",
      "Prompt nên có ví dụ đầu ra nếu bạn cần định dạng ổn định.",
      "Luôn yêu cầu AI tự kiểm tra lại kết quả theo tiêu chí cụ thể.",
    ],
    sections: [
      {
        title: "Lỗi 1: Hỏi quá chung",
        body: [
          "Câu hỏi càng chung, câu trả lời càng dễ nhạt. Thay vì yêu cầu “viết nội dung marketing”, hãy nói rõ sản phẩm, khách hàng, kênh đăng, mục tiêu và giọng văn.",
          "AI không đọc được ý định trong đầu bạn, nên phần ngữ cảnh là thứ quyết định phần lớn chất lượng kết quả.",
        ],
      },
      {
        title: "Lỗi 2: Không đưa tiêu chí đánh giá",
        body: [
          "Nếu bạn không nói thế nào là tốt, AI sẽ tự đoán. Hãy thêm tiêu chí như độ dài, cấu trúc, điều cần tránh, mức độ chuyên môn và định dạng đầu ra.",
          "Một prompt tốt thường có câu: “Trước khi trả lời, hãy kiểm tra xem kết quả đã đáp ứng các tiêu chí sau chưa...”.",
        ],
      },
      {
        title: "Lỗi 3: Không lặp lại và cải tiến",
        body: [
          "Prompt Engineering là quá trình chỉnh dần, không phải viết một lần là xong. Mỗi lần kết quả lệch, hãy ghi lại nguyên nhân và thêm ràng buộc mới.",
          "Sau vài vòng, bạn sẽ có prompt ngắn hơn nhưng chính xác hơn vì nó chứa đúng các điều kiện quan trọng.",
        ],
      },
    ],
  },
];

export function findLandingArticle(slug: string) {
  return LANDING_ARTICLES.find((article) => article.slug === slug);
}
