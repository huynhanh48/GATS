/// Endpoints dự kiến — implement khi có Postman/API thật.
abstract final class CourseApiPaths {
  static const list = '/api/courses';
  static String detail(String id) => '/api/courses/$id';
  static const enroll = '/api/enrollments';
  static String progress(String courseId) => '/api/courses/$courseId/progress';
}
