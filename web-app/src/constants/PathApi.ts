/**
 * Public & member API paths for Frontend.
 * Excludes admin/dashboard routes (requirePermission).
 *
 * Auth levels:
 * - public   – no token required
 * - optional – works without token; token enriches response (e.g. isLiked)
 * - member   – cookie session required (httpOnly access_token)
 */

const API_PREFIX = '/api';

export const PathApi = {
  auth: {
    /** POST – auth: public */
    register: `${API_PREFIX}/user/register`,
    /** POST – auth: public */
    login: `${API_PREFIX}/user/login`,
    /** POST – auth: public */
    googleLogin: `${API_PREFIX}/user/auth/google`,
    /** POST – auth: public */
    verifyEmail: `${API_PREFIX}/user/verify-email`,
    /** GET – auth: public (HTML page) – query: token */
    verifyEmailLink: `${API_PREFIX}/user/verify-email`,
    /** POST – auth: member */
    logout: `${API_PREFIX}/user/logout`,
    /** GET – auth: member */
    me: `${API_PREFIX}/user/me`,
    /** PUT – auth: member */
    updateMe: `${API_PREFIX}/user/me`,
    /** POST – auth: member */
    changePassword: `${API_PREFIX}/user/change-password`,
    /** POST – auth: public */
    forgotPassword: `${API_PREFIX}/user/forgot-password`,
    /** POST – auth: public */
    resetPassword: `${API_PREFIX}/user/reset-password`,
  },

  courses: {
    /** GET – auth: optional – query: status, level (basic→beginner), category, tag, page, limit */
    list: `${API_PREFIX}/courses`,
    /** GET – auth: optional – response: course detail (author, stats, learningOutcomes, includes, sections w/ locked lessons) */
    detailBySlug: (slug: string) => `${API_PREFIX}/courses/slug/${slug}`,
    /** GET – auth: optional */
    detailById: (id: string) => `${API_PREFIX}/courses/${id}`,
    /** GET – auth: optional */
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
    /** GET – auth: optional – query: status, search, tag, category, page, limit */
    list: `${API_PREFIX}/posts`,
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
    /** GET - auth: member */
    lessonVideo: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/video`,
  },

  quiz: {
    /** GET – auth: member – take quiz payload (no correct answers) */
    byLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/quiz`,
    /** POST – auth: member */
    submit: (quizId: string) => `${API_PREFIX}/quizzes/${quizId}/submit`,
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
  },

  cart: {
    /** GET - auth: member */
    list: `${API_PREFIX}/cart`,
    /** POST - auth: member */
    add: `${API_PREFIX}/cart`,
    /** PUT - auth: member */
    update: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
    /** DELETE - auth: member */
    remove: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
    /** DELETE - auth: member */
    clear: `${API_PREFIX}/cart`,
  },

  order: {
    /** POST - auth: member */
    create: `${API_PREFIX}/orders`,
    /** GET - auth: member */
    list: `${API_PREFIX}/orders`,
    /** GET - auth: member */
    get: (orderId: string) => `${API_PREFIX}/orders/${orderId}`,
    /** POST - auth: member */
    cancel: (orderId: string) => `${API_PREFIX}/orders/${orderId}/cancel`,
  },

  payment: {
    /** GET - auth: member – query: txnRef */
    sepayCheck: `${API_PREFIX}/payment/sepay/check`,
  },

  leads: {
    /** POST - auth: public */
    create: `${API_PREFIX}/leads`,
  },

  coupon: {
    /** POST - auth: member – body: { code, orderAmount } */
    preview: `${API_PREFIX}/coupons/preview`,
  },

  certificate: {
    /** GET - auth: member */
    mine: `${API_PREFIX}/certificates/mine`,
    /** GET - auth: public */
    verify: (certificateNumber: string) =>
      `${API_PREFIX}/certificates/verify/${certificateNumber}`,
  },

  learnExtras: {
    /** GET/POST - auth: member */
    questions: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/questions`,
    /** POST - auth: member */
    answerQuestion: (questionId: string) =>
      `${API_PREFIX}/questions/${questionId}/answers`,
    /** PATCH - auth: member (owner/instructor) */
    resolveQuestion: (questionId: string) =>
      `${API_PREFIX}/questions/${questionId}/resolve`,
    /** DELETE - auth: member (owner/instructor) */
    deleteQuestion: (questionId: string) =>
      `${API_PREFIX}/questions/${questionId}`,
    /** GET/POST - auth: member */
    lessonNotes: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/notes`,
    /** GET - auth: member */
    courseNotes: (courseId: string) => `${API_PREFIX}/courses/${courseId}/notes`,
    /** PATCH/DELETE - auth: member (owner) */
    note: (noteId: string) => `${API_PREFIX}/notes/${noteId}`,
    /** GET/POST - auth: member */
    lessonBookmarks: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/bookmarks`,
    /** GET - auth: member */
    courseBookmarks: (courseId: string) =>
      `${API_PREFIX}/courses/${courseId}/bookmarks`,
    /** DELETE - auth: member (owner) */
    bookmark: (bookmarkId: string) => `${API_PREFIX}/bookmarks/${bookmarkId}`,
  },
} as const;
