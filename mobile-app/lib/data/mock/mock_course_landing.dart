import 'package:gats_academy/data/mock/mock_course_landing_en.dart';
import 'package:gats_academy/data/mock/models/course_landing_models.dart';

abstract final class MockCourseLanding {
  static CourseLandingContent? forCourse(String courseId, {String languageCode = 'vi'}) {
    if (languageCode == 'en') {
      return MockCourseLandingEn.landings[courseId];
    }
    return _landingsVi[courseId];
  }

  static final Map<String, CourseLandingContent> _landingsVi = {
    'course-1': const CourseLandingContent(
      courseId: 'course-1',
      subtitle: 'Lộ trình thực hành AI cho người đi làm — từ prompt đến tự động hóa',
      about:
          'Khóa học giúp bạn áp dụng AI vào công việc văn phòng hằng ngày: viết email, tóm tắt báo cáo, '
          'phân tích số liệu và xây workflow tiết kiệm thời gian. Mỗi module có bài tập thực hành ngắn, '
          'phù hợp học 10–15 phút mỗi ngày.',
      learningOutcomes: [
        'Viết prompt rõ ràng cho email, báo cáo và slide thuyết trình',
        'Dùng ChatGPT/Claude để tóm tắt tài liệu dài trong vài phút',
        'Tự động hóa Excel và Google Sheets với AI',
        'Xây workflow AI cho team 3–10 người',
        'Đánh giá rủi ro & bảo mật khi dùng AI tại công ty',
      ],
      requirements: [
        'Biết dùng máy tính cơ bản (Word, Excel, email)',
        'Không cần biết lập trình',
        'Có tài khoản ChatGPT hoặc tương đương (miễn phí được)',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Tuần 1 · Nền tảng AI cho công sở',
          lessons: [
            CourseCurriculumLesson(title: 'AI là gì & LLM hoạt động thế nào', durationMinutes: 12, isPreview: true),
            CourseCurriculumLesson(title: 'Bộ công cụ AI cho dân văn phòng', durationMinutes: 15, isPreview: true),
            CourseCurriculumLesson(title: 'Prompt cơ bản: vai trò + ngữ cảnh + đầu ra', durationMinutes: 18),
            CourseCurriculumLesson(title: 'Thực hành: Viết email chuyên nghiệp', durationMinutes: 20),
          ],
        ),
        CourseCurriculumSection(
          title: 'Tuần 2 · Sản xuất nội dung & báo cáo',
          lessons: [
            CourseCurriculumLesson(title: 'Tóm tắt PDF & biên bản họp', durationMinutes: 22),
            CourseCurriculumLesson(title: 'Tạo slide từ outline', durationMinutes: 25),
            CourseCurriculumLesson(title: 'Chỉnh tone: trang trọng / thân thiện / thuyết phục', durationMinutes: 16),
            CourseCurriculumLesson(title: 'Quiz tuần 2', durationMinutes: 10),
          ],
        ),
        CourseCurriculumSection(
          title: 'Tuần 3 · Dữ liệu & tự động hóa',
          lessons: [
            CourseCurriculumLesson(title: 'Phân tích bảng số liệu với AI', durationMinutes: 24),
            CourseCurriculumLesson(title: 'Công thức Excel + gợi ý từ AI', durationMinutes: 28),
            CourseCurriculumLesson(title: 'Workflow: từ form → báo cáo tự động', durationMinutes: 30),
            CourseCurriculumLesson(title: 'Dự án cuối: Quy trình AI cho team bạn', durationMinutes: 35),
          ],
        ),
      ],
      instructorName: 'Mentor GATS',
      instructorTitle: 'Chuyên gia AI ứng dụng · 8 năm đào tạo doanh nghiệp',
      rating: 4.8,
      reviewCount: 1240,
      studentCount: 8600,
      level: 'Cơ bản → Trung cấp',
      lastUpdated: '03/2026',
    ),
    'course-2': const CourseLandingContent(
      courseId: 'course-2',
      subtitle: 'Viết prompt chuyên nghiệp — kỹ thuật từ cơ bản đến nâng cao',
      about:
          'Khóa Prompt Engineering tập trung vào kỹ thuật viết lệnh cho LLM: zero-shot, few-shot, chain-of-thought, '
          'và tối ưu đầu ra theo từng use-case. Phù hợp người muốn làm chủ AI thay vì chỉ dùng thử.',
      learningOutcomes: [
        'Phân biệt zero-shot, few-shot và chain-of-thought',
        'Thiết kế prompt có cấu trúc: role, task, constraints, format',
        'Debug prompt khi kết quả không như mong đợi',
        'Xây template prompt tái sử dụng cho team',
        'Đánh giá chất lượng output bằng rubric đơn giản',
      ],
      requirements: [
        'Đã từng dùng ChatGPT hoặc tương đương',
        'Không cần kiến thức lập trình',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Phần 1 · Nền tảng Prompt',
          lessons: [
            CourseCurriculumLesson(title: 'Mô hình tư duy: input → context → output', durationMinutes: 14, isPreview: true),
            CourseCurriculumLesson(title: 'Zero-shot vs Few-shot', durationMinutes: 18, isPreview: true),
            CourseCurriculumLesson(title: 'Vai trò (role) và giọng điệu', durationMinutes: 16),
          ],
        ),
        CourseCurriculumSection(
          title: 'Phần 2 · Kỹ thuật nâng cao',
          lessons: [
            CourseCurriculumLesson(title: 'Chain-of-thought & step-by-step', durationMinutes: 22),
            CourseCurriculumLesson(title: 'Ràng buộc đầu ra: JSON, bảng, checklist', durationMinutes: 20),
            CourseCurriculumLesson(title: 'Few-shot với ví dụ mẫu hiệu quả', durationMinutes: 24),
          ],
        ),
        CourseCurriculumSection(
          title: 'Phần 3 · Thực chiến',
          lessons: [
            CourseCurriculumLesson(title: 'Prompt cho marketing & sales', durationMinutes: 26),
            CourseCurriculumLesson(title: 'Prompt cho phân tích & quyết định', durationMinutes: 28),
            CourseCurriculumLesson(title: 'Kiểm tra cuối khóa', durationMinutes: 15),
          ],
        ),
      ],
      instructorName: 'Mentor GATS',
      instructorTitle: 'Prompt engineer · Tư vấn AI cho startup',
      rating: 4.9,
      reviewCount: 890,
      studentCount: 5200,
      level: 'Trung cấp',
      lastUpdated: '02/2026',
    ),
    'course-3': const CourseLandingContent(
      courseId: 'course-3',
      subtitle: 'Workflow & agent AI cho team nhỏ',
      about:
          'Học cách thiết kế luồng tự động: trigger → xử lý AI → phê duyệt → gửi kết quả. '
          'Phù hợp freelancer và team muốn scale công việc lặp lại.',
      learningOutcomes: [
        'Vẽ sơ đồ workflow AI trước khi triển khai',
        'Kết nối công cụ no-code với API LLM',
        'Thiết kế agent đơn giản với memory ngắn hạn',
        'Giám sát lỗi và fallback khi AI trả kết quả sai',
      ],
      requirements: [
        'Đã hoàn thành khóa Prompt cơ bản hoặc tương đương',
        'Có Gmail/Notion/Sheets trong công việc hàng ngày',
      ],
      curriculum: [
        CourseCurriculumSection(
          title: 'Module 1 · Workflow fundamentals',
          lessons: [
            CourseCurriculumLesson(title: 'Trigger, action, condition', durationMinutes: 20),
            CourseCurriculumLesson(title: 'Demo: Email → AI → Slack', durationMinutes: 25),
          ],
        ),
        CourseCurriculumSection(
          title: 'Module 2 · Agent & scale',
          lessons: [
            CourseCurriculumLesson(title: 'Agent 1 vai trò vs multi-agent', durationMinutes: 30),
            CourseCurriculumLesson(title: 'Dự án: Tự động báo cáo tuần', durationMinutes: 40),
          ],
        ),
      ],
      instructorName: 'Mentor GATS',
      instructorTitle: 'Automation consultant',
      rating: 4.7,
      reviewCount: 320,
      studentCount: 1800,
      level: 'Nâng cao',
      lastUpdated: '01/2026',
    ),
  };
}
