/**
 * Public & member API paths for Frontend.
 * Excludes admin/dashboard routes (requirePermission).
 *
 * Auth levels:
 * - public   – no token required
 * - optional – works without token; token enriches response (e.g. isLiked)
 * - member   – Bearer token / cookie required
 */

const API_PREFIX = '/api';

export const PathApi = {
  auth: {
    /** POST – auth: public */
    register: `${API_PREFIX}/user/register`,
    /** POST – auth: public */
    login: `${API_PREFIX}/user/login`,
    /** POST – auth: public */
    verifyEmail: `${API_PREFIX}/user/verify-email`,
    /** GET – auth: public (HTML page) – query: token */
    verifyEmailLink: `${API_PREFIX}/user/verify-email`,
    /** POST – auth: member */
    logout: `${API_PREFIX}/user/logout`,
    /** GET – auth: member */
    me: `${API_PREFIX}/user/me`,
  },

  courses: {
    /** GET – auth: optional – query: status, level (basic→beginner), category, tag, page, limit, deleted (without|with|only; only/with require auth) */
    list: `${API_PREFIX}/courses`,
    /** GET – auth: optional – response: course detail (author, stats, learningOutcomes, includes, sections w/ locked lessons). Unlocked lessons include `attachments[]` (downloadable files: id, name, url, mimeType, size) */
    detailBySlug: (slug: string) => `${API_PREFIX}/courses/slug/${slug}`,
    /** GET – auth: optional */
    detailById: (id: string) => `${API_PREFIX}/courses/${id}`,
    /** GET – auth: optional – unlocked lessons include `attachments[]` downloadable files */
    curriculum: (courseId: string) => `${API_PREFIX}/courses/${courseId}/curriculum`,
    /** GET – auth: member (enrolled or course read permission) */
    sections: (courseId: string) => `${API_PREFIX}/courses/${courseId}/sections`,
    /** GET – auth: optional – legacy alias of categories.list?type=course */
    categoriesLegacy: `${API_PREFIX}/courses/categories`,
  },

  categories: {
    /** GET – auth: optional – query: type=course|post (required), status */
    list: `${API_PREFIX}/categories`,
  },

  tags: {
    /** GET – auth: optional – query: type=course|post|global, status */
    list: `${API_PREFIX}/tags`,
    /** GET – auth: optional – legacy alias of tags.list?type=post */
    postsLegacy: `${API_PREFIX}/posts/tags`,
  },

  posts: {
    /** GET – auth: optional – query: status, search, tag, category, page, limit, deleted (without|with|only; only/with require auth) */
    list: `${API_PREFIX}/posts`,
    /** GET – auth: optional (drafts / private need admin read) */
    detailById: (postId: string) => `${API_PREFIX}/posts/${postId}`,
    /** GET – auth: optional */
    detail: (slug: string) => `${API_PREFIX}/posts/slug/${slug}`,
    /** POST – auth: member */
    like: (postId: string) => `${API_PREFIX}/posts/${postId}/like`,
    /** DELETE – auth: member */
    unlike: (postId: string) => `${API_PREFIX}/posts/${postId}/like`,
  },

  comments: {
    /** GET – auth: optional – query: page, limit */
    list: (postId: string) => `${API_PREFIX}/posts/${postId}/comments`,
    /** GET – auth: optional – query: page, limit */
    replies: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}/replies`,
    /** POST – auth: member */
    create: (postId: string) => `${API_PREFIX}/posts/${postId}/comments`,
    /** POST – auth: member */
    createReply: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}/replies`,
    /** PATCH – auth: member (owner) */
    update: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}`,
    /** DELETE – auth: member (owner) */
    delete: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}`,
    /** POST – auth: member */
    like: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}/like`,
    /** DELETE – auth: member */
    unlike: (postId: string, commentId: string) =>
      `${API_PREFIX}/posts/${postId}/comments/${commentId}/like`,
  },

  enrollment: {
    /** POST – auth: member (self-enroll free course) */
    enroll: (courseId: string) => `${API_PREFIX}/courses/${courseId}/enrollments`,
    /** GET – auth: member */
    listMine: `${API_PREFIX}/me/enrollments`,
  },

  cart: {
    /** GET – auth: member */
    get: `${API_PREFIX}/cart`,
    /** POST – auth: member – body: { courseId, quantity? } */
    add: `${API_PREFIX}/cart`,
    /** PUT – auth: member – body: { quantity } */
    updateItem: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
    /** DELETE – auth: member */
    removeItem: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
    /** DELETE – auth: member */
    clear: `${API_PREFIX}/cart`,
  },

  orders: {
    /**
     * POST – auth: member – body: { paymentMethod, items?, fromCart?, customerName?, ... }
     * bank_transfer uses DB default bank account when active; else env BANK_*.
     * Response payment: bankAccountId, bankAccountSource ('db'|'env'), bankAccountNumber, bankName, bankAccountName, qrUrl.
     */
    create: `${API_PREFIX}/orders`,
    /** GET – auth: member */
    list: `${API_PREFIX}/orders`,
    /** GET – auth: member */
    detail: (orderId: string) => `${API_PREFIX}/orders/${orderId}`,
    /** POST – auth: member – cancel pending order */
    cancel: (orderId: string) => `${API_PREFIX}/orders/${orderId}/cancel`,
  },

  payment: {
    /** POST – auth: public (Sepay webhook, Bearer SEPAY_API_KEY) – body: content, amountIn */
    sepayWebhook: `${API_PREFIX}/payment/sepay/webhook`,
    /** GET – auth: member – query: txnRef – polls Sepay API then confirms + enrolls */
    sepayCheck: `${API_PREFIX}/payment/sepay/check`,
    /** GET – auth: public – VNPay return (not implemented) */
    vnpayReturn: `${API_PREFIX}/payment/vnpay/return`,
    /** GET – auth: public – MoMo return (not implemented) */
    momoReturn: `${API_PREFIX}/payment/momo/return`,
  },

  progress: {
    /** PUT – auth: member */
    lesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/progress`,
    /** GET – auth: member */
    lessonGet: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/progress`,
    /** GET – auth: member */
    course: (courseId: string) => `${API_PREFIX}/courses/${courseId}/progress`,
  },

  video: {
    /** GET – auth: optional */
    playback: (courseId: string, videoId: string) =>
      `${API_PREFIX}/courses/${courseId}/videos/${videoId}/playback`,
  },

  quiz: {
    /** GET – auth: member */
    byLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/quiz`,
    /** POST – auth: member */
    startAttempt: (quizId: string) => `${API_PREFIX}/quizzes/${quizId}/attempts`,
    /** PUT – auth: member */
    saveAnswer: (attemptId: string, questionId: string) =>
      `${API_PREFIX}/quiz-attempts/${attemptId}/answers/${questionId}`,
    /** POST – auth: member */
    submitAttempt: (attemptId: string) =>
      `${API_PREFIX}/quiz-attempts/${attemptId}/submit`,
    /** GET – auth: member */
    attemptResult: (attemptId: string) =>
      `${API_PREFIX}/quiz-attempts/${attemptId}/result`,
  },

  assignment: {
    /** GET – auth: member */
    byLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/assignment`,
    /** POST – auth: member */
    submit: (assignmentId: string) =>
      `${API_PREFIX}/assignments/${assignmentId}/submissions`,
    /** GET – auth: member */
    mySubmission: (assignmentId: string) =>
      `${API_PREFIX}/assignments/${assignmentId}/submissions/mine`,
    /** POST – auth: member */
    initUpload: (assignmentId: string) =>
      `${API_PREFIX}/assignments/${assignmentId}/submissions/init-upload`,
    /** POST – auth: member */
    completeUpload: (submissionId: string) =>
      `${API_PREFIX}/assignment-submissions/${submissionId}/attachments/complete`,
  },
} as const;
