import 'package:gats_academy/features/course/data/mock_course_repository.dart';
import 'package:gats_academy/features/course/domain/course_repository.dart';

/// Điểm truy cập repository — đổi implementation khi nối API.
abstract final class CourseModule {
  static final CourseRepository repository = MockCourseRepository();
}
