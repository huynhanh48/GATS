import 'package:gats_academy/features/course/data/api_course_repository.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';

/// Điểm truy cập repository khóa học.
///
/// Gọi [CourseModule.init()] một lần khi app khởi động (hoặc sau khi
/// user login / logout) để sync danh sách khóa học và enrollment từ BE.
///
/// Fallback: nếu BE không khả dụng, [ApiCourseRepository] trả list rỗng
/// và các screen tự xử lý trạng thái loading/error.
abstract final class CourseModule {
  static final ApiCourseRepository _repo = ApiCourseRepository();

  /// Repository public — dùng để đọc/ghi courses, enrollment, progress.
  static CourseRepository get repository => _repo;

  /// Khởi tạo dữ liệu từ BE: fetch courses + enrollment của user hiện tại.
  ///
  /// Gọi tại `main.dart` sau khi [AuthPrefs.init()] hoàn tất, và lại mỗi khi
  /// auth state thay đổi (login / logout).
  static Future<void> init() => _repo.init();
}
