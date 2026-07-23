abstract final class CourseChatApiPaths {
  static String messages(String courseId) => '/api/courses/$courseId/chat';
  static String message(String courseId, String messageId) =>
      '/api/courses/$courseId/chat/$messageId';
  static String pin(String courseId, String messageId) =>
      '/api/courses/$courseId/chat/$messageId/pin';
}
