/// Paths khớp BE `src/common/paths/quiz.ts`.
abstract final class QuizApiPaths {
  static String take(String quizId) => '/api/quizzes/$quizId/take';
  static String submit(String quizId) => '/api/quizzes/$quizId/submit';
  static String byLesson(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/quiz';
}
