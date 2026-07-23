const CoursePaths = {
  _: '/api',
  Course: {
    _: '/courses',
    List: '/',
    Create: '/',
    GetBySlug: '/slug/:slug',
    Categories: {
      List: '/categories',
      Create: '/categories',
      Update: '/categories/:categoryId',
      Delete: '/categories/:categoryId',
    },
    Get: '/:id',
    Update: '/:id',
    Delete: '/:id',
    Restore: '/:id/restore',
    Publish: '/:id/publish',
    PublishReadiness: '/:id/publish-readiness',
    Curriculum: '/:courseId/curriculum',
    Sections: {
      _: '/:courseId/sections',
      List: '/:courseId/sections',
      Create: '/:courseId/sections',
      Update: '/:courseId/sections/:sectionId',
      Delete: '/:courseId/sections/:sectionId',
      Lessons: '/:courseId/sections/:sectionId/lessons',
    },
    Lessons: {
      Update: '/:courseId/lessons/:lessonId',
      Delete: '/:courseId/lessons/:lessonId',
      Attachments: '/:courseId/lessons/:lessonId/attachments',
      AttachmentUpload: '/:courseId/lessons/:lessonId/attachments/upload',
      AttachmentDelete:
        '/:courseId/lessons/:lessonId/attachments/:attachmentId',
    },
  },
  Management: {
    _: '/course-management/courses',
    List: '/',
    Get: '/:id',
  },
} as const;

export default CoursePaths;
