/// Paths khớp BE `src/common/paths/{course,enrollment}.ts`.
abstract final class CourseApiPaths {
  static const list = '/api/courses';
  static const recommendations = '/api/courses/recommendations';
  static const recommendationEvents = '/api/courses/recommendations/events';
  static String byId(String id) => '/api/courses/$id';
  static String bySlug(String slug) => '/api/courses/slug/$slug';
  static String curriculum(String courseId) =>
      '/api/courses/$courseId/curriculum';

  /// Free self-enroll: `POST` body `{}`. Admin grant: `{ user_id, source? }`.
  static String enrollments(String courseId) =>
      '/api/courses/$courseId/enrollments';

  static const myEnrollments = '/api/me/enrollments';
}

/// Paths khớp BE `src/common/paths/video.ts`.
abstract final class VideoApiPaths {
  static String lessonVideo(String courseId, String lessonId) =>
      '/api/courses/$courseId/lessons/$lessonId/video';

  static String playback(String courseId, String videoId) =>
      '/api/courses/$courseId/videos/$videoId/playback';
}

/// Paths khớp BE `src/common/paths/cart.ts`.
abstract final class CartApiPaths {
  static const cart = '/api/cart';
  static String item(String itemId) => '/api/cart/items/$itemId';
}

/// Paths khớp BE `src/common/paths/order.ts`.
abstract final class OrderApiPaths {
  static const orders = '/api/orders';
  static String byId(String orderId) => '/api/orders/$orderId';
  static String cancel(String orderId) => '/api/orders/$orderId/cancel';
}

/// Paths khớp BE `src/common/paths/post.ts`.
abstract final class PostApiPaths {
  static const list = '/api/posts';
  static String byId(String id) => '/api/posts/$id';
  static String bySlug(String slug) => '/api/posts/slug/$slug';
  static String comments(String postId) => '/api/posts/$postId/comments';
  static String commentReplies(String postId, String commentId) =>
      '/api/posts/$postId/comments/$commentId/replies';
  static String commentLike(String postId, String commentId) =>
      '/api/posts/$postId/comments/$commentId/like';
  static String like(String postId) => '/api/posts/$postId/like';
}

abstract final class CategoryApiPaths {
  static const list = '/api/categories';
}
