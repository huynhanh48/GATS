/// Paths khớp BE `src/common/paths/{course,enrollment}.ts`.
abstract final class CourseApiPaths {
  static const list = '/api/courses';
  static String byId(String id) => '/api/courses/$id';
  static String bySlug(String slug) => '/api/courses/slug/$slug';
  static String curriculum(String courseId) =>
      '/api/courses/$courseId/curriculum';

  /// Free self-enroll: `POST` body `{}`. Admin grant: `{ user_id, source? }`.
  static String enrollments(String courseId) =>
      '/api/courses/$courseId/enrollments';

  static const myEnrollments = '/api/me/enrollments';
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
}
