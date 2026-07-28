/// Paths khớp BE `src/common/paths/progress.ts`.
abstract final class ProgressApiPaths {
  static String course(String courseId) => '/api/courses/$courseId/progress';

  static String lesson(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/progress';

  static const sync = '/api/progress/sync';
  static const changes = '/api/progress/changes';
}
