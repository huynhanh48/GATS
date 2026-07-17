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
    verifyEmail: `${API_PREFIX}/user/verify-email`,
    /** GET – auth: public (HTML page) – query: token */
    verifyEmailLink: `${API_PREFIX}/user/verify-email`,
    /** POST – auth: member */
    logout: `${API_PREFIX}/user/logout`,
    /** GET – auth: member */
    me: `${API_PREFIX}/user/me`,
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
  },
} as const;
