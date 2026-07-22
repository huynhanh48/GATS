/// Paths khớp BE `src/common/paths/assignment.ts`.
abstract final class AssignmentApiPaths {
  static String byLesson(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/assignment';
  static String submit(String assignmentId) =>
      '/api/assignments/$assignmentId/submissions';
  static String mine(String assignmentId) =>
      '/api/assignments/$assignmentId/submissions/mine';
}
