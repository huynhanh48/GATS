/**
 * Admin / dashboard API paths.
 * Routes with requirePermission or admin-only CRUD.
 */

const API_PREFIX = '/api';

export const DashboardPathApi = {
  courses: {
    /** POST – auth: admin – soft-delete restore */
    restore: (id: string) => `${API_PREFIX}/courses/${id}/restore`,
    /** GET – auth: admin – query: deleted=only, page, limit – soft-deleted courses (trash) */
    trash: `${API_PREFIX}/courses?deleted=only`,
    /** DELETE – auth: admin – soft delete (sets deletedAt). Pass ?mode=hard for permanent delete */
    delete: (id: string) => `${API_PREFIX}/courses/${id}`,
    /** POST – auth: admin – body: title, type, content, ... */
    createLesson: (courseId: string, sectionId: string) =>
      `${API_PREFIX}/courses/${courseId}/sections/${sectionId}/lessons`,
    /** PATCH – auth: admin */
    updateLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}`,
    /** DELETE – auth: admin */
    deleteLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}`,
    /** GET – auth: admin – list files attached to a lesson */
    listLessonAttachments: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/attachments`,
    /** POST – auth: admin – body: { mediaId, title? } attach existing media (kind=file) */
    attachLessonMedia: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/attachments`,
    /** POST – auth: admin – multipart field: file (pdf/docx/doc/md/txt) upload + attach in one call */
    uploadLessonAttachment: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/attachments/upload`,
    /** DELETE – auth: admin – detach file from lesson (media stays in library) */
    deleteLessonAttachment: (
      courseId: string,
      lessonId: string,
      attachmentId: string,
    ) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/attachments/${attachmentId}`,
  },
  quizzes: {
    /** POST – auth: admin */
    create: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/quiz`,
    /** GET – auth: admin */
    get: (quizId: string) => `${API_PREFIX}/quizzes/${quizId}`,
    /** PATCH – auth: admin */
    update: (quizId: string) => `${API_PREFIX}/quizzes/${quizId}`,
    /** POST – auth: admin */
    addQuestion: (quizId: string) => `${API_PREFIX}/quizzes/${quizId}/questions`,
    /** PATCH – auth: admin – body: question_ids[] */
    reorderQuestions: (quizId: string) =>
      `${API_PREFIX}/quizzes/${quizId}/questions/reorder`,
    /** PATCH – auth: admin */
    updateQuestion: (questionId: string) =>
      `${API_PREFIX}/quiz-questions/${questionId}`,
    /** DELETE – auth: admin */
    deleteQuestion: (questionId: string) =>
      `${API_PREFIX}/quiz-questions/${questionId}`,
    /** PATCH – auth: admin – grade essay */
    gradeAnswer: (answerId: string) => `${API_PREFIX}/quiz-answers/${answerId}/grade`,
  },
  assignments: {
    /** POST – auth: admin */
    create: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/assignment`,
    /** PATCH – auth: admin */
    update: (assignmentId: string) => `${API_PREFIX}/assignments/${assignmentId}`,
    /** GET – auth: admin */
    listSubmissions: (assignmentId: string) =>
      `${API_PREFIX}/assignments/${assignmentId}/submissions`,
    /** PATCH – auth: admin */
    gradeSubmission: (submissionId: string) =>
      `${API_PREFIX}/assignment-submissions/${submissionId}/grade`,
  },
  videos: {
    /** GET – auth: admin – returns { data: video | null }; 404 only if course/lesson missing */
    getByLesson: (courseId: string, lessonId: string) =>
      `${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/video`,
    /** POST – auth: admin – body: courseId, lessonId, title, filename, contentType, size */
    initMultipartUpload: `${API_PREFIX}/admin/videos/init-multipart-upload`,
    /** POST – auth: admin – body: uploadId, partNumber */
    multipartPartUrl: (videoId: string) =>
      `${API_PREFIX}/admin/videos/${videoId}/multipart/part-url`,
    /** POST – auth: admin – body: uploadId, parts[{partNumber, etag}] */
    multipartComplete: (videoId: string) =>
      `${API_PREFIX}/admin/videos/${videoId}/multipart/complete`,
    /** POST – auth: admin – body: uploadId */
    multipartAbort: (videoId: string) =>
      `${API_PREFIX}/admin/videos/${videoId}/multipart/abort`,
    /** GET – dev only – HTML test page for multipart upload */
    testMultipartUploadPage: `${API_PREFIX}/admin/videos/test-multipart-upload-page`,
    /** POST – auth: admin – body: courseId, lessonId, title, filename, contentType */
    initUpload: `${API_PREFIX}/admin/videos/init-upload`,
    /** POST – auth: admin – multipart field: file */
    upload: (videoId: string) => `${API_PREFIX}/admin/videos/${videoId}/upload`,
    /** POST – auth: admin */
    completeUpload: (videoId: string) =>
      `${API_PREFIX}/admin/videos/${videoId}/complete-upload`,
    /** GET – auth: admin */
    status: (videoId: string) => `${API_PREFIX}/admin/videos/${videoId}/status`,
    /** DELETE – auth: admin – removes DB record + S3 objects (original + HLS) */
    delete: (videoId: string) => `${API_PREFIX}/admin/videos/${videoId}`,
  },
  media: {
    /** POST – auth: admin – multipart field: file (jpeg/png/webp/gif, max 10MB) */
    uploadThumbnail: `${API_PREFIX}/media/thumbnails`,
    /** POST – auth: admin – multipart field: file (pdf/docx/doc/md/txt, max 50MB) */
    uploadFile: `${API_PREFIX}/media/files`,
    /** GET – auth: admin – query: page, limit, kind */
    list: `${API_PREFIX}/media`,
    /** GET – auth: admin */
    detail: (mediaId: string) => `${API_PREFIX}/media/${mediaId}`,
    /** GET – auth: admin – returns { id, url } only */
    link: (mediaId: string) => `${API_PREFIX}/media/${mediaId}/link`,
    /** DELETE – auth: admin – removes DB record + MinIO object */
    delete: (mediaId: string) => `${API_PREFIX}/media/${mediaId}`,
  },
  categories: {
    /** GET – auth: optional – query: type=course|post (required), status? */
    list: `${API_PREFIX}/categories`,
    /** POST – auth: admin – body: name, type=course|post, slug?, description?, ... – permission: update on matching resource */
    create: `${API_PREFIX}/categories`,
    /** PATCH – auth: admin – body: partial name/slug/status/... */
    update: (categoryId: string) => `${API_PREFIX}/categories/${categoryId}`,
    /** DELETE – auth: admin – hard delete (courses/posts categoryId → null) */
    delete: (categoryId: string) => `${API_PREFIX}/categories/${categoryId}`,
  },
  posts: {
    /** GET – auth: optional – query: status, search, tag, category, page, limit, deleted (without|with|only; only/with require auth) */
    list: `${API_PREFIX}/posts`,
    /** GET – auth: admin – query: deleted=only – soft-deleted posts (trash) */
    trash: `${API_PREFIX}/posts?deleted=only`,
    /** GET – auth: optional (drafts need admin read) */
    detail: (postId: string) => `${API_PREFIX}/posts/${postId}`,
    /** GET – auth: optional */
    detailBySlug: (slug: string) => `${API_PREFIX}/posts/slug/${slug}`,
    /** POST – auth: admin – body: title, content, slug?, excerpt?, thumbnail?, visibility?, category?, tags? */
    create: `${API_PREFIX}/posts`,
    /** PATCH – auth: admin – body: partial title/content/status/... */
    update: (postId: string) => `${API_PREFIX}/posts/${postId}`,
    /** PATCH – auth: admin */
    publish: (postId: string) => `${API_PREFIX}/posts/${postId}/publish`,
    /** PATCH – auth: admin */
    unpublish: (postId: string) => `${API_PREFIX}/posts/${postId}/unpublish`,
    /** PATCH – auth: admin */
    archive: (postId: string) => `${API_PREFIX}/posts/${postId}/archive`,
    /** DELETE – auth: admin – soft by default; query mode=hard for permanent delete */
    delete: (postId: string) => `${API_PREFIX}/posts/${postId}`,
    /** POST – auth: admin – soft-delete restore */
    restore: (postId: string) => `${API_PREFIX}/posts/${postId}/restore`,
  },

  bankAccounts: {
    /** GET – auth: admin – query: activeOnly=true|false */
    list: `${API_PREFIX}/bank-accounts`,
    /** GET – auth: admin */
    detail: (bankAccountId: string) =>
      `${API_PREFIX}/bank-accounts/${bankAccountId}`,
    /** POST – auth: admin – body: label, bankName, accountNumber, accountHolder, bankCode?, bankBranch?, isDefault?, isActive? */
    create: `${API_PREFIX}/bank-accounts`,
    /** PATCH – auth: admin – body: partial fields; isDefault=true clears previous default */
    update: (bankAccountId: string) =>
      `${API_PREFIX}/bank-accounts/${bankAccountId}`,
    /** POST – auth: admin – set this account as the default for bank_transfer QR */
    setDefault: (bankAccountId: string) =>
      `${API_PREFIX}/bank-accounts/${bankAccountId}/default`,
    /** DELETE – auth: admin */
    delete: (bankAccountId: string) =>
      `${API_PREFIX}/bank-accounts/${bankAccountId}`,
  },
} as const;
