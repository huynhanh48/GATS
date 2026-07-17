import 'package:gats_academy/features/course/data/mock_course_repository.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';

/// Điểm truy cập repository.
///
/// Hiện: [MockCourseRepository] (JSON catalog).
/// Khi nối API display: dùng [CourseApiService] + [CourseBeMapper]
/// (`lib/data/api/`) rồi thay implementation tại đây.
abstract final class CourseModule {
  static final CourseRepository repository = MockCourseRepository();
}
