const BASE_URL = "/api";

export const API = {
  AUTH: {
    LOGIN: `${BASE_URL}/user/login`,
    GOOGLE_LOGIN: `${BASE_URL}/user/auth/google`,
    APPLE_LOGIN: `${BASE_URL}/user/auth/apple`,
    REGISTER: `${BASE_URL}/user/register`,
    LOGOUT: `${BASE_URL}/user/logout`,
    ME: `${BASE_URL}/user/me`,
    CHANGE_PASSWORD: `${BASE_URL}/user/change-password`,
    FORGOT_PASSWORD: `${BASE_URL}/user/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/user/reset-password`,
    REFRESH: `${BASE_URL}/user/refresh`,
    VERIFY_EMAIL: (token) => `${BASE_URL}/user/verify-email?token=${token}`,
    AVATAR: `${BASE_URL}/user/me/avatar`,
    COVER: `${BASE_URL}/user/me/cover`,
  },
  COURSES: {
    LIST: `${BASE_URL}/courses`,
    DETAIL: (id) => `${BASE_URL}/courses/${id}`,
    DETAIL_BY_SLUG: (slug) => `${BASE_URL}/courses/slug/${slug}`,
    CURRICULUM: (id) => `${BASE_URL}/courses/${id}/curriculum`,
    CATEGORIES: `${BASE_URL}/categories?type=course`,
    TAGS: `${BASE_URL}/tags?type=course`,
    LESSON: (slug, lessonSlug) => `${BASE_URL}/courses/${slug}/lessons/${lessonSlug}`,
    ENROLL: (courseId) => `${BASE_URL}/courses/${courseId}/enroll`,
    MY_COURSES: `${BASE_URL}/courses/my-courses`,
    PROGRESS: (courseId) => `${BASE_URL}/courses/${courseId}/progress`,
    LESSON_PROGRESS: (courseId, lessonId) => `${BASE_URL}/courses/${courseId}/lessons/${lessonId}/progress`,
    SECTIONS: (courseId) => `${BASE_URL}/courses/${courseId}/sections`,
    ENROLL_COURSE: (courseId) => `${BASE_URL}/courses/${courseId}/enrollments`,
  },
  QUIZ: {
    /** Quiz của một bài học (kèm câu hỏi + lựa chọn, KHÔNG kèm đáp án đúng) */
    LESSON_QUIZ: (courseId, lessonId) =>
      `${BASE_URL}/courses/${courseId}/lessons/${lessonId}/quiz`,
    /** Nộp bài một lần (không tạo attempt) */
    SUBMIT: (quizId) => `${BASE_URL}/quizzes/${quizId}/submit`,
  },
  ENROLLMENTS: {
    MY_ENROLLMENTS: `${BASE_URL}/me/enrollments`,
    ENROLL_COURSE: (courseId) => `${BASE_URL}/courses/${courseId}/enrollments`,
  },
  ORDERS: {
    CREATE: `${BASE_URL}/orders`,
    MY_ORDERS: `${BASE_URL}/orders`,
    DETAIL: (id) => `${BASE_URL}/orders/${id}`,
    RECEIPT: (id) => `${BASE_URL}/orders/${id}/receipt`,
    CANCEL: (id) => `${BASE_URL}/orders/${id}/cancel`,
  },
  PAYMENT: {
    CHECK_SEPAY: (txnRef) => `${BASE_URL}/payment/sepay/check?txnRef=${txnRef}`,
  },
  VIDEO: {
    LESSON_PLAYBACK: (courseId, lessonId) => `${BASE_URL}/courses/${courseId}/lessons/${lessonId}/playback`,
    LESSON_VIDEO: (courseId, lessonId) => `${BASE_URL}/courses/${courseId}/lessons/${lessonId}/video`,
    PLAYBACK: (courseId, videoId) => `${BASE_URL}/courses/${courseId}/videos/${videoId}/playback`,
  },
  PROGRESS: {
    SYNC: `${BASE_URL}/progress/sync`,
    CHANGES: `${BASE_URL}/progress/changes`,
  },
  SHOP: {
    PRODUCTS: `${BASE_URL}/products`,
    PRODUCT_BY_ID: (identifier) => `${BASE_URL}/products/${identifier}`,
    CATEGORIES: `${BASE_URL}/categories`,
    CART: `${BASE_URL}/cart`,
    CHECKOUT: `${BASE_URL}/checkout`,
    ORDERS: `${BASE_URL}/orders`,
    ORDER_BY_ID: (id) => `${BASE_URL}/orders/${id}`,
  },
  POSTS: {
    LIST: `${BASE_URL}/posts`,
    DETAIL: (slug) => `${BASE_URL}/posts/slug/${slug}`,
    DETAIL_BY_ID: (id) => `${BASE_URL}/posts/${id}`,
    TAGS: `${BASE_URL}/posts/tags`,
    LIKE: (postId) => `${BASE_URL}/posts/${postId}/like`,
    COMMENTS: (postId) => `${BASE_URL}/posts/${postId}/comments`,
    COMMENT_LIKE: (postId, commentId) => `${BASE_URL}/posts/${postId}/comments/${commentId}/like`,
  },
  ADMIN: {
    DASHBOARD_STATS: `${BASE_URL}/admin/dashboard/stats`,
    COURSES: `${BASE_URL}/admin/courses`,
    USERS: `${BASE_URL}/admin/users`,
    ORDERS: `${BASE_URL}/admin/orders`,
    REVENUE: `${BASE_URL}/admin/revenue`,
  },
  AI_TOOLS: {
    LIST: (type = 'skill') => {
      const resolvedType = type === 'api_model' ? 'api_provider' : type;
      return `${BASE_URL}/ai-tools-config?type=${resolvedType}`;
    },
    DETAIL: (type, itemKey) => {
      const resolvedType = type === 'api_model' ? 'api_provider' : type;
      return `${BASE_URL}/ai-tools-config/${resolvedType}/${itemKey}`;
    },
    API_MODELS: (itemKey) => `${BASE_URL}/ai-tools-config/api/${itemKey}/models`,
  },
  LEADS: {
    CREATE: `${BASE_URL}/leads`,
    LIST: `${BASE_URL}/leads`,
  },
};
