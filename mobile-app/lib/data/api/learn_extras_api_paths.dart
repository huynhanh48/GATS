/// Paths khớp BE `src/common/paths/learn-extras.ts`.
abstract final class LearnExtrasApiPaths {
  static String questions(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/questions';
  static String deleteQuestion(String questionId) =>
      '/api/questions/$questionId';

  static String lessonNotes(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/notes';
  static String note(String noteId) => '/api/notes/$noteId';

  static String lessonBookmarks(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/bookmarks';
  static String bookmark(String bookmarkId) => '/api/bookmarks/$bookmarkId';
}
